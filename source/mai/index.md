---
title: maimai DX b50
date: 2025-10-19 02:00:00
type: "mai"
updated: 2026-07-19 14:00:00
comments: false
description: 舞萌 maimai DX b50 rt 分数查询
keywords: "maimai dx, b50, b35, b15, rt, 分数, 舞萌"
top_img: false
mathjax:
katex:
aside:
aplayer:
highlight_shrink:
---

<style>
/* ==================== 樱粉主题 · 设计 token ==================== */
#mai-b50 {
    --mai-accent: #ec6aa4;
    --mai-accent-2: #a78bfa;
    --mai-accent-soft: rgba(236, 106, 164, 0.12);
    --mai-muted: rgba(150, 110, 135, 0.07);
    --mai-card-bg: var(--card-bg, #fff);
    --mai-border: rgba(150, 110, 135, 0.16);
    --mai-text: var(--font-color, #4c4948);
    --mai-radius: 16px;
    --mai-shadow: 0 2px 10px rgba(190, 120, 160, 0.08);
    --mai-shadow-hover: 0 10px 28px rgba(190, 120, 160, 0.22);
}

[data-theme="dark"] #mai-b50 {
    --mai-accent: #f28cb8;
    --mai-accent-soft: rgba(242, 140, 184, 0.14);
    --mai-muted: rgba(255, 255, 255, 0.05);
    --mai-border: rgba(255, 255, 255, 0.09);
    --mai-shadow: 0 2px 10px rgba(0, 0, 0, 0.25);
    --mai-shadow-hover: 0 10px 28px rgba(0, 0, 0, 0.45);
}

#mai-b50 {
    color: var(--mai-text);
}

/* ==================== 顶部信息卡 ==================== */
.mai-hero {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 20px;
    padding: 22px 26px;
    border-radius: 20px;
    border: 1px solid var(--mai-border);
    background: linear-gradient(135deg, var(--mai-accent-soft), rgba(167, 139, 250, 0.1));
    margin-bottom: 26px;
}

.mai-rating-label {
    font-size: 0.72rem;
    letter-spacing: 0.18em;
    font-weight: 800;
    color: var(--mai-accent);
}

.mai-rating-value {
    font-size: 2.6rem;
    font-weight: 900;
    line-height: 1.15;
    font-variant-numeric: tabular-nums;
    background: linear-gradient(135deg, var(--mai-accent), var(--mai-accent-2));
    -webkit-background-clip: text;
    background-clip: text;
    color: transparent;
}

.mai-hero-sub {
    display: flex;
    gap: 10px;
}

.mai-sub-chip {
    background: var(--mai-card-bg);
    border: 1px solid var(--mai-border);
    border-radius: 12px;
    padding: 8px 16px;
    text-align: center;
}

.mai-sub-label {
    display: block;
    font-size: 0.7rem;
    opacity: 0.6;
}

.mai-sub-value {
    font-weight: 800;
    font-size: 1.1rem;
    font-variant-numeric: tabular-nums;
}

.mai-hero-actions {
    margin-left: auto;
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: 8px;
}

.mai-updated {
    font-size: 0.72rem;
    opacity: 0.55;
}

.mai-btn {
    border: none;
    cursor: pointer;
    background: var(--mai-accent);
    color: #fff;
    font-weight: 700;
    font-size: 0.8rem;
    padding: 7px 18px;
    border-radius: 999px;
    transition: filter 0.2s, transform 0.1s;
}

.mai-btn:hover {
    filter: brightness(1.07);
}

.mai-btn:active {
    transform: translateY(1px);
}

#mai-b50.is-loading #maiRefresh {
    opacity: 0.6;
    pointer-events: none;
}

/* ==================== 区块标题 ==================== */
.mai-section {
    margin-bottom: 30px;
}

.mai-section-head {
    display: flex;
    align-items: baseline;
    gap: 10px;
    margin-bottom: 14px;
}

