import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'node:url';

const out = path.dirname(fileURLToPath(import.meta.url));
const url = (process.env.LH_ORIGIN || 'http://127.0.0.1:8780') + '/web-studiya/kontekstnaya-reklama/yandex-direct/';

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

await page.addInitScript(() => {
  window.__shifts = [];
  window.__marks = [];
  new PerformanceObserver((list) => {
    for (const e of list.getEntries()) {
      if (!e.hadRecentInput) {
        window.__shifts.push({
          value: e.value,
          startTime: Math.round(e.startTime),
          sources: (e.sources || []).map((s) => {
            const n = s.node;
            let sel = null;
            if (n) {
              sel = n.id ? `#${n.id}` : `${n.tagName.toLowerCase()}.${(n.className || '').toString().trim().replace(/\s+/g, '.').slice(0, 80)}`;
            }
            return {
              sel,
              prev: s.previousRect && {
                t: Math.round(s.previousRect.y),
                h: Math.round(s.previousRect.height),
                w: Math.round(s.previousRect.width),
              },
              curr: s.currentRect && {
                t: Math.round(s.currentRect.y),
                h: Math.round(s.currentRect.height),
                w: Math.round(s.currentRect.width),
              },
            };
          }),
        });
      }
    }
  }).observe({ type: 'layout-shift', buffered: true });
});

await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 120000 });
// snapshots over time
const timeline = [];
for (const ms of [0, 500, 1000, 2000, 4000, 6000]) {
  if (ms) await page.waitForTimeout(ms - (timeline.at(-1)?.at || 0));
  const snap = await page.evaluate((at) => {
    const lead = document.querySelector('.ctx-hero__lead');
    const title = document.querySelector('.ctx-hero__title');
    const sticky = document.querySelector('.rk-sticky-cta');
    const logo = document.querySelector('.rk-logo img');
    const media = [...document.querySelectorAll('link[rel=stylesheet]')].map((l) => ({
      href: (l.getAttribute('href') || '').split('/').pop(),
      media: l.media,
    }));
    return {
      at,
      cls: window.__shifts.reduce((s, x) => s + x.value, 0),
      shiftCount: window.__shifts.length,
      leadTop: lead ? Math.round(lead.getBoundingClientRect().top) : null,
      titleH: title ? Math.round(title.getBoundingClientRect().height) : null,
      stickyDisplay: sticky ? getComputedStyle(sticky).display : null,
      logoW: logo ? Math.round(logo.getBoundingClientRect().width) : null,
      bodyPb: getComputedStyle(document.body).paddingBottom,
      media,
    };
  }, ms === 0 ? 0 : ms);
  timeline.push(snap);
}
await page.waitForTimeout(2000);
const finalShifts = await page.evaluate(() => ({
  cls: window.__shifts.reduce((s, x) => s + x.value, 0),
  shifts: window.__shifts,
}));
const result = { timeline, finalShifts };
fs.writeFileSync(path.join(out, 'cls-throttled.json'), JSON.stringify(result, null, 2));
console.log(JSON.stringify(result, null, 2));
await browser.close();
