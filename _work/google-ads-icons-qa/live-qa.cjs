const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const OUT_DIR = __dirname;
const SHOTS = path.join(OUT_DIR, 'shots');
const REPORT_PATH = path.join(OUT_DIR, 'live-qa-report.json');
const BASE = 'https://raskrutov.kz/web-studiya/kontekstnaya-reklama/google-ads/';
const ASSET_BASE = 'https://raskrutov.kz/assets';

const ASSETS = [
  `${ASSET_BASE}/img/google-ads/3d/b2b-briefcase.webp`,
  `${ASSET_BASE}/img/google-ads/3d/ecommerce-bag.webp`,
  `${ASSET_BASE}/img/google-ads/3d/local-map-pin.webp`,
  `${ASSET_BASE}/img/google-ads/3d/account-chart.webp`,
  `${ASSET_BASE}/img/google-ads/3d/camp-search-screen.webp`,
  `${ASSET_BASE}/img/google-ads/3d/camp-pmax-target.webp`,
  `${ASSET_BASE}/img/google-ads/3d/camp-shopping-box.webp`,
  `${ASSET_BASE}/img/google-ads/3d/camp-remarketing-return.webp`,
  `${ASSET_BASE}/img/google-ads/3d/camp-video-cam.webp`,
  `${ASSET_BASE}/img/google-ads/google-ads-icon.svg`,
  `${ASSET_BASE}/css/google-ads-page.css?v=6`,
];

fs.mkdirSync(SHOTS, { recursive: true });

async function fetchStatus(url) {
  try {
    const res = await fetch(url, { method: 'GET', redirect: 'follow' });
    return { url, status: res.status, ok: res.status >= 200 && res.status < 400 };
  } catch (e) {
    return { url, status: 0, ok: false, error: String(e.message || e) };
  }
}

async function waitImagesComplete(page, selector, timeoutMs = 15000) {
  await page.waitForFunction(
    (sel) => {
      const imgs = Array.from(document.querySelectorAll(sel));
      if (!imgs.length) return false;
      return imgs.every((img) => img.complete && img.naturalWidth > 0);
    },
    selector,
    { timeout: timeoutMs }
  ).catch(() => null);
}

