const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const URL = 'http://127.0.0.1:4173/web-studiya/kontekstnaya-reklama/google-ads/';
const OUT = path.join(process.cwd(), '.lh-tmp');
const VIEWPORTS = [360, 390, 430, 1440];

function isMetrikaNoise(text) {
  if (!text) return false;
  const t = String(text).toLowerCase();
  return t.includes('mc.yandex') || t.includes('metrika') || t.includes('yandex.ru/metrika') || t.includes('tag.js');
}

async function main() {
  if (!fs.existsSync(OUT)) fs.mkdirSync(OUT, { recursive: true });

  const results = {
    horizontalScroll: {},
    screenshots: {},
    modalForm: {},
    contactsForm: {},
    consoleErrors: { pass: true, errors: [] },
    mobileMenu: {},
  };

  const browser = await chromium.launch({ headless: true, channel: 'chrome' });
  const context = await browser.newContext();
  const page = await context.newPage();

  const consoleErrors = [];
  page.on('console', (msg) => {
    if (msg.type() !== 'error') return;
    const text = msg.text();
    if (isMetrikaNoise(text)) return;
    consoleErrors.push({ kind: 'console', text });
  });
  page.on('pageerror', (err) => {
    const text = err.message || String(err);
    if (isMetrikaNoise(text)) return;
    consoleErrors.push({ kind: 'pageerror', text });
  });

  // Intercept lead submit endpoints
  await page.route('**/*', async (route) => {
    const req = route.request();
    const u = req.url().toLowerCase();
    const method = req.method();
    if (method === 'POST' && (u.includes('submit-lead') || u.includes('supabase') || u.includes('/functions/v1/') || u.includes('resend'))) {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ ok: true, success: true }),
      });
      return;
    }
    await route.continue();
  });

  // 1) Viewports horizontal scroll + screenshots
  for (const w of VIEWPORTS) {
    const h = w >= 1440 ? 900 : 800;
    await page.setViewportSize({ width: w, height: h });
    const resp = await page.goto(URL, { waitUntil: 'domcontentloaded', timeout: 60000 });
    await page.waitForTimeout(800);
    const metrics = await page.evaluate(() => {
      const de = document.documentElement;
      return {
        scrollWidth: de.scrollWidth,
        clientWidth: de.clientWidth,
        ok: de.scrollWidth <= de.clientWidth + 1,
      };
    });
    const shot = path.join(OUT, `gads-qa-${w}.png`);
    await page.screenshot({ path: shot, fullPage: false, clip: { x: 0, y: 0, width: w, height: h } });
    results.horizontalScroll[w] = {
      pass: metrics.ok,
      scrollWidth: metrics.scrollWidth,
      clientWidth: metrics.clientWidth,
      status: resp ? resp.status() : null,
    };
    results.screenshots[w] = { pass: fs.existsSync(shot), path: shot };
  }

  // 2) Modal at 390
  await page.setViewportSize({ width: 390, height: 800 });
  await page.goto(URL, { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.waitForTimeout(500);

  const openBtn = page.locator('[data-rk-open-modal="rk-modal-lead"]');
  const openCount = await openBtn.count();
  results.modalForm.openButtonFound = openCount > 0;
  if (openCount > 0) {
    await openBtn.first().click();
    await page.waitForTimeout(400);
  }

  const popup = page.locator('#rk-form-popup-gads');
  const popupVisible = await popup.isVisible().catch(() => false);
  results.modalForm.popupVisible = { pass: popupVisible };

  if (popupVisible) {
    const emptyValidity = await popup.evaluate((form) => {
      if (typeof form.reset === 'function') {
        // leave empty
      }
      const phone = form.querySelector('input[type="tel"], input[name*="phone"], input[name*="tel"]');
      const consent = form.querySelector('input[type="checkbox"]');
      if (phone) phone.value = '';
      if (consent) consent.checked = false;
      return {
        checkValidity: form.checkValidity(),
        phoneValidationMessage: phone ? phone.validationMessage : null,
        consentValidationMessage: consent ? consent.validationMessage : null,
      };
    });
    results.modalForm.emptyInvalid = {
      pass: emptyValidity.checkValidity === false,
      detail: emptyValidity,
    };

    // Fill phone + consent, checkValidity true, then submit with mock
    const filled = await popup.evaluate((form) => {
      const phone = form.querySelector('input[type="tel"], input[name*="phone"], input[name*="tel"]');
      const consent = form.querySelector('input[type="checkbox"]');
      const name = form.querySelector('input[name*="name"], input[autocomplete="name"]');
      if (name) name.value = 'QA Test';
      if (phone) {
        phone.value = '+77001234567';
        phone.dispatchEvent(new Event('input', { bubbles: true }));
        phone.dispatchEvent(new Event('change', { bubbles: true }));
      }
      if (consent) {
        consent.checked = true;
        consent.dispatchEvent(new Event('change', { bubbles: true }));
      }
      return {
        checkValidity: form.checkValidity(),
        phone: phone ? phone.value : null,
        consent: consent ? consent.checked : null,
      };
    });
    results.modalForm.filledValid = {
      pass: filled.checkValidity === true,
      detail: filled,
    };

    // Click submit
    const submitBtn = popup.locator('button[type="submit"], input[type="submit"]').first();
    await submitBtn.click();
    await page.waitForTimeout(1200);

    const successText = await page.evaluate(() => {
      const root = document.querySelector('#rk-form-popup-gads')?.closest('[data-rk-modal], .rk-modal, #rk-modal-lead') || document.body;
      const txt = (root.innerText || '').toLowerCase();
      const patterns = ['спасибо', 'отправлен', 'заявк', 'успеш', 'thank', 'success', 'мы свяжемся', 'принят'];
      const hit = patterns.find((p) => txt.includes(p));
      // also look for status elements
      const statusEl = document.querySelector('#rk-form-popup-gads [data-rk-form-status], #rk-form-popup-gads .rk-form-status, #rk-form-popup-gads .form-status, [data-rk-status]');
      return {
        hit: hit || null,
        statusText: statusEl ? statusEl.textContent.trim() : null,
        bodySnippet: (root.innerText || '').slice(0, 400),
      };
    });
    results.modalForm.successAfterMockSubmit = {
      pass: !!(successText.hit || (successText.statusText && /спасибо|отправлен|успеш|заявк|свяжем/i.test(successText.statusText))),
      detail: successText,
    };

    // Re-open modal and check submit enabled
    // close if possible
    await page.evaluate(() => {
      const close = document.querySelector('[data-rk-close-modal], .rk-modal-close, [aria-label*="Закрыть"], [aria-label*="Close"]');
      if (close) close.click();
      document.querySelectorAll('.rk-modal.is-open, [data-rk-modal].is-open, #rk-modal-lead.open').forEach((el) => {
        el.classList.remove('is-open', 'open', 'active');
        el.setAttribute('aria-hidden', 'true');
        el.hidden = true;
      });
      document.body.classList.remove('rk-modal-open', 'modal-open');
    });
    await page.waitForTimeout(300);
    await openBtn.first().click();
    await page.waitForTimeout(400);
    const reOpen = await page.evaluate(() => {
      const form = document.querySelector('#rk-form-popup-gads');
      const btn = form && form.querySelector('button[type="submit"], input[type="submit"]');
      const visible = !!(form && (form.offsetParent !== null || getComputedStyle(form).visibility !== 'hidden'));
      return {
        formVisible: visible,
        buttonDisabled: btn ? !!(btn.disabled || btn.getAttribute('aria-disabled') === 'true') : null,
        buttonEnabled: btn ? !(btn.disabled || btn.getAttribute('aria-disabled') === 'true') : false,
      };
    });
    results.modalForm.reopenSubmitEnabled = {
      pass: reOpen.formVisible && reOpen.buttonEnabled === true,
      detail: reOpen,
    };
  } else {
    results.modalForm.emptyInvalid = { pass: false, detail: 'popup not visible' };
    results.modalForm.filledValid = { pass: false, detail: 'popup not visible' };
    results.modalForm.successAfterMockSubmit = { pass: false, detail: 'popup not visible' };
    results.modalForm.reopenSubmitEnabled = { pass: false, detail: 'popup not visible' };
  }

  // 3) Contacts form
  const contacts = page.locator('#rk-form-contacts-gads');
  const contactsExists = (await contacts.count()) > 0;
  results.contactsForm.exists = contactsExists;
  if (contactsExists) {
    await contacts.first().scrollIntoViewIfNeeded();
    const emptyC = await contacts.evaluate((form) => {
      const phone = form.querySelector('input[type="tel"], input[name*="phone"], input[name*="tel"]');
      const consent = form.querySelector('input[type="checkbox"]');
      if (phone) phone.value = '';
      if (consent) consent.checked = false;
      return { checkValidity: form.checkValidity() };
    });
    results.contactsForm.emptyInvalid = { pass: emptyC.checkValidity === false, detail: emptyC };

    const filledC = await contacts.evaluate((form) => {
      const phone = form.querySelector('input[type="tel"], input[name*="phone"], input[name*="tel"]');
      const consent = form.querySelector('input[type="checkbox"]');
      const name = form.querySelector('input[name*="name"], input[autocomplete="name"]');
      if (name) name.value = 'QA Test';
      if (phone) {
        phone.value = '+77001234567';
        phone.dispatchEvent(new Event('input', { bubbles: true }));
      }
      if (consent) {
        consent.checked = true;
        consent.dispatchEvent(new Event('change', { bubbles: true }));
      }
      return { checkValidity: form.checkValidity(), phone: phone && phone.value, consent: consent && consent.checked };
    });
    results.contactsForm.filledValid = { pass: filledC.checkValidity === true, detail: filledC };
  } else {
    results.contactsForm.emptyInvalid = { pass: false, detail: 'form missing' };
    results.contactsForm.filledValid = { pass: false, detail: 'form missing' };
  }

  // 5) Mobile menu at 390
  await page.setViewportSize({ width: 390, height: 800 });
  await page.goto(URL, { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.waitForTimeout(400);
  const menuResult = await page.evaluate(async () => {
    const candidates = [
      '[data-rk-nav-toggle]',
      '.rk-nav-toggle',
      '.nav-toggle',
      'button.menu-toggle',
      '[aria-controls*="nav"]',
      'button[aria-label*="еню"]',
      'button[aria-label*="Menu"]',
      '.hamburger',
      '#nav-toggle',
    ];
    let toggle = null;
    for (const sel of candidates) {
      const el = document.querySelector(sel);
      if (el) { toggle = el; break; }
    }
    if (!toggle) {
      // fallback: header button that is not phone/cta
      const btns = [...document.querySelectorAll('header button, .header button, .site-header button')];
      toggle = btns.find((b) => /menu|меню|nav/i.test((b.getAttribute('aria-label') || '') + b.className + b.id)) || null;
    }
    if (!toggle) return { found: false };

    const before = {
      ariaExpanded: toggle.getAttribute('aria-expanded'),
      bodyClass: document.body.className,
    };
    toggle.click();
    await new Promise((r) => setTimeout(r, 350));
    const nav = document.querySelector('nav, [data-rk-nav], .rk-nav, .mobile-nav, #mobile-nav, .site-nav');
    const after = {
      ariaExpanded: toggle.getAttribute('aria-expanded'),
      bodyClass: document.body.className,
      navHidden: nav ? (nav.hasAttribute('hidden') || nav.getAttribute('aria-hidden') === 'true' || getComputedStyle(nav).display === 'none' || getComputedStyle(nav).visibility === 'hidden') : null,
      navClass: nav ? nav.className : null,
    };
    const opened =
      after.ariaExpanded === 'true' ||
      /open|active|is-open|nav-open|menu-open/i.test(after.bodyClass + ' ' + (after.navClass || '')) ||
      after.navHidden === false;
    // toggle back
    toggle.click();
    await new Promise((r) => setTimeout(r, 250));
    const afterCloseExpanded = toggle.getAttribute('aria-expanded');
    return { found: true, before, after, opened, afterCloseExpanded, toggleTag: toggle.tagName, toggleClass: toggle.className };
  });
  results.mobileMenu = {
    pass: !!(menuResult.found && menuResult.opened),
    detail: menuResult,
  };

  results.consoleErrors.errors = consoleErrors;
  results.consoleErrors.pass = consoleErrors.length === 0;

  // Aggregate
  const checks = {
    '1a_horizontal_360': results.horizontalScroll[360]?.pass,
    '1a_horizontal_390': results.horizontalScroll[390]?.pass,
    '1a_horizontal_430': results.horizontalScroll[430]?.pass,
    '1a_horizontal_1440': results.horizontalScroll[1440]?.pass,
    '1b_screenshots': VIEWPORTS.every((w) => results.screenshots[w]?.pass),
    '2a_modal_visible': results.modalForm.popupVisible?.pass,
    '2b_modal_empty_invalid': results.modalForm.emptyInvalid?.pass,
    '2c_modal_filled_valid': results.modalForm.filledValid?.pass,
    '2d_modal_mock_success': results.modalForm.successAfterMockSubmit?.pass,
    '2e_modal_reopen_enabled': results.modalForm.reopenSubmitEnabled?.pass,
    '3a_contacts_empty_invalid': results.contactsForm.emptyInvalid?.pass,
    '3b_contacts_filled_valid': results.contactsForm.filledValid?.pass,
    '4_console_errors': results.consoleErrors.pass,
    '5_mobile_menu': results.mobileMenu.pass,
  };

  const report = { checks, results, consoleErrors };
  const reportPath = path.join(OUT, 'gads-qa-smoke-report.json');
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2), 'utf8');
  console.log(JSON.stringify(report, null, 2));
  console.log('\nREPORT:', reportPath);

  await browser.close();
  const failed = Object.values(checks).some((v) => v !== true);
  process.exit(failed ? 1 : 0);
}

main().catch((err) => {
  console.error('SMOKE_FATAL', err);
  process.exit(2);
});

