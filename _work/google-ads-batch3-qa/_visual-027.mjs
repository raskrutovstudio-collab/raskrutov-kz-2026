import fs from 'node:fs';
import path from 'node:path';
import { chromium } from 'playwright';

const port = Number(process.env.PORT || 8768);
const origin = `http://127.0.0.1:${port}`;
const outDir = path.resolve('site_mirror/_work/google-ads-batch3-qa');
fs.mkdirSync(outDir, { recursive: true });

const cities = [
  { slug: 'kyzylorda', name: 'kyzylorda' },
  { slug: 'pavlodar', name: 'pavlodar' },
  { slug: 'petropavlovsk', name: 'petropavlovsk' },
  { slug: 'semey', name: 'semey' },
];

const viewports = {
  390: { width: 390, height: 844 },
  430: { width: 430, height: 932 },
  768: { width: 768, height: 1024 },
  1440: { width: 1440, height: 900 },
};

async function geometry(page) {
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
    const header = document.querySelector('header');
    const main = document.querySelector('main');
    const contacts = document.querySelector('#contacts');
    if (!h1 || getComputedStyle(h1).display === 'none') issues.push('H1 missing/hidden');
    if (!header) issues.push('header missing');
    if (!main) issues.push('main missing');
    if (!contacts) issues.push('#contacts missing');

    return {
      scrollWidth: docW,
      innerWidth: vw,
      hScroll: Math.max(0, docW - vw),
      scopeItems: items.length,
      scopeIcons: document.querySelectorAll('.gads-scope-list__icon').length,
      taskLis: marks.length,
      taskMarks: document.querySelectorAll('.gads-tasks-panel__mark').length,
      issues,
    };
  });
}

async function shot(page, file) {
  await page.screenshot({ path: file, fullPage: true, animations: 'disabled' });
}

const browser = await chromium.launch({ headless: true, channel: 'chrome' });
const report = [];

try {
  for (const city of cities) {
    const url = `${origin}/web-studiya/kontekstnaya-reklama/google-ads/${city.slug}/`;
    const cityReport = { city: city.slug, url, viewports: {} };
    const widths = city.slug === 'petropavlovsk' ? [390, 430, 768, 1440] : [390, 1440];
    for (const w of widths) {
      const context = await browser.newContext({
        viewport: viewports[w],
        deviceScaleFactor: 1,
      });
      const page = await context.newPage();
      const errors = [];
      page.on('pageerror', (e) => errors.push(String(e)));
      await page.goto(url, { waitUntil: 'networkidle', timeout: 60000 });
      await page.waitForTimeout(400);
      const geo = await geometry(page);
      const shotPath = path.join(outDir, `${city.name}-${w}.png`);
      await shot(page, shotPath);
      const sections = ['ctx-hero', 'about', 'audience', 'campaign-types', 'setup', 'management', 'faq', 'contacts'];
      for (const id of sections) {
        const loc = page.locator(`#${id}`);
        if (await loc.count()) {
          await loc.scrollIntoViewIfNeeded();
          await page.waitForTimeout(80);
          await loc.screenshot({
            path: path.join(outDir, `${city.name}-${w}-${id}.png`),
            animations: 'disabled',
          });
        }
      }
      cityReport.viewports[w] = {
        screenshot: path.relative(process.cwd(), shotPath).replaceAll('\\', '/'),
        geo,
        consoleErrors: errors,
      };
      await context.close();
    }
    report.push(cityReport);
  }
} finally {
  await browser.close();
}

fs.writeFileSync(path.join(outDir, 'visual-027.json'), JSON.stringify(report, null, 2));
for (const c of report) {
  for (const [w, v] of Object.entries(c.viewports)) {
    const fail =
      v.geo.issues.length ||
      v.geo.hScroll > 1 ||
      v.geo.scopeIcons < v.geo.scopeItems ||
      v.geo.taskMarks < v.geo.taskLis;
    console.log(
      `${c.city} ${w} hScroll=${v.geo.hScroll} icons=${v.geo.scopeIcons}/${v.geo.scopeItems} marks=${v.geo.taskMarks}/${v.geo.taskLis} issues=${v.geo.issues.length} errors=${v.consoleErrors.length} ${fail ? 'FAIL' : 'PASS'}`,
    );
    if (v.geo.issues.length) console.log('  ' + v.geo.issues.join(' | '));
  }
}
