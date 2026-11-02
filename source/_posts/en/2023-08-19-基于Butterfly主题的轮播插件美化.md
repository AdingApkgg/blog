---
title: Carousel Plugin Beautification Based on the Butterfly Theme
description: >-
  A SwiperBar carousel plugin based on the Butterfly theme; a record of
  beautification and fine-tuning for the pinned-posts scrolling bar
keywords: Frontend and Themes, Butterfly, CSS
abbrlink: 4d82
permalink: en/p/4d82/
lang: en
translation_of: _posts/2023-08-19-基于Butterfly主题的轮播插件美化.md
source_hash: 77eee15d1654
translator: ai
reviewed: false
categories:
  - Tech Development
  - Frontend & Themes
tags:
  - Butterfly
  - CSS
abstract: 有东西被加密了, 请输入密码查看.
message: 您好, 这里需要密码.
theme: xray
wrong_pass_message: 抱歉, 这个密码看着不太对, 请再试试.（提示：某个词的罗马音）
top_img: false
cover: /img/202308192202623.webp
date: 2023-08-19 22:00:00
updated: 2023-08-19 22:00:00
password:
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
---

> For the plugin installation guide, please refer to this article by 店长: [Swiper Bar](https://akilar.top/posts/8e1264d1/)

Before making any beautification tweaks, make sure your blog is running on the [Hexo](https://hexo.io/zh-cn/) framework with the [Butterfly](https://butterfly.js.org/) theme; other frameworks or themes may not work.

## Adding the Style Code

Add the following style code to your custom CSS file:

```css
/* 文章置顶滚动栏(店长) */
.blog-slider {
  height: 260px !important;
}

.blog-slider__img {
  width: 40% !important;
  height: 100% !important;
}

@media screen and (max-width: 600px) {
  .blog-slider {
    padding: 0 !important;
  }

  .blog-slider__img {
    width: 100% !important;
    height: 40% !important;
    padding-left: 0 !important;
    padding-right: 0 !important;
  }
}
```

What this code does is change the post cover images on desktop from squares into rectangles, while on mobile they now fill the full width from edge to edge, which looks much easier on the eye.

You can keep adding your own styles either to the existing elements above, or by pressing <kbd>F12</kbd> and using `开发者工具` to locate the `ID` of the corresponding element.

## Before and After

### Desktop

![调整前](/img/202308192155353.webp)

![调整后](/img/202308192155352.webp)

### Mobile

![调整前](/img/202308192155354.webp)

![调整后](/img/202308192155350.webp)

## Credits

> [Akilarの糖果屋](https://akilar.top/): [SwiperBar](https://akilar.top/posts/8e1264d1/)