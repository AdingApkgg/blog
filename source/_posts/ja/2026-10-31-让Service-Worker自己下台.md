---
title: Service Worker を自ら降板させる
description: 古いキャッシュでまだ動いている SW は、そのまま削除するわけにもいかず、残しておくわけにもいかない。1107 行の削除に至った退役までの過程を記録する
keywords: 技術開発, フロントエンドとテーマ, Service Worker, PWA
abbrlink: 10258
permalink: ja/p/10258/
lang: ja
translation_of: _posts/2026-10-31-让Service-Worker自己下台.md
source_hash: d10ee34f85a1
translator: ai
reviewed: false
categories:
  - 技術開発
  - フロントエンドとテーマ
tags:
  - Service Worker
  - PWA
top_img: false
copyright_author: DeepSeek V4 Flash
copyright_author_href: https://deepseek.com
date: 2026-10-31 06:02:00
updated: 2026-10-31 06:02:00
---

`88b54539 refactor(web): retire service worker caching safely`、1107 行削除、354 行追加。数字だけ見るとリファクタリングのようだが、実態はまだ生きているものに退場を段取りする作業だ。

## なぜ削除したいのか

このサイトは Next.js アプリで、以前は Serwist を使って PWA のプリキャッシュを行っていた。問題は徐々に表面化してきた：

- デプロイ後もブラウザ側のプリキャッシュは残り、ユーザーは前バージョンの HTML と前バージョンの JS を受け取ってしまう。
- キャッシュ内の古い chunk が消された後、ページがそれを参照して、そのまま白画面になる。
- 問題が起きてもユーザー側で「キャッシュを消す」しかなく、こちら側には救済手段が一切ない。

一方でそれによって得られる利点はどんどん小さくなっていた：アプリは既に正常にインストールできる（2026-10-30 に Google の現行インストール条件をわざわざ確認したが、service worker はとうに必須ではなくなっている）し、プッシュも使っていない。残っているのは「オフラインで開ける」ことだけで、その代償はバージョンの不一致だ。

結論は、キャッシュという層を退役させること。

## ただし登録を消すだけでは済まない

最も直感的な方法はページ内で `navigator.serviceWorker.getRegistrations()` して一つずつ `unregister()` することだ。

それでは足りない。`unregister()` はあくまで**新しい**ナビゲーションを引き受けさせないだけで、既に動いている worker は生きており、`fetch` イベントでリクエストをキャッシュに流し続けている。ユーザーの今回のアクセスは相変わらず古いままだ。しかも登録を消した後、Cache Storage 内のエントリは誰にも管理されず、永遠に容量を占有し続ける。

`Clear-Site-Data` で一気にやるのもダメだ：それでは IndexedDB や cookie まで消えてしまい、こちらにはローカルデータもある。

必要なのは**退役版 worker**だ：`/sw.js` という古いアドレスに引き続き公開し、自分自身の後片付けを専門に担う。

## 退役 worker はこうなっている

`apps/web/public/sw.js` は全文 52 行、`fetch` handler はない——ここが肝心で、新しい worker がインストールされさえすれば、リクエストはもうキャッシュを通らなくなる。

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

いくつか意図的な選択がある：

**インストールしたらすぐ `skipWaiting`。** 待たない、旧 worker の退場も待たない。ここにはバージョン互換の問題はない——新しい worker は何もキャッシュしないので、早ければ早いほどよい。

**先に `clients.claim()`、それから削除。** 現在のページを接管すれば、キャッシュ削除時にページが旧 worker によってそれらのキャッシュから取得されている最中、という事態が起きない。クリーンアップは本当に完了するまで `unregister()` してはならない：`Promise.allSettled` の中で一つでも rejected があれば `return` し、passive 状態に留めて次回に再挑戦する。削除しきれないまま登録解除すると、誰にも管理されないキャッシュディレクトリの山が残ってしまう。

**`cleanup` の変数は再入防止のため。** `activate` と `message` はほぼ同時に到着することがあり、ロックしなければ `caches.delete` が二度走ってしまう。

**削除するのはホワイトリストのみ。** 他のライブラリや実験が `Cache Storage` に何かを置いている可能性があり、`caches.keys()` で全部消すのは越権だ。9 つの名前は Serwist の生成物から写したもので、scope 付きのものは実行時の値を連結する必要がある。

**`fetch` handler は書かない。** これが「退役」の定義だ。handler があればまだインターセプトしており、バージョン不一致の可能性が残る。

## 誰が更新をトリガーするのか

退役 worker は `/sw.js` に置かれているが、全員が自動的に取りに行くわけではない。

ブラウザは**scope 内のページへナビゲートしたとき**にしか `sw.js` が変わったかを確認しない。ユーザーが現在のタブで動かずにいれば、新しいバージョンには永遠に気づかない。だからクライアント側のドライバーが必要になる：

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