async function runViewport(browser, width, height) {
  const context = await browser.newContext({
    viewport: { width, height },
    deviceScaleFactor: 1,
    locale: 'ru-RU',
  });
  const page = await context.newPage();

  const result = {
    viewport: `${width}x${height}`,
    width,
    height,
    httpOk: false,
    status: null,
    title: null,
    metaDescription: null,
    canonical: null,
    robots: null,
    h1Count: null,
    aboutTitleFontSize: null,
    aboutTitleFontSizeOk: false,
    googleAdsIcon: { present: false, complete: false },
    cardVisuals: { count: 0, complete: 0, naturalWidths: [], allNatural256: false, items: [] },
    campVisuals: { count: 0, complete: 0, naturalWidths: [], allNatural256: false, items: [] },
    cssHref: null,
    cssVersionOk: false,
    consoleErrors: [],
    horizontalOverflow: null,
    faq: { present: false, opened: false, closed: false },
    modal: { ctaFound: false, opened: false, closed: false },
    forms: { count: 0, hasName: false, hasPhone: false, hasConsent: false },
    metrika: { ymOrYa: false, mcYandexScripts: 0 },
    screenshots: [],
  };

  const consoleErrors = [];
  const onConsole = (msg) => {
    if (msg.type() === 'error') consoleErrors.push({ type: 'console', text: msg.text() });
  };
  const onPageError = (err) => {
    consoleErrors.push({ type: 'pageerror', text: String(err.message || err) });
  };
  page.on('console', onConsole);
  page.on('pageerror', onPageError);

  const cb = Math.floor(Date.now() / 1000);
  const url = `${BASE}?cb=${cb}`;
  const resp = await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 90000 });
  result.status = resp ? resp.status() : null;
  result.httpOk = !!(resp && resp.ok());
  await page.waitForLoadState('networkidle', { timeout: 60000 }).catch(() => null);
  await page.waitForTimeout(500);

  // Force lazy images by scrolling key sections
  for (const id of ['about', 'audience', 'campaign-types', 'faq']) {
    const loc = page.locator(`#${id}`);
    if ((await loc.count()) > 0) {
      await loc.scrollIntoViewIfNeeded().catch(() => null);
      await page.waitForTimeout(250);
    }
  }
  // also scroll about heading icon into view (may be near top)
  await page.locator('.gads-about-heading, .gads-about-heading__icon').first().scrollIntoViewIfNeeded().catch(() => null);
  await page.locator('#audience .gads-card__visual img').first().scrollIntoViewIfNeeded().catch(() => null);
  await waitImagesComplete(page, '.gads-card__visual img');
  await page.locator('#campaign-types .gads-camp__visual img').first().scrollIntoViewIfNeeded().catch(() => null);
  await waitImagesComplete(page, '.gads-camp__visual img');
  await waitImagesComplete(page, 'img[src*="google-ads-icon.svg"]');

  const meta = await page.evaluate(() => {
    const q = (sel) => document.querySelector(sel);
    const title = document.title || '';
    const desc = q('meta[name="description"]')?.getAttribute('content') || null;
    const canonical = q('link[rel="canonical"]')?.getAttribute('href') || null;
    const robots = q('meta[name="robots"]')?.getAttribute('content') || null;
    const h1Count = document.querySelectorAll('h1').length;
    const aboutTitle = q('.gads-about-heading__title');
    const aboutTitleFontSize = aboutTitle ? getComputedStyle(aboutTitle).fontSize : null;

    const iconImg = q('img[src*="google-ads-icon.svg"]');
    const googleAdsIcon = {
      present: !!iconImg,
      complete: !!(iconImg && iconImg.complete && iconImg.naturalWidth > 0),
      naturalWidth: iconImg ? iconImg.naturalWidth : 0,
      src: iconImg ? iconImg.getAttribute('src') : null,
    };

    const mapImgs = (imgs) =>
      imgs.map((img) => ({
        src: img.getAttribute('src'),
        complete: !!(img.complete && img.naturalWidth > 0),
        naturalWidth: img.naturalWidth,
      }));

    const cardData = mapImgs(Array.from(document.querySelectorAll('.gads-card__visual img')));
    const campData = mapImgs(Array.from(document.querySelectorAll('.gads-camp__visual img')));

    const cssLinks = Array.from(document.querySelectorAll('link[rel="stylesheet"]'))
      .map((l) => l.getAttribute('href') || '')
      .filter((h) => h.includes('google-ads-page.css'));
    const cssHref = cssLinks[0] || null;

    const overflow = document.documentElement.scrollWidth > document.documentElement.clientWidth;

    const forms = Array.from(document.querySelectorAll('form'));
    const formInfo = {
      count: forms.length,
      hasName: forms.some((f) => !!f.querySelector('[name="name"]')),
      hasPhone: forms.some((f) => !!f.querySelector('[name="phone"], [type="tel"]')),
      hasConsent: forms.some(
        (f) =>
          !!f.querySelector(
            '[name="regulation"], [name="consent"], .rk-consent input[type="checkbox"], input[type="checkbox"][id*="regulation"]'
          )
      ),
    };

    const ymOrYa = typeof window.ym === 'function' || typeof window.Ya !== 'undefined';
    const mcYandexScripts = Array.from(document.querySelectorAll('script[src]')).filter((s) =>
      /mc\.yandex/i.test(s.getAttribute('src') || '')
    ).length;

    return {
      title,
      metaDescription: desc,
      canonical,
      robots,
      h1Count,
      aboutTitleFontSize,
      googleAdsIcon,
      cardData,
      campData,
      cssHref,
      overflow,
      formInfo,
      ymOrYa,
      mcYandexScripts,
    };
  });

  result.title = meta.title;
  result.metaDescription = meta.metaDescription;
  result.canonical = meta.canonical;
  result.robots = meta.robots;
  result.h1Count = meta.h1Count;
  result.aboutTitleFontSize = meta.aboutTitleFontSize;
  result.aboutTitleFontSizeOk = meta.aboutTitleFontSize === '32px';
  result.googleAdsIcon = meta.googleAdsIcon;
  result.cardVisuals = {
    count: meta.cardData.length,
    complete: meta.cardData.filter((c) => c.complete).length,
    naturalWidths: meta.cardData.map((c) => c.naturalWidth),
    allNatural256: meta.cardData.length === 4 && meta.cardData.every((c) => c.complete && c.naturalWidth === 256),
    items: meta.cardData,
  };
  result.campVisuals = {
    count: meta.campData.length,
    complete: meta.campData.filter((c) => c.complete).length,
    naturalWidths: meta.campData.map((c) => c.naturalWidth),
    allNatural256: meta.campData.length === 5 && meta.campData.every((c) => c.complete && c.naturalWidth === 256),
    items: meta.campData,
  };
  result.cssHref = meta.cssHref;
  result.cssVersionOk = !!(meta.cssHref && /google-ads-page\.css\?v=6\b/.test(meta.cssHref));
  result.horizontalOverflow = meta.overflow;
  result.forms = meta.formInfo;
  result.metrika = { ymOrYa: meta.ymOrYa, mcYandexScripts: meta.mcYandexScripts };

  // FAQ
  try {
    const faqBtn = page.locator('.gads-faq__btn, [data-gads-faq-btn]').first();
    if ((await faqBtn.count()) > 0) {
      result.faq.present = true;
      await faqBtn.scrollIntoViewIfNeeded();
      await faqBtn.click({ timeout: 5000 });
      await page.waitForTimeout(350);
      const expanded = await faqBtn.getAttribute('aria-expanded');
      result.faq.opened = expanded === 'true';
      await faqBtn.click({ timeout: 5000 });
      await page.waitForTimeout(350);
      const collapsed = await faqBtn.getAttribute('aria-expanded');
      result.faq.closed = collapsed === 'false';
    }
  } catch (e) {
    result.faq.error = String(e.message || e);
  }

  // Modal
  try {
    const cta = page.locator('button[data-rk-open-modal="rk-modal-lead"]').first();
    if ((await cta.count()) > 0) {
      result.modal.ctaFound = true;
      await cta.scrollIntoViewIfNeeded();
      await cta.click({ timeout: 5000 });
      await page.waitForTimeout(400);
      const dialog = page.locator('#rk-modal-lead[role="dialog"], #rk-modal-lead');
      const visible = await page.evaluate(() => {
        const el = document.getElementById('rk-modal-lead');
        if (!el) return false;
        if (el.hasAttribute('hidden')) return false;
        const st = getComputedStyle(el);
        return st.display !== 'none' && st.visibility !== 'hidden';
      });
      result.modal.opened = visible;
      if (visible) {
        await page.keyboard.press('Escape');
        await page.waitForTimeout(400);
        let stillOpen = await page.evaluate(() => {
          const el = document.getElementById('rk-modal-lead');
          if (!el) return false;
          if (el.hasAttribute('hidden')) return false;
          const st = getComputedStyle(el);
          return st.display !== 'none' && st.visibility !== 'hidden';
        });
        if (stillOpen) {
          const closeBtn = page.locator('#rk-modal-lead .rk-modal__close, [data-rk-modal-close]').first();
          if ((await closeBtn.count()) > 0) await closeBtn.click({ timeout: 3000 }).catch(() => null);
          await page.waitForTimeout(300);
          stillOpen = await page.evaluate(() => {
            const el = document.getElementById('rk-modal-lead');
            if (!el) return false;
            if (el.hasAttribute('hidden')) return false;
            const st = getComputedStyle(el);
            return st.display !== 'none' && st.visibility !== 'hidden';
          });
        }
        result.modal.closed = !stillOpen;
      }
    }
  } catch (e) {
    result.modal.error = String(e.message || e);
  }

  // Screenshots
  if (width === 1440 || width === 390) {
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(200);
    const fullName = `live-${width}.png`;
    await page.screenshot({ path: path.join(SHOTS, fullName), fullPage: false });
    result.screenshots.push(fullName);

    const audienceName = `live-audience-${width}.png`;
    const aud = page.locator('#audience');
    if ((await aud.count()) > 0) {
      await aud.scrollIntoViewIfNeeded();
      await page.waitForTimeout(200);
      await aud.screenshot({ path: path.join(SHOTS, audienceName) });
      result.screenshots.push(audienceName);
    }

    if (width === 1440) {
      const campName = 'live-campaigns-1440.png';
      const camp = page.locator('#campaign-types');
      if ((await camp.count()) > 0) {
        await camp.scrollIntoViewIfNeeded();
        await page.waitForTimeout(200);
        await camp.screenshot({ path: path.join(SHOTS, campName) });
        result.screenshots.push(campName);
      }
    }
  }

  await page.waitForTimeout(200);
  result.consoleErrors = consoleErrors.slice();
  page.off('console', onConsole);
  page.off('pageerror', onPageError);
  await context.close();
  return result;
}

