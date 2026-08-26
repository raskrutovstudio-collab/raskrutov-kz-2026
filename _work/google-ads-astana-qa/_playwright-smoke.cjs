const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const OUT = path.resolve('site_mirror/_work/google-ads-astana-qa');
fs.mkdirSync(OUT, { recursive: true });
const URL = 'http://127.0.0.1:4180/web-studiya/kontekstnaya-reklama/google-ads/astana/';
const widths = [390, 430, 768, 1440];
const report = { url: URL, viewports: {}, metrika: {}, summary: {} };

(async () => {
  const browser = await chromium.launch({ headless: true });
  const results = [];

  for (const w of widths) {
    const page = await browser.newPage({ viewport: { width: w, height: 844 } });
    const ymCalls = [];
    await page.addInitScript(() => {
      window.__ymCalls = [];
      const wrap = () => {
        const orig = window.ym;
        window.ym = function () {
          try { window.__ymCalls.push(Array.from(arguments)); } catch (e) {}
          if (typeof orig === 'function') return orig.apply(this, arguments);
        };
      };
      wrap();
      Object.defineProperty(window, 'ym', {
        configurable: true,
        set(v) { this.__ymReal = v; wrap(); },
        get() { return function () {
          try { window.__ymCalls.push(Array.from(arguments)); } catch (e) {}
          if (typeof window.__ymReal === 'function') return window.__ymReal.apply(this, arguments);
        }; }
      });
    });

    page.on('console', msg => {
      if (msg.type() === 'error') {
        // collect later if needed
      }
    });

    await page.goto(URL, { waitUntil: 'networkidle', timeout: 60000 });
    await page.waitForTimeout(1500);

    const h1 = page.locator('h1').first();
    const h1Visible = await h1.isVisible().catch(() => false);
    const h1Text = h1Visible ? (await h1.innerText()).trim().slice(0, 120) : '';

    const overflow = await page.evaluate(() => {
      const doc = document.documentElement;
      const body = document.body;
      const sw = Math.max(doc.scrollWidth, body.scrollWidth);
      const cw = Math.max(doc.clientWidth, window.innerWidth);
      return { scrollWidth: sw, clientWidth: cw, overflowX: sw > cw + 1 };
    });

    // open modal via CTA that targets rk-modal-lead
    let modalOpen = false;
    const modalTriggers = [
      '[data-modal-open]',
      '[href="#rk-modal-lead"]',
      'a[href="#lead"]',
      'button[aria-controls="rk-modal-lead"]',
      '.rk-sticky-cta__btn',
      'a[href*="modal"]',
      'button:has-text("заявк")',
      'a:has-text("заявк")',
      'button:has-text("Заявк")',
      'a:has-text("Заявк")',
      'button:has-text("Получить")',
      'a:has-text("Получить")',
      'button:has-text("Обсудить")',
      'a:has-text("Обсудить")',
    ];
    for (const sel of modalTriggers) {
      const el = page.locator(sel).first();
      if (await el.count() && await el.isVisible().catch(() => false)) {
        await el.click({ force: true }).catch(() => {});
        await page.waitForTimeout(400);
        modalOpen = await page.locator('#rk-modal-lead').evaluate(el => {
          const st = getComputedStyle(el);
          return st.display !== 'none' && st.visibility !== 'hidden' && (el.classList.contains('is-open') || el.getAttribute('aria-hidden') === 'false' || st.opacity !== '0');
        }).catch(() => false);
        if (modalOpen) break;
      }
    }
    // also try evaluating openModal if exists
    if (!modalOpen) {
      modalOpen = await page.evaluate(() => {
        const m = document.getElementById('rk-modal-lead');
        if (!m) return false;
        m.classList.add('is-open');
        m.setAttribute('aria-hidden', 'false');
        m.style.display = 'block';
        // try click first button with data-rk-modal
        const btn = document.querySelector('[data-rk-open-modal], [data-open-modal], .js-open-modal, [aria-haspopup="dialog"]');
        if (btn) btn.click();
        const st = getComputedStyle(m);
        return st.display !== 'none';
      }).catch(() => false);
    }

    await page.screenshot({ path: path.join(OUT, `vp-${w}-modal.png`), fullPage: false });

    // close modal if open
    await page.keyboard.press('Escape').catch(() => {});
    await page.waitForTimeout(200);
    const closeBtn = page.locator('.rk-modal__close').first();
    if (await closeBtn.isVisible().catch(() => false)) await closeBtn.click().catch(() => {});

    // FAQ expand
    let faqExpanded = false;
    const faqBtn = page.locator('.gads-faq__btn').first();
    if (await faqBtn.count()) {
      await faqBtn.scrollIntoViewIfNeeded();
      await faqBtn.click();
      await page.waitForTimeout(300);
      faqExpanded = await page.evaluate(() => {
        const btn = document.querySelector('.gads-faq__btn');
        const ans = document.querySelector('.gads-faq__a');
        if (!btn) return false;
        const expanded = btn.getAttribute('aria-expanded') === 'true';
        const ansVisible = ans && getComputedStyle(ans).display !== 'none' && ans.hidden !== true;
        return expanded || !!ansVisible;
      });
    }
    await page.screenshot({ path: path.join(OUT, `vp-${w}-faq.png`), fullPage: false });

    // sticky present
    const sticky = await page.evaluate(() => {
      const el = document.querySelector('.rk-sticky-cta');
      if (!el) return { present: false };
      const st = getComputedStyle(el);
      const r = el.getBoundingClientRect();
      return {
        present: true,
        display: st.display,
        position: st.position,
        visible: st.display !== 'none' && st.visibility !== 'hidden' && r.height > 0,
        bottom: r.bottom,
        top: r.top
      };
    });

    await page.screenshot({ path: path.join(OUT, `vp-${w}-full.png`), fullPage: true });

    // metrika
    const metrika = await page.evaluate(() => {
      const calls = window.__ymCalls || [];
      const html = document.documentElement.outerHTML;
      const hasId = html.includes('101127167') || calls.some(c => String(c[0]) === '101127167');
      const initCalls = calls.filter(c => String(c[0]) === '101127167' && (c[1] === 'init' || (c[2] && c[2].webvisor)));
      const scripts = [...document.scripts].map(s => s.src || '').filter(Boolean);
      const inline = [...document.scripts].map(s => s.textContent || '').join('\n');
      const webvisor = /webvisor\s*:\s*!0|webvisor\s*:\s*true/.test(inline) || initCalls.some(c => c[2] && c[2].webvisor);
      const ymCount = (inline.match(/ym\s*\(\s*101127167/g) || []).length;
      return { callCount: calls.length, initCalls: initCalls.length, hasId, webvisor, ymCount, sample: calls.slice(0, 5) };
    });

    const row = { width: w, h1Visible, h1Text, overflow, modalOpen, faqExpanded, sticky, metrika };
    results.push(row);
    report.viewports[w] = row;
    console.log(JSON.stringify(row, null, 2));
    await page.close();
  }

  // dedicated metrika check once on 390
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  await page.goto(URL, { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.waitForTimeout(2500);
  const metrikaFinal = await page.evaluate(() => {
    const inline = [...document.scripts].map(s => s.textContent || '').join('\n');
    const ymInits = inline.match(/ym\s*\(\s*101127167\s*,\s*['\"]init['\"]/g) || [];
    const webvisor = /webvisor\s*:\s*(!:0|true)/.test(inline);
    return {
      ymInitOccurrences: ymInits.length,
      webvisor,
      counterIdPresent: inline.includes('101127167') || document.documentElement.innerHTML.includes('101127167')
    };
  });
  report.metrika = metrikaFinal;
  console.log('METRIKA_FINAL', JSON.stringify(metrikaFinal));

  report.summary = {
    allH1Visible: results.every(r => r.h1Visible),
    anyOverflow: results.some(r => r.overflow.overflowX),
    modalOk: results.every(r => r.modalOpen),
    faqOk: results.every(r => r.faqExpanded),
    stickyPresent: results.every(r => r.sticky.present),
    ymOnce: metrikaFinal.ymInitOccurrences === 1,
    webvisor: metrikaFinal.webvisor
  };
  fs.writeFileSync(path.join(OUT, 'playwright-report.json'), JSON.stringify(report, null, 2));
  console.log('SUMMARY', JSON.stringify(report.summary, null, 2));
  await browser.close();
})().catch(e => { console.error(e); process.exit(1); });
