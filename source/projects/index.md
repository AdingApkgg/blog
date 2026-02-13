---
title: 项目
date: 2026-02-14 05:23:00
updated: 2026-02-14 05:23:00
type: "projects"
comments: false
description: 我的开源项目与作品展示
keywords: "projects, 项目, 作品"
top_img: false
mathjax:
katex:
aside:
aplayer:
highlight_shrink:
---

我与 AI 孕育的一些小项目~

{% projectCards %}

<style>
.projects-container {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
  margin: 20px 0;
}

.project-card {
  display: flex;
  flex-direction: column;
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.75);
  border: 1px solid rgba(0, 0, 0, 0.06);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  text-decoration: none !important;
  color: inherit !important;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: pointer;
  overflow: hidden;
}

.project-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.12);
  border-color: var(--theme-color);
}

.project-card:hover .project-name {
  color: var(--theme-color);
}

.project-card:hover .project-screenshot img {
  transform: scale(1.05);
}

.project-screenshot {
  width: 100%;
  aspect-ratio: 16 / 9;
  overflow: hidden;
  background: rgba(57, 197, 187, 0.08);
}

.project-screenshot img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.project-info {
  padding: 16px 18px;
}

.project-name {
  font-size: 1.1rem;
  font-weight: 700;
  margin-bottom: 6px;
  transition: color 0.3s ease;
  color: #1a1a1a;
}

.project-desc {
  font-size: 0.85rem;
  color: #666;
  line-height: 1.6;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* 暗色模式 */
[data-theme="dark"] .project-card {
  background: rgba(40, 40, 40, 0.8);
  border-color: rgba(255, 255, 255, 0.08);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
}

[data-theme="dark"] .project-card:hover {
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.3);
  border-color: var(--theme-color);
}

[data-theme="dark"] .project-name {
  color: #e0e0e0;
}

[data-theme="dark"] .project-desc {
  color: #999;
}

[data-theme="dark"] .project-screenshot {
  background: rgba(57, 197, 187, 0.12);
}

/* 移动端响应式 */
@media (max-width: 768px) {
  .projects-container {
    grid-template-columns: 1fr;
    gap: 16px;
  }
}
</style>
