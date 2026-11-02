'use strict'

// 三语分类页 / 标签页生成器（zh / ja / en）。
//
// 为什么需要整份替换插件：
// hexo-generator-category 与 hexo-generator-tag 只认全站唯一一份 categories / tags，
// 主题模板也从 page.category / page.tag 取显示名。三语站点要求每个语言各有自己的
// 显示名、URL 段与文章集合，插件本身没有语言维度，只能同名重注册覆盖掉。
//
// 覆盖方式：`hexo.extend.generator.register('category' | 'tag', fn)`。
// Hexo 的 generator store 同名即覆盖（extend/generator.js: this.store[name] = ...），
// 且 scripts/ 在 node_modules 插件之后加载（hexo/load_plugins.js: loadModules → loadScripts），
// 所以这里注册的一定是最终生效的那一份。
//
// 中文那套路径逐字节沿用插件原逻辑（直接取模型的 path / slug，含 category_map 与父级链），
// 92 篇旧链接、外链与搜索引擎索引零破坏；日英在 ja/ en/ 前缀下用译名生成 URL 段。
//
// 依赖 tools/i18n/lib/{taxonomy,langs}.js 为只读，不在本文件里改动它们。

const fs = require('fs')
const path = require('path')

let pagination = null
let slugize = null
let full_url_for = null
let taxonomy = null
let langs = null

try {
  pagination = require('hexo-pagination')
} catch (err) {
  pagination = null
}
try {
  const util = require('hexo-util')
  slugize = util.slugize
  full_url_for = util.full_url_for
} catch (err) {
  slugize = null
  full_url_for = null
}
try {
  taxonomy = require('../tools/i18n/lib/taxonomy')
} catch (err) {
  taxonomy = null
}
try {
  langs = require('../tools/i18n/lib/langs')
} catch (err) {
  langs = null
}

// 两个插件的注册名与各自的数据键（见 hexo-generator-category/index.js、hexo-generator-tag/index.js）。
const KINDS = {
  category: {
    name: 'category',
    table: 'categories',
    model: 'categories',
    key: 'category',
    dirKey: 'category_dir',
    dirFallback: 'categories',
    configKey: 'category_generator',
    // 与插件逐字一致的 layout 候选
    layout: ['category', 'archive', 'index'],
    original: 'hexo-generator-category/lib/generator'
  },
  tag: {
    name: 'tag',
    table: 'tags',
    model: 'tags',
    key: 'tag',
    dirKey: 'tag_dir',
    dirFallback: 'tags',
    configKey: 'tag_generator',
    layout: ['tag', 'archive', 'index'],
    original: 'hexo-generator-tag/lib/generator'
  }
}

const INDEX_TITLES = {
  tag: { zh: '标签云', ja: 'タグクラウド', en: 'Tags' },
  category: { zh: '文章分类', ja: 'カテゴリ', en: 'Categories' }
}

// butterfly 把 <html lang> 写死在 config.language；i18n-render.js 只处理文章页，
// 这里对分类/标签页做同样的事（默认语言为幂等替换，中文页字节不变）。
const HTML_LANG_RE = /(<html[^>]*\slang=")[^"]*(")/i
const OG_LOCALE_RE = /<meta[^>]*og:locale[^>]*>/gi

let tableCache = null
const warned = new Set()

function log (ctx, level, message) {
  try {
    if (ctx && ctx.log && typeof ctx.log[level] === 'function') {
      ctx.log[level](`[i18n-taxonomy-pages] ${message}`)
    }
  } catch (err) {
    // 日志不可用时也不能中断生成
  }
}

function resetCaches () {
  tableCache = null
  warned.clear()
}

// taxonomy.yml 解析失败时退化为空表：全部走中文兜底，绝不抛错。
function loadTable (ctx) {
  if (tableCache) return tableCache
  try {
    tableCache = taxonomy.load() || { categories: {}, tags: {} }
  } catch (err) {
    log(ctx, 'warn', `taxonomy.yml 读取失败，分类/标签译名退化为中文：${err.message}`)
    tableCache = { categories: {}, tags: {} }
  }
  return tableCache
}

function toArray (value) {
  if (!value) return []
  if (typeof value.toArray === 'function') return value.toArray()
  if (Array.isArray(value)) return value
  return []
}

// 文章语言：front-matter 的 lang 优先，缺失时看 source 路径前缀，最后才是默认语言 zh。
// 与 scripts/i18n-artifacts.js 的判定保持一致。
function postLang (post) {
  if (!post) return langs.DEFAULT_LANG
  if (post.lang) return langs.normalize(post.lang)
  const source = post.source || ''
  if (source.indexOf('_posts/ja/') === 0) return 'ja'
  if (source.indexOf('_posts/en/') === 0) return 'en'
  return langs.DEFAULT_LANG
}

function slugizeName (name, config) {
  if (!slugize) return String(name)
  return slugize(String(name), { transform: config ? config.filename_case : 0 })
}

// 显示名：中文用原名；日英查表，查不到就保留中文（并在日志里点名）。
function displayName (ctx, spec, name, lang, table) {
  if (lang === langs.DEFAULT_LANG) return name
  let translated = null
  try {
    translated = taxonomy.lookup(table, spec.table, name, lang)
  } catch (err) {
    translated = null
  }
  if (translated) return translated

  const mark = `${spec.name}:${name}->${lang}`
  if (!warned.has(mark)) {
    warned.add(mark)
    log(ctx, 'warn', `缺少 ${lang} 译名，回退中文：${spec.name} 「${name}」`)
  }
  return name
}

// 单个名字在目标语言下的 URL 段：taxonomy 里显式给的 slug 优先，否则用译名 slugize。
function slugForName (ctx, spec, name, lang, table, config) {
  if (lang === langs.DEFAULT_LANG) return slugizeName(name, config)
  const group = table[spec.table] || {}
  const entry = group[name]
  if (entry && typeof entry === 'object' && entry.slug !== undefined && entry.slug !== null) {
    const explicit = String(entry.slug).trim()
    if (explicit) return explicit
  }
  return slugizeName(displayName(ctx, spec, name, lang, table), config)
}

function resolveParent (ctx, id) {
  try {
    if (ctx && typeof ctx.model === 'function') {
      const Model = ctx.model('Category')
      if (Model && typeof Model.findById === 'function') return Model.findById(id)
    }
  } catch (err) {
    // 解析不到父级就当没有父级
  }
  return null
}

// 日英分类的 slug：父级链逐级取译名段，缺译名的那一级用中文兜底。
function localizedSlug (ctx, spec, model, lang, table, config) {
  const names = []
  let current = model
  let guard = 0
  while (current && guard < 10) {
    guard += 1
    const name = current.name === undefined || current.name === null ? '' : String(current.name)
    if (name) names.unshift(name)
    current = current.parent ? resolveParent(ctx, current.parent) : null
  }
  if (!names.length) {
    const own = model.name === undefined || model.name === null ? '' : String(model.name)
    if (own) names.push(own)
  }
  return names.map((name) => slugForName(ctx, spec, name, lang, table, config)).join('/')
}

// 目录配置归一化：与 hexo 模型虚拟属性 path 的写法一致（'/' → ''，补尾斜杠）。
function normalizeDir (value, fallback) {
  let dir = value === undefined || value === null || value === '' ? fallback : String(value)
  if (dir === '/') dir = ''
  if (dir && dir.charAt(dir.length - 1) !== '/') dir += '/'
  return dir
}

function indexPrefix (lang) {
  const dir = langs.dirOf(lang)
  return dir ? `${dir}/` : ''
}

function indexPathFor (spec, config, lang) {
  return `${indexPrefix(lang)}${normalizeDir(config ? config[spec.dirKey] : null, spec.dirFallback)}`
}

// 中文用模型自带的 path（与插件完全一致）；日英加语言前缀换译名段。
function basePath (spec, model, lang, slug, config) {
  if (lang === langs.DEFAULT_LANG) return model.path
  return `${indexPathFor(spec, config, lang)}${slug}/`
}

function generatorConfig (config, spec) {
  const value = config ? config[spec.configKey] : null
  return value && typeof value === 'object' ? value : {}
}

function perPageOf (config, spec) {
  const own = generatorConfig(config, spec)
  if (own.per_page !== undefined && own.per_page !== null) return own.per_page
  if (config && config.per_page !== undefined && config.per_page !== null) return config.per_page
  return 10
}

function orderByOf (config, spec) {
  const own = generatorConfig(config, spec)
  return own.order_by || '-date'
}

function valueOf (item, key) {
  const value = item ? item[key] : undefined
  if (value && typeof value.toDate === 'function') return value.toDate().getTime()
  if (value instanceof Date) return value.getTime()
  return value
}

function compareValue (a, b) {
  if (a === b) return 0
  if (a === undefined || a === null) return 1
  if (b === undefined || b === null) return -1
  if (typeof a === 'number' && typeof b === 'number') return a - b
  return String(a).localeCompare(String(b))
}

// 纯数组兜底排序（仅用于测试夹具或非 warehouse 数据源；生产走 Query.sort 原逻辑）。
function sortPlainPosts (list, orderBy) {
  const raw = String(orderBy || '-date')
  const desc = raw.charAt(0) === '-'
  const key = desc ? raw.slice(1) : raw
  if (!key || key === 'random') return list.slice()
  const sorted = list.slice()
  sorted.sort((a, b) => {
    const cmp = compareValue(valueOf(a, key), valueOf(b, key))
    return desc ? -cmp : cmp
  })
  return sorted
}

// 取该分类/标签在某个语言下的文章集合。
// warehouse Query 带着 toArray；保住 Query 形态，hexo-pagination 与主题的
// page.posts.data / page.posts.forEach 两种用法都能照常工作。
function postsForLang (model, lang, orderBy) {
  const all = model && model.posts ? model.posts : []
  if (typeof all.filter !== 'function') return []
  const filtered = all.filter((post) => postLang(post) === lang)
  if (filtered && typeof filtered.toArray === 'function') return filtered.sort(orderBy)
  return sortPlainPosts(toArray(filtered), orderBy)
}

// 收集某类（分类或标签）下每个词条的三语信息：显示名、URL 段、路径、各语言文章。
// collection 优先取生成器入参 locals[<model>]（Hexo 传的就是 locals.toObject()），
// 与原插件一致；没有则退回 ctx.locals。
function collectTerms (ctx, spec, table, locals) {
  const config = ctx.config || {}
  let collection = locals ? locals[spec.model] : null
  if (collection === undefined || collection === null) {
    collection = ctx.locals && typeof ctx.locals.get === 'function' ? ctx.locals.get(spec.model) : null
  }
  const models = toArray(collection)
  const orderBy = orderByOf(config, spec)

  // 中文名 → term。必须按归一后的名字聚合：译文的 front-matter 里放的是译名，
  // Hexo 会为「技術開発」「Tech Development」各建一个独立分类模型，三语版本
  // 因而变成三个互不相认的 term（hreflang 也会断）。归一回中文 key 后合并成一个。
  const terms = new Map()

  for (const model of models) {
    if (!model) continue
    const rawName = model.name === undefined || model.name === null ? '' : String(model.name)
    if (!rawName) continue

    const zhName = resolveName(table, spec, rawName)

    let term = terms.get(zhName)
    if (!term) {
      term = { zhName, model: null, byLang: {}, slug: {}, path: {}, display: {} }
      terms.set(zhName, term)
    }

    // 中文模型带权威 path / slug（category_map 与父级链都在它身上），优先保留它。
    const modelsOfLang = []
    for (const lang of langs.ALL_LANGS) {
      const posts = toArray(postsForLang(model, lang, orderBy))
      if (!posts.length) continue
      modelsOfLang.push(lang)
      term.byLang[lang] = term.byLang[lang] ? term.byLang[lang].concat(posts) : posts
    }
    if (!modelsOfLang.length) continue
    if (!term.model || modelsOfLang.indexOf(langs.DEFAULT_LANG) !== -1) term.model = model
  }

  const out = []
  for (const term of terms.values()) {
    // 一个语言都没有文章的词条不出页（与插件 `if (!category.length) return result` 同义）
    if (!term.model || !Object.keys(term.byLang).length) continue

    // 只为真有文章的语言算名字与路径：没有该语言的文章就不会有页面，
    // 也就不该为它报「缺译名」（只会制造噪声）。
    for (const lang of Object.keys(term.byLang)) {
      term.display[lang] = displayName(ctx, spec, term.zhName, lang, table)
      term.slug[lang] = lang === langs.DEFAULT_LANG
        ? term.model.slug
        : localizedSlug(ctx, spec, term.model, lang, table, config)
      term.path[lang] = basePath(spec, term.model, lang, term.slug[lang], config)
    }
    out.push(term)
  }

  return out
}

// 把模型名归一回中文 key；taxonomy 不可用时原样返回。
function resolveName (table, spec, name) {
  try {
    return taxonomy.resolve(table, spec.table, name)
  } catch (err) {
    return name
  }
}

function termAlternates (available, paths) {
  const list = []
  for (const lang of langs.ALL_LANGS) {
    if (available.indexOf(lang) === -1) continue
    list.push({ lang, hreflang: langs.htmlLang(lang), path: paths[lang] })
  }
  return list
}

// 分类/标签详情页（含分页），三语各一套，locals 形状与插件逐字对齐。
function generateTerms (ctx, spec, table) {
  const config = ctx.config || {}
  const perPage = perPageOf(config, spec)
  const paginationDir = config.pagination_dir || 'page'
  const terms = collectTerms(ctx, spec, table)
  const out = []

  for (const term of terms) {
    const available = langs.ALL_LANGS.filter((lang) => term.byLang[lang])
    const alternates = termAlternates(available, term.path)

    for (const lang of available) {
      const pages = pagination(term.path[lang], term.byLang[lang], {
        perPage,
        layout: spec.layout,
        format: paginationDir + '/%d/',
        data: { [spec.key]: term.display[lang] }
      })

      for (const page of pages) {
        page.data.lang = lang
        page.data.language = langs.htmlLang(lang)
        page.data.i18n_taxonomy = {
          kind: spec.name,
          name: term.zhName,
          index: false,
          lang,
          // 只在第 1 页声明 hreflang：分页后续页不是另一语言的对等版本，
          // 声明了会制造错误的链接组（Google 会静默丢弃甚至误判）。
          alternates: page.data.current === 1 ? alternates : []
        }
        out.push(page)
      }
    }
  }

  log(ctx, 'debug', `${spec.name}: ${terms.length} 个词条，生成 ${out.length} 个详情页`)
  return out
}

function escapeHtml (value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

function escapeAttr (value) {
  return String(value).replace(/&/g, '&amp;').replace(/"/g, '&quot;')
}

// 站内绝对路径（root 感知），与 scripts/i18n-artifacts.js 的 encodeURI(config.root + path) 同义。
function siteUrl (config, target) {
  const root = config && config.root !== undefined && config.root !== null ? String(config.root) : '/'
  const base = root === '/' ? '' : root.replace(/\/+$/, '')
  return `${base}/${String(target).replace(/^\/+/, '')}`
}

// 与 butterfly cloudTags 一致的取色策略，但用名字哈希而不是 Math.random，
// 保证每次构建产物一致、diff 可审。
function tagColor (name) {
  let hash = 0
  for (let i = 0; i < name.length; i += 1) {
    hash = (hash * 31 + name.charCodeAt(i)) % 360
  }
  return `hsl(${hash}, 55%, 62%)`
}

// 索引页正文：复用主题既有 class，视觉与主题自带标签云/分类列表一致。
// 不走主题的 cloudTags/list_categories，是因为它们写死读 site.tags / site.categories
// （全语言混在一起），模板里没有 per-page 数据源可用。
function renderIndexContent (spec, items, config) {
  if (!items.length) return ''

  if (spec.name === 'tag') {
    const counts = [...new Set(items.map((item) => item.count))].sort((a, b) => a - b)
    const span = counts.length - 1
    const links = items.map((item) => {
      const ratio = span ? counts.indexOf(item.count) / span : 0
      const size = (1.2 + 0.3 * ratio).toFixed(2)
      const href = encodeURI(siteUrl(config, item.path))
      return `<a href="${escapeAttr(href)}" style="font-size: ${size}em; background-color: ${tagColor(item.name)}">${escapeHtml(item.name)}</a>`
    })
    return `<div class="tag-cloud-list text-center">${links.join('')}</div>`
  }

  const sorted = items.slice().sort((a, b) => String(a.name).localeCompare(String(b.name)))
  const links = sorted.map((item) => {
    const href = encodeURI(siteUrl(config, item.path))
    return `<li class="category-list-item"><a class="category-list-link" href="${escapeAttr(href)}">${escapeHtml(item.name)}</a><span class="category-list-count">${item.count}</span></li>`
  })
  return `<div class="category-lists"><ul class="category-list">${links.join('')}</ul></div>`
}

// source/ 下若已有人工维护的索引页（如 source/tags/index.md、source/ja/tags/index.md），
// 一律让给人工页，绝不覆盖 —— 生成器的 page 路由先注册，同名路径会被后注册的覆盖。
function hasSourceIndexPage (ctx, dir) {
  try {
    const base = ctx.source_dir || (ctx.base_dir ? path.join(ctx.base_dir, 'source') : '')
    if (!base) return true
    const parts = String(dir).split('/').filter(Boolean)
    for (const ext of ['md', 'markdown', 'html']) {
      if (fs.existsSync(path.join(base, ...parts, `index.${ext}`))) return true
    }
    return false
  } catch (err) {
    // 探测失败时按「已存在」处理：宁可少生成一个索引页，也不覆盖人工文件。
    return true
  }
}

// 分类/标签索引页：每个存在的语言一份。
// 中文的 source/categories/index.md、source/tags/index.md 已存在 → 跳过，字节不变；
// 日英目前没有源文件 → 由这里生成 /ja/...、/en/... 索引页。
function generateIndex (ctx, spec, table) {
  const config = ctx.config || {}
  const terms = collectTerms(ctx, spec, table)
  const alternates = langs.ALL_LANGS.map((lang) => ({
    lang,
    hreflang: langs.htmlLang(lang),
    path: indexPathFor(spec, config, lang)
  }))
  const out = []

  for (const lang of langs.ALL_LANGS) {
    const dir = indexPathFor(spec, config, lang)
    if (hasSourceIndexPage(ctx, dir)) continue

    const items = terms
      .filter((term) => term.byLang[lang])
      .map((term) => ({
        name: term.display[lang],
        path: term.path[lang],
        count: term.byLang[lang].length
      }))

    out.push({
      path: dir,
      layout: ['page'],
      data: {
        title: (INDEX_TITLES[spec.name] || {})[lang] || INDEX_TITLES[spec.name].zh,
        content: renderIndexContent(spec, items, config),
        lang,
        language: langs.htmlLang(lang),
        comments: false,
        i18n_taxonomy: { kind: spec.name, name: null, index: true, lang, alternates }
      }
    })
  }

  return out
}

function safeOriginal (spec) {
  try {
    const fn = require(spec.original)
    return typeof fn === 'function' ? fn : null
  } catch (err) {
    return null
  }
}

function generateKind (ctx, spec, locals) {
  const table = loadTable(ctx)
  return generateTerms(ctx, spec, table).concat(generateIndex(ctx, spec, table))
}

function hreflangTags (alternates, ctx) {
  if (!Array.isArray(alternates) || alternates.length < 2) return ''

  const lines = []
  let defaultHref = null

  for (const alt of alternates) {
    if (!alt || !alt.path) continue
    const href = absoluteUrl(ctx, alt.path)
    if (!href) continue
    const hreflang = alt.hreflang || langs.htmlLang(alt.lang)
    lines.push(`<link rel="alternate" hreflang="${escapeAttr(hreflang)}" href="${escapeAttr(href)}">`)
    if (alt.lang === langs.DEFAULT_LANG) defaultHref = href
  }

  if (!lines.length) return ''
  if (defaultHref) {
    lines.push(`<link rel="alternate" hreflang="x-default" href="${escapeAttr(defaultHref)}">`)
  }
  return lines.join('\n')
}

function absoluteUrl (ctx, target) {
  try {
    if (full_url_for) return full_url_for.call(ctx, target)
  } catch (err) {
    // 落到下面的手工拼接
  }
  const config = ctx && ctx.config ? ctx.config : {}
  const url = config.url ? String(config.url).replace(/\/+$/, '') : ''
  return url + siteUrl(config, target)
}

// 由 source 页渲染出来的中文索引页（type: tags / categories）不在生成器里，
// 这里按同一套路径规则补出对等的 alternates。
function fallbackTaxonomyInfo (page, ctx) {
  const type = page.type
  if (type !== 'tags' && type !== 'categories') return null
  const spec = type === 'tags' ? KINDS.tag : KINDS.category
  const config = ctx && ctx.config ? ctx.config : {}
  const lang = page.lang ? langs.normalize(page.lang) : langs.DEFAULT_LANG

  return {
    kind: spec.name,
    name: null,
    index: true,
    lang,
    alternates: langs.ALL_LANGS.map((code) => ({
      lang: code,
      hreflang: langs.htmlLang(code),
      path: indexPathFor(spec, config, code)
    }))
  }
}

if (langs && taxonomy && pagination) {
  hexo.on('generateBefore', resetCaches)

  for (const spec of Object.values(KINDS)) {
    const original = safeOriginal(spec)

    // 同名覆盖 hexo-generator-{category,tag}（两者注册名就是 'category' / 'tag'）。
    hexo.extend.generator.register(spec.name, function (locals) {
      try {
        return generateKind(this, spec, locals)
      } catch (err) {
        log(this, 'error', `${spec.name} 生成失败，回退官方插件逻辑：${err && err.message}`)
        if (original) {
          try {
            return original.call(this, locals)
          } catch (fallbackErr) {
            log(this, 'error', `${spec.name} 官方插件逻辑也失败：${fallbackErr && fallbackErr.message}`)
          }
        }
        return []
      }
    })
  }

  // 对称 hreflang + 语言属性。只处理分类/标签页（自带 i18n_taxonomy 标记的，
  // 以及 source 里的 type: tags|categories 页），文章页归 scripts/i18n-render.js 管。
  hexo.extend.filter.register('after_render:html', function (html, locals) {
    try {
      if (typeof html !== 'string' || html.indexOf('</head>') === -1) return html

      const page = locals && locals.page
      if (!page) return html

      const info = page.i18n_taxonomy || fallbackTaxonomyInfo(page, this)
      if (!info) return html

      const current = info.lang || langs.DEFAULT_LANG
      let out = html

      if (current !== langs.DEFAULT_LANG) {
        out = out.replace(HTML_LANG_RE, `$1${langs.htmlLang(current)}$2`)
        out = out.replace(OG_LOCALE_RE, (tag) => {
          if (!/content="/i.test(tag)) return tag
          return tag.replace(/content="[^"]*"/i, `content="${langs.ogLocale(current)}"`)
        })
      }

      const tags = hreflangTags(info.alternates, this)
      if (tags) out = out.replace('</head>', `${tags}\n</head>`)

      return out
    } catch (err) {
      return html
    }
  })
} else {
  // 依赖缺失时完全不注册：官方插件继续按原样工作，绝不会因为本文件而构建失败。
  log(hexo, 'warn', '依赖缺失（hexo-pagination / tools/i18n/lib），跳过三语分类与标签页覆盖')
}

// 供本地 node 冒烟测试使用（Hexo 运行时不会用到）。
module.exports = {
  KINDS,
  postLang,
  slugizeName,
  displayName,
  slugForName,
  localizedSlug,
  normalizeDir,
  basePath,
  indexPathFor,
  perPageOf,
  orderByOf,
  sortPlainPosts,
  postsForLang,
  collectTerms,
  generateTerms,
  generateIndex,
  generateKind,
  hreflangTags,
  indexPathForTest: indexPathFor
}
