---
title: Podman Compose よく使うコマンド早見表
description: Podman Compose のよく使うコマンド早見表
keywords: 技術開発, デプロイと運用, Podman, コマンド
abbrlink: 61957
permalink: ja/p/61957/
lang: ja
translation_of: _posts/2025-12-24-PodmanCompose常用命令速查.md
source_hash: 36355d3e685b
translator: ai
reviewed: false
categories:
  - 技術開発
  - デプロイと運用
tags:
  - Podman
  - コマンド
top_img: false
copyright_author: Grok
copyright_author_href: https://grok.com/share/bGVnYWN5_17bf1797-dd78-42f9-931b-f69a19a895df
date: 2025-12-24 03:13:00
updated: 2025-12-24 03:13:00
---

Podman Compose は docker-compose とほぼ完全に互換しており、rootless のほうが安全なので、日常の開発ではそのまま Docker Compose として使ってしまって問題ありません～

## 主要コマンド（そのままコピペで使える）

| コマンド                                  | 説明                   | 日常の使用頻度 |
| ------------------------------------- | ---------------------- | ------------ |
| `podman-compose up -d`                | バックグラウンドで起動               | ★★★★★        |
| `podman-compose down`                 | コンテナを停止して削除         | ★★★★★        |
| `podman-compose down -v`              | ボリュームごと削除（完全リセット） | ★★★★         |
| `podman-compose ps`                   | 実行状態を確認           | ★★★★★        |
| `podman-compose logs -f`              | すべてのログをリアルタイムで確認         | ★★★★         |
| `podman-compose logs -f 服务名`       | 特定のサービスのログを追跡       | ★★★★★        |
| `podman-compose build`                | イメージを再ビルド           | ★★★★         |
| `podman-compose pull`                 | 最新イメージをプル           | ★★★          |
| `podman-compose restart`              | すべてのサービスを再起動           | ★★★          |
| `podman-compose exec 服务名 bash`     | コンテナに入る                 | ★★★★★        |
| `podman-compose run --rm 服务名 命令` | ワンオフタスクを実行         | ★★★★         |

## 特によく使うもの（そのまま覚えてしまえばOK）

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