---
title: The Typecheck Was Green After the Merge
description: >-
  A merge with no conflicts and no errors wiped out 292 lines of ad-attribution
  runtime in one go, and only a single line of grep caught it; also jotting down
  the rules settled on when splitting 8 events into separate lanes
keywords: Technical development, Development workflow, Git, Code review, Ad attribution
abbrlink: 28388
permalink: en/p/28388/
lang: en
translation_of: _posts/2026-10-31-合并之后typecheck是绿的.md
source_hash: e3e582ff01b9
translator: ai
reviewed: false
categories:
  - Tech Development
  - Development Workflow
tags:
  - Git
  - Code Review
  - Ad Attribution
top_img: false
copyright_author: DeepSeek V4 Flash
copyright_author_href: https://deepseek.com
date: 2026-10-31 06:38:00
updated: 2026-10-31 06:38:00
---

`2aa1194ed`, titled "Merge latest main into zsf". A completely ordinary merge commit.

It deleted the entire Adjust runtime. Under `packages/api/src/adjust/`, 7 of the 8 files were deleted outright, and `diff --stat` was 4 insertions and 292 deletions.

No conflicts. No compile errors. CI was green.

## How the deletion slipped in

The merge's two parents are `e5051db93` and `93173a00b` (main), and the merge base is `e11e286ff`. On the base, these 8 files were intact, and all the `git ls-tree` references were present.

The problem was that the zsf line had already deleted them: that line was meant to implement a different feature, and from its perspective Adjust was "something extra that existed on main," so removing it made the local tree cleaner. When merging, git therefore faced "deleted on one side, untouched on the other"—under the three-way merge rules, the deletion counts as zsf's change and is kept as-is.

**This is not a revert, nor is it a conflict.** A conflict at least stops and asks you. This kind of merge takes effect silently, and the commit message only says "Merge latest main."

Even more conveniently, there were no compile errors after the deletion. That's because in the same batch of commits, all references to `import "@nq/api/adjust"`, `adjust-tracking`, and `adjust-session` were deleted along with it—otherwise, with the references still present and the implementation gone, `pnpm typecheck` would have gone red.

So the whole set of green lights—"tests green, typecheck green, build green"—was completely useless here. They check whether it compiles, not whether the feature is still there.

## How it was found

A single command:

```sh
git grep '@nq/api/adjust' upstream/preview
```

Zero hits.

That was the lesson, short enough to serve as a mantra: **After merging across major branches, don't just look at typecheck—grep for the feature name.** If a few more people merge after `2aa1194ed`, this clue will be completely buried—the feature name is still in the docs, but the window in the minds of people who remember it is only a few days.

After it was found, `88cdad163` restored the runtime with 86 files and 6,117 insertions, filling in A2/A3/A4/A6/A7 all at once. As of 10-23, the audit document `09-adjust-audit.md` still concluded "0%—there is no Adjust integration anywhere in the repository."

Restoring it was only half the battle; the next part was where the real thinking began.

## 8 Event Tokens are not 8 events

The vendor provided 8 Event Tokens, operations had already created them in the dashboard, and they required first purchase and refunds to carry amounts. The easiest implementation would be "send whenever you see a Token"—8 if statements.

But events are not equal. Split by "who is the single source of truth," they fall into two categories from the start:

| Event | Lane | Revenue |
| --- | --- | --- |
| `registration` | SDK (native) | No |
| `first_purchase` | S2S | Yes |
| `purchase` | S2S | Yes |
| `refund` | S2S | Yes (refund amount) |
| `first_unlock` | S2S | No |
| `episode_unlock` | S2S | No |
| `vip_activation` | S2S | No |
| `vip_expired` | S2S | No |

So the first thing the enqueueing code does is split the sets:

```ts
/** 带收入的事件 —— 入队时必须拿到合法金额与币种，否则落 BLOCKED 而不是发一条 0 元收入。 */
export const ADJUST_REVENUE_EVENTS: ReadonlySet<string> = new Set(
  ADJUST_INTERNAL_EVENTS.filter(e => e.revenue).map(e => e.key),
);
```

After the split, there are several rules hardcoded in the code and impossible to change from the dashboard.

**One payment can only be recorded once.** When first purchase matches, send only `first_purchase` and no longer send `purchase`:

