const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const OUT = path.join(__dirname, 'screenshots');
const CITIES = ['almaty', 'shymkent', 'karaganda', 'aktobe'];
const CACHEBUST = 'hotfix=20260818-153733b';
const VIEWPORT = { width: 390, height: 2000 };

fs.mkdirSync(OUT, { recursive: true });

(async () => {
  const summary = { ok: true, viewport: VIEWPORT, cachebust: CACHEBUST, cities: [] };
  const browser = await chromium.launch({ headless: true, channel: 'chrome' });

  try {
    for (const city of CITIES) {
      const url = `https://raskrutov.kz/web-studiya/kontekstnaya-reklama/google-ads/${city}/?${CACHEBUST}`;
      const screenshotPath = path.join(OUT, `live-${city}-390-setup.png`);
      const cityResult = {
        city,
        url,
        screenshot: screenshotPath,
        pass: true,
        fails: [],
      };

      const page = await browser.newPage({
        viewport: VIEWPORT,
        deviceScaleFactor: 1,
      });

      try {
        const resp = await page.goto(url, { waitUntil: 'networkidle', timeout: 90000 });
        const status = resp ? resp.status() : 0;
        cityResult.status = status;

        const setup = page.locator('#setup');
        await setup.waitFor({ state: 'attached', timeout: 20000 });
        await setup.scrollIntoViewIfNeeded();
        await page.waitForTimeout(400);

        const measured = await page.evaluate(() => {
          const setupEl = document.querySelector('#setup');
          const setupBox = setupEl ? setupEl.getBoundingClientRect() : null;
          const items = [...document.querySelectorAll('.gads-scope-list__item')].map((li, i) => {
            const icon = li.querySelector('.gads-scope-list__icon');
            const content = li.querySelector(':scope > div');
            const contentBox = content ? content.getBoundingClientRect() : null;
            return {
              i,
              hasIcon: !!icon,
              contentWidth: contentBox ? Math.round(contentBox.width) : 0,
            };
          });
          return {
            iconCount: document.querySelectorAll('.gads-scope-list__icon').length,
            contentWidths: items.map((it) => it.contentWidth),
            items,
            setupBox: setupBox
              ? {
                  width: Math.round(setupBox.width),
                  height: Math.round(setupBox.height),
                  x: Math.round(setupBox.x),
                  y: Math.round(setupBox.y),
                }
              : null,
          };
        });

        cityResult.iconCount = measured.iconCount;
        cityResult.contentWidths = measured.contentWidths;
        cityResult.setupBox = measured.setupBox;

        console.log(`--- ${city} ---`);
        console.log(`HTTP status: ${status}`);
        console.log(`icon count: ${measured.iconCount}`);
        console.log(`content div widths: ${JSON.stringify(measured.contentWidths)}`);
        if (measured.setupBox) {
          console.log(`#setup bounding box: width=${measured.setupBox.width} height=${measured.setupBox.height} x=${measured.setupBox.x} y=${measured.setupBox.y}`);
        } else {
          console.log('#setup bounding box: missing');
        }

        await setup.screenshot({ path: screenshotPath });
        const stat = fs.statSync(screenshotPath);
        cityResult.fileSize = stat.size;
        console.log(`wrote ${screenshotPath} (${stat.size} bytes)`);

        const narrow = measured.contentWidths.some((w) => w < 200);
        const iconFail = measured.iconCount !== 6;
        const httpFail = status !== 200;

        if (httpFail) {
          cityResult.pass = false;
          cityResult.fails.push(`HTTP ${status}`);
        }
        if (iconFail) {
          cityResult.pass = false;
          cityResult.fails.push(`icons != 6 (got ${measured.iconCount})`);
        }
        if (narrow) {
          cityResult.pass = false;
          cityResult.fails.push(`contentWidth < 200 ${JSON.stringify(measured.contentWidths)}`);
        }
        if (!cityResult.pass) {
          summary.ok = false;
        }
      } finally {
        await page.close();
      }

      summary.cities.push(cityResult);
    }
  } finally {
    await browser.close();
  }

  console.log('\n=== JSON SUMMARY ===');
  console.log(JSON.stringify(summary, null, 2));
  process.exit(summary.ok ? 0 : 1);
})().catch((err) => {
  console.error(String(err && err.stack ? err.stack : err));
  process.exit(2);
});