外側の `try/catch` はそれぞれ二つの状況を受け止める：`getRegistrations()` はストレージポリシーによって拒否されることがあり、登録も処理途中で並行して解除されることがある。このコンポーネントはちょっと突くだけで、**いかなる例外もページを壊してはならない**。

`components/site/service-worker-retirement.tsx` は production のとき、`readyState` が complete または `load` のとき、そして `online` のときにだけ呼び出す。

**`update()` のみ、`register()` は決してしない。** 新規訪問者にはそもそも SW がないので、空のものを登録してそれを自分で解除させるのは無駄な手間だ。既に登録があるものだけが突く価値がある。マッチ条件は二重に絞っている：scope はサイトルートでなければならず、最新 worker の `scriptURL` がまさに `/sw.js` でなければならない——他のパスにはサードパーティの worker がいる可能性があり、それに手を出すのは余計なお節介だ。最新 worker の判定には `installing ?? waiting ?? active` を使う。`active` だけ見ると「新しい worker がインストール中」の一瞬で空になり、まさに処理すべき対象を取りこぼしてしまう。

`message` のリスナーはこうしたケースのための保険だ：`update()` が新しい worker をインストールしたが、ページが再ナビゲートされておらず、新しい worker が `activate` を発火していない。直接 `postMessage` して働かせれば、ユーザーのリロードを待たなくてよい。このメッセージは**リトライ**も担う——passive 状態の worker が前回クリーンアップに失敗したら、次の訪問時にもう一度押し込む。

## テストファースト

まずテストを書き、まず赤くなるのを見る。最終的に 9 個：6 個がページ側のロジックを、3 個が worker 自体をテストする。
(これは同じ記事の前編・全 2 回のうちの 1 回目です。)

ページ側の 6 つのカバレッジ：新規訪問者は登録しない、本站ルートパスの worker だけを更新する（他の script、別の scope、別の origin には一切触れない）、サードパーティの worker に置き換えられた登録には手を付けない、まだアクティベートされていない初回インストール中の状態も処理できる、オフラインで失敗してもページを壊さず次回の呼び出しでリトライする、`getRegistrations()` が拒否されてもサイレントな no-op になる。

worker 側の 3 つは `node:vm` で `sw.js` を、IndexedDB / localStorage / OPFS / ナビゲーション API のない空の環境で走らせる——ついでにユーザーデータを消したり強制リロードしたりする書き方をすると、その場で落ちる。3 つのケース：正常な退役（`fetch` リスナーがないこと、`claim` が削除より前であること、最後のステップが `unregister` であること、残るのは非ホワイトリストの 3 つのキャッシュだけであることをアサート）、削除失敗時は passive に留まりメッセージでリトライできる、無関係なメッセージでは発火しない。

特に書く価値があるのは：**ホワイトリスト外は消さない**。これがレッドになって初めて、なぜそう書くのかがよく分かる——もし `caches.keys()` を一律に削除していたら、将来誰かが `Cache Storage` に何かを置いたとき、退役 worker はそれがオンラインになった当日にそれを消してしまう。そしてその時、このファイルを開く人はもう別人になっている。

## 検証

リモート `scripts/remote/verify.sh --keep`：719 ファイルが lint を通過、739 テストがすべてグリーン。

本当の受け入れは Chromium 156 の中で：古いキャッシュを抱えた古参ユーザーをシミュレートし、5 ラウンドの移行を実行、各ラウンドで登録が消えたか、9 つのキャッシュ名が空になったかをチェック。5 ラウンドすべて通過、2 つの古いタブは最後まで一度もリロードしなかった。

2 ラウンドはスクリプト自体に問題が出たが、どちらも製品の問題ではなかった：

- 初版スクリプトは `about:blank` から始まり、`sessionStorage` にアクセスした途端に拒否された（origin なし）。
- その後の診断スクリプトにはサンプリング競合があった——状態の読み取りと worker の処理が同じフレームで行われ、読む方が処理より速く、見えていたのは中間状態だった。

2 つ目は製品ではなくスクリプトを直した：「登録が空 **かつ** 一時キャッシュが空」の 2 条件が同時に成立するのを待ってから判定するようにし、固定 sleep の後に一度見るだけにはしなかった。`sleep` でタイミングを埋めるのは、テストを確率の問題に変えているだけだ。

## 残ったもの

`public/sw.js` というファイルは長期的に残す。古参ユーザーのブラウザに古い登録が残っている限り、それは役に立つ；新規訪問者のブラウザはそれを受け取り、インストールし、実行し終え、登録解除し、その後はきれいなままになる。アクセス量に占める古い登録の割合がゼロに近づいてから、ようやくファイルごと削除できる——とはいえ残しておいてもコストはかからない、52 行でハンドラのないファイルだ。

このプロセス全体で最も間違えやすいのは順序だ：先にキャッシュを削除してから claim する、あるいは削除に失敗しても登録解除する。前者は開いているページがキャッシュ削除の最中に問題を起こすし、後者はゴミを残す。どちらも「動いているようにも見える」類の誤りで、テストと受け入れ条件でしか固定できない。