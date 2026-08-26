import { chromium } from 'playwright';

const origin = 'http://127.0.0.1:8768';
const cities = ['kyzylorda', 'pavlodar'];
const viewports = {
  390: { width: 390, height: 844 },
  1440: { width: 1440, height: 900 },
};

const browser = await chromium.launch({ headless: true, channel: 'chrome' });
try {
  for (const city of cities) {
    for (const w of [390, 1440]) {
      const context = await browser.newContext({ viewport: viewports[w], deviceScaleFactor: 1 });
      const page = await context.newPage();
      await page.addInitScript(() => {
        window.__cls = 0;
        window.__shifts = [];
        new PerformanceObserver((list) => {
          for (const e of list.getEntries()) {
            if (!e.hadRecentInput) {
              window.__cls += e.value;
              window.__shifts.push({
                value: e.value,
                sources: (e.sources || []).map((s) => ({
                  node: s.node ? `${s.node.tagName}.${s.node.className}` : null,
                })),
              });
            }
          }
        }).observe({ type: 'layout-shift', buffered: true });
      });
      await page.goto(`${origin}/web-studiya/kontekstnaya-reklama/google-ads/${city}/`, {
        waitUntil: 'networkidle',
        timeout: 60000,
      });
      await page.waitForTimeout(1200);
      const info = await page.evaluate(() => {
        const h1 = document.querySelector('h1');
        const lead = document.querySelector('.ctx-hero__lead');
        const used = (el) => {
          if (!el) return null;
          const cs = getComputedStyle(el);
          return {
            family: cs.fontFamily,
            check400: document.fonts.check(`400 16px "Montserrat"`),
            check700: document.fonts.check(`700 40px "Montserrat"`),
          };
        };
        return {
          cls: window.__cls,
          shifts: window.__shifts,
          h1Used: used(h1),
          leadUsed: used(lead),
        };
      });
      console.log(
        `${city} ${w} CLS=${info.cls.toFixed(4)} mont400=${info.leadUsed.check400} mont700=${info.h1Used.check700} family=${info.leadUsed.family}`,
      );
      if (info.shifts.length) {
        for (const s of info.shifts.slice(0, 6)) {
          console.log(`  shift ${s.value.toFixed(4)} ${JSON.stringify(s.sources)}`);
        }
      }
      await context.close();
    }
  }
} finally {
  await browser.close();
}