function evaluatePassFail(report) {
  const checks = [];
  const add = (name, ok, detail) => checks.push({ name, ok: !!ok, detail });
  const allVp = report.viewports;
  const v1440 = allVp.find((v) => v.width === 1440) || allVp[0];

  add('http_load', allVp.every((v) => v.httpOk), allVp.map((v) => `${v.width}:${v.status}`).join(', '));
  add(
    'meta_dom',
    !!(v1440.title && v1440.metaDescription && v1440.canonical),
    `title=${v1440.title}; desc=${!!v1440.metaDescription}; canonical=${v1440.canonical}; robots=${v1440.robots}`
  );
  add('h1_count', allVp.every((v) => v.h1Count === 1), allVp.map((v) => `${v.width}:${v.h1Count}`).join(', '));
  add(
    'about_title_32px',
    allVp.every((v) => v.aboutTitleFontSizeOk),
    allVp.map((v) => `${v.width}:${v.aboutTitleFontSize}`).join(', ')
  );
  add(
    'google_ads_icon',
    allVp.every((v) => v.googleAdsIcon.present && v.googleAdsIcon.complete),
    allVp.map((v) => `${v.width}:present=${v.googleAdsIcon.present},complete=${v.googleAdsIcon.complete},nw=${v.googleAdsIcon.naturalWidth}`).join(' | ')
  );
  add(
    'card_visuals_4x256',
    allVp.every((v) => v.cardVisuals.allNatural256),
    allVp.map((v) => `${v.width}:n=${v.cardVisuals.count} complete=${v.cardVisuals.complete} nw=[${v.cardVisuals.naturalWidths}]`).join(' | ')
  );
  add(
    'camp_visuals_5x256',
    allVp.every((v) => v.campVisuals.allNatural256),
    allVp.map((v) => `${v.width}:n=${v.campVisuals.count} complete=${v.campVisuals.complete} nw=[${v.campVisuals.naturalWidths}]`).join(' | ')
  );
  add('css_v6', allVp.every((v) => v.cssVersionOk), allVp.map((v) => `${v.width}:${v.cssHref}`).join(' | '));
  add(
    'no_console_errors',
    allVp.every((v) => v.consoleErrors.length === 0),
    allVp.flatMap((v) => v.consoleErrors.map((e) => `[${v.width}] ${e.type}: ${e.text}`)).join('\n') || 'none'
  );
  add(
    'no_horizontal_overflow',
    allVp.every((v) => v.horizontalOverflow === false),
    allVp.map((v) => `${v.width}:overflow=${v.horizontalOverflow}`).join(', ')
  );
  add('faq_toggle', v1440.faq.present && v1440.faq.opened && v1440.faq.closed, JSON.stringify(v1440.faq));
  add('modal_open_close', v1440.modal.ctaFound && v1440.modal.opened && v1440.modal.closed, JSON.stringify(v1440.modal));
  add(
    'forms_fields',
    v1440.forms.count > 0 && v1440.forms.hasName && v1440.forms.hasPhone && v1440.forms.hasConsent,
    JSON.stringify(v1440.forms)
  );
  add('metrika', v1440.metrika.ymOrYa || v1440.metrika.mcYandexScripts > 0, JSON.stringify(v1440.metrika));
  add(
    'asset_status_codes',
    report.assetStatuses.every((a) => a.ok),
    report.assetStatuses.map((a) => `${a.status} ${path.basename(a.url.split('?')[0])}`).join(', ')
  );
  add(
    'screenshots',
    ['live-1440.png', 'live-audience-1440.png', 'live-campaigns-1440.png', 'live-390.png', 'live-audience-390.png'].every((f) =>
      fs.existsSync(path.join(SHOTS, f))
    ),
    '5 expected screenshots'
  );

  const failed = checks.filter((c) => !c.ok);
  return { checks, pass: failed.length === 0, failedCount: failed.length };
}

