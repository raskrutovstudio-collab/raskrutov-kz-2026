import { chromium } from 'playwright';
import fs from 'node:fs';
import path from 'node:path';

const ORIGIN = process.env.QA_ORIGIN || 'http://127.0.0.1:8791';
const SLUG = process.env.QA_SLUG || 'karaganda';
const URL = ORIGIN + '/web-studiya/kontekstnaya-reklama/yandex-direct/' + SLUG + '/';
const OUT = path.resolve('site_mirror/_work/yandex-direct-regional-scale/karaganda');
fs.mkdirSync(OUT, { recursive: true });

const VIEWPORTS = [
  { w: 390, h: 844, mobile: true },
  { w: 430, h: 932, mobile: true },
  { w: 768, h: 1024, mobile: true },
  { w: 1440, h: 900, mobile: false }
];

const report = {};
const CHROME = process.env.QA_CHROME || 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const browser = fs.existsSync(CHROME)
  ? await chromium.launch({ executablePath: CHROME })
  : await chromium.launch({ channel: 'chrome' });

for (const vp of VIEWPORTS) {
  const ctx = await browser.newContext({
    viewport: { width: vp.w, height: vp.h },
    deviceScaleFactor: 1,
    isMobile: vp.mobile,
    hasTouch: vp.mobile,
    userAgent: vp.mobile
      ? 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1'
      : undefined
  });
  const page = await ctx.newPage();
  const consoleErrors = [];
  const failedRequests = [];
  page.on('console', (m) => { if (m.type() === 'error') consoleErrors.push(m.text()); });
  page.on('pageerror', (e) => consoleErrors.push('pageerror: ' + e.message));
  page.on('response', (r) => { if (r.status() >= 400) failedRequests.push(r.status() + ' ' + r.url()); });

  const resp = await page.goto(URL, { waitUntil: 'networkidle' });
  // QA-only override: mobile CSS uses content-visibility:auto, which leaves
  // off-screen sections unrendered and makes geometry/screenshots meaningless.
  await page.addStyleTag({ content: '*, *::before, *::after { content-visibility: visible !important; contain-intrinsic-size: none !important; }' });
  await page.evaluate(async () => {
    document.querySelectorAll('img[loading="lazy"]').forEach((i) => i.setAttribute('loading', 'eager'));
    const step = window.innerHeight;
    for (let y = 0; y < document.documentElement.scrollHeight; y += step) {
      window.scrollTo(0, y);
      await new Promise((r) => setTimeout(r, 80));
    }
    window.scrollTo(0, 0);
    await new Promise((r) => setTimeout(r, 300));
  });
  await page.waitForTimeout(600);

  const data = await page.evaluate(() => {
    const vw = window.innerWidth;
    const de = document.documentElement;
    const overflow = de.scrollWidth - vw;

    const offenders = [];
    document.querySelectorAll('body *').forEach((el) => {
      const r = el.getBoundingClientRect();
      if (r.width === 0 && r.height === 0) return;
      const cs = getComputedStyle(el);
      if (cs.position === 'fixed' || cs.display === 'none' || cs.visibility === 'hidden') return;
      const right = r.left + window.scrollX + r.width;
      if (right > vw + 1) {
        offenders.push({
          sel: el.tagName.toLowerCase() + (el.className && typeof el.className === 'string' ? '.' + el.className.trim().split(/\s+/).join('.') : ''),
          right: Math.round(right), w: Math.round(r.width)
        });
      }
    });

    // geometry sanity on repeated components
    const groups = {
      'yd-card': '.yd-card',
      'yd-camp': '.yd-camp',
      'yd-artifact': '.yd-artifact',
      'scope-item': '.yd-scope-list__item',
      'decision-card': '.yd-decision__card',
      'timeline-item': '.yd-timeline__item',
      'faq-item': '.yd-faq__item',
      'trust-item': '.ctx-trust__item'
    };
    const geometry = {};
    const narrow = [];
    const zeroBox = [];
    const tallThin = [];
    for (const [k, sel] of Object.entries(groups)) {
      const nodes = [...document.querySelectorAll(sel)];
      geometry[k] = { count: nodes.length, widths: [], heights: [] };
      nodes.forEach((n, i) => {
        const r = n.getBoundingClientRect();
        geometry[k].widths.push(Math.round(r.width));
        geometry[k].heights.push(Math.round(r.height));
        if (r.width <= 0 || r.height <= 0) zeroBox.push(k + '[' + i + ']');
        const parentW = n.parentElement ? n.parentElement.getBoundingClientRect().width : 0;
        // content children ratio
        [...n.children].forEach((c, ci) => {
          const cr = c.getBoundingClientRect();
          const txt = (c.textContent || '').trim();
          if (txt.length > 25 && cr.width > 0 && r.width > 0 && cr.width / r.width < 0.45) {
            narrow.push({ group: k, idx: i, child: ci, ratio: +(cr.width / r.width).toFixed(2), w: Math.round(cr.width), parent: Math.round(r.width) });
          }
        });
        // excessive wrapping heuristic: many lines for few words
        const p = n.querySelector('p');
        if (p) {
          const pr = p.getBoundingClientRect();
          const lh = parseFloat(getComputedStyle(p).lineHeight) || 20;
          const lines = Math.round(pr.height / lh);
          const words = (p.textContent || '').trim().split(/\s+/).length;
          if (lines > 0 && words / lines < 1.6 && words > 6) {
            tallThin.push({ group: k, idx: i, words, lines, w: Math.round(pr.width) });
          }
        }
        if (parentW) { /* keep parentW referenced */ }
      });
    }

    const h1 = document.querySelector('h1');
    const h1r = h1 ? h1.getBoundingClientRect() : null;
    const header = document.querySelector('header');
    const terminal = document.querySelector('footer') || document.querySelector('#contacts');
    const tr = terminal ? terminal.getBoundingClientRect() : null;

    // overlap check on key sections
    const secs = [...document.querySelectorAll('main section')];
    const overlaps = [];
    for (let i = 0; i < secs.length - 1; i++) {
      const a = secs[i].getBoundingClientRect();
      const b = secs[i + 1].getBoundingClientRect();
      if (b.top + window.scrollY < a.top + window.scrollY + a.height - 2) {
        overlaps.push((secs[i].id || i) + ' / ' + (secs[i + 1].id || (i + 1)));
      }
    }

    // touch targets
    const smallTargets = [];
    document.querySelectorAll('a, button, input[type="submit"]').forEach((el) => {
      const r = el.getBoundingClientRect();
      if (r.width === 0 && r.height === 0) return;
      if (getComputedStyle(el).display === 'none') return;
      if (r.height < 24 || r.width < 24) {
        smallTargets.push({ sel: el.tagName.toLowerCase() + '.' + (typeof el.className === 'string' ? el.className.trim().split(/\s+/)[0] : ''), h: Math.round(r.height), w: Math.round(r.width), text: (el.textContent || '').trim().slice(0, 30) });
      }
    });

    const imgs = [...document.querySelectorAll('img')].map((i) => ({
      src: i.getAttribute('src'), alt: i.getAttribute('alt'), complete: i.complete, nw: i.naturalWidth
    }));

    return {
      vw, scrollWidth: de.scrollWidth, overflow,
      offenders: offenders.slice(0, 15),
      h1: h1 ? h1.textContent.trim() : null,
      h1Visible: !!(h1r && h1r.width > 0 && h1r.height > 0),
      h1Lines: h1r ? Math.round(h1r.height / (parseFloat(getComputedStyle(h1).lineHeight) || 30)) : 0,
      headerVisible: !!header,
      terminalId: terminal ? (terminal.tagName.toLowerCase() + (terminal.id ? '#' + terminal.id : '')) : null,
      terminalVisible: !!(tr && tr.height > 0),
      docHeight: de.scrollHeight,
      geometry, narrow, zeroBox, tallThin, overlaps,
      smallTargets: smallTargets.slice(0, 10),
      brokenImages: imgs.filter((i) => !i.complete || i.nw === 0),
      imagesMissingAlt: imgs.filter((i) => i.alt === null).length
    };
  });

  const shot = path.join(OUT, `${SLUG}-${vp.w}.png`);
  await page.screenshot({ path: shot, fullPage: true });

  report[vp.w] = {
    status: resp.status(),
    screenshot: shot.replace(/\\/g, '/'),
    consoleErrors,
    failedRequests,
    ...data
  };
  await ctx.close();
}

