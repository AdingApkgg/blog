import { defineConfig } from 'swpp-backends'

defineConfig({
  compilationEnv: {
    DOMAIN_HOST: new URL('https://blog.saop.cc'),
    // 允许服务器返回 404
    ALLOW_NOT_FOUND: 1,
    // 判断 URL 是否稳定（内容永不变化）
    isStable: (url: URL) => {
      const cdnHosts = [
        'registry.npmmirror.com',
        'npm.elemecdn.com',
        'unpkg.com',
        'fastly.jsdelivr.net',
        'cdn.jsdelivr.net',
        'cdn.staticfile.net',
        'cdn.staticfile.org',
        's1.hdslb.com',
      ]
      return cdnHosts.includes(url.hostname)
    },
  },

  crossEnv: {
    CACHE_NAME: 'SaopBlogCache',
    // 逃生门版本号，修改此值可强制清除所有访客的缓存
    ESCAPE: 0,
    // 检查更新的最短间隔（ms），10 分钟
    UPDATE_CD: 600000,
  },

  crossDep: {
    // 缓存规则
    // 返回值：INFINITE_CACHE (symbol) = 永久缓存 | 正整数 = 过期时间(ms) | false/null/undefined = 不缓存
    matchCacheRule: {
      runOnBrowser: (url: URL) => {
        const hostname = url.hostname
        const pathname = url.pathname

        // 视频/音频文件不缓存（SW 缓存会破坏 Range 请求，导致 seek 失败）
        if (/\.(mp4|webm|ogg|mp3|wav|flac|m4a|mkv|avi|mov)$/i.test(pathname)) return null

        // CDN 资源 → 永久缓存（URL 含版本号，内容不变）
        const cdnHosts = [
          'registry.npmmirror.com',
          'npm.elemecdn.com',
          'unpkg.com',
          'fastly.jsdelivr.net',
          'cdn.jsdelivr.net',
          'cdn.staticfile.net',
          'cdn.staticfile.org',
          's1.hdslb.com',
        ]
        // @ts-ignore - INFINITE_CACHE 是 swpp 在 SW 上下文中注入的全局变量
        if (cdnHosts.includes(hostname)) return INFINITE_CACHE

        // 本站资源
        if (hostname === 'blog.saop.cc') {
          // HTML 页面不缓存，保证内容实时更新
          if (pathname.endsWith('/') || pathname.endsWith('.html')) return null
          // 字体文件 → 永久缓存
          // @ts-ignore
          if (/\.(woff2?|ttf|otf|eot)$/.test(pathname)) return INFINITE_CACHE
          // JS / CSS → 缓存 3 天
          if (/\.(js|css)$/.test(pathname)) return 3 * 24 * 60 * 60 * 1000
          // 图片 → 缓存 7 天
          if (/\.(png|jpe?g|gif|webp|svg|ico|avif)$/.test(pathname)) return 7 * 24 * 60 * 60 * 1000
          // 其它资源（JSON 等） → 缓存 1 天
          return 24 * 60 * 60 * 1000
        }

        // 其它外部资源不缓存
        return null
      },
      runOnNode: (url: URL) => {
        const hostname = url.hostname
        const pathname = url.pathname
        // 视频/音频文件不缓存
        if (/\.(mp4|webm|ogg|mp3|wav|flac|m4a|mkv|avi|mov)$/i.test(pathname)) return null
        const cdnHosts = [
          'registry.npmmirror.com',
          'npm.elemecdn.com',
          'unpkg.com',
          'fastly.jsdelivr.net',
          'cdn.jsdelivr.net',
          'cdn.staticfile.net',
          'cdn.staticfile.org',
          's1.hdslb.com',
        ]
        if (cdnHosts.includes(hostname)) return Symbol()
        if (hostname === 'blog.saop.cc') {
          if (pathname.endsWith('/') || pathname.endsWith('.html')) return null
          if (/\.(woff2?|ttf|otf|eot)$/.test(pathname)) return Symbol()
          if (/\.(js|css)$/.test(pathname)) return 3 * 24 * 60 * 60 * 1000
          if (/\.(png|jpe?g|gif|webp|svg|ico|avif)$/.test(pathname)) return 7 * 24 * 60 * 60 * 1000
          return 24 * 60 * 60 * 1000
        }
        return null
      }
    }
  },
})
