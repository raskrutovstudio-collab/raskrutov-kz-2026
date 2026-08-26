import fs from 'node:fs';
import path from 'node:path';
import { chromium } from 'playwright';

const outDir = path.resolve('site_mirror/_work/google-ads-batch2-qa/prod-smoke');
fs.mkdirSync(outDir, { recursive: true });

const expected = {
  aktau: {
    title: 'Реклама Google Ads в Актау — настройка и ведение | Raskrutov',
    h1: 'Реклама в Google Ads для бизнеса в Актау',
    canonical: 'https://raskrutov.kz/web-studiya/kontekstnaya-reklama/google-ads/aktau/',
  },
  atyrau: {
    title: 'Настройка Google Ads в Атырау — ведение рекламы | Raskrutov',
    h1: 'Настройка Google Ads в Атырау и ведение кампаний',
    canonical: 'https://raskrutov.kz/web-studiya/kontekstnaya-reklama/google-ads/atyrau/',
  },
  kokshetau: {
    title: 'Google Ads в Кокшетау — настройка рекламы в Google | Raskrutov',
    h1: 'Google Ads в Кокшетау: настройка поиска и ведение',
    canonical: 'https://raskrutov.kz/web-studiya/kontekstnaya-reklama/google-ads/kokshetau/',
  },
  kostanay: {
    title: 'Ведение Google Ads в Костанае — реклама в Google | Raskrutov',
    h1: 'Ведение Google Ads в Костанае — настройка рекламы',
    canonical: 'https://raskrutov.kz/web-studiya/kontekstnaya-reklama/google-ads/kostanay/',
  },
};

const viewports = {
  390: { width: 390, height: 844 },
  1440: { width: 1440, height: 900 },
};

const browser = await chromium.launch({ headless: true, channel: 'chrome' });
const report = [];

try {
  for (const [slug, exp] of Object.entries(expected)) {
    const url = exp.canonical;
    const city = { slug, url, viewports: {} };

    const metaCtx = await browser.newContext();
    const page = await metaCtx.newPage();
    const pageErrors = [];
    page.on('pageerror', (e) => pageErrors.push(String(e.message || e)));
    const res = await page.goto(url, { waitUntil: 'networkidle', timeout: 60000 });
    const html = await page.content();
    const title = await page.title();
    const canonical = await page.getAttribute('link[rel="canonical"]', 'href');
    const robots = await page.getAttribute('meta[name="robots"]', 'content');
    const description = await page.getAttribute('meta[name="description"]', 'content');
    const h1 = await page.locator('h1').innerText();
    const forms = await page.locator('form[data-lead-form]').count();
    const contacts = await page.locator('#contacts').count();
    const setupItems = await page.locator('.gads-scope-list__item').count();
    const setupIcons = await page.locator('.gads-scope-list__icon').count();
    const taskLis = await page.locator('.gads-tasks-panel__list li').count();
    const taskMarks = await page.locator('.gads-tasks-panel__mark').count();

    let schemaOk = false;
    try {
      const json = await page.locator('script[type="application/ld+json"]').first().textContent();
      const data = JSON.parse(json);
      const types = (data['@graph'] || []).map((x) => [].concat(x['@type']).join('+'));
      schemaOk =
        types.includes('Organization+ProfessionalService') &&
        types.includes('WebSite') &&
        types.includes('WebPage') &&
        types.includes('BreadcrumbList') &&
        types.includes('Service') &&
        types.includes('FAQPage');
    } catch {
      schemaOk = false;
    }

    const assetFails = await page.evaluate(async () => {
      const urls = [...document.querySelectorAll('link[rel="stylesheet"], script[src]')]
        .map((el) => el.href || el.src)
        .filter((u) => u && u.includes('raskrutov.kz'));
      const bad = [];
      for (const u of urls.slice(0, 12)) {
        try {
          const r = await fetch(u, { method: 'HEAD' });
          if (!r.ok) bad.push(`${r.status} ${u}`);
        } catch (e) {
          bad.push(`ERR ${u}`);
        }
      }
      return bad;
    });

    city.http = res?.status() || 0;
    city.title = title;
    city.titleOk = title === exp.title;
    city.description = description;
    city.h1 = h1.trim();
    city.h1Ok = h1.trim() === exp.h1;
    city.canonical = canonical;
    city.canonicalOk = canonical === exp.canonical;
    city.robots = robots;
    city.robotsOk = /index/i.test(robots || '') && /follow/i.test(robots || '');
    city.schemaOk = schemaOk;
    city.forms = forms;
    city.contacts = contacts;
    city.setupItems = setupItems;
    city.setupIcons = setupIcons;
    city.taskLis = taskLis;
    city.taskMarks = taskMarks;
    city.domContract =
      setupIcons >= setupItems && setupItems === 6 && taskMarks >= taskLis && taskLis === 7;
    city.assetFails = assetFails;
    city.pageErrors = pageErrors.filter((m) => !/metrika|mc\.yandex|yandex/i.test(m));
    await metaCtx.close();

    for (const w of [390, 1440]) {
      const ctx = await browser.newContext({ viewport: viewports[w], deviceScaleFactor: 1 });
      const p = await ctx.newPage();
      await p.goto(url, { waitUntil: 'networkidle', timeout: 60000 });
      await p.waitForTimeout(300);
      const geo = await p.evaluate(() => {
        const issues = [];
        const docW = document.documentElement.scrollWidth;
        const vw = window.innerWidth;
        if (docW > vw + 1) issues.push(`h-scroll ${docW}>${vw}`);
        document.querySelectorAll('.gads-scope-list__item').forEach((el, i) => {
          const icon = el.querySelector(':scope > .gads-scope-list__icon');
          const content = el.querySelector(':scope > div');
          if (!icon) issues.push(`item ${i} no icon`);
          if (!content) issues.push(`item ${i} no content`);
          if (content) {
            const pr = el.getBoundingClientRect();
            const cr = content.getBoundingClientRect();
            if (pr.width > 0 && cr.width / pr.width < 0.45) issues.push(`item ${i} narrow`);
          }
        });
        return { scrollWidth: docW, innerWidth: vw, hScroll: Math.max(0, docW - vw), issues };
      });
      const shot = path.join(outDir, `${slug}-${w}.png`);
      await p.screenshot({ path: shot, fullPage: true, animations: 'disabled' });
      for (const id of ['ctx-hero', 'campaign-types', 'setup', 'management', 'pricing', 'faq', 'contacts']) {
        const loc = p.locator(`#${id}`);
        if (await loc.count()) {
          await loc.scrollIntoViewIfNeeded();
          await p.waitForTimeout(60);
          await loc.screenshot({ path: path.join(outDir, `${slug}-${w}-${id}.png`), animations: 'disabled' });
        }
      }
      city.viewports[w] = {
        screenshot: path.relative(process.cwd(), shot).replaceAll('\\', '/'),
        geo,
      };
      await ctx.close();
    }
    report.push(city);
  }
} finally {
  await browser.close();
}

