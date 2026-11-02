# 三语（zh / ja / en）i18n 实施规范

本目录实现本站的中日英三语方案。中文是唯一人工维护的源，日英译文由 AI 依据中文生成后入库。

## 决策（已定）

- **URL**：中文保持原路径 `p/<abbrlink>/` 不变；日文 `/ja/p/<abbrlink>/`，英文 `/en/p/<abbrlink>/`。
  92 篇现有链接、外链与搜索引擎索引零破坏。
- **产物入库**：译文是提交进 git 的文件，**不在构建时调 API**。构建必须确定性、可离线、可人工修改。
- **范围**：全部文章翻译，译文允许被索引（不做 noindex）。例外见「已知陷阱」：三体三部曲
  （全文转载的版权小说，正文占全站 67%）经确认跳过；另有极少数露骨性内容会被模型内容安全策略拒译。
- **不用插件**：Hexo 文章级 i18n 插件全部停更或已归档，且与本仓库 `p/:abbrlink/` 结构不兼容。改由本目录脚本 + `scripts/` 下的 Hexo 扩展实现。

## 文件布局

```
source/_posts/<name>.md        中文源（人工维护，结构不动）
source/_posts/ja/<name>.md     日文译文（生成）
source/_posts/en/<name>.md     英文译文（生成）
```

译文与中文源**同名**，放在语言子目录下。

**工具链放在 `tools/i18n/`，不放 `scripts/i18n/`**：Hexo 构建时会递归 `require` `scripts/` 下的
**每一个**文件（连 `.md` 都当 JS 试）。把带顶层副作用的 CLI 放进 `scripts/`，会让每次构建都执行它们；
放一个 `.md` 进去则会直接 `SyntaxError` 并让构建以非 0 退出（这个坑已经踩过一次）。
`scripts/` 只留真正的 Hexo 扩展：`i18n-render.js`、`i18n-artifacts.js`、`i18n-taxonomy-pages.js`。

## front-matter 契约（译文必须带全）

| 字段 | 值 | 为什么 |
| --- | --- | --- |
| `lang` | `ja` 或 `en` | 驱动主题界面语言、`<html lang>`、产物分流 |
| `title` / `description` / `keywords` | 对应译文 | 页面元信息 |
| `abbrlink` | **原样复制中文值** | `hexo-abbrlink` 按 `crc16(title)` 计算且全站去重；若留空会重算出另一个值，三语配对立刻断裂 |
| `permalink` | `ja/p/<abbrlink>/` 或 `en/p/<abbrlink>/` | `processor/post.js` 会把 front-matter `permalink` 转成 `__permalink`，`post_permalink` 见到即短路。中文 URL 因此保持一个字节不变 |
| `translation_of` | `_posts/<中文文件名>.md` | 溯源 |
| `source_hash` | 中文**正文** sha256 前 12 位 | 陈旧检测；中文改动后哈希不匹配即视为 stale |
| `translator` | `ai` | 标记机器翻译 |
| `reviewed` | `false` | 人工校对后改 `true` |
| `date` / `updated` | **原样复制中文** | 站点 `updated_option: mtime`，译文文件一落地 mtime 就是新的，会污染 `order_by: -updated` 的首页与 sitemap 排序 |
| `categories` / `tags` | 查 `taxonomy.yml` 换成目标语言名 | 分类/标签是跨文章的共享维度，译名在对照表里一次定死，否则同一分类会碎成多个页面；缺译名时退回中文并汇总报警 |
| `password` | 原样复制（仅加密文章） | 4 篇加密文需保留口令 |

## 分类与标签的本地化

分类和标签也要有中/日/英三套名字，但**不能逐篇交给模型翻**：它们是跨文章的共享维度。
同一篇文章里的「技术开发」和另一篇里的「技术开发」若译成不同的词，一个分类就会碎成好几个页面，
标签云彻底失控。

所以译名一次性定死在 `source/_data/taxonomy.yml`，翻译每篇时只做查表替换：

```yaml
categories:
  "技术开发":
    ja: "技術開発"
    en: "Tech Development"
tags:
  "抽卡":
    ja: "ガチャ"
    en: "Gacha"
```

- 缺译名时退回中文，并在 `i18n:run` 结束时按「分类: 名字（N 篇）」汇总报警，不会静默出错。
- 中文分类页 URL 段沿用中文原名（与改动前一致，不破坏已有链接）；日英用各自译名生成 URL 段。
  想给某个分类固定一个干净 URL，在该条目下加 `slug: tech`。
- **加密警告**：`hexo-blog-encrypt` 按 tag 名匹配密码。当前站点没用 tag 做加密规则
  （4 篇加密文靠 front-matter `password`），所以翻译 tag 名不影响加密；**若以后启用 `encrypt.tags`，
  必须用中文原名匹配**，否则加密会静默失效。

## 受保护内容（翻译时不得改动）

- 代码块 ```` ``` ```` 与行内代码 `` ` ``
- 图片路径、链接 URL
- Hexo 标签插件 `{% ... %}` 与外挂标签
- `#+ABBRLINK` 等元标记
- front-matter 中不在上表白名单里的字段

## 脚本职责