await browser.close();
fs.writeFileSync(path.join(OUT, `viewport-qa${SLUG === 'karaganda' ? '' : '-' + SLUG}.json`), JSON.stringify(report, null, 2));

for (const [w, r] of Object.entries(report)) {
  console.log(`\n=== ${w}px ===`);
  console.log('status', r.status, '| overflow', r.overflow, '| docHeight', r.docHeight);
  console.log('h1', JSON.stringify(r.h1), 'visible', r.h1Visible, 'lines', r.h1Lines);
  console.log('terminal', r.terminalId, r.terminalVisible);
  console.log('offenders', r.offenders.length, JSON.stringify(r.offenders.slice(0, 4)));
  console.log('narrow', r.narrow.length, JSON.stringify(r.narrow.slice(0, 4)));
  console.log('tallThin', r.tallThin.length, JSON.stringify(r.tallThin.slice(0, 4)));
  console.log('zeroBox', r.zeroBox.length, 'overlaps', r.overlaps.length);
  console.log('smallTargets', r.smallTargets.length, JSON.stringify(r.smallTargets.slice(0, 4)));
  console.log('consoleErrors', r.consoleErrors.length, JSON.stringify(r.consoleErrors.slice(0, 3)));
  console.log('failedRequests', r.failedRequests.length, JSON.stringify(r.failedRequests.slice(0, 5)));
  console.log('brokenImages', r.brokenImages.length, 'imgMissingAlt', r.imagesMissingAlt);
  console.log('counts', JSON.stringify(Object.fromEntries(Object.entries(r.geometry).map(([k, v]) => [k, v.count]))));
}
