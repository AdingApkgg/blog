---
title: 项目
date: 2026-02-14 05:23:00
updated: 2026-10-31 13:14:00
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

我与 AI 一起养大的东西。大都是全栈自建、自己部署，从数据库到前端都自己盯着。

{% projectCards %}

<style>
.projects-container {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 18px;
  margin: 24px 0 8px;
}

.project-card {
  display: flex;
  flex-direction: column;
  border-radius: 14px;
  background: #fff;
  border: 1px solid rgba(0, 0, 0, 0.09);
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.06);
  overflow: hidden;
  transition: transform 0.25s ease, box-shadow 0.25s ease, border-color 0.25s ease;
}

.project-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 14px 34px rgba(0, 0, 0, 0.12);
  border-color: var(--theme-color);
}

.project-shot {
  display: block;
  width: 100%;
  aspect-ratio: 16 / 9;
  overflow: hidden;
  background: rgba(57, 197, 187, 0.08);
}

.project-shot img {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.45s cubic-bezier(0.4, 0, 0.2, 1);
}

.project-card:hover .project-shot img {
  transform: scale(1.04);
}

/* 截图挂了也保留 16:9 的占位，别让整张卡塌下去打乱多行对齐 */
.project-shot.no-shot {
  background: rgba(0, 0, 0, 0.04);
}

.project-shot.no-shot img {
  display: none;
}

.project-info {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 14px 16px 12px;
}

.project-head {
  display: flex;
  align-items: center;
  gap: 8px;
}

.project-name {
  flex: 1;
  font-size: 1rem;
  font-weight: 700;
  color: #1a1a1a !important;
  text-decoration: none !important;
  transition: color 0.25s ease;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.project-card:hover .project-name {
  color: var(--theme-color) !important;
}

.project-repo {
  flex: none;
  font-size: 0.95rem;
  color: #8a8a8a !important;
  transition: color 0.25s ease;
}

.project-repo:hover {
  color: var(--theme-color) !important;
}

.project-desc {
  font-size: 0.82rem;
  line-height: 1.6;
  /* 固定两行高度，一句话的卡片和两句话的卡片一样齐 */
  min-height: 3.2em;
  color: #666;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.project-foot {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 4px;
  padding-top: 10px;
  border-top: 1px dashed rgba(0, 0, 0, 0.07);
}

.project-tag {
  font-size: 0.72rem;
  line-height: 1;
  padding: 4px 8px;
  border-radius: 999px;
  color: var(--theme-color);
  background: rgba(57, 197, 187, 0.12);
}

.project-visit {
  font-size: 0.76rem;
  color: #8a8a8a !important;
  text-decoration: none !important;
  transition: color 0.25s ease;
}

.project-visit i {
  font-size: 0.66rem;
  margin-left: 4px;
}

.project-card:hover .project-visit {
  color: var(--theme-color) !important;
}

/* 暗色模式 */
[data-theme="dark"] .project-card {
  background: rgba(38, 38, 38, 0.85);
  border-color: rgba(255, 255, 255, 0.08);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.25);
}

[data-theme="dark"] .project-card:hover {
  box-shadow: 0 14px 34px rgba(0, 0, 0, 0.35);
}

[data-theme="dark"] .project-name {
  color: #e4e4e4 !important;
}

[data-theme="dark"] .project-desc {
  color: #9a9a9a;
}

[data-theme="dark"] .project-shot {
  background: rgba(57, 197, 187, 0.1);
}

[data-theme="dark"] .project-foot {
  border-top-color: rgba(255, 255, 255, 0.08);
}

[data-theme="dark"] .project-shot.no-shot {
  background: rgba(255, 255, 255, 0.04);
}

/* 移动端响应式 */
@media (max-width: 768px) {
  .projects-container {
    grid-template-columns: 1fr;
    gap: 14px;
  }
}
</style>
