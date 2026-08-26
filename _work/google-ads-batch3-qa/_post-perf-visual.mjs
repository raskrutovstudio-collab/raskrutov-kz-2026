import fs from 'node:fs';
import path from 'node:path';
import { chromium } from 'playwright';

const port = Number(process.env.PORT || 8768);
const origin = `http://127.0.0.1:${port}`;
const outDir = path.resolve('site_mirror/_work/google-ads-batch3-qa');
fs.mkdirSync(outDir, { recursive: true });

const cities = ['kyzylorda', 'pavlodar'];
const viewports = {
  390: { width: 390, height: 844 },
  1440: { width: 1440, height: 900 },
};

async function inspect(page) {
  return page.evaluate(() => {
    const issues = [];
    const docW = document.documentElement.scrollWidth;
    const vw = window.innerWidth;
    if (docW > vw + 1) issues.push(`h-scroll ${docW} > ${vw}`);

    const items = [...document.querySelectorAll('.gads-scope-list__item')];
    items.forEach((el, i) => {
      const icon = el.querySelector(':scope > .gads-scope-list__icon');
      const content = el.querySelector(':scope > div');
      if (!icon) issues.push(`scope item ${i} missing icon`);
      if (!content) issues.push(`scope item ${i} missing content div`);
      if (content) {
        const pr = el.getBoundingClientRect();
        const cr = content.getBoundingClientRect();
        if (pr.width > 0 && cr.width / pr.width < 0.45) {
          issues.push(`scope item ${i} narrow content ${Math.round(cr.width)}/${Math.round(pr.width)}`);
        }
        if (cr.width < 80) issues.push(`scope item ${i} content width ${Math.round(cr.width)}`);
      }
    });

    const marks = [...document.querySelectorAll('.gads-tasks-panel__list li')];
    marks.forEach((el, i) => {
      const mark = el.querySelector(':scope > .gads-tasks-panel__mark');
      if (!mark) issues.push(`task li ${i} missing mark`);
      const r = el.getBoundingClientRect();
      if (r.width < 120) issues.push(`task li ${i} narrow ${Math.round(r.width)}`);
    });

    const cards = [...document.querySelectorAll('.gads-card, .gads-camp, .gads-decision__card, .gads-faq__item')];
    cards.forEach((el, i) => {
      const r = el.getBoundingClientRect();
      if (r.width <= 0 || r.height <= 0) issues.push(`card ${i} empty box`);
    });

    const h1 = document.querySelector('h1');
    const lead = document.querySelector('.ctx-hero__lead');
    const header = document.querySelector('header');
    const main = document.querySelector('main');
    const contacts = document.querySelector('#contacts');
    const setup = document.querySelector('#setup');
    const pricing = document.querySelector('#management, .gads-price, [id*="price"], .gads-decision');
    if (!h1 || getComputedStyle(h1).display === 'none') issues.push('H1 missing/hidden');
    if (!header) issues.push('header missing');
    if (!main) issues.push('main missing');
    if (!contacts) issues.push('#contacts missing');
    if (!setup) issues.push('#setup missing');

    const metric = (el) => {
      if (!el) return null;
      const cs = getComputedStyle(el);
      const r = el.getBoundingClientRect();
      const lineHeight = parseFloat(cs.lineHeight) || 0;
      const lines = lineHeight > 0 ? Math.round(r.height / lineHeight) : null;
      return {
        text: (el.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 220),
        fontFamily: cs.fontFamily,
        fontWeight: cs.fontWeight,
        fontSize: cs.fontSize,
        lineHeight: cs.lineHeight,
        width: Math.round(r.width * 10) / 10,
        height: Math.round(r.height * 10) / 10,
        lines,
      };
    };

    const fonts = [...document.fonts].map((f) => ({
      family: f.family,
      weight: String(f.weight),
      status: f.status,
    }));

    return {
      scrollWidth: docW,
      innerWidth: vw,
      hScroll: Math.max(0, docW - vw),
      documentHeight: document.documentElement.scrollHeight,
      scopeItems: items.length,
      scopeIcons: document.querySelectorAll('.gads-scope-list__icon').length,
      taskLis: marks.length,
      taskMarks: document.querySelectorAll('.gads-tasks-panel__mark').length,
      cardCount: cards.length,
      hasSetup: Boolean(setup),
      hasContacts: Boolean(contacts),
      hasPricing: Boolean(pricing),
      fontsReady: document.fonts.status,
      fonts,
      h1: metric(h1),
      lead: metric(lead),
      issues,
    };
  });
}

