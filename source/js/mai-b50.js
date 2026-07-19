// maimai DX B50 查分页脚本（/mai/）
// 注意：uglify-js 不支持 ?? / ?. 等 ES2020 语法，本文件保持 ES6 语法
(() => {
  const USER_TOKEN = 'TlbtMfvBbw3rImek-aPL0X3HtSRbU6II9VGoiXPesO0='
  const API_URL = 'https://maimai.lxns.net/api/v0/user/maimai/player/bests'
  const CACHE_KEY = 'mai-b50-cache'
  const CACHE_TTL = 10 * 60 * 1000
  const SKELETON_COUNT = 8

  let dxScores = []
  let standardScores = []
  let loading = false

  const $ = id => document.getElementById(id)
  const root = document.getElementById('mai-b50')
  // 页面元素不存在（非 /mai 页误加载）时直接退出
  if (!root || !$('dxScores') || !$('standardScores') || !$('detailModal')) return
  // pjax 离开时可能残留的滚动锁，进入页面先复位
  document.documentElement.style.overflow = ''

  const escapeHtml = str => String(str == null ? '' : str).replace(/[&<>"']/g, c => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  }[c]))

  const jacketUrl = id => `https://assets.lxns.net/maimai/jacket/${Number(id)}.png!webp`

  /* ---------- 展示格式化 ---------- */
  // level_index: 0 BASIC / 1 ADVANCED / 2 EXPERT / 3 MASTER / 4 Re:MASTER
  const diffClass = score => {
    const i = Number(score.level_index)
    return i >= 0 && i <= 4 ? `mai-diff-${i}` : 'mai-diff-3'
  }
  // fc/fs 是 API 的小写代码 -> [显示文本, 徽章类型]
  const BADGES = {
    fc: ['FC', 'fc'], fcp: ['FC+', 'fc'],
    ap: ['AP', 'ap'], app: ['AP+', 'ap'],
    sync: ['SYNC', 'fs'], fs: ['FS', 'fs'], fsp: ['FS+', 'fs'],
    fsd: ['FSD', 'fsd'], fsdp: ['FSD+', 'fsd']
  }
  const badgeHtml = code => {
    const b = BADGES[code]
    return b ? `<span class="mai-chip mai-chip-${b[1]}">${b[0]}</span>` : ''
  }
  // 评级：sssp -> SSS+
  const fmtRate = v => (v ? v.toUpperCase().replace(/P$/, '+') : 'N/A')
  const rateClass = r => {
    if (!r) return ''
    if (r === 'sssp') return 'mai-rate-max'
    if (r[0] === 's') return 'mai-rate-s'
    if (r[0] === 'a') return 'mai-rate-a'
    if (r[0] === 'b') return 'mai-rate-b'
    return 'mai-rate-c'
  }
  const fmtNum = (v, digits) => (typeof v === 'number' ? v.toFixed(digits) : 'N/A')

  /* ---------- 缓存 ---------- */
  const readCache = () => {
    try {
      const raw = sessionStorage.getItem(CACHE_KEY)
      if (!raw) return null
      const cached = JSON.parse(raw)
      return Date.now() - cached.time > CACHE_TTL ? null : cached
    } catch (e) {
      return null
    }
  }

  const writeCache = data => {
    try {
      sessionStorage.setItem(CACHE_KEY, JSON.stringify({ time: Date.now(), data }))
    } catch (e) { /* 存储不可用时忽略 */ }
  }

  /* ---------- 渲染 ---------- */
  const renderSkeletons = () => {
    const item = '<div class="mai-skeleton"><div class="mai-skeleton-jacket"></div><div class="mai-skeleton-line"></div><div class="mai-skeleton-line short"></div></div>'
    $('dxScores').innerHTML = item.repeat(SKELETON_COUNT)
    $('standardScores').innerHTML = item.repeat(SKELETON_COUNT)
  }

  const cardHtml = (score, index, section) => {
    const name = escapeHtml(score.song_name)
    return `
      <div class="mai-card mai-in ${diffClass(score)}" style="animation-delay:${Math.min(index * 35, 700)}ms" data-section="${section}" data-index="${index}" tabindex="0" role="button" aria-label="${name} 详情">
        <div class="mai-jacket-wrap">
          <img class="mai-jacket" src="${jacketUrl(score.id)}" alt="${name}" loading="lazy" decoding="async">
          <span class="mai-rank">#${index + 1}</span>
          <span class="mai-type ${score.type === 'dx' ? 'is-dx' : 'is-sd'}">${score.type === 'dx' ? 'DX' : '标准'}</span>
          <span class="mai-card-badges">${badgeHtml(score.fc)}${badgeHtml(score.fs)}</span>
        </div>
        <div class="mai-card-body">
          <div class="mai-song" title="${name}">${name}</div>
          <div class="mai-meta">
            <span class="mai-level">${escapeHtml(score.level)}</span>
            <span class="mai-rate ${rateClass(score.rate)}">${fmtRate(score.rate)}</span>
          </div>
          <div class="mai-stats">
            <span class="mai-ach">${fmtNum(score.achievements, 2)}%</span>
            <span class="mai-ra">${fmtNum(score.dx_rating, 0)}</span>
          </div>
        </div>
      </div>`
  }

  const renderScores = (scores, containerId, section) => {
    const grid = $(containerId)
    if (!scores.length) {
      grid.innerHTML = '<div class="mai-empty">暂无成绩数据</div>'
      return
    }
    grid.innerHTML = scores.map((score, index) => cardHtml(score, index, section)).join('')
  }

  const renderAll = (data, time) => {
    dxScores = data.dx || []
    standardScores = data.standard || []
    const dxTotal = data.dx_total || 0
    const stdTotal = data.standard_total || 0
    $('totalRating').textContent = Math.round(dxTotal + stdTotal)
    $('dxRating').textContent = Math.round(dxTotal)
    $('standardRating').textContent = Math.round(stdTotal)
    $('dxStats').textContent = `b15 · ${dxScores.length} 首`
    $('standardStats').textContent = `b35 · ${standardScores.length} 首`
    $('maiUpdated').textContent = `更新于 ${new Date(time).toLocaleString('zh-CN', { hour12: false })}`
    renderScores(dxScores, 'dxScores', 'dx')
    renderScores(standardScores, 'standardScores', 'std')
  }

  const showError = message => {
    $('dxScores').innerHTML =
      `<div class="mai-empty"><p>${escapeHtml(message)}</p><button type="button" class="mai-btn mai-retry">重试</button></div>`
    $('standardScores').innerHTML = '<div class="mai-empty">—</div>'
  }

  /* ---------- 详情弹窗 ---------- */
  const showDetail = (section, index) => {
    const score = (section === 'dx' ? dxScores : standardScores)[index]
    if (!score) return
    const name = escapeHtml(score.song_name)
    const uploadTime = score.upload_time
      ? new Date(score.upload_time).toLocaleString('zh-CN', { hour12: false })
      : '未知'
    $('modalContent').innerHTML = `
      <div class="mai-modal-head ${diffClass(score)}">
        <img class="mai-modal-jacket" src="${jacketUrl(score.id)}" alt="${name}" decoding="async">
        <div class="mai-modal-title">
          <h3 title="${name}">${name}</h3>
          <div class="mai-modal-chips">
            <span class="mai-level">${escapeHtml(score.level)}</span>
            <span class="mai-type-chip ${score.type === 'dx' ? 'is-dx' : 'is-sd'}">${score.type === 'dx' ? 'DX' : '标准'}</span>
            <span class="mai-b50-chip">B50 #${index + 1}</span>
          </div>
          <div class="mai-modal-rate ${rateClass(score.rate)}">${fmtRate(score.rate)}</div>
        </div>
      </div>
      <div class="mai-modal-stats">
        <div class="mai-stat"><span class="mai-stat-label">达成率</span><span class="mai-stat-value">${fmtNum(score.achievements, 4)}%</span></div>
        <div class="mai-stat"><span class="mai-stat-label">Rating</span><span class="mai-stat-value mai-ra">${fmtNum(score.dx_rating, 2)}</span></div>
        <div class="mai-stat"><span class="mai-stat-label">FC</span><span class="mai-stat-value">${badgeHtml(score.fc) || '—'}</span></div>
        <div class="mai-stat"><span class="mai-stat-label">FS</span><span class="mai-stat-value">${badgeHtml(score.fs) || '—'}</span></div>
        <div class="mai-stat"><span class="mai-stat-label">DX 分数</span><span class="mai-stat-value">${typeof score.dx_score === 'number' ? score.dx_score : '—'}</span></div>
        <div class="mai-stat"><span class="mai-stat-label">游玩时间</span><span class="mai-stat-value">${uploadTime}</span></div>
      </div>
      ${Number(score.id) ? `<audio controls preload="none" src="https://assets2.lxns.net/maimai/music/${Number(score.id)}.mp3"></audio>` : ''}`
    $('detailModal').classList.add('open')
    document.documentElement.style.overflow = 'hidden'
  }

  const closeModal = () => {
    const modal = $('detailModal')
    if (!modal.classList.contains('open')) return
    modal.classList.remove('open')
    document.documentElement.style.overflow = ''
    const audio = modal.querySelector('audio')
    if (audio) audio.pause()
  }

  /* ---------- 数据加载 ---------- */
  const load = force => {
    if (loading) return
    if (!force) {
      const cached = readCache()
      if (cached) {
        renderAll(cached.data, cached.time)
        return
      }
    }
    loading = true
    root.classList.add('is-loading')
    renderSkeletons()
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
        renderAll(json.data, Date.now())
      })
      .catch(error => {
        console.error('B50 数据获取失败:', error)
        showError(`加载失败：${error.message}`)
      })
      .finally(() => {
        loading = false
        root.classList.remove('is-loading')
      })
  }

  /* ---------- 事件（委托到 root，元素随 pjax 整体替换无需解绑） ---------- */
  const activateCard = card => showDetail(card.dataset.section, Number(card.dataset.index))
  root.addEventListener('click', e => {
    const card = e.target.closest('.mai-card')
    if (card) return activateCard(card)
    if (e.target.closest('#maiRefresh') || e.target.closest('.mai-retry')) return load(true)
    if (e.target.closest('.mai-modal-close')) return closeModal()
    if (e.target.classList.contains('mai-modal')) closeModal()
  })
  root.addEventListener('keydown', e => {
    if (e.key !== 'Enter' && e.key !== ' ') return
    const card = e.target.closest('.mai-card')
    if (card) {
      e.preventDefault()
      activateCard(card)
    }
  })
  // 封面加载失败时隐藏图片，露出占位渐变（error 不冒泡，用捕获）
  root.addEventListener('error', e => {
    if (e.target.classList && e.target.classList.contains('mai-jacket')) {
      e.target.style.visibility = 'hidden'
    }
  }, true)
  // document 级监听用 AbortController 管理，防止 pjax 反复进入时重复绑定
  if (window.__maiAbort) window.__maiAbort.abort()
  window.__maiAbort = new AbortController()
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') closeModal()
  }, { signal: window.__maiAbort.signal })

  load(false)
})()
