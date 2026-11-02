---
title: Chinese documentation for the hexo-filter-nofollow plugin
description: >-
  Add the nofollow attribute to all external links used on the website, which
  can effectively strengthen website SEO and prevent link equity loss
keywords: Reference manual, Hexo, plugin
abbrlink: d4ad
permalink: en/p/d4ad/
lang: en
translation_of: _posts/2023-04-21-hexo-filter-nofollow插件中文文档.md
source_hash: ab9eb4b51908
translator: ai
reviewed: false
categories:
  - Reference
tags:
  - Hexo
  - Plugins
abstract: 有东西被加密了, 请输入密码查看.
message: 您好, 这里需要密码.
theme: xray
wrong_pass_message: 抱歉, 这个密码看着不太对, 请再试试.
copyright: false
top_img: false
copyright_author: hexojs
copyright_author_href: https://github.com/hexojs
date: 2023-04-21 16:30:00
updated: 2023-04-21 16:30:00
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
copyright_url:
copyright_info:
highlight_shrink:
password:
---

## Notice

This document was translated by me from the official documentation [机翻](https://translate.google.com/)[hexo-filter-nofollow](https://github.com/hexojs/hexo-filter-nofollow) and is kept here purely as a record.

> hexo-filter-nofollow official documentation: https://github.com/hexojs/hexo-filter-nofollow

## hexo-filter-nofollow

Add `rel="noopener external nofollow noreferrer"` to every external link used on your site, which effectively strengthens SEO and prevents link equity from leaking away.

Automatically adds the nofollow attribute to all external links.

hexo-filter-nofollow adds `rel="noopener external nofollow noreferrer"` to all external links for security, privacy and SEO. [阅读更多](https://developer.mozilla.org/en-US/docs/Web/HTML/Attributes/rel).

## Installation

```bash
$ npm i hexo-filter-nofollow --save
```

## Configuration

```yaml
nofollow:
  enable: true
  field: site
  exclude:
    - "exclude1.com"
    - "exclude2.com"
```

- **enable** - Enables the plugin. The default value is `true`
- **field** - Whether you want the plugin to apply to `site` or `post`. The default value is `site`
  - `post` - Adds the nofollow attribute only to external links in post content
  - `site` - Adds the nofollow attribute to external links across the whole site
- **exclude** - Excludes hostnames. Specify the subdomain where applicable, including `www`
  - `exclude1.com` does not apply to `www.exclude1.com` or `en.exclude1.com`