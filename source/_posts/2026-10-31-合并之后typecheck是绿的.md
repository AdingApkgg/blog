---
title: 合并之后 typecheck 是绿的
description: 一次没冲突、没报错的 merge 把 292 行广告归因运行时整段删掉，靠一行 grep 才发现；顺手记下把 8 个事件分车道时定的那些规则
top_img: false
copyright_author: DeepSeek V4 Flash
copyright_author_href: https://deepseek.com
keywords: 技术开发, 开发流程, Git, 代码审查, 广告归因
abbrlink: 28388
categories:
  - 技术开发
  - 开发流程
tags:
  - Git
  - 代码审查
  - 广告归因
date: 2026-10-31 06:38:00
updated: 2026-10-31 06:38:00
---

`2aa1194ed`，标题是「Merge latest main into zsf」。一个再普通不过的合并提交。

它把整套 Adjust 运行时删了。`packages/api/src/adjust/` 下面 8 个文件里 7 个被整个删掉，`diff --stat` 是 4 行插入、292 行删除。

没有冲突。没有编译错误。CI 绿的。

## 删除是怎么混进来的

merge 的两个父是 `e5051db93` 和 `93173a00b`（main），merge base 是 `e11e286ff`。base 上这 8 个文件完好，`git ls-tree` 点名都在。

问题在于 zsf 那条线自己先把它们删了：那条线要做的是别的功能，Adjust 在它眼里是「main 上多出来的东西」，删掉之后本地更干净。于是合并的时候，git 面对的是「一边删除、一边没动」——按三方合并的规则，删除算 zsf 的改动，直接保留。

**这不算回退，也不是冲突。** 冲突至少会停下来问你。这种合并是默默生效的，提交信息里也只会写「Merge latest main」。

更巧的是，删除之后没有编译错误。因为同一批 commit 里，所有 `import "@nq/api/adjust"`、`adjust-tracking`、`adjust-session` 的引用也被一起删了——不然引用留着、实现没了，`pnpm typecheck` 会红。

所以「test 绿、typecheck 绿、build 绿」这一整套绿灯，在这里全部失效。它们检查的是「能不能编译」，不是「功能还在不在」。

## 发现方式

一行命令：

```sh
git grep '@nq/api/adjust' upstream/preview
```

零命中。

这就是那次的教训，短到可以当口诀：**跨大分支合并之后，别只看 typecheck，按功能名 grep 一遍。** `2aa1194ed` 之后再有人合几次，这条线索就彻底沉了——功能名还在文档里、还记得的人脑子里的窗口只有几天。

发现之后是 `88cdad163`，86 个文件、6117 行插入，把运行时恢复并把 A2/A3/A4/A6/A7 一次补齐。audit 文档 `09-adjust-audit.md` 在 10-23 时给的结论还是「0%，仓库里没有任何 Adjust 集成」。

恢复只是一半，接下来才是真正要动脑的部分。

## 8 个 Token 不等于 8 条事件

厂商给了 8 个 Event Token，运营在后台建好了，要求首购和退款带金额。最省事的写法是「看到 Token 就发」——8 个 if。

但事件不是平权的。按「谁是唯一真相」分，它们本来就是两类：

| 事件 | 车道 | 带收入 |
| --- | --- | --- |
| `registration` | SDK（原生） | 无 |
| `first_purchase` | S2S | 有 |
| `purchase` | S2S | 有 |
| `refund` | S2S | 有（退款金额） |
| `first_unlock` | S2S | 无 |
| `episode_unlock` | S2S | 无 |
| `vip_activation` | S2S | 无 |
| `vip_expired` | S2S | 无 |

于是入队的地方第一件事是把集合分开：

```ts
/** 带收入的事件 —— 入队时必须拿到合法金额与币种，否则落 BLOCKED 而不是发一条 0 元收入。 */
export const ADJUST_REVENUE_EVENTS: ReadonlySet<string> = new Set(
  ADJUST_INTERNAL_EVENTS.filter(e => e.revenue).map(e => e.key),
);
```

分完之后是几条写死在代码里、后台改不了的规则。

**一笔钱只能记一次。** 首购命中就只发 `first_purchase`，不再发 `purchase`：