const browser = await chromium.launch({ headless: true, channel: 'chrome' });
const report = [];

try {
  for (const city of cities) {
    const url = `${origin}/web-studiya/kontekstnaya-reklama/google-ads/${city}/`;
    const cityReport = { city, url, viewports: {} };
    for (const w of [390, 1440]) {
      const context = await browser.newContext({
        viewport: viewports[w],
        deviceScaleFactor: 1,
      });
      const page = await context.newPage();
      const errors = [];
      page.on('pageerror', (e) => errors.push(String(e)));
      await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 });
      const early = await page.evaluate(() => ({
        height: document.documentElement.scrollHeight,
        h1H: document.querySelector('h1')?.getBoundingClientRect().height || 0,
        leadH: document.querySelector('.ctx-hero__lead')?.getBoundingClientRect().height || 0,
      }));
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(800);
      await page.evaluate(() => document.fonts.ready);
      const late = await inspect(page);
      const layoutDelta = {
        documentHeightEarly: early.height,
        documentHeightLate: late.documentHeight,
        documentDelta: late.documentHeight - early.height,
        h1HeightEarly: early.h1H,
        h1HeightLate: late.h1?.height || 0,
        h1Delta: (late.h1?.height || 0) - early.h1H,
        leadHeightEarly: early.leadH,
        leadHeightLate: late.lead?.height || 0,
        leadDelta: (late.lead?.height || 0) - early.leadH,
      };

      const prefix = `${city}-${w}-post-perf`;
      const shotPath = path.join(outDir, `${prefix}.png`);
      await page.screenshot({ path: shotPath, fullPage: true, animations: 'disabled' });

      const sections = ['ctx-hero', 'setup', 'management', 'contacts'];
      for (const id of sections) {
        const loc = page.locator(`#${id}`);
        if (await loc.count()) {
          await loc.scrollIntoViewIfNeeded();
          await page.waitForTimeout(60);
          await loc.screenshot({
            path: path.join(outDir, `${prefix}-${id}.png`),
            animations: 'disabled',
          });
        }
      }

      const camps = page.locator('#campaign-types, .gads-camps, .gads-camp').first();
      if (await camps.count()) {
        await camps.scrollIntoViewIfNeeded();
        await page.waitForTimeout(60);
        await camps.screenshot({
          path: path.join(outDir, `${prefix}-cards.png`),
          animations: 'disabled',
        });
      }

      cityReport.viewports[w] = {
        screenshot: path.relative(process.cwd(), shotPath).replaceAll('\\', '/'),
        layoutDelta,
        geo: late,
        consoleErrors: errors,
      };
      await context.close();
    }
    report.push(cityReport);
  }
} finally {
  await browser.close();
}

fs.writeFileSync(path.join(outDir, 'post-perf-visual.json'), JSON.stringify(report, null, 2));
for (const c of report) {
  for (const [w, v] of Object.entries(c.viewports)) {
    const geo = v.geo;
    const fail =
      geo.issues.length ||
      geo.hScroll > 1 ||
      geo.scopeIcons < geo.scopeItems ||
      geo.taskMarks < geo.taskLis;
    console.log(
      `${c.city} ${w} hScroll=${geo.hScroll} icons=${geo.scopeIcons}/${geo.scopeItems} marks=${geo.taskMarks}/${geo.taskLis} issues=${geo.issues.length} errors=${v.consoleErrors.length} ${fail ? 'FAIL' : 'PASS'}`,
    );
    console.log(`  H1 font=${geo.h1?.fontFamily} w=${geo.h1?.fontWeight} size=${geo.h1?.fontSize} lines=${geo.h1?.lines} h=${geo.h1?.height}`);
    console.log(`  lead font=${geo.lead?.fontFamily} w=${geo.lead?.fontWeight} size=${geo.lead?.fontSize} lines=${geo.lead?.lines} h=${geo.lead?.height}`);
    console.log(`  fontsReady=${geo.fontsReady} h1Delta=${v.layoutDelta.h1Delta} leadDelta=${v.layoutDelta.leadDelta} docDelta=${v.layoutDelta.documentDelta}`);
    if (geo.issues.length) console.log('  ' + geo.issues.join(' | '));
  }
}
