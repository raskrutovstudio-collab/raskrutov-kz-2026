const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const BASE = 'http://127.0.0.1:4179';
const PAGE_URL = `${BASE}/web-studiya/kontekstnaya-reklama/google-ads/`;
const WIDTHS = [1440, 1024, 768, 390, 360];
const ROOT = path.resolve(__dirname, '../..');
const WORK = __dirname;
const SHOTS = path.join(WORK, 'shots');
const REPORT = path.join(WORK, 'qa-3d-report.json');
const ASSETS_3D = path.join(ROOT, 'assets/img/google-ads/3d');
const ICON_SVG = path.join(ROOT, 'assets/img/google-ads/google-ads-icon.svg');

fs.mkdirSync(SHOTS, { recursive: true });

function isNoise(text) {
  if (!text) return true;
  const t = String(text);
  return /metrika|yandex|mc\.yandex|favicon|Failed to load resource.*yandex|net::ERR_/i.test(t) &&
    /metrika|yandex|mc\.yandex|favicon/i.test(t);
}

async function measureWidth(page, width) {
  await page.setViewportSize({ width, height: 900 });
  await page.goto(PAGE_URL, { waitUntil: 'networkidle', timeout: 60000 });

  // Force lazy images in audience + campaigns into view/load
  for (const sel of ['#audience', '#campaign-types', '#about']) {
    const loc = page.locator(sel);
    if (await loc.count()) {
      await loc.first().scrollIntoViewIfNeeded();
      await page.waitForTimeout(200);
    }
  }
  await page.evaluate(async () => {
    const imgs = [...document.querySelectorAll('.gads-card__visual img, .gads-camp__visual img, #about img')];
    await Promise.all(
      imgs.map(
        (img) =>
          img.complete
            ? Promise.resolve()
            : new Promise((res) => {
                img.addEventListener('load', () => res(), { once: true });
                img.addEventListener('error', () => res(), { once: true });
                // nudge lazy loaders
                img.loading = 'eager';
                if (img.dataset.src && !img.src) img.src = img.dataset.src;
              })
      )
    );
  });
  await page.waitForTimeout(300);

  const data = await page.evaluate(() => {
    const doc = document.documentElement;
    const titleEl = document.querySelector('.gads-about-heading__title');
    const aboutImg =
      document.querySelector('#about img.gads-about-heading__icon, #about .gads-about-heading img, .gads-about-heading__icon') ||
      document.querySelector('#about img[src*="google-ads"], #about img[src*="3d"], .gads-about img');

    const cardImgs = [...document.querySelectorAll('.gads-card__visual img')];
    const campImgs = [...document.querySelectorAll('.gads-camp__visual img')];
    const leftoverSvg = {
      card: document.querySelectorAll('.gads-card__visual svg').length,
      camp: document.querySelectorAll('.gads-camp__visual svg').length,
    };

    const imgInfo = (img) => {
      if (!img) return null;
      const cs = getComputedStyle(img);
      const rect = img.getBoundingClientRect();
      return {
        src: img.getAttribute('src') || '',
        complete: img.complete,
        naturalWidth: img.naturalWidth,
        naturalHeight: img.naturalHeight,
        displayedWidth: Math.round(parseFloat(cs.width) || rect.width),
        displayedHeight: Math.round(parseFloat(cs.height) || rect.height),
        cssWidth: cs.width,
        cssHeight: cs.height,
      };
    };

    return {
      scrollWidth: doc.scrollWidth,
      clientWidth: doc.clientWidth,
      horizontalOverflow: doc.scrollWidth > doc.clientWidth + 1,
      aboutTitleFontSize: titleEl ? getComputedStyle(titleEl).fontSize : null,
      aboutIcon: imgInfo(aboutImg),
      aboutIconExists: !!aboutImg,
      cardVisualImgCount: cardImgs.length,
      campVisualImgCount: campImgs.length,
      cardVisualImgs: cardImgs.map(imgInfo),
      campVisualImgs: campImgs.map(imgInfo),
      leftoverSvg,
    };
  });

  return data;
}

