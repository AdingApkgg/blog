---
title: Butterfly主题公告栏插入a标签按钮
description: 在Hexo的Butterfly主题aside公告栏里插入a标签按钮
categories: 技术
tags:
  - 主题
abstract: "有东西被加密了, 请输入密码查看."
message: "您好, 这里需要密码."
theme: xray
wrong_pass_message: "抱歉, 这个密码看着不太对, 请再试试.（提示：某个词的罗马音）"
wrong_hash_message: "抱歉, 这个文章不能被校验, 不过您还是能看看解密后的内容."
abbrlink: 7a98
top_img: false
cover: >-
  /img/202306302327335.webp
date: 2023-06-30 23:30:00
updated: 2023-06-30 23:50:00
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

## 起因

当初看到 [Butterfly](https://butterfly.js.org/) 主题官方文档的公告栏里有几个按钮，不过那时不以为然，自从有了需求后就一直想给我博客的公告栏也弄个按钮，但翻遍了主题的官方文档也没说怎么弄，意识到这不是主题自带的功能后就打算去搜索引擎找别人弄好的现成魔改，但一直找不到，可能是本人能力不够(，所以就仿照官方文档的样式自己写了个，只用了 HTML 和 CSS，所以就很简单了

![](/img/202306302327335.webp)

## 教程

### 0x0001

打开 [Buitterfly](https://butterfly.js.org/) 主题配置文件`_config.butterfly.yml`，在 aside（侧边栏）的`card_announcement:`配置项添加以下 HTML 代码，可自选对应数量的按钮代码

#### 1 个按钮

```yaml
<div class="social-button"><a class="button--animated" href="https://baidu.com/" rel="external nofollow noreferrer" target="_blank">第一个按钮，填自己的内容</a></div>
```

#### 2 个按钮

```yaml
<div class="social-button"><a class="button--animated" href="https://baidu.com/" rel="external nofollow noreferrer" target="_blank">第一个按钮，填自己的内容</a><a class="button--animated" href="https://baidu.com/" rel="external nofollow noreferrer" target="_blank">第二个按钮，填自己的内容</a></div>
```

#### 3 个按钮

```yaml
<div class="social-button"><a class="button--animated" href="https://baidu.com/" rel="external nofollow noreferrer" target="_blank">第一个按钮，填自己的内容</a><a class="button--animated" href="https://baidu.com/" rel="external nofollow noreferrer" target="_blank">第二个按钮，填自己的内容</a><a class="button--animated" href="https://baidu.com/" rel="external nofollow noreferrer" target="_blank">第三个按钮，填自己的内容</a></div>
```

#### 4 个按钮

```yaml
<div class="social-button"><a class="button--animated" href="https://baidu.com/" rel="external nofollow noreferrer" target="_blank">第一个按钮，填自己的内容</a><a class="button--animated" href="https://baidu.com/" rel="external nofollow noreferrer" target="_blank">第二个按钮，填自己的内容</a><a class="button--animated" href="https://baidu.com/" rel="external nofollow noreferrer" target="_blank">第三个按钮，填自己的内容</a><a class="button--animated" href="https://baidu.com/" rel="external nofollow noreferrer" target="_blank">第四个按钮，填自己的内容</a></div>
```

#### 5 个按钮

```yaml
<div class="social-button"><a class="button--animated" href="https://baidu.com/" rel="external nofollow noreferrer" target="_blank">第一个按钮，填自己的内容</a><a class="button--animated" href="https://baidu.com/" rel="external nofollow noreferrer" target="_blank">第二个按钮，填自己的内容</a><a class="button--animated" href="https://baidu.com/" rel="external nofollow noreferrer" target="_blank">第三个按钮，填自己的内容</a><a class="button--animated" href="https://baidu.com/" rel="external nofollow noreferrer" target="_blank">第四个按钮，填自己的内容</a><a class="button--animated" href="https://baidu.com/" rel="external nofollow noreferrer" target="_blank">第五个按钮，填自己的内容</a></div>
```

需更多按钮可自行增加 a 标签的数量

### 0x0002

将`href="https://baidu.com/"`属性里的链接和 a 标签里的文字内容换成自己的，参考我的 aside 侧边栏配置

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

在自己的自定义 CSS 文件里加入以下样式代码

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

最后就是 Hexo 三连查看效果啦！

```sh
hexo cl; hexo g; hexo s
```

![最终の效果](/img/202306302330708.webp)
