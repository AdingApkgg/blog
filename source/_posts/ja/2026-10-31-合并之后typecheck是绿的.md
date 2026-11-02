---
title: マージ後、typecheck はグリーンだった
description: >-
  コンフリクトもエラーもない一度のマージが、292行の広告アトリビューション実行時コードを丸ごと削除していた。grep一行でようやく気づいた話と、8つのイベントをレーン分けする際に決めたルールの記録
keywords: 技術開発, 開発フロー, Git, コードレビュー, 広告アトリビューション
abbrlink: 28388
permalink: ja/p/28388/
lang: ja
translation_of: _posts/2026-10-31-合并之后typecheck是绿的.md
source_hash: e3e582ff01b9
translator: ai
reviewed: false
categories:
  - 技術開発
  - 開発フロー
tags:
  - Git
  - コードレビュー
  - 広告アトリビューション
top_img: false
copyright_author: DeepSeek V4 Flash
copyright_author_href: https://deepseek.com
date: 2026-10-31 06:38:00
updated: 2026-10-31 06:38:00
---

`2aa1194ed`、タイトルは「Merge latest main into zsf」。これ以上ないほどありふれたマージコミットだ。

これが Adjust ランタイム一式を消し飛ばした。`packages/api/src/adjust/` 配下の 8 ファイルのうち 7 つが丸ごと削除され、`diff --stat` は 4 行追加・292 行削除。

コンフリクトなし。コンパイルエラーなし。CI はグリーン。

## 削除はどう紛れ込んだのか

マージの両親は `e5051db93` と `93173a00b`（main）、マージベースは `e11e286ff`。base の時点でこの 8 ファイルは健在で、`git ls-tree` の名前もすべて載っている。

問題は zsf 側のブランチが先にそれらを消していたことだ。あのブランチがやるべきは別の機能で、Adjust は「main に増えた余計なもの」に見えた。消せばローカルはきれいになる。そうしてマージのとき、git が向き合ったのは「片方が削除、片方が無変更」——三者マージのルールでは、削除は zsf の変更としてそのまま採用される。

**これはロールバックではないし、コンフリクトでもない。** コンフリクトなら少なくとも手を止めて聞いてくる。この種のマージは黙って適用され、コミットメッセージにも「Merge latest main」としか書かれない。

おまけに、削除後もコンパイルエラーは出ない。同じ一連のコミットで、`import "@nq/api/adjust"`、`adjust-tracking`、`adjust-session` への参照もまとめて消えていたからだ。参照だけ残って実装が消えれば `pnpm typecheck` が赤くなる。

つまり「test グリーン、typecheck グリーン、build グリーン」というこの一連の青信号は、ここでは完全に無力だった。それらが見ているのは「コンパイルできるか」であって、「機能がまだあるか」ではない。

## 見つけ方

一行のコマンド：

```sh
git grep '@nq/api/adjust' upstream/preview
```

ヒットゼロ。

これがそのときの教訓で、短いから呪文のように唱えられる：**大きなブランチをまたいでマージしたら、typecheck だけを見るな、機能名で grep しろ。** `2aa1194ed` のあと何度かマージが重なれば、この手がかりは完全に沈む——機能名はドキュメントに残っていても、覚えている人の頭の中の窓は数日しかない。

見つけたあとは `88cdad163`、86 ファイル・6117 行の追加で、ランタイムを復元しつつ A2/A3/A4/A6/A7 を一気に埋めた。監査ドキュメント `09-adjust-audit.md` が 10-23 時点で出していた結論は、まだ「0%、リポジトリに Adjust 連携は一切なし」だった。

復元は半分にすぎない。ここからが本当に頭を使うパートだ。

## 8 個の Token は 8 本のイベントではない

ベンダーは Event Token を 8 個くれ、運用は管理画面で作り終え、初回購入と返金には金額を載せるよう求めてきた。一番楽な書き方は「Token を見たら送る」——8 個の if だ。

だがイベントは対等ではない。「どれが唯一の真実か」で分ければ、もともと二種類ある：

| イベント | レーン | 収益あり |
| --- | --- | --- |
| `registration` | SDK（ネイティブ） | なし |
| `first_purchase` | S2S | あり |
| `purchase` | S2S | あり |
| `refund` | S2S | あり（返金額） |
| `first_unlock` | S2S | なし |
| `episode_unlock` | S2S | なし |
| `vip_activation` | S2S | なし |
| `vip_expired` | S2S | なし |

なのでエンキューする場所で最初にやるのは、集合を分けることだ：

```ts
/** 带收入的事件 —— 入队时必须拿到合法金额与币种，否则落 BLOCKED 而不是发一条 0 元收入。 */
export const ADJUST_REVENUE_EVENTS: ReadonlySet<string> = new Set(
  ADJUST_INTERNAL_EVENTS.filter(e => e.revenue).map(e => e.key),
);
```

分けたあとは、コードに直書きで管理画面からは変えられないルールがいくつかある。

**一つの金は一度しか計上できない。** 初回購入に当たったら `first_purchase` だけを送り、`purchase` は送らない：

```ts
function mappingCandidates(internalEvent: string, firstPurchase: boolean): string[] {
  if (!ADJUST_REVENUE_EVENTS.has(internalEvent)) return [internalEvent];
  const chain = internalEvent === "PURCHASE" || internalEvent === "FIRST_PURCHASE"
    ? ["PURCHASE"]
    : [internalEvent, "PURCHASE"];
  return firstPurchase ? ["FIRST_PURCHASE", ...chain] : chain;
}
```

