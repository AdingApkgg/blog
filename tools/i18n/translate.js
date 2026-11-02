'use strict';

// 三语博客的翻译 CLI。
//
//   node scripts/i18n/translate.js plan     # 只报告缺失 / 陈旧，不改任何文件
//   node scripts/i18n/translate.js run      # 生成或刷新译文
//   node scripts/i18n/translate.js status   # 覆盖率汇总
//
// 设计要点（详见 ./README.md）：
// - 译文是入库的文件，不在构建时调 API；构建必须确定性、可离线。
// - 正文经「占位符保护」后翻译，代码块 / 链接 / 外挂标签原样保留。
// - source_hash 记录中文正文指纹，中文一改译文即标记为陈旧。
// - 默认不覆盖 reviewed: true 的译文（人工校对的成果优先）。

const fs = require('fs');
const path = require('path');
const YAML = require('yamljs');

const langs = require('./lib/langs');
const fm = require('./lib/frontmatter');
const chunker = require('./lib/chunk');
const posts = require('./lib/posts');
const llm = require('./lib/llm');
const taxonomy = require('./lib/taxonomy');

// ---------------------------------------------------------------- 参数解析

function parseArgs(argv) {
  const args = { _: [] };
  for (let i = 0; i < argv.length; i++) {
    const token = argv[i];
    if (token.startsWith('--')) {
      const eq = token.indexOf('=');
      if (eq > -1) {
        args[token.slice(2, eq)] = token.slice(eq + 1);
      } else {
        const key = token.slice(2);
        const next = argv[i + 1];
        if (next !== undefined && !next.startsWith('--')) {
          args[key] = next;
          i++;
        } else {
          args[key] = true;
        }
      }
    } else {
      args._.push(token);
    }
  }
  return args;
}

function parseIntOr(value, fallback) {
  const n = Number.parseInt(value, 10);
  return Number.isFinite(n) && n > 0 ? n : fallback;
}

// ---------------------------------------------------------------- 配置读取

// 通用配置（endpoint / key / model / 并发 / 超时）在 lib/llm.js，
// 这里只补翻译专有的分块阈值。
function loadConfig(args) {
  const cfg = llm.loadConfig(args);
  const base = YAML.load(path.join(posts.ROOT, '_config.yml')) || {};
  const localPath = path.join(posts.ROOT, '_config.local.yml');
  const local = fs.existsSync(localPath) ? YAML.load(localPath) || {} : {};
  const i18n = Object.assign({}, base.i18n || {}, local.i18n || {});
  cfg.chunkChars = parseIntOr(args['chunk-chars'], parseIntOr(i18n.chunk_chars, chunker.DEFAULT_CHUNK_CHARS));
  cfg.maxSourceChars = parseIntOr(args['max-source-chars'], parseIntOr(i18n.max_source_chars, 0));
  return cfg;
}

// 术语表：source/_data/glossary.yml，按语言分组。文件不存在就是空表。
function loadGlossary() {
  const file = path.join(posts.ROOT, 'source', '_data', 'glossary.yml');
  if (!fs.existsSync(file)) return {};
  try {
    return YAML.load(file) || {};
  } catch (err) {
    console.warn(`[warn] 术语表解析失败，已忽略：${err.message}`);
    return {};
  }
}

function glossaryFor(glossary, lang) {
  const entries = glossary[lang];
  if (!entries || typeof entries !== 'object') return '';
  const lines = Object.keys(entries).map((term) => `- ${term} → ${entries[term]}`);
  if (!lines.length) return '';
  return `\nTERMINOLOGY (use these exact renderings):\n${lines.join('\n')}\n`;
}

// ---------------------------------------------------------------- LLM 调用

// chat / sleep 已抽到 lib/llm.js，与 taxonomy.js 共用同一份超时与重试逻辑。
const chat = llm.chat;

// ---------------------------------------------------------------- 提示词

function bodySystemPrompt(lang, glossaryText) {
  const target = langs.label(lang);
  return [
    `You are a professional translator for a personal technical blog. Translate the user's Markdown from Chinese into ${target}.`,
    '',
    'HARD RULES:',
    `- Output ONLY the ${target} translation. No preamble, no explanation, no surrounding code fence.`,
    '- Preserve the Markdown structure EXACTLY: headings, lists, tables, blockquotes, emphasis, horizontal rules.',
    '- Tokens of the form @@T001@@ are opaque placeholders standing for code blocks, links, images and shortcodes. Copy every placeholder EXACTLY as-is, in the same relative position. Never translate, rename, reorder, duplicate, or drop one.',
    '- Do NOT translate: placeholders, product names, URLs, file paths, shell commands, code identifiers.',
    '- Keep the original paragraph structure and blank lines.',
    `- Write natural, idiomatic ${target}. Do not mirror Chinese word order or leave Chinese function words behind.`,
    '- Keep footnote-style and tag-plugin syntax untouched.',
    glossaryText
  ].join('\n');
}

