import fs from 'node:fs';
import path from 'node:path';
import { chromium } from 'playwright';

const origin = 'https://raskrutov.kz';
const outDir = path.resolve('site_mirror/_work/google-ads-batch3-qa');
fs.mkdirSync(outDir, { recursive: true });

const cities = [
  { slug: 'kyzylorda', title: 'Google Ads в Кызылорде: город, выезд и доставка | Raskrutov', h1: 'Настройка и ведение Google Ads в Кызылорде', formC: 'contacts_google_ads_kyzylorda', formP: 'popup_google_ads_kyzylorda', preload: 0 },
  { slug: 'pavlodar', title: 'Реклама в Google в Павлодаре: город и логистика | Raskrutov', h1: 'Настройка и ведение Google Ads в Павлодаре', formC: 'contacts_google_ads_pavlodar', formP: 'popup_google_ads_pavlodar', preload: 0 },
  { slug: 'petropavlovsk', title: null, h1: 'Настройка и ведение Google Ads в Петропавловске', formC: 'contacts_google_ads_petropavlovsk', formP: 'popup_google_ads_petropavlovsk', preload: 2 },
  { slug: 'semey', title: null, h1: 'Настройка и ведение Google Ads в Семее', formC: 'contacts_google_ads_semey', formP: 'popup_google_ads_semey', preload: 2 },
];

async function waitLive(slug) {
  const url = `${origin}/web-studiya/kontekstnaya-reklama/google-ads/${slug}/`;
  for (let i = 0; i < 18; i++) {
    try {
      const res = await fetch(url, { redirect: 'manual', cache: 'no-store', headers: { 'Cache-Control': 'no-cache' } });
      const html = res.status === 200 ? await res.text() : '';
      if (res.status === 200 && html.includes('gads-scope-list__item') && html.includes(`google-ads/${slug}/`)) {
        return { status: res.status, html, tries: i + 1 };
      }
      console.log(`wait ${slug} try ${i + 1} status=${res.status} len=${html.length}`);
    } catch (e) {
      console.log(`wait ${slug} try ${i + 1} err ${e.message}`);
    }
    await new Promise((r) => setTimeout(r, 8000));
  }
  return { status: 0, html: '', tries: 18 };
}

function inspectHtml(city, html) {
  const issues = [];
  const title = (html.match(/<title>([\s\S]*?)<\/title>/) || [])[1]?.trim() || '';
  const desc = (html.match(/name="description" content="([^"]*)"/) || [])[1] || '';
  const canonical = (html.match(/rel="canonical" href="([^"]*)"/) || [])[1] || '';
  const robots = (html.match(/name="robots" content="([^"]*)"/) || [])[1] || '';
  const h1 = (html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/) || [])[1]?.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim() || '';
  const preload = (html.match(/rel="preload"[^>]*as="font"/g) || []).length;
  const schemaOk = (() => {
    const m = html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/);
    if (!m) return false;
    try { JSON.parse(m[1]); return true; } catch { return false; }
  })();
  const css = ['home-clean.css?v=39', 'kontekst-clean.css?v=7', 'google-ads-page.css?v=7'].every((x) => html.includes(x));
  const js = html.includes('home-clean.js?v=21') && html.includes('google-ads-page.js');
  const formC = html.includes(`name="${city.formC}"`);
  const formP = html.includes(`name="${city.formP}"`);
  const contacts = html.includes('id="contacts"') || html.includes("id='contacts'");
  const icons = (html.match(/gads-scope-list__icon/g) || []).length;
  const items = (html.match(/gads-scope-list__item/g) || []).length;
  const marks = (html.match(/gads-tasks-panel__mark/g) || []).length;
  const lis = (html.match(/gads-tasks-panel__list/g) || []).length;

  if (city.title && title !== city.title) issues.push(`title mismatch: ${title}`);
  if (!title) issues.push('title missing');
  if (!desc) issues.push('description missing');
  if (canonical !== `https://raskrutov.kz/web-studiya/kontekstnaya-reklama/google-ads/${city.slug}/`) issues.push(`canonical ${canonical}`);
  if (robots !== 'index, follow') issues.push(`robots ${robots}`);
  if (!h1.includes('Google Ads')) issues.push(`h1 ${h1}`);
  if (preload !== city.preload) issues.push(`preload ${preload} expected ${city.preload}`);
  if (!schemaOk) issues.push('schema parse fail');
  if (!css) issues.push('css assets missing');
  if (!js) issues.push('js assets missing');
  if (!formC) issues.push('contacts form missing');
  if (!formP) issues.push('popup form missing');
  if (!contacts) issues.push('#contacts missing');
  if (icons < 6) issues.push(`icons ${icons}`);
  if (items < 6) issues.push(`items ${items}`);
  if (marks < 7) issues.push(`marks ${marks}`);

  return { title, desc: desc.slice(0, 80), canonical, robots, h1, preload, schemaOk, css, js, formC, formP, contacts, icons, items, marks, lis, issues };
}

