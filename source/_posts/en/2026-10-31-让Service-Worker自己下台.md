---
title: Letting Service Worker Step Down on Its Own
description: >-
  A Service Worker still running old caches can neither be deleted directly nor
  kept; a record of a retirement process involving 1,107 deleted lines.
keywords: Technical Development, Frontend and Themes, Service Worker, PWA
abbrlink: 10258
permalink: en/p/10258/
lang: en
translation_of: _posts/2026-10-31-让Service-Worker自己下台.md
source_hash: d10ee34f85a1
translator: ai
reviewed: false
categories:
  - Tech Development
  - Frontend & Themes
tags:
  - Service Worker
  - PWA
top_img: false
copyright_author: DeepSeek V4 Flash
copyright_author_href: https://deepseek.com
date: 2026-10-31 06:02:00
updated: 2026-10-31 06:02:00
---

`88b54539 refactor(web): retire service worker caching safely`, 1107 lines deleted and 354 lines added. The numbers make it look like a refactor, but really it's arranging an exit for something that's still alive.

## Why I Wanted to Delete It

This site is a Next.js app, and PWA precaching used to be handled by Serwist. The problems gradually surfaced:

- After a deploy, the precache in the browser is still there, so users get the previous version of the HTML and the previous version of the JS.
- Once the old chunks in the cache get purged, pages that reference them just go blank.
- When something goes wrong, the only fix is for users to "clear the cache" on their end; we have no remedy at all.

And the benefits keep shrinking: the app already installs normally (on 2026-10-30 I specifically checked Google's current installability criteria — a service worker hasn't been required for a long time), and we aren't using push either. All that's left is "open it offline," and the price is version mismatch.

The conclusion: retire the caching layer.

## But You Can't Just Delete the Registration

The most intuitive approach is to put `navigator.serviceWorker.getRegistrations()` in the page and then `unregister()` them one by one.

Not enough. `unregister()` only stops it from taking over **new** navigations; the already-running worker is still alive and still feeding requests to the cache on `fetch` events. The user's current visit is still the old version. And once the registrations are deleted, nobody is in charge of those Cache Storage entries anymore — they'll occupy space forever.

Nor can we just brute-force it with `Clear-Site-Data`: that would wipe IndexedDB and cookies along with everything else, and we still have local data.

What's needed is a **retirement worker**: still published at the old `/sw.js` URL, dedicated to cleaning up after itself.

## What the Retirement Worker Looks Like

`apps/web/public/sw.js` is 52 lines in total, with no `fetch` handler — that's the key point: as soon as the new worker installs, requests no longer go through the cache.

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

A few deliberate choices:

**`skipWaiting` as soon as it's installed.** No waiting, no waiting for the old worker to step aside. There's no version-compatibility issue here — the new worker caches nothing, so the sooner it takes over, the better.

**`clients.claim()` first, then delete.** Take over the current page so that while caches are being deleted, the page isn't simultaneously having things pulled from those caches by the old worker. The cleanup has to actually finish before `unregister()`: if even one entry in `Promise.allSettled` rejects, `return` and stay in the passive state until next time. Unregistering without a clean delete would leave behind a pile of unmanaged cache directories.

**The `cleanup` variable is there to prevent re-entrancy.** `activate` and `message` can arrive almost simultaneously; without a lock, `caches.delete` runs twice.

**Only delete from a whitelist.** Other libraries or experiments may have put things in `Cache Storage`; wiping everything with `caches.keys()` would be overstepping. The nine names were copied from Serwist's generated output, and the one with a scope has to be assembled from a runtime value.

**No `fetch` handler.** That's the definition of "retirement." With a handler it's still intercepting, and version mismatch is still possible.

## Who Triggers the Update

The retirement worker sits at `/sw.js`, but not everyone will automatically go and fetch it.

The browser only checks whether `sw.js` has changed when **navigating to a page within the scope**. A user who stays put on the current tab will never discover the new version. So we need a client-side driver:

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

The outer `try/catch` catches two cases: `getRegistrations()` may be rejected by storage policy, and the registration may be concurrently unregistered while it's being processed. This component only needs to give it a poke; **no exception may ever break the page**.

`components/site/service-worker-retirement.tsx` only calls it in production, when `readyState` is complete or `load`, and when `online`.

**Only `update()`, never `register()`.** New visitors have no SW to begin with, so registering an empty one just to have it unregister itself is pointless busywork; only existing registrations are worth poking. Two matching conditions are enforced: the scope must be the site root, and the newest worker's `scriptURL` must be exactly `/sw.js` — other paths may host third-party workers, and touching those is none of our business. To find the newest worker, use `installing ?? waiting ?? active`; looking only at `active` returns null at the very moment when "a new worker is installing," which is precisely the object we need to handle.

The `message` listener covers this case: `update()` installed a new worker, but the page didn't navigate again, so the new worker never fired `activate`. Just `postMessage` to get it working without waiting for the user to refresh. This message also handles **retries** — if the worker in the passive state failed to clean up last time, it gets another push on the next visit.

## Tests First

Write the tests first, watch them go red first. In the end there were 9: 6 testing the page-side logic, 3 testing the worker itself.

The 6 page-side guards: new visitors don't register; only the worker at this site's root path is updated (other scripts, other scopes, other origins are left alone); registrations taken over by a third-party worker are untouched; a first install that is installed but not yet activated is handled; an offline failure doesn't blow up the page and the next call retries; a rejected `getRegistrations()` is a silent no-op.

The 3 worker-side tests use `node:vm` to run `sw.js` in a bare shell with no IndexedDB / localStorage / OPFS / navigation API — any code that casually wipes user data or forces a refresh blows up on the spot. Three cases: normal retirement (assert no `fetch` listener, `claim` happens before deletion, the last step is `unregister`, only the three non-allowlisted caches remain); deletion failure leaves it in passive and the message can be retried; unrelated messages don't trigger anything.

One point is especially worth writing about: **don't clear outside the allowlist**. I understood why this matters better after it went red — if `caches.keys()` were deleted unconditionally, then someday someone puts something in `Cache Storage`, and the retired worker would delete it on the very day it ships, by which time the person opening that file is someone else entirely.

## Verification

Remote `scripts/remote/verify.sh --keep`: 719 files pass lint, 739 tests all green.

The real acceptance test was in Chromium 156: simulate an old user with old caches installed, run five rounds of migration, and check each round whether the registration disappears and the 9 cache names are emptied. All five rounds passed, and the two old tabs never refreshed the whole time.

Two rounds had problems with the script itself, neither of them product issues:

- The first version of the script started from `about:blank`, and the moment it visited `sessionStorage` it was rejected (no origin).
- The later diagnostic script had a sampling race — it read state in the same frame the worker was doing its work, reading faster than the work happened, so it saw intermediate states.

The second fix was to the script, not the product: wait until both conditions — "registration is empty **and** the staging cache is cleared" — hold simultaneously before deciding, instead of a fixed sleep followed by a glance. Using `sleep` to paper over the timing just turns the test into a probability problem.

## What's left behind

The file `public/sw.js` will stay for the long haul. As long as old registrations are still sitting in some old users' browsers, it's useful; new visitors' browsers will fetch it, install it, run it, unregister, and stay clean. Only when the share of old registrations in traffic approaches zero can the file be deleted too — though keeping it costs nothing, a 52-line file with no handlers.

The easiest thing to get backwards in this whole process is the order: deleting caches before claiming, or unregistering even when deletion fails. The former makes pages that are currently open break while the caches are being deleted; the latter leaves garbage behind. Both are "looks like it works too" mistakes, and only tests and acceptance criteria can pin them down.