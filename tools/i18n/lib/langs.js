'use strict';

// 语言常量与各处的取值映射。
// 站点主语言是中文：中文页没有语言目录前缀，日英页在 URL 上带 /ja/、/en/。
// 详见 ../README.md 的「决策」与「front-matter 契约」。

const DEFAULT_LANG = 'zh';

// order 决定语言切换器里的排列顺序，也决定 hreflang 的输出顺序。
const LANGS = {
  zh: {
    code: 'zh',
    order: 0,
    dir: '', // 中文保持原路径，无目录前缀
    htmlLang: 'zh-CN',
    ogLocale: 'zh_CN',
    label: '中文',
    isDefault: true
  },
  ja: {
    code: 'ja',
    order: 1,
    dir: 'ja',
    htmlLang: 'ja',
    ogLocale: 'ja_JP',
    label: '日本語',
    isDefault: false
  },
  en: {
    code: 'en',
    order: 2,
    dir: 'en',
    htmlLang: 'en',
    ogLocale: 'en_US',
    label: 'English',
    isDefault: false
  }
};

// 可翻译语言（不含默认语言本身）。
const TARGET_LANGS = Object.keys(LANGS)
  .filter((code) => !LANGS[code].isDefault)
  .sort((a, b) => LANGS[a].order - LANGS[b].order);

const ALL_LANGS = Object.keys(LANGS).sort((a, b) => LANGS[a].order - LANGS[b].order);

function isTargetLang(code) {
  return TARGET_LANGS.includes(code);
}

// 把页面上的各种语言写法归一成内部两字母码。
// 例：zh-CN / zh-Hans / zh → zh；ja-JP → ja；en-US → en。
function normalize(input) {
  if (!input) return DEFAULT_LANG;
  const raw = String(input).trim().toLowerCase();
  const two = raw.split(/[-_]/)[0];
  if (LANGS[two]) return two;
  return DEFAULT_LANG;
}

// 页面 HTML 的 <html lang> 与 og:locale 取值。
function htmlLang(code) {
  return (LANGS[normalize(code)] || LANGS[DEFAULT_LANG]).htmlLang;
}

function ogLocale(code) {
  return (LANGS[normalize(code)] || LANGS[DEFAULT_LANG]).ogLocale;
}

function label(code) {
  return (LANGS[normalize(code)] || LANGS[DEFAULT_LANG]).label;
}

// 该语言在 source/_posts 下的子目录名；中文返回 ''。
function dirOf(code) {
  return (LANGS[normalize(code)] || LANGS[DEFAULT_LANG]).dir;
}

module.exports = {
  DEFAULT_LANG,
  LANGS,
  ALL_LANGS,
  TARGET_LANGS,
  isTargetLang,
  normalize,
  htmlLang,
  ogLocale,
  label,
  dirOf
};
