---
title: Podman Compose Common Commands Quick Reference
description: A quick reference table for common Podman Compose commands
keywords: Technical Development, Deployment & Operations, Podman, Commands
abbrlink: 61957
permalink: en/p/61957/
lang: en
translation_of: _posts/2025-12-24-PodmanCompose常用命令速查.md
source_hash: 36355d3e685b
translator: ai
reviewed: false
categories:
  - Tech Development
  - Deployment & Ops
tags:
  - Podman
  - Commands
top_img: false
copyright_author: Grok
copyright_author_href: https://grok.com/share/bGVnYWN5_17bf1797-dd78-42f9-931b-f69a19a895df
date: 2025-12-24 03:13:00
updated: 2025-12-24 03:13:00
---

Podman Compose is almost fully compatible with docker-compose, and rootless is safer — for everyday development you can just use it as Docker Compose ~

## Core commands (copy and paste ready)

| Command                                  | Description                   | Daily usage frequency |
| ------------------------------------- | ---------------------- | ------------ |
| `podman-compose up -d`                | Start in the background               | ★★★★★        |
| `podman-compose down`                 | Stop and remove containers         | ★★★★★        |
| `podman-compose down -v`              | Remove volumes too (full reset) | ★★★★         |
| `podman-compose ps`                   | Check running status           | ★★★★★        |
| `podman-compose logs -f`              | Watch all logs in real time         | ★★★★         |
| `podman-compose logs -f 服务名`       | Follow a specific service's logs       | ★★★★★        |
| `podman-compose build`                | Rebuild images           | ★★★★         |
| `podman-compose pull`                 | Pull the latest images           | ★★★          |
| `podman-compose restart`              | Restart all services           | ★★★          |
| `podman-compose exec 服务名 bash`     | Enter a container                 | ★★★★★        |
| `podman-compose run --rm 服务名 命令` | Run a one-off task         | ★★★★         |

## The ones I use most (just memorize these)

```sh
# 标准启动
podman-compose up -d --build

# 更新镜像后启动
podman-compose pull && podman-compose up -d --build

# 彻底删光重来（开发时超常用）
podman-compose down -v && podman-compose up -d --build

# 只重启/更新某个服务
podman-compose up -d --build web

# 进容器修东西
podman-compose exec web bash
```