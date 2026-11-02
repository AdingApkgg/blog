---
title: hexo-generator-feed Plugin Chinese Documentation
description: Chinese documentation for the Hexo blog RSS feed generation plugin
keywords: Reference Manual, Hexo, Plugin
abbrlink: f65f
permalink: en/p/f65f/
lang: en
translation_of: _posts/2023-04-21-hexo-generator-feed插件中文文档.md
source_hash: 301446fa3a3f
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
date: 2023-04-21 17:00:00
updated: 2023-04-21 17:00:00
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

## Disclaimer

This document was translated by me [机翻](https://translate.google.com/) from the official documentation at [hexo-generator-feed](https://github.com/hexojs/hexo-generator-feed), and is kept here for reference only.

> hexo-generator-feed official documentation: https://github.com/hexojs/hexo-generator-feed

## hexo-generator-feeds

Generates Atom 1.0 or RSS 2.0 feeds for your blog.

## Installation

```bash
$ npm install hexo-generator-feed --save
```

Supported Hexo versions:

- Hexo 4+: 2.x
- Hexo 3: 1.x
- Hexo 2: 0.x

## Usage

In the [front-matter](https://hexo.io/docs/front-matter.html) section of a post, you can optionally add `description`, `intro`, or `excerpt` settings to write a summary for the post. Otherwise, the summary defaults to the excerpt or the first 140 characters of the post.

## Configuration

You can configure this plugin in Hexo's `_config.yml`.

```yaml
feed:
  enable: true
  type: atom
  path: atom.xml
  limit: 20
  hub:
  content:
  content_limit: 140
  content_limit_delim: " "
  order_by: -date
  icon: icon.png
  autodiscovery: true
  template:
```

- **enable** - Enable or disable this plugin. Enabled by default.

- **type** - Feed type. `atom` or `rss2`. Specify `['atom', 'rss2']` to output both types. (Default: `atom`)

  - Example:

  ```yaml
  feed:
    # Generate atom feed
    type: atom

    # Generate both atom and rss2 feeds
    type:
      - atom
      - rss2
    path:
      - atom.xml
      - rss2.xml
  ```

- **path** - Feed path. When two types are specified, the paths must follow the order of the type values. (Default: atom.xml/rss2.xml)

- **limit** - Maximum number of posts in the feed (use `0` or `false` to show all posts)

- **hub** - URL of the [PubSubHubbub](https://pubsubhubbub.appspot.com/) hub (leave it empty if you don't use it)

- **content** - (Optional) Set to `true` to include the full content of the post in the feed.

- **content_limit** - (Optional) Default number of characters of post content in the summary. Only used when content is set to `false` and no custom post description exists.

- **content_limit_delim** - (Optional) If content_limit is used to shorten post content, the cut is made only at the last occurrence of this delimiter before the character limit is reached. Not used by default.

- **order_by** - Order of the feed. (Default: -date)

- **icon** - (Optional) Custom feed icon. Defaults to the email avatar specified in the main config.

- **autodiscovery** - Adds feed [自动发现](https://www.rssboard.org/rss-autodiscovery). (Default: `true`)

  - Many themes already provide this feature, so if you want to disable it, you may also need to adjust the theme's configuration.

- **template** - Custom template path. This file will be used to generate the feed xml file; see the default templates: [atom.xml](https://github.com/hexojs/hexo-generator-feed/blob/master/atom.xml) and [rss2.xml](https://github.com/hexojs/hexo-generator-feed/blob/master/rss2.xml).

  - You can specify just one custom template even if this plugin is configured to output both feed types.

  ```yaml
  # (Optional) Exclude custom template from being copied into public/ folder
  # Alternatively, you could also prepend an underscore to its filename, e.g. _custom.xml
  # https://hexo.io/docs/configuration#Include-Exclude-Files-or-Folders
  exclude:
    - "custom.xml"
  feed:
    type:
      - atom
      - rss2
    template:
      - ./source/custom.xml
    # atom will be generated using custom.xml
    # rss2 will be generated using the default template instead
  ```