const sitemap = await fetch('https://raskrutov.kz/sitemap.xml').then((r) => r.text());
const counts = {};
for (const slug of Object.keys(expected)) {
  const re = new RegExp(`https://raskrutov\\.kz/web-studiya/kontekstnaya-reklama/google-ads/${slug}/`, 'g');
  counts[slug] = (sitemap.match(re) || []).length;
}
const astana = (sitemap.match(/google-ads\/astana\//g) || []).length;

fs.writeFileSync(path.join(outDir, 'prod-qa.json'), JSON.stringify({ report, sitemap: { counts, astana } }, null, 2));
for (const c of report) {
  const fail =
    c.http !== 200 ||
    !c.titleOk ||
    !c.h1Ok ||
    !c.canonicalOk ||
    !c.robotsOk ||
    !c.schemaOk ||
    !c.domContract ||
    c.forms < 2 ||
    c.contacts < 1 ||
    c.assetFails.length ||
    c.pageErrors.length ||
    c.viewports[390].geo.hScroll > 1 ||
    c.viewports[1440].geo.hScroll > 1 ||
    c.viewports[390].geo.issues.length ||
    c.viewports[1440].geo.issues.length;
  console.log(
    `${c.slug} HTTP=${c.http} title=${c.titleOk} h1=${c.h1Ok} canon=${c.canonicalOk} robots=${c.robotsOk} schema=${c.schemaOk} assets=${c.assetFails.length} forms=${c.forms} contacts=${c.contacts} icons=${c.setupIcons}/${c.setupItems} marks=${c.taskMarks}/${c.taskLis} err=${c.pageErrors.length} h390=${c.viewports[390].geo.hScroll} h1440=${c.viewports[1440].geo.hScroll} ${fail ? 'FAIL' : 'PASS'}`,
  );
  if (c.assetFails.length) console.log('  assets', c.assetFails);
  if (c.pageErrors.length) console.log('  errors', c.pageErrors);
  if (c.viewports[390].geo.issues.length) console.log('  390', c.viewports[390].geo.issues);
  if (c.viewports[1440].geo.issues.length) console.log('  1440', c.viewports[1440].geo.issues);
}
console.log('sitemap', counts, 'astana', astana);
