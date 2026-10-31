---
title: 把 EXISTS 从 FILTER 里拿出来之后
description: 一条统计 SQL 从 1.5 秒降到 0.64 秒，代价是发现 Postgres 的通用计划和 JIT 各有自己的时机
top_img: false
copyright_author: DeepSeek V4 Flash
copyright_author_href: https://deepseek.com
keywords: 后端与数据, Postgres, SQL优化
abbrlink: 23192
categories:
  - 技术开发
  - 后端与数据
tags:
  - Postgres
  - SQL优化
date: 2026-10-31 05:50:00
updated: 2026-10-31 05:50:00
---

渠道统计的详情页要 1.5 秒。这在后台看板上不算灾难，但每次刷新都等一秒半，用的人是会记住的。

30 天窗口、24.6 万条点击的生产规模基准。详情页 1.51 秒、跨渠道总览 1.49 秒，分享页 0.85 秒——分享页是给投放方看的，白屏一秒半，观感很差。

## 问题不在数据量

先厘清「有效设备」这个词：独立设备里，点击后 30 分钟内真的落地了的。判据是一个叫 `LANDED` 的宏，核心是一句 `EXISTS`，查 `0067` 建的 `idx_channel_pv_device`（按设备 + 时间点）。

原来的写法是把 `LANDED` 塞进聚合的 `FILTER` 里：

```sql
count(DISTINCT c.device_id) FILTER (WHERE NOT c.is_bot AND {LANDED}) AS valid_devices
```

看起来挺自然——`FILTER` 就是干这个的。但 `EXISTS` 在这里是**关联子查询**，规划器为它生成一个 SubPlan，也就是**对每条真人点击各跑一次**。30 天窗口 23 万次索引探查，光这一项就是 680 毫秒。

改成把整个「有效设备」抽成独立的子查询，`LANDED` 写在它的 `WHERE` 里：

```sql
(SELECT count(DISTINCT c.device_id) FROM channel_click c
  WHERE c.channel_code = $1 AND c.clicked_at >= $2 AND c.clicked_at < $3
    AND NOT c.is_bot AND {LANDED})
```

规划器这下能看懂：这是一次「点击表 ⋉ 落地表」的半连接，可以一次性哈希，而不是 23 万次探针。这部分 680 ms → 300 ms。

逐日走势和逐渠道列表同理，改成 `LEFT JOIN` 一个分组子查询。`with_valid = false` 的调用方（分享页不展示有效设备）更省——子查询整个不出现，换成常量 `0`，不多扫一遍点击表。

## 但还有一半时间

改完半连接，剩下的耗时里有一大块是**编译开销**。

这几条 SQL 是亚秒级的 OLTP 查询，JIT 永远不划算，可规划器偏偏会误触发。原因是逐日那条查询用 `generate_series` 左连接，行数估到约 2 亿，远超 `jit_above_cost`。JIT 编译一次 150~550 毫秒，占掉本已亚秒的查询的一半以上。

所以给统计接口加了一个只读事务：

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

三个细节：

- 无参数的 `&str` 走简单查询协议，三条语句一次往返。
- 不用 `sqlx::raw_sql`——它的 `execute` 会让调用方（axum 处理函数）的 future 过不了 `Send` 检查。
- `SET LOCAL` 只管这个事务，连接还回池里就恢复；事务只读，结束时直接 drop（回滚）即可。

## 第三条指令是最意外的

`plan_cache_mode = force_custom_plan` 这条一开始我没想到要加。

事情是这样：sqlx 会在连接上缓存预备语句。同一条语句执行满 5 次之后，Postgres 就改用**通用计划**——因为通用计划省掉每次重新规划那 1~3 毫秒，对大多数高频短查询是赚的。

但通用计划拿不到参数的实际值，也就拿不到窗口边界，于是把时间范围估成极小。窗口估小了，我上面刚建好的哈希半连接就退化成逐行嵌套循环。漏斗 290 ms → 600 ms，**改完比没改还慢一倍**，而且是第 6 次请求才开始慢。

这个用肉眼看不出来，写了个临时测试，在同一个连接上循环跑同一批处理函数八次，才把曲线看出来。

这几个接口本来就不频繁，每次多规划 1~3 ms 可以忽略，所以强制自定义计划，始终走测到的哈希半连接。

## 怎么证明结果没变

性能改动最容易顺手改错口径。这次要求逐字节一致，验的是两样东西：

- 漏斗那一行，`md5` 直接比。
- 逐日行和逐渠道行的 `md5`。

30 天窗口和 7 天窗口各验一遍。全部一致才认。

结果（30 天窗口，构建机上的基准）：

| 接口 | 改前 | 改后 |
| --- | --- | --- |
| 渠道详情 | 1.51 s | 0.64 s |
| 跨渠道总览 | 1.49 s | 0.72 s |
| 分享页 | 0.85 s | 0.55 s |

## 记几条经验

**`FILTER` 里的关联子查询会变成 per-row SubPlan。** 只要里面的东西能整体抽出来，抽出去几乎总是对的；`FILTER` 适合放便宜的标量判断，不适合放 `EXISTS`。

**「改完更快了」不一定是真的。** 这次如果不看第 6 次以后的曲线，只看第一次的基准，结论正好反过来。生产上的慢查询往往只在连接被复用一段时间后才显形，单次基准测不出来。

**JIT 不是只在大查询上开。** 它由估算行数触发，而估算可以被 `generate_series` 这种玩意儿轻易顶到阈值以上。亚秒查询就该显式关掉。

`stats_tx` 之上还有一条覆盖测试：用单连接池（事务结束后再取到的必然是同一根连接，才看得出 `SET LOCAL` 有没有漏进池里），断言事务内三条配置都真的生效，再试着在里面插一行、断言失败，最后 drop 掉事务、在池上重新 `SHOW` 一遍 `jit` 和 `plan_cache_mode`，必须回到默认的 `on` / `auto`。`SET LOCAL` 泄漏到池里会污染后面所有查询，这比慢一点严重得多。

这几条经验现在写在函数注释里，跟代码放一起。写在博客里三个月后我自己都找不到..
