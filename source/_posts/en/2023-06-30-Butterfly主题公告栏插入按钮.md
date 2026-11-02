---
title: Insert an a tag button into the Butterfly theme announcement bar
description: >-
  Insert an a tag button into the aside announcement bar of the Butterfly theme
  in Hexo.
keywords: Frontend and themes, Butterfly, HTML, CSS
abbrlink: 7a98
permalink: en/p/7a98/
lang: en
translation_of: _posts/2023-06-30-Butterfly主题公告栏插入按钮.md
source_hash: 42015c4b3571
translator: ai
reviewed: false
categories:
  - Tech Development
  - Frontend & Themes
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

## Background

When I first saw the buttons in the announcement bar of the [Butterfly](https://butterfly.js.org/) theme's official documentation, I didn't think much of it. But once I had a use for them, I kept wanting to add buttons to my own blog's announcement bar. I searched the theme's official docs from top to bottom, but they never explained how to do it. Once I realized this wasn't a built-in feature of the theme, I planned to search for ready-made mods that others had shared, but I never could find any — maybe I just wasn't looking hard enough (. So I wrote one myself, modeled on the style in the official docs. It uses only HTML and CSS, so it's pretty simple.

![](/img/202306302327335.webp)

## Tutorial

### 0x0001

Open the [Buitterfly](https://butterfly.js.org/) theme config file `_config.butterfly.yml`, and add the following HTML code to the `card_announcement:` option under aside (the sidebar). Pick the snippet with however many buttons you need.

#### 1 button

```yaml
<div class="social-button"><a class="button--animated" href="https://baidu.com/" rel="external nofollow noreferrer" target="_blank">第一个按钮，填自己的内容</a></div>
```

#### 2 buttons

```yaml
<div class="social-button"><a class="button--animated" href="https://baidu.com/" rel="external nofollow noreferrer" target="_blank">第一个按钮，填自己的内容</a><a class="button--animated" href="https://baidu.com/" rel="external nofollow noreferrer" target="_blank">第二个按钮，填自己的内容</a></div>
```

#### 3 buttons

```yaml
<div class="social-button"><a class="button--animated" href="https://baidu.com/" rel="external nofollow noreferrer" target="_blank">第一个按钮，填自己的内容</a><a class="button--animated" href="https://baidu.com/" rel="external nofollow noreferrer" target="_blank">第二个按钮，填自己的内容</a><a class="button--animated" href="https://baidu.com/" rel="external nofollow noreferrer" target="_blank">第三个按钮，填自己的内容</a></div>
```

#### 4 buttons

```yaml
<div class="social-button"><a class="button--animated" href="https://baidu.com/" rel="external nofollow noreferrer" target="_blank">第一个按钮，填自己的内容</a><a class="button--animated" href="https://baidu.com/" rel="external nofollow noreferrer" target="_blank">第二个按钮，填自己的内容</a><a class="button--animated" href="https://baidu.com/" rel="external nofollow noreferrer" target="_blank">第三个按钮，填自己的内容</a><a class="button--animated" href="https://baidu.com/" rel="external nofollow noreferrer" target="_blank">第四个按钮，填自己的内容</a></div>
```

#### 5 buttons

```yaml
<div class="social-button"><a class="button--animated" href="https://baidu.com/" rel="external nofollow noreferrer" target="_blank">第一个按钮，填自己的内容</a><a class="button--animated" href="https://baidu.com/" rel="external nofollow noreferrer" target="_blank">第二个按钮，填自己的内容</a><a class="button--animated" href="https://baidu.com/" rel="external nofollow noreferrer" target="_blank">第三个按钮，填自己的内容</a><a class="button--animated" href="https://baidu.com/" rel="external nofollow noreferrer" target="_blank">第四个按钮，填自己的内容</a><a class="button--animated" href="https://baidu.com/" rel="external nofollow noreferrer" target="_blank">第五个按钮，填自己的内容</a></div>
```

If you need more buttons, just add more a tags.

### 0x0002

Replace the links in the `href="https://baidu.com/"` attribute and the text inside the a tags with your own, using my aside sidebar config as a reference.

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

Add the following style code to your own custom CSS file.

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

Finally, run the three Hexo commands and check out the result!

```sh
hexo cl; hexo g; hexo s
```

![最终の效果](/img/202306302330708.webp)