async function seoFormsAnalytics(page) {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto(PAGE_URL, { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.waitForTimeout(800);

  return page.evaluate(() => {
    const title = document.title || '';
    const metaDesc = document.querySelector('meta[name="description"]')?.getAttribute('content') || '';
    const canonical = document.querySelector('link[rel="canonical"]')?.getAttribute('href') || '';
    const h1Count = document.querySelectorAll('h1').length;
    const jsonLd = [...document.querySelectorAll('script[type="application/ld+json"]')].length;

    const formsWithAction = document.querySelectorAll('form[action]').length;
    const formsTotal = document.querySelectorAll('form').length;
    const namedInputs = document.querySelectorAll('input[name]').length;
    const consent =
      !!document.querySelector(
        'input[type="checkbox"][name*="consent" i], input[type="checkbox"][id*="consent" i], input[type="checkbox"][name*="agree" i], input[type="checkbox"][name*="personal" i], input[type="checkbox"][name*="privacy" i], input[type="checkbox"][name*="pd" i], .consent input[type="checkbox"], [data-consent] input[type="checkbox"]'
      ) ||
      [...document.querySelectorAll('input[type="checkbox"]')].some((el) => {
        const blob = `${el.name} ${el.id} ${el.className} ${el.getAttribute('aria-label') || ''} ${(el.closest('label') || el.parentElement)?.textContent || ''}`.toLowerCase();
        return /consent|соглас|privacy|personal|персональ|pd_/.test(blob);
      });

    const html = document.documentElement.innerHTML;
    const hasYmScript =
      /Ya\.Metrika|ym\(|mc\.yandex\.ru|metrika/i.test(html) ||
      typeof window.ym === 'function' ||
      !!(window.Ya && window.Ya.Metrika);

    let metrikaId = null;
    const m = html.match(/ym\s*\(\s*(\d+)\s*,/) || html.match(/Ya\.Metrika\s*\(\s*\{[^}]*id\s*:\s*(\d+)/);
    if (m) metrikaId = m[1];
    if (!metrikaId && window.Ya && window.Ya._metrika) {
      try {
        const counters = Object.keys(window.Ya._metrika.counters || {});
        if (counters.length) metrikaId = counters[0];
      } catch (_) {}
    }

    return {
      title,
      metaDescription: metaDesc,
      canonical,
      h1Count,
      jsonLdCount: jsonLd,
      formsActionCount: formsWithAction,
      formsTotal,
      inputNameCount: namedInputs,
      consentCheckbox: consent,
      analytics: {
        hasYmOrMetrika: hasYmScript,
        metrikaId,
      },
    };
  });
}

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  const consoleErrors = [];
  const pageErrors = [];

  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      const text = msg.text();
      if (!isNoise(text)) consoleErrors.push(text);
    }
  });
  page.on('pageerror', (err) => {
    const text = err.message || String(err);
    if (!isNoise(text)) pageErrors.push(text);
  });

  const byWidth = {};
  for (const w of WIDTHS) {
    byWidth[String(w)] = await measureWidth(page, w);
  }

  const seo = await seoFormsAnalytics(page);

  // Screenshots
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto(`${BASE}/`, { waitUntil: 'networkidle', timeout: 60000 });
  await page.waitForTimeout(500);
  const directions = page.locator('#directions');
  if (await directions.count()) {
    await directions.screenshot({ path: path.join(SHOTS, 'home-directions-1440.png') });
  }

  await page.goto(PAGE_URL, { waitUntil: 'networkidle', timeout: 60000 });
  await page.waitForTimeout(500);

  for (const [sel, name] of [
    ['#about', 'about-1440.png'],
    ['#audience', 'audience-1440.png'],
    ['#campaign-types', 'campaigns-1440.png'],
  ]) {
    const loc = page.locator(sel);
    if (await loc.count()) await loc.first().screenshot({ path: path.join(SHOTS, name) });
  }

  await page.screenshot({
    path: path.join(SHOTS, 'page-top-1440.png'),
    clip: { x: 0, y: 0, width: 1440, height: 900 },
  });

  const card = page.locator('#audience .gads-card').first();
  if (await card.count()) {
    await card.screenshot({ path: path.join(SHOTS, 'audience-card-closeup-1440.png') });
  }

  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(PAGE_URL, { waitUntil: 'networkidle', timeout: 60000 });
  await page.waitForTimeout(500);
  for (const [sel, name] of [
    ['#audience', 'audience-390.png'],
    ['#campaign-types', 'campaigns-390.png'],
  ]) {
    const loc = page.locator(sel);
    if (await loc.count()) await loc.first().screenshot({ path: path.join(SHOTS, name) });
  }

  const webpFiles = fs.readdirSync(ASSETS_3D).filter((f) => f.endsWith('.webp')).sort();
  const assets = webpFiles.map((f) => {
    const p = path.join(ASSETS_3D, f);
    return { file: `assets/img/google-ads/3d/${f}`, bytes: fs.statSync(p).size };
  });
  const svgBytes = fs.existsSync(ICON_SVG) ? fs.statSync(ICON_SVG).size : null;
  const totalWebp = assets.reduce((s, a) => s + a.bytes, 0);

  const checks = {};
  const w1440 = byWidth['1440'];

  checks.noHorizontalOverflow = {
    pass: WIDTHS.every((w) => !byWidth[String(w)].horizontalOverflow),
    detail: Object.fromEntries(
      WIDTHS.map((w) => [
        w,
        {
          scrollWidth: byWidth[String(w)].scrollWidth,
          clientWidth: byWidth[String(w)].clientWidth,
          overflow: byWidth[String(w)].horizontalOverflow,
        },
      ])
    ),
  };

  checks.aboutTitleFontSize32 = {
    pass: WIDTHS.every((w) => byWidth[String(w)].aboutTitleFontSize === '32px'),
    detail: Object.fromEntries(WIDTHS.map((w) => [w, byWidth[String(w)].aboutTitleFontSize])),
  };

  checks.aboutIconExists = {
    pass: !!w1440.aboutIconExists && w1440.aboutIcon && w1440.aboutIcon.complete,
    detail: w1440.aboutIcon,
  };

  checks.cardVisualImgCount4 = {
    pass: w1440.cardVisualImgCount === 4,
    detail: { count: w1440.cardVisualImgCount },
  };

  checks.campVisualImgCount5 = {
    pass: w1440.campVisualImgCount === 5,
    detail: { count: w1440.campVisualImgCount },
  };

  const allVisualsPrimary = [...(w1440.cardVisualImgs || []), ...(w1440.campVisualImgs || [])];
  const visualsOkAllWidths = WIDTHS.every((w) => {
    const d = byWidth[String(w)];
    const imgs = [...(d.cardVisualImgs || []), ...(d.campVisualImgs || [])];
    return (
      imgs.length === 9 &&
      imgs.every((i) => i.complete === true && i.naturalWidth === 256 && i.naturalHeight === 256)
    );
  });

  checks.visualImgs256Complete = {
    pass: visualsOkAllWidths,
    detail: {
      primary1440: allVisualsPrimary,
      perWidthOk: Object.fromEntries(
        WIDTHS.map((w) => {
          const d = byWidth[String(w)];
          const imgs = [...(d.cardVisualImgs || []), ...(d.campVisualImgs || [])];
          return [
            w,
            imgs.every((i) => i.complete && i.naturalWidth === 256 && i.naturalHeight === 256) &&
              imgs.length === 9,
          ];
        })
      ),
    },
  };

  checks.noLeftoverSvg = {
    pass: WIDTHS.every(
      (w) => byWidth[String(w)].leftoverSvg.card === 0 && byWidth[String(w)].leftoverSvg.camp === 0
    ),
    detail: Object.fromEntries(WIDTHS.map((w) => [w, byWidth[String(w)].leftoverSvg])),
  };

  checks.consoleClean = {
    pass: consoleErrors.length === 0 && pageErrors.length === 0,
    detail: { consoleErrors, pageErrors },
  };

  checks.seoSmoke = {
    pass:
      !!seo.title &&
      !!seo.metaDescription &&
      !!seo.canonical &&
      seo.h1Count === 1 &&
      seo.jsonLdCount >= 1,
    detail: {
      title: seo.title,
      metaDescription: seo.metaDescription?.slice(0, 120),
      canonical: seo.canonical,
      h1Count: seo.h1Count,
      jsonLdCount: seo.jsonLdCount,
    },
  };

  // Forms are JS-handled (no action attr) — report form[action] as requested, pass if forms + named inputs exist
  checks.forms = {
    pass: seo.formsTotal >= 1 && seo.inputNameCount >= 1 && seo.consentCheckbox === true,
    detail: {
      formsActionCount: seo.formsActionCount,
      formsTotal: seo.formsTotal,
      inputNameCount: seo.inputNameCount,
      consentCheckbox: seo.consentCheckbox,
      note: 'Forms use data-lead-form without HTML action attribute',
    },
  };

  checks.analytics = {
    pass: seo.analytics.hasYmOrMetrika === true,
    detail: seo.analytics,
  };

  const screenshots = fs
    .readdirSync(SHOTS)
    .filter((f) => f.endsWith('.png'))
    .map((f) => path.join('site_mirror/_work/google-ads-icons-qa/shots', f).replace(/\\/g, '/'));

  const allPass = Object.values(checks).every((c) => c.pass);

  const report = {
    timestamp: new Date().toISOString(),
    pageUrl: PAGE_URL,
    overall: allPass ? 'PASS' : 'FAIL',
    checks,
    byWidth,
    seoFormsAnalytics: seo,
    consoleErrors,
    pageErrors,
    screenshots,
    assets: {
      webp: assets,
      totalWebpBytes: totalWebp,
      googleAdsIconSvgBytes: svgBytes,
    },
  };

  fs.writeFileSync(REPORT, JSON.stringify(report, null, 2), 'utf8');

  const compact = {
    overall: report.overall,
    checks: Object.fromEntries(Object.entries(checks).map(([k, v]) => [k, v.pass ? 'PASS' : 'FAIL'])),
    forms: checks.forms.detail,
    analytics: seo.analytics,
    seo: checks.seoSmoke.detail,
    consoleErrors,
    pageErrors,
    screenshots,
    assets: report.assets,
    aboutTitleFontSize: checks.aboutTitleFontSize32.detail,
    overflow: checks.noHorizontalOverflow.detail,
  };
  console.log(JSON.stringify(compact, null, 2));
  console.log('\nOVERALL:', report.overall);
  console.log('Full report:', REPORT);

  await browser.close();
  process.exit(allPass ? 0 : 1);
})().catch((err) => {
  console.error(err);
  process.exit(2);
});
