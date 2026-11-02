'use strict';

// 分类 / 标签三语对照表的维护命令。
//
//   node scripts/i18n/taxonomy.js draft      # 扫描中文源，为缺失译名生成草案
//   node scripts/i18n/taxonomy.js check      # 只报告缺失，不调 API、不改文件
//
// 译名一旦生成就写进 source/_data/taxonomy.yml 并入库，成为固定映射。
// 之后每篇翻译只做查表替换，保证同一分类在不同文章里译名一致。
// 人工可以随时编辑该文件，draft 不会覆盖已有译名（除非 --force）。

const fs = require('fs');
const path = require('path');

const posts = require('./lib/posts');
const taxonomy = require('./lib/taxonomy');
const langs = require('./lib/langs');
const llm = require('./lib/llm');

const BATCH_SIZE = 30;

function parseArgs(argv) {
  const args = { _: [] };
  for (let i = 0; i < argv.length; i++) {
    const token = argv[i];
    if (token.startsWith('--')) {
      const eq = token.indexOf('=');
      if (eq > -1) args[token.slice(2, eq)] = token.slice(eq + 1);
      else {
        const key = token.slice(2);
        const next = argv[i + 1];
        if (next !== undefined && !next.startsWith('--')) { args[key] = next; i++; }
        else args[key] = true;
      }
    } else args._.push(token);
  }
  return args;
}

// YAML 值统一用双引号包裹，避免中文名里的 : # 等字符破坏结构。
function yamlValue(value) {
  return JSON.stringify(String(value === undefined || value === null ? '' : value));
}

function render(table) {
  const lines = [
    '# 分类与标签的三语对照表',
    '#',
    '# 由 `node scripts/i18n/taxonomy.js draft` 生成草案，之后可以人工修改；',
    '# draft 默认不会覆盖这里已有的译名。',
    '#',
    '# categories / tags 下的键是中文原名（source/_posts 里 front-matter 用的写法），',
    '# 值是各语言的固定译名。翻译文章时按此表替换，保证同一分类在三语里始终同名。',
    '#',
    '# 中文分类页的 URL 段沿用中文名（与改动前一致，不破坏已有链接）；',
    '# 日英分类页用各自译名生成 URL 段。若想给某个分类指定干净的 URL，可加 slug: xxx。',
    ''
  ];

  for (const kind of ['categories', 'tags']) {
    lines.push(`${kind}:`);
    const group = table[kind] || {};
    const names = Object.keys(group);
    if (!names.length) {
      lines.push('  {}');
      lines.push('');
      continue;
    }
    for (const name of names) {
      const entry = group[name] || {};
      lines.push(`  ${yamlValue(name)}:`);
      for (const lang of langs.TARGET_LANGS) {
        lines.push(`    ${lang}: ${yamlValue(entry[lang] || '')}`);
      }
      if (entry.slug) lines.push(`    slug: ${yamlValue(entry.slug)}`);
      if (entry.note) lines.push(`    note: ${yamlValue(entry.note)}`);
    }
    lines.push('');
  }

  return lines.join('\n');
}

// 让模型把一批术语翻成目标语言，返回 { 中文原名: 译名 }。
async function translateBatch(cfg, kind, names, lang) {
  const label = kind === 'categories' ? 'blog category' : 'blog tag';
  const system = [
    `Translate the following Chinese ${label} names into ${langs.label(lang)}.`,
    'These are taxonomy labels used on a personal tech blog: keep them short and idiomatic.',
    'Return STRICT JSON only: a flat object mapping each original Chinese term to its translation.',
    'Preserve the exact original terms as keys. Do not add commentary or code fences.',
    'If a term is a proper noun that is normally kept as-is in the target language, return it unchanged.'
  ].join('\n');

  const text = await llm.chat(cfg, [
    { role: 'system', content: system },
    { role: 'user', content: JSON.stringify(names) }
  ]);

  const parsed = llm.parseJsonLoose(text);
  if (!parsed || typeof parsed !== 'object') {
    throw new Error(`模型未返回合法 JSON（${kind}/${lang}）`);
  }
  return parsed;
}

function chunksOf(list, size) {
  const out = [];
  for (let i = 0; i < list.length; i += size) out.push(list.slice(i, i + size));
  return out;
}

