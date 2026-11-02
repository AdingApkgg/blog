'use strict';

// 渲染期注入：让每个页面自己声明语言，并把三语版本互相对上。
//
// 为什么用 after_render:html 过滤器而不是改主题模板：
// - butterfly 把 <html lang> 写死在 layout.pug 里，且没有布局覆盖机制；
//   改 node_modules 会在下次升级主题时被冲掉。
// - 过滤器是 Hexo 官方扩展点，主题升级不受影响。
//
// 注入内容：
//   所有页面：搜索索引与 feed 链接按页面语言分流
//   文章页另加：<html lang> / og:locale、对称 hreflang、三语切换器
//
// hreflang 的规则（Google 官方要求，违反会被静默忽略）：
//   - 每个版本都必须列出自己以及所有其他版本
//   - 必须双向：A 指向 B，B 也必须指向 A
//   - 因此这里从同一份索引统一生成，绝不按文件手工拼

// 工具链在 tools/i18n/，不在 scripts/ —— Hexo 会递归加载 scripts/ 下所有文件，
// 把带副作用的 CLI 放那儿会在每次构建时被执行（详见 tools/i18n/README.md）。
const fs = require('fs');
const path = require('path');
const YAML = require('yamljs');

const langs = require('../tools/i18n/lib/langs');

