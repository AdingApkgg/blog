'use strict';

// 分类与标签的三语对照。
//
// 为什么用「固定映射表」而不是让 AI 逐篇翻：
// 分类/标签是跨文章的共享维度。同一篇文章里的「技术开发」和另一篇里的「技术开发」
// 必须落到同一个译名，否则一个分类会被拆成好几个页面，标签云彻底碎片化。
// 所以译名在这里一次性定死，翻译时只做查表替换。
//
// 表文件：source/_data/taxonomy.yml
//   categories:
//     技术开发:
//       ja: 技術開発
//       en: Web Development
//       slug: tech          # 可选；不给就用译名自动生成 URL 段
//   tags:
//     原神:
//       ja: 原神
//       en: Genshin Impact

const fs = require('fs');
const path = require('path');
const YAML = require('yamljs');

const langs = require('./langs');

const ROOT = path.resolve(__dirname, '..', '..', '..');
const FILE = path.join(ROOT, 'source', '_data', 'taxonomy.yml');

// front-matter 里的分类/标签可能是字符串，也可能是 {name, slug} 对象，统一取名字。
function nameOf(item) {
  if (item === null || item === undefined) return null;
  if (typeof item === 'object') {
    const value = item.name !== undefined ? item.name : item.slug;
    return value === undefined || value === null ? null : String(value);
  }
  return String(item);
}

function toArray(value) {
  return [].concat(value || []).flat(Infinity).map(nameOf).filter(Boolean);
}

function load() {
  if (!fs.existsSync(FILE)) return { categories: {}, tags: {} };
  let parsed;
  try {
    parsed = YAML.load(FILE) || {};
  } catch (err) {
    throw new Error(`taxonomy.yml 解析失败：${err.message}`);
  }
  return {
    categories: parsed.categories && typeof parsed.categories === 'object' ? parsed.categories : {},
    tags: parsed.tags && typeof parsed.tags === 'object' ? parsed.tags : {}
  };
}

// 查一个名字在目标语言下的译名。查不到返回 null（调用方决定怎么兜底）。
function lookup(table, kind, name, lang) {
  const group = table[kind];
  if (!group) return null;
  const entry = group[name];
  if (!entry) return null;
  if (typeof entry === 'string') {
    // 简写形式：技术开发: 技術開発（只对 ja 有意义）
    return lang === 'ja' ? entry : null;
  }
  const value = entry[lang];
  return value === undefined || value === null ? null : String(value);
}

// 找出表里所有缺失某个语言译名的条目，供 plan/run 报警。
function missing(table, kind, lang) {
  const group = table[kind] || {};
  return Object.keys(group).filter((name) => !lookup(table, kind, name, lang));
}

// 译名 → 中文原名；名字本来就是中文 key 时原样返回。
//
// 为什么需要：译文的 front-matter 里写的是**译名**，Hexo 因此把「技術開発」
// 当成另一个独立分类，同一个分类在模型里出现三份。生成分类页时若直接把模型
// 名字当中文名去查表，查不到、退回中文，三语版本就变成三个互不相认的 term，
// 对称 hreflang 也一并断掉。所以拿到任何名字都先归一化回中文 key。
function resolve(table, kind, name) {
  const group = table[kind] || {};
  if (Object.prototype.hasOwnProperty.call(group, name)) return name;

  for (const key of Object.keys(group)) {
    const entry = group[key];
    if (!entry || typeof entry !== 'object') continue;
    if (entry.ja === name || entry.en === name) return key;
  }
  return name;
}

// 把一组中文分类/标签译成目标语言；缺译名时保留中文并记录。
// 返回 { names, fallback } —— fallback 是没查到译名、只能用中文兜底的名字。
function localize(table, kind, names, lang) {
  const out = [];
  const fallback = [];
  for (const name of names) {
    const translated = lookup(table, kind, name, lang);
    if (translated) {
      out.push(translated);
    } else {
      out.push(name);
      fallback.push(name);
    }
  }
  return { names: out, fallback };
}

// 收集中文源里实际用到的全部分类/标签（含出现篇数），供 draft 命令使用。
function inventory(entries) {
  const categories = new Map();
  const tags = new Map();

  for (const entry of entries) {
    if (!entry.zh) continue;
    for (const name of toArray(entry.zh.data.categories)) {
      categories.set(name, (categories.get(name) || 0) + 1);
    }
    for (const name of toArray(entry.zh.data.tags)) {
      tags.set(name, (tags.get(name) || 0) + 1);
    }
  }

  const byCount = (map) =>
    [...map.entries()]
      .sort((a, b) => b[1] - a[1] || String(a[0]).localeCompare(String(b[0])))
      .map(([name, count]) => ({ name, count }));

  return { categories: byCount(categories), tags: byCount(tags) };
}

module.exports = {
  FILE,
  load,
  lookup,
  resolve,
  missing,
  localize,
  inventory,
  nameOf,
  toArray,
  langs
};