候補は具体的なものが先、汎用が後。最初に当たった時点で止まる。`FIRST_PURCHASE` が未設定なら自然に型イベントや `PURCHASE` へ落ちるので、管理画面の設定が一行足りないだけで全体が途切れることはない。

**非収益イベントにフォールバックはない。** 上の一行目がそのまま `[internalEvent]` を返しているのに注目。`EPISODE_UNLOCK` にマッピングがなければ `BLOCKED / MISSING_S2S_MAPPING` に落ち、`PURCHASE` へは退かない——退くと 0 円の収益が空しく計上され、レポートに空白が並ぶ。一件欠けるより、よほど追いにくい。

**アンロックで収益を二重計上しない。** コインは事前にチャージ注文で買われていて、アンロックはそれを消費するだけ。だから `first_unlock` / `episode_unlock` の `revenue` は一律で空だ。

**会員有効化と収益は同じ注文の二本のイベント。** `vip_activation` と `purchase` は同じ注文から生まれるので、送信行の一意キーは `(order_id, environment)` から `(order_id, environment, internal_event)` へ広げる。`currency` も同時に NULL 許容へ開放する——非収益イベントに文字列 `"INVALID"` を入れると、ベンダー側で通貨として弾かれる。

**足りないものはすべて見えるように。** どこか一環でも満たされない——身元がない、環境が合わない、マッピングがない、S2S token がない、金額が不正——なら、理由コード付きで `BLOCKED` を一行書き、黙って捨てない。「設定は済んでいるのに身元がない」这类のブラックホールは、管理画面のコールバック記録で必ず見えなければならない。さもなければ永遠に「送っているはずなんだけど」で終わる。

## コールバック側
（これは同じ記事の前半、全 2 部のうちの 1 部です。）

`GET|POST /api/webhooks/adjust/callback`。ステータスコードは相手側の再送ルールに沿って返す。`200` 受け付けた、または受領済み。`400` これは救えないので再送しない。`401` 認証が通らない。`404` まだペアリングしていない。`503` こちら側の一時障害。

認証は両側とも `timingSafeEqual`。冪等キーは `created_at` のハッシュ。受領証は最初の一度だけ固定する（`where callbackAt: null`）。

この部分を実際に動かしてみると、2 つのベンダー挙動にぶつかり、どちらもコードコメントとテストに記録した。

- **2xx には 3 つの形がある**：`{"status":"OK"}`、空ボディの `{}`、空文字列。元の判定条件は最初の形しか認めておらず、残り 2 つは `UNKNOWN` と判定され、しかも `UNKNOWN` は自動再送しない。その結果、ベンダー側にすでに記録された収益が永遠に照合できなくなる。2xx ならすなわち `SENT` に変更した。
- **`{order_id}` はプレースホルダーではない**。`help.adjust.com` の 262 項目のプレースホルダー表にそれはなく、コールバック URL に書いても置換されず、相手が受け取るのはリテラルそのもの。さらに S2S の `callback_params` は実際の値を URL の末尾に付加するため、同じキーが 2 回現れ、リテラルが先に来るので、`first()` は永遠に `{order_id}` を取得してしまう。パーサーは `getAll` を走査し、`{...}` の形をスキップするように変更した。

2 つ目を直したあと、わざわざ最悪の形で再検証を行った。テンプレートを `{order_id}` 付きの古い書き方に戻し、1 件の取引を作って最後まで通し、受領証はいつもどおり固定されることを確認した。本番で動いているのが新しいパーサーであり、「テンプレートがたまたまクリーンだっただけ」ではないと確かめてからようやく受け入れた。

## 2 つのゲート、意図的に別物

`AD_REAL_SENDING_ENABLED=0` が閉じるのは Meta CAPI と TikTok。この 2 社にはサンドボックスがなく、プレビューで 1 件送れば本当に広告アカウントに記録される。Adjust はそれゆえ影響を受けない。Adjust には本物のサンドボックスがあり、`adjustEnvironment()` で preview を `SANDBOX` に固定マッピングしているからだ。

プレビュー時の Adjust も黙らせたいなら、もう 1 つの `ADJUST_S2S_ENABLED=0` を使う。

2 つのゲートを分けたのは「理由が違う」からだ。1 つは「本物のアカウントを汚染しない」、もう 1 つは「この経路自体を黙らせる」。1 つに合成してしまうと、将来片方だけ黙らせたいときに書き直しが必要になる。

## まとめ

本番部分は別途 `a2bcb4351` として開いた。`release-v1.2.45` をベースに、preview で検証済みのものだけを載せ、Mock/Kafka の設備や同意ポップアップは持たせていない。

振り返ると、`2aa1194ed` のようなマージ事故のコストは「取り戻すこと」にはない。マージ（10-27 10:41 UTC+7）から復旧コミット `88cdad163`（同日 19:47 UTC+8）まで 8 時間、ものは git の中に一行も失われずにあった。コストはその 8 時間の中にあった。機能は「もうある」と見なされ、誰も触らず、回帰テストも存在しないモジュールをカバーできるはずがない。

最もコストの低い防衛線は、grep をマージ後の定例動作にすることだ。typecheck が答えるのは「コンパイルできるか」であり、「ものはまだそこにあるか」に答えるのは grep だけだ。