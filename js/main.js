/* =========================================================
   CONFIG — ここだけ書き換えれば全CTAに反映されます
   ========================================================= */
var CONFIG = {
  // 問い合わせ先URL（LINE公式アカウントの友だち追加URL、またはフォームURL）
  // 例: "https://lin.ee/xxxxxxx"  /  "https://forms.gle/xxxxxxx"
  // 空のままなら、全CTAはページ下部の #contact へスクロールします
  ctaUrl: "", // TODO(CTA_URL)

  // 計測用ラベル（GA4のパラメータ cta_destination に入ります）: "line" | "form" | "other"
  ctaType: "line",

  // 外部URLを新しいタブで開くか（LINEはアプリが起動するので false 推奨）
  openInNewTab: false
};

(function () {
  "use strict";

  var doc = document.documentElement;
  doc.classList.add("js");

  /* ---------- CTA: 遷移先の一括設定 + クリック計測 ---------- */
  var ctas = document.querySelectorAll(".js-cta");
  var hasUrl = /^https?:\/\//.test(CONFIG.ctaUrl);

  ctas.forEach(function (a) {
    if (hasUrl) {
      a.href = CONFIG.ctaUrl;
      if (CONFIG.openInNewTab) { a.target = "_blank"; a.rel = "noopener"; }
    }
    a.addEventListener("click", function () {
      var payload = {
        event: "cta_click",
        cta_location: a.getAttribute("data-cta-location") || "unknown",
        cta_destination: hasUrl ? CONFIG.ctaType : "anchor",
        cta_url: a.href
      };
      window.dataLayer = window.dataLayer || [];
      window.dataLayer.push(payload);
      // GTMを使わず gtag.js を直接入れた場合にも送信
      if (typeof window.gtag === "function") {
        window.gtag("event", "cta_click", {
          cta_location: payload.cta_location,
          cta_destination: payload.cta_destination
        });
      }
    });
  });

  /* ---------- 任意画像: 読み込めたものだけ表示（未配置ならプレースホルダーのまま） ---------- */
  document.querySelectorAll(".js-optional-img").forEach(function (img) {
    function ok() { if (img.naturalWidth > 0) img.classList.add("is-loaded"); }
    if (img.complete) ok(); else img.addEventListener("load", ok);
    img.addEventListener("error", function () { img.setAttribute("hidden", ""); });
  });

  /* ---------- Before / After 比較スライダー ---------- */
  document.querySelectorAll(".ba__stage").forEach(function (stage) {
    var range = stage.querySelector(".ba__range");
    function set() { stage.style.setProperty("--pos", range.value + "%"); }
    range.addEventListener("input", set);
    set();
  });

  /* ---------- ヘッダー背景 ---------- */
  var header = document.querySelector(".site-header");
  function onScroll() { header.classList.toggle("is-scrolled", window.scrollY > 20); }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  if (!("IntersectionObserver" in window)) {
    document.querySelectorAll(".reveal").forEach(function (el) { el.classList.add("is-in"); });
    return;
  }

  /* ---------- 固定CTA（SP）: FVのCTAを過ぎたら表示、最終CTAが見えたら隠す ---------- */
  var sticky = document.getElementById("sticky-cta");
  var stickyLink = sticky.querySelector("a");
  var heroCta = document.querySelector(".hero__cta");
  var finalSec = document.getElementById("contact");
  var pastHero = false, finalVisible = false;

  function updateSticky() {
    var show = pastHero && !finalVisible;
    sticky.classList.toggle("is-visible", show);
    sticky.setAttribute("aria-hidden", show ? "false" : "true");
    stickyLink.tabIndex = show ? 0 : -1;
  }
  new IntersectionObserver(function (entries) {
    var e = entries[0];
    pastHero = !e.isIntersecting && e.boundingClientRect.top < 0;
    updateSticky();
  }).observe(heroCta);
  new IntersectionObserver(function (entries) {
    finalVisible = entries[0].isIntersecting;
    updateSticky();
  }, { rootMargin: "0px 0px -20% 0px" }).observe(finalSec);

  /* ---------- スクロールアニメーション ---------- */
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (e.isIntersecting) { e.target.classList.add("is-in"); io.unobserve(e.target); }
    });
  }, { rootMargin: "0px 0px -8% 0px", threshold: 0.05 });
  document.querySelectorAll(".reveal").forEach(function (el, i) {
    // 同じ親の中で並ぶ要素は少しずつ遅らせる
    var sibs = el.parentElement.querySelectorAll(":scope > .reveal");
    var idx = Array.prototype.indexOf.call(sibs, el);
    if (sibs.length > 1 && idx > 0) el.style.transitionDelay = Math.min(idx * 70, 350) + "ms";
    io.observe(el);
  });

  /* ---------- 未確定項目の一覧（localhost または ?todo=1 のときだけ表示） ---------- */
  var isLocal = /^(localhost|127\.0\.0\.1|\[::1\])$/.test(location.hostname) || location.protocol === "file:";
  if (!isLocal && !/[?&]todo=1/.test(location.search)) return;

  var todos = Array.prototype.slice.call(document.querySelectorAll("[data-todo]"));
  if (!hasUrl) todos.unshift({ getAttribute: function () { return "問い合わせ先URL（js/main.js の CONFIG.ctaUrl）"; } });
  if (!todos.length) return;
  doc.classList.add("show-todo");

  var badge = document.createElement("button");
  badge.className = "todo-badge";
  badge.type = "button";
  badge.textContent = "未確定 " + todos.length + "件";
  var panel = document.createElement("div");
  panel.className = "todo-panel";
  panel.hidden = true;
  panel.innerHTML = "<p><strong>公開前に差し替える項目</strong>（この表示は本番では出ません）</p>";
  var list = document.createElement("ol");
  todos.forEach(function (el) {
    var li = document.createElement("li");
    if (el.nodeType === 1) {
      var b = document.createElement("button");
      b.type = "button";
      b.textContent = el.getAttribute("data-todo");
      b.addEventListener("click", function () { el.scrollIntoView({ behavior: "smooth", block: "center" }); });
      li.appendChild(b);
    } else {
      li.textContent = el.getAttribute("data-todo");
    }
    list.appendChild(li);
  });
  panel.appendChild(list);
  badge.addEventListener("click", function () { panel.hidden = !panel.hidden; });
  document.body.appendChild(panel);
  document.body.appendChild(badge);
})();
