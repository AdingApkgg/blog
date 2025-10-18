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
    color: var(--font-color);
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
    color: var(--font-color);
    padding: 2px 6px;
    border-radius: 8px;
    font-size: 0.7rem;
    margin-bottom: 3px;
}

.achievements {
    font-size: 0.8rem;
    color: #666;
    margin-bottom: 2px;
}

.rating {
    font-size: 0.75rem;
    color: #888;
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
<div class="close-modal" onclick="closeModal()">×</div>
<div class="modal-content" id="modalContent">
</div>
</div>
<script>
const token = "5xyMaPC0gE-h5qPUY2MHh30eYlv5bb_rSvJLlK27v_w=";
const friendCode = "367165286529031";
let dxScores = [];
let standardScores = [];
fetch(
"https://vn-rank-api.adingapkgg.workers.dev/?target=https://maimai.lxns.net/api/v0/maimai/player/" +
friendCode +
"/bests",
{
method: "GET",
headers: {
Authorization: token,
"Content-Type": "application/json",
},
}
)
.then((response) => {
if (!response.ok) {
throw new Error("网络响应不正常");
}
return response.json();
})
.then((data) => {
console.log("获取到的B50数据:", data);
processB50Data(data);
})
.catch((error) => {
console.error("请求失败:", error);
document.getElementById("dxScores").innerHTML =
document.getElementById("standardScores").innerHTML =
'<div class="loading">加载失败，请检查网络连接</div>';
});
function processB50Data(data) {
// B50 数据的结构：data.data.dx 和 data.data.standard
dxScores = data.data.dx || [];
standardScores = data.data.standard || [];
// 更新统计信息
document.getElementById(
"dxStats"
).textContent = `共 ${dxScores.length} 首歌曲`;
document.getElementById(
"standardStats"
).textContent = `共 ${standardScores.length} 首歌曲`;
// 计算 Rating
calculateRatings(data.data);
// 渲染两个区域的成绩
renderScores(dxScores, "dxScores");
renderScores(standardScores, "standardScores");
}
// 计算 Rating
function calculateRatings(b50Data) {
// 直接从 API 返回的数据中获取总 Rating
const totalRating =
(b50Data.dx_total || 0) + (b50Data.standard_total || 0);
const dxRating = b50Data.dx_total || 0;
const standardRating = b50Data.standard_total || 0;
document.getElementById("totalRating").textContent =
Math.round(totalRating);
document.getElementById("dxRating").textContent = Math.round(dxRating);
document.getElementById("standardRating").textContent =
Math.round(standardRating);
}
// 渲染成绩卡片
function renderScores(scores, containerId) {
const grid = document.getElementById(containerId);
if (scores.length === 0) {
grid.innerHTML = '<div class="loading">暂无成绩数据</div>';
return;
}
grid.innerHTML = scores
.map(
(score, index) => `
<div class="score-card" onclick="showDetail('${containerId}', ${index})">
<div class="rank-badge">${index + 1}</div>
<img
src="https://assets.lxns.net/maimai/jacket/${
score.id
}.png!webp"
alt="${score.song_name}"
class="jacket"
>
<div class="song-info">
<div class="song-name" title="${score.song_name}">${
score.song_name
}</div>
<div class="level">${score.level}</div>
<div class="achievements">${score.achievements.toFixed(
2
)}%</div>
<div class="rating">${
score.dx_rating ? score.dx_rating.toFixed(0) : "N/A"
}</div>
</div>
</div>
`
)
.join("");
}
// 显示详情模态框
function showDetail(section, index) {
let score;
if (section === "dxScores") {
score = dxScores[index];
} else {
score = standardScores[index];
}
if (!score) return;
const modal = document.getElementById("detailModal");
const modalContent = document.getElementById("modalContent");
modalContent.innerHTML = `
<img
src="https://assets.lxns.net/maimai/jacket/${
score.id
}.png!webp"
alt="${score.song_name}"
>
<h2>${score.song_name}</h2>
<div style="margin: 15px 0;">
<span style="background: #ff6b6b; color: var(--font-color); padding: 4px 12px; border-radius: 15px; font-size: 0.9rem;">
B50 #${index + 1}
</span>
<span class="level" style="margin-left: 8px;">${
score.level
}</span>
<span style="margin-left: 8px; background: #4ecdc4; var(--font-color): white; padding: 4px 8px; border-radius: 12px; font-size: 0.8rem;">
${section === "dxScores" ? "DX" : "标准"}
</span>
</div>
<div style="text-align: left; margin: 20px 0;">
<p><strong>达成率:</strong> ${score.achievements.toFixed(
4
)}%</p>
<p><strong>Rating:</strong> ${
score.dx_rating ? score.dx_rating.toFixed(2) : "N/A"
}</p>
<p><strong>FC:</strong> ${score.fc || "无"}</p>
<p><strong>FS:</strong> ${score.fs || "无"}</p>
<p><strong>评级:</strong> ${score.rate || "N/A"}</p>
<p><strong>更新时间:</strong> ${new Date(
score.upload_time
).toLocaleString()}</p>
</div>
${
score.id
? `<audio controls style="width: 100%; margin-top: 15px;" src="https://assets2.lxns.net/maimai/music/${score.id}.mp3"></audio>`
: ""
}
`;
modal.style.display = "flex";
}
// 关闭模态框
function closeModal() {
document.getElementById("detailModal").style.display = "none";
}
// 点击模态框外部关闭
document
.getElementById("detailModal")
.addEventListener("click", function (e) {
if (e.target === this) {
closeModal();
}
});
</script>
