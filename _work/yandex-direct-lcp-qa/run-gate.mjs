import { chromium } from 'playwright';
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const out = __dirname;
const origin = process.env.LH_ORIGIN || 'http://127.0.0.1:8780';
const url = origin + '/web-studiya/kontekstnaya-reklama/yandex-direct/';
const prodUrl = 'https://raskrutov.kz/web-studiya/kontekstnaya-reklama/yandex-direct/';
const lhCli = path.resolve('node_modules/lighthouse/cli/index.js');

fs.mkdirSync(out, { recursive: true });

async function probeCss(viewport) {
  const browser = await chromium.launch({ headless: true, channel: 'chrome' });
  const ctx = await browser.newContext({
    viewport: { width: viewport.w, height: viewport.h },
    deviceScaleFactor: viewport.w <= 430 ? 2 : 1,
    isMobile: viewport.w <= 768,
    hasTouch: viewport.w <= 768,
  });
  const page = await ctx.newPage();
  const cssHits = new Map();
  page.on('request', (req) => {
    const u = req.url();
    if (/home-clean|kontekst-clean|yandex-direct-page|lead-forms\.css/.test(u)) {
      cssHits.set(u.split('?')[0].split('/').pop(), (cssHits.get(u.split('?')[0].split('/').pop()) || 0) + 1);
    }
  });
  const fontHits = [];
  page.on('request', (req) => {
    if (/montserrat_.*\.woff2/.test(req.url())) fontHits.push(req.url().split('/').pop());
  });

  await page.addInitScript(() => {
    window.__cssTimeline = [];
    const mark = () => {
      const links = [...document.querySelectorAll('link[rel=stylesheet]')].map((l) => ({
        href: (l.getAttribute('href') || '').split('/').pop(),
        media: l.media,
      }));
      window.__cssTimeline.push({ t: Math.round(performance.now()), links });
    };
    document.addEventListener('DOMContentLoaded', mark);
    window.addEventListener('load', mark);
  });

  await page.goto(url, { waitUntil: 'commit', timeout: 90000 });
  const early = await page.evaluate(() =>
    [...document.querySelectorAll('link[rel=stylesheet]')].map((l) => ({
      href: (l.getAttribute('href') || '').split('/').pop(),
      media: l.media,
    }))
  ).catch(() => null);
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(800);
  const state = await page.evaluate(() => {
    const links = [...document.querySelectorAll('link[rel=stylesheet]')].map((l) => ({
      href: (l.getAttribute('href') || '').split('/').pop(),
      media: l.media,
      sheet: !!(l.sheet && l.sheet.cssRules && l.sheet.cssRules.length),
    }));
    const lead = document.querySelector('.ctx-hero__lead');
    const cs = lead ? getComputedStyle(lead) : null;
    const fonts = [...document.fonts].map((f) => ({
      family: f.family,
      weight: f.weight,
      status: f.status,
    }));
    const res = performance.getEntriesByType('resource').map((e) => ({
      name: e.name.split('/').pop().split('?')[0],
      start: Math.round(e.startTime),
      end: Math.round(e.responseEnd),
      dur: Math.round(e.duration),
      initiator: e.initiatorType,
    }));
    const cssRes = res.filter((r) => /home-clean|kontekst-clean|yandex-direct-page|lead-forms/.test(r.name));
    const fontRes = res.filter((r) => /montserrat_/.test(r.name));
    return {
      vw: window.innerWidth,
      links,
      timeline: window.__cssTimeline || [],
      cssRes,
      fontRes,
      lead: cs
        ? { opacity: cs.opacity, fw: cs.fontWeight, family: cs.fontFamily, visible: cs.visibility }
        : null,
      h1Family: getComputedStyle(document.querySelector('h1')).fontFamily,
      fonts,
      criticalExists: !!document.getElementById('yd-critical'),
    };
  });
  await browser.close();
  return { viewport: viewport.w, early, cssHits: Object.fromEntries(cssHits), fontHits, ...state };
}

