---
title: Butterfly 主题 HTML5 音乐播放器 APlayer 美化调整
description: Butterfly 主题 HTML5 播放器 Aplayer 的美化与调整过程记录，顺便 debug
abstract: 有东西被加密了, 请输入密码查看.
message: 您好, 这里需要密码.
theme: xray
wrong_pass_message: 抱歉, 这个密码看着不太对, 请再试试.
abbrlink: 8dc9
top_img: false
categories:
  - Web Development
tags:
  - HTML5
  - Music Player
  - Butterfly Theme
  - APlayer
keywords: Web Development, HTML5, Music Player, Butterfly Theme, APlayer
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

## 前言

Butterfly 主题 HTML5 音乐播放器 APlayer 的使用与美化过程记录，顺便记下 debug 的过程，避免忘记 😆

本文着重 APlayer 的美化与调整，安装部分将会一笔带过，请移步至 Butterfly 主题的官方文档

> https://butterfly.js.org/posts/4073eda/#%E9%9F%B3%E6%A8%82

## Butterfly 添加全局吸底 APlayer

### 卸载 hexo-tag-aplayer 插件

在 `Hexo` 站点根目录执行以下卸载 `hexo-tag-aplayer` 命令，使用 CDN 的方式引入

```sh
npm un hexo-tag-aplayer
```

### CDN 引入 APlayer 播放器

打开 Butterfly 主题配置文件 `_config.butterfly.yml`，进行以下修改..

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

然后不出意外的话，应该就添加上了全局吸底的 APlayer 了。

## 美化与调整

### 昼夜美化适配

可根据自身的审美需求自行更改 `CSS` 代码从而达到想要的效果，

在 `[Blogroot]\themes\butterfly\source\css\custom.css` 中添加如下内容：

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

> 改进自 https://snowtafir.top/posts/2022hb2d.html

### 歌词默认隐藏

添加进 `.js` 文件，在需要用到的页面加载此文件即可

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

> 转载自 https://github.com/metowolf/MetingJS/issues/23#issuecomment-1827189312

### 全局吸底伸缩

> 手机默认隐藏，电脑默认不隐藏

在 `[Blogroot]\themes\butterfly\source\css\custom.css` 中添加如下内容：

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

个人感觉宽屏隐藏起来有点违和了，所以在 `店长` 的基础上改进了下...

> 改进自 https://akilar.top/posts/ebf20e02/
