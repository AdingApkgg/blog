---
title: Hexo での Markdown 構文が無効になる問題のまとめ
description: Hexo フレームワークにおける Markdown 構文が無効になる問題のまとめ
keywords: リファレンスマニュアル, Markdown, Hexo, トラブルシューティング
abbrlink: b45a
permalink: ja/p/b45a/
lang: ja
translation_of: _posts/2023-02-15-Hexo下Markdown语法失效总结.md
source_hash: 823a27ab2c46
translator: ai
reviewed: false
categories:
  - リファレンス
tags:
  - Markdown
  - Hexo
  - トラブルシューティング
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

{% note info simple %}参考：[hexo 下 Markdown 语法失效总结](https://www.jianshu.com/p/e19eff4311f4){% endnote %}

## 問題のまとめ

1. 多段階の番号付きリストの番号表示が異常になる問題
2. table 表格の表示が異常になり、表示されない問題

## **多段階の番号付きリストの番号表示が異常**

Markdown では「多段階の番号付きリスト」を実現できません。しかも「番号付きリスト」が中断されると、再び 1 から番号が振り直されます。つまり sublime text では正常に表示される番号付きリストが、Hexo の静的ブログでは異常に表示されるのです。以下の画像のとおりです。

![](/img/202304142302241.webp)

### **解決**

前の番号の最後とこの番号の間にある空行を直接削除する
解決策の記事[hexo 下 markdown 语法 有序列表序号不匹配](https://www.jianshu.com/p/20405c2980dc)を見つけました。その記事では番号の間にある各本文の左側にスペースを追加していましたが、私の問題は解決しませんでした。そこで番号の最後と次の番号の間の空行を削除してみたところ、なんと問題が解決しました。

### **残っている問題**

次の表が表示されない問題を解決した後、番号の表示がまた異常になりました。表とその上の本文の間には空行が 2 行必要だからです。そのため、番号が正常に表示されることと表が正常に表示されることは、どちらか一方しか選べません。今のところ両立する方法は見つかっていません。もし解決できた方がいれば、下のコメント欄で教えてください。

### **結果表示**

[读《HTTP 图解》-Chapt 2](https://www.sunhong.vip/2019/03/11/读《HTTP图解》-Chapt-2/#more)

## table 表格の表示が異常になり、表示されない

table 表格の表示が異常で、私の場合は表がまったく表示されません。以下の画像のとおりです。

![table表格不显示](/img/202304142302245.webp)

### **解決**

表と本文の間に空行を 2 行入れる。
最初は Hexo の表の書式が違うのだと思い、他の人の表をそのまま以前作成した表の上にコピーしたところ、表が使えるようになりました。コピーした表を削除しても使えたので、後に表と本文の間には空行が 2 行必要なのだと気づきました。

### **結果表示**

![](/img/202304142302243.webp)