'use strict'

const fs = require('fs')
const frontMatter = require('hexo-front-matter')
const { stripHTML, full_url_for, gravatar, encodeURL } = require('hexo-util')
const { generateAtomFeed } = require('feedsmith')
// 注意：Hexo 会递归加载 scripts/ 下的每个文件，i18n 工具链已移到 tools/i18n/（见其 README）
const langs = require('../tools/i18n/lib/langs')

// 分语言产物：search-<lang>.json 与 feed-<lang>.xml（zh / ja / en）。
// 规范见 scripts/i18n/README.md：中文保持 p/<abbrlink>/，日英在 ja/ en/ 前缀下；
// 每个产物只含单一语言，绝不生成混语言文件。
//
// 输出「形状」不另发明，直接对齐现有插件：
//   - search-*.json 逐字段对齐 hexo-generator-searchdb/lib/database.js（title / url / content / categories / tags）
//   - feed-*.xml    逐字段对齐 hexo-generator-feed/lib/generator.js 的 Atom 模板（同一个 feedsmith 版本、同一套选项）
// 仅两处有意为之的差异，见文件末尾注释：根元素补 xml:lang、<id> 取各自 feed 的绝对 URL。

// 判定文章语言：front-matter 的 lang 优先（warehouse 会把未知字段原样挂在 post 上），
// 缺失时回退到 source 路径前缀，最后才落到默认语言 zh（契约允许中文没有 lang）。
function postLang (post) {
  if (post.lang) return langs.normalize(post.lang)
  const source = post.source || ''
  if (source.startsWith('_posts/ja/')) return 'ja'
  if (source.startsWith('_posts/en/')) return 'en'
  return langs.DEFAULT_LANG
}

// 加密文章不进索引 / feed（与 llms-txt.js 同一套判定，理由同 README）。
// hexo-blog-encrypt 处理后会把 password 从 post 对象上删掉，所以必须回读源文件 frontmatter。
function createEncryptionDetector (config) {
  const encCats = new Set()
  const encTags = new Set()
  const enc = config.encrypt || {}
  ;(enc.categories || []).forEach(c => c && c.name && encCats.add(c.name))
  ;(enc.tags || []).forEach(t => t && t.name && encTags.add(t.name))
  const flat = v => [].concat(v || []).flat(Infinity).filter(Boolean)
  const cache = new Map()

  return function isEncrypted (post) {
    const key = post.full_source || post.source || ''
    if (cache.has(key)) return cache.get(key)
    let encrypted = false
    try {
      const parsed = frontMatter.parse(fs.readFileSync(post.full_source, 'utf8'))
      if (parsed.password) encrypted = true
      else if (flat(parsed.categories).some(c => encCats.has(c))) encrypted = true
      else if (flat(parsed.tags).some(t => encTags.has(t))) encrypted = true
    } catch (e) {
      // 读不到源文件时按「非加密」处理，但记一条日志（与 llms-txt.js 一致）
      hexo.log.warn(`[i18n-artifacts] 无法读取源文件判定加密状态：${post.full_source}`)
    }
    cache.set(key, encrypted)
    return encrypted
  }
}

// —— search 索引：处理规则逐行对齐 hexo-generator-searchdb/lib/database.js ————
function searchContent (post, config) {
  const search = config.search || {}
  if (search.content === false) return ''
  if (search.format === 'raw') return String(post._content || '')
  const html = String(post.content || '').replace(/<td class="gutter">.*?<\/td>/g, '')
  return search.format === 'striptags' ? stripHTML(html) : html
}

// searchdb 的 url 规则是 encodeURI(config.root + article.path)，对中文完全适用；
// 但译文带 front-matter permalink，Hexo 的 post_permalink 会返回以 / 开头的 __permalink，
// 即 post.path = '/ja/p/<abbrlink>/'，直接拼接会得到 '//ja/...'（协议相对 URL，链接会跳到主机 ja）。
// 因此这里先各去掉一侧多余的斜杠再拼，中文结果与 searchdb 逐字节一致。
function searchUrl (post, config) {
  const root = String(config.root || '/').replace(/\/+$/, '') + '/'
  const relative = String(post.path || '').replace(/^\/+/, '')
  return encodeURI(root + relative)
}