function metaSystemPrompt(lang) {
  const target = langs.label(lang);
  return [
    `Translate the Chinese blog post metadata into ${target}.`,
    'Return STRICT JSON only, with exactly these keys: title, description, keywords.',
    'keywords keeps the same comma-separated single-line format as the input.',
    'Do not add commentary, do not wrap the JSON in a code fence.',
    'Keep product names untranslated.'
  ].join('\n');
}

function stripCodeFence(text) {
  const trimmed = String(text).trim();
  const fence = trimmed.match(/^```(?:json)?\s*\n([\s\S]*?)\n```$/);
  return fence ? fence[1].trim() : trimmed;
}

function parseMetaJson(text, fallback) {
  try {
    const parsed = JSON.parse(stripCodeFence(text));
    return {
      title: typeof parsed.title === 'string' && parsed.title.trim() ? parsed.title.trim() : fallback.title,
      description: typeof parsed.description === 'string' ? parsed.description.trim() : fallback.description,
      keywords: typeof parsed.keywords === 'string' ? parsed.keywords.trim() : fallback.keywords
    };
  } catch (err) {
    return null;
  }
}

// ---------------------------------------------------------------- 单篇翻译

async function translateMeta(cfg, source, lang, glossary) {
  const fallback = {
    title: source.data.title || '',
    description: source.data.description || '',
    keywords: source.data.keywords || ''
  };

  const payload = {
    title: fallback.title,
    description: fallback.description,
    keywords: fallback.keywords
  };

  const text = await chat(cfg, [
    { role: 'system', content: metaSystemPrompt(lang) + glossaryFor(glossary, lang) },
    { role: 'user', content: JSON.stringify(payload, null, 2) }
  ]);

  const parsed = parseMetaJson(text, fallback);
  if (parsed) return parsed;

  // 模型没给出合法 JSON：退回逐字段翻译，保证元信息仍是译文。
  const title = await chat(cfg, [
    { role: 'system', content: `Translate the following blog post title from Chinese into ${langs.label(lang)}. Output only the translation.` },
    { role: 'user', content: fallback.title }
  ]);
  return { title: title.trim(), description: fallback.description, keywords: fallback.keywords };
}

async function translateBody(cfg, source, lang, glossary) {
  const { masked, store } = chunker.mask(source.content);
  const chunks = chunker.split(masked, cfg.chunkChars);
  const system = bodySystemPrompt(lang, glossaryFor(glossary, lang)) + `\n\nPOST TITLE (context only, do not repeat): ${source.data.title || ''}`;

  const out = [];
  for (let i = 0; i < chunks.length; i++) {
    const part = chunks[i];
    // 纯占位符块（例如整块就是一个代码块）没有可翻译文本，直接透传，
    // 免得模型「翻」出一个被改动过的占位符。
    if (!part.replace(/@@T\d+@@/g, '').trim()) {
      out.push(part);
      continue;
    }
    const hint = chunks.length > 1 ? `\n(This is part ${i + 1} of ${chunks.length} of the same post.)` : '';
    const translated = await chat(cfg, [
      { role: 'system', content: system },
      { role: 'user', content: part + hint }
    ]);
    out.push(translated);
  }

  // 块之间默认补空行；但被切开的表格相邻两块之间不能再插空行，
  // 否则 Markdown 会在空行处把一张表断成两张。
  let joined = '';
  for (let i = 0; i < out.length; i++) {
    if (i === 0) {
      joined = out[i];
      continue;
    }
    const tight = /\|\s*$/.test(out[i - 1]) && /^\s*\|/.test(out[i]);
    joined += (tight ? '\n' : '\n\n') + out[i];
  }

  return chunker.unmask(joined, store);
}

// 由本脚本接管、不从中文源照抄的字段。
const HANDLED_KEYS = [
  'title',
  'description',
  'keywords',
  'abbrlink',
  'permalink',
  'lang',
  'translation_of',
  'source_hash',
  'translator',
  'reviewed'
];

