---
title: maimai DX b50
date: 2025-10-19 02:00:00
type: "mai"
updated: 2025-10-19 02:00:00
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
.player-info {
    background: var(--theme-color);
    padding: 20px;
    border-radius: 15px;
    margin-bottom: 20px;
    color: var(--font-color);
    display: flex;
    justify-content: space-around;
    align-items: center;
    flex-wrap: wrap;
    gap: 20px;
}

.rating-box {
    background: rgba(255, 255, 255, 0.2);
    padding: 15px 25px;
    border-radius: 10px;
    text-align: center;
}

.rating-label {
    font-size: 0.9rem;
    opacity: 0.8;
    margin-bottom: 5px;
}

.rating-value {
    font-size: 1.8rem;
    font-weight: bold;
}

.b50-sections {
    display: grid;
    gap: 30px;
    margin-bottom: 30px;
}

.section-stats {
    color: var(--font-color);
    text-align: center;
    margin-bottom: 15px;
    font-size: 0.9rem;
}

.scores-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
    gap: 15px;
}

.score-card {
    background: var(--global-bg);
    border-radius: 12px;
    padding: 12px;
    box-shadow: 0 6px 20px rgba(0, 0, 0, 0.1);
    transition: transform 0.3s ease, box-shadow 0.3s ease;
    cursor: pointer;
    position: relative;
}

.score-card:hover {
    transform: translateY(-3px);
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
}

.rank-badge {
    position: absolute;
    top: -8px;
    left: -8px;
    background: #ff6b6b;
    color: #fff;
    width: 30px;
    height: 30px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: bold;
    font-size: 0.8rem;
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
}

.jacket {
    max-width: 100%;
    border-radius: 8px;
    object-fit: cover;
    margin-bottom: 8px;
    background: var(--global-bg);
}

.song-info {
    text-align: center;
}

.song-name {
    font-weight: bold;
    font-size: 0.8rem;
    margin-bottom: 4px;
    color: var(--font-color);
    line-height: 1.2;
    height: 2.4em;
    overflow: hidden;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
}

.level {
    display: inline-block;
    background: #ff6b6b;
    color: #fff;
    padding: 2px 6px;
    border-radius: 8px;
    font-size: 0.7rem;
    margin-bottom: 3px;
}

.achievements {
    font-size: 0.8rem;
    color: var(--font-color);
    opacity: 0.75;
    margin-bottom: 2px;
}

.rating {
    font-size: 0.75rem;
    color: var(--font-color);
    opacity: 0.6;
    font-weight: bold;
}

.loading {
    text-align: center;
    color: var(--font-color);
    font-size: 1.2rem;
    grid-column: 1 / -1;
}

.detail-modal {
    display: none;
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.3);
    backdrop-filter: blur(8px);
    z-index: 1000;
    align-items: center;
    justify-content: center;
}

.modal-content {
    background: var(--global-bg);
    padding: 30px;
    border-radius: 20px;
    max-width: 500px;
    width: 90%;
    text-align: center;
    max-height: 90vh;
    overflow-y: auto;
}

.close-modal {
    position: absolute;
    top: 20px;
    right: 20px;
    color: var(--font-color);
    font-size: 2rem;
    cursor: pointer;
    z-index: 1001;
}

.modal-badge {
    display: inline-block;
    background: #ff6b6b;
    color: #fff;
    padding: 4px 12px;
    border-radius: 15px;
    font-size: 0.85rem;
}

.modal-badge-type {
    background: #4ecdc4;
    margin-left: 8px;
}

@media (max-width: 768px) {
    .b50-sections {
        grid-template-columns: 1fr;
    }

    .player-info {
        margin-bottom: 0px;
        gap: 0px;
        padding: 0px;
    }

    .detail-modal {
        background: var(--global-bg);
    }

    .scores-grid {
        grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
    }
}
</style>

<div class="container">
<div class="player-info" id="playerInfo">
<div class="rating-box">
<div class="rating-label">Rating</div>
<div class="rating-value" id="totalRating">-</div>
</div>
<div class="rating-box">
<div class="rating-label">DX</div>
<div class="rating-value" id="dxRating">-</div>
</div>
<div class="rating-box">
<div class="rating-label">标准</div>
<div class="rating-value" id="standardRating">-</div>
</div>
</div>
<div class="b50-sections">
<div class="dx-section">

## DX

<div class="section-stats" id="dxStats">共 0 首歌曲</div>
<div class="scores-grid" id="dxScores">
<div class="loading">加载中...</div>
</div>
</div>
<div class="standard-section">

## 标准

<div class="section-stats" id="standardStats">共 0 首歌曲</div>
<div class="scores-grid" id="standardScores">
<div class="loading">加载中...</div>
</div>
</div>
</div>
</div>
<div class="detail-modal" id="detailModal">
<div class="close-modal">×</div>
<div class="modal-content" id="modalContent">
</div>
</div>
<script data-pjax src="/js/mai-b50.js"></script>
