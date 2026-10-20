# 高野トレーナーの弱点部位特化型オンラインパーソナル LP

フィジーク・ボディビルのコンテスト出場者向け、弱点部位特化型オンラインパーソナルのランディングページ。運営：パーソナルジム Mintea's（ミンティーズ）。

ゴールは「自分がずっと悩んでいた弱点を、このトレーナーなら一緒に分析して改善してくれそうだ」と感じてもらい、相談（LINE／フォーム）につなげること。

- 素のHTML / CSS / JavaScript（ビルド不要・外部ライブラリなし）。GitHub Pages 等にそのまま置けます。
- 料金・実績・写真・FAQ回答など未確定の情報は**架空の内容を入れず**、プレースホルダーにしています → [TODO.md](TODO.md)

## 構成（共感 → 原因 → 解決策 → 信頼 → 行動）

| # | セクション | id |
|---|---|---|
| 1 | ファーストビュー（H1・CTA） | — |
| 2 | こんな悩みはありませんか？ | `#problem` |
| 3 | 弱点が改善しない理由 | `#reason` |
| 4 | サービスの強み（3つの柱）＋CTA | `#service` |
| 5 | 指導の流れ（STEP1〜6・チャット画面イメージ・オンライン不安解消） | `#flow` |
| 6 | トレーナー紹介 | `#trainer` |
| 7 | 改善事例 | `#cases` |
| 8 | 料金・プラン＋CTA | `#plan` |
| 9 | よくある質問 | `#faq` |
| 10 | 最終CTA | `#contact` |

SPでは、ファーストビューのCTAを過ぎると下部に固定CTAが出て、最終CTAが見えたら隠れます。

## ファイル

```
index.html          LP本体（SEO・OGP・構造化データ含む）
css/style.css       スタイル（モバイルファースト）
js/main.js          CONFIG（問い合わせ先URL）／CTA計測／固定CTA／スクロールアニメーション／未確定項目パネル
images/             hero.jpg・trainer.jpg・ogp.jpg を置く場所（favicon.svg のみ同梱）
scripts/verify.py   公開前チェック
TODO.md             公開前に確認が必要な項目
```

## ローカル確認

```bash
python3 -m http.server 8939 --directory /Users/ijiri/takano-weakpoint-lp
```

→ http://localhost:8939 （localhostでは未確定項目が黄色の点線で囲まれ、左下に一覧が出ます。本番でも `?todo=1` で表示可）

## 差し替え方

- **問い合わせ先**：`js/main.js` の `CONFIG.ctaUrl` に1回書くだけで全CTA（header / fv / after_service / after_plan / final / sticky）に反映。
- **写真**：`images/trainer.jpg`・`images/hero.jpg` を置くだけで表示（未配置ならプレースホルダー表示のまま）。
- **料金・プロフィール・FAQ**：`index.html` の `TODO(...)` コメント箇所を直接編集。確定したら `data-todo` 属性を削除。

## 計測（GA4 / GTM）

CTAクリック時に以下を `dataLayer` に送信します（`gtag` が直接入っている場合はGA4イベントも送信）。

```js
{ event: "cta_click", cta_location: "fv" | "after_service" | "after_plan" | "final" | "sticky" | "header",
  cta_destination: "line" | "form" | "anchor", cta_url: "..." }
```

GTMでは「カスタムイベント = cta_click」をトリガーに、`cta_location` をデータレイヤー変数としてGA4イベントへ渡してください。

**LINE登録数の計測**：LPからはクリック数までしか取れません。友だち追加数はLINE公式アカウント側で計測します。
LINE Official Account Manager の「友だち追加経路」用に、このLP専用の友だち追加URL（または流入経路分析用QR/URL）を発行して `ctaUrl` に入れると、「LPクリック数 → 友だち追加数」で歩留まりを確認できます。

## 公開前チェック

```bash
python3 scripts/verify.py
```

CTA URL未設定、`data-todo`・`[ ]` プレースホルダーの残り、noindex・example.com の残り、`href="#"`、
禁止表現（「必ず」「確実に」「絶対」「限定」「残りわずか」など成果保証・偽の限定）、h1の数、JSON-LD構文、alt漏れ、必須画像をチェックします。

## FAQ構造化データ（回答確定後に追加）

`<head>` 内に以下の形式で追加してください（回答はページ上の表示と一字一句そろえる）。

```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    { "@type": "Question", "name": "弱点部位が分からなくても相談できますか？",
      "acceptedAnswer": { "@type": "Answer", "text": "はい、ご相談いただけます。…" } }
  ]
}
</script>
```

## 表現ルール

- 「必ず優勝」「確実に筋肥大」などの成果保証はしない。改善事例には個人差の注記を付ける。
- 実績・成績・口コミ・ビフォーアフターは確認済み・本人同意済みのものだけ。
- 偽の限定表示（残り◯枠、今だけ等）は使わない。
