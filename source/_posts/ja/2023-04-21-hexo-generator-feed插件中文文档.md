---
title: hexo-generator-feedプラグインの中国語ドキュメント
description: HexoブログのRSS購読ファイルを生成するプラグインの中国語ドキュメント
keywords: リファレンスマニュアル, Hexo, プラグイン
abbrlink: f65f
permalink: ja/p/f65f/
lang: ja
translation_of: _posts/2023-04-21-hexo-generator-feed插件中文文档.md
source_hash: 301446fa3a3f
translator: ai
reviewed: false
categories:
  - リファレンス
tags:
  - Hexo
  - プラグイン
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

## 声明

本ドキュメントは本人が[机翻](https://translate.google.com/)したもので、[hexo-generator-feed](https://github.com/hexojs/hexo-generator-feed)の公式ドキュメントに基づいています。記録のみを目的としています。

> hexo-generator-feed 公式ドキュメント：https://github.com/hexojs/hexo-generator-feed

## hexo-generator-feeds

Atom 1.0 または RSS 2.0 のブログフィードを生成します

## インストール

```bash
$ npm install hexo-generator-feed --save
```

対応している Hexo バージョン：

- Hexo 4+: 2.x
- Hexo 3: 1.x
- Hexo 2: 0.x

## 使用方法

投稿の[front-matter](https://hexo.io/docs/front-matter.html)部分で、`description`、`intro`、または`excerpt`設定を追加して投稿の概要を記述できます。それ以外の場合、概要はデフォルトで抜粋、または投稿の先頭 140 文字になります。

## 設定

このプラグインは Hexo の`_config.yml`で設定できます。

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

- **enable** - このプラグインを有効または無効にします。デフォルトで有効です。

- **type** - フィードの種類。`atom`または`rss2`。`['atom', 'rss2']`を指定すると両方の種類を出力します。（デフォルト：`atom`）

  - 例：

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

- **path** - フィードのパス。2 種類を指定する場合、パスは type の値の順序に従う必要があります。（デフォルト：atom.xml/rss2.xml）

- **limit** - フィード内の最大投稿数（`0`または`false`を使用するとすべての投稿を表示します）

- **hub** - [PubSubHubbub](https://pubsubhubbub.appspot.com/) ハブの URL（使用しない場合は空のままにしてください）

- **content** - （オプション）`true`に設定すると、フィードに投稿全体の内容を含めます。

- **content_limit** - （オプション）概要に含める投稿内容のデフォルト文字数。content が`false`に設定され、カスタムの投稿説明が存在しない場合にのみ使用されます。

- **content_limit_delim** - （オプション）content_limit を使用して投稿内容を短縮する場合、文字数制限に達する前にこの区切り文字が最後に出現する位置でのみ切り取ります。デフォルトでは使用されません。

- **order_by** - フィードの並び順。（デフォルト：-date）

- **icon** - （オプション）フィードアイコンをカスタマイズします。デフォルトはメイン設定で指定されたメールアドレスのアバターです。

- **autodiscovery** - フィード[自动发现](https://www.rssboard.org/rss-autodiscovery)を追加します。（デフォルト：`true`）

  - 多くのテーマはすでにこの機能を提供しているため、無効にしたい場合はテーマの設定も調整する必要があるかもしれません。

- **template** - カスタムテンプレートのパス。このファイルはフィード XML ファイルの生成に使用されます。デフォルトテンプレートを参照してください：[atom.xml](https://github.com/hexojs/hexo-generator-feed/blob/master/atom.xml) と [rss2.xml](https://github.com/hexojs/hexo-generator-feed/blob/master/rss2.xml)。

  - このプラグインが 2 種類のフィードを出力するように設定されている場合でも、カスタムテンプレートは 1 つだけ指定できます。

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