function searchEntry (post, config) {
  const data = {}
  if (post.title) data.title = post.title
  if (post.path) data.url = searchUrl(post, config)
  data.content = searchContent(post, config)
  if (post.categories && post.categories.length > 0) {
    data.categories = post.categories.map(category => category.name)
  }
  if (post.tags && post.tags.length > 0) {
    data.tags = post.tags.map(tag => tag.name)
  }
  return data
}

// —— feed：逐行对齐 hexo-generator-feed/lib/generator.js 的 Atom 组装 ——————
function itemDescription (post, feedConfig) {
  if (post.description) return post.description
  if (post.intro) return post.intro
  if (post.excerpt) return post.excerpt
  if (post.content) {
    const shortContent = post.content.substring(0, feedConfig.content_limit || 140)
    if (feedConfig.content_limit_delim) {
      const delimPos = shortContent.lastIndexOf(feedConfig.content_limit_delim)
      if (delimPos > -1) return shortContent.substring(0, delimPos)
    }
    return shortContent
  }
  return ''
}

function itemCategories (post) {
  const items = [
    ...(post.categories ? post.categories.toArray() : []),
    ...(post.tags ? post.tags.toArray() : [])
  ]
  return items.map(item => ({ name: item.name, domain: item.permalink }))
}

function composeItem (post, feedConfig, ctx) {
  return {
    title: post.title,
    link: encodeURL(full_url_for.call(ctx, post.permalink)),
    description: itemDescription(post, feedConfig),
    published: post.date.toDate(),
    updated: (post.updated || post.date).toDate(),
    content: feedConfig.content && post.content
      ? post.content.replace(/[\x00-\x1F\x7F]/g, '') // eslint-disable-line no-control-regex
      : '',
    enclosures: post.image && [{ url: full_url_for.call(ctx, post.image) }],
    categories: itemCategories(post)
  }
}

function composeAtomEntry (item, feed) {
  return {
    title: item.title,
    id: item.link,
    links: [
      { href: item.link },
      ...(item.enclosures || []).map(enclosure => ({ href: enclosure.url, rel: 'enclosure' }))
    ],
    summary: item.description,
    content: item.content,
    published: item.published,
    updated: item.updated || item.published,
    authors: feed.author.name && [feed.author],
    categories: item.categories.map(cat => ({ term: cat.name, scheme: cat.domain }))
  }
}

// feedsmith 的 Atom 生成器不认识 language 字段（RSS 才有 <language>，Atom 该用 xml:lang），
// 所以按站点既有模板生成后，只在根元素补 xml:lang，并在第一个 <link> 前插一个 <language>，
// 让只认 RSS 风格 <language> 的阅读器也能读到语种。
function injectLanguage (atom, xmlLang) {
  const tagMatch = atom.match(/<feed(\s[^>]*?)?>/)
  if (!tagMatch) {
    hexo.log.warn('[i18n-artifacts] Atom 根元素未找到，未能写入 xml:lang')
    return atom
  }
  const rootTag = tagMatch[0]
  const newRootTag = /xml:lang=/.test(rootTag)
    ? rootTag
    : `<feed${tagMatch[1] || ''} xml:lang="${xmlLang}">`
  let out = atom.slice(0, tagMatch.index) + newRootTag + atom.slice(tagMatch.index + rootTag.length)

  if (/\n(\s*)<link\b/.test(out)) {
    out = out.replace(/\n(\s*)<link\b/, (whole, indent) =>
      `\n${indent}<language>${xmlLang}</language>\n${indent}<link`)
  } else {
    hexo.log.warn('[i18n-artifacts] Atom 顶层 <link> 未找到，未能写入 <language>')
  }
  return out
}

