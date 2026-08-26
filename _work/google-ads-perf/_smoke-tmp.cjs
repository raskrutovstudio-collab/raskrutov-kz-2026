const { chromium } = require("playwright");
(async () => {
  const url = "http://127.0.0.1:4173/web-studiya/kontekstnaya-reklama/google-ads/";
  const browser = await chromium.launch({ headless: true });
  const results = [];
  for (const w of [360, 390, 1440]) {
    const page = await browser.newPage({ viewport: { width: w, height: 800 } });
    let ok = false;
    try {
      await page.goto(url, { waitUntil: "domcontentloaded", timeout: 8000 });
      ok = true;
    } catch (e) {
      results.push({ w, error: String(e.message).slice(0, 120) });
      await page.close();
      continue;
    }
    const data = await page.evaluate(() => {
      const h1 = document.querySelector("h1");
      const lead = document.querySelector(".ctx-hero__lead, .gads-page .ctx-hero__lead, .hero__lead");
      const scroll = document.documentElement.scrollWidth > document.documentElement.clientWidth + 1;
      return {
        h1: h1 ? (h1.innerText || "").slice(0, 80) : null,
        h1Visible: !!(h1 && h1.offsetParent !== null && getComputedStyle(h1).opacity !== "0"),
        lead: lead ? (lead.innerText || "").slice(0, 80) : null,
        leadVisible: !!(lead && getComputedStyle(lead).opacity !== "0" && getComputedStyle(lead).visibility !== "hidden"),
        hScroll: scroll,
      };
    });
    results.push({ w, ...data });
    await page.close();
  }
  await browser.close();
  console.log(JSON.stringify(results, null, 2));
})().catch((e) => { console.error(e); process.exit(1); });
