---
title: hexo-filter-nofollow插件中文文档
description: "为网站使用到的所有外链添加nofollow属性, 可以有效地加强网站SEO和防止权重流失"
categories: 转载
tags:
  - SEO
  - Hexo插件
  - 中文文档
abstract: "有东西被加密了, 请输入密码查看."
message: "您好, 这里需要密码."
theme: xray
wrong_pass_message: "抱歉, 这个密码看着不太对, 请再试试."
wrong_hash_message: "抱歉, 这个文章不能被校验, 不过您还是能看看解密后的内容."
abbrlink: d4ad
copyright: false
top_img: false
copyright_author: hexojs
copyright_author_href: "https://github.com/hexojs"
date: 2023-04-21 16:30:00
updated: 2023-04-21 16:30:00
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
copyright_url:
copyright_info:
highlight_shrink:
password:
---

## 声明

本文档由本人[机翻](https://translate.google.com/)自[hexo-filter-nofollow](https://github.com/hexojs/hexo-filter-nofollow)的官方文档，仅用于记录

> hexo-filter-nofollow 官方文档：https://github.com/hexojs/hexo-filter-nofollow

## hexo-filter-nofollow

为网站使用到的所有外链添加`rel="noopener external nofollow noreferrer"`, 可以有效地加强网站 SEO 和防止权重流失

自动为所有外部链接添加 nofollow 属性。

hexo-filter-nofollow 将 rel="noopener external nofollow noreferrer" 添加到所有外部链接以确保安全、隐私和 SEO。[阅读更多](https://developer.mozilla.org/en-US/docs/Web/HTML/Attributes/rel)。

## 安装

```bash
$ npm i hexo-filter-nofollow --save
```

## 配置

```yaml
nofollow:
  enable: true
  field: site
  exclude:
    - "exclude1.com"
    - "exclude2.com"
```

- **enable** - 启用插件。默认值为`true`
- **field** - 您希望插件添加的范围是`site`或`post`。 默认值为`site`
  - `post` - 仅将 nofollow 属性添加到帖子内容中的外部链接
  - `site` - 全站外链添加 nofollow 属性
- **exclude** - 排除主机名。在适用时指定子域，包括`www`
  - `exclude1.com`不适用于`www.exclude1.com`或`en.exclude1.com`
