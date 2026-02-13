---
title: Podman Compose 常用命令速查
description: Podman Compose 的常用命令速查表
abbrlink: 61957
top_img: false
copyright_author: Grok
copyright_author_href: https://grok.com/share/bGVnYWN5_17bf1797-dd78-42f9-931b-f69a19a895df
categories:
  - DevOps
tags:
  - Podman Compose
  - Docker Compose
  - Container Management
  - Commands
keywords: DevOps, Podman Compose, Docker Compose, Container Management, Commands
date: 2025-12-24 03:13:00
updated: 2025-12-24 03:13:00
---

Podman Compose 几乎完全兼容 docker-compose，rootless 更安全，日常开发直接当 Docker Compose 用就行～

## 核心命令（直接复制粘贴用）

| 命令                                  | 说明                   | 日常使用频率 |
| ------------------------------------- | ---------------------- | ------------ |
| `podman-compose up -d`                | 后台启动               | ★★★★★        |
| `podman-compose down`                 | 停止并删除容器         | ★★★★★        |
| `podman-compose down -v`              | 连卷一起删（彻底重置） | ★★★★         |
| `podman-compose ps`                   | 查看运行状态           | ★★★★★        |
| `podman-compose logs -f`              | 实时看所有日志         | ★★★★         |
| `podman-compose logs -f 服务名`       | 跟踪某个服务日志       | ★★★★★        |
| `podman-compose build`                | 重新构建镜像           | ★★★★         |
| `podman-compose pull`                 | 拉取最新镜像           | ★★★          |
| `podman-compose restart`              | 重启所有服务           | ★★★          |
| `podman-compose exec 服务名 bash`     | 进容器                 | ★★★★★        |
| `podman-compose run --rm 服务名 命令` | 运行一次性任务         | ★★★★         |

## 我最常用的几条（直接背下来就行）

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
