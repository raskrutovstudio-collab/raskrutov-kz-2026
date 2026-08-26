const { chromium } = require('playwright');
const path = require('path');
const OUT = path.join('site_mirror', '_work', 'google-ads-visual-qa');

(async () => {
  const browser = await chromium.launch({ headless: true, channel: 'chrome' });

  async function shot(sel, w, h, name) {
    const page = await (await browser.newContext({ viewport: { width: w, height: h } })).newPage();
    await page.goto('http://localhost:4173/web-studiya/kontekstnaya-reklama/google-ads/', { waitUntil: 'networkidle' });
    const el = page.locator(sel).first();
    await el.scrollIntoViewIfNeeded();
    await page.waitForTimeout(150);
    await el.screenshot({ path: path.join(OUT, name) });
    const box = await el.boundingBox();
    console.log(name, box);
    await page.context().close();
  }

  await shot('#ctx-hero', 1440, 900, 'hero-1440.png');
  await shot('#ctx-hero', 390, 844, 'hero-390.png');
  await shot('#audience', 1440, 900, 'audience-desktop.png');
  await shot('#control', 1440, 900, 'control-desktop.png');
  await shot('#control', 390, 844, 'control-mobile.png');

  // console dig: what causes CERT error
  {
    const page = await (await browser.newContext({ viewport: { width: 1440, height: 900 } })).newPage();
    const failed = [];
    page.on('requestfailed', (req) => {
      failed.push({ url: req.url(), err: req.failure() && req.failure().errorText });
    });
    const cons = [];
    page.on('console', (m) => { if (m.type() === 'error') cons.push(m.text()); });
    await page.goto('http://localhost:4173/web-studiya/kontekstnaya-reklama/google-ads/', { waitUntil: 'networkidle' });
    console.log('FAILED', JSON.stringify(failed, null, 2));
    console.log('CONS', JSON.stringify(cons, null, 2));
    await page.context().close();
  }

  await browser.close();
})().catch((e) => { console.error(e); process.exit(1); });
