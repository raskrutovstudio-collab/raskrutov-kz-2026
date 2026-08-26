import fs from 'fs';
import path from 'path';
import { chromium } from 'playwright';

const base = 'http://127.0.0.1:8765/web-studiya/kontekstnaya-reklama/yandex-direct/astana/';
const outDir = 'site_mirror/_work/yd-astana-pilot-qa';
fs.mkdirSync(outDir, { recursive: true });

const viewports = [
  { name: '390', width: 390, height: 844 },
  { name: '430', width: 430, height: 932 },
  { name: '768', width: 768, height: 1024 },
  { name: '1440', width: 1440, height: 900 },
];

const browser = await chromium.launch({ headless: true });
const report = { pages: [], functional: {}, errors: [] };

for (const vp of viewports) {
  const context = await browser.newContext({
    viewport: { width: vp.width, height: vp.height },
    deviceScaleFactor: vp.width <= 430 ? 2 : 1,
  });
  const page = await context.newPage();
  const pageErrors = [];
  page.on('pageerror', (e) => pageErrors.push(String(e.message || e)));
  const failed = [];
  page.on('response', (r) => {
    if (r.status() >= 400 && r.url().includes('127.0.0.1:8765')) failed.push({ url: r.url(), status: r.status() });
  });
  await page.goto(base, { waitUntil: 'networkidle', timeout: 60000 });
  await page.waitForTimeout(800);
  const metrics = await page.evaluate(() => {
    const h1 = document.querySelector('h1');
    return {
      title: document.title,
      h1: h1 ? h1.textContent.trim() : null,
      canonical: document.querySelector('link[rel=canonical]')?.href || null,
      ydCritical: !!document.getElementById('yd-critical'),
      hOverflow: document.documentElement.scrollWidth > window.innerWidth + 1,
      scrollW: document.documentElement.scrollWidth,
      innerW: window.innerWidth,
      mottor: !!document.querySelector('[class*="public.bundle"], script[src*="public.bundle"]') || /public\.bundle/.test(document.documentElement.innerHTML),
      homeMedia: [...document.querySelectorAll('link[rel=stylesheet]')].find((l) => l.href.includes('home-clean'))?.media || null,
    };
  });
  const shot = path.join(outDir, `astana-${vp.name}.png`);
  await page.screenshot({ path: shot, fullPage: true });
  // clips on first and last
  if (vp.name === '390' || vp.name === '1440') {
    for (const [sel, label] of [
      ['#ctx-hero', 'hero'],
      ['#local-config', 'local-config'],
      ['#pricing', 'pricing'],
      ['#faq', 'faq'],
      ['#contacts', 'contacts'],
    ]) {
      const el = await page.$(sel);
      if (el) await el.screenshot({ path: path.join(outDir, `astana-${vp.name}-${label}.png`) });
    }
  }
  report.pages.push({ vp: vp.name, metrics, pageErrors, failed404: failed, shot });
  await context.close();
}

// Functional on 390
{
  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 });
  const page = await context.newPage();
  await page.goto(base, { waitUntil: 'networkidle' });
  // FAQ
  const faqBtn = page.locator('[data-yd-faq-btn]').first();
  await faqBtn.click();
  const expanded = await faqBtn.getAttribute('aria-expanded');
  // Modal
  await page.locator('[data-rk-open-modal="rk-modal-lead"]').first().click({ force: true });
  await page.waitForTimeout(300);
  const modalOpen = await page.evaluate(() => {
    const m = document.querySelector('#rk-modal-lead');
    return m && !m.hasAttribute('hidden') && getComputedStyle(m).display !== 'none';
  });
  await page.keyboard.press('Escape');
  await page.waitForTimeout(200);
  const modalClosed = await page.evaluate(() => {
    const m = document.querySelector('#rk-modal-lead');
    return !m || m.hasAttribute('hidden') || getComputedStyle(m).display === 'none';
  });
  // Form validation
  const validation = await page.evaluate(() => {
    const open = document.querySelector('[data-rk-open-modal="rk-modal-lead"]');
    open && open.click();
    const f = document.querySelector('#rk-form-popup-yd-astana');
    const phone = f.querySelector('input[name=phone]');
    phone.value = '';
    const ok = f.reportValidity();
    return { reportValidity: ok, phoneRequired: phone.required, phoneValid: phone.validity.valid };
  });
  await page.keyboard.press('Escape');
  const contacts = await page.evaluate(() => ({
    tel: document.querySelector('a[href^="tel:"]')?.href || null,
    mail: document.querySelector('a[href^="mailto:"]')?.href || null,
    wa: document.querySelector('a[href*="wa.me"]')?.href || null,
  }));
  report.functional = { expanded, modalOpen, modalClosed, validation, contacts };
  await context.close();
}

await browser.close();
fs.writeFileSync(path.join(outDir, 'qa-report.json'), JSON.stringify(report, null, 2));
console.log(JSON.stringify(report, null, 2));
