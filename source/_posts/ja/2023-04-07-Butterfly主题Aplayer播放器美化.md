---
title: Butterfly テーマ HTML5 音楽プレーヤー APlayer 美化調整
description: Butterfly テーマの HTML5 プレーヤー APlayer を美化・調整した過程の記録、ついでにデバッグ
keywords: フロントエンドとテーマ, Butterfly, APlayer, CSS
abbrlink: 8dc9
permalink: ja/p/8dc9/
lang: ja
translation_of: _posts/2023-04-07-Butterfly主题Aplayer播放器美化.md
source_hash: 0d1c8321e18f
translator: ai
reviewed: false
categories:
  - 技術開発
  - フロントエンドとテーマ
tags:
  - Butterfly
  - APlayer
  - CSS
abstract: 有东西被加密了, 请输入密码查看.
message: 您好, 这里需要密码.
theme: xray
wrong_pass_message: 抱歉, 这个密码看着不太对, 请再试试.
top_img: false
date: 2023-04-08 00:00:00
updated: 2025-02-10 06:14:20
cover:
type:
comments:
sticky:
mathjax:
katex:
aside:
aplayer:
toc:
toc_number:
toc_style_simple:
copyright:
copyright_author:
copyright_author_href:
copyright_url:
copyright_info:
highlight_shrink:
password:
---

## 前書き

Butterfly テーマの HTML5 音楽プレイヤー APlayer の使用と美化の過程を記録し、ついでにデバッグの過程も書き留めて忘れないようにします 😆

本記事は APlayer の美化と調整に重点を置き、インストール部分は軽く触れるだけにします。詳しくは Butterfly テーマの公式ドキュメントをご参照ください。

> https://butterfly.js.org/posts/4073eda/#%E9%9F%B3%E6%A8%82

## Butterfly にグローバル固定ボトム APlayer を追加

### hexo-tag-aplayer プラグインのアンインストール

`Hexo` のサイトルートディレクトリで以下の `hexo-tag-aplayer` アンインストールコマンドを実行し、CDN で導入する方式にします。

```sh
npm un hexo-tag-aplayer
```

### CDN で APlayer プレイヤーを導入

Butterfly テーマの設定ファイル `_config.butterfly.yml` を開き、以下のように変更します..

```yaml
# Inject the css and script (aplayer/meting)
aplayerInject:
  enable: true
  per_page: true

# Inject
# Insert the code to head (before '</head>' tag) and the bottom (before '</body>' tag)
# 插入代码到头部 </head> 之前 和 底部 </body> 之前
inject:
  bottom:
    - <meting-js class="no-destroy" id="8932390" server="netease" type="playlist" fixed="true" autoplay="true" order="random" volume="0.3" list-folded="false" list-max-height="36vh"> </meting-js>

# CDN
# Don't modify the following settings unless you know how they work
# 非必要請不要修改
CDN:
  option:
    aplayer_css: https://npm.elemecdn.com/aplayer/dist/APlayer.min.css
    aplayer_js: https://npm.elemecdn.com/aplayer/dist/APlayer.min.js
    meting_js: https://npm.elemecdn.com/meting/dist/Meting.min.js
```

これで特に問題がなければ、グローバル固定ボトムの APlayer が追加されているはずです。

## 美化と調整

### 昼夜の美化対応

ご自身の美的感覚に合わせて `CSS` のコードを自由に変更し、望む効果を得ることができます。

`[Blogroot]\themes\butterfly\source\css\custom.css` に以下の内容を追加します：

