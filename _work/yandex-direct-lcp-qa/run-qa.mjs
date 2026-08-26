import { chromium } from 'playwright';
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const out = __dirname;
const origin = process.env.LH_ORIGIN || 'http://127.0.0.1:8780';
const pagePath = '/web-studiya/kontekstnaya-reklama/yandex-direct/';
const url = origin + pagePath;
const lhCli = path.resolve('node_modules/lighthouse/cli/index.js');

fs.mkdirSync(out, { recursive: true });

function runLh(i, formFactor) {
  const outFile = path.join(out, `lh-${formFactor}-${i}.json`);
  const ud = path.join(out, `chrome-${formFactor}-${i}`);
  fs.mkdirSync(ud, { recursive: true });
  const flags = `--headless=new --disable-gpu --no-first-run --user-data-dir=${ud}`;
  const args = [
    lhCli,
    url,
    '--quiet',
    '--output=json',
    `--output-path=${outFile}`,
    '--only-categories=performance,accessibility,best-practices,seo',
    `--form-factor=${formFactor}`,
    `--chrome-flags=${flags}`,
  ];
  if (formFactor === 'mobile') {
    args.push('--screenEmulation.mobile=true');
  } else {
    args.push('--screenEmulation.mobile=false');
    args.push('--screenEmulation.width=1350');
    args.push('--screenEmulation.height=940');
    args.push('--screenEmulation.deviceScaleFactor=1');
  }
  const run = spawnSync(process.execPath, args, { stdio: 'inherit' });
  if (run.status !== 0) throw new Error(`LH failed ${formFactor} ${i} exit ${run.status}`);
  const r = JSON.parse(fs.readFileSync(outFile, 'utf8'));
  const a = r.audits;
  const c = r.categories;
  let lcpEl = '';
  try {
    lcpEl = a['largest-contentful-paint-element']?.details?.items?.[0]?.items?.[0]?.node?.snippet || '';
  } catch {}
  let breakdown = null;
  try {
    breakdown = a['lcp-breakdown-insight']?.details?.items || a['largest-contentful-paint']?.details || null;
  } catch {}
  const rb = (a['render-blocking-resources']?.details?.items || [])
    .map((x) => x.url)
    .filter((u) => /css/i.test(u || ''));
  return {
    run: i,
    form: formFactor,
    perf: Math.round(c.performance.score * 100),
    a11y: Math.round(c.accessibility.score * 100),
    bp: Math.round(c['best-practices'].score * 100),
    seo: Math.round(c.seo.score * 100),
    fcp: Math.round(a['first-contentful-paint'].numericValue),
    lcp: Math.round(a['largest-contentful-paint'].numericValue),
    si: Math.round(a['speed-index'].numericValue),
    tbt: Math.round(a['total-blocking-time'].numericValue),
    cls: a['cumulative-layout-shift'].numericValue,
    lcpEl,
    renderBlocking: rb,
    breakdown,
  };
}

const median = (arr, key) => {
  const vals = arr.map((x) => x[key]).sort((a, b) => a - b);
  return vals[Math.floor(vals.length / 2)];
};

const mobile = [];
for (let i = 1; i <= 3; i++) {
  console.log('MOBILE', i);
  mobile.push(runLh(i, 'mobile'));
  console.log(JSON.stringify(mobile[i - 1]));
  await new Promise((r) => setTimeout(r, 2000));
}
console.log('DESKTOP 1');
const desk = runLh(1, 'desktop');
console.log(JSON.stringify(desk));

const summary = {
  url,
  mobile,
  median: {
    perf: median(mobile, 'perf'),
    fcp: median(mobile, 'fcp'),
    lcp: median(mobile, 'lcp'),
    si: median(mobile, 'si'),
    tbt: median(mobile, 'tbt'),
    cls: median(mobile, 'cls'),
    a11y: median(mobile, 'a11y'),
    bp: median(mobile, 'bp'),
    seo: median(mobile, 'seo'),
  },
  minPerf: Math.min(...mobile.map((x) => x.perf)),
  maxLcp: Math.max(...mobile.map((x) => x.lcp)),
  desktop: desk,
};
fs.writeFileSync(path.join(out, 'summary.json'), JSON.stringify(summary, null, 2));
console.log('SUMMARY', JSON.stringify(summary.median), 'minPerf', summary.minPerf, 'maxLcp', summary.maxLcp);