#mai-b50 .mai-section-head h2 {
    margin: 0 !important;
    padding: 0 !important;
    border: none !important;
    font-size: 1.25rem;
    font-weight: 800;
}

#mai-b50 .mai-section-head h2::before,
#mai-b50 .mai-section-head h2::after,
#mai-b50 .mai-modal-title h3::before,
#mai-b50 .mai-modal-title h3::after {
    display: none !important;
}

.mai-count {
    font-size: 0.75rem;
    font-weight: 700;
    color: var(--mai-accent);
    background: var(--mai-accent-soft);
    border-radius: 999px;
    padding: 2px 10px;
}

/* ==================== 成绩网格与卡片 ==================== */
.mai-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
    gap: 14px;
}

.mai-card {
    background: var(--mai-card-bg);
    border: 1px solid var(--mai-border);
    border-radius: var(--mai-radius);
    overflow: hidden;
    cursor: pointer;
    outline: none;
    box-shadow: var(--mai-shadow);
    transition: transform 0.25s ease, box-shadow 0.25s ease, border-color 0.25s ease;
}

.mai-card:hover,
.mai-card:focus-visible {
    transform: translateY(-4px);
    box-shadow: var(--mai-shadow-hover);
    border-color: var(--mai-accent);
}

.mai-in {
    animation: maiIn 0.5s cubic-bezier(0.22, 1, 0.36, 1) backwards;
}

@keyframes maiIn {
    from {
        opacity: 0;
        transform: translateY(14px);
    }
    to {
        opacity: 1;
        transform: none;
    }
}

.mai-jacket-wrap {
    position: relative;
    aspect-ratio: 1;
    overflow: hidden;
    background: linear-gradient(135deg, var(--mai-accent-soft), rgba(167, 139, 250, 0.12));
}

#mai-b50 .mai-jacket {
    width: 100%;
    height: 100%;
    object-fit: cover;
    margin: 0 !important;
    border-radius: 0 !important;
    transition: transform 0.35s ease;
}

.mai-card:hover .mai-jacket {
    transform: scale(1.06);
}

.mai-rank {
    position: absolute;
    top: 8px;
    left: 8px;
    padding: 2px 8px;
    border-radius: 999px;
    background: rgba(0, 0, 0, 0.55);
    color: #fff;
    font-size: 0.7rem;
    font-weight: 700;
    backdrop-filter: blur(4px);
    -webkit-backdrop-filter: blur(4px);
}

.mai-type {
    position: absolute;
    top: 8px;
    right: 8px;
    padding: 2px 8px;
    border-radius: 999px;
    color: #fff;
    font-size: 0.66rem;
    font-weight: 800;
}