```css
/* APlayer 日间模式调整 */
/* 背景色 */
.aplayer {
  background: rgba(255, 255, 255, 0.6) !important;
  box-shadow: 0 2px 2px 0 rgba(0, 0, 0, 0.07), 0 1px 5px 0 rgba(0, 0, 0, 0.1);
  position: relative;
}

.aplayer.aplayer-fixed .aplayer-lrc:after,
.aplayer.aplayer-fixed .aplayer-lrc:before {
  display: none;
}

.aplayer.aplayer.aplayer-fixed .aplayer-body {
  background: rgba(255, 255, 255, 0.6) !important;
  box-shadow: 0 2px 2px 0 rgba(0, 0, 0, 0.07), 0 1px 5px 0 rgba(0, 0, 0, 0.1);
  position: fixed;
}

/* 滚动条 */
.aplayer .aplayer-list ol::-webkit-scrollbar {
  width: 5px;
}

.aplayer .aplayer-list ol::-webkit-scrollbar-thumb {
  border-radius: 3px;
  background-color: var(--theme-color) !important;
}

.aplayer .aplayer-list ol::-webkit-scrollbar-thumb:hover {
  background-color: var(--theme-color) !important;
}

/* 圆角 */
.aplayer.aplayer-fixed .aplayer-list {
  border-radius: 6px 6px 0 0 !important;
}

.aplayer.aplayer-fixed .aplayer-miniswitcher {
  border-radius: 0 6px 6px 0 !important;
}

.aplayer.aplayer-fixed.aplayer-narrow .aplayer-body {
  transition: 0.28s !important;
  border-radius: 6px !important;
}

/* 选中与播放中歌曲激活颜色 */
.aplayer .aplayer-list ol li:hover {
  background: var(--theme-color) !important;
}

.aplayer .aplayer-list ol li.aplayer-list-light {
  background: var(--theme-color) !important;
}

/* 歌词 */
.aplayer-lrc p {
  color: #ffffff !important;
  text-shadow: #000000 1px 0 0, #000000 0 1px 0, #000000 -1px 0 0, #000000
      0 -1px 0 !important;
}

/* APlayer 黑暗模式 */
[data-theme="dark"] .aplayer {
  background: rgba(22, 22, 22, 0.6) !important;
  color: rgb(255, 255, 255);
  box-shadow: 0 2px 2px 0 rgba(0, 0, 0, 0.07), 0 1px 5px 0 rgba(0, 0, 0, 0.1);
}

[data-theme="dark"] .aplayer.aplayer-fixed .aplayer-body {
  background: rgba(22, 22, 22, 0.6) !important;
  color: rgb(255, 255, 255);
  box-shadow: 0 2px 2px 0 rgba(0, 0, 0, 0.07), 0 1px 5px 0 rgba(0, 0, 0, 0.1);
}

[data-theme="dark"]
  .aplayer
  .aplayer-info
  .aplayer-controller
  .aplayer-time
  .aplayer-icon
  path {
  fill: #d4d4d4;
}

[data-theme="dark"] .aplayer .aplayer-list ol li:hover {
  background: var(--theme-color) !important;
}

[data-theme="dark"] .aplayer .aplayer-list ol li.aplayer-list-light {
  background: var(--theme-color) !important;
}

[data-theme="dark"] .aplayer .aplayer-info .aplayer-controller .aplayer-time {
  color: #d4d4d4;
}

[data-theme="dark"] .aplayer .aplayer-list ol li .aplayer-list-index {
  color: #d4d4d4;
}

[data-theme="dark"] .aplayer .aplayer-list ol li .aplayer-list-author {
  color: #d4d4d4;
}
```

> https://snowtafir.top/posts/2022hb2d.html を基に改良

### 歌詞をデフォルトで非表示に

`.js` ファイルに追加し、必要なページでこのファイルを読み込むだけで完了です。

```javascript
// APlayer 默认关闭歌词
// 创建一个 MutationObserver 实例，用于监听 DOM 的变化
var observer = new MutationObserver(function (mutations) {
  // 查找页面中 class 为 "aplayer-icon-lrc" 的元素
  var lrcButton = document.querySelector(".aplayer-icon-lrc");
  // 如果找到了 lrcButton
  if (lrcButton) {
    // 延迟1毫秒执行点击操作
    setTimeout(function () {
      lrcButton.click();
    }, 1);
    // 断开 MutationObserver 实例，停止监听 DOM 的变化
    observer.disconnect();
  }
});
```

> https://github.com/metowolf/MetingJS/issues/23#issuecomment-1827189312 より転載

### グローバル固定ボトムの伸縮

> スマホではデフォルトで非表示、PC ではデフォルトで非表示にしない

`[Blogroot]\themes\butterfly\source\css\custom.css` に以下の内容を追加します：

```css
/* Width 的值可根据喜好调整（屏幕的宽度） */
@media (max-width: 960px) {
  /* APlayer 音乐标签伸缩 */
  .aplayer.aplayer-fixed.aplayer-narrow .aplayer-body {
    left: -66px !important;
    /* 默认情况下缩进左侧 66px，只留一点箭头部分 */
  }

  .aplayer.aplayer-fixed.aplayer-narrow .aplayer-body:hover {
    left: 0 !important;
    /* 鼠标悬停是左侧缩进归零，完全显示按钮 */
  }
}
```

個人的にはワイドスクリーンで隠れると少し違和感があるので、`店长` をベースに少し改良しました...

> https://akilar.top/posts/ebf20e02/ を基に改良