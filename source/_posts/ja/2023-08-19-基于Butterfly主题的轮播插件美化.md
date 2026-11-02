---
title: Butterfly テーマのカルーセルプラグイン美化
description: Butterfly テーマの SwiperBar カルーセルプラグイン、記事のピン留めスクロールバーを美化・微調整した記録
keywords: フロントエンドとテーマ, Butterfly, CSS
abbrlink: 4d82
permalink: ja/p/4d82/
lang: ja
translation_of: _posts/2023-08-19-基于Butterfly主题的轮播插件美化.md
source_hash: 77eee15d1654
translator: ai
reviewed: false
categories:
  - 技術開発
  - フロントエンドとテーマ
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

> プラグインのインストール方法については、店長のこちらの記事を参照してください：[Swiper Bar](https://akilar.top/posts/8e1264d1/)

美化の微調整を行う前に、ご自身のブログが [Hexo](https://hexo.io/zh-cn/) フレームワークと [Butterfly](https://butterfly.js.org/) テーマを使用していることを確認してください。他のフレームワークやテーマでは適用できない場合があります。

## スタイルコードの追加

カスタム CSS ファイルに以下のスタイルコードを追加してください：

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

上記のコードは、PC 側の記事カバー画像を正方形から長方形に調整し、モバイル側では左右の枠いっぱいに覆うようにして、より見栄えよくするものです。

上記の既存要素の中から、あるいはご自身で <kbd>F12</kbd> を押して `开发者工具` を使い、対応する要素の `ID` を探して、お好みのスタイルコードを追加していくことができます。

## ビフォー・アフター

### PC 側

![调整前](/img/202308192155353.webp)

![调整后](/img/202308192155352.webp)

### モバイル側

![调整前](/img/202308192155354.webp)

![调整后](/img/202308192155350.webp)

## 謝辞

> [Akilarの糖果屋](https://akilar.top/)：[SwiperBar](https://akilar.top/posts/8e1264d1/)