(async () => {
  console.log('Fetching asset status codes...');
  const assetStatuses = [];
  for (const url of ASSETS) {
    const st = await fetchStatus(url);
    assetStatuses.push(st);
    console.log(`  ${st.status} ${url}`);
  }

  let browser;
  try {
    browser = await chromium.launch({ channel: 'chrome', headless: true });
    console.log('Browser: chrome channel');
  } catch (e) {
    browser = await chromium.launch({ headless: true });
    console.log('Browser: chromium (fallback)');
  }

  const viewports = [];
  for (const [w, h] of [
    [1440, 900],
    [390, 844],
    [360, 800],
  ]) {
    console.log(`\nViewport ${w}x${h}...`);
    const vr = await runViewport(browser, w, h);
    viewports.push(vr);
    console.log(`  HTTP ${vr.status}, H1=${vr.h1Count}, font=${vr.aboutTitleFontSize}, cards=${vr.cardVisuals.count}/${vr.cardVisuals.naturalWidths}, camps=${vr.campVisuals.count}/${vr.campVisuals.naturalWidths}, overflow=${vr.horizontalOverflow}, consoleErr=${vr.consoleErrors.length}`);
  }

  await browser.close();

  const report = {
    generatedAt: new Date().toISOString(),
    urlBase: BASE,
    assetStatuses,
    viewports,
  };
  report.summary = evaluatePassFail(report);
  fs.writeFileSync(REPORT_PATH, JSON.stringify(report, null, 2), 'utf8');

  // cleanup peek helper if present
  try { fs.unlinkSync(path.join(OUT_DIR, '_peek.js')); } catch (_) {}

  console.log('\n=== LIVE QA SUMMARY ===');
  console.log(`URL: ${BASE}`);
  console.log(`OVERALL: ${report.summary.pass ? 'PASS' : 'FAIL'} (${report.summary.failedCount} failed)`);
  for (const c of report.summary.checks) {
    const detail = c.ok ? '' : ' — ' + String(c.detail).replace(/\s+/g, ' ').slice(0, 220);
    console.log(`${c.ok ? 'PASS' : 'FAIL'}  ${c.name}${detail}`);
  }
  console.log(`\nReport: ${REPORT_PATH}`);
  console.log(`Shots: ${SHOTS}`);
  process.exit(report.summary.pass ? 0 : 1);
})().catch((err) => {
  console.error('FATAL:', err);
  process.exit(2);
});
