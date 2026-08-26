/**
 * Visual regression QA: 430 and 768 for Shymkent, Karaganda, Aktobe.
 * Also re-checks Almaty 430/768 for the batch table.
 * Artifacts only under _work/. Does not modify production pages.
 */
import { chromium } from 'playwright';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SHOTS = path.join(__dirname, 'shots-430-768');
fs.mkdirSync(SHOTS, { recursive: true });

const BASE = 'http://127.0.0.1:8765/web-studiya/kontekstnaya-reklama/google-ads';
const CITIES = ['almaty', 'shymkent', 'karaganda', 'aktobe'];
const VIEWS = [
  { w: 430, h: 932 },
  { w: 768, h: 1024 },
];

const MIN_TOUCH = 24;

function urlFor(city) {
  return `${BASE}/${city}/`;
}

async function shot(page, name) {
  const file = path.join(SHOTS, `${name}.png`);
  await page.screenshot({ path: file, fullPage: false });
  return file;
}

async function runOne(page, city, w, h) {
  const tag = `${city}-${w}`;
  const out = {
    city,
    viewport: `${w}x${h}`,
    ok: true,
    errors: [],
    warnings: [],
    hScroll: null,
    overflowEls: [],
    tinyTargets: [],
    h1Wrap: null,
    sections: {},
  };

  await page.setViewportSize({ width: w, height: h });
  const resp = await page.goto(urlFor(city), { waitUntil: 'load', timeout: 60000 });
  if (!resp || resp.status() >= 400) {
    out.ok = false;
    out.errors.push(`HTTP ${resp?.status()}`);
    return out;
  }
  await page.waitForTimeout(700);

  out.hScroll = await page.evaluate(() => {
    const doc = document.documentElement;
    const body = document.body;
    const sw = Math.max(doc.scrollWidth, body?.scrollWidth || 0);
    const cw = doc.clientWidth;
    const overflowing = [...document.querySelectorAll('body *')]
      .filter((el) => {
        const r = el.getBoundingClientRect();
        return r.width > 0 && el.scrollWidth > el.clientWidth + 2 && r.right > cw + 1;
      })
      .slice(0, 8)
      .map((el) => ({
        tag: el.tagName,
        cls: (el.className || '').toString().slice(0, 80),
        sw: el.scrollWidth,
        cw: el.clientWidth,
      }));
    return { scrollWidth: sw, clientWidth: cw, overflow: sw - cw, overflowing };
  });
  if (out.hScroll.overflow > 1) {
    out.ok = false;
    out.errors.push(`h-scroll overflow=${out.hScroll.overflow}`);
  }
  out.overflowEls = out.hScroll.overflowing;

  out.h1Wrap = await page.evaluate(() => {
    const h1 = document.querySelector('main h1');
    if (!h1) return null;
    const s = getComputedStyle(h1);
    const r = h1.getBoundingClientRect();
    return {
      text: h1.textContent.trim(),
      height: Math.round(r.height),
      width: Math.round(r.width),
      overflow: h1.scrollWidth - h1.clientWidth,
      whiteSpace: s.whiteSpace,
      overflowX: s.overflowX,
    };
  });
  if (out.h1Wrap && out.h1Wrap.overflow > 2) {
    out.ok = false;
    out.errors.push(`H1 overflow ${out.h1Wrap.overflow}`);
  }

  const ids = ['ctx-hero', 'audience', 'campaign-types', 'pricing', 'faq', 'contacts'];
  for (const id of ids) {
    const loc = page.locator(`#${id}`).first();
    const count = await loc.count();
    out.sections[id] = count > 0;
    if (count > 0) {
      await loc.scrollIntoViewIfNeeded();
      await page.waitForTimeout(120);
      await shot(page, `${tag}-${id}`);
    } else {
      out.warnings.push(`missing #${id}`);
    }
  }

  // breadcrumbs + header
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(80);
  await shot(page, `${tag}-top`);

  // footer is injected by home-clean.js; fall back to contacts
  const footer = page.locator('footer, .rk-footer').first();
  try {
    await footer.waitFor({ state: 'attached', timeout: 8000 });
    await footer.scrollIntoViewIfNeeded();
    await page.waitForTimeout(80);
    await shot(page, `${tag}-footer`);
    out.footer = { injected: true };
  } catch {
    await page.locator('#contacts').first().scrollIntoViewIfNeeded();
    await page.waitForTimeout(80);
    await shot(page, `${tag}-footer`);
    out.footer = { injected: false };
    out.warnings.push('footer not injected in time; shot contacts');
  }

  // sticky CTA at 430
  out.sticky = await page.evaluate(() => {
    const el = document.querySelector('.rk-sticky-cta, [class*="sticky"]');
    if (!el) return { found: false };
    const s = getComputedStyle(el);
    const r = el.getBoundingClientRect();
    return {
      found: true,
      cls: (el.className || '').toString().slice(0, 60),
      display: s.display,
      visibility: s.visibility,
      bottom: Math.round(r.bottom),
      height: Math.round(r.height),
      visible: r.height > 0 && s.display !== 'none' && s.visibility !== 'hidden',
    };
  });

  // menu
  const burger = page.locator('[data-rk-menu-toggle], .rk-burger, button.rk-nav__toggle, .rk-header__burger, [aria-label*="меню" i], [aria-label*="Menu" i]').first();
  out.menu = { found: (await burger.count()) > 0, opened: false };
  if (out.menu.found && w < 1024) {
    await page.evaluate(() => window.scrollTo(0, 0));
    await burger.click({ force: true }).catch(() => {});
    await page.waitForTimeout(250);
    const navOpen = await page.evaluate(() => {
      const nav = document.querySelector('.rk-nav.is-open, .rk-mobile-nav.is-open, [data-rk-nav].is-open, .rk-header.is-open');
      const drawer = document.querySelector('.rk-drawer, .rk-menu-panel, .rk-nav--mobile');
      return {
        headerOpen: !!document.querySelector('header.is-open, .rk-header.is-open, body.nav-open'),
        navClass: (document.querySelector('nav')?.className || '').toString().slice(0, 80),
        visibleDrawer: drawer ? getComputedStyle(drawer).display !== 'none' : false,
      };
    });
    out.menu.opened = !!(navOpen.headerOpen || navOpen.visibleDrawer);
    await shot(page, `${tag}-menu`);
    await page.keyboard.press('Escape').catch(() => {});
    await burger.click({ force: true }).catch(() => {});
    await page.waitForTimeout(150);
  }

  // FAQ expand
  const faqBtn = page.locator('[data-gads-faq-btn]').first();
  if ((await faqBtn.count()) > 0) {
    await faqBtn.scrollIntoViewIfNeeded();
    await faqBtn.click();
    await page.waitForTimeout(200);
    out.faq = {
      expanded: await faqBtn.getAttribute('aria-expanded'),
    };
    if (out.faq.expanded !== 'true') {
      out.ok = false;
      out.errors.push('FAQ did not expand');
    }
    await shot(page, `${tag}-faq-open`);
  } else {
    out.ok = false;
    out.errors.push('FAQ button missing');
  }

  // popup
  await page.evaluate(() => window.scrollTo(0, 0));
  const openBtn = page.locator('[data-rk-open-modal="rk-modal-lead"]').first();
  if ((await openBtn.count()) > 0) {
    await openBtn.click();
    await page.waitForTimeout(280);
    const modal = page.locator('#rk-modal-lead');
    const visible = await modal.isVisible().catch(() => false);
    out.popup = { visible };
    if (!visible) {
      out.ok = false;
      out.errors.push('popup not visible');
    }
    await shot(page, `${tag}-popup`);
    await page.keyboard.press('Escape');
    await page.waitForTimeout(150);
  } else {
    out.ok = false;
    out.errors.push('popup opener missing');
  }

  // contacts form still present
  out.form = await page.evaluate(() => {
    const form = document.querySelector('form[data-lead-form]');
    if (!form) return { found: false };
    const labels = form.querySelectorAll('label').length;
    const required = form.querySelectorAll('[required]').length;
    const consent = !!form.querySelector('[name="consent"], [name="agreement"], input[type="checkbox"]');
    const honey = !!form.querySelector('[name="website"], .rk-hp, [name="hp"], [autocomplete="off"][tabindex="-1"]');
    return { found: true, name: form.getAttribute('name'), labels, required, consent, honey };
  });
  if (!out.form.found) {
    out.ok = false;
    out.errors.push('lead form missing');
  }

  // touch targets: buttons, FAQ, CTA, nav
  out.tinyTargets = await page.evaluate((min) => {
    const sel = 'a, button, [role="button"], input, label, .ctx-btn, .gads-faq__btn';
    const tooSmall = [];
    for (const el of document.querySelectorAll(sel)) {
      const r = el.getBoundingClientRect();
      const s = getComputedStyle(el);
      if (s.display === 'none' || s.visibility === 'hidden' || r.width === 0 || r.height === 0) continue;
      if (r.width < min && r.height < min) {
        tooSmall.push({
          tag: el.tagName,
          text: (el.textContent || '').trim().slice(0, 40),
          w: Math.round(r.width),
          h: Math.round(r.height),
        });
      }
    }
    return tooSmall.slice(0, 12);
  }, MIN_TOUCH);
  if (out.tinyTargets.length) {
    out.warnings.push(`tiny targets: ${out.tinyTargets.length}`);
  }

  // campaign cards present
  out.cards = await page.evaluate(() => ({
    camp: document.querySelectorAll('.gads-camp, .gads-card').length,
    price: !!document.querySelector('#pricing, .gads-price, [class*="price"]'),
  }));

  return out;
}

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage();
const results = [];
for (const city of CITIES) {
  for (const v of VIEWS) {
    results.push(await runOne(page, city, v.w, v.h));
  }
}
await browser.close();

const summary = {
  measuredAt: new Date().toISOString(),
  results,
  failCount: results.filter((r) => !r.ok).length,
};
fs.writeFileSync(path.join(__dirname, 'visual-430-768.json'), JSON.stringify(summary, null, 2));
console.log(JSON.stringify({ failCount: summary.failCount, n: results.length }, null, 2));
for (const r of results) {
  console.log(`${r.city} ${r.viewport} ok=${r.ok} hScroll=${r.hScroll?.overflow} errors=${r.errors.join('|') || '-'} warn=${r.warnings.join('|') || '-'}`);
}
