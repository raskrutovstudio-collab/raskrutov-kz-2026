import fs from 'node:fs';
import path from 'node:path';
import { chromium } from 'playwright';

const origin = 'http://127.0.0.1:8768';
const url = `${origin}/web-studiya/kontekstnaya-reklama/google-ads/astana/`;
const outDir = path.resolve('site_mirror/_work/google-ads-astana-final-qa');
const viewports = {
  390: { width: 390, height: 844 },
  1440: { width: 1440, height: 900 },
};

const browser = await chromium.launch({ headless: true, channel: 'chrome' });
try {
  for (const w of [390, 1440]) {
    const context = await browser.newContext({ viewport: viewports[w], deviceScaleFactor: 1 });
    const page = await context.newPage();
    await page.goto(url, { waitUntil: 'networkidle', timeout: 60000 });
    await page.waitForTimeout(500);
    const geo = await page.evaluate(() => {
      const fonts = performance.getEntriesByType('resource').filter((e) => String(e.name).includes('montserrat')).map((e) => e.name.split('/').pop());
      const h1 = document.querySelector('h1');
      const lead = document.querySelector('.ctx-hero__lead');
      return {
        hScroll: Math.max(0, document.documentElement.scrollWidth - window.innerWidth),
        fonts,
        h1Font: h1 ? getComputedStyle(h1).fontFamily : '',
        leadFont: lead ? getComputedStyle(lead).fontFamily : '',
        clsNote: 'manual',
      };
    });
    await page.screenshot({ path: path.join(outDir, `astana-${w}-post-preload.png`), fullPage: true, animations: 'disabled' });
    await page.locator('#ctx-hero').screenshot({ path: path.join(outDir, `astana-${w}-post-preload-hero.png`), animations: 'disabled' });
    console.log(w, geo);
    await context.close();
  }
} finally {
  await browser.close();
}