// 译文 front-matter 的字段顺序固定，保证每次输出稳定、diff 干净。
// 返回 { data, missing }；missing 记录没有译名、只能用中文兜底的分类/标签。
function buildFrontMatter(entry, lang, meta, table) {
  const src = entry.zh;
  const abbrlink = src.data.abbrlink;
  const out = {};
  const missing = { categories: [], tags: [] };

  out.title = meta.title;
  if (meta.description) out.description = meta.description;
  if (meta.keywords) out.keywords = meta.keywords;

  // 路由与溯源字段
  out.abbrlink = abbrlink;
  out.permalink = `${langs.dirOf(lang)}/p/${abbrlink}/`;
  out.lang = lang;
  out.translation_of = src.rel;
  out.source_hash = src.hash;
  out.translator = 'ai';
  out.reviewed = false;

  // 分类与标签查表本地化：译名在 taxonomy.yml 里一次定死，
  // 不逐篇交给模型自由发挥，否则同一个分类会碎成好几个页面。
  const catNames = taxonomy.toArray(src.data.categories);
  if (catNames.length) {
    const res = taxonomy.localize(table, 'categories', catNames, lang);
    out.categories = res.names;
    missing.categories = res.fallback;
  }

  const tagNames = taxonomy.toArray(src.data.tags);
  if (tagNames.length) {
    const res = taxonomy.localize(table, 'tags', tagNames, lang);
    out.tags = res.names;
    missing.tags = res.fallback;
  }

  // 中文源里其余字段原样保留（date / updated / password / cover ...）
  for (const key of Object.keys(src.data)) {
    if (HANDLED_KEYS.includes(key)) continue;
    if (key === 'categories' || key === 'tags') continue;
    out[key] = src.data[key];
  }

  return { data: out, missing };
}

function targetFileFor(entry, lang) {
  const dir = path.join(posts.POSTS_DIR, langs.dirOf(lang));
  return path.join(dir, path.basename(entry.zh.file));
}

async function translateOne(cfg, entry, lang, glossary, options) {
  const existing = entry[lang];
  const meta = await translateMeta(cfg, entry.zh, lang, glossary);
  const body = await translateBody(cfg, entry.zh, lang, glossary);

  // 结构校验：正文必须非空，且不能短到像被截断。
  if (!body.trim()) {
    throw new Error('译文正文为空');
  }
  const ratio = body.length / Math.max(entry.zh.content.length, 1);
  if (ratio < 0.3) {
    throw new Error(`译文长度异常（原文 ${entry.zh.content.length} 字符，译文 ${body.length} 字符）`);
  }

  // 保留人工校对标记：默认不把 reviewed: true 打回 false。
  const wasReviewed = existing && existing.data.reviewed === true;
  const built = buildFrontMatter(entry, lang, meta, options.taxonomy);
  const data = built.data;
  if (wasReviewed && !options.force) {
    data.reviewed = true;
    data.translator = existing.data.translator || 'ai';
  }

  const file = targetFileFor(entry, lang);
  fs.mkdirSync(path.dirname(file), { recursive: true });

  if (!options.write) return { file, data, body, missing: built.missing };

  // 写之前复核源文件没被并发改动。
  const fresh = fm.read(entry.zh.file);
  if (fm.hashContent(fresh.content) !== entry.zh.hash) {
    throw new Error('翻译期间中文源发生变化，本次结果作废，请重跑');
  }

  fm.write(file, data, body);
  return { file, data, body, missing: built.missing };
}

// ---------------------------------------------------------------- 任务编排

function selectEntries(index, options) {
  let entries = [...index.values()].filter((entry) => entry.zh);

  if (options.only && options.only.length) {
    const wanted = new Set(options.only.map((v) => String(v)));
    entries = entries.filter((entry) => wanted.has(entry.key));
  }

  // 全文转载的长篇小说（三体三部曲）正文体量是普通文章的百倍，逐块翻译会把 API
  // 调用数推到四位数；而且这类受版权保护的作品本就不适合整篇搬运到别的语言。
  // 超阈值的一律跳过，并在 plan / run 里逐篇列出，绝不静默丢文章。
  // 用 --only 点名时不受限制（用户显式要求就照做）。
  options.skipped = [];
  const maxChars = options.maxSourceChars || 0;
  if (maxChars && !(options.only && options.only.length)) {
    const kept = [];
    for (const entry of entries) {
      const len = entry.zh.content ? entry.zh.content.length : 0;
      if (len > maxChars) options.skipped.push({ entry, len });
      else kept.push(entry);
    }
    entries = kept;
  }

  // 状态过滤只由 workItems 负责，避免两处逻辑不同步（曾经导致 --force 失效）。
  entries.sort((a, b) => String(a.key).localeCompare(String(b.key), 'en', { numeric: true }));

  if (options.limit) entries = entries.slice(0, options.limit);
  return entries;
}

