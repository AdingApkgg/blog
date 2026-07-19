// maimai DX B50 查分页脚本（/mai/）
// 注意：uglify-js 不支持 ?? / ?. 等 ES2020 语法，本文件保持 ES6 语法
(() => {
  const USER_TOKEN = 'TlbtMfvBbw3rImek-aPL0X3HtSRbU6II9VGoiXPesO0='
  const API_URL = 'https://maimai.lxns.net/api/v0/user/maimai/player/bests'
  const CACHE_KEY = 'mai-b50-cache'
  const CACHE_TTL = 10 * 60 * 1000

  let dxScores = []
  let standardScores = []

  const $ = id => document.getElementById(id)
  // 页面元素不存在（非 /mai 页误加载）时直接退出
  if (!$('dxScores') || !$('standardScores') || !$('detailModal')) return

  const escapeHtml = str => String(str == null ? '' : str).replace(/[&<>"']/g, c => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  }[c]))

  const jacketUrl = id => `https://assets.lxns.net/maimai/jacket/${Number(id)}.png!webp`

  // fc/fs 是 API 的小写代码，映射为通用写法
  const BADGE_LABELS = {
    fc: 'FC', fcp: 'FC+', ap: 'AP', app: 'AP+',
    sync: 'SYNC', fs: 'FS', fsp: 'FS+', fsd: 'FSD', fsdp: 'FSD+'
  }
  const fmtBadge = v => (v ? BADGE_LABELS[v] || v.toUpperCase() : '无')
  // 评级：sssp -> SSS+
  const fmtRate = v => (v ? v.toUpperCase().replace(/P$/, '+') : 'N/A')
  const fmtNum = (v, digits) => (typeof v === 'number' ? v.toFixed(digits) : 'N/A')

  const showError = message => {
    $('dxScores').innerHTML = $('standardScores').innerHTML =
      `<div class="loading">${escapeHtml(message)}</div>`
  }

  const readCache = () => {
    try {
      const raw = sessionStorage.getItem(CACHE_KEY)
      if (!raw) return null
      const cached = JSON.parse(raw)
      return Date.now() - cached.time > CACHE_TTL ? null : cached.data
    } catch (e) {
      return null
    }
  }

  const writeCache = data => {
    try {
      sessionStorage.setItem(CACHE_KEY, JSON.stringify({ time: Date.now(), data }))
    } catch (e) { /* 存储不可用时忽略 */ }
  }

  const renderScores = (scores, containerId) => {
    const grid = $(containerId)
    if (!scores.length) {
      grid.innerHTML = '<div class="loading">暂无成绩数据</div>'
      return
    }
    grid.innerHTML = scores.map((score, index) => `
      <div class="score-card" data-section="${containerId}" data-index="${index}">
        <div class="rank-badge">${index + 1}</div>
        <img src="${jacketUrl(score.id)}" alt="${escapeHtml(score.song_name)}" class="jacket" loading="lazy" decoding="async">
        <div class="song-info">
          <div class="song-name" title="${escapeHtml(score.song_name)}">${escapeHtml(score.song_name)}</div>
          <div class="level">${escapeHtml(score.level)}</div>
          <div class="achievements">${fmtNum(score.achievements, 2)}%</div>
          <div class="rating">${fmtNum(score.dx_rating, 0)}</div>
        </div>
      </div>`).join('')
  }

  const processB50Data = data => {
    dxScores = data.dx || []
    standardScores = data.standard || []
    $('dxStats').textContent = `共 ${dxScores.length} 首歌曲`
    $('standardStats').textContent = `共 ${standardScores.length} 首歌曲`
    const dxTotal = data.dx_total || 0
    const stdTotal = data.standard_total || 0
    $('totalRating').textContent = Math.round(dxTotal + stdTotal)
    $('dxRating').textContent = Math.round(dxTotal)
    $('standardRating').textContent = Math.round(stdTotal)
    renderScores(dxScores, 'dxScores')
    renderScores(standardScores, 'standardScores')
  }

  const showDetail = (section, index) => {
    const score = (section === 'dxScores' ? dxScores : standardScores)[index]
    if (!score) return
    const uploadTime = score.upload_time ? new Date(score.upload_time).toLocaleString() : '未知'
    $('modalContent').innerHTML = `
      <img src="${jacketUrl(score.id)}" alt="${escapeHtml(score.song_name)}" class="jacket" decoding="async">
      <h2>${escapeHtml(score.song_name)}</h2>
      <div style="margin: 15px 0;">
        <span class="modal-badge">B50 #${index + 1}</span>
        <span class="level" style="margin-left: 8px;">${escapeHtml(score.level)}</span>
        <span class="modal-badge modal-badge-type">${section === 'dxScores' ? 'DX' : '标准'}</span>
      </div>
      <div style="text-align: left; margin: 20px 0;">
        <p><strong>达成率:</strong> ${fmtNum(score.achievements, 4)}%</p>
        <p><strong>Rating:</strong> ${fmtNum(score.dx_rating, 2)}</p>
        <p><strong>FC:</strong> ${fmtBadge(score.fc)}</p>
        <p><strong>FS:</strong> ${fmtBadge(score.fs)}</p>
        <p><strong>评级:</strong> ${fmtRate(score.rate)}</p>
        <p><strong>更新时间:</strong> ${uploadTime}</p>
      </div>
      ${Number(score.id) ? `<audio controls preload="none" style="width: 100%; margin-top: 15px;" src="https://assets2.lxns.net/maimai/music/${Number(score.id)}.mp3"></audio>` : ''}`
    $('detailModal').style.display = 'flex'
  }

  const closeModal = () => {
    const modal = $('detailModal')
    modal.style.display = 'none'
    const audio = modal.querySelector('audio')
    if (audio) audio.pause()
  }

  // 事件委托：卡片元素随 pjax 替换，监听器挂在容器上即可
  const onCardClick = e => {
    const card = e.target.closest('.score-card')
    if (card) showDetail(card.dataset.section, Number(card.dataset.index))
  }
  $('dxScores').addEventListener('click', onCardClick)
  $('standardScores').addEventListener('click', onCardClick)
  $('detailModal').addEventListener('click', e => {
    if (e.target === e.currentTarget || e.target.classList.contains('close-modal')) closeModal()
  })
  // document 级监听用 AbortController 管理，防止 pjax 反复进入时重复绑定
  if (window.__maiAbort) window.__maiAbort.abort()
  window.__maiAbort = new AbortController()
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') closeModal()
  }, { signal: window.__maiAbort.signal })

  // 10 分钟会话缓存：pjax 来回切换不重复请求
  const cached = readCache()
  if (cached) {
    processB50Data(cached)
    return
  }
  fetch(API_URL, { headers: { 'X-User-Token': USER_TOKEN } })
    .then(response => {
      if (!response.ok) {
        throw new Error(response.status === 401 ? 'API 令牌无效或已过期' : `请求失败 (HTTP ${response.status})`)
      }
      return response.json()
    })
    .then(json => {
      if (!json.success || !json.data) throw new Error(json.message || '接口返回异常')
      writeCache(json.data)
      processB50Data(json.data)
    })
    .catch(error => {
      console.error('B50 数据获取失败:', error)
      showError(`加载失败：${error.message}`)
    })
})()
