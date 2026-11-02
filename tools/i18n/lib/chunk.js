'use strict';

// Markdown 正文的保护式分块。
//
// 核心思路：翻译前把「不能被模型改动的片段」抽出来换成占位符 @@T001@@，
// 让模型只看到普通文本；翻译回来后再原样还原。
// 这样代码块、行内代码、图片/链接地址、Hexo 外挂标签都不会被模型顺手改写。
//
// 若还原时占位符缺失或重复，说明模型改坏了结构 —— 调用方必须报错并放弃该篇，
// 绝不能把结构损坏的译文写进仓库。

const PLACEHOLDER_PREFIX = '@@T';
const PLACEHOLDER_RE = /@@T(\d{3,})@@/g;

// 一次送给模型的正文长度上限（字符）。超过就分块，避免输出被截断。
const DEFAULT_CHUNK_CHARS = 3000;

// 按优先级从高到低保护的片段。顺序重要：代码围栏必须排在行内代码之前，
// 否则围栏里的反引号会先被行内规则吃掉。
const PROTECT_RULES = [
  // ``` 或 ~~~ 围栏代码块（含可选语言标注）
  { name: 'fence', re: /^(`{3,}|~{3,})[^\n]*\n[\s\S]*?^\1[ \t]*$/gm },
  // Hexo 标签插件 {% ... %} 与 {{ ... }}
  { name: 'tag', re: /\{%[\s\S]*?%\}|\{\{[\s\S]*?\}\}/g },
  // HTML 注释
  { name: 'html-comment', re: /<!--[\s\S]*?-->/g },
  // 独立成行的 HTML 标签（避免误伤正文里的 < 比较符号）
  { name: 'html-tag', re: /^[ \t]*<\/?[a-zA-Z][^>\n]*>[ \t]*$/gm },
  // 图片 / 链接：整体保护，防止模型「顺手」把 URL 翻掉或改相对路径
  { name: 'image', re: /!\[[^\]]*\]\([^)\n]*\)/g },
  { name: 'link', re: /\[[^\]]*\]\([^)\n]*\)/g },
  // 行内代码
  { name: 'code', re: /`[^`\n]+`/g },
  // 裸 URL 与邮箱自动链接
  { name: 'autolink', re: /<(?:https?:\/\/|mailto:)[^>\s]+>/g }
];

function makeStore() {
  const items = [];
  return {
    items,
    put(value) {
      const id = items.length + 1;
      items.push(value);
      return `${PLACEHOLDER_PREFIX}${String(id).padStart(3, '0')}@@`;
    }
  };
}

// 抽取受保护片段，返回 { masked, store }。
function mask(text) {
  const store = makeStore();
  let masked = text;
  for (const rule of PROTECT_RULES) {
    masked = masked.replace(rule.re, (match) => store.put(match));
  }
  return { masked, store };
}

// 把占位符还原成原文；有任何占位符对不上就抛错。
//
// 需要**递归展开**：规则是一条条叠加上去的，后一条规则可能把已经是占位符的片段
// 整体再包一层。例如原文 `` `- [标题](URL): 摘要` ``，先被 link 规则换成
// `- @@T003@@: 摘要`，再被行内代码规则整段换成 @@T031@@ —— 也就是 T031 的
// 内容里嵌着 T003。若只扫描一遍，展开 T031 之后里面的 @@T003@@ 就再也不会被
// 处理，最后会被误判成「译文丢了 T003」。
function unmask(text, store) {
  const seen = new Set();
  let bad;

  const expand = (input, depth) => {
    if (depth > 8) {
      bad = bad || '占位符嵌套层数过深，疑似结构被破坏';
      return input;
    }

    let replaced = false;
    const next = input.replace(PLACEHOLDER_RE, (match, num) => {
      const id = Number(num);
      const raw = store.items[id - 1];
      if (!raw) {
        bad = bad || `译文里出现了未知占位符 ${match}`;
        return match;
      }
      if (seen.has(id)) {
        // 同一个占位符出现两次 → 结构被破坏（例如代码块被复制）
        bad = bad || `占位符 ${match} 在译文里重复出现`;
        return match;
      }
      seen.add(id);
      replaced = true;
      return raw;
    });

    return replaced ? expand(next, depth + 1) : next;
  };

  const out = expand(text, 0);

  if (bad) throw new Error(bad);

  const missing = [];
  for (let i = 0; i < store.items.length; i++) {
    if (!seen.has(i + 1)) missing.push(`${PLACEHOLDER_PREFIX}${String(i + 1).padStart(3, '0')}@@`);
  }
  if (missing.length) {
    throw new Error(`译文丢失了 ${missing.length} 个受保护片段：${missing.slice(0, 5).join(', ')}`);
  }

  return out;
}

// 超长块（整张长表格、没有空行的长列表）按**行**切开。
// 之前这里是把整块直接送出去，结果像「HTTP 状态码释义」那种六万字符的大表格
// 远超模型输出上限，译文被截断成两成长度而后校验失败。切开时若判定是 Markdown
// 表格，每一块都补回表头两行，否则后续块里的列结构会被模型丢掉。
function splitLongBlock(block, limit) {
  const lines = block.split('\n');

  // 正文常以空行开头，必须先跳过去再判断表格形态，否则 lines[0] 是空串、
  // 判定失败，后续每一块都会丢掉表头（「HTTP 状态码释义」就是这么翻坏的）。
  // 跳过的空行并入 head，保证每块复制出去的结构和原文一致。
  let start = 0;
  while (start < lines.length && lines[start].trim() === '') start++;

  const isTable = lines.length >= start + 2
    && /^\s*\|/.test(lines[start])
    && /^[\s:|-]*\|[\s:|-]*$/.test(lines[start + 1]);

  const head = isTable ? lines.slice(0, start + 2) : [];
  const body = isTable ? lines.slice(start + 2) : lines;
  const headSize = head.reduce((sum, line) => sum + line.length + 1, 0);

  const parts = [];
  let current = [];
  let size = headSize;

  for (const line of body) {
    const lineSize = line.length + 1;
    if (size + lineSize > limit && current.length) {
      parts.push(head.concat(current).join('\n'));
      current = [];
      size = headSize;
    }
    current.push(line);
    size += lineSize;
  }
  if (current.length) parts.push(head.concat(current).join('\n'));

  return parts;
}

// 按空行聚合段落分块，尽量不切断段落。标题行会作为下一个块的上下文。
function split(masked, limit = DEFAULT_CHUNK_CHARS) {
  const blocks = masked.split(/\n{2,}/);
  const chunks = [];
  let current = [];
  let size = 0;

  const flush = () => {
    if (current.length) {
      chunks.push(current.join('\n\n'));
      current = [];
      size = 0;
    }
  };

  for (const block of blocks) {
    const blockSize = block.length + 2;
    // 单个块就超限：按行切开，绝不让一整块直接进模型。
    if (blockSize > limit) {
      flush();
      for (const piece of splitLongBlock(block, limit)) chunks.push(piece);
      continue;
    }
    if (size + blockSize > limit) flush();
    current.push(block);
    size += blockSize;
  }
  flush();

  return chunks;
}

// 找出一段文本里最后一个 Markdown 标题，作为下一块的上下文提示。
function lastHeading(text) {
  const matches = text.match(/^#{1,6}[ \t].+$/gm);
  return matches ? matches[matches.length - 1].trim() : '';
}

module.exports = {
  DEFAULT_CHUNK_CHARS,
  PROTECT_RULES,
  mask,
  unmask,
  split,
  lastHeading
};