function workItems(entries, options) {
  const items = [];
  for (const entry of entries) {
    for (const lang of options.targets) {
      const state = posts.stateOf(entry, lang);
      if (state === 'ok' && !options.all && !options.force) continue;
      if (state === 'stale' && entry[lang] && entry[lang].data.reviewed === true && !options.force) {
        continue;
      }
      items.push({ entry, lang, state });
    }
  }
  return items;
}

async function runPool(items, concurrency, worker) {
  const results = [];
  let cursor = 0;

  async function next() {
    while (cursor < items.length) {
      const item = items[cursor++];
      try {
        const value = await worker(item);
        results.push({ item, ok: true, value });
      } catch (err) {
        results.push({ item, ok: false, error: err });
      }
    }
  }

  await Promise.all(Array.from({ length: Math.min(concurrency, items.length) }, next));
  return results;
}

// ---------------------------------------------------------------- 命令

// 被长度阈值拦下的文章统一在这里亮相，免得事后问「怎么少了几篇」。
function reportSkipped(options) {
  const skipped = options.skipped || [];
  if (!skipped.length) return;
  console.log(`跳过 ${skipped.length} 篇超长文章（正文 > ${options.maxSourceChars} 字符）：`);
  for (const { entry, len } of skipped) {
    console.log(`  ${entry.key}  ${String(len).padStart(7)} 字符  ${entry.zh.data.title || ''}`);
  }
  console.log('  不生成译文；确需翻译可显式点名：--only <abbrlink> --max-source-chars 0\n');
}

function commandPlan(index, options) {
  const entries = selectEntries(index, options);
  const stats = posts.summarize(index, options.targets);

  console.log(`\n扫描 ${index.size} 个 abbrlink（来源：source/_posts）`);
  for (const lang of options.targets) {
    const s = stats[lang];
    console.log(`  ${lang}: ok ${s.ok} | stale ${s.stale} | 缺失 ${s.missing}${s['no-source'] ? ` | 无中文源 ${s['no-source']}` : ''}`);
  }

  reportSkipped(options);

  const items = workItems(entries, options);
  if (!items.length) {
    console.log('\n没有需要处理的文章，全部是最新状态。\n');
    return 0;
  }

  console.log(`\n待处理 ${items.length} 项（--all 可包含已是最新的）：`);
  for (const { entry, lang, state } of items.slice(0, 40)) {
    console.log(`  [${state}] ${lang}  ${entry.key}  ${entry.zh.data.title || ''}`);
  }
  if (items.length > 40) console.log(`  ... 其余 ${items.length - 40} 项`);
  console.log('');
  return 0;
}

function commandStatus(index, options) {
  const total = [...index.values()].filter((entry) => entry.zh).length;
  console.log(`\n中文源文章：${total} 篇\n`);

  const header = ['语言', '已翻译', '陈旧', '缺失', '覆盖率'];
  console.log(header.join('\t'));
  for (const lang of options.targets) {
    const counts = { ok: 0, stale: 0, missing: 0, 'no-source': 0 };
    for (const entry of index.values()) {
      if (!entry.zh) continue;
      const state = posts.stateOf(entry, lang);
      counts[state] = (counts[state] || 0) + 1;
    }
    const done = counts.ok + counts.stale;
    const pct = total ? Math.round((done / total) * 100) : 0;
    console.log([lang, done, counts.stale, counts.missing, `${pct}%`].join('\t'));
  }
  console.log('');

  const orphans = [...index.values()].filter((entry) => !entry.zh);
  if (orphans.length) {
    console.log(`警告：${orphans.length} 个译文找不到中文源（source/_posts 下可能已删文）：`);
    for (const entry of orphans.slice(0, 10)) {
      const which = ['ja', 'en'].filter((l) => entry[l]).join(',');
      console.log(`  ${entry.key} [${which}]`);
    }
    console.log('');
  }
  return 0;
}

