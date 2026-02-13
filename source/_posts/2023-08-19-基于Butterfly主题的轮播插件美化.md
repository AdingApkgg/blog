---
title: 基于 Butterfly 主题的轮播插件美化
description: 基于 Butterfly 主题的 SwiperBar 轮播插件，文章置顶滚动栏美化微调记录
abstract: 有东西被加密了, 请输入密码查看.
message: 您好, 这里需要密码.
theme: xray
wrong_pass_message: 抱歉, 这个密码看着不太对, 请再试试.（提示：某个词的罗马音）
wrong_hash_message: 抱歉, 这个文章不能被校验, 不过您还是能看看解密后的内容.
abbrlink: 4d82
top_img: false
cover: /img/202308192202623.webp
categories:
  - Web Development
tags:
  - Hexo
  - Butterfly Theme
  - CSS
  - Swiper Bar
keywords: Web Development, Hexo, Butterfly Theme, CSS, Swiper Bar
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

> 插件的安装教程请参照店长这篇文章：[Swiper Bar](https://akilar.top/posts/8e1264d1/)

进行美化微调之前请确保你的博客使用的是[Hexo](https://hexo.io/zh-cn/)框架[Butterfly](https://butterfly.js.org/)主题，如果其他框架或主题可能并不适用

## 添加样式代码

往你的自定义 CSS 文件中添加以下样式代码：

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

以上代码作用是将电脑端的文章封面图片从原先正方形调整成长方形，移动端则变成覆盖满左右边框，显得更加顺眼，

可在以上已有元素中或自行 <kbd>F12</kbd> 打开使用 `开发者工具` 寻找对应元素的 `ID` 继续添加自己喜欢的样式代码

## 前后预览

### 电脑端

![调整前](/img/202308192155353.webp)

![调整后](/img/202308192155352.webp)

### 移动端

![调整前](/img/202308192155354.webp)

![调整后](/img/202308192155350.webp)

## 鸣谢

> [Akilarの糖果屋](https://akilar.top/)：[SwiperBar](https://akilar.top/posts/8e1264d1/)
