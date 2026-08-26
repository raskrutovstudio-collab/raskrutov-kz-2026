const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const OUT = path.join(__dirname, 'screenshots');
const CITIES = ['almaty', 'shymkent', 'karaganda', 'aktobe'];
const VIEWPORTS = [390, 1440];
const CACHEBUST = 'hotfix=20260818-153733';

fs.mkdirSync(OUT, { recursive: true });

function isIgnoredConsole(text) {
  const t = String(text || '');
  return /CERT|metrika|mc\.yandex|yandex\.ru\/metrika|google-analytics|googletagmanager|GTM-|doubleclick|facebook\.net|vk\.com\/rtrg/i.test(t);
}

async function measure(page) {
  return page.evaluate(() => {
    const items = [...document.querySelectorAll('.gads-scope-list__item')].map((li, i) => {
      const icon = li.querySelector('.gads-scope-list__icon');
      const content = li.querySelector(':scope > div');
      const contentBox = content ? content.getBoundingClientRect() : null;
      return {
        i,
        hasIcon: !!icon,
        itemWidth: Math.round(li.getBoundingClientRect().width),
        contentWidth: contentBox ? Math.round(contentBox.width) : 0,
        iconWidth: icon ? Math.round(icon.getBoundingClientRect().width) : 0,
      };
    });
    return {
      iconCount: document.querySelectorAll('.gads-scope-list__icon').length,
      items,
    };
  });
}

(async () => {
  const summary = { ok: true, cities: [] };
  const browser = await chromium.launch({ headless: true });

  try {
    for (const city of CITIES) {
      const cityResult = { city, pass: true, viewports: [], fails: [] };
      for (const width of VIEWPORTS) {
        const url = `https://raskrutov.kz/web-studiya/kontekstnaya-reklama/google-ads/${city}/?${CACHEBUST}`;
        const page = await browser.newPage({
          viewport: { width, height: width <= 430 ? 844 : 900 },
          deviceScaleFactor: 1,
        });
        const ownedErrors = [];
        page.on('pageerror', (err) => {
          const t = String(err);
          if (!isIgnoredConsole(t)) ownedErrors.push(t);
        });
        page.on('console', (msg) => {
          if (msg.type() !== 'error') return;
          const t = msg.text();
          if (!isIgnoredConsole(t)) ownedErrors.push(t);
        });

        const resp = await page.goto(url, { waitUntil: 'networkidle', timeout: 90000 });
        const status = resp ? resp.status() : 0;
        await page.waitForSelector('#setup', { timeout: 20000 });
        const measured = await measure(page);

        const setup = page.locator('#setup');
        const setupPath = path.join(OUT, `live-${city}-${width}-setup.png`);
        const fullPath = path.join(OUT, `live-${city}-${width}-full.png`);
        await setup.screenshot({ path: setupPath });
        await page.screenshot({ path: fullPath, fullPage: true });

        const contentWidths = measured.items.map((it) => it.contentWidth);
        const missingIcon = measured.items.some((it) => !it.hasIcon) || measured.iconCount !== 6;
        const desktopNarrow = width === 1440 && measured.items.some((it) => it.contentWidth <= 200);
        const httpFail = status !== 200;
        const fail = httpFail || missingIcon || desktopNarrow;
        if (fail) {
          cityResult.pass = false;
          summary.ok = false;
          if (httpFail) cityResult.fails.push(`${width}: HTTP ${status}`);
          if (missingIcon) cityResult.fails.push(`${width}: missing icon or iconCount=${measured.iconCount}`);
          if (desktopNarrow) cityResult.fails.push(`${width}: contentWidth<=200 ${JSON.stringify(contentWidths)}`);
        }

        cityResult.viewports.push({
          width,
          status,
          iconCount: measured.iconCount,
          contentWidths,
          items: measured.items,
          fail,
          ownedErrors,
          screenshots: {
            setup: setupPath,
            full: fullPath,
          },
        });
        await page.close();
      }
      summary.cities.push(cityResult);
    }
  } finally {
    await browser.close();
  }

  console.log(JSON.stringify(summary, null, 2));
  process.exit(summary.ok ? 0 : 1);
})().catch((err) => {
  console.error(String(err && err.stack ? err.stack : err));
  process.exit(2);
});
