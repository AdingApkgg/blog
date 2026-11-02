'use strict'

const fs = require('fs')
const frontMatter = require('hexo-front-matter')
// i18n 工具链在 tools/i18n/ 下（scripts/ 会被 Hexo 递归加载，不能放 .md / CLI 脚本）
const langs = require('../tools/i18n/lib/langs')

// 构建时生成 /llms.txt —— 给 AI / LLM 一份站点主要内容的结构化索引（llms.txt 提案格式）
// https://llmstxt.org/  先按语言分组、再按分类分组，每篇一行：- [标题](绝对URL): 摘要
// 语言分组是硬要求：zh / ja / en 混在一起时，模型分不清每条链接属于哪种语言
// （见 i18n/README.md 验收标准 5「产物按语言分流」）。

// 判定文章语言：front-matter 的 lang 优先，缺失时回退到 source 路径前缀，最后落到默认语言 zh。
function postLang (post) {
  if (post.lang) return langs.normalize(post.lang)
  const source = post.source || ''
  if (source.startsWith('_posts/ja/')) return 'ja'
  if (source.startsWith('_posts/en/')) return 'en'
  return langs.DEFAULT_LANG
}

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

  // 语言 -> 分类两层分组，两层都保持「首次出现」的顺序（posts 已按 -date 排序）
  const byLang = new Map()
  for (const post of posts) {
    const code = postLang(post)
    if (!byLang.has(code)) byLang.set(code, new Map())
    const groups = byLang.get(code)
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

  // 语言用 ## 标题、分类降为 ###；没有文章的语言不输出空章节
  for (const code of langs.ALL_LANGS) {
    const groups = byLang.get(code)
    if (!groups || groups.size === 0) continue
    lines.push('', `## ${langs.label(code)}`)
    for (const [cat, list] of groups) {
      lines.push('', `### ${cat}`, '')
      for (const post of list) {
        const s = summarize(post)
        lines.push(`- [${post.title}](${post.permalink})${s ? ': ' + s : ''}`)
      }
    }
  }

  return {
    path: 'llms.txt',
    data: lines.join('\n') + '\n'
  }
})