```ts
function mappingCandidates(internalEvent: string, firstPurchase: boolean): string[] {
  if (!ADJUST_REVENUE_EVENTS.has(internalEvent)) return [internalEvent];
  const chain = internalEvent === "PURCHASE" || internalEvent === "FIRST_PURCHASE"
    ? ["PURCHASE"]
    : [internalEvent, "PURCHASE"];
  return firstPurchase ? ["FIRST_PURCHASE", ...chain] : chain;
}
```

The candidate order puts specific events before generic ones, and stops at the first match. When `FIRST_PURCHASE` is not configured, it naturally falls back to the type event or `PURCHASE`, and the whole chain doesn't break just because one line is missing in the dashboard.

**Non-revenue events have no fallback.** Note that the first line above directly returns `[internalEvent]`. If `EPISODE_UNLOCK` lacks a mapping, it falls to `BLOCKED / MISSING_S2S_MAPPING` and does not fall back to `PURCHASE`—if it did, it would pointlessly record a 0-yuan revenue entry, creating a bunch of gaps in reports that are harder to trace than a missing entry.

**Unlocks do not double-count revenue.** Coins are bought in advance on top-up orders; unlocking merely spends them. Therefore, the `revenue` for `first_unlock` / `episode_unlock` is always empty.

**Membership activation and revenue are two events from the same order.** Both `vip_activation` and `purchase` are generated by the same order, so the unique key of the delivery row is expanded from `(order_id, environment)` to `(order_id, environment, internal_event)`. `currency` is also made nullable at the same time—stuffing the string `"INVALID"` into non-revenue events would get rejected by the vendor's currency validation.

**Every missing piece must be visible.** If any link in the chain is unsatisfied—no identity, environment mismatch, missing mapping, missing S2S token, invalid amount—write a `BLOCKED` row with a reason code; do not silently drop it. Black holes like "configured but no identity" must be visible in the dashboard's postback records; otherwise you'll forever be saying, "It should have been sent."

## The callback side

`GET|POST /api/webhooks/adjust/callback`. Map status codes to their retry rules: `200` accepted or already received, `400` this one's dead, don't resend, `401` auth failed, `404` not paired yet, `503` our side had a temporary failure.

Auth nonce on both sides `timingSafeEqual`; the idempotency key is a hash of `created_at`; the receipt is pinned only on the first attempt (`where callbackAt: null`).

Once this was running, I ran into two vendor behaviors, both of which made it into code comments and tests:

- **2xx comes in three shapes**: `{"status":"OK"}`, an empty body `{}`, and an empty string. The original check only recognized the first, so the other two were treated as `UNKNOWN`, and `UNKNOWN` doesn't retry automatically — a payment already recorded on the vendor side would never reconcile. Changed it so any 2xx counts as `SENT`.
- **`{order_id}` is not a placeholder**. It isn't in the 262-entry placeholder table behind `help.adjust.com`, so writing it into the callback URL leaves it unreplaced and the other side receives the literal text. But the S2S `callback_params` appends the real value to the end of the URL, so the same key shows up twice, literal first, and `first()` always picks up `{order_id}`. The parser now walks `getAll` and skips `{...}`-shaped segments.

After the second fix I deliberately re-verified the worst case: reverted the template to the old form with `{order_id}`, created a transaction and ran it end to end, and the receipt got pinned as usual. Only after confirming that production was running the new parser — and not just "the template happened to be clean" — did I feel safe shipping it.

## Two gates, deliberately different

`AD_REAL_SENDING_ENABLED=0` guards Meta CAPI and TikTok — neither has a sandbox, so a preview sends something that's really recorded in the ad account. Adjust is therefore unaffected: it has a real sandbox, and `adjustEnvironment()` maps previews to `SANDBOX`.

To silence Adjust previews too, use the other gate, `ADJUST_S2S_ENABLED=0`.

The gates are separate because the reasons differ. One is "don't pollute the real account"; the other is "this pipeline shuts itself up." Merge them into one, and later, when you only want to silence one side, you'll have to rewrite it.

## Wrapping up

Production is a separate `a2bcb4351`, based on `release-v1.2.45`, containing only what was verified on preview — no Mock/Kafka scaffolding and no consent modal.

In hindsight, the cost of a merge accident like `2aa1194ed` isn't in "getting it back" — from the merge (10-27 10:41 UTC+7) to the recovery commit `88cdad163` (same day, 19:47 UTC+8) was eight hours, and not a single line was lost from git. The cost is in those eight hours: the feature was assumed to "already exist," nobody touched it, and regression tests can't cover a module that doesn't exist.

The cheapest line of defense is turning grep into a fixed post-merge step. Typecheck answers "does it compile"; only grep answers "is it still there."