const browser = await chromium.launch({ headless: true, channel: 'chrome' });
const report = { sitemap: {}, pages: {} };

try {
  const smRes = await fetch(`${origin}/sitemap.xml`, { cache: 'no-store' });
  const sm = await smRes.text();
  report.sitemap.status = smRes.status;
  for (const c of cities) {
    const url = `https://raskrutov.kz/web-studiya/kontekstnaya-reklama/google-ads/${c.slug}/`;
    report.sitemap[c.slug] = sm.split(url).length - 1;
  }
  report.sitemap.astana = sm.split('google-ads/astana/').length - 1;
  report.sitemap.batch4 = ['oral', 'taraz', 'turkestan', 'taldykorgan'].map((x) => ({
    x,
    n: sm.split(`google-ads/${x}/`).length - 1,
  }));

  for (const city of cities) {
    const live = await waitLive(city.slug);
    const htmlInfo = inspectHtml(city, live.html);
    const url = `${origin}/web-studiya/kontekstnaya-reklama/google-ads/${city.slug}/`;
    const pageReport = { http: live.status, tries: live.tries, html: htmlInfo, viewports: {} };

    if (live.status === 200) {
      for (const w of [390, 1440]) {
        const context = await browser.newContext({
          viewport: w === 390 ? { width: 390, height: 844 } : { width: 1440, height: 900 },
          deviceScaleFactor: 1,
        });
        const page = await context.newPage();
        const errors = [];
        page.on('pageerror', (e) => errors.push(String(e)));
        await page.goto(url, { waitUntil: 'networkidle', timeout: 60000 });
        await page.waitForTimeout(600);
        const geo = await page.evaluate(() => {
          const issues = [];
          const docW = document.documentElement.scrollWidth;
          const vw = window.innerWidth;
          const items = [...document.querySelectorAll('.gads-scope-list__item')];
          items.forEach((el, i) => {
            if (!el.querySelector(':scope > .gads-scope-list__icon')) issues.push(`scope ${i} no icon`);
            if (!el.querySelector(':scope > div')) issues.push(`scope ${i} no content`);
          });
          const marks = [...document.querySelectorAll('.gads-tasks-panel__list li')];
          marks.forEach((el, i) => {
            if (!el.querySelector(':scope > .gads-tasks-panel__mark')) issues.push(`task ${i} no mark`);
          });
          const h1 = document.querySelector('h1');
          const lead = document.querySelector('.ctx-hero__lead');
          const cs = (el) => (el ? getComputedStyle(el).fontFamily : null);
          return {
            hScroll: Math.max(0, docW - vw),
            icons: document.querySelectorAll('.gads-scope-list__icon').length,
            items: items.length,
            marks: document.querySelectorAll('.gads-tasks-panel__mark').length,
            lis: marks.length,
            contacts: Boolean(document.querySelector('#contacts')),
            h1Font: cs(h1),
            leadFont: cs(lead),
            mont400: document.fonts.check('400 16px "Montserrat"'),
            mont700: document.fonts.check('700 40px "Montserrat"'),
            issues,
          };
        });
        const shot = path.join(outDir, `${city.slug}-${w}-prod.png`);
        await page.screenshot({ path: shot, fullPage: true, animations: 'disabled' });
        for (const id of ['ctx-hero', 'setup', 'management', 'faq', 'contacts']) {
          const loc = page.locator(`#${id}`);
          if (await loc.count()) {
            await loc.scrollIntoViewIfNeeded();
            await page.waitForTimeout(50);
            await loc.screenshot({ path: path.join(outDir, `${city.slug}-${w}-prod-${id}.png`), animations: 'disabled' });
          }
        }
        pageReport.viewports[w] = { geo, errors, screenshot: path.relative(process.cwd(), shot).replaceAll('\\', '/') };
        await context.close();
      }
    }
    report.pages[city.slug] = pageReport;
    console.log(JSON.stringify({ city: city.slug, http: live.status, issues: htmlInfo.issues, preload: htmlInfo.preload }, null, 0));
  }
} finally {
  await browser.close();
}

fs.writeFileSync(path.join(outDir, 'prod-release.json'), JSON.stringify(report, null, 2));
console.log('SITEMAP', report.sitemap);
for (const [slug, p] of Object.entries(report.pages)) {
  const g390 = p.viewports[390]?.geo;
  const g1440 = p.viewports[1440]?.geo;
  console.log(
    slug,
    'HTTP', p.http,
    'htmlIssues', p.html.issues.length,
    '390 hScroll', g390?.hScroll,
    '1440 hScroll', g1440?.hScroll,
    'icons', g390?.icons, '/', g390?.items,
    'marks', g390?.marks, '/', g390?.lis,
    'errors', (p.viewports[390]?.errors.length || 0) + (p.viewports[1440]?.errors.length || 0),
  );
}
