const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const url = 'http://127.0.0.1:4180/web-studiya/kontekstnaya-reklama/google-ads/';
const shots = path.resolve('site_mirror/_work/google-ads-perf/shots');
fs.mkdirSync(shots, { recursive: true });

(async () => {
  const browser = await chromium.launch({ headless: true });

  // Screenshots at 1440, 390, 360 — first viewport only
  for (const width of [1440, 390, 360]) {
    const page = await browser.newPage({
      viewport: { width, height: width === 1440 ? 900 : 844 },
      deviceScaleFactor: 1
    });
    await page.goto(url, { waitUntil: 'networkidle', timeout: 120000 });
    await page.waitForTimeout(800);
    const out = path.join(shots, 'baseline-' + width + '.png');
    await page.screenshot({ path: out, fullPage: false });
    console.log('SHOT', out, fs.statSync(out).size);
    await page.close();
  }

  // CSS Coverage at 390
  const page = await browser.newPage({
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 1
  });
  await page.coverage.startCSSCoverage({ resetOnNavigation: true });
  await page.goto(url, { waitUntil: 'networkidle', timeout: 120000 });
  await page.waitForTimeout(500);

  // slow full-page scroll
  const totalHeight = await page.evaluate(() => document.documentElement.scrollHeight);
  const step = 200;
  for (let y = 0; y < totalHeight; y += step) {
    await page.evaluate((yy) => window.scrollTo(0, yy), y);
    await page.waitForTimeout(80);
  }
  await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
  await page.waitForTimeout(400);

  const coverage = await page.coverage.stopCSSCoverage();
  const targets = [
    'home-clean.css',
    'kontekst-clean.css',
    'google-ads-page.css'
  ];

  const results = {};
  for (const t of targets) {
    const entries = coverage.filter(c => (c.url || '').includes(t));
    let total = 0, used = 0;
    for (const e of entries) {
      total += e.text ? Buffer.byteLength(e.text, 'utf8') : 0;
      let usedLen = 0;
      for (const r of (e.ranges || [])) usedLen += (r.end - r.start);
      used += usedLen;
    }
    const unused = Math.max(0, total - used);
    results[t] = {
      entries: entries.length,
      urls: entries.map(e => e.url),
      totalBytes: total,
      usedBytes: used,
      unusedBytes: unused,
      unusedPercent: total ? +(unused / total * 100).toFixed(2) : null
    };
  }

  // also list all covered CSS urls for context
  const allCss = coverage.map(c => ({
    url: c.url,
    totalBytes: c.text ? Buffer.byteLength(c.text, 'utf8') : 0,
    usedBytes: (c.ranges || []).reduce((s, r) => s + (r.end - r.start), 0)
  }));

  const covOut = {
    viewport: { width: 390, height: 844 },
    url,
    targets: results,
    allCss
  };
  fs.writeFileSync(
    path.resolve('site_mirror/_work/google-ads-perf/css-coverage-390.json'),
    JSON.stringify(covOut, null, 2)
  );
  console.log(JSON.stringify(covOut, null, 2));
  await page.close();
  await browser.close();
  console.log('SHOTS_AND_COVERAGE_DONE');
})().catch(e => { console.error(e); process.exit(1); });
