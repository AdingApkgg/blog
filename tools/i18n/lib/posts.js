'use strict';

// 扫描 source/_posts，建立「一个 abbrlink = 一组三语文件」的索引。
//
// 中文源：source/_posts/<name>.md
// 日文译：source/_posts/ja/<name>.md
// 英文译：source/_posts/en/<name>.md

const fs = require('fs');
const path = require('path');
const fm = require('./frontmatter');
const langs = require('./langs');

const ROOT = path.resolve(__dirname, '..', '..', '..');
const POSTS_DIR = path.join(ROOT, 'source', '_posts');

// hexo 配置里 post_asset_folder: true，同名目录是附件文件夹，不是文章。
function listMarkdown(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir, { withFileTypes: true })
    .filter((entry) => entry.isFile() && /\.md$/i.test(entry.name))
    .map((entry) => path.join(dir, entry.name))
    .sort();
}

function rel(file) {
  return path.relative(path.join(ROOT, 'source'), file).split(path.sep).join('/');
}

// 读取单个文章文件，附带它在 source/ 下的相对路径与正文哈希。
function readPost(file) {
  const { data, content } = fm.read(file);
  return {
    file,
    rel: rel(file),
    data,
    content,
    hash: fm.hashContent(content)
  };
}

// 没有 abbrlink 时用文件名兜底，保证索引不丢文章（正常情况 92 篇都有 abbrlink）。
function keyOf(post, kind) {
  const explicit = post.data.abbrlink;
  if (explicit !== undefined && explicit !== null && String(explicit).trim() !== '') {
    return String(explicit).trim();
  }
  const base = path.basename(post.file).replace(/\.md$/i, '');
  return `file:${kind}:${base}`;
}

// 建立索引：Map<key, { key, zh, ja, en }>
function build() {
  const index = new Map();

  const groups = [
    { kind: langs.DEFAULT_LANG, dir: POSTS_DIR },
    { kind: 'ja', dir: path.join(POSTS_DIR, 'ja') },
    { kind: 'en', dir: path.join(POSTS_DIR, 'en') }
  ];

  for (const group of groups) {
    for (const file of listMarkdown(group.dir)) {
      const post = readPost(file);
      const key = keyOf(post, group.kind);
      if (!index.has(key)) {
        index.set(key, { key, zh: null, ja: null, en: null });
      }
      const entry = index.get(key);
      entry[group.kind] = post;
    }
  }

  return index;
}

// 判断一条索引记录的状态：
//   missing  — 该语言还没有译文
//   stale    — 有译文但中文正文已改动（source_hash 不匹配）
//   no-source— 只有译文、缺中文源（异常，需人工看）
//   ok       — 译文与当前中文源一致
function stateOf(entry, lang) {
  const source = entry.zh;
  const target = entry[lang];
  if (!target) return 'missing';
  if (!source) return 'no-source';
  const recorded = target.data.source_hash;
  if (!recorded) return 'stale';
  return String(recorded) === source.hash ? 'ok' : 'stale';
}

// 汇总统计，供 plan / status 使用。
function summarize(index, targetLangs = langs.TARGET_LANGS) {
  const stats = {};
  for (const lang of targetLangs) {
    const counts = { ok: 0, stale: 0, missing: 0, 'no-source': 0 };
    for (const entry of index.values()) {
      const state = stateOf(entry, lang);
      counts[state] = (counts[state] || 0) + 1;
    }
    stats[lang] = counts;
  }
  return stats;
}

module.exports = {
  ROOT,
  POSTS_DIR,
  build,
  stateOf,
  summarize,
  readPost,
  rel
};
