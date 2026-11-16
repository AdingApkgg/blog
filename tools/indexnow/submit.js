'use strict'

// IndexNow 提交：把本次构建新增/更新的 URL 推给支持该协议的搜索引擎。
//
// 为什么自己写而不装 zkz098/hexo-indexnow：那个插件 2024-07 已归档，只覆盖
// 「deploy 时提交所有链接」。这里只推 sitemap 里 lastmod 是今天的 URL，
// 并且 key 文件随仓库走，不引入依赖。
//
// 用法：
//   node tools/indexnow/submit.js            # 提交今天的 URL
//   node tools/indexnow/submit.js --dry-run  # 只打印
//   node tools/indexnow/submit.js --all      # 提交 sitemap 全部 URL
//
// IndexNow 端点一次最多 10000 条，超出按批切分。
// Google 不支持 IndexNow，只有 Bing / Yandex / Naver / Seznam 会吃。

const fs = require('fs')
const path = require('path')
const YAML = require('yamljs')

const ROOT = path.resolve(__dirname, '..', '..')
const ENDPOINT = 'https://api.indexnow.org/indexnow'
const BATCH = 10000
const TIMEOUT_MS = 30000

function today () {
  const d = new Date()
  const p = n => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`
}

function loadKey () {
  const files = fs.readdirSync(path.join(ROOT, 'source'))
    .filter(f => /^[0-9a-f]{16,128}\.txt$/.test(f))
  if (files.length === 0) throw new Error('source/ 下没有 IndexNow key 文件')
  if (files.length > 1) throw new Error(`source/ 下有多个 key 文件：${files.join(', ')}`)
  return files[0].replace(/\.txt$/, '')
}

function collectUrls (all) {
  const sitemap = path.join(ROOT, 'public', 'sitemap.xml')
  const xml = fs.readFileSync(sitemap, 'utf8')
  const day = today()
  const urls = []
  for (const m of xml.matchAll(/<url>([\s\S]*?)<\/url>/g)) {
    const block = m[1]
    const loc = block.match(/<loc>([^<]+)<\/loc>/)
    if (!loc) continue
    const lastmod = block.match(/<lastmod>([^<]+)<\/lastmod>/)
    if (!all && (!lastmod || !lastmod[1].startsWith(day))) continue
    urls.push(loc[1])
  }
  return [...new Set(urls)]
}

async function post (host, key, keyLocation, urlList) {
  const res = await fetch(ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
    body: JSON.stringify({ host, key, keyLocation, urlList }),
    signal: AbortSignal.timeout(TIMEOUT_MS)
  })
  return { status: res.status, text: (await res.text()).slice(0, 300) }
}

async function main () {
  const all = process.argv.includes('--all')
  const dry = process.argv.includes('--dry-run')

  const cfg = YAML.load(path.join(ROOT, '_config.yml')) || {}
  const host = String(cfg.url || '').replace(/\/+$/, '').replace(/^https?:\/\//, '')
  if (!host) throw new Error('_config.yml 缺少 url')

  const key = loadKey()
  const keyLocation = `https://${host}/${key}.txt`
  const urls = collectUrls(all)

  if (urls.length === 0) {
    console.log('[indexnow] 本次没有 lastmod 为今天的 URL，跳过')
    return
  }

  console.log(`[indexnow] host=${host} key=${key.slice(0, 8)}… urls=${urls.length}${all ? ' (--all)' : ''}`)
  if (dry) {
    urls.forEach(u => console.log('  ' + u))
    return
  }

  let failed = 0
  for (let i = 0; i < urls.length; i += BATCH) {
    const batch = urls.slice(i, i + BATCH)
    try {
      const r = await post(host, key, keyLocation, batch)
      console.log(`[indexnow] 批次 ${i / BATCH + 1}: HTTP ${r.status}${r.text ? ' ' + r.text : ''}`)
      if (r.status >= 400) failed++
    } catch (err) {
      failed++
      console.error(`[indexnow] 批次 ${i / BATCH + 1} 失败：${err.message}`)
    }
  }

  console.log(`[indexnow] 完成，失败批次 ${failed}`)
  if (failed) process.exitCode = 1
}

main().catch(err => {
  console.error('[indexnow] ' + err.message)
  process.exitCode = 1
})
