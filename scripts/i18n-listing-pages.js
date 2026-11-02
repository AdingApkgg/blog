'use strict';

// 分语言的首页与归档页（zh / ja / en）。
//
// 问题：默认的 hexo-generator-index 与 hexo-generator-archive 会把「全站所有文章」
// 塞进同一份 locals.posts，于是中文首页混着日英译文，而 /ja/、/en/ 首页根本不存在。
//
// 做法：注册同名的 index / archive generator 覆盖插件，按语言各生成一套。
// 关键约束是「中文页逐字节不变」——92 篇中文文章是唯一人工维护的源，URL、排序被
// 外链 / 搜索引擎索引 / sitemap 依赖。因此：
//   - 首页直接复用 hexo-pagination（插件自己用的就是它），入参与插件逐项对齐，
//     只是把 path 换成带语言前缀的；zh 的 dir 是 ''，所以结果与原插件完全相同。
//   - 归档页逻辑较复杂（按年 / 月 / 日再切子集合），不做重写，改为委托插件原函数，
//     拿到原始路径后只在前面补语言目录；zh 分支返回原字符串。
//   - lang 只在 ja / en 页注入；中文页不注入，供 scripts/i18n-render.js 改写 <html lang>。
//
// 契约：中文源没有 lang 字段（视为 zh），译文必带 lang: ja|en。
// 实测 source/_posts/ja、source/_posts/en 下全部译文都带 lang，故只认 lang 字段，
// 不按 source 路径前缀兜底（路径兜底会让「漏加 lang 的译文」静默落进中文列表）。
//
// 只负责首页 / 归档页；分类页与标签页见 scripts/i18n-taxonomy-pages.js。

const pagination = require('hexo-pagination');

const langs = require('../tools/i18n/lib/langs');

const generator = hexo.extend.generator;

// ---------------------------------------------------------------- 幂等保护

// 本模块只能生效一次。
// 为什么需要：这个文件若被加载两次（Hexo autoload 一次 + 测试脚本再 require 一次，
// Node 按不同解析路径会当成两个模块），第二份会把第一份注册的包装函数当成「原函数」
// 再包一层，两层语言循环互相调用，产出 'ja/ja/ja/archives/' 这种无限前缀（已踩过）。
const MODULE_ID = 'i18n-listing-pages';

// 插件原函数在实例上只捕获一次，之后永远复用这一份。
// 这是第二道防线：即使标记被清掉、文件被再求值一次（真的踩到过两次），
// 拿到的仍是「没有包装过的插件原函数」，不可能出现包装套包装，语言前缀最多加一层。
const ORIGINALS = '__i18nListingOriginals';

if (hexo[MODULE_ID]) {
  hexo.log.warn('[i18n-listing] 已加载过，跳过重复注册（第二次来自 %s）', __filename);
} else {
  Object.defineProperty(hexo, MODULE_ID, { value: true, configurable: true });
  registerGenerators();
}

// ---------------------------------------------------------------- 注册

function registerGenerators() {
  // Hexo 先加载 node_modules 里的插件、再加载 scripts/，所以这里取到的就是插件的原函数
  // （已用 `hexo.load()` 在本仓库实测确认加载顺序）。
  if (!hexo[ORIGINALS]) {
    Object.defineProperty(hexo, ORIGINALS, {
      configurable: true,
      value: {
        index: generator.get('index'),
        archive: generator.get('archive')
      }
    });
  }
  const { index: originalIndex, archive: originalArchive } = hexo[ORIGINALS];
  const hasOriginalIndex = typeof originalIndex === 'function';
  const hasOriginalArchive = typeof originalArchive === 'function';

  // 取不到原函数时只警告并跳过该 generator：宁可少生成日英列表，也不能让构建挂掉。
  if (!hasOriginalIndex) {
    hexo.log.warn('[i18n-listing] 未找到 hexo-generator-index 的 index generator，跳过分语言首页');
  }
  if (!hasOriginalArchive) {
    hexo.log.warn('[i18n-listing] 未找到 hexo-generator-archive 的 archive generator，跳过分语言归档页');
  }

  // 同名覆盖插件的 generator；zh 在前，输出顺序与改动前一致（多出来的只有 ja/en 的页）。
  if (hasOriginalIndex) {
    generator.register('index', function (locals) {
      // 首页每条语言各自走一遍与插件相同的入参；zh 的 dir 为空，产物与原插件一致。
      return langs.ALL_LANGS.reduce(
        (pages, code) => pages.concat(indexPages.call(this, locals, code)),
        []
      );
    });
  }

  if (hasOriginalArchive) {
    generator.register('archive', function (locals) {
      // 被 bluebird 包装过的原 generator 一定返回 Promise，必须 await；
      // 逐语言并发后再展平。Hexo 的 generator 允许返回 Promise。
      return Promise.all(
        langs.ALL_LANGS.map((code) => archivePages(originalArchive, locals, code, this))
      ).then((perLang) => [].concat(...perLang));
    });
  }
}

