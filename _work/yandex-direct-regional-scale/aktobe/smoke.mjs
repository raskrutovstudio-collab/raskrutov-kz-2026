import { chromium } from 'playwright';
import fs from 'node:fs';

const ORIGIN = process.env.QA_ORIGIN || 'http://127.0.0.1:8791';
const URL = ORIGIN + '/web-studiya/kontekstnaya-reklama/yandex-direct/aktobe/';
const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const browser = fs.existsSync(CHROME)
  ? await chromium.launch({ executablePath: CHROME })
  : await chromium.launch({ channel: 'chrome' });

const out = {};
const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
const page = await ctx.newPage();
const errors = [];
page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
page.on('pageerror', (e) => errors.push('pageerror: ' + e.message));

const posted = [];
await page.route('**/*', async (route) => {
  const r = route.request();
  if (r.method() === 'POST') { posted.push(r.url()); return route.fulfill({ status: 200, contentType: 'application/json', body: '{"success":true,"lead_id":"qa-mock"}' }); }
  return route.continue();
});

await page.goto(URL, { waitUntil: 'networkidle' });

// FAQ accordion
const q1 = page.locator('#yd-aktb-faq-q1');
out.faq_initial_expanded = await q1.getAttribute('aria-expanded');
await q1.click();
await page.waitForTimeout(250);
out.faq_after_click_expanded = await q1.getAttribute('aria-expanded');
out.faq_answer_visible = await page.locator('#yd-aktb-faq-a1').isVisible();
await q1.click();
await page.waitForTimeout(250);
out.faq_after_second_click = await q1.getAttribute('aria-expanded');

// Popup form
const cta = page.locator('[data-rk-open-modal]').first();
out.cta_text = (await cta.textContent() || '').trim();
await cta.click();
await page.waitForTimeout(500);
out.popup_form_visible = await page.locator('#rk-form-popup-yd-aktobe').isVisible().catch(() => false);

if (out.popup_form_visible) {
  out.popup_fields = await page.evaluate(() => {
    const f = document.querySelector('#rk-form-popup-yd-aktobe');
    return [...f.querySelectorAll('input, textarea, select')].map((el) => ({
      id: el.id, name: el.name, type: el.type, required: el.required,
      autocomplete: el.getAttribute('autocomplete'),
      label: !!(el.id && document.querySelector(`label[for="${el.id}"]`)) || !!el.getAttribute('aria-label')
    }));
  });
  await page.keyboard.press('Escape');
  await page.waitForTimeout(400);
  out.popup_closed_by_esc = !(await page.locator('#rk-form-popup-yd-aktobe').isVisible().catch(() => false));
}

// Contacts form submit
await page.locator('#contacts').scrollIntoViewIfNeeded();
await page.waitForTimeout(300);
out.contacts_fields = await page.evaluate(() => {
  const f = document.querySelector('#rk-form-contacts-yd-aktobe');
  if (!f) return null;
  return {
    action: f.getAttribute('action'), method: f.getAttribute('method'),
    source: f.querySelector('[name="source"], [name="page_source"], input[type="hidden"]')?.value || null,
    fields: [...f.querySelectorAll('input, textarea, select')].map((el) => ({
      id: el.id, name: el.name, type: el.type, required: el.required,
      autocomplete: el.getAttribute('autocomplete'),
      label: !!(el.id && document.querySelector(`label[for="${el.id}"]`)) || !!el.getAttribute('aria-label')
    })),
    submit: f.querySelector('button[type="submit"], [type="submit"]')?.textContent?.trim() || null
  };
});

// empty submit -> should not pass validation
await page.locator('#rk-form-contacts-yd-aktobe button[type="submit"], #rk-form-contacts-yd-aktobe [type="submit"]').first().click();
await page.waitForTimeout(500);
out.posted_on_empty_submit = posted.length;

await page.fill('#yd-aktb-contact-name', 'Тест QA');
await page.fill('#yd-aktb-contact-phone', '+7 (701) 234 56 78');
const agree = page.locator('#rk-form-contacts-yd-aktobe input[type="checkbox"]').first();
if (await agree.count()) await agree.check();
await page.locator('#rk-form-contacts-yd-aktobe button[type="submit"], #rk-form-contacts-yd-aktobe [type="submit"]').first().click();
await page.waitForTimeout(1200);
out.posted_after_valid_submit = posted.length;
out.posted_urls = posted;

// tel / whatsapp links
out.links = await page.evaluate(() => ({
  tel: [...document.querySelectorAll('a[href^="tel:"]')].map((a) => a.getAttribute('href')),
  wa: [...document.querySelectorAll('a[href*="wa.me"], a[href*="whatsapp"]')].map((a) => a.getAttribute('href')),
  mail: [...document.querySelectorAll('a[href^="mailto:"]')].map((a) => a.getAttribute('href'))
}));

out.metrika_loaded = await page.evaluate(() => typeof window.ym === 'function' || !!document.querySelector('script[src*="mc.yandex"]') || /101127167/.test(document.documentElement.innerHTML));
out.console_errors = errors;

console.log(JSON.stringify(out, null, 2));
await browser.close();