| 文件 | 职责 |
| --- | --- |
| `lib/langs.js` | 语言常量与 locale 映射（`zh`→`zh-CN` 等） |
| `lib/frontmatter.js` | front-matter 解析 / 序列化（含写盘往返自检） |
| `lib/posts.js` | 扫描 `source/_posts`，建立 `Map<abbrlink, {zh,ja,en}>` 索引 |
| `lib/chunk.js` | 按 Markdown 结构分块并替换占位符，翻译后还原 |
| `lib/llm.js` | 配置读取与 chat 调用（translate / taxonomy 共用同一份超时与重试） |
| `lib/taxonomy.js` | 读 `taxonomy.yml`，按语言查/替换分类与标签名 |
| `translate.js` | CLI：`plan` / `run` / `status` |
| `taxonomy.js` | CLI：`check` / `draft`（为分类标签生成译名草案） |
| `../../scripts/i18n-render.js` | `after_render:html` 注入 `<html lang>`、`og:locale`、对称 hreflang、语言切换器 |
| `../../scripts/i18n-artifacts.js` | 分语言 search 索引与 feed |
| `../../scripts/i18n-taxonomy-pages.js` | 分语言的分类页 / 标签页 / 索引页 |

## 命令

```sh
bun run i18n:plan                 # 只报告缺失 / 陈旧，不改文件
bun run i18n:run --lang ja,en     # 生成或刷新译文
bun run i18n:run --only 3155      # 只处理指定 abbrlink
bun run i18n:status               # 汇总覆盖率
bun run i18n:taxonomy             # 检查分类/标签译名缺口
node tools/i18n/taxonomy.js draft # 用 AI 补齐译名（写 source/_data/taxonomy.yml，已有译名不覆盖）
```

## 已知陷阱

- **推理模型的 `max_tokens`**：本端点的 `deepseek-flash` 会先产出 `reasoning_content` 再产出译文，
  `max_tokens` 必须同时容纳两者。设成 8192 时长文会「正文为空」，被当成失败反复退避重试，
  表现是**长时间毫无进展**（踩过一次，白等约 20 分钟才定位）。当前 32768。
- **超长文章**：`i18n.max_source_chars`（默认 100000 字符）会跳过它们。三体三部曲正文合计
  90 万字符、占全站 67%，逐块翻译要上千次 API 调用；这类全文转载的版权作品也不适合整篇
  搬到别的语言。被跳过的文章会在 `plan` / `run` 输出里**逐篇列出**，绝不静默丢弃。
  确需翻译：`--only <abbrlink> --max-source-chars 0`。
- **内容安全拒译**：露骨性内容（尤其涉及未成年主题）会被模型拒绝，症状是占位符丢失或译文
  长度异常。校验会拦下并拒绝写入，重试结果相同 —— 这是**预期行为，不应绕过**；
  这类文章保持无译文即可，语言切换器会自动把它置灰。
- **长表格**：整张表格中间没有空行，会被当成一个超长块。`split` 现在按行切开，并给**每一块
  补回表头**；判断表头前必须先跳过前导空行，否则判定失败、后续每一块都会丢掉列结构
  （「HTTP 状态码释义」就是这么翻坏后被发现并修好的）。切开的表格之间用换行而非空行连接，
  不然 Markdown 会把一张表断成两张。
- **占位符密集的段落**：偶尔模型会漏掉某个 `@@T00x@@`。校验会拦下，用更小的
  `--chunk-chars`（如 600）重跑通常即可。
- **嵌套占位符**：规则是一条条叠加的，后一条会把已经是占位符的片段整体再包一层
  （行内代码里含链接时就是这样）。`unmask` 必须**递归展开**，只扫一遍会把内层
  占位符当成「译文丢失」误报（踩过，稳定失败 3 次才发现）。全站只有 1 篇命中此形状。
- **译名会被 Hexo 当成新分类**：译文 front-matter 写的是译名，Hexo 会为「技術開発」
  另建一个分类模型。生成分类页时必须用 `taxonomy.resolve` 把名字归一回中文 key，
  否则同一分类碎成三个互不相认的 term，对称 hreflang 全断、中文站还会多出日英目录。
- **`after_generate` 不适合删产物**：Hexo 的 `_generate()` 只刷新路由，写盘发生在其后的
  generate console（`dist/plugins/console/generate.js`）。在 `after_generate` 里删文件，
  会被随后的写入原样建回来。改用 `before_exit` + `process.on('exit')`。
- **侧边栏「最新文章」是全语言混合的**：主题读 `site.posts`，直接渲染各语言各自的
  真实路径（`/p/`、`/ja/p/`、`/en/p/` 混杂），译文页里点一下就跳到别的语言。
  `i18n-render.js` 的 `prefixPostLinks` 会把三种形态统一归一到当前语言（无译文则回中文源）。
  注意 `ja` 与 `en/` 拼正则时别一边带斜杠一边不带。
- **`scripts/` 只能放 `.js`**：Hexo 会递归 require 并执行 `scripts/` 下的一切（见「文件布局」）。

## 验收标准

1. 中文页 URL 与改动前逐字节一致（`public/p/<abbrlink>/` 全在）。
2. 日英页各自 `public/ja/p/<abbrlink>/`、`public/en/p/<abbrlink>/` 存在。
3. 每个有多语版本的页面 `<head>` 含**完整对称**的 hreflang：自引用 + 其余语言 + `x-default` 指向中文。单边 hreflang 会被 Google 静默丢弃。
4. `<html lang>` 与 `og:locale` 随页面语言变化。
5. `search-ja.json` / `search-en.json` 只含对应语言文章；feed 同理。
6. 首页仍按中文 `updated` 排序，不被译文文件 mtime 干扰。
7. 分语言的分类页 / 标签页存在（`public/ja/categories/<slug>/`、`public/en/tags/<slug>/` …），
   且每页只列对应语言的文章；中文分类页 URL 与改动前一致。
8. 同一分类的三语页面互相输出**对称** hreflang，缺语言的页面不产生单边注解。
