const { chromium } = require('playwright');
const url = 'http://127.0.0.1:4180/web-studiya/kontekstnaya-reklama/google-ads/';
(async () => {
  const browser = await chromium.launch({ headless: true });
  const p = await browser.newPage({ viewport: { width: 360, height: 844 }, deviceScaleFactor: 1 });
  await p.goto(url, { waitUntil: 'load', timeout: 120000 });
  const res = await p.evaluate(() => {
    const docW = document.documentElement.clientWidth;
    const bad = [];
    document.querySelectorAll('*').forEach(el => {
      const r = el.getBoundingClientRect();
      if (r.right > docW + 0.5 || r.left < -0.5) {
        bad.push({ tag: el.tagName.toLowerCase(), cls: (el.className && el.className.toString ? el.className.toString() : '').slice(0,60), right: Math.round(r.right), left: Math.round(r.left), width: Math.round(r.width) });
      }
    });
    return { docW, count: bad.length, top: bad.slice(0, 15) };
  });
  console.log(JSON.stringify(res, null, 2));
  await browser.close();
})().catch(e => { console.error(e); process.exit(1); });
