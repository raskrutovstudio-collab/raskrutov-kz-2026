import fs from 'node:fs';
import path from 'node:path';
import { chromium } from 'playwright';

const url = 'https://raskrutov.kz/web-studiya/kontekstnaya-reklama/google-ads/astana/';
const outDir = path.resolve('site_mirror/_work/google-ads-astana-final-qa');

async function waitLive() {
  for (let i = 0; i < 12; i++) {
    try {
      const res = await fetch(url, { redirect: 'manual' });
      if (res.status === 200) return 200;
      console.log('wait http', res.status, i + 1);
    } catch (e) {
      console.log('wait err', String(e), i + 1);
    }
    await new Promise((r) => setTimeout(r, 8000));
  }
  return 0;
}

const http = await waitLive();
const sitemap = await fetch('https://raskrutov.kz/sitemap.xml').then((r) => r.text());
const count = (needle) => sitemap.split(needle).length - 1;
const sitemapReport = {
  astana: count(url),
  batch: {},
};
for (const c of [
  'almaty','shymkent','karaganda','aktobe','aktau','atyrau','kokshetau','kostanay',
  'kyzylorda','pavlodar','petropavlovsk','semey','taldykorgan','taraz','turkestan','uralsk','ust-kamenogorsk',
]) {
  sitemapReport.batch[c] = count(`https://raskrutov.kz/web-studiya/kontekstnaya-reklama/google-ads/${c}/`);
}

const browser = await chromium.launch({ headless: true, channel: 'chrome' });
const report = { http, url, sitemap: sitemapReport, viewports: {} };
try {
  for (const w of [390, 1440]) {
    const context = await browser.newContext({
      viewport: w === 390 ? { width: 390, height: 844 } : { width: 1440, height: 900 },
    });
    const page = await context.newPage();
    const errors = [];
    page.on('pageerror', (e) => errors.push(String(e)));
    const nav = await page.goto(url, { waitUntil: 'networkidle', timeout: 60000 });
    await page.waitForTimeout(600);
    const data = await page.evaluate(() => {
      let schemaOk = true;
      const types = [];
      for (const s of document.querySelectorAll('script[type="application/ld+json"]')) {
        try {
          const json = JSON.parse(s.textContent);
          const graph = json['@graph'] || [json];
          graph.forEach((n) => types.push(n['@type']));
        } catch {
          schemaOk = false;
        }
      }
      return {
        title: document.title,
        desc: document.querySelector('meta[name="description"]')?.content || '',
        canonical: document.querySelector('link[rel="canonical"]')?.href || '',
        robots: document.querySelector('meta[name="robots"]')?.content || '',
        h1: document.querySelector('h1')?.textContent?.trim() || '',
        preload: [...document.querySelectorAll('link[rel="preload"]')].length,
        cssOk: [...document.querySelectorAll('link[rel="stylesheet"]')].every((el) => !!el.href),
        jsOk: [...document.querySelectorAll('script[src]')].length > 0,
        forms: [...document.querySelectorAll('form[data-lead-form]')].map((f) => f.getAttribute('name')),
        scopeIcons: document.querySelectorAll('.gads-scope-list__icon').length,
        scopeItems: document.querySelectorAll('.gads-scope-list__item').length,
        taskMarks: document.querySelectorAll('.gads-tasks-panel__mark').length,
        taskLis: document.querySelectorAll('.gads-tasks-panel__list li').length,
        contacts: !!document.querySelector('#contacts'),
        schemaOk,
        types,
        hScroll: Math.max(0, document.documentElement.scrollWidth - window.innerWidth),
        fonts: performance.getEntriesByType('resource').filter((e) => String(e.name).includes('montserrat')).map((e) => e.name.split('/').pop()),
      };
    });
    const shot = path.join(outDir, `live-astana-${w}.png`);
    await page.screenshot({ path: shot, fullPage: true, animations: 'disabled' });
    report.viewports[w] = {
      status: nav?.status() || 0,
      screenshot: path.relative(process.cwd(), shot).replaceAll('\\', '/'),
      consoleErrors: errors.filter((e) => !/metrika|mc\.yandex|ym\(/i.test(e)),
      ...data,
    };
    console.log(w, data.h1, `icons ${data.scopeIcons}/${data.scopeItems}`, `marks ${data.taskMarks}/${data.taskLis}`, 'preload', data.preload, 'hScroll', data.hScroll);
    await context.close();
  }
} finally {
  await browser.close();
}
fs.writeFileSync(path.join(outDir, 'live-qa.json'), JSON.stringify(report, null, 2));
console.log('http', http, 'sitemap astana', sitemapReport.astana, 'batch', sitemapReport.batch);
