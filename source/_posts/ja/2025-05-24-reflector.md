---
title: Reflector ミラーリスト更新でよく使うコマンドと設定ファイル
description: >-
  Reflector を使って Arch Linux のミラーリストを自動更新し、中国地域で最新かつ最速の 5 つのミラーを絞り込んで
  /etc/pacman.d/mirrorlist ファイルに保存し、パッケージのダウンロード効率を向上させます。
keywords: ツールとシステム, コマンドライン, reflector, Pacman
abbrlink: 59587
permalink: ja/p/59587/
lang: ja
translation_of: _posts/2025-05-24-reflector.md
source_hash: 5875aaa43188
translator: ai
reviewed: false
categories:
  - ツールとシステム
  - コマンドライン
tags:
  - reflector
  - Pacman
top_img: false
date: 2025-05-24 19:00:00
updated: 2025-05-24 19:00:00
---

[Reflector](https://xyne.dev/projects/reflector/) は Python スクリプトです。[Arch Linux Mirror Status](https://archlinux.org/mirrors/status/) ページから最新のミラーリストを取得し、最新のミラーを絞り込んで速度順に並べ替え、最後にその結果を `/etc/pacman.d/mirrorlist` ファイルへ書き込みます。

ここには私の `reflector` の常用コマンドと設定ファイルを記録しています。

## コマンド

```sh
reflector --country China --latest 5 --sort rate --save /etc/pacman.d/mirrorlist

```

## 設定

```systemd
--save /etc/pacman.d/mirrorlist
--country China
--latest 5
--sort rate

```

China にある最新のミラーを 5 件絞り込み、速度順に並べ替えて、最後にその結果を `/etc/pacman.d/mirrorlist` ファイルへ書き込みます。