.mai-type.is-dx,
.mai-type-chip.is-dx {
    background: linear-gradient(135deg, #ffb547, #ff7847);
}

.mai-type.is-sd,
.mai-type-chip.is-sd {
    background: #58a0f6;
}

.mai-card-badges {
    position: absolute;
    bottom: 8px;
    right: 8px;
    display: flex;
    gap: 4px;
}

.mai-chip {
    display: inline-block;
    padding: 1px 7px;
    border-radius: 999px;
    color: #fff;
    font-size: 0.64rem;
    font-weight: 800;
    line-height: 1.5;
}

.mai-chip-fc { background: #35b05f; }
.mai-chip-ap { background: linear-gradient(135deg, #f7a300, #ff7847); }
.mai-chip-fs { background: #58a0f6; }
.mai-chip-fsd { background: #8d7bf5; }

.mai-card-body {
    padding: 10px 12px 12px;
}

.mai-song {
    font-weight: 700;
    font-size: 0.85rem;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.mai-meta {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
    margin-top: 6px;
}

.mai-level {
    display: inline-block;
    padding: 1px 9px;
    border-radius: 999px;
    color: #fff;
    font-size: 0.72rem;
    font-weight: 700;
}

/* maimai 难度配色：BASIC / ADVANCED / EXPERT / MASTER / Re:MASTER */
.mai-diff-0 .mai-level { background: #52ba5e; }
.mai-diff-1 .mai-level { background: #f5a623; }
.mai-diff-2 .mai-level { background: #f45c6f; }
.mai-diff-3 .mai-level { background: #9558d6; }
.mai-diff-4 .mai-level { background: #b57ef0; }

.mai-rate {
    font-weight: 800;
    font-size: 0.8rem;
}

.mai-rate-s { color: #f7a300; }
.mai-rate-a { color: #f4756a; }
.mai-rate-b { color: #5ca8f6; }
.mai-rate-c { color: #9aa0a6; }

.mai-rate-max {
    background: linear-gradient(90deg, #f7a300, #f45c8a, #8f6bf0);
    -webkit-background-clip: text;
    background-clip: text;
    color: transparent;
}

.mai-stats {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    margin-top: 6px;
}

.mai-ach {
    font-size: 0.85rem;
    font-weight: 600;
    opacity: 0.85;
    font-variant-numeric: tabular-nums;
}

.mai-ra {
    color: var(--mai-accent);
    font-weight: 800;
    font-size: 0.8rem;
    font-variant-numeric: tabular-nums;
}

/* ==================== 骨架屏 ==================== */
.mai-skeleton {
    border: 1px solid var(--mai-border);
    border-radius: var(--mai-radius);
    overflow: hidden;
    padding-bottom: 12px;
    background: var(--mai-card-bg);
}

.mai-skeleton-jacket {
    aspect-ratio: 1;
}

.mai-skeleton-line {
    height: 12px;
    border-radius: 6px;
    margin: 10px 12px 0;
}

.mai-skeleton-line.short {
    width: 55%;
}

.mai-skeleton-jacket,
.mai-skeleton-line {
    background: linear-gradient(100deg, var(--mai-accent-soft) 30%, rgba(167, 139, 250, 0.18) 50%, var(--mai-accent-soft) 70%);
    background-size: 200% 100%;
    animation: maiShimmer 1.4s infinite;
}

@keyframes maiShimmer {
    0% { background-position: 200% 0; }
    100% { background-position: -200% 0; }
}

.mai-empty {
    grid-column: 1 / -1;
    text-align: center;
    padding: 30px 0;
    opacity: 0.65;
}

.mai-empty .mai-btn {
    margin-top: 10px;
}

/* ==================== 详情弹窗 ==================== */
.mai-modal {
    display: none;
    position: fixed;
    inset: 0;
    z-index: 1000;
    background: rgba(0, 0, 0, 0.42);
    backdrop-filter: blur(10px);
    -webkit-backdrop-filter: blur(10px);
    align-items: center;
    justify-content: center;
    padding: 20px;
}

.mai-modal.open {
    display: flex;
    animation: maiFade 0.2s ease;
}

@keyframes maiFade {
    from { opacity: 0; }
}

.mai-modal-card {
    position: relative;
    width: min(540px, 100%);
    max-height: 86vh;
    overflow-y: auto;
    background: var(--mai-card-bg);
    border: 1px solid var(--mai-border);
    border-radius: 20px;
    padding: 24px;
    box-shadow: 0 24px 60px rgba(0, 0, 0, 0.3);
    animation: maiPop 0.28s cubic-bezier(0.22, 1, 0.36, 1);
}

@keyframes maiPop {
    from {
        opacity: 0;
        transform: scale(0.94) translateY(10px);
    }
}

.mai-modal-close {
    position: absolute;
    top: 14px;
    right: 14px;
    width: 32px;
    height: 32px;
    border: none;
    border-radius: 50%;
    background: var(--mai-accent-soft);
    color: var(--mai-accent);
    font-size: 1.1rem;
    line-height: 1;
    cursor: pointer;
    transition: filter 0.2s;
}

.mai-modal-close:hover {
    filter: brightness(1.1);
}

.mai-modal-head {
    display: flex;
    align-items: center;
    gap: 16px;
    margin-bottom: 16px;
}

#mai-b50 .mai-modal-jacket {
    width: 110px;
    height: 110px;
    flex: none;
    object-fit: cover;
    margin: 0 !important;
    border-radius: 14px !important;
}

.mai-modal-title {
    min-width: 0;
}

#mai-b50 .mai-modal-title h3 {
    margin: 0 0 8px !important;
    padding: 0 !important;
    font-size: 1.1rem;
    font-weight: 800;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.mai-modal-chips {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 6px;
    margin-bottom: 6px;
}

.mai-type-chip,
.mai-b50-chip {
    display: inline-block;
    padding: 1px 9px;
    border-radius: 999px;
    color: #fff;
    font-size: 0.7rem;
    font-weight: 800;
}

.mai-b50-chip {
    background: var(--mai-accent);
}

.mai-modal-rate {
    font-size: 1.5rem;
    font-weight: 900;
    line-height: 1.2;
}

.mai-modal-stats {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 8px;
}

.mai-stat {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
    padding: 9px 12px;
    border-radius: 10px;
    background: var(--mai-muted);
}

.mai-stat-label {
    font-size: 0.75rem;
    opacity: 0.6;
    flex: none;
}

.mai-stat-value {
    font-weight: 700;
    font-size: 0.85rem;
    text-align: right;
    font-variant-numeric: tabular-nums;
}

#mai-b50 audio {
    width: 100%;
    margin-top: 16px;
}

/* ==================== 页脚注 ==================== */
.mai-footnote {
    text-align: center;
    font-size: 0.75rem;
    opacity: 0.5;
    margin-top: 8px;
}

.mai-footnote a {
    color: var(--mai-accent);
}

/* ==================== 响应式与动效偏好 ==================== */
@media (max-width: 768px) {
    .mai-hero {
        padding: 16px 18px;
        gap: 14px;
    }

    .mai-rating-value {
        font-size: 2.1rem;
    }

    .mai-grid {
        grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
        gap: 10px;
    }

    .mai-modal {
        padding: 12px;
    }

    .mai-modal-card {
        padding: 18px;
    }

    #mai-b50 .mai-modal-jacket {
        width: 88px;
        height: 88px;
    }
}

@media (prefers-reduced-motion: reduce) {
    #mai-b50 * {
        animation: none !important;
        transition: none !important;
    }
}
</style>

<div id="mai-b50">
<div class="mai-hero">
<div class="mai-hero-main">
<div class="mai-rating-label">RATING</div>
<div class="mai-rating-value" id="totalRating">—</div>
</div>
<div class="mai-hero-sub">
<div class="mai-sub-chip"><span class="mai-sub-label">DX</span><span class="mai-sub-value" id="dxRating">—</span></div>
<div class="mai-sub-chip"><span class="mai-sub-label">标准</span><span class="mai-sub-value" id="standardRating">—</span></div>
</div>
<div class="mai-hero-actions">
<span class="mai-updated" id="maiUpdated"></span>
<button type="button" class="mai-btn" id="maiRefresh">刷新</button>
</div>
</div>
<section class="mai-section">
<div class="mai-section-head"><h2>DX</h2><span class="mai-count" id="dxStats"></span></div>
<div class="mai-grid" id="dxScores"></div>
</section>
<section class="mai-section">
<div class="mai-section-head"><h2>标准</h2><span class="mai-count" id="standardStats"></span></div>
<div class="mai-grid" id="standardScores"></div>
</section>
<div class="mai-modal" id="detailModal" role="dialog" aria-modal="true">
<div class="mai-modal-card">
<button type="button" class="mai-modal-close" aria-label="关闭">×</button>
<div id="modalContent"></div>
</div>
</div>
<div class="mai-footnote">成绩数据来自 <a href="https://maimai.lxns.net/" target="_blank" rel="noopener">落雪查分器</a> · 10 分钟本地缓存</div>
</div>
<script data-pjax src="/js/mai-b50.js"></script>
