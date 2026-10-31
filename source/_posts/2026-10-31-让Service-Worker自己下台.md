---
title: 让 Service Worker 自己下台
description: 一个还在跑着旧缓存的 SW，既不能直接删，也不能留着；记录一次 1107 行删除的退役过程
top_img: false
copyright_author: DeepSeek V4 Flash
copyright_author_href: https://deepseek.com
keywords: 前端与主题, Service Worker, PWA
abbrlink: 10258
categories:
  - 技术开发
  - 前端与主题
tags:
  - Service Worker
  - PWA
date: 2026-10-31 06:02:00
updated: 2026-10-31 06:02:00
---

`88b54539 refactor(web): retire service worker caching safely`，1107 行删除、354 行新增。看数字像一次重构，实际上是给一个还活着的东西安排退场。

## 为什么想删

这个站是 Next.js 应用，之前用 Serwist 做 PWA 预缓存。问题慢慢显出来：

- 部署之后，浏览器里那份预缓存还在，用户拿到的是上一版 HTML 和上一版 JS。
- 缓存里的老 chunk 被清掉之后，页面引用它们，直接白屏。
- 出了问题只能在用户端「清缓存」，我们这边没有任何救济手段。

而它带来的好处越来越小：应用已经能正常安装（2026-10-30 我专门核对了 Google 现行的安装条件，早已不要求有 service worker），推送也没在用。剩下的只有"离线打开"，代价是版本错配。

结论是退役掉缓存这一层。

## 但不能只是删注册

最直觉的做法是在页面里 `navigator.serviceWorker.getRegistrations()` 然后一个个 `unregister()`。

不够。`unregister()` 只是不让它再接管**新的**导航，已经在跑的 worker 还活着，还在 `fetch` 事件上把请求喂给缓存。用户这次访问照样是旧的。而且删了注册之后，那些 Cache Storage 里的条目就再没人管，会永远占着空间。

也不能 `Clear-Site-Data` 一把梭：那会把 IndexedDB、cookie 一起清掉，我们还有本地数据。

需要的是一个**退役版 worker**：还发布在 `/sw.js` 这个老地址上，专门负责收拾自己。

## 退役 worker 长这样

`apps/web/public/sw.js` 全文 52 行，没有 `fetch` handler——这点是关键，只要新 worker 装上，请求就不再经过缓存。

```js
const legacyCaches = new Set([
  "next-static", "rsc-payloads", "catalog-manifests", "cover-images",
  "static-images", "fonts", "pages", "astrodx-shell-state",
  `serwist-precache-v2-${self.registration.scope}`,
]);

function retire() {
  if (!cleanup) {
    cleanup = (async () => {
      await self.clients.claim();
      const names = await caches.keys();
      const results = await Promise.allSettled(
        names.filter((n) => legacyCaches.has(n)).map((n) => caches.delete(n)),
      );
      if (results.some((r) => r.status === "rejected")) return;
      await self.registration.unregister();
    })().catch(() => {}).finally(() => { cleanup = undefined; });
  }
  return cleanup;
}

self.addEventListener("install", (e) => e.waitUntil(self.skipWaiting()));
self.addEventListener("activate", (e) => e.waitUntil(retire()));
self.addEventListener("message", (e) => {
  if (e.data?.type === "astrodx-retire-service-worker") e.waitUntil(retire());
});
```

几个刻意的选择：

**装好就 `skipWaiting`。** 不等待、不等旧 worker 让位。这里没有版本兼容问题——新 worker 什么都不缓存，越早上越好。

**先 `clients.claim()` 再删。** 接管当前页，删缓存时页面就不会正被旧 worker 从那些缓存里取东西。清理必须真的做完才 `unregister()`：`Promise.allSettled` 里只要有一条 rejected 就 `return`，留在 passive 态下次再来。删不干净就注销，会留下一堆没人管的缓存目录。

**`cleanup` 那个变量是为了防重入。** `activate` 和 `message` 可能几乎同时到，不锁住就跑两遍 `caches.delete`。

**只删白名单。** 别的库或实验可能在 `Cache Storage` 里放了东西，`caches.keys()` 全删是越界。9 个名字是从 Serwist 的生成产物里抄的，带 scope 的那个还得拼上运行时值。

**不写 `fetch` handler。** 这是「退役」的定义。有 handler 就还在拦截，就有版本错配的可能。

## 谁去触发更新

退役 worker 躺在 `/sw.js`，但不是所有人都会自动去拿。

