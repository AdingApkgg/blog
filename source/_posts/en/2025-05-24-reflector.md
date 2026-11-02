---
title: Common Commands and Configuration Files for Updating the Reflector Mirror List
description: >-
  Use Reflector to automatically update the Arch Linux mirror list, filter the 5
  newest and fastest mirrors in the China region, and save them to the
  /etc/pacman.d/mirrorlist file to improve package download efficiency.
keywords: Tools and System, Command Line, reflector, Pacman
abbrlink: 59587
permalink: en/p/59587/
lang: en
translation_of: _posts/2025-05-24-reflector.md
source_hash: 5875aaa43188
translator: ai
reviewed: false
categories:
  - Tools & Systems
  - Command Line
tags:
  - reflector
  - Pacman
top_img: false
date: 2025-05-24 19:00:00
updated: 2025-05-24 19:00:00
---

[Reflector](https://xyne.dev/projects/reflector/) is a Python script; it fetches the latest mirror list from the [Arch Linux Mirror Status](https://archlinux.org/mirrors/status/) page, filters out the newest mirrors and sorts them by speed, then writes the results to the `/etc/pacman.d/mirrorlist` file.

Here I've documented my commonly used commands and configuration files for `reflector`.

## Commands

```sh
reflector --country China --latest 5 --sort rate --save /etc/pacman.d/mirrorlist

```

## Configuration

```systemd
--save /etc/pacman.d/mirrorlist
--country China
--latest 5
--sort rate

```

Filter out the 5 newest mirrors located in China and sort them by speed, then write the results to the `/etc/pacman.d/mirrorlist` file.