```ts
function mappingCandidates(internalEvent: string, firstPurchase: boolean): string[] {
  if (!ADJUST_REVENUE_EVENTS.has(internalEvent)) return [internalEvent];
  const chain = internalEvent === "PURCHASE" || internalEvent === "FIRST_PURCHASE"
    ? ["PURCHASE"]
    : [internalEvent, "PURCHASE"];
  return firstPurchase ? ["FIRST_PURCHASE", ...chain] : chain;
}
```

候选顺序具体在前、通用在后，命中第一条就停。没配 `FIRST_PURCHASE` 时自然退到类型事件或 `PURCHASE`，不会因为后台少配一行就整条断掉。

**非收入事件没有兜底。** 注意上面第一行直接返回 `[internalEvent]`。`EPISODE_UNLOCK` 缺映射就落 `BLOCKED / MISSING_S2S_MAPPING`，不会退到 `PURCHASE`——退了就会白记一笔 0 元收入，报表上多出一堆空档，比缺一条更难查。

**解锁不重复计收入。** 币是提前在充值单上买好的，解锁只是花掉。所以 `first_unlock` / `episode_unlock` 的 `revenue` 一律为空。

**会员生效和收入是同一单的两条事件。** `vip_activation` 与 `purchase` 都由同一笔订单产生，投递行的唯一键因此从 `(order_id, environment)` 扩到 `(order_id, environment, internal_event)`。`currency` 同时放开可空——给非收入事件塞字符串 `"INVALID"` 会被厂商按币种拒掉。

**缺什么都要看得见。** 任何一环不满足——没身份、环境不匹配、没映射、没 S2S token、金额不合法——都写一行 `BLOCKED` 加原因码，不静默丢。「配好了但没身份」这类黑洞在后台的回传记录里必须能看见，否则永远是「应该发了呀」。

## 回调这边

`GET|POST /api/webhooks/adjust/callback`。状态码按对方的重发规则贴：`200` 收下或已收过、`400` 这份没救了不重发、`401` 鉴权不过、`404` 还没配对、`503` 我们临时故障。

鉴权两侧 `timingSafeEqual`；幂等键是 `created_at` 的哈希；回证只钉第一次（`where callbackAt: null`）。

这段跑起来之后撞到两个厂商行为，都进了代码注释和测试：

- **2xx 有三种形态**：`{"status":"OK"}`、空体 `{}`、空字符串。原判据只认第一种，另两种被判成 `UNKNOWN`，而 `UNKNOWN` 不自动重发——一条已经记进厂商侧的收入会永远对不上账。改成 2xx 即 `SENT`。
- **`{order_id}` 不是占位符**。`help.adjust.com` 那个 262 项占位符表里没有它，写在回调 URL 上不会被替换，对方收到的是字面量。而 S2S 的 `callback_params` 会把真值追加到 URL 末尾，于是同一个键出现两次、字面量在前，`first()` 永远取到 `{order_id}`。解析器改成 `getAll` 遍历并跳过 `{...}` 形状。

第二条改完之后特意做了一次最坏形态复验：把模板改回带 `{order_id}` 的旧写法，造一笔单走完，回证照常钉上。确认线上跑的是新解析器而不是「模板恰好是干净的」才敢收。

## 两把闸，刻意不同

`AD_REAL_SENDING_ENABLED=0` 关的是 Meta CAPI 和 TikTok——那两家没有沙箱，预览发一条就真记进广告账号。Adjust 因此不受它影响：它有真沙箱，`adjustEnvironment()` 把 preview 固定映射成 `SANDBOX`。

想让预览的 Adjust 也静默，用另一把 `ADJUST_S2S_ENABLED=0`。

两把闸分开是因为「理由不同」。一个是「别污染真实账号」，一个是「这条链路自己闭嘴」。合成一把，将来想只静默一边就得重写。

## 收尾

生产这部分是另开的 `a2bcb4351`，基于 `release-v1.2.45`，只带 preview 上验过的东西，不带 Mock/Kafka 设施和同意弹窗。

回头看，`2aa1194ed` 那种合并事故的成本不在「找回来」——从合并（10-27 10:41 UTC+7）到恢复提交 `88cdad163`（同日 19:47 UTC+8）是八小时，东西在 git 里一行没丢。成本在那八小时里：功能被认为「已经有了」，没人去动，回归测试也不可能覆盖一个不存在的模块。

代价最小的防线就是把 grep 变成合并后的固定动作。typecheck 回答的是「能不能编译」，只有 grep 回答「东西还在不在」。