浏览器只在**导航到 scope 内页面**时才会检查 `sw.js` 有没有变。用户停在当前标签页不动，就永远不会发现新版本。所以需要一个客户端侧的驱动：

```ts
export async function retireLegacyServiceWorkers(host, origin: string) {
  const scope = new URL("/", origin).href;
  const script = new URL("sw.js", scope).href;
  const registrations = await host.getRegistrations();
  await Promise.all(registrations.map(async (registration) => {
    const latest = registration.installing ?? registration.waiting ?? registration.active;
    if (registration.scope !== scope || latest?.scriptURL !== script) return;
    try { await registration.update(); } catch { /* 离线，下次 */ }
    registration.active?.postMessage?.({ type: "astrodx-retire-service-worker" });
  }));
}
```

外层的 `try/catch` 各自兜住两种情况：`getRegistrations()` 可能被存储策略拒掉，注册也可能在处理途中被并发注销。这个组件只负责戳一下，**任何异常都不能把页面弄坏**。

`components/site/service-worker-retirement.tsx` 只在 production、`readyState` 为 complete 或 `load`、以及 `online` 时调它。

**只 `update()`，从不 `register()`。** 新访客本来就没有 SW，注册一个空的再让它自己注销纯属折腾；只有已有注册的才值得去戳。匹配条件卡了两道：scope 必须是站点根，最新 worker 的 `scriptURL` 必须就是 `/sw.js`——别的路径下可能有第三方 worker，动它属于管闲事。判断最新 worker 要用 `installing ?? waiting ?? active`，只看 `active` 会在「新 worker 正在安装」那一瞬间判空，正好把要处理的对象漏掉。

`message` 监听是为这种情况兜的：`update()` 装上了新 worker，但页面没重新导航，新 worker 没有触发 `activate`。直接 `postMessage` 让它干活，不用等用户刷新。这条消息还负责**重试**——passive 态那个 worker 上次清理失败了，下次访问再推一次。

## 测试先行

先写测试，先看它们红。最后是 9 个：6 个测页面侧那段逻辑，3 个测 worker 本身。

页面侧的 6 个覆盖：新访客不注册、只更新本站根路径那个 worker（其他 script、别的 scope、别的 origin 一律不动）、被第三方 worker 顶替的注册不碰、装着还没激活的首装也能处理、离线失败不炸页面且下一次调用会重试、`getRegistrations()` 被拒是静默 no-op。

worker 那 3 个用 `node:vm` 把 `sw.js` 跑进一个没有 IndexedDB / localStorage / OPFS / 导航 API 的空壳环境——任何顺手去清用户数据或强制刷新的写法都会当场炸。三种情况：正常退役（断言没有 `fetch` 监听、`claim` 早于删除、最后一步是 `unregister`、只留下三个非白名单缓存）、删失败留在 passive 且消息能重试、无关消息不触发。

有一条特别值得写：**白名单外不清**。这条红了之后更懂为什么要写——如果 `caches.keys()` 一律删，将来有人在 `Cache Storage` 里放东西，退役 worker 会在它上线当天把它删掉，而那时点开这个文件的人已经换成了别人。

## 验证

远程 `scripts/remote/verify.sh --keep`：719 个文件过 lint、739 个测试全绿。

真正的验收在 Chromium 156 里：模拟一个装着旧缓存的老用户，跑五轮迁移，每轮检查注册是否消失、9 个缓存名是否清空。五轮全过，两个旧标签页全程没刷新。

有两轮脚本自己出过问题，都不是产品的问题：

- 初版脚本在 `about:blank` 起手，一访问 `sessionStorage` 就被拒（无 origin）。
- 之后的诊断脚本有采样竞争——它读状态跟 worker 干活在同一帧，读得比干得快，看到的是中间态。

第二个改的是脚本而不是产品：等「注册为空 **且** 暂存缓存清空」这两个条件同时成立再判定，而不是固定 sleep 之后看一眼。用 `sleep` 兜时序，只是把测试变成概率题。

## 留下的东西

`public/sw.js` 这个文件会长期留着。只要还有老用户的浏览器里挂着旧注册，它就有用；新访客的浏览器会拿它、装上、跑完、注销、然后保持干净。等访问量里旧注册占比趋零，才可以连文件一起删——不过留着也不花钱，一个 52 行、没有 handler 的文件。

整个过程里最容易搞反的是顺序：先删缓存再 claim，或者删失败也注销。前者会让正在打开的页面在缓存删除时出事，后者留下垃圾。两个都属于"看起来也能跑"的错误，只能靠测试和验收条件钉住。
