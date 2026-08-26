import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'node:url';

const out = path.dirname(fileURLToPath(import.meta.url));
const origin = process.env.LH_ORIGIN || 'http://127.0.0.1:8780';
const url = origin + '/web-studiya/kontekstnaya-reklama/yandex-direct/';

const browser = await chromium.launch({ headless: true, channel: 'chrome' });
const ctx = await browser.newContext({
  viewport: { width: 412, height: 823 },
  deviceScaleFactor: 1.75,
  isMobile: true,
  hasTouch: true,
});
const page = await ctx.newPage();
const client = await ctx.newCDPSession(page);
await client.send('Network.emulateNetworkConditions', {
  offline: false,
  downloadThroughput: ((1.6 * 1024 * 1024) / 8) * 0.9,
  uploadThroughput: ((750 * 1024) / 8) * 0.9,
  latency: 150 * 3.75,
});
await client.send('Emulation.setCPUThrottlingRate', { rate: 4 });

// Hold deferred CSS so first paint is critical-only, then release
const held = [];
await page.route('**/*.{css}', async (route) => {
  const u = route.request().url();
  if (/home-clean|kontekst-clean|yandex-direct-page|lead-forms/.test(u)) {
    await new Promise((r) => {
      held.push(r);
      setTimeout(r, 3000);
    });
  }
  await route.continue();
});

await page.addInitScript(() => {
  window.__shifts = [];
  new PerformanceObserver((list) => {
    for (const e of list.getEntries()) {
      if (!e.hadRecentInput) {
        window.__shifts.push({
          value: e.value,
          t: Math.round(e.startTime),
          sources: (e.sources || []).map((s) => {
            const n = s.node;
            return n
              ? `${n.tagName.toLowerCase()}.${String(n.className || '')
                  .trim()
                  .replace(/\s+/g, '.')
                  .slice(0, 60)}`
              : null;
          }),
        });
      }
    }
  }).observe({ type: 'layout-shift', buffered: true });
});

await page.goto(url, { waitUntil: 'commit', timeout: 120000 });
const before = await page.evaluate(() => {
  const q = (s) => document.querySelector(s);
  const box = (el) => (el ? ((r) => ({ t: Math.round(r.top), h: Math.round(r.height), w: Math.round(r.width) }))(el.getBoundingClientRect()) : null);
  return {
    t: performance.now(),
    cls: window.__shifts.reduce((a, b) => a + b.value, 0),
    header: box(q('.rk-header')),
    crumbs: box(q('.rk-breadcrumbs')),
    title: box(q('.ctx-hero__title')),
    sub: box(q('.ctx-hero__sub')),
    price: box(q('.yd-hero-price')),
    lead: box(q('.ctx-hero__lead')),
    actions: box(q('.ctx-hero__actions')),
    trust: box(q('.yd-trust-strip')),
    visual: box(q('.yd-hero-visual')),
    sticky: box(q('.rk-sticky-cta')),
    media: [...document.querySelectorAll('link[rel=stylesheet]')].map((l) => l.media + ':' + (l.href || '').split('/').pop()),
  };
});
await page.waitForTimeout(4500);
const after = await page.evaluate(() => {
  const q = (s) => document.querySelector(s);
  const box = (el) => (el ? ((r) => ({ t: Math.round(r.top), h: Math.round(r.height), w: Math.round(r.width) }))(el.getBoundingClientRect()) : null);
  return {
    t: performance.now(),
    cls: window.__shifts.reduce((a, b) => a + b.value, 0),
    shifts: window.__shifts,
    header: box(q('.rk-header')),
    crumbs: box(q('.rk-breadcrumbs')),
    title: box(q('.ctx-hero__title')),
    sub: box(q('.ctx-hero__sub')),
    price: box(q('.yd-hero-price')),
    lead: box(q('.ctx-hero__lead')),
    actions: box(q('.ctx-hero__actions')),
    trust: box(q('.yd-trust-strip')),
    visual: box(q('.yd-hero-visual')),
    sticky: box(q('.rk-sticky-cta')),
    media: [...document.querySelectorAll('link[rel=stylesheet]')].map((l) => l.media + ':' + (l.href || '').split('/').pop()),
  };
});
const result = { before, after };
fs.writeFileSync(path.join(out, 'cls-hold-css.json'), JSON.stringify(result, null, 2));
console.log(JSON.stringify(result, null, 2));
await browser.close();