async function commandCheck(index, targetLangs) {
  const entries = [...index.values()].filter((e) => e.zh);
  const inv = taxonomy.inventory(entries);
  const table = taxonomy.load();

  console.log(`\n中文源里共 ${inv.categories.length} 个分类、${inv.tags.length} 个标签`);
  console.log(`对照表：${path.relative(llm.ROOT, taxonomy.FILE)}`);

  let gaps = 0;
  for (const kind of ['categories', 'tags']) {
    for (const lang of targetLangs) {
      const miss = inv[kind].filter((item) => !taxonomy.lookup(table, kind, item.name, lang));
      if (!miss.length) continue;
      gaps += miss.length;
      console.log(`\n${kind} / ${lang} 缺译名 ${miss.length} 个：`);
      console.log('  ' + miss.slice(0, 30).map((m) => `${m.name}(${m.count})`).join(', '));
      if (miss.length > 30) console.log(`  ... 其余 ${miss.length - 30} 个`);
    }
  }

  if (!gaps) console.log('\n所有分类与标签都有译名。\n');
  else console.log(`\n共缺 ${gaps} 条。运行 \`node scripts/i18n/taxonomy.js draft\` 生成草案。\n`);

  return 0;
}

async function commandDraft(index, targetLangs, cfg, force) {
  const entries = [...index.values()].filter((e) => e.zh);
  const inv = taxonomy.inventory(entries);
  const table = taxonomy.load();

  if (!cfg.apiKey || !cfg.model) {
    console.error('缺少 API key 或模型名，无法生成草案。');
    return 2;
  }

  // 先把中文原名登记进表（保持已有译名）
  let added = 0;
  for (const kind of ['categories', 'tags']) {
    if (!table[kind]) table[kind] = {};
    for (const item of inv[kind]) {
      if (!table[kind][item.name]) {
        table[kind][item.name] = {};
        added++;
      }
    }
  }

  console.log(`\n模型：${cfg.model}`);
  console.log(`登记术语 ${added} 个新条目，翻译表内共 ${Object.keys(table.categories).length} 分类 + ${Object.keys(table.tags).length} 标签\n`);

  let translated = 0;
  let failed = 0;

  for (const kind of ['categories', 'tags']) {
    for (const lang of targetLangs) {
      const pending = Object.keys(table[kind]).filter((name) => {
        if (force) return true;
        const value = table[kind][name][lang];
        return value === undefined || value === null || value === '';
      });
      if (!pending.length) continue;

      console.log(`  ${kind}/${lang}: 待翻译 ${pending.length} 个`);
      for (const batch of chunksOf(pending, BATCH_SIZE)) {
        try {
          const result = await translateBatch(cfg, kind, batch, lang);
          for (const name of batch) {
            const value = result[name];
            if (typeof value === 'string' && value.trim()) {
              table[kind][name][lang] = value.trim();
              translated++;
            } else {
              failed++;
            }
          }
        } catch (err) {
          failed += batch.length;
          console.warn(`    [warn] ${kind}/${lang} 一批失败：${err.message}`);
        }
      }
    }
  }

  fs.mkdirSync(path.dirname(taxonomy.FILE), { recursive: true });
  fs.writeFileSync(taxonomy.FILE, render(table), 'utf8');

  console.log(`\n写入 ${path.relative(llm.ROOT, taxonomy.FILE)}`);
  console.log(`新翻译 ${translated} 条，失败/缺失 ${failed} 条`);
  console.log('请人工过一遍这个文件 —— 它是分类页/标签页的最终展示文字。\n');
  return failed ? 1 : 0;
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const command = args._[0] || 'check';

  const targetLangs = (() => {
    const raw = args.lang ? String(args.lang).split(',') : langs.TARGET_LANGS;
    return raw.map((v) => langs.normalize(v.trim())).filter((v) => langs.isTargetLang(v));
  })();

  const index = posts.build();

  if (command === 'check') return commandCheck(index, targetLangs);
  if (command === 'draft') return commandDraft(index, targetLangs, llm.loadConfig(args), Boolean(args.force));

  console.error(`未知命令：${command}（可用：check / draft）`);
  return 2;
}

main()
  .then((code) => { process.exitCode = code || 0; })
  .catch((err) => {
    console.error(`\n执行失败：${err && err.stack ? err.stack : err}\n`);
    process.exitCode = 1;
  });