async function commandRun(index, options, cfg) {
  if (!cfg.apiKey) {
    console.error('缺少 API key：请在 _config.local.yml 配置 i18n.api_key（或沿用 llm_tagging.api_key）。');
    return 2;
  }
  if (!cfg.model) {
    console.error('缺少模型名：请在 _config.yml 的 i18n.model 指定，或用 --model 传入。');
    return 2;
  }

  const entries = selectEntries(index, options);
  const items = workItems(entries, options);

  console.log(`\n模型：${cfg.model}  endpoint：${cfg.endpoint}`);
  console.log(`待翻译 ${items.length} 项（并发 ${cfg.concurrency}，块大小 ${cfg.chunkChars} 字符）`);
  reportSkipped(options);
  if (options['dry-run']) {
    for (const { entry, lang, state } of items) {
      console.log(`  would translate [${state}] ${lang} ${entry.key} → ${targetFileFor(entry, lang)}`);
    }
    console.log('\n--dry-run：未调用 API，未写入任何文件。\n');
    return 0;
  }

  const glossary = loadGlossary();
  // 分类/标签译名表：命中就换成目标语言，命中不了用中文兜底并汇总报警。
  options.taxonomy = taxonomy.load();
  const started = Date.now();
  let done = 0;

  const results = await runPool(items, cfg.concurrency, async ({ entry, lang }) => {
    const value = await translateOne(cfg, entry, lang, glossary, options);
    done++;
    console.log(`  [${done}/${items.length}] ${lang} ${entry.key} → ${path.relative(posts.ROOT, value.file)}`);
    return value;
  });

  const failed = results.filter((r) => !r.ok);
  const elapsed = Math.round((Date.now() - started) / 1000);

  console.log(`\n完成：成功 ${results.length - failed.length}，失败 ${failed.length}，用时 ${elapsed}s`);

  // 分类/标签缺译名会让页面显示中文，这里统一汇总，避免逐篇去翻日志。
  const gaps = new Map();
  for (const r of results) {
    if (!r.ok || !r.value || !r.value.missing) continue;
    for (const kind of ['categories', 'tags']) {
      for (const name of r.value.missing[kind] || []) {
        gaps.set(`${kind}: ${name}`, (gaps.get(`${kind}: ${name}`) || 0) + 1);
      }
    }
  }
  if (gaps.size) {
    console.log(`\n注意：${gaps.size} 个分类/标签没有译名，本次暂用中文填入。`);
    console.log('  运行 `node scripts/i18n/taxonomy.js draft` 补译名，再重跑这些文章。');
    for (const [key, count] of gaps) console.log(`  ${key}（${count} 篇）`);
  }

  if (failed.length) {
    console.log('\n失败明细：');
    for (const r of failed) {
      console.log(`  ${r.item.lang} ${r.item.entry.key}: ${r.error.message}`);
    }
    console.log('\n失败项未写入文件，可直接重跑（已成功的会被跳过）。\n');
    return 1;
  }
  console.log('');
  return 0;
}

// ---------------------------------------------------------------- 入口

async function main() {
  const argv = process.argv.slice(2);
  const args = parseArgs(argv);
  const command = args._[0] || 'plan';

  const options = {
    targets: (() => {
      const raw = args.lang ? String(args.lang).split(',') : langs.TARGET_LANGS;
      return raw.map((v) => langs.normalize(v.trim())).filter((v) => langs.isTargetLang(v));
    })(),
    only: args.only ? String(args.only).split(',').map((v) => v.trim()).filter(Boolean) : [],
    limit: args.limit ? parseIntOr(args.limit, 0) : 0,
    force: Boolean(args.force),
    all: Boolean(args.all),
    // 注意：dry-run 必须同时体现在这里和 write 上，否则会边「预览」边真的调 API。
    'dry-run': Boolean(args['dry-run']),
    write: !Boolean(args['dry-run'])
  };

  if (!options.targets.length) {
    console.error('没有有效的目标语言，--lang 只接受 ja / en。');
    return 2;
  }

  const index = posts.build();
  const cfg = loadConfig(args);
  options.maxSourceChars = cfg.maxSourceChars;

  if (command === 'plan') return commandPlan(index, options);
  if (command === 'status') return commandStatus(index, options);
  if (command === 'run') return commandRun(index, options, cfg);

  console.error(`未知命令：${command}（可用：plan / run / status）`);
  return 2;
}

main()
  .then((code) => {
    process.exitCode = code || 0;
  })
  .catch((err) => {
    console.error(`\n执行失败：${err && err.stack ? err.stack : err}\n`);
    process.exitCode = 1;
  });
