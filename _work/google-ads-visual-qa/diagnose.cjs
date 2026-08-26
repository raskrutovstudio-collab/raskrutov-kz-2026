const { chromium } = require('playwright');
const path = require('path');
const OUT = path.join('site_mirror', '_work', 'google-ads-visual-qa');

(async () => {
  const browser = await chromium.launch({ headless: true, channel: 'chrome' });

  // diagnose 360
  {
    const page = await (await browser.newContext({ viewport: { width: 360, height: 844 } })).newPage();
    await page.goto('http://localhost:4173/web-studiya/kontekstnaya-reklama/google-ads/', { waitUntil: 'networkidle' });
    const overflow = await page.evaluate(() => {
      const iw = window.innerWidth;
      const all = Array.from(document.querySelectorAll('body *'));
      const bad = [];
      for (const el of all) {
        const r = el.getBoundingClientRect();
        if (r.width < 1 && r.height < 1) continue;
        if (r.right > iw + 1 || r.left < -1) {
          bad.push({
            tag: el.tagName,
            cls: (el.className && String(el.className).slice(0, 140)) || '',
            id: el.id || '',
            left: Math.round(r.left),
            right: Math.round(r.right),
            width: Math.round(r.width)
          });
        }
      }
      bad.sort((a, b) => b.right - a.right);
      return { scrollWidth: document.documentElement.scrollWidth, iw, top: bad.slice(0, 20) };
    });
    console.log('OVERFLOW360', JSON.stringify(overflow, null, 2));

    const structure = await page.evaluate(() => {
      const heroLike = Array.from(document.querySelectorAll('[class*="hero"], [class*="Hero"], .gads-top, #hero, main > section'))
        .slice(0, 15)
        .map(e => ({ tag: e.tagName, id: e.id, cls: String(e.className).slice(0, 120) }));
      const firstMainKids = Array.from(document.querySelector('main')?.children || []).slice(0, 8)
        .map(e => ({ tag: e.tagName, id: e.id, cls: String(e.className).slice(0, 120) }));
      return { heroLike, firstMainKids };
    });
    console.log('STRUCTURE', JSON.stringify(structure, null, 2));
    await page.context().close();
  }

  // better hero screenshots: capture first main section / element containing .gads-hero-price
  async function shotHero(w, h, name) {
    const page = await (await browser.newContext({ viewport: { width: w, height: h } })).newPage();
    await page.goto('http://localhost:4173/web-studiya/kontekstnaya-reklama/google-ads/', { waitUntil: 'networkidle' });
    const handle = await page.evaluateHandle(() => {
      const price = document.querySelector('.gads-hero-price, .gads-hero-price__value');
      let el = price;
      while (el && el !== document.body) {
        if (el.tagName === 'SECTION' || (el.className && /hero|intro|top/i.test(String(el.className)))) return el;
        el = el.parentElement;
      }
      return document.querySelector('main > section') || document.querySelector('main');
    });
    const box = await handle.asElement().boundingBox();
    if (box) {
      const clip = {
        x: Math.max(0, box.x),
        y: Math.max(0, box.y),
        width: Math.min(w, box.width),
        height: Math.min(h, Math.max(box.height, 200))
      };
      await page.screenshot({ path: path.join(OUT, name), clip });
      console.log('SHOT', name, clip);
    } else {
      await page.screenshot({ path: path.join(OUT, name), fullPage: false });
      console.log('SHOT_FALLBACK', name);
    }
    await page.context().close();
  }

  await shotHero(1440, 900, 'hero-1440.png');
  await shotHero(390, 844, 'hero-390.png');

  // also check if overflow is scrollbar/artifact: body overflow vs element
  {
    const page = await (await browser.newContext({ viewport: { width: 360, height: 844 } })).newPage();
    await page.goto('http://localhost:4173/web-studiya/kontekstnaya-reklama/google-ads/', { waitUntil: 'networkidle' });
    // check with clientWidth vs scrollWidth (more reliable for horizontal scroll)
    const metrics = await page.evaluate(() => ({
      docScroll: document.documentElement.scrollWidth,
      bodyScroll: document.body.scrollWidth,
      client: document.documentElement.clientWidth,
      inner: window.innerWidth,
      hasHScroll: document.documentElement.scrollWidth > document.documentElement.clientWidth
    }));
    console.log('METRICS360', JSON.stringify(metrics));
    await page.context().close();
  }

  await browser.close();
})().catch((e) => { console.error(e); process.exit(1); });
