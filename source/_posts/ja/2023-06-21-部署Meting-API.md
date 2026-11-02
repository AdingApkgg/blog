---
title: Meting-APIをデプロイ
description: サーバーレスで自分専用のMeting-APIサービスをデプロイする
keywords: デプロイと運用, Meting, Vercel, デプロイ
abbrlink: '300'
permalink: ja/p/300/
lang: ja
translation_of: _posts/2023-06-21-部署Meting-API.md
source_hash: 050326721eca
translator: ai
reviewed: false
categories:
  - 技術開発
  - デプロイと運用
tags:
  - Meting
  - Vercel
  - デプロイ
abstract: 有东西被加密了, 请输入密码查看.
message: 您好, 这里需要密码.
theme: xray
wrong_pass_message: 抱歉, 这个密码看着不太对, 请再试试.（提示：某个词的罗马音）
top_img: false
cover: /img/202306211545453.webp
date: 2023-06-21 14:00:00
updated: 2023-06-29 22:30:00
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

{% note info simple %}

- このチュートリアルでは、GitHub 上の[xizeyoupan/Meting-API](https://github.com/xizeyoupan/Meting-API)オープンソースプロジェクトを使って、サーバーレスで自分専用の Meting-API をデプロイします
- この記事は主にサーバーを持っていない方向けの解説です。サーバーをお持ちの場合は、このリポジトリ[metowolf/Meting-API](https://github.com/metowolf/Meting-API)に切り替えてデプロイしてください
- 自前構築のメリット：API の呼び出しを他人に左右されず、サービス停止の心配もありません。API が自分の手元にあるからです
- デモ Test：[meting-api.saop.cc/test](https://meting-api.saop.cc/test)

{% endnote %}

## 前提条件

1. [GitHub](https://github.com)アカウントを登録する（すでに持っていれば登録不要）
2. [Vercel](https://vercel.com)アカウントを登録する（すでに持っていれば登録不要）
3. GitHub と Vercel の公式サイトにアクセスできる手段（マジック）があること
4. 自分専用のドメインと、一定のコンピュータの基礎知識
5. 両手、頭、目、そしてパソコンかスマートフォン

## チュートリアル

### 0x0001

[xizeyoupan/Meting-API](https://github.com/xizeyoupan/Meting-API)オープンソースプロジェクトのリポジトリに移動し、右上の`Fork`ボタンをクリックしてこのリポジトリの main ブランチを Fork します。

[Vercel](https://vercel.com/)プラットフォームに進み、`Add New...`>`Project`をクリックして、少し頭を使って、先ほど Fork したリポジトリを追加します。

### 0x0002

デプロイが成功したら、プロジェクトの`Settings`>`Domains`カスタムドメインに進み、自分のサブドメインを追加します。たとえば私の場合は`meting-api.saop.cc`です。

自分のドメインの DNS サービスプロバイダー（たとえば私のドメインなら Tencent Cloud）に移動し、Vercel が提供する CNAME レコードを追加します。

### 0x0003

少し待ちます。だいたい2〜3分ほどです。その後、先ほどバインドした`二级域名/test`にアクセスします。たとえば`https://meting-api.saop.cc/test`です。

エラーが出た場合はすべてやり直してください。基本的には自分の操作ミスです。成功すれば、以下のテストページが表示されます：

![](/img/202306211351201.webp)

曲の左上にはサービスプロバイダーと取得した種類が表示され、それぞれ次のように対応しています：

|       元の名前       |     サービス     |  種類  |
| :--------------: | :------------: | :----: |
| tencent playlist |    QQ 音楽     |  プレイリスト  |
|   tencent song   |    QQ 音楽     |  シングル  |
| netease playlist |   网易雲音楽   |  プレイリスト  |
|   netease song   |   网易雲音楽   |  シングル  |
|  netease artist  |   网易雲音楽   | アーティスト |
| ytmusic playlist | YouTube / ユーチューブ |  プレイリスト  |
|   ytmusic song   | YouTube / ユーチューブ |  シングル  |
| spotify playlist |    Spotify     |  プレイリスト  |
|   spotify song   |    Spotify     |  シングル  |

一部のサービスプロバイダーや種類が空白になっている場合、そのサービスプロバイダーや種類のデータを取得できていないことを意味するので、使用時にはその項目を避けてください。

## 使い方

### API パラメータの説明

- server: データソース

  - netease 网易雲音楽
  - tencent QQ 音楽

- type: 種類

  - name 曲名
  - artist 歌手
  - url リンク
  - pic カバー
  - lrc 歌詞
  - song シングル
  - playlist プレイリスト

- id: 種類 ID（カバー ID / シングル ID / プレイリスト ID）

- 例：
  - https://meting-api.saop.cc/api?server=netease&type=url&id=416892104
  - https://meting-api.saop.cc/api?server=netease&type=song&id=591321
  - https://meting-api.saop.cc/api?server=netease&type=playlist&id=2619366284

### API に **Meting.min.js** を埋め込む

`Meting.min.js`ファイルを自分のデバイスに保存します

> Meting.min.js：https://npm.elemecdn.com/meting/dist/Meting.min.js

このファイルを編集し、<kbd>Ctrl</kbd> + <kbd>F</kbd> で`api?server=`を検索し、`https://api.i-meto.com/meting/api?server=`を自分の API に置き換えてから <kbd>Ctrl</kbd> + <kbd>S</kbd> で保存します

- 置き換え前：`https://api.i-meto.com/meting/api?server=`
- 置き換え後：`https://meting-api.saop.cc/api?server=`

置き換えたら、コードスペースに置いてリンクでこのファイルを参照して使えます。ローカルに置いて相対リンクで参照してもかまいません。

#### Hexo の Butterfly テーマに適用する

設定前に APlayer 音楽プラグインが有効になっていることを確認してください。そうでないと設定しても意味がありません..

`Meting.min.js`ファイルを`[站点根目录]\source\js`フォルダ内に置き、テーマ設定ファイル`_config.butterfly.yml`を編集します。

`meting_js:`設定項目の CDN リンクを`/js/Meting.min.js`に置き換えます

```yaml
# CDN
# Don't modify the following settings unless you know how they work
# 非必要請不要修改
CDN:
  # The CDN provider of internal scripts (主題內部 js 的 cdn 配置)
  # option: local/jsdelivr/unpkg/cdnjs/custom
  # Dev version can only choose. ( dev版的主題只能設置為 local )
  internal_provider: local

  # The CDN provider of third party scripts (第三方 js 的 cdn 配置)
  # option: local/jsdelivr/unpkg/cdnjs/custom
  # when set it to local, you need to install hexo-butterfly-extjs
  third_party_provider: unpkg

  # Add version number to CDN, true or false
  version: false

  # Custom format
  # For example: https://cdn.staticfile.org/${cdnjs_name}/${version}/${min_cdnjs_file}
  custom_format:

  option:
    aplayer_css: https://npm.elemecdn.com/aplayer/dist/APlayer.min.css
    aplayer_js: https://npm.elemecdn.com/aplayer/dist/APlayer.min.js
    meting_js: /js/Meting.min.js
```

最後はもちろん Hexo の3連発です！

```sh
hexo cl; hexo g; hexo s
```

<kbd>F12</kbd> で`Meting.min.js`ファイルが読み込まれているか確認できます

## 謝辞

> GitHub：[xizeyoupan/Meting-API](https://github.com/xizeyoupan/Meting-API)