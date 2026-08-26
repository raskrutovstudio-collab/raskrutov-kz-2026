import fs from 'node:fs';
import path from 'node:path';
import { chromium } from 'playwright';

const outDir = path.resolve('site_mirror/_work/google-ads-batch4-qa');
fs.mkdirSync(outDir, { recursive: true });

const cities = [
  { slug: 'taldykorgan', name: 'Талдыкорган' },
  { slug: 'taraz', name: 'Тараз' },
  { slug: 'turkestan', name: 'Туркестан' },
  { slug: 'uralsk', name: 'Уральск' },
  { slug: 'ust-kamenogorsk', name: 'Усть-Каменогорск' },
];

function count(hay, needle) {
  return hay.split(needle).length - 1;
}

async function waitLive(url, tries = 12) {
  for (let i = 0; i < tries; i++) {
    try {
      const res = await fetch(url, { redirect: 'manual' });
      if (res.status === 200) return res.status;
      console.log('wait', url, res.status, 'try', i + 1);
    } catch (e) {
      console.log('wait err', url, String(e), 'try', i + 1);
    }
    await new Promise((r) => setTimeout(r, 8000));
  }
  return 0;
}

const sitemap = await fetch('https://raskrutov.kz/sitemap.xml').then((r) => r.text());
const sitemapReport = {};
for (const c of cities) {
  const u = `https://raskrutov.kz/web-studiya/kontekstnaya-reklama/google-ads/${c.slug}/`;
  sitemapReport[c.slug] = count(sitemap, u);
}
sitemapReport.astana = count(
  sitemap,
  'https://raskrutov.kz/web-studiya/kontekstnaya-reklama/google-ads/astana/',
);

const browser = await chromium.launch({ headless: true, channel: 'chrome' });
const report = { sitemap: sitemapReport, pages: [] };

try {
  for (const city of cities) {
    const url = `https://raskrutov.kz/web-studiya/kontekstnaya-reklama/google-ads/${city.slug}/`;
    const http = await waitLive(url);
    const pageReport = { city: city.slug, url, http, viewports: {} };

    for (const w of [390, 1440]) {
      const context = await browser.newContext({
        viewport: w === 390 ? { width: 390, height: 844 } : { width: 1440, height: 900 },
        deviceScaleFactor: 1,
      });
      const page = await context.newPage();
      const errors = [];
      page.on('pageerror', (e) => errors.push(String(e)));
      const nav = await page.goto(url, { waitUntil: 'networkidle', timeout: 60000 });
      await page.waitForTimeout(600);

      const data = await page.evaluate(() => {
        const title = document.title;
        const desc = document.querySelector('meta[name="description"]')?.content || '';
        const canonical = document.querySelector('link[rel="canonical"]')?.href || '';
        const robots = document.querySelector('meta[name="robots"]')?.content || '';
        const h1 = document.querySelector('h1')?.textContent?.trim() || '';
        const preload = [...document.querySelectorAll('link[rel="preload"]')].map((el) => el.getAttribute('href'));
        const cssOk = [...document.querySelectorAll('link[rel="stylesheet"]')].every((el) => !!el.href);
        const jsOk = [...document.querySelectorAll('script[src]')].length > 0;
        const forms = [...document.querySelectorAll('form[data-lead-form]')].map((f) => f.getAttribute('name'));
        const items = [...document.querySelectorAll('.gads-scope-list__item')];
        const icons = document.querySelectorAll('.gads-scope-list__icon').length;
        const marksLi = document.querySelectorAll('.gads-tasks-panel__list li').length;
        const marks = document.querySelectorAll('.gads-tasks-panel__mark').length;
        const contacts = !!document.querySelector('#contacts');
        const schemaScripts = [...document.querySelectorAll('script[type="application/ld+json"]')].map((s) => s.textContent);
        let schemaOk = schemaScripts.length > 0;
        const schemaTypes = [];
        for (const raw of schemaScripts) {
          try {
            const json = JSON.parse(raw);
            const graph = json['@graph'] || (Array.isArray(json) ? json : [json]);
            graph.forEach((n) => schemaTypes.push(n['@type']));
          } catch {
            schemaOk = false;
          }
        }
        const docW = document.documentElement.scrollWidth;
        const vw = window.innerWidth;
        return {
          title,
          desc,
          canonical,
          robots,
          h1,
          preload,
          cssOk,
          jsOk,
          forms,
          scopeItems: items.length,
          scopeIcons: icons,
          taskLis: marksLi,
          taskMarks: marks,
          contacts,
          schemaOk,
          schemaTypes,
          hScroll: Math.max(0, docW - vw),
        };
      });

      const shot = path.join(outDir, `live-${city.slug}-${w}.png`);
      await page.screenshot({ path: shot, fullPage: true, animations: 'disabled' });
      pageReport.viewports[w] = {
        status: nav?.status() || 0,
        screenshot: path.relative(process.cwd(), shot).replaceAll('\\', '/'),
        consoleErrors: errors.filter((e) => !/metrika|mc\.yandex|ym\(/i.test(e)),
        rawConsole: errors,
        ...data,
      };
      await context.close();
    }
    report.pages.push(pageReport);
    console.log(
      city.slug,
      'http',
      http,
      'h1',
      pageReport.viewports[390].h1,
      'icons',
      `${pageReport.viewports[390].scopeIcons}/${pageReport.viewports[390].scopeItems}`,
      'marks',
      `${pageReport.viewports[390].taskMarks}/${pageReport.viewports[390].taskLis}`,
      'preload',
      pageReport.viewports[390].preload.length,
      'hScroll',
      pageReport.viewports[390].hScroll,
      pageReport.viewports[1440].hScroll,
    );
  }
} finally {
  await browser.close();
}

fs.writeFileSync(path.join(outDir, 'live-qa.json'), JSON.stringify(report, null, 2));
console.log('sitemap', sitemapReport);
console.log('wrote live-qa.json');
