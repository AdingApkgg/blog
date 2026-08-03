'use strict'

const fs = require('fs')
const frontMatter = require('hexo-front-matter')

// 构建时生成 /llms.txt —— 给 AI / LLM 一份站点主要内容的结构化索引（llms.txt 提案格式）
// https://llmstxt.org/  按分类分组，每篇一行：- [标题](绝对URL): 摘要

function stripText (s) {
  return String(s || '')
    .replace(/```[\s\S]*?```/g, ' ')   // 代码块
    .replace(/<[^>]+>/g, ' ')          // HTML 标签
    .replace(/[#>*`_~\-]{1,}/g, ' ')   // markdown 记号
    .replace(/!?\[([^\]]*)\]\([^)]*\)/g, '$1') // 链接/图片留文字
    .replace(/\s+/g, ' ')
    .trim()
}

function summarize (post) {
  const raw = post.description || post.excerpt || post.content || ''
  const t = stripText(raw)
  return t.length > 100 ? t.slice(0, 100) + '…' : t
}

hexo.extend.generator.register('llms-txt', function (locals) {
  const config = hexo.config
  const site = config.title || ''
  const desc = config.description || config.subtitle || ''

  // 加密文章不进 llms.txt（避免摘要泄露）。
  // 注意：hexo-blog-encrypt 处理后会把 password 从 post 对象删掉，故必须回读源文件 frontmatter 判定。
  const encCats = new Set()
  const encTags = new Set()
  const enc = config.encrypt || {}
  ;(enc.categories || []).forEach(c => c && c.name && encCats.add(c.name))
  ;(enc.tags || []).forEach(t => t && t.name && encTags.add(t.name))
  const flat = v => [].concat(v || []).flat(Infinity).filter(Boolean)
  function isEncrypted (p) {
    try {
      const parsed = frontMatter.parse(fs.readFileSync(p.full_source, 'utf8'))
      if (parsed.password) return true
      if (flat(parsed.categories).some(c => encCats.has(c))) return true
      if (flat(parsed.tags).some(t => encTags.has(t))) return true
    } catch (e) {
      // 读不到源文件时，保守起见按「非加密」处理，但记一条日志
      hexo.log.warn(`[llms-txt] 无法读取源文件判定加密状态：${p.full_source}`)
    }
    return false
  }

  const posts = locals.posts
    .filter(p => p.published !== false && p.llms !== false && !isEncrypted(p))
    .sort('-date')
    .toArray()

  // 按首个分类分组，保持「分类首次出现」的顺序
  const groups = new Map()
  for (const post of posts) {
    const cats = post.categories && post.categories.length
      ? post.categories.map(c => c.name)
      : ['其他']
    const key = cats[0]
    if (!groups.has(key)) groups.set(key, [])
    groups.get(key).push(post)
  }

  const lines = []
  lines.push(`# ${site}`)
  if (desc) lines.push('', `> ${stripText(desc)}`)
  lines.push('', `本文件为 AI / LLM 提供站点主要内容的结构化索引（llms.txt 提案格式）。站点：${config.url}`)

  for (const [cat, list] of groups) {
    lines.push('', `## ${cat}`, '')
    for (const post of list) {
      const s = summarize(post)
      lines.push(`- [${post.title}](${post.permalink})${s ? ': ' + s : ''}`)
    }
  }

  return {
    path: 'llms.txt',
    data: lines.join('\n') + '\n'
  }
})
