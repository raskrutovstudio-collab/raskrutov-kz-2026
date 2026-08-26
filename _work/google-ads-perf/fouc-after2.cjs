const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const url = 'http://127.0.0.1:4180/web-studiya/kontekstnaya-reklama/google-ads/';
const shots = path.resolve('site_mirror/_work/google-ads-perf/shots');
fs.mkdirSync(shots, { recursive: true });

(async () => {
  const browser = await chromium.launch({ headless: true });

  // FOUC check at 390: inspect H1 as early as possible (domcontentloaded)
  const page = await browser.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 });
  await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 120000 });
  const early = await page.evaluate(() => {
    const h1 = document.querySelector('h1');
    if (!h1) return { found: false };
    const cs = getComputedStyle(h1);
    const r = h1.getBoundingClientRect();
    return {
      found: true,
      text: (h1.textContent || '').trim().slice(0, 60),
      fontSize: cs.fontSize,
      fontWeight: cs.fontWeight,
      lineHeight: cs.lineHeight,
      visibility: cs.visibility,
      opacity: cs.opacity,
      display: cs.display,
      color: cs.color,
      webkitTextFillColor: cs.webkitTextFillColor,
      rectTop: Math.round(r.top),
      rectWidth: Math.round(r.width),
      rectHeight: Math.round(r.height),
      inViewport: r.top < 844 && r.bottom > 0 && r.width > 0 && r.height > 0
    };
  });
  console.log('FOUC/H1 @390 (domcontentloaded):', JSON.stringify(early, null, 2));

  // also check the LCP lead paragraph styling
  const lead = await page.evaluate(() => {
    const p = document.querySelector('.ctx-hero__lead');
    if (!p) return { found: false };
    const cs = getComputedStyle(p);
    const r = p.getBoundingClientRect();
    return { found: true, fontSize: cs.fontSize, color: cs.color, visibility: cs.visibility, opacity: cs.opacity, rectTop: Math.round(r.top), rectHeight: Math.round(r.height) };
  });
  console.log('LCP lead @390:', JSON.stringify(lead));
  await page.close();

  // Screenshots at 360, 390, 1440 — first viewport
  for (const width of [360, 390, 1440]) {
    const p = await browser.newPage({ viewport: { width, height: width === 1440 ? 900 : 844 }, deviceScaleFactor: width === 1440 ? 1 : 2 });
    await p.goto(url, { waitUntil: 'networkidle', timeout: 120000 });
    await p.waitForTimeout(600);
    const out = path.join(shots, 'after2-' + width + '.png');
    await p.screenshot({ path: out, fullPage: false });
    console.log('SHOT', out, fs.statSync(out).size);
    await p.close();
  }

  // horizontal overflow check at each width
  for (const width of [360, 390, 1440]) {
    const p = await browser.newPage({ viewport: { width, height: 844 }, deviceScaleFactor: 1 });
    await p.goto(url, { waitUntil: 'load', timeout: 120000 });
    const ov = await p.evaluate(() => ({ sw: document.documentElement.scrollWidth, cw: document.documentElement.clientWidth }));
    console.log('OVERFLOW @' + width, JSON.stringify(ov), ov.sw > ov.cw + 1 ? 'HORIZONTAL-SCROLL' : 'ok');
    await p.close();
  }

  await browser.close();
  console.log('FOUC_SHOTS_DONE');
})().catch(e => { console.error(e); process.exit(1); });
