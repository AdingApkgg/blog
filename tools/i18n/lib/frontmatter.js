'use strict';

// front-matter 读写。直接复用 hexo-front-matter，保证与 Hexo 自身及仓库里
// 已有的 scripts/keywords.js、scripts/llms-txt.js 行为一致。
//
// 注意：hexo-front-matter.stringify 输出的字段顺序 = 对象的键顺序，
// 所以调用方要保留原始对象顺序，避免每次翻译都产生无意义的大 diff。

const fs = require('fs');
const front = require('hexo-front-matter');

// 解析整个文件，返回 { data, content }。
// content 是 front-matter 之后的正文（不含分隔符）。
function parse(raw) {
  if (typeof raw !== 'string') {
    throw new TypeError('frontmatter.parse: raw must be a string');
  }
  // hexo-front-matter.parse 在无 front-matter 时返回 { _content: raw }
  const parsed = front.parse(raw) || {};
  const data = {};
  for (const key of Object.keys(parsed)) {
    if (key === '_content') continue;
    data[key] = parsed[key];
  }
  return { data, content: parsed._content || '' };
}

function read(file) {
  return parse(fs.readFileSync(file, 'utf8'));
}

// 序列化回完整文件文本。
//
// 注意 hexo-front-matter.stringify 的返回值自带**结尾**分隔符但不带前导分隔符：
//   stringify({title:'T'}) === "title: T\n---\n"
// 所以这里只需要补前导 ---，**不能再补一个结尾 ---**，否则正文前会多出一条水平线。
function stringify(data, content) {
  const body = front.stringify(data);
  return `---\n${body}\n${String(content || '').replace(/^\n+/, '')}`;
}

function write(file, data, content) {
  const text = stringify(data, content);
  fs.writeFileSync(file, text, 'utf8');
  assertRoundTrip(file, text, data, content);
}

// 写盘自检：重新解析刚写出的文本，确认字段没丢、正文没变形。
// front-matter 拼接错误曾经会静默产生多余的 ---，这里把它变成硬错误。
function assertRoundTrip(file, text, data, content) {
  const check = parse(text);
  const expectedBody = String(content || '').replace(/^\n+/, '').trim();
  const actualBody = String(check.content || '').replace(/^\n+/, '').trim();

  if (actualBody !== expectedBody) {
    throw new Error(`front-matter 自检失败：写回后正文不一致（${file}）`);
  }
  for (const key of Object.keys(data)) {
    if (!Object.prototype.hasOwnProperty.call(check.data, key)) {
      throw new Error(`front-matter 自检失败：字段 ${key} 丢失（${file}）`);
    }
  }
}

// 正文的规范化哈希：先剥掉行尾空白、统一换行，再取 sha256 前 12 位。
// 这样纯格式化差异不会把译文误判成陈旧，而内容改动一定会变。
function hashContent(content) {
  const crypto = require('crypto');
  const normalized = String(content || '')
    .replace(/\r\n?/g, '\n')
    .split('\n')
    .map((line) => line.replace(/[ \t]+$/, ''))
    .join('\n')
    .trim();
  return crypto.createHash('sha256').update(normalized, 'utf8').digest('hex').slice(0, 12);
}

module.exports = { parse, read, stringify, write, hashContent, assertRoundTrip };
