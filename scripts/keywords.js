'use strict'

const front = require('hexo-front-matter')
const fs = require('hexo-fs')

// 优先级 15，确保在 hexo-llm-tagging（默认 10）之后执行
hexo.extend.filter.register('before_post_render', async (data) => {
  if (!data.source || !data.source.startsWith('_posts/')) return data

  // 读取源文件（可能已被 llm-tagging 更新）
  const raw = await fs.readFile(data.full_source)
  const parsed = front.parse(raw)

  const parts = []

  // 收集 categories
  if (parsed.categories) {
    const cats = Array.isArray(parsed.categories) ? parsed.categories : [parsed.categories]
    parts.push(...cats)
  }

  // 收集 tags
  if (parsed.tags) {
    const tags = Array.isArray(parsed.tags) ? parsed.tags : [parsed.tags]
    parts.push(...tags)
  }

  if (parts.length === 0) return data

  const keywords = parts.join(', ')

  // 如果 keywords 没变化则跳过
  if (parsed.keywords === keywords) return data

  parsed.keywords = keywords

  let newFrontmatter = front.stringify(parsed)
  newFrontmatter = '---\n' + newFrontmatter

  await fs.writeFile(data.full_source, newFrontmatter)

  // 同步内存中的 data
  data.keywords = keywords

  hexo.log.info(`Keywords synced: ${data.title} → ${keywords}`)

  return data
}, 15)
