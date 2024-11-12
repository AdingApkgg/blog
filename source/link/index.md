---
title: 夏目友人帐
date: 2023-02-04 14:37:08
type: "link"
updated: 2024-11-12 00:00:00
comments:
random: false
description: 互换索引，点滴成河，汇聚成海
keywords: "link, links, 友链, 友情链接, 友人帐"
top_img:
mathjax:
katex:
aside:
aplayer:
highlight_shrink:
---

## 欢迎交换友链！

### 我的友链

{% tabs link, 1 %}

<!-- tab 🙋Butterfly -->

```yaml
- name: 定の栈
  link: https://saop.cc
  avatar: https://saop.cc/avatar.webp
  descr: LINK START!
```

<!-- endtab -->

<!-- tab ☀️Volantis -->

```yaml
- title: 定の栈
  avatar: https://saop.cc/avatar.webp
  url: https://saop.cc
  keywords: Asuna，网站，博客，教程，后花园
  description: LINK START!
```

<!-- endtab -->

<!-- tab 🌴General -->

| **名称** | **数值**                    |
| -------- | --------------------------- |
| 标题     | 定の栈                      |
| 描述     | LINK START!                 |
| 链接     | https://saop.cc             |
| 图标     | https://saop.cc/avatar.webp |

<!-- endtab -->

<!-- tab Fuild -->

```yaml
- {
    title: "定の栈",
    intro: "LINK START!",
    link: "https://saop.cc",
    avatar: "https://saop.cc/avatar.webp",
  }
```

<!-- endtab -->

<!-- tab HTML -->

```html
<a href="https://saop.cc" rel="external nofollow">定の栈</a>
```

<!-- endtab -->

<!-- tab jade -->

```jade
a(href='https://saop.cc' rel="external nofollow") 定の栈
```

<!-- endtab -->

{% endtabs %}

## 几个小要求

> - **无广告，界面整洁观感舒适**
> - 站点截图和描述可以**不填**
> - 已经**创建**有段时间了
> - 能够**稳定运行**，不会时不时的**宕机**
> - 需启用 HTTPS，无 HTTPS 看情况酌情收录
> - 不包含**政治内容**，不违反**联合国法案**

<div class="addBtn"><button onclick="leonus.linkCom()"><i class="fa-solid fa-circle-plus"></i>申请通用友链</button> <button onclick="leonus.linkCom(&quot;bf&quot;)"><i class="fa-solid fa-circle-plus"></i>申请 Butterfly 友链</button></div>

<div id="friend-circle-lite-root"></div>

<style>
/* 添加友链按钮 */
/* 快速填写格式 */
.addBtn {
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
}

.addBtn button {
  transition: .2s;
  display: flex;
  margin: 5px auto;
  color: var(--font-color);
  padding: 15px;
  border-radius: 8px;
  background: var(--theme-color);
  align-items: center;
  border: solid 5px rgba(200, 200, 200, .3);
}

button {
  padding: 0;
  outline: 0;
  border: none;
  background: 0 0;
  cursor: pointer;
  touch-action: manipulation;
}

.fa-solid,
.fas {
  font-family: "Font Awesome 6 Free";
  font-weight: 900;
}

.addBtn i {
  font-size: 1.3rem;
  margin-right: 10px;
}

.addBtn button:hover {
  background: var(--hover-color);
  color: #000;
  box-shadow: var(--hover-color) 0 0 2px 3px;
  border: solid 5px rgba(200, 200, 200, .5);
}
</style>

<link rel="stylesheet" href="https://fastly.jsdelivr.net/gh/willow-god/Friend-Circle-Lite/main/fclite.min.css">

<script>
var leonus = {
  linkCom: (e) => {
    var t = document.querySelector(".el-textarea__inner");
    "bf" == e
      ? ((t.value = "```yaml\n"),
        (t.value += "- name: \n  link: \n  avatar: \n  descr: "),
        (t.value += "\n```"),
        t.setSelectionRange(16, 16))
      : ((t.value = "标题：\n描述：\n链接：\n图标："),
        t.setSelectionRange(3, 3)),
      t.focus();
  },
  owoBig: () => {
    if (
      !document.getElementById("post-comment") ||
      document.body.clientWidth < 768
    )
      return;
    let e = 1,
      t = "",
      o = document.createElement("div"),
      n = document.querySelector("body");
    (o.id = "owo-big"),
      n.appendChild(o),
      new MutationObserver((l) => {
        for (let a = 0; a < l.length; a++) {
          let i = l[a].addedNodes,
            s = "";
          if (2 == i.length && "OwO-body" == i[1].className) s = i[1];
          else {
            if (1 != i.length || "tk-comment" != i[0].className) continue;
            s = i[0];
          }
          (s.onmouseover = (l) => {
            e &&
              (("OwO-body" == s.className && "IMG" == l.target.tagName) ||
                "tk-owo-emotion" == l.target.className) &&
              ((e = 0),
              (t = setTimeout(() => {
                let e = 3 * l.path[0].clientHeight,
                  t = 3 * l.path[0].clientWidth,
                  a = l.x - l.offsetX - (t - l.path[0].clientWidth) / 2,
                  i = l.y - l.offsetY;
                a + t > n.clientWidth && (a -= a + t - n.clientWidth + 10),
                  a < 0 && (a = 10),
                  (o.style.cssText = `display:flex; height:${e}px; width:${t}px; left:${a}px; top:${i}px;`),
                  (o.innerHTML = `<img src="${l.target.src}">`);
              }, 300)));
          }),
            (s.onmouseout = () => {
              (o.style.display = "none"), (e = 1), clearTimeout(t);
            });
        }
      }).observe(document.getElementById("post-comment"), {
        subtree: !0,
        childList: !0,
      });
  },
};

if (typeof UserConfig === 'undefined') {
  var UserConfig = {
    // 填写你的fc Lite地址
    private_api_url: 'https://fc.saop.cc/',
    // 点击加载更多时，一次最多加载几篇文章，默认20
    page_turning_number: 30,
    // 头像加载失败时，默认头像地址
    error_img: 'https://dn-qiniu-avatar.qbox.me/avatar/',
  }
}
</script>

<script src="https://fastly.jsdelivr.net/gh/willow-god/Friend-Circle-Lite/main/fclite.min.js"></script>