function runLh(tag, formFactor) {
  const outFile = path.join(out, `gate-${tag}.json`);
  const ud = path.join(out, `gate-chrome-${tag}`);
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
  if (formFactor === 'mobile') args.push('--screenEmulation.mobile=true');
  else {
    args.push('--screenEmulation.mobile=false');
    args.push('--screenEmulation.width=1350');
    args.push('--screenEmulation.height=940');
    args.push('--screenEmulation.deviceScaleFactor=1');
  }
  const run = spawnSync(process.execPath, args, { stdio: 'inherit' });
  if (run.status !== 0) throw new Error(`LH fail ${tag}`);
  const r = JSON.parse(fs.readFileSync(outFile, 'utf8'));
  const a = r.audits;
  const c = r.categories;
  let lcpEl = '';
  let breakdown = null;
  try {
    lcpEl = a['largest-contentful-paint-element']?.details?.items?.[0]?.items?.[0]?.node?.selector || '';
  } catch {}
  try {
    breakdown = a['lcp-breakdown-insight']?.details?.items?.[0]?.items || null;
  } catch {}
  const rb = (a['render-blocking-resources']?.details?.items || []).map((x) => (x.url || '').split('/').pop());
  return {
    tag,
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
    breakdown,
    rb,
  };
}

const med = (arr, k) => [...arr.map((x) => x[k])].sort((a, b) => a - b)[Math.floor(arr.length / 2)];

console.log('PROBE mobile 390');
const probeM = await probeCss({ w: 390, h: 844 });
console.log(JSON.stringify(probeM, null, 2));
console.log('PROBE desktop 1440');
const probeD = await probeCss({ w: 1440, h: 900 });
console.log(JSON.stringify(probeD, null, 2));

const mobile = [];
for (let i = 1; i <= 3; i++) {
  console.log('MOBILE', i);
  mobile.push(runLh(`m${i}`, 'mobile'));
  console.log(JSON.stringify(mobile.at(-1)));
}
const desk = [];
for (let i = 1; i <= 2; i++) {
  console.log('DESKTOP', i);
  desk.push(runLh(`d${i}`, 'desktop'));
  console.log(JSON.stringify(desk.at(-1)));
}

const browser = await chromium.launch({ headless: true, channel: 'chrome' });
const shots = [];
for (const w of [390, 430, 768, 1440]) {
  const ctx = await browser.newContext({
    viewport: { width: w, height: w < 900 ? 844 : 900 },
    deviceScaleFactor: w <= 430 ? 2 : 1,
  });
  const page = await ctx.newPage();
  const errs = [];
  const bad = [];
  page.on('console', (m) => {
    if (m.type() === 'error') errs.push(m.text());
  });
  page.on('response', (r) => {
    if (r.status() >= 400 && r.url().includes('127.0.0.1')) bad.push(`${r.status()} ${r.url()}`);
  });
  await page.goto(url, { waitUntil: 'networkidle', timeout: 90000 });
  const geo = await page.evaluate(() => ({
    hscroll: document.documentElement.scrollWidth > document.documentElement.clientWidth + 1,
    leadOp: getComputedStyle(document.querySelector('.ctx-hero__lead')).opacity,
  }));
  const shot = path.join(out, `gate-${w}.png`);
  await page.screenshot({ path: shot, fullPage: false });
  shots.push({ w, ...geo, errs: errs.slice(0, 5), bad: bad.slice(0, 5), shot });
  await ctx.close();
}

// production desktop compare shot
{
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 });
  const page = await ctx.newPage();
  await page.goto(prodUrl, { waitUntil: 'networkidle', timeout: 90000 });
  await page.screenshot({ path: path.join(out, 'gate-prod-1440.png'), fullPage: false });
  await ctx.close();
}