function buildAtom (ctx, posts, path, code, fallbackUpdated) {
  const config = ctx.config
  const feedConfig = config.feed || {}

  let url = config.url || ''
  if (url[url.length - 1] !== '/') url += '/'
  let icon = ''
  if (feedConfig.icon) icon = full_url_for.call(ctx, feedConfig.icon)
  else if (config.email) icon = gravatar(config.email)

  const currentYear = new Date().getFullYear()
  const latest = posts.length ? posts[0] : null
  const feed = {
    title: config.title,
    subtitle: config.subtitle || config.description,
    id: encodeURL(full_url_for.call(ctx, path)),
    updated: latest ? (latest.updated || latest.date).toDate() : fallbackUpdated,
    links: [
      { href: encodeURL(url), rel: 'alternate' },
      { href: encodeURL(full_url_for.call(ctx, path)), rel: 'self' },
      ...(feedConfig.hub ? [{ href: encodeURL(feedConfig.hub), rel: 'hub' }] : [])
    ],
    generator: { text: 'Hexo', uri: 'https://hexo.io/' },
    icon,
    rights: config.author && `All rights reserved ${currentYear}, ${config.author}`,
    author: { name: config.author, email: config.email }
  }

  const entries = posts.map(post => composeAtomEntry(composeItem(post, feedConfig, ctx), feed))
  const atom = generateAtomFeed({ ...feed, entries }, { lenient: true })
  return injectLanguage(atom, langs.htmlLang(code))
}

hexo.extend.generator.register('i18n-artifacts', function (locals) {
  const ctx = this && this.config ? this : hexo
  const config = ctx.config
  const feedConfig = config.feed || {}
  const isEncrypted = createEncryptionDetector(config)

  // 加密文章一律排除；语言由 postLang 归一后严格分流
  const posts = locals.posts
    .filter(post => post.published !== false && !isEncrypted(post))
    .toArray()

  const byLang = new Map()
  for (const post of posts) {
    const code = postLang(post)
    if (!byLang.has(code)) byLang.set(code, [])
    byLang.get(code).push(post)
  }

  // 站点最新文章时间：某个语言一篇都没有时（译文尚未入库）用作 feed 的 updated 兜底，
  // 保证空 feed 也能生成、且结果确定（不取构建时刻）。
  const siteLatest = posts
    .slice()
    .sort((a, b) => b.date.valueOf() - a.date.valueOf())[0]
  const fallbackUpdated = siteLatest ? (siteLatest.updated || siteLatest.date).toDate() : null

  const result = []

  // search-<lang>.json：元素顺序与 searchdb 一致，语言内保持 locals.posts 的原始顺序
  for (const code of langs.ALL_LANGS) {
    const list = byLang.get(code) || []
    result.push({
      path: `search-${code}.json`,
      data: JSON.stringify(list.map(post => searchEntry(post, config)))
    })
  }

  // feed-<lang>.xml：按 feed.order_by（默认 -date）排序，limit 同 feed 配置（0 表示不限）
  if (fallbackUpdated) {
    for (const code of langs.ALL_LANGS) {
      let list = (byLang.get(code) || []).slice()
      list.sort((a, b) => b.date.valueOf() - a.date.valueOf())
      if (feedConfig.limit) list = list.slice(0, feedConfig.limit)
      result.push({
        path: `feed-${code}.xml`,
        data: buildAtom(ctx, list, `feed-${code}.xml`, code, fallbackUpdated)
      })
    }
  } else {
    // 全站一篇文章都没有：与 hexo-generator-feed 一致，不产出 feed
    hexo.log.warn('[i18n-artifacts] 站点无文章，跳过 feed 生成')
  }

  return result
})

// 与 atom.xml 模板的两处有意差异（其余结构逐字段一致）：
// 1. 根元素补 xml:lang，并插一个 <language>：feedsmith 的 Atom 生成器不支持语种字段，
//    而三语 feed 必须让阅读器知道语种；xml:lang 是 Atom 的正规做法，<language> 照顾 RSS 风格消费者。
// 2. <id> 取各自 feed 的绝对 URL（atom.xml 用的是站点根）：三个独立 feed 若共用同一个 id，
//    阅读器会把它们当成同一个 feed 去重。若要与 atom.xml 完全一致，把 buildAtom 的 id 改回 encodeURL(url) 即可。
