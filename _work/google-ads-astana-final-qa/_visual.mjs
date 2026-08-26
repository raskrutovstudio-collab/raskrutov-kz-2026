import fs from 'node:fs';
import path from 'node:path';
import { chromium } from 'playwright';

const origin = process.env.QA_ORIGIN || 'http://127.0.0.1:8768';
const url = `${origin}/web-studiya/kontekstnaya-reklama/google-ads/astana/`;
const outDir = path.resolve('site_mirror/_work/google-ads-astana-final-qa');
fs.mkdirSync(outDir, { recursive: true });

const viewports = {
  390: { width: 390, height: 844 },
  430: { width: 430, height: 932 },
  768: { width: 768, height: 1024 },
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

    const h1s = document.querySelectorAll('h1');
    const h1 = document.querySelector('h1');
    const contacts = document.querySelector('#contacts');
    const header = document.querySelector('header');
    const main = document.querySelector('main');
    if (h1s.length !== 1) issues.push(`h1 count ${h1s.length}`);
    if (!h1 || getComputedStyle(h1).display === 'none') issues.push('H1 missing/hidden');
    if (!header) issues.push('header missing');
    if (!main) issues.push('main missing');
    if (!contacts) issues.push('#contacts missing');

    const fonts = performance
      .getEntriesByType('resource')
      .filter((e) => String(e.name).includes('montserrat'))
      .map((e) => e.name.split('/').pop());

    return {
      hScroll: Math.max(0, docW - vw),
      scopeItems: items.length,
      scopeIcons: document.querySelectorAll('.gads-scope-list__icon').length,
      taskLis: marks.length,
      taskMarks: document.querySelectorAll('.gads-tasks-panel__mark').length,
      forms: [...document.querySelectorAll('form[data-lead-form]')].map((f) => f.getAttribute('name')),
      title: document.title,
      canonical: document.querySelector('link[rel="canonical"]')?.href || '',
      robots: document.querySelector('meta[name="robots"]')?.content || '',
      h1: (h1?.textContent || '').trim(),
      fonts,
      issues,
    };
  });
}

const browser = await chromium.launch({ headless: true, channel: 'chrome' });
const report = { url, viewports: {} };
try {
  for (const w of [390, 430, 768, 1440]) {
    const context = await browser.newContext({ viewport: viewports[w], deviceScaleFactor: 1 });
    const page = await context.newPage();
    const errors = [];
    page.on('pageerror', (e) => errors.push(String(e)));
    await page.goto(url, { waitUntil: 'networkidle', timeout: 60000 });
    await page.waitForTimeout(400);
    const geo = await inspect(page);
    const shotPath = path.join(outDir, `astana-${w}.png`);
    await page.screenshot({ path: shotPath, fullPage: true, animations: 'disabled' });
    for (const id of ['ctx-hero', 'audience', 'campaign-types', 'setup', 'management', 'faq', 'contacts']) {
      const loc = page.locator(`#${id}`);
      if (await loc.count()) {
        await loc.scrollIntoViewIfNeeded();
        await page.waitForTimeout(50);
        await loc.screenshot({ path: path.join(outDir, `astana-${w}-${id}.png`), animations: 'disabled' });
      }
    }
    report.viewports[w] = {
      screenshot: path.relative(process.cwd(), shotPath).replaceAll('\\', '/'),
      geo,
      consoleErrors: errors,
    };
    const fail =
      geo.issues.length ||
      geo.hScroll > 1 ||
      geo.scopeIcons < geo.scopeItems ||
      geo.taskMarks < geo.taskLis;
    console.log(
      `${w} hScroll=${geo.hScroll} icons=${geo.scopeIcons}/${geo.scopeItems} marks=${geo.taskMarks}/${geo.taskLis} issues=${geo.issues.length} ${fail ? 'FAIL' : 'PASS'}`,
    );
    if (geo.issues.length) console.log('  ' + geo.issues.join(' | '));
    await context.close();
  }
} finally {
  await browser.close();
}

fs.writeFileSync(path.join(outDir, 'visual-027.json'), JSON.stringify(report, null, 2));
console.log('wrote visual-027.json');
