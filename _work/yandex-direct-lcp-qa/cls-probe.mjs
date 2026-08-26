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
await page.addInitScript(() => {
  window.__shifts = [];
  try {
    new PerformanceObserver((list) => {
      for (const e of list.getEntries()) {
        if (!e.hadRecentInput) {
          window.__shifts.push({
            value: e.value,
            startTime: e.startTime,
            sources: (e.sources || []).map((s) => ({
              node: s.node ? `${s.node.tagName}.${s.node.className}` : null,
              previousRect: s.previousRect,
              currentRect: s.currentRect,
            })),
          });
        }
      }
    }).observe({ type: 'layout-shift', buffered: true });
  } catch {}
});
await page.goto(url, { waitUntil: 'networkidle', timeout: 60000 });
await page.waitForTimeout(2500);
const data = await page.evaluate(() => {
  const lead = document.querySelector('.ctx-hero__lead');
  const cs = getComputedStyle(lead);
  const sticky = document.querySelector('.rk-sticky-cta');
  const header = document.querySelector('.rk-header');
  const logo = document.querySelector('.rk-logo img');
  const title = document.querySelector('.ctx-hero__title');
  return {
    cls: window.__shifts.reduce((s, x) => s + x.value, 0),
    shifts: window.__shifts,
    lead: {
      opacity: cs.opacity,
      visibility: cs.visibility,
      font: cs.fontFamily,
      weight: cs.fontWeight,
      color: cs.color,
      rect: lead.getBoundingClientRect(),
    },
    sticky: sticky
      ? {
          display: getComputedStyle(sticky).display,
          rect: sticky.getBoundingClientRect(),
        }
      : null,
    headerH: header?.getBoundingClientRect().height,
    logo: logo
      ? { w: logo.getBoundingClientRect().width, h: logo.getBoundingClientRect().height, nw: logo.naturalWidth }
      : null,
    titleH: title?.getBoundingClientRect().height,
    stylesheets: [...document.styleSheets].map((s) => {
      try {
        return { href: (s.href || 'inline').split('/').pop(), rules: s.cssRules?.length };
      } catch {
        return { href: (s.href || 'inline').split('/').pop(), rules: 'opaque' };
      }
    }),
  };
});
fs.writeFileSync(path.join(out, 'cls-probe.json'), JSON.stringify(data, null, 2));
console.log(JSON.stringify(data, null, 2));
await page.screenshot({ path: path.join(out, 'probe-412.png'), fullPage: false });
await browser.close();