const browser = await chromium.launch({ headless: true, channel: 'chrome' });
const viewports = [
  { w: 390, h: 844 },
  { w: 430, h: 932 },
  { w: 768, h: 1024 },
  { w: 1440, h: 900 },
];
const vpResults = [];
for (const vp of viewports) {
  const ctx = await browser.newContext({
    viewport: { width: vp.w, height: vp.h },
    deviceScaleFactor: vp.w <= 430 ? 2 : 1,
  });
  const page = await ctx.newPage();
  const cons = [];
  const failed = [];
  page.on('console', (m) => {
    if (m.type() === 'error') cons.push(m.text());
  });
  page.on('response', (r) => {
    if (r.status() >= 400 && r.url().includes('127.0.0.1')) failed.push(`${r.status()} ${r.url()}`);
  });
  await page.goto(url, { waitUntil: 'networkidle', timeout: 60000 });
  const geo = await page.evaluate(() => {
    const doc = document.documentElement;
    const lead = document.querySelector('.ctx-hero__lead');
    const cs = lead ? getComputedStyle(lead) : null;
    const sticky = document.querySelector('.rk-sticky-cta');
    return {
      scrollWidth: doc.scrollWidth,
      clientWidth: doc.clientWidth,
      hscroll: doc.scrollWidth > doc.clientWidth + 1,
      leadOpacity: cs?.opacity,
      leadVis: cs?.visibility,
      leadFw: cs?.fontWeight,
      leadFont: cs?.fontFamily,
      stickyDisplay: sticky ? getComputedStyle(sticky).display : null,
      printDeferred: [...document.querySelectorAll('link[rel=stylesheet][media=print]')].length,
      allMedia: [...document.querySelectorAll('link[rel=stylesheet]')].map((l) => ({
        href: (l.getAttribute('href') || '').split('/').pop(),
        media: l.media,
      })),
      h1: document.querySelector('h1')?.textContent?.trim(),
    };
  });
  await page.screenshot({ path: path.join(out, `after-${vp.w}.png`), fullPage: false });
  vpResults.push({ vp: vp.w, ...geo, consoleErrors: cons.slice(0, 8), failed404: failed.slice(0, 10) });
  await ctx.close();
}

const ctx = await browser.newContext({ viewport: { width: 390, height: 844 } });
const page = await ctx.newPage();
await page.goto(url, { waitUntil: 'domcontentloaded' });
const faqBtn = page.locator('.yd-faq button, details summary').first();
let faqOk = false;
if ((await faqBtn.count()) > 0) {
  const before = await faqBtn.getAttribute('aria-expanded');
  await faqBtn.click();
  const after = await faqBtn.getAttribute('aria-expanded');
  faqOk = before === 'false' && after === 'true';
}
await page.locator('[data-rk-open-modal]').first().click();
await page.waitForTimeout(250);
const modalVisible = await page.evaluate(() => {
  const m = document.querySelector('.rk-modal');
  return !!(m && getComputedStyle(m).display !== 'none');
});
await page.keyboard.press('Escape');
await page.waitForTimeout(250);
const modalClosed = await page.evaluate(() => !document.body.classList.contains('rk-modal-open'));
const formVal = await page.evaluate(() => {
  const f = document.querySelector('form');
  if (!f) return null;
  return { reportValidity: f.reportValidity(), invalid: [...f.querySelectorAll(':invalid')].map((e) => e.name) };
});
vpResults.push({ functional: { faqOk, modalVisible, modalClosed, formVal } });
fs.writeFileSync(path.join(out, 'viewport-qa.json'), JSON.stringify(vpResults, null, 2));
console.log('VIEWPORT', JSON.stringify(vpResults, null, 2));
await browser.close();