// ---------------------------------------------------------------- 基础设施

// 语言判定：只有 lang 为 ja / en 的算译文，其余（含没写 lang 的中文源）都是 zh。
// 走 langs.normalize 是为了容忍 zh-CN / ja-JP 之类写法，而不是去猜语言。
function postLang(post) {
  return post.lang ? langs.normalize(post.lang) : langs.DEFAULT_LANG;
}

function postsOfLang(posts, code) {
  return posts.filter((post) => postLang(post) === code);
}

// 语言目录前缀 -> hexo-pagination 的 base。zh 的 dir 是 ''，返回 ''（root 路径不变）。
function baseOf(code) {
  const dir = langs.dirOf(code);
  return dir ? dir + '/' : '';
}

// 把插件产出的归档路径挂到语言目录下：'archives/2024/03/' -> 'ja/archives/2024/03/'。
// 插件返回的 path 有时带前导斜杠（首位页面 'archives/'，年 / 月页 '/archives/2023/'），
// 统一按「直接拼前缀 + 折叠连续斜杠」处理，两种形态都能得到干净结果。
// zh 的 dir 是 ''，这里直接返回原字符串，一个字节都不动。
function localizeArchivePath(path, code) {
  const langDir = langs.dirOf(code);
  if (!langDir) return path;
  return (langDir + '/' + path).replace(/\/{2,}/g, '/');
}

// 中文页不注入 lang：butterfly 的 layout.pug 里写死 <html lang="zh-CN">，
// 注入与否必须与改动前一致。日英页注入 lang，供 i18n-render.js 改写 <html lang> / og:locale。
function langData(code) {
  return code === langs.DEFAULT_LANG ? {} : { lang: code };
}

// ---------------------------------------------------------------- 首页

// 与 hexo-generator-index/lib/generator.js 逐项对齐：
//   order_by（本站 -updated）排序 -> 首页按 sticky 置顶 -> per_page 分页。
// 三处差异仅有：只喂本语言 posts、path 带语言前缀、日英页 data 多一个 lang。
// 走同一个 hexo-pagination，所以 base/total/current/current_url/posts/prev/prev_link/
// next/next_link + __index 这些主题消费的键一个不多一个不少。
function indexPages(locals, code) {
  const config = this.config;

  // 顺序必须和插件一致：先按 index_generator.order_by 排序，再切语言、再按 sticky 置顶。
  // 反过来（先 filter 后 sort）会把 order_by 丢掉，首页会退回文章原始顺序 —— 已踩过。
  const ordered = locals.posts.sort(config.index_generator.order_by);
  const posts = postsOfLang(ordered, code);

  // 该语言一篇文章都没有就跳过：不产出 /ja/，避免一个只有骨架的空列表页被索引。
  // 中文不会走到这里（没有任何中文文章时插件自己也不产出首页）。
  if (!posts.length) return [];

  posts.data.sort((a, b) => (b.sticky || 0) - (a.sticky || 0));

  const path = (config.index_generator.path || '') + baseOf(code);
  const paginationDir =
    config.index_generator.pagination_dir || config.pagination_dir || 'page';

  return pagination(path, posts, {
    perPage: config.index_generator.per_page,
    layout: config.index_generator.layout || ['index', 'archive'],
    format: paginationDir + '/%d/',
    data: Object.assign({ __index: true }, langData(code))
  });
}

// ---------------------------------------------------------------- 归档页

// 委托插件原函数，只喂本语言 posts；返回后再把路径挂到语言目录下，并把 lang 合进 page.data。
//
// 为什么不改 config.archive_dir 再调插件：
// 插件在内部读 this.config.archive_dir，而 bluebird.method 包装会把 this 重新绑定，
// 「临时改 config」会静默失效（踩过：产出 archives/ja//ja/ 这种双前缀路径）。
// 所以改成拿到原始路径后自己重定位，同时保证 zh 分支一字节不动。
//
// 另注意：原 generator 被 bluebird.method 包装后一定返回 Promise，必须 await，
// 不能当数组直接用 .length / .map（踩过：拿到 Promise 当数组，归档页全部丢失）。
async function archivePages(originalArchive, locals, code, context) {
  const config = (context && context.config) || hexo.config;
  const posts = postsOfLang(locals.posts, code);

  // 与插件一致：一篇文章都没有就不产出归档页。
  if (!posts.length) return [];

  const extra = langData(code);

  const result = await originalArchive.call(context, Object.assign({}, locals, { posts }));

  if (!result || !result.length) return [];

  // 中文页：dir === '' -> 路径原样返回；extra 为空 -> data 等值复制。产物逐字节不变。
  return result.map((page) => Object.assign({}, page, {
    path: localizeArchivePath(page.path, code),
    data: Object.assign({}, page.data, extra)
  }));
}
