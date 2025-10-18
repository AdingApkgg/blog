---
title: hexo-generator-feed插件中文文档
description: Hexo博客RSS订阅文件生成的插件中文文档
categories: 转载
tags:
  - 框架
  - 插件
  - 文档
abstract: "有东西被加密了, 请输入密码查看."
message: "您好, 这里需要密码."
theme: xray
wrong_pass_message: "抱歉, 这个密码看着不太对, 请再试试."
wrong_hash_message: "抱歉, 这个文章不能被校验, 不过您还是能看看解密后的内容."
abbrlink: f65f
copyright: false
top_img: false
copyright_author: hexojs
copyright_author_href: "https://github.com/hexojs"
date: 2023-04-21 17:00:00
updated: 2023-04-21 17:00:00
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

本文档由本人[机翻](https://translate.google.com/)自[hexo-generator-feed](https://github.com/hexojs/hexo-generator-feed)的官方文档，仅用于记录

> hexo-generator-feed 官方文档：https://github.com/hexojs/hexo-generator-feed

## hexo-generator-feeds

生成 Atom 1.0 或 RSS 2.0 博客信息馈送

## 安装

```bash
$ npm install hexo-generator-feed --save
```

支持 Hexo 版本：

- Hexo 4+: 2.x
- Hexo 3: 1.x
- Hexo 2: 0.x

## 使用

在帖子的[front-matter](https://hexo.io/docs/front-matter.html)部分，您可以选择添加`description`, `intro`或`excerpt`设置来为帖子撰写摘要。 否则摘要将默认为摘录或帖子的前 140 个字符

## 配置

您可以在 Hexo 的`_config.yml`中配置此插件。

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

- **enable** - 启用或禁用此插件。 默认启用。

- **type** - 馈送类型。`atom`或`rss2`。指定`['atom', 'rss2']`以输出两种类型。（默认值：`atom`）

  - 例子：

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

- **path** - 馈送路径。当指定两种类型时，路径必须遵循类型值的顺序。（默认：atom.xml/rss2.xml）

- **limit** - 馈送中的最大帖子数（使用`0`或`false`显示所有帖子）

- **hub** - [PubSubHubbub](https://pubsubhubbub.appspot.com/)中心的 URL（如果你不使用它，请将其留空）

- **content** - （可选）设置为`true`以在馈送中包含整篇帖子的内容。

- **content_limit** - （可选）摘要中帖子内容的默认字数。 仅在内容设置为`false`且不存在自定义帖子描述时使用。

- **content_limit_delim** - （可选）如果使用 content_limit 来缩短帖子内容，则仅在达到字符限制之前在此分隔符的最后一次出现处进行剪切。 默认不使用。

- **order_by** - 按顺序馈送。（默认值：-date）

- **icon** - （可选）自定义提要图标。 默认为主配置中指定的电子邮件头像。

- **autodiscovery** - 添加馈送[自动发现](https://www.rssboard.org/rss-autodiscovery)。（默认值：`true`）

  - 许多主题已经提供了这个功能，所以如果你想禁用它，你可能还需要调整主题的配置。

- **template** - 自定义模板路径。 该文件将用于生成提要 xml 文件，请参阅默认模板：[atom.xml](https://github.com/hexojs/hexo-generator-feed/blob/master/atom.xml)和[rss2.xml](https://github.com/hexojs/hexo-generator-feed/blob/master/rss2.xml)。

  - 可以只指定一个自定义模板，即使此插件配置为输出两种提要类型，

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
