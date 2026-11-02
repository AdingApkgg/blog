---
title: Deploying Meting-API
description: Serverless deployment of your own Meting-API service
keywords: Deployment & Operations, Meting, Vercel, Deployment
abbrlink: '300'
permalink: en/p/300/
lang: en
translation_of: _posts/2023-06-21-部署Meting-API.md
source_hash: 050326721eca
translator: ai
reviewed: false
categories:
  - Tech Development
  - Deployment & Ops
tags:
  - Meting
  - Vercel
  - Deployment
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

- This tutorial uses the [xizeyoupan/Meting-API](https://github.com/xizeyoupan/Meting-API) open-source project on GitHub to deploy your own serverless Meting-API
- This article is mainly aimed at those without a server; if you have one, you can switch to this repository [metowolf/Meting-API](https://github.com/metowolf/Meting-API) for deployment
- Benefits of self-hosting: no one else controls your API calls, and there's no risk of the service shutting down, because the API is in your own hands
- Demo Test: [meting-api.saop.cc/test](https://meting-api.saop.cc/test)

{% endnote %}

## Prerequisites

1. Register a [GitHub](https://github.com) account (skip this if you already have one)
2. Register a [Vercel](https://vercel.com) account (skip this if you already have one)
3. Have a tool that can access the GitHub and Vercel websites (a VPN)
4. A domain of your own and some basic computer knowledge
5. A pair of hands, a brain, a pair of eyes, and a computer or phone

## Tutorial

### 0x0001

Go to the repository of the [xizeyoupan/Meting-API](https://github.com/xizeyoupan/Meting-API) open-source project, click the `Fork` button in the top right corner to fork the main branch of this repository,

Go to the [Vercel](https://vercel.com/) platform and click `Add New...` > `Project`, use your brain a little, and add the repository you just forked,

### 0x0002

After the deployment succeeds, go to the project's `Settings` > `Domains` custom domains, add your own subdomain, like mine `meting-api.saop.cc`

Go to your domain's DNS provider (for example, Tencent Cloud for my domain) and add the CNAME record provided by Vercel

### 0x0003

Wait a bit, about two or three minutes, then visit the domain you just bound `二级域名/test`, for example `https://meting-api.saop.cc/test`

If you get an error, start over from the beginning; it's usually a mistake in your own operations. If it succeeds, the following test page will appear:

![](/img/202306211351201.webp)

The top left of each song shows the provider and the retrieved type, corresponding to:

|       Original name       |     Provider     |   Type   |
| :--------------: | :------------: | :----: |
| tencent playlist |    QQ Music     |  Playlist  |
|   tencent song   |    QQ Music     |  Track  |
| netease playlist |   NetEase Cloud Music   |  Playlist  |
|   netease song   |   NetEase Cloud Music   |  Track  |
|  netease artist  |   NetEase Cloud Music   | Artist |
| ytmusic playlist | YouTube |  Playlist  |
|   ytmusic song   | YouTube |  Track  |
| spotify playlist |    Spotify     |  Playlist  |
|   spotify song   |    Spotify     |  Track  |

If some provider or type is blank, it means data can't be retrieved for that provider or type, so avoid that option when using it

## Usage

### API Parameters

- server: data source

  - netease: NetEase Cloud Music
  - tencent: QQ Music

- type: type

  - name: song name
  - artist: artist
  - url: link
  - pic: cover
  - lrc: lyrics
  - song: track
  - playlist: playlist

- id: the ID for the type (cover ID / track ID / playlist ID)

- For example:
  - https://meting-api.saop.cc/api?server=netease&type=url&id=416892104
  - https://meting-api.saop.cc/api?server=netease&type=song&id=591321
  - https://meting-api.saop.cc/api?server=netease&type=playlist&id=2619366284

### Embedding the API in **Meting.min.js**

Save the `Meting.min.js` file to your own device

> Meting.min.js: https://npm.elemecdn.com/meting/dist/Meting.min.js

Edit this file, press <kbd>Ctrl</kbd> + <kbd>F</kbd> to search for `api?server=`, replace `https://api.i-meto.com/meting/api?server=` with your own API, then press <kbd>Ctrl</kbd> + <kbd>S</kbd> to save

- Before: `https://api.i-meto.com/meting/api?server=`
- After: `https://meting-api.saop.cc/api?server=`

Once you've replaced it, you can put it in your code space and reference this file via a link, or place it locally and reference it with a relative link

#### Applying to the Butterfly theme for Hexo

Make sure the APlayer music plugin is enabled before configuring, otherwise the configuration won't do anything..

Place the `Meting.min.js` file into the `[站点根目录]\source\js` folder and edit the theme configuration file `_config.butterfly.yml`,

Change the CDN link of the `meting_js:` option to `/js/Meting.min.js`

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

Finally, the usual Hexo three-step combo, of course!

```sh
hexo cl; hexo g; hexo s
```

You can press <kbd>F12</kbd> to check whether the `Meting.min.js` file has loaded

## Credits

> GitHub: [xizeyoupan/Meting-API](https://github.com/xizeyoupan/Meting-API)