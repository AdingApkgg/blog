'use strict'

/**
 * 为 hexo server 的媒体文件添加 Range 请求支持
 * hexo-server 的 route 中间件用 stream.pipe(res) 直接传输，
 * 不支持 Range 请求，导致 <video> / <audio> 无法 seek。
 * 此脚本在 route 中间件之前拦截媒体文件请求，用 fs 直接读取并支持 Range。
 */

const path = require('path')
const fs = require('fs')
const mime = require('mime')

const MEDIA_EXTS = new Set([
  '.mp4', '.webm', '.ogg', '.ogv', '.mov', '.avi', '.mkv',
  '.mp3', '.wav', '.flac', '.m4a', '.aac', '.opus',
])

hexo.extend.filter.register('server_middleware', function (app) {
  const { source_dir, root } = this.config

  // 优先于 route 中间件（priority 5 < 默认 10）
  app.use(root, (req, res, next) => {
    if (req.method !== 'GET' && req.method !== 'HEAD') return next()

    const url = decodeURIComponent(req.url.split('?')[0])
    const ext = path.extname(url).toLowerCase()

    if (!MEDIA_EXTS.has(ext)) return next()

    // 尝试从 source 目录查找文件
    const filePath = path.join(source_dir, url)

    fs.stat(filePath, (err, stat) => {
      if (err || !stat.isFile()) return next()

      const total = stat.size
      const contentType = mime.getType(ext) || 'application/octet-stream'

      res.setHeader('Accept-Ranges', 'bytes')
      res.setHeader('Content-Type', contentType)

      const range = req.headers.range
      if (range) {
        const parts = range.replace(/bytes=/, '').split('-')
        const start = parseInt(parts[0], 10)
        const end = parts[1] ? parseInt(parts[1], 10) : total - 1

        if (start >= total || end >= total || start > end) {
          res.statusCode = 416
          res.setHeader('Content-Range', `bytes */${total}`)
          res.end()
          return
        }

        res.statusCode = 206
        res.setHeader('Content-Range', `bytes ${start}-${end}/${total}`)
        res.setHeader('Content-Length', end - start + 1)

        if (req.method === 'HEAD') {
          res.end()
          return
        }

        fs.createReadStream(filePath, { start, end }).pipe(res)
      } else {
        res.statusCode = 200
        res.setHeader('Content-Length', total)

        if (req.method === 'HEAD') {
          res.end()
          return
        }

        fs.createReadStream(filePath).pipe(res)
      }
    })
  })
}, 5) // priority 5, 在 route (10) 之前执行
