const { chromium } = require("playwright");
(async () => {
  const base = "http://127.0.0.1:4180/web-studiya/kontekstnaya-reklama/google-ads/";
  const widths = [360, 390, 768, 1440];
  const browser = await chromium.launch({ headless: true });
  const out = [];
  for (const w of widths) {
    const page = await browser.newPage({ viewport: { width: w, height: 900 } });
    const errors = [];
    page.on("pageerror", (e) => errors.push(String(e)));
    await page.goto(base, { waitUntil: "networkidle", timeout: 60000 });
    await page.waitForTimeout(800);
    const r = await page.evaluate(() => {
      const doc = document.documentElement;
      const hScroll = doc.scrollWidth > doc.clientWidth + 1;
      const h1 = document.querySelector("h1");
      const hero = document.querySelector(".ctx-hero, .gads-page .ctx-hero, [class*=hero]");
      const price = document.querySelector(".gads-price-board, [class*=price]");
      const serp = document.querySelector(".gads-serp-ad, [class*=serp]");
      const icons = document.querySelectorAll("img[src*=\"google-ads/3d\"], .gads-icon, [class*=gads] img").length;
      const cta = document.querySelector("a[href*=\"#\"], button, .rk-btn, [class*=cta]");
      const faq = document.querySelector(".gads-faq, [class*=faq], details");
      const sticky = document.querySelector("[class*=sticky], .rk-sticky, fixed");
      const cssLinks = Array.from(document.querySelectorAll('link[rel=stylesheet]')).map(l => l.getAttribute("href"));
      return {
        title: document.title,
        h1: h1 ? h1.textContent.trim().slice(0, 80) : null,
        hScroll,
        hero: !!hero,
        price: !!price,
        serp: !!serp,
        icons,
        cta: !!cta,
        faq: !!faq,
        sticky: !!sticky,
        cssLinks,
        bodyOpacity: getComputedStyle(document.body).opacity,
      };
    });
    // FAQ open
    let faqOk = false;
    try {
      const faqBtn = page.locator(".gads-faq__btn, .faq button, details summary").first();
      if (await faqBtn.count()) { await faqBtn.click({ timeout: 2000 }); faqOk = true; }
    } catch {}
    // Modal open (no submit)
    let modalOk = false;
    try {
      const openBtn = page.locator("[data-modal], [data-open-modal], a[href='#lead'], button:has-text('заявк'), a:has-text('заявк'), .js-open-form, [class*=lead] button").first();
      // try common CTA that opens modal
      const ctaLead = page.locator("a[href*='lead'], button[data-form], .rk-btn--primary, a.rk-btn").first();
      if (await ctaLead.count()) {
        await ctaLead.click({ timeout: 2000 });
        await page.waitForTimeout(400);
        modalOk = await page.locator(".rk-modal, [class*=modal], dialog[open], .is-open").count() > 0;
        // close if open
        const close = page.locator(".rk-modal__close, [data-close], .modal-close, button:has-text('×')").first();
        if (await close.count()) await close.click({ timeout: 1500 }).catch(()=>{});
      }
    } catch (e) { modalOk = "err:"+e.message; }
    out.push({ w, ...r, faqOk, modalOk, errors });
    await page.close();
  }
  console.log(JSON.stringify(out, null, 2));
  await browser.close();
})().catch((e) => { console.error(e); process.exit(1); });