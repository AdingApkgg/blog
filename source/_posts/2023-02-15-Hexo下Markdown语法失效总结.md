---
title: Hexo 下 Markdown 语法失效总结
description: Hexo 框架下的 Markdown 语法失效问题总结
copyright: false
abstract: 有东西被加密了, 请输入密码查看.
message: 您好, 这里需要密码.
theme: xray
wrong_pass_message: 抱歉, 这个密码看着不太对, 请再试试.
wrong_hash_message: 抱歉, 这个文章不能被校验, 不过您还是能看看解密后的内容.
abbrlink: b45a
top_img: false
copyright_author: 萌小奇
copyright_author_href: https://www.jianshu.com/u/60dc3c4c6c3d
categories:
  - 技术指南
tags:
  - Markdown
  - Hexo
  - 表格显示
  - 有序列表
keywords: 技术指南, Markdown, Hexo, 表格显示, 有序列表
date: 2023-02-15 05:00:00
updated: 2023-02-15 05:00:00
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

{% note info simple %}参考：[hexo 下 Markdown 语法失效总结](https://www.jianshu.com/p/e19eff4311f4){% endnote %}

## 问题汇总

1. 多级有序列表序号显示异常问题
2. table 表格显示异常，不显示问题

## **多级有序列表序号显示异常**

Markdown 无法实现"多级有序列表", 而且在"有序列表"中断时, 会重新从 1 开始排序。即在 sublime text 中，正常显示的有序序列，写 hexo 静态 blog 显示异常，如下图。

![](/img/202304142302241.webp)

### **解决**

直接删除上一个序号最后与本序号之间的空行
发现了一篇解决方案[hexo 下 markdown 语法 有序列表序号不匹配](https://www.jianshu.com/p/20405c2980dc) 他是在序号之间的每一段正文左侧添加空格，但是并没有解决我的问题。我又尝试着把序号最后与下一个序号之间的空行删掉，问题竟然解决了。

### **存在问题**

我在解决了下一个表格不显示问题之后，发现序号展示又异常了。因为表格需要与上方正文之间有两个空行。因此，序号正常显示和表格正常显示只能选择一种。现在我还没有找到两全其美的方法。如果你解决了，请在下方评论留言。

### **结果展示**

[读《HTTP 图解》-Chapt 2](https://www.sunhong.vip/2019/03/11/读《HTTP图解》-Chapt-2/#more)

## table 表格显示异常，不显示

table 表格显示异常，我的是直接不显示表格。如下图。

![table表格不显示](/img/202304142302245.webp)

### **解决**

表格和正文之间空两行。
刚开始一直以为是 hexo 的表格格式不太一样，我就直接把其他人的表格复制到之前创建的表格上方，表格可以用了，尝试删除复制的表格后，仍可以用。后来发现，表格和正文之间需要两个空行。

### **结果展示**

![](/img/202304142302243.webp)
