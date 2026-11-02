---
title: Summary of Markdown Syntax Failures Under Hexo
description: A summary of Markdown syntax failure issues under the Hexo framework
keywords: Reference Manual, Markdown, Hexo, Troubleshooting
abbrlink: b45a
permalink: en/p/b45a/
lang: en
translation_of: _posts/2023-02-15-Hexo下Markdown语法失效总结.md
source_hash: 823a27ab2c46
translator: ai
reviewed: false
categories:
  - Reference
tags:
  - Markdown
  - Hexo
  - Troubleshooting
copyright: false
abstract: 有东西被加密了, 请输入密码查看.
message: 您好, 这里需要密码.
theme: xray
wrong_pass_message: 抱歉, 这个密码看着不太对, 请再试试.
top_img: false
copyright_author: 萌小奇
copyright_author_href: https://www.jianshu.com/u/60dc3c4c6c3d
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

{% note info simple %}Reference: [hexo 下 Markdown 语法失效总结](https://www.jianshu.com/p/e19eff4311f4){% endnote %}

## Issue Summary

1. Multi-level ordered lists display incorrect numbering
2. Tables display abnormally or not at all

## **Abnormal Numbering in Multi-level Ordered Lists**

Markdown cannot produce "multi-level ordered lists," and when an "ordered list" is interrupted, numbering restarts from 1. That is, ordered sequences that display correctly in Sublime Text render abnormally in the static Hexo blog, as shown below.

![](/img/202304142302241.webp)

### **Solution**

Simply delete the blank line between the end of the previous item and this item.
I found a solution post [hexo 下 markdown 语法 有序列表序号不匹配](https://www.jianshu.com/p/20405c2980dc) where the author added a space to the left of each paragraph between items, but that didn't solve my problem. I then tried deleting the blank line between the end of one item and the start of the next, and the problem was solved.

### **Remaining Issue**

After I fixed the next problem—tables not displaying—I found that the numbering was abnormal again. This is because tables require two blank lines between them and the preceding text. So I can only choose between correct numbering and correct table display. I haven't yet found a way to have both. If you've solved it, please leave a comment below.

### **Result**

[读《HTTP 图解》-Chapt 2](https://www.sunhong.vip/2019/03/11/读《HTTP图解》-Chapt-2/#more)

## Tables Display Abnormally or Not at All

Tables display abnormally—in my case, the table doesn't show up at all. As shown below.

![table表格不显示](/img/202304142302245.webp)

### **Solution**

Leave two blank lines between the table and the surrounding text.
At first I assumed Hexo's table format was just different, so I copied someone else's table above the table I'd created, and it worked. When I tried deleting the copied table, it still worked. Later I realized that two blank lines are needed between the table and the text.

### **Result**

![](/img/202304142302243.webp)