/**
 * Playwright smoke: 390 + 1440 for 4 Google Ads city pages; optional 430/768 on almaty.
 */
import { chromium } from 'playwright';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT = __dirname;
const CITIES = ['almaty', 'shymkent', 'karaganda', 'aktobe'];
const BASE = 'http://127.0.0.1:8765/web-studiya/kontekstnaya-reklama/google-ads';

function urlFor(city) {
  return `${BASE}/${city}/`;
}

async function measureHScroll(page) {
  return page.evaluate(() => {
    const doc = document.documentElement;
    const body = document.body;
    const sw = Math.max(doc.scrollWidth, body?.scrollWidth || 0);
    const cw = doc.clientWidth;
    return { scrollWidth: sw, clientWidth: cw, overflow: sw - cw };
  });
}

async function smokeViewport(page, city, width, height) {
  const result = {
    city,
    viewport: `${width}x${height}`,
    url: urlFor(city),
    ok: true,
    errors: [],
    h1: null,
    hScroll: null,
    modal: null,
    faq: null,
    sticky: null,
  };

  await page.setViewportSize({ width, height });
  const consoleErrors = [];
  page.on('pageerror', (e) => consoleErrors.push(String(e.message || e)));
  page.on('console', (msg) => {
    if (msg.type() === 'error') consoleErrors.push(msg.text());
  });

  const resp = await page.goto(urlFor(city), { waitUntil: 'domcontentloaded', timeout: 60000 });
  if (!resp || resp.status() >= 400) {
    result.ok = false;
    result.errors.push(`HTTP ${resp?.status()}`);
    return result;
  }

  await page.waitForTimeout(400);

  const h1 = await page.locator('main h1').first().textContent();
  result.h1 = (h1 || '').trim();
  if (!result.h1) {
    result.ok = false;
    result.errors.push('missing H1');
  }

  result.hScroll = await measureHScroll(page);
  if (result.hScroll.overflow > 1) {
    result.ok = false;
    result.errors.push(`h-scroll overflow=${result.hScroll.overflow}`);
  }

  // Modal open
  const openBtn = page.locator('[data-rk-open-modal="rk-modal-lead"]').first();
  if ((await openBtn.count()) > 0) {
    await openBtn.click();
    await page.waitForTimeout(300);
    const modal = page.locator('#rk-modal-lead');
    const visible = await modal.isVisible().catch(() => false);
    const ariaHidden = await modal.getAttribute('aria-hidden');
    result.modal = { visible, ariaHidden };
    if (!visible && ariaHidden === 'true') {
      result.ok = false;
      result.errors.push('modal did not open');
    }
    const closeBtn = page.locator('#rk-modal-lead [data-rk-close-modal], #rk-modal-lead .rk-modal__close, button[aria-label*="Закрыть"]').first();
    if ((await closeBtn.count()) > 0) {
      await closeBtn.click().catch(() => {});
      await page.waitForTimeout(200);
    } else {
      await page.keyboard.press('Escape');
      await page.waitForTimeout(200);
    }
  } else {
    result.ok = false;
    result.errors.push('modal open button missing');
  }

  // FAQ expand
  const faqBtn = page.locator('[data-gads-faq-btn]').first();
  if ((await faqBtn.count()) > 0) {
    const controls = await faqBtn.getAttribute('aria-controls');
    await faqBtn.click();
    await page.waitForTimeout(250);
    const expanded = await faqBtn.getAttribute('aria-expanded');
    let answerVisible = false;
    if (controls) {
      const ans = page.locator(`#${controls}`);
      answerVisible = !(await ans.getAttribute('hidden').catch(() => null));
      const hiddenAttr = await ans.getAttribute('hidden');
      answerVisible = hiddenAttr === null;
    }
    result.faq = { expanded, answerVisible, controls };
    if (expanded !== 'true' || !answerVisible) {
      result.ok = false;
      result.errors.push('FAQ did not expand');
    }
  } else {
    result.ok = false;
    result.errors.push('FAQ button missing');
  }

  // Sticky CTA on 390
  if (width === 390) {
    const sticky = page.locator('.rk-sticky-cta');
    const count = await sticky.count();
    let stickyVisible = false;
    if (count > 0) {
      stickyVisible = await sticky.first().isVisible().catch(() => false);
      const box = await sticky.first().boundingBox().catch(() => null);
      result.sticky = { count, stickyVisible, box };
      if (!stickyVisible) {
        result.ok = false;
        result.errors.push('sticky CTA not visible at 390');
      }
    } else {
      result.sticky = { count: 0 };
      result.ok = false;
      result.errors.push('sticky CTA missing');
    }
  }

  if (consoleErrors.length) {
    result.consoleErrors = [...new Set(consoleErrors)].slice(0, 20);
  }

  return result;
}

async function main() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();
  const results = [];

  for (const city of CITIES) {
    results.push(await smokeViewport(page, city, 390, 844));
    results.push(await smokeViewport(page, city, 1440, 900));
  }

  // Optional representative widths
  results.push(await smokeViewport(page, 'almaty', 430, 932));
  results.push(await smokeViewport(page, 'almaty', 768, 1024));

  await browser.close();

  const summary = {
    measuredAt: new Date().toISOString(),
    pass: results.every((r) => r.ok),
    failCount: results.filter((r) => !r.ok).length,
    results,
  };

  fs.writeFileSync(path.join(OUT, 'smoke-playwright.json'), JSON.stringify(summary, null, 2));
  console.log(JSON.stringify({ pass: summary.pass, failCount: summary.failCount, failures: results.filter((r) => !r.ok) }, null, 2));
  process.exit(summary.pass ? 0 : 1);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
