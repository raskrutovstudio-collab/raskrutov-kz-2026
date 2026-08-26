import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'node:url';

const out = path.dirname(fileURLToPath(import.meta.url));
const origin = process.env.LH_ORIGIN || 'http://127.0.0.1:8780';
const url = origin + '/web-studiya/kontekstnaya-reklama/yandex-direct/';

const browser = await chromium.launch({ headless: true, channel: 'chrome' });
const ctx = await browser.newContext({ viewport: { width: 1350, height: 940 }, deviceScaleFactor: 1 });
const page = await ctx.newPage();
await page.route('**/*.{css}', async (route) => {
  const u = route.request().url();
  if (/home-clean|kontekst-clean|yandex-direct-page|lead-forms/.test(u)) {
    await new Promise((r) => setTimeout(r, 2500));
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
                  .slice(0, 80)}`
              : null;
          }),
        });
      }
    }
  }).observe({ type: 'layout-shift', buffered: true });
});
await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 120000 });
const snap = async (label) =>
  page.evaluate((label) => {
    const q = (s) => document.querySelector(s);
    const box = (el) =>
      el
        ? ((r) => ({ t: Math.round(r.top), l: Math.round(r.left), h: Math.round(r.height), w: Math.round(r.width) }))(
            el.getBoundingClientRect()
          )
        : null;
    return {
      label,
      cls: window.__shifts.reduce((a, b) => a + b.value, 0),
      shifts: window.__shifts.slice(),
      header: box(q('.rk-header')),
      burger: q('.rk-burger') ? getComputedStyle(q('.rk-burger')).display : null,
      nav: q('.rk-nav') ? getComputedStyle(q('.rk-nav')).display : null,
      grid: box(q('.ctx-hero__grid')),
      copy: box(q('.ctx-hero__copy')),
      visual: box(q('.yd-hero-visual')),
      serpBody: box(q('.yd-serp__body')),
      trust: box(q('.yd-trust-strip')),
      media: [...document.querySelectorAll('link[rel=stylesheet]')].map((l) => l.media),
    };
  }, label);

const before = await snap('before-full-css');
await page.waitForTimeout(3500);
const after = await snap('after-full-css');
const result = { before, after };
fs.writeFileSync(path.join(out, 'cls-desktop.json'), JSON.stringify(result, null, 2));
console.log(JSON.stringify(result, null, 2));
await browser.close();
