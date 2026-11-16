'use strict'

// 构建后修正 baidusitemap.xml 里的双斜杠。
//
// hexo-generator-baidu-sitemap 拼 URL 时把语言子路径也当根路径处理，
// 生成出 https://blog.saop.cc//ja/p/xxx/ 这种形式。浏览器能接受，
// 但提交给站长平台时不算同一个 URL，和 sitemap.xml 对不上。
//
// 放在 after_generate 而不是改插件：插件是 npm 依赖，升级就丢。

const fs = require('fs')
const path = require('path')

hexo.extend.filter.register('after_generate', () => {
  const file = path.join(hexo.public_dir, 'baidusitemap.xml')
  if (!fs.existsSync(file)) return

  const before = fs.readFileSync(file, 'utf8')
  const after = before.replace(/(https?:\/\/[^/]+)\/{2,}/g, '$1/')
  if (before !== after) {
    fs.writeFileSync(file, after)
    hexo.log.info(`[baidu-sitemap] 修正双斜杠：${before.length} → ${after.length} 字节`)
  }
})
