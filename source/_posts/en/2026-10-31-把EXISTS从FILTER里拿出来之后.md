---
title: After Pulling EXISTS Out of the FILTER
description: >-
  A statistics SQL query went from 1.5 seconds down to 0.64 seconds, at the cost
  of discovering that Postgres's generic plan and JIT each have their own
  timing.
keywords: Technical Development, Backend & Data, Postgres, SQL Optimization
abbrlink: 23192
permalink: en/p/23192/
lang: en
translation_of: _posts/2026-10-31-把EXISTS从FILTER里拿出来之后.md
source_hash: 5ebdadfe9161
translator: ai
reviewed: false
categories:
  - Tech Development
  - Backend & Data
tags:
  - Postgres
  - SQL Optimization
top_img: false
copyright_author: DeepSeek V4 Flash
copyright_author_href: https://deepseek.com
date: 2026-10-31 05:50:00
updated: 2026-10-31 05:50:00
---

The detail page for channel stats takes 1.5 seconds. On a backend dashboard that's not a disaster, but waiting a second and a half on every refresh is something users remember.

The baseline is a production scale of 246,000 clicks over a 30-day window. The detail page takes 1.51 s, the cross-channel overview 1.49 s, and the share page 0.85 s—the share page is shown to advertisers, and a second and a half of white screen looks bad.

## The problem isn't data volume

First, let's clarify the term "valid device": among distinct devices, those that actually landed within 30 minutes of the click. The criterion is a macro called `LANDED`, whose core is a single `EXISTS`, querying a `idx_channel_pv_device` built on `0067` (keyed by device + timestamp).

The original approach stuffed `LANDED` inside an aggregate `FILTER`:

```sql
count(DISTINCT c.device_id) FILTER (WHERE NOT c.is_bot AND {LANDED}) AS valid_devices
```

It looks natural enough—that's exactly what `FILTER` is for. But `EXISTS` here is a **correlated subquery**, and the planner generates a SubPlan for it—meaning it **runs once per real click**. Over a 30-day window that's 230,000 index probes, and this item alone accounts for 680 milliseconds.

The fix was to extract the whole "valid devices" concept into a standalone subquery, with `LANDED` written into its `WHERE`:

```sql
(SELECT count(DISTINCT c.device_id) FROM channel_click c
  WHERE c.channel_code = $1 AND c.clicked_at >= $2 AND c.clicked_at < $3
    AND NOT c.is_bot AND {LANDED})
```

Now the planner can see it: this is a semi-join between the click table and the landing table, hashable in one pass instead of 230,000 probes. That part goes from 680 ms → 300 ms.

The daily trend and per-channel list follow the same logic, rewritten as a single grouped subquery with `LEFT JOIN`. The caller of `with_valid = false` (the share page doesn't show valid devices) saves even more—the subquery disappears entirely, replaced by a constant `0`, without scanning the click table again.

## But half the time is still there

After the semi-join rewrite, a large chunk of the remaining time is **compilation overhead**.

These SQL statements are sub-second OLTP queries; JIT is never worthwhile, yet the planner keeps triggering it by mistake. The reason is that the daily query uses `generate_series` left joins, and the row estimate comes out to about 200 million, far above the `jit_above_cost` threshold. A single JIT compilation takes 150–550 milliseconds, eating more than half of an already sub-second query.

So I added a read-only transaction to the stats endpoint:

```rust
async fn stats_tx(pool: &sqlx::PgPool) -> Result<sqlx::Transaction<'_, sqlx::Postgres>, AppError> {
    let mut tx = pool.begin().await?;
    sqlx::Executor::execute(
        &mut *tx,
        "SET TRANSACTION READ ONLY; SET LOCAL jit = off; SET LOCAL plan_cache_mode = force_custom_plan",
    ).await?;
    Ok(tx)
}
```

Three details:

- A parameterless `&str` uses the simple query protocol, so all three statements go in one round trip.
- I didn't use `sqlx::raw_sql`—its `execute` would make the caller's (the axum handler's) future fail the `Send` check.
- `SET LOCAL` only applies to this transaction and reverts once the connection returns to the pool; the transaction is read-only, so dropping (rolling back) at the end is enough.

## The third directive was the most surprising

I didn't initially think to add `plan_cache_mode = force_custom_plan`.

Here's the thing: sqlx caches prepared statements on the connection. After the same statement runs 5 times, Postgres switches to a **generic plan**—because a generic plan saves the 1–3 ms of replanning each time, a win for most high-frequency short queries.

But a generic plan can't see the actual parameter values, hence not the window boundaries, so it estimates the time range as tiny. With the window estimated too small, the hash semi-join I'd just built degrades into a row-by-row nested loop. The funnel goes from 290 ms → 600 ms, **twice as slow as before the fix**, and it only starts being slow on the 6th request.

This isn't visible to the naked eye. I wrote a throwaway test that ran the same batch of handler functions eight times in a row on the same connection to see the curve.

These endpoints aren't hit often anyway, so an extra 1–3 ms of planning per call is negligible. So I forced a custom plan, always taking the measured hash semi-join.

## How I proved the results didn't change

Performance changes are the easiest way to accidentally alter semantics. This time I required byte-for-byte consistency, verifying two things:

- The funnel row: compare `md5` directly.
- The `md5` of the daily rows and the per-channel rows.

I verified both the 30-day and 7-day windows. Only when everything matched did I accept it.

Results (30-day window, benchmarked on the build machine):

| Endpoint | Before | After |
| --- | --- | --- |
| Channel detail | 1.51 s | 0.64 s |
| Cross-channel overview | 1.49 s | 0.72 s |
| Share page | 0.85 s | 0.55 s |

## A few takeaways

**A correlated subquery inside `FILTER` becomes a per-row SubPlan.** As long as it can be extracted wholesale, extracting it is almost always the right call; `FILTER` is fine for cheap scalar checks, not for `EXISTS`.

**"It's faster after the change" isn't necessarily true.** This time, if I'd only looked at the first-run benchmark and not the curve after the 6th run, the conclusion would have been exactly the opposite. Slow queries in production often only show up after a connection has been reused for a while; a single benchmark won't catch it.

**JIT isn't only enabled for big queries.** It's triggered by the estimated row count, and estimates can easily be pushed above the threshold by things like `generate_series`. Sub-second queries should just turn it off explicitly.

On top of `stats_tx` there's also a coverage test: use a single-connection pool (only then is the connection fetched after the transaction ends guaranteed to be the same one, which is how you can tell whether `SET LOCAL` leaked into the pool), assert that all three settings really took effect inside the transaction, then try inserting a row in there and assert that it fails, and finally drop the transaction and re-run `SHOW` on the pool for `jit` and `plan_cache_mode`, which must be back to the default `on` / `auto`. If `SET LOCAL` leaks into the pool it contaminates every later query, which is far worse than being a bit slow.

These lessons now live in the function comments, right next to the code. If I'd written them in a blog post, three months later I wouldn't be able to find them myself..