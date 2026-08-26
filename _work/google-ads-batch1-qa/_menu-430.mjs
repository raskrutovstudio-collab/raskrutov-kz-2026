import { chromium } from 'playwright';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SHOTS = path.join(__dirname, 'shots-430-768');
const cities = ['shymkent', 'karaganda', 'aktobe'];
const BASE = 'http://127.0.0.1:8765/web-studiya/kontekstnaya-reklama/google-ads';

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage();
const out = [];

for (const city of cities) {
  await page.setViewportSize({ width: 430, height: 932 });
  await page.goto(`${BASE}/${city}/`, { waitUntil: 'load', timeout: 60000 });
  await page.waitForTimeout(900);
  const burger = page.locator('.rk-burger[data-rk-menu-toggle]');
  await burger.click();
  await page.waitForTimeout(400);
  const state = await page.evaluate(() => {
    const burgerEl = document.querySelector('.rk-burger');
    const panel = document.querySelector('#rk-mobile-nav');
    const r = panel ? panel.getBoundingClientRect() : null;
    const links = panel ? [...panel.querySelectorAll('a')].map((a) => a.textContent.trim()) : [];
    return {
      aria: burgerEl?.getAttribute('aria-expanded'),
      hidden: panel?.hidden,
      isOpen: panel?.classList.contains('is-open'),
      display: panel ? getComputedStyle(panel).display : null,
      rect: r ? { w: Math.round(r.width), h: Math.round(r.height), top: Math.round(r.top) } : null,
      links,
      bodyClass: document.body.className,
    };
  });
  await page.screenshot({ path: path.join(SHOTS, `${city}-430-menu-recheck.png`), fullPage: false });
  out.push({ city, ...state });
}

await browser.close();
console.log(JSON.stringify(out, null, 2));
