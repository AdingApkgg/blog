---
title: Reflector 镜像列表更新常用命令与配置文件
description: >-
  使用 Reflector 自动更新 Arch Linux 镜像列表，筛选中国地区最新且速度最快的 5 个镜像，并保存至
  /etc/pacman.d/mirrorlist 文件，提升软件包下载效率。
abbrlink: 59587
top_img: false
categories:
  - Software Tools
tags:
  - reflector
  - Arch Linux
  - mirror list
  - pacman
keywords: Software Tools, reflector, Arch Linux, mirror list, pacman
date: 2025-05-24 19:00:00
updated: 2025-05-24 19:00:00
---

[Reflector](https://xyne.dev/projects/reflector/) 是一个 Python 脚本；它可以从 [Arch Linux Mirror Status](https://archlinux.org/mirrors/status/) 页面获取最新的镜像列表，然后筛选出最新的镜像并按速度排序，最后将结果写入到 `/etc/pacman.d/mirrorlist` 文件。

这里记录了我的 `reflector` 常用命令与配置文件

## 命令

```sh
reflector --country China --latest 5 --sort rate --save /etc/pacman.d/mirrorlist

```

## 配置

```systemd
--save /etc/pacman.d/mirrorlist
--country China
--latest 5
--sort rate

```

筛选出最新处于 China 的 5 个镜像并按速度排序，最后将结果写入到 `/etc/pacman.d/mirrorlist` 文件。
