---
title: 部署Meting-API
description: 无服务器部署属于自己的Meting-API服务
categories: 技术
tags:
abstract: "有东西被加密了, 请输入密码查看."
message: "您好, 这里需要密码."
theme: xray
wrong_pass_message: "抱歉, 这个密码看着不太对, 请再试试.（提示：某个词的罗马音）"
wrong_hash_message: "抱歉, 这个文章不能被校验, 不过您还是能看看解密后的内容."
abbrlink: "300"
top_img: false
cover: >-
  /img/202306211545453.webp
date: 2023-06-21 14:00:00
updated: 2023-06-29 22:30:00
password:
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
copyright:
copyright_author:
copyright_author_href:
copyright_url:
copyright_info:
highlight_shrink:
---

{% note info simple %}

- 本教程使用了 GitHub 上的[xizeyoupan/Meting-API](https://github.com/xizeyoupan/Meting-API)开源项目，实现无服务器部署属于自己的 Meting-API
- 本文主要针对无服务器的同学进行讲解，若有服务器可切换此仓库[metowolf/Meting-API](https://github.com/metowolf/Meting-API)进行部署
- 自建的好处：API 的调用无需受制于人，不怕跑路，因为 API 掌握在自己的手里
- 演示 Test：[meting-api.saop.cc/test](https://meting-api.saop.cc/test)

{% endnote %}

## 前置条件

1. 注册[GitHub](https://github.com)账号（已经有就不用注册）
2. 注册[Vercel](https://vercel.com)账号（已经有就不用注册）
3. 有能访问 GitHub 和 Vercel 官网的工具（魔法）
4. 一个属于自己的域名和一定的计算机基础知识
5. 一双手，一个脑子，一双眼，一台电脑或手机

## 教程

### 0x0001

前往[xizeyoupan/Meting-API](https://github.com/xizeyoupan/Meting-API)开源项目的仓库，点击右上角的`Fork`按钮 Fork 此仓库的 main 分支，

进入[Vercel](https://vercel.com/)平台点击`Add New...`>`Project`，动下自己的脑子，添加刚才 Fork 过来的仓库，

### 0x0002

部署成功后进入到项目的`Settings`>`Domains`自定义域名，添加自己的二级域名，就比如我的`meting-api.saop.cc`

前往自己域名的 DNS 服务商（就比如我域名的腾讯云），添加 Vercel 提供的 CNAME 解析

### 0x0003

稍作等待，大概两三分钟的样子，然后访问自己刚绑定`二级域名/test`，例如`https://meting-api.saop.cc/test`

如果出现报错就全部重来，一般来说都是自己操作的问题，成功的话就会出现以下测试页面：

![](/img/202306211351201.webp)

歌曲的左上角是服务商和获取到的类型，对应的是：

|       原名       |     服务商     |  类型  |
| :--------------: | :------------: | :----: |
| tencent playlist |    QQ 音乐     |  歌单  |
|   tencent song   |    QQ 音乐     |  单曲  |
| netease playlist |   网易云音乐   |  歌单  |
|   netease song   |   网易云音乐   |  单曲  |
|  netease artist  |   网易云音乐   | 艺术家 |
| ytmusic playlist | YouTube / 油管 |  歌单  |
|   ytmusic song   | YouTube / 油管 |  单曲  |
| spotify playlist |    Spotify     |  歌单  |
|   spotify song   |    Spotify     |  单曲  |

如果有些服务商或类型是空白的，那就说明获取不到该服务商或类型的数据，那就要在使用的时候避开此项

## 使用

### API 参数说明

- server: 数据源

  - netease 网易云音乐
  - tencent QQ 音乐

- type: 类型

  - name 歌曲名
  - artist 歌手
  - url 链接
  - pic 封面
  - lrc 歌词
  - song 单曲
  - playlist 歌单

- id: 类型 ID（封面 ID/单曲 ID/歌单 ID）

- 例如：
  - https://meting-api.saop.cc/api?server=netease&type=url&id=416892104
  - https://meting-api.saop.cc/api?server=netease&type=song&id=591321
  - https://meting-api.saop.cc/api?server=netease&type=playlist&id=2619366284

### API 嵌入**Meting.min.js**

将`Meting.min.js`文件保存到自己的设备上

> Meting.min.js：https://npm.elemecdn.com/meting/dist/Meting.min.js

编辑此文件，<kbd>Ctrl</kbd> + <kbd>F</kbd> 搜索`api?server=`，将`https://api.i-meto.com/meting/api?server=`更换成自己的 API 后 <kbd>Ctrl</kbd> + <kbd>S</kbd> 保存

- 更换前：`https://api.i-meto.com/meting/api?server=`
- 更换后：`https://meting-api.saop.cc/api?server=`

替换后就可以放到代码空间里使用链接引用此文件了，或放到本地使用相对链接引用也可以

#### 应用于 Hexo 的 Butterfly 主题

配置前确保启用了 APlayer 音乐插件，不然配置了也没什么用..

将`Meting.min.js`文件放到`[站点根目录]\source\js`文件夹内，编辑主题配置文件`_config.butterfly.yml`，

更换`meting_js:`配置项的 CDN 链接为`/js/Meting.min.js`

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

最后自然是 Hexo 三连啦！

```sh
hexo cl; hexo g; hexo s
```

可以 <kbd>F12</kbd> 查看`Meting.min.js`文件是否加载出来

## 鸣谢

> GitHub：[xizeyoupan/Meting-API](https://github.com/xizeyoupan/Meting-API)
