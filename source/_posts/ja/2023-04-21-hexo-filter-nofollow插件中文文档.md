---
title: hexo-filter-nofollowプラグインの中国語ドキュメント
description: サイトで使用されるすべての外部リンクにnofollow属性を追加し、サイトのSEOを効果的に強化するとともに、リンクパワーの流出を防ぎます
keywords: リファレンスマニュアル, Hexo, プラグイン
abbrlink: d4ad
permalink: ja/p/d4ad/
lang: ja
translation_of: _posts/2023-04-21-hexo-filter-nofollow插件中文文档.md
source_hash: ab9eb4b51908
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

## 注意事項

本文書は、本人が[hexo-filter-nofollow](https://github.com/hexojs/hexo-filter-nofollow)の公式ドキュメントを[机翻](https://translate.google.com/)したものであり、記録用です。

> hexo-filter-nofollow 公式ドキュメント：https://github.com/hexojs/hexo-filter-nofollow

## hexo-filter-nofollow

サイトで使用されるすべての外部リンクに`rel="noopener external nofollow noreferrer"`を追加すると、サイトのSEOを効果的に強化し、リンクの評価流出を防ぐことができます

すべての外部リンクに自動的に nofollow 属性を追加します。

hexo-filter-nofollow は `rel="noopener external nofollow noreferrer"` をすべての外部リンクに追加し、安全性・プライバシー・SEOを確保します。[阅读更多](https://developer.mozilla.org/en-US/docs/Web/HTML/Attributes/rel)。

## インストール

```bash
$ npm i hexo-filter-nofollow --save
```

## 設定

```yaml
nofollow:
  enable: true
  field: site
  exclude:
    - "exclude1.com"
    - "exclude2.com"
```

- **enable** - プラグインを有効化します。デフォルト値は`true`です
- **field** - プラグインが属性を追加する範囲を`site`または`post`で指定します。デフォルト値は`site`です
  - `post` - 記事本文内の外部リンクにのみ nofollow 属性を追加します
  - `site` - サイト全体の外部リンクに nofollow 属性を追加します
- **exclude** - ホスト名を除外します。該当する場合はサブドメインを指定します（`www`を含む）
  - `exclude1.com`は`www.exclude1.com`または`en.exclude1.com`には適用されません