---
title: Butterflyテーマの告知欄にaタグボタンを挿入する
description: HexoのButterflyテーマのaside告知欄にaタグボタンを挿入する
keywords: フロントエンドとテーマ, Butterfly, HTML, CSS
abbrlink: 7a98
permalink: ja/p/7a98/
lang: ja
translation_of: _posts/2023-06-30-Butterfly主题公告栏插入按钮.md
source_hash: 42015c4b3571
translator: ai
reviewed: false
categories:
  - 技術開発
  - フロントエンドとテーマ
tags:
  - Butterfly
  - HTML
  - CSS
abstract: 有东西被加密了, 请输入密码查看.
message: 您好, 这里需要密码.
theme: xray
wrong_pass_message: 抱歉, 这个密码看着不太对, 请再试试.（提示：某个词的罗马音）
top_img: false
cover: /img/202306302327335.webp
date: 2023-06-30 23:30:00
updated: 2023-06-30 23:50:00
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

## きっかけ

最初に [Butterfly](https://butterfly.js.org/) テーマの公式ドキュメントで、公告欄にいくつかボタンが設置されているのを見たのですが、そのときは特に気にも留めていませんでした。しかし必要に迫られてからというもの、自分のブログの公告欄にもボタンを付けたいとずっと思っていました。ところがテーマの公式ドキュメントを隅々まで探しても方法は書かれておらず、これがテーマ標準の機能ではないと気づいたので、検索エンジンで誰かが公開している既存の魔改造を探すことにしました。しかしなかなか見つからず、たぶん自分の力不足なのだと思います(。そこで公式ドキュメントのスタイルを真似て自分で書くことにしました。使ったのは HTML と CSS だけなので、とてもシンプルです。

![](/img/202306302327335.webp)

## チュートリアル

### 0x0001

[Buitterfly](https://butterfly.js.org/) テーマの設定ファイル`_config.butterfly.yml`を開き、aside（サイドバー）の `card_announcement:` 設定項目に以下の HTML コードを追加します。ボタンの数に合わせて好きなコードを選んでください。

#### ボタン1個

```yaml
<div class="social-button"><a class="button--animated" href="https://baidu.com/" rel="external nofollow noreferrer" target="_blank">第一个按钮，填自己的内容</a></div>
```

#### ボタン2個

```yaml
<div class="social-button"><a class="button--animated" href="https://baidu.com/" rel="external nofollow noreferrer" target="_blank">第一个按钮，填自己的内容</a><a class="button--animated" href="https://baidu.com/" rel="external nofollow noreferrer" target="_blank">第二个按钮，填自己的内容</a></div>
```

#### ボタン3個

```yaml
<div class="social-button"><a class="button--animated" href="https://baidu.com/" rel="external nofollow noreferrer" target="_blank">第一个按钮，填自己的内容</a><a class="button--animated" href="https://baidu.com/" rel="external nofollow noreferrer" target="_blank">第二个按钮，填自己的内容</a><a class="button--animated" href="https://baidu.com/" rel="external nofollow noreferrer" target="_blank">第三个按钮，填自己的内容</a></div>
```

#### ボタン4個

```yaml
<div class="social-button"><a class="button--animated" href="https://baidu.com/" rel="external nofollow noreferrer" target="_blank">第一个按钮，填自己的内容</a><a class="button--animated" href="https://baidu.com/" rel="external nofollow noreferrer" target="_blank">第二个按钮，填自己的内容</a><a class="button--animated" href="https://baidu.com/" rel="external nofollow noreferrer" target="_blank">第三个按钮，填自己的内容</a><a class="button--animated" href="https://baidu.com/" rel="external nofollow noreferrer" target="_blank">第四个按钮，填自己的内容</a></div>
```

#### ボタン5個

```yaml
<div class="social-button"><a class="button--animated" href="https://baidu.com/" rel="external nofollow noreferrer" target="_blank">第一个按钮，填自己的内容</a><a class="button--animated" href="https://baidu.com/" rel="external nofollow noreferrer" target="_blank">第二个按钮，填自己的内容</a><a class="button--animated" href="https://baidu.com/" rel="external nofollow noreferrer" target="_blank">第三个按钮，填自己的内容</a><a class="button--animated" href="https://baidu.com/" rel="external nofollow noreferrer" target="_blank">第四个按钮，填自己的内容</a><a class="button--animated" href="https://baidu.com/" rel="external nofollow noreferrer" target="_blank">第五个按钮，填自己的内容</a></div>
```

ボタンをもっと増やしたい場合は、a タグの数を自分で増やしてください。

### 0x0002

`href="https://baidu.com/"` 属性内のリンクと a タグ内のテキストを自分のものに置き換えてください。私の aside サイドバー設定を参考にしてください。

```yaml
# aside (側邊欄)
# --------------------------------------

aside:
  enable: true
  hide: false
  button: true
  mobile: true # display on mobile
  position: right # left or right
  display:
    archive: true
    tag: true
    category: true
  card_announcement:
    enable: true
    content: 这是一段公告内容。<div class="social-button"><a class="button--animated" href="//qm.qq.com/cgi-bin/qm/qr?_wv=1027&k=aNthm0SgxBnx28iW06K8NQmuT9OYBweY&authKey=6PPWxZgCuCAQ6L7%2BVAAjSK8c%2FMGBUbQEOyliEmhB9njVrJUoOyIaNrta2q992Ok7&noverify=0&group_code=875766458" rel="external nofollow noreferrer" target="_blank">👉 QQ 交流群 👈</a><a class="button--animated" href="//t.me/FullDiveSAO" rel="external nofollow noreferrer" target="_blank">👉 TG 交流群 👈</a></div>
```

### 0x0003

自分のカスタム CSS ファイルに以下のスタイルコードを追加します。

```css
/* aside公告栏按钮美化 */
.social-button .button--animated {
  background: #3eb8be;
  color: rgb(255, 255, 255);
  display: block;
  margin: 4px 0;
  text-align: center;
  line-height: 2.4;
  transition: 0.3s;
  border-radius: 8px;
}

.social-button .button--animated:hover {
  background-color: #40c4ae;
}

.social-button .button--animated:active {
  background-color: #339ea3;
}
```

### 0x0004

最後はいつもの Hexo 3コマンドを実行して効果を確認するだけです！

```sh
hexo cl; hexo g; hexo s
```

![最终の效果](/img/202306302330708.webp)