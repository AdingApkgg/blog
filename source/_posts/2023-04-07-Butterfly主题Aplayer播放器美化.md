---
title: Butterfly 主题 Aplayer 播放器美化调整
description: "Butterfly主题Aplayer播放器的美化与调整过程记录，顺便debug\U0001F606"
categories: 技术
tags:
  - Aplayer
  - Butterfly
abstract: "有东西被加密了, 请输入密码查看."
message: "您好, 这里需要密码."
theme: xray
wrong_pass_message: "抱歉, 这个密码看着不太对, 请再试试."
wrong_hash_message: "抱歉, 这个文章不能被校验, 不过您还是能看看解密后的内容."
abbrlink: 8dc9
top_img: false
date: 2023-04-08 00:00:00
updated: 2023-08-08 02:40:00
cover:
type:
comments:
keywords:
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

Butterfly 主题的 Aplayer 播放器的使用与美化过程记录，顺便记下 debug 的过程，避免忘记 😆

本文主旨：着重 Aplayer 的美化与调整，安装部分将会一笔带过，请移步至 Butterfly 主题的官方文档[安装 Aplayer 播放器](https://butterfly.js.org/posts/4073eda/#%E9%9F%B3%E6%A8%82)

## Butterfly 添加全局吸底 Aplayer

### 卸载 hexo-tag-aplayer 插件

在`Hexo`站点根目录执行以下卸载`hexo-tag-aplayer`命令，使用 CDN 的方式引入

```sh
npm un hexo-tag-aplayer
```

### CDN 引入 Aplayer 播放器

打开 Butterfly 主题配置文件`_config.butterfly.yml`，进行以下修改...

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
    - <div class="aplayer no-destroy" data-id="8932390" data-server="netease" data-type="playlist" data-fixed="true" data-autoplay="true" data-order="random" data-volume="0.3" data-mutex="true" data-listMaxHeight="36vh"> </div>

# CDN
# Don't modify the following settings unless you know how they work
# 非必要請不要修改
CDN:
  option:
    aplayer_css: https://npm.elemecdn.com/aplayer/dist/APlayer.min.css
    aplayer_js: https://npm.elemecdn.com/aplayer/dist/APlayer.min.js
    meting_js: https://npm.elemecdn.com/meting/dist/Meting.min.js
```

然后不出意外的话，应该就添加上了全局吸底的 Aplayer 了。

## 美化与调整

### 昼夜美化适配

可根据自身的审美需求自行更改`CSS`代码从而达到想要的效果，

在`[Blogroot]\themes\butterfly\source\css\custom.css`中添加如下内容：

```css
/* Aplayer日间模式调整 */
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

/* Aplayer黑暗模式 */
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

> 转载改进自[杉星雪の小屋](https://snowtafir.top/)：https://snowtafir.top/posts/2022hb2d.html

### 歌词默认隐藏

添加进`.js`文件，在需要用到的页面加载此文件即可

{% tabs 歌词默认隐藏, 1 %}

<!-- tab 新版（推荐） -->

```javascript
// Aplayer默认关闭歌词
function removelrc() {
  // 检测是否存在歌词按钮
  const lrcIcon = document.querySelector(".aplayer-icon-lrc");
  if (!lrcIcon) {
    return;
  }

  // 触发以后立刻移除监听
  observer.disconnect();

  // 稍作延时保证触发函数时存在按钮
  setTimeout(() => {
    // 以触发按钮的方式隐藏歌词，防止在点击显示歌词按钮时需要点击两次才能出现的问题
    lrcIcon.click();
  }, 1);

  console.log("success");
}

const observer = new MutationObserver((mutationsList, observer) => {
  for (let mutation of mutationsList) {
    if (mutation.type === "childList") {
      removelrc();
    }
  }
});

const observerConfig = {
  childList: true, // 观察子节点的变化
  subtree: true, // 观察所有后代节点的变化
};

observer.observe(document, observerConfig); // 开始观察document节点的变化
```

<!-- endtab -->

<!-- tab 旧版（兼容） -->

```javascript
// Aplayer默认关闭歌词
function removelrc() {
  //检测是否存在歌词按钮
  if (!document.querySelector(".aplayer-icon-lrc")) return;
  else {
    //触发以后立刻移除监听
    document.removeEventListener("DOMNodeInserted", removelrc);
    //稍作延时保证触发函数时存在按钮
    setTimeout(function () {
      //以触发按钮的方式隐藏歌词，防止在点击显示歌词按钮时需要点击两次才能出现的问题
      document.querySelector(".aplayer-icon-lrc").click();
    }, 1);
    console.log("success");
    return;
  }
}

document.addEventListener("DOMNodeInserted", removelrc);
```

> 转载自 GitHub[kcn3388](https://github.com/kcn3388)：https://github.com/metowolf/MetingJS/issues/23#issuecomment-826667754

<!-- endtab -->

{% endtabs %}

### 全局吸底伸缩

在`[Blogroot]\themes\butterfly\source\css\custom.css`中添加如下内容：

{% tabs 全局吸底伸缩, 1 %}

<!-- tab 改进版（推荐） -->

> 手机默认隐藏，电脑默认不隐藏

个人感觉电脑隐藏起来有点违和了，所以在`店长`的基础上改进了下...

```css
/* Width的值可根据喜好调整（屏幕的宽度） */
@media (max-width: 960px) {
  /* Aplayer音乐标签伸缩 */
  .aplayer.aplayer-fixed.aplayer-narrow .aplayer-body {
    left: -66px !important;
    /* 默认情况下缩进左侧66px，只留一点箭头部分 */
  }

  .aplayer.aplayer-fixed.aplayer-narrow .aplayer-body:hover {
    left: 0 !important;
    /* 鼠标悬停是左侧缩进归零，完全显示按钮 */
  }
}
```

<!-- endtab -->

<!-- tab 原版（店长） -->

> 手机电脑默认都隐藏

```css
.aplayer.aplayer-fixed.aplayer-narrow .aplayer-body {
  left: -66px !important;
  /* 默认情况下缩进左侧66px，只留一点箭头部分 */
}

.aplayer.aplayer-fixed.aplayer-narrow .aplayer-body:hover {
  left: 0 !important;
  /* 鼠标悬停是左侧缩进归零，完全显示按钮 */
}
```

> 转载自[Akilar の糖果屋](https://akilar.top/)：https://akilar.top/posts/ebf20e02/

<!-- endtab -->

{% endtabs %}
