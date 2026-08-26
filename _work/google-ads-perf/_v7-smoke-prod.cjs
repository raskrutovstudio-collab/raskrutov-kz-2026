const { chromium } = require("playwright");
(async () => {
  const url = "https://raskrutov.kz/web-studiya/kontekstnaya-reklama/google-ads/?cb=" + Date.now();
  const browser = await chromium.launch({ headless: true });
  const results = [];
  for (const w of [390, 1440]) {
    const page = await browser.newPage({ viewport: { width: w, height: 900 } });
    const errors = [];
    page.on("pageerror", (e) => errors.push(String(e.message || e)));
    await page.goto(url, { waitUntil: "networkidle", timeout: 90000 });
    await page.waitForTimeout(1200);
    const base = await page.evaluate(() => {
      const doc = document.documentElement;
      return {
        hScroll: doc.scrollWidth > doc.clientWidth + 1,
        h1: (document.querySelector("h1") || {}).textContent?.trim()?.slice(0, 80) || null,
        cssV7: !!document.querySelector('link[href*="google-ads-page.css?v=7"]'),
        noCritical: !document.querySelector('link[href*="critical"]'),
        hero: !!document.querySelector(".ctx-hero"),
        price: !!document.querySelector(".gads-price-board"),
        serp: !!document.querySelector(".gads-serp-ad"),
        sticky: !!document.querySelector("[class*=sticky], .ctx-sticky, .rk-sticky-cta, .gads-sticky"),
        stickyVis: (() => {
          const els = Array.from(document.querySelectorAll("[class*=sticky], .rk-sticky, .ctx-sticky, .gads-sticky, fixed"));
          return els.some((el) => {
            const s = getComputedStyle(el);
            return (s.position === "sticky" || s.position === "fixed") && s.display !== "none";
          });
        })(),
        contrastSample: (() => {
          const el = document.querySelector(".gads-serp-ad__title, .gads-serp-ad a, [class*=serp] [class*=title]");
          return el ? getComputedStyle(el).color : null;
        })(),
      };
    });
    // FAQ
    let faqOk = false;
    try {
      const faqBtn = page.locator(".gads-faq__btn").first();
      if (await faqBtn.count()) {
        await faqBtn.click({ timeout: 3000 });
        await page.waitForTimeout(300);
        faqOk = await page.locator(".gads-faq__item.is-open, .gads-faq__panel:not([hidden]), .gads-faq__btn[aria-expanded=true]").count() > 0
          || await page.evaluate(() => {
            const p = document.querySelector(".gads-faq__panel, .gads-faq__answer, .gads-faq__body");
            if (!p) return false;
            const s = getComputedStyle(p);
            return s.display !== "none" && s.visibility !== "hidden" && p.offsetHeight > 0;
          });
      }
    } catch (e) { faqOk = "err:" + e.message; }
    // Modal via data-rk-open-modal
    let modalOk = false;
    try {
      const open = page.locator('[data-rk-open-modal="rk-modal-lead"]').first();
      await open.click({ timeout: 4000 });
      await page.waitForTimeout(500);
      modalOk = await page.evaluate(() => {
        const m = document.getElementById("rk-modal-lead");
        if (!m) return false;
        return !m.hasAttribute("hidden") || m.classList.contains("is-open") || getComputedStyle(m).display !== "none";
      });
      const close = page.locator("[data-rk-modal-close]").first();
      if (await close.count()) await close.click({ timeout: 2000 }).catch(() => {});
    } catch (e) { modalOk = "err:" + e.message; }
    // Metrika
    const metrika = await page.evaluate(() => {
      const scripts = Array.from(document.scripts).map(s => s.textContent || "").join("\n");
      const srcs = Array.from(document.scripts).map(s => s.src || "");
      const hasId = /101127167/.test(scripts + srcs.join(" "));
      const webvisor = /webvisor\s*:\s*true/.test(scripts);
      let ymCount = 0;
      if (typeof window.ym === "function") {
        // cannot easily count calls; check counter presence
        ymCount = (window.Ya && window.Ya.Metrika2) ? 1 : (window.ym ? 1 : 0);
      }
      // count script tags / ym(101127167
      const initMatches = scripts.match(/ym\(\s*101127167/g) || [];
      return { hasId, webvisor, initCount: initMatches.length, ymType: typeof window.ym };
    });
    // CTA visible
    const ctaVis = await page.locator('[data-rk-open-modal="rk-modal-lead"]').first().isVisible().catch(() => false);
    results.push({ w, ...base, faqOk, modalOk, ctaVis, metrika, errors });
    await page.close();
  }
  console.log(JSON.stringify(results, null, 2));
  await browser.close();
})().catch((e) => { console.error(e); process.exit(1); });