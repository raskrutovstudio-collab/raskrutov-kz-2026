import fs from 'node:fs';
import path from 'node:path';
import { chromium } from 'playwright';

const port = Number(process.env.PORT || 8768);
const origin = `http://127.0.0.1:${port}`;
const outDir = path.resolve('site_mirror/_work/google-ads-batch4-qa');
fs.mkdirSync(outDir, { recursive: true });

const cities = [
  { slug: 'taraz', widths: [390, 1440] },
  { slug: 'turkestan', widths: [390, 1440] },
  { slug: 'ust-kamenogorsk', widths: [390, 430, 768, 1440] },
];

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
    });

    const h1 = document.querySelector('h1');
    const lead = document.querySelector('.ctx-hero__lead');
    const contacts = document.querySelector('#contacts');
    if (!h1 || getComputedStyle(h1).display === 'none') issues.push('H1 missing/hidden');
    if (!contacts) issues.push('#contacts missing');

    const metric = (el) => {
      if (!el) return null;
      const cs = getComputedStyle(el);
      const r = el.getBoundingClientRect();
      return {
        text: (el.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 180),
        fontFamily: cs.fontFamily,
        fontWeight: cs.fontWeight,
        fontSize: cs.fontSize,
        width: Math.round(r.width * 10) / 10,
        height: Math.round(r.height * 10) / 10,
      };
    };

    const fonts = performance.getEntriesByType('resource')
      .filter((e) => String(e.name).includes('montserrat'))
      .map((e) => ({ name: e.name.split('/').pop(), duration: Math.round(e.duration) }));

    return {
      hScroll: Math.max(0, docW - vw),
      scopeIcons: document.querySelectorAll('.gads-scope-list__icon').length,
      scopeItems: items.length,
      taskMarks: document.querySelectorAll('.gads-tasks-panel__mark').length,
      taskLis: marks.length,
      issues,
      h1: metric(h1),
      lead: metric(lead),
      fonts,
    };
  });
}

const browser = await chromium.launch({ headless: true, channel: 'chrome' });
const report = [];
try {
  for (const city of cities) {
    const url = `${origin}/web-studiya/kontekstnaya-reklama/google-ads/${city.slug}/`;
    const cityReport = { city: city.slug, url, viewports: {} };
    for (const w of city.widths) {
      const context = await browser.newContext({ viewport: viewports[w], deviceScaleFactor: 1 });
      const page = await context.newPage();
      const errors = [];
      page.on('pageerror', (e) => errors.push(String(e)));
      await page.goto(url, { waitUntil: 'networkidle', timeout: 60000 });
      await page.waitForTimeout(500);
      const geo = await inspect(page);
      const shotPath = path.join(outDir, `${city.slug}-${w}-post-perf.png`);
      await page.screenshot({ path: shotPath, fullPage: true, animations: 'disabled' });
      for (const id of ['ctx-hero', 'setup', 'management', 'contacts']) {
        const loc = page.locator(`#${id}`);
        if (await loc.count()) {
          await loc.scrollIntoViewIfNeeded();
          await page.waitForTimeout(50);
          await loc.screenshot({
            path: path.join(outDir, `${city.slug}-${w}-post-perf-${id}.png`),
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

fs.writeFileSync(path.join(outDir, 'post-perf-visual.json'), JSON.stringify(report, null, 2));
for (const c of report) {
  for (const [w, v] of Object.entries(c.viewports)) {
    const fail =
      v.geo.issues.length ||
      v.geo.hScroll > 1 ||
      v.geo.scopeIcons < v.geo.scopeItems ||
      v.geo.taskMarks < v.geo.taskLis;
    console.log(
      `${c.city} ${w} hScroll=${v.geo.hScroll} icons=${v.geo.scopeIcons}/${v.geo.scopeItems} marks=${v.geo.taskMarks}/${v.geo.taskLis} fonts=${v.geo.fonts.map((f) => f.name).join(',')} ${fail ? 'FAIL' : 'PASS'}`,
    );
    if (v.geo.issues.length) console.log('  ' + v.geo.issues.join(' | '));
  }
}