// butterfly 输出的形式：<html lang="zh-CN" data-theme=...>
const HTML_LANG_RE = /(<html[^>]*\slang=")[^"]*(")/i;

let versionMap = null;
let uiStrings = null;

// 清掉缓存，保证每次 generate 都基于最新的文章集合与文案表。
hexo.on('generateBefore', function () {
  versionMap = null;
  uiStrings = null;
});

// 建立 Map<abbrlink, { zh?: {url, path}, ja?: {...}, en?: {...} }>
function buildVersionMap() {
  const map = new Map();

  let posts;
  try {
    posts = hexo.locals.get('posts');
  } catch (err) {
    return map;
  }
  if (!posts) return map;

  const list = typeof posts.toArray === 'function' ? posts.toArray() : posts;

  for (const post of list) {
    if (!post) continue;
    const raw = post.abbrlink;
    if (raw === undefined || raw === null || String(raw).trim() === '') continue;

    const key = String(raw).trim();
    // 中文源没有 lang 字段；有的话也归一化，防止 zh-CN 之类写法漏进来。
    const code = post.lang ? langs.normalize(post.lang) : langs.DEFAULT_LANG;

    if (!map.has(key)) map.set(key, {});
    map.get(key)[code] = {
      url: post.permalink,
      path: post.path
    };
  }

  return map;
}

function getVersionMap() {
  if (!versionMap) versionMap = buildVersionMap();
  return versionMap;
}

// 对称的 hreflang 链接组：顺序固定，中文在前的 x-default 兜底。
function hreflangBlock(versions) {
  const tags = [];

  for (const code of langs.ALL_LANGS) {
    const version = versions[code];
    if (!version) continue;
    tags.push(`<link rel="alternate" hreflang="${langs.htmlLang(code)}" href="${version.url}">`);
  }

  // x-default 给语言不匹配的访客，指向永远存在的中文源。
  const fallback = versions[langs.DEFAULT_LANG];
  if (fallback) {
    tags.push(`<link rel="alternate" hreflang="x-default" href="${fallback.url}">`);
  }

  return tags.join('\n');
}

// 三语切换器：当前语言高亮，缺译文的语言置灰不可点。
// 注意：不做任何自动跳转 —— Google 明确不推荐按浏览器语言重定向，
// 那会让爬虫和用户都看不到全部版本。
function switcherHtml(versions, current) {
  const items = langs.ALL_LANGS.map(function (code) {
    const label = langs.label(code);
    const version = versions[code];
    const hreflang = langs.htmlLang(code);

    if (code === current) {
      return version
        ? `<a class="is-active" href="${version.url}" hreflang="${hreflang}" aria-current="page">${label}</a>`
        : `<span class="is-active">${label}</span>`;
    }
    if (!version) {
      return `<span class="is-missing" aria-disabled="true">${label}</span>`;
    }
    return `<a href="${version.url}" hreflang="${hreflang}">${label}</a>`;
  });

  return `<nav class="i18n-switcher" aria-label="语言 / Language">${items.join('')}</nav>`;
}

// ---------------------------------------------------------------- 资源按语言分流

function searchFileFor(code) {
  return `search-${code}.json`;
}

function feedFileFor(code) {
  return `feed-${code}.xml`;
}

// butterfly 把本地搜索索引路径内联在全局配置里：
//   GLOBAL_CONFIG={root:"/",algolia:void 0,localSearch:{path:"/search.json",...}}
// 日文页若继续读中文索引，搜索框会搜出中文文章。
function rewriteSearchPath(html, code) {
  return html.replace(/(localSearch\s*:\s*\{[^}]*?path\s*:\s*")\/[^"]*(")/, function (match, head, tail) {
    return head + '/' + searchFileFor(code) + tail;
  });
}

// feed autodiscovery 默认指向全语言的 /atom.xml。/rss2.xml，改成当前语言的 feed。
// 只匹配 href 正好是这两个文件的标签，不会误伤 hreflang（那些是绝对 URL）。
function rewriteFeedLinks(html, code) {
  return html.replace(
    /(<link[^>]*\brel="alternate"[^>]*\bhref=")\/(?:atom|rss2)\.xml(")/gi,
    function (match, head, tail) {
      return head + '/' + feedFileFor(code) + tail;
    }
  );
}

// 主题按 front-matter 生成分类/标签链接，指向根级 /categories/<名字>/ 与 /tags/<名字>/。
// 译文的 front-matter 里已经是目标语言的名字，所以这里只要补语言前缀就正好对得上
// 分语言分类页；不补的话，日文文章页底部的分类链接会指向只存在中文分类的根级路径而 404。
// 匹配 href="/categories/ 这种站内绝对路径（当前 root 为 "/"），
// hreflang 那些是绝对 URL（https://…），不会被误伤。
function prefixTaxonomyLinks(html, code) {
  if (code === langs.DEFAULT_LANG) return html;
  const dir = langs.dirOf(code);
  if (!dir) return html;

  return html.replace(/(href=")\/(categories|tags)\//g, function (match, head, kind) {
    return head + '/' + dir + '/' + kind + '/';
  });
}

// 站内文章互链按语言分流。主题的侧边栏「最新文章」小部件读的是 site.posts
// （全语言混在一起），译文页面上会列出中文甚至英文文章，一点就跳到别的语言站；
// 正文里的站内引用同理。
//
// 三种形态都要归一：`/p/x/`（中文源）、`/ja/p/x/`、`/en/p/x/`。
// 目标文章有本语言译文就指向译文，没有就退回中文源（总比跳到第三种语言好）。
// 只改 href 属性，不碰正文文本：代码块里作为示例出现的 URL 不该被改写。
// hreflang 与切换器用的是绝对 URL（https://…），不会被这条规则匹配到。
function prefixPostLinks(html, code) {
  const dir = langs.dirOf(code);
  const pattern = new RegExp(
    '(href=")/(?:(?:' + langs.TARGET_LANGS.join('|') + ')/)?p/([^"/?#]+)/(?=["#?])',
    'g'
  );
  const map = getVersionMap();

  return html.replace(pattern, function (match, head, abbr) {
    const versions = map.get(abbr);
    if (dir && versions && versions[code]) return head + '/' + dir + '/p/' + abbr + '/';
    return head + '/p/' + abbr + '/';
  });
}

// ---------------------------------------------------------------- 界面文案

// 导航菜单文字来自 _config.butterfly.yml 的 menu 配置，是静态中文；
// 对照表放在 source/_data/ui-strings.yml，可以随时人工改。
// 只替换 butterfly 那两个特定 class 容器里的文字，文章正文完全不受影响。
function getUiStrings() {
  if (uiStrings) return uiStrings;
  try {
    const file = path.join(hexo.base_dir, 'source', '_data', 'ui-strings.yml');
    uiStrings = fs.existsSync(file) ? YAML.load(file) || {} : {};
  } catch (err) {
    hexo.log.warn('[i18n] 读取 ui-strings.yml 失败：%s', err.message);
    uiStrings = {};
  }
  return uiStrings;
}

// 带子菜单的项是 <span class="site-page group">，普通的项是 <a class="site-page" href="...">，
// 两种都要覆盖；属性顺序不固定，所以 class 前后都允许有其他属性。
const MENU_TEXT_RE = /(<[a-z]+[^>]*class="site-page[^"]*"[^>]*>[\s\S]{0,240}?<span>)([^<>]{1,14}?)(<\/span>)/g;
// <a href="/archives/"><div class="headline">文章</div>...
const SITE_DATA_TEXT_RE = /(<div class="headline">)([^<>]{1,14}?)(<\/div>)/g;

function localizeNav(html, code) {
  if (code === langs.DEFAULT_LANG) return html;

  const dict = getUiStrings()[code];
  if (!dict || !Object.keys(dict).length) return html;

  const swap = function (match, head, text, tail) {
    const key = text.trim();
    const value = dict[key];
    if (!value) return match;
    // 保留原文两端空白（菜单文字常写成 "<span> 文章</span>"）
    return head + text.replace(key, value) + tail;
  };

  return html.replace(MENU_TEXT_RE, swap).replace(SITE_DATA_TEXT_RE, swap);
}

// ---------------------------------------------------------------- 过滤器

hexo.extend.filter.register('after_render:html', function (html, data) {
  if (typeof html !== 'string') return html;

  const page = data && data.page;
  if (!page) return html;

  const current = page.lang ? langs.normalize(page.lang) : langs.DEFAULT_LANG;

  let out = html;

  // 资源分流对所有页面生效（首页、归档页、分类页也一样）。
  out = rewriteSearchPath(out, current);
  out = rewriteFeedLinks(out, current);
  out = prefixTaxonomyLinks(out, current);
  out = prefixPostLinks(out, current);
  out = localizeNav(out, current);

  if (out.indexOf('</head>') === -1) return out;

  // 语言声明只在页面确实带 lang 时改写，避免把首页从 zh-CN 动掉。
  if (page.lang) {
    out = out.replace(HTML_LANG_RE, `$1${langs.htmlLang(current)}$2`);
    out = out.replace(/<meta[^>]*og:locale[^>]*>/gi, function (tag) {
      if (!/content="/i.test(tag)) return tag;
      return tag.replace(/content="[^"]*"/i, `content="${langs.ogLocale(current)}"`);
    });
  }

  if (page.layout !== 'post') return out;

  const raw = page.abbrlink;
  const key = raw === undefined || raw === null ? null : String(raw).trim();

  const versions = key ? getVersionMap().get(key) : null;
  const available = versions ? Object.keys(versions).length : 0;

  // 只有真的存在多个语言版本时才声明 alternates 与切换器；
  // 单语言文章加 hreflang 没有意义，反而制造无效的链接组。
  if (versions && available >= 2) {
    out = out.replace('</head>', hreflangBlock(versions) + '\n</head>');
    if (out.indexOf('</body>') > -1) {
      out = out.replace('</body>', switcherHtml(versions, current) + '\n</body>');
    }
  }

  return out;
});

// ---------------------------------------------------------------- 清理

// 上游 hexo-generator-searchdb 会额外产出一份「全语言混合」的 search.json。
// 页面已被改写为按语言读取 search-<lang>.json，这份混合索引没有任何引用者，
// 留着只是白白多发约 4.7MB。构建完直接删掉。
//
// 时机很重要：**不能用 after_generate**。Hexo 的 _generate() 只刷新路由，
// 真正写盘发生在其后的 generate console（dist/plugins/console/generate.js 的
// firstGenerate），所以在 after_generate 里删掉的文件会被随后的写入重新建出来
// ——表现为「删除代码明明执行了，search.json 依然存在」（已踩过）。
// before_exit 在写盘结束后执行；再挂一个 process 退出钩子兜底，
// 保证无论 hexo-cli 以哪种方式收尾都能生效（unlinkSync 是同步的，退出钩子可用）。
function dropMixedSearchIndex() {
  const configured = (hexo.config && hexo.config.search && hexo.config.search.path) || 'search.json';
  const name = path.basename(String(configured));
  if (name.startsWith('search-')) return; // 配置已被改成按语言的路径，无需处理

  const target = path.join(hexo.public_dir || '', name);
  try {
    if (fs.existsSync(target)) {
      fs.unlinkSync(target);
      hexo.log.info('[i18n] 已删除全语言混合索引 %s（页面改用 search-<lang>.json）', name);
    }
  } catch (err) {
    hexo.log.warn('[i18n] 未能删除 %s：%s', name, err.message);
  }
}

hexo.extend.filter.register('before_exit', dropMixedSearchIndex);
process.on('exit', dropMixedSearchIndex);
