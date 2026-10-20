#!/usr/bin/env python3
"""公開前チェック。エラーが1件でもあれば終了コード1。

    python3 scripts/verify.py
"""
import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
html = (ROOT / "index.html").read_text(encoding="utf-8")
js = (ROOT / "js" / "main.js").read_text(encoding="utf-8")

errors, warns = [], []

# 1. 問い合わせ先URL
m = re.search(r'ctaUrl:\s*"([^"]*)"', js)
if not m or not re.match(r"https?://", m.group(1)):
    errors.append("js/main.js の CONFIG.ctaUrl が未設定（全CTAがページ内リンクのままです）")

# 2. 未確定項目
todos = re.findall(r'data-todo="([^"]+)"', html)
if todos:
    errors.append(f"data-todo が {len(todos)} 件残っています:\n      - " + "\n      - ".join(todos))
brackets = re.findall(r">\s*\[[^\]<]*\]", html)
if brackets:
    errors.append(f"[ ] のプレースホルダー文言が {len(brackets)} 箇所残っています")

# 3. 公開設定
if "noindex" in html:
    errors.append("<meta name=\"robots\" content=\"noindex\"> が残っています（公開時に削除）")
if "example.com" in html:
    errors.append("canonical / og:url / og:image が example.com のままです")
if 'href="#" ' in html or 'href="#">' in html:
    errors.append("リンク先が # のままのリンクがあります（特商法表記・プライバシーポリシーなど）")
if "GTM-XXXXXXX" in html and "<!-- ANALYTICS" in html:
    warns.append("GTMが未導入です（コメントアウトのまま）")

# 4. 禁止表現（成果保証・偽の限定・誇大表現）
NG = ["必ず", "確実に", "絶対", "100%", "優勝できる", "保証します", "誰でも", "残りわずか", "今だけ", "限定", "先着", "No.1", "日本一"]
text = re.sub(r"<!--.*?-->", "", html, flags=re.S)
text = re.sub(r"<script.*?</script>", "", text, flags=re.S)
for w in NG:
    if w in text:
        errors.append(f"禁止表現の可能性: 「{w}」")

# 5. 構造
h1 = len(re.findall(r"<h1[\s>]", html))
if h1 != 1:
    errors.append(f"h1 が {h1} 個あります（1個にしてください）")
for i, block in enumerate(re.findall(r'<script type="application/ld\+json">(.*?)</script>', html, flags=re.S), 1):
    try:
        json.loads(block)
    except json.JSONDecodeError as e:
        errors.append(f"JSON-LD #{i} の構文エラー: {e}")
for img in re.findall(r"<img\b[^>]*>", html):
    if "alt=" not in img:
        errors.append(f"alt がない img: {img[:80]}")

# 6. 画像
for name, label in [("ogp.jpg", "OGP画像"), ("hero.jpg", "ファーストビュー写真"), ("trainer.jpg", "トレーナー写真")]:
    if not (ROOT / "images" / name).exists():
        (errors if name != "hero.jpg" else warns).append(f"images/{name}（{label}）がありません")

# 7. CTA
ctas = re.findall(r'data-cta-location="([^"]+)"', html)
if len(ctas) != len(set(ctas)):
    warns.append("data-cta-location に重複があります（計測で区別できません）")

for w in warns:
    print(f"  WARN  {w}")
for e in errors:
    print(f"  NG    {e}")
print(f"\nCTA計測ポイント: {', '.join(ctas)}")
print("OK: 公開できます" if not errors else f"\n{len(errors)} 件の要対応があります")
sys.exit(1 if errors else 0)
