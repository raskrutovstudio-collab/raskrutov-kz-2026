const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const BASE = 'http://127.0.0.1:4180/web-studiya/kontekstnaya-reklama/google-ads/';
const OUT = path.join('site_mirror', '_work', 'google-ads-perf', 'shots');
fs.mkdirSync(OUT, { recursive: true });

async function checkStyles(page, label) {
  const data = await page.evaluate(() => {
    const q = (s) => document.querySelector(s);
    const cs = (el) => (el ? getComputedStyle(el) : null);
    const title = q('.ctx-hero__title');
    const header = q('.rk-header');
    const about = q('.gads-about-heading__title');
    const tCs = cs(title);
    const hCs = cs(header);
    const aCs = cs(about);
    return {
      heroFontSize: tCs ? tCs.fontSize : null,
      heroVisible: title ? (tCs.visibility !== 'hidden' && tCs.display !== 'none' && tCs.opacity !== '0') : false,
      headerDisplay: hCs ? hCs.display : null,
      headerVisible: header ? (hCs.visibility !== 'hidden' && hCs.display !== 'none') : false,
      aboutFontSize: aCs ? aCs.fontSize : null,
      h1Text: title ? title.textContent.trim().slice(0, 80) : null,
    };
  });
  console.log(JSON.stringify({ label, ...data }));
  return data;
}

(async () => {
  const browser = await chromium.launch({ headless: true });

  for (const w of [390, 1440, 360]) {
    const page = await browser.newPage({ viewport: { width: w, height: w === 1440 ? 900 : 844 } });
    await page.goto(BASE, { waitUntil: 'networkidle', timeout: 60000 });
    await page.waitForTimeout(500);
    const r = await checkStyles(page, `js-on-${w}`);
    await page.screenshot({ path: path.join(OUT, `after-${w}.png`), fullPage: false });
    await page.close();
  }

  // noscript / JS disabled
  const ctx = await browser.newContext({ javaScriptEnabled: false, viewport: { width: 390, height: 844 } });
  const page = await ctx.newPage();
  await page.goto(BASE, { waitUntil: 'load', timeout: 60000 });
  await page.waitForTimeout(800);
  const noscriptInfo = await page.evaluate(() => {
    const deferred = [...document.querySelectorAll('link[rel=stylesheet]')].map((l) => ({
      href: l.getAttribute('href'),
      media: l.media,
      disabled: l.disabled,
    }));
    const header = document.querySelector('.rk-header');
    const title = document.querySelector('.ctx-hero__title');
    const hCs = header ? getComputedStyle(header) : null;
    const tCs = title ? getComputedStyle(title) : null;
    // Check if deferred CSS applied: .rk-header typically gets styles from home-clean
    return {
      stylesheets: deferred,
      headerDisplay: hCs ? hCs.display : null,
      headerHeight: header ? header.getBoundingClientRect().height : 0,
      heroFontSize: tCs ? tCs.fontSize : null,
      heroVisible: !!(title && tCs && tCs.display !== 'none'),
      // sample a deferred-only rule if possible
      bodyFontFamily: getComputedStyle(document.body).fontFamily,
    };
  });
  console.log(JSON.stringify({ label: 'js-off-390', ...noscriptInfo }));
  await page.screenshot({ path: path.join(OUT, 'after-390-noscript.png'), fullPage: false });
  await ctx.close();
  await browser.close();
  console.log('SHOTS_OK');
})().catch((e) => { console.error(e); process.exit(1); });