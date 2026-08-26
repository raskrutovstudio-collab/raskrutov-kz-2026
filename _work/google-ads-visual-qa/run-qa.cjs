const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const BASE = 'http://localhost:4173';
const PAGE_PATH = '/web-studiya/kontekstnaya-reklama/google-ads/';
const OUT = path.join('site_mirror', '_work', 'google-ads-visual-qa');
const VIEWPORTS = [1440, 1024, 768, 390, 360];

function ignoreConsole(text, type) {
  const t = String(text || '');
  if (/extension|chrome-extension|moz-extension|Failed to load resource.*favicon/i.test(t)) return true;
  if (/Download the React DevTools/i.test(t)) return true;
  return false;
}

(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  const browser = await chromium.launch({ headless: true, channel: 'chrome' });
  const results = {
    baseUrl: BASE + PAGE_PATH,
    widths: {},
    heroPrice: {},
    presence: {},
    seo: {},
    formsAnalytics: {},
    consoleErrors: [],
    screenshots: [],
    issues: []
  };

  // Shared page for presence/SEO/forms at 1440
  {
    const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    const page = await context.newPage();
    const cons = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error' && !ignoreConsole(msg.text(), msg.type())) cons.push(msg.text());
    });
    page.on('pageerror', (err) => {
      if (!ignoreConsole(err.message)) cons.push('PAGEERROR: ' + err.message);
    });
    await page.goto(BASE + PAGE_PATH, { waitUntil: 'networkidle', timeout: 60000 });

    results.presence = await page.evaluate(() => {
      return {
        serp: !!document.querySelector('.gads-serp'),
        cardIcons: document.querySelectorAll('.gads-card__icon').length,
        artifacts: document.querySelectorAll('.gads-artifact').length,
        tasksPanel: !!document.querySelector('.gads-tasks-panel'),
        heroPriceValue: document.querySelector('.gads-hero-price__value')?.textContent?.trim() || null,
        heroPriceNote: document.querySelector('.gads-hero-price__note')?.textContent?.trim() || null,
        heroPriceSeparate: !!(document.querySelector('.gads-hero-price__value') && document.querySelector('.gads-hero-price__note'))
      };
    });

    results.seo = await page.evaluate(() => {
      const canon = document.querySelector('link[rel="canonical"]')?.getAttribute('href') || null;
      const title = document.title || null;
      const desc = document.querySelector('meta[name="description"]')?.getAttribute('content') || null;
      const h1 = document.querySelector('h1')?.textContent?.trim() || null;
      const h1Count = document.querySelectorAll('h1').length;
      return { title, description: desc, canonical: canon, h1, h1Count };
    });

    results.formsAnalytics = await page.evaluate(() => {
      const modal = !!document.querySelector('#rk-modal-lead');
      const openers = document.querySelectorAll('[data-rk-open-modal]').length;
      const scripts = Array.from(document.querySelectorAll('script[src], script')).map(s => s.src || (s.textContent || '').slice(0, 80));
      const ymPresent = scripts.some(s => /mc\.yandex|yandex\.ru\/metrika|ym\(|Ya\.Metrika|tag\.js/i.test(s))
        || !!document.querySelector('script[src*="mc.yandex"], script[src*="metrika"]')
        || /ym\(|Ya\.Metrika|mc\.yandex/i.test(document.documentElement.innerHTML);
      return { modalLead: modal, openModalTriggers: openers, ymOrMetrika: ymPresent };
    });

    // hero screenshot 1440
    const hero = page.locator('#ctx-hero, .ctx-hero, .gads-hero, section.hero, [class*="hero"]').first();
    const heroEl = await page.$('#ctx-hero') || await page.$('.ctx-hero') || await page.$('.gads-hero') || await page.$('main section') || await page.$('header + section');
    if (await page.$('#ctx-hero') || await page.$('.ctx-hero') || await page.$('.gads-hero')) {
      await page.locator('#ctx-hero, .ctx-hero, .gads-hero').first().screenshot({ path: path.join(OUT, 'hero-1440.png') });
      results.screenshots.push('hero-1440.png');
    } else {
      await page.screenshot({ path: path.join(OUT, 'hero-1440.png'), clip: { x: 0, y: 0, width: 1440, height: 900 } });
      results.screenshots.push('hero-1440.png (full viewport fallback)');
      results.issues.push('No #ctx-hero/.ctx-hero/.gads-hero found for hero-1440; used viewport clip');
    }

    // audience desktop
    const aud = await page.$('#audience');
    if (aud) {
      await aud.scrollIntoViewIfNeeded();
      await page.waitForTimeout(200);
      await aud.screenshot({ path: path.join(OUT, 'audience-desktop.png') });
      results.screenshots.push('audience-desktop.png');
    } else {
      results.issues.push('#audience not found');
    }

    // control desktop
    const ctrl = await page.$('#control');
    if (ctrl) {
      await ctrl.scrollIntoViewIfNeeded();
      await page.waitForTimeout(200);
      await ctrl.screenshot({ path: path.join(OUT, 'control-desktop.png') });
      results.screenshots.push('control-desktop.png');
    } else {
      results.issues.push('#control not found');
    }

    results.consoleErrors.push(...cons.map(c => ({ viewport: 1440, text: c })));
    await context.close();
  }

  // Width checks + hero price at 390 + mobile screenshots
  for (const w of VIEWPORTS) {
    const h = w <= 390 ? 844 : 900;
    const context = await browser.newContext({ viewport: { width: w, height: h } });
    const page = await context.newPage();
    const cons = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error' && !ignoreConsole(msg.text(), msg.type())) cons.push(msg.text());
    });
    page.on('pageerror', (err) => {
      if (!ignoreConsole(err.message)) cons.push('PAGEERROR: ' + err.message);
    });
    await page.goto(BASE + PAGE_PATH, { waitUntil: 'networkidle', timeout: 60000 });

    const widthCheck = await page.evaluate(() => {
      const sw = document.documentElement.scrollWidth;
      const iw = window.innerWidth;
      return { scrollWidth: sw, innerWidth: iw, ok: sw <= iw + 1 };
    });
    results.widths[w] = { ...widthCheck, pass: widthCheck.ok ? 'PASS' : 'FAIL' };
    if (!widthCheck.ok) results.issues.push(`Horizontal scroll at ${w}: scrollWidth=${widthCheck.scrollWidth} > innerWidth=${widthCheck.innerWidth}`);

    if (w === 390) {
      results.heroPrice['390'] = await page.evaluate(() => {
        const val = document.querySelector('.gads-hero-price__value');
        const note = document.querySelector('.gads-hero-price__note');
        if (!val) return { error: 'no .gads-hero-price__value' };
        const vb = val.getBoundingClientRect();
        const nb = note ? note.getBoundingClientRect() : null;
        const cs = getComputedStyle(val);
        const lineHeight = parseFloat(cs.lineHeight) || parseFloat(cs.fontSize) * 1.2;
        const oneLine = vb.height <= lineHeight * 1.35 + 2;
        return {
          valueText: val.textContent.trim(),
          noteText: note ? note.textContent.trim() : null,
          separate: !!(val && note) && val !== note,
          valueBox: { x: vb.x, y: vb.y, width: vb.width, height: vb.height },
          noteBox: nb ? { x: nb.x, y: nb.y, width: nb.width, height: nb.height } : null,
          lineHeight,
          valueOneLine: oneLine
        };
      });
      if (results.heroPrice['390'].valueOneLine === false) {
        results.issues.push('Hero price value not single-line at 390');
      }

      if (await page.$('#ctx-hero') || await page.$('.ctx-hero') || await page.$('.gads-hero')) {
        await page.locator('#ctx-hero, .ctx-hero, .gads-hero').first().screenshot({ path: path.join(OUT, 'hero-390.png') });
        results.screenshots.push('hero-390.png');
      } else {
        await page.screenshot({ path: path.join(OUT, 'hero-390.png'), clip: { x: 0, y: 0, width: 390, height: Math.min(844, 700) } });
        results.screenshots.push('hero-390.png (fallback)');
      }

      const ctrl = await page.$('#control');
      if (ctrl) {
        await ctrl.scrollIntoViewIfNeeded();
        await page.waitForTimeout(200);
        await ctrl.screenshot({ path: path.join(OUT, 'control-mobile.png') });
        results.screenshots.push('control-mobile.png');
      }
    }

    results.consoleErrors.push(...cons.map(c => ({ viewport: w, text: c })));
    await context.close();
  }

  // dedupe console
  const seen = new Set();
  results.consoleErrors = results.consoleErrors.filter(e => {
    const k = e.viewport + '|' + e.text;
    if (seen.has(k)) return false;
    seen.add(k);
    return true;
  });

  const outPath = path.join(OUT, 'qa-report.json');
  fs.writeFileSync(outPath, JSON.stringify(results, null, 2), 'utf8');
  console.log(JSON.stringify(results, null, 2));
  await browser.close();
})().catch((e) => {
  console.error('QA_FAILED', e);
  process.exit(1);
});