// FOUC / Slow4G hard reload probe desktop+mobile
async function foucProbe(label, w, throttle) {
  const ctx = await browser.newContext({
    viewport: { width: w, height: w <= 768 ? 844 : 900 },
    deviceScaleFactor: w <= 430 ? 2 : 1,
  });
  const page = await ctx.newPage();
  const client = await ctx.newCDPSession(page);
  if (throttle === 'slow') {
    await client.send('Network.emulateNetworkConditions', {
      offline: false,
      downloadThroughput: ((0.4 * 1024 * 1024) / 8) * 0.8,
      uploadThroughput: ((0.4 * 1024 * 1024) / 8) * 0.8,
      latency: 400,
    });
  } else if (throttle === 'fast') {
    await client.send('Network.emulateNetworkConditions', {
      offline: false,
      downloadThroughput: ((1.6 * 1024 * 1024) / 8) * 0.9,
      uploadThroughput: ((750 * 1024) / 8) * 0.9,
      latency: 150,
    });
  }
  await client.send('Network.setCacheDisabled', { cacheDisabled: true });
  const samples = [];
  page.on('framenavigated', async () => {});
  await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 120000 });
  for (const ms of [0, 300, 800, 2000]) {
    if (ms) await page.waitForTimeout(ms === 300 ? 300 : ms - (samples.at(-1)?.at || 0));
    const s = await page.evaluate((at) => {
      const lead = document.querySelector('.ctx-hero__lead');
      const header = document.querySelector('.rk-header');
      const links = [...document.querySelectorAll('link[rel=stylesheet]')].map((l) => l.media + ':' + (l.getAttribute('href') || '').split('/').pop());
      return {
        at,
        leadOp: lead ? getComputedStyle(lead).opacity : null,
        leadFw: lead ? getComputedStyle(lead).fontWeight : null,
        headerH: header ? Math.round(header.getBoundingClientRect().height) : 0,
        burger: document.querySelector('.rk-burger') ? getComputedStyle(document.querySelector('.rk-burger')).display : null,
        nav: document.querySelector('.rk-nav') ? getComputedStyle(document.querySelector('.rk-nav')).display : null,
        links,
      };
    }, ms);
    samples.push(s);
  }
  await ctx.close();
  return { label, w, throttle, samples };
}

const fouc = [
  await foucProbe('mobile-fast', 390, 'fast'),
  await foucProbe('mobile-slow', 390, 'slow'),
  await foucProbe('desktop-fast', 1440, 'fast'),
  await foucProbe('desktop-slow', 1440, 'slow'),
];

// functional
{
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const page = await ctx.newPage();
  await page.goto(url, { waitUntil: 'domcontentloaded' });
  const faq = page.locator('.yd-faq button').first();
  let faqOk = false;
  if ((await faq.count()) > 0) {
    const b = await faq.getAttribute('aria-expanded');
    await faq.click();
    faqOk = b === 'false' && (await faq.getAttribute('aria-expanded')) === 'true';
  }
  await page.locator('[data-rk-open-modal]').first().click();
  await page.waitForTimeout(200);
  const modalOpen = await page.evaluate(() => document.body.classList.contains('rk-modal-open'));
  await page.keyboard.press('Escape');
  await page.waitForTimeout(200);
  const modalClosed = await page.evaluate(() => !document.body.classList.contains('rk-modal-open'));
  fs.writeFileSync(
    path.join(out, 'gate-functional.json'),
    JSON.stringify({ faqOk, modalOpen, modalClosed }, null, 2)
  );
  await ctx.close();
}

await browser.close();

const summary = {
  url,
  probeM,
  probeD,
  mobile,
  mobileMedian: {
    perf: med(mobile, 'perf'),
    fcp: med(mobile, 'fcp'),
    lcp: med(mobile, 'lcp'),
    si: med(mobile, 'si'),
    tbt: med(mobile, 'tbt'),
    cls: med(mobile, 'cls'),
  },
  mobileMinPerf: Math.min(...mobile.map((x) => x.perf)),
  mobileMaxLcp: Math.max(...mobile.map((x) => x.lcp)),
  desktop: desk,
  desktopMinPerf: Math.min(...desk.map((x) => x.perf)),
  desktopMaxLcp: Math.max(...desk.map((x) => x.lcp)),
  shots,
  fouc,
};
fs.writeFileSync(path.join(out, 'gate-summary.json'), JSON.stringify(summary, null, 2));
console.log('SUMMARY', JSON.stringify(summary, null, 2));
