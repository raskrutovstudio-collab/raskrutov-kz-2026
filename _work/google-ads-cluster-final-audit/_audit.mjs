import fs from 'node:fs';
import path from 'node:path';
import { chromium } from 'playwright';

const root = process.cwd();
const outDir = path.resolve('site_mirror/_work/google-ads-cluster-final-audit');
fs.mkdirSync(outDir, { recursive: true });

const CITIES = [
  { slug: 'almaty', name: 'Алматы', forms: ['алматы'] },
  { slug: 'astana', name: 'Астана', forms: ['астана', 'астане', 'астаны', 'астаной'] },
  { slug: 'shymkent', name: 'Шымкент', forms: ['шымкент', 'шымкенте', 'шымкента', 'шымкентом'] },
  { slug: 'aktau', name: 'Актау', forms: ['актау'] },
  { slug: 'aktobe', name: 'Актобе', forms: ['актобе'] },
  { slug: 'atyrau', name: 'Атырау', forms: ['атырау'] },
  { slug: 'karaganda', name: 'Караганда', forms: ['караганда', 'караганде', 'караганды', 'карагандой'] },
  { slug: 'kokshetau', name: 'Кокшетау', forms: ['кокшетау'] },
  { slug: 'kostanay', name: 'Костанай', forms: ['костанай', 'костанае', 'костаная', 'костанаем'] },
  { slug: 'kyzylorda', name: 'Кызылорда', forms: ['кызылорда', 'кызылорде', 'кызылорды', 'кызылордой'] },
  { slug: 'pavlodar', name: 'Павлодар', forms: ['павлодар', 'павлодаре', 'павлодара', 'павлодаром'] },
  { slug: 'petropavlovsk', name: 'Петропавловск', forms: ['петропавловск', 'петропавловске', 'петропавловска', 'петропавловском'] },
  { slug: 'semey', name: 'Семей', forms: ['семей', 'семее', 'семея', 'семеем'] },
  { slug: 'taldykorgan', name: 'Талдыкорган', forms: ['талдыкорган', 'талдыкоргане', 'талдыкоргана', 'талдыкорганом'] },
  { slug: 'taraz', name: 'Тараз', forms: ['тараз', 'таразе', 'тараза', 'таразом'] },
  { slug: 'turkestan', name: 'Туркестан', forms: ['туркестан', 'туркестане', 'туркестана', 'туркестаном'] },
  { slug: 'uralsk', name: 'Уральск', forms: ['уральск', 'уральске', 'уральска', 'уральском'] },
  { slug: 'ust-kamenogorsk', name: 'Усть-Каменогорск', forms: ['усть-каменогорск', 'усть-каменогорске', 'усть-каменогорска', 'усть-каменогорском'] },
];

const REGION_EXPECT = {
  semey: ['абай'],
  taldykorgan: ['жетісу', 'жетису'],
  petropavlovsk: ['северо-казахстан', 'ско'],
  'ust-kamenogorsk': ['восточно-казахстан', 'вко'],
  uralsk: ['западно-казахстан', 'зко'],
  taraz: ['жамбыл'],
  turkestan: ['туркестанск'],
};

const ALL_FORMS = CITIES.flatMap((c) => c.forms.map((f) => ({ slug: c.slug, form: f })));
ALL_FORMS.sort((a, b) => b.form.length - a.form.length);

const gadsPath = (s) => path.join(root, `site_mirror/web-studiya/kontekstnaya-reklama/google-ads/${s}/index.html`);
const ppcPath = (s) => path.join(root, `site_mirror/web-studiya/kontekstnaya-reklama/${s}/index.html`);
const liveUrl = (s) => `https://raskrutov.kz/web-studiya/kontekstnaya-reklama/google-ads/${s}/`;
const ppcUrl = (s) => `https://raskrutov.kz/web-studiya/kontekstnaya-reklama/${s}/`;

function attr(html, tagRe) {
  const m = html.match(tagRe);
  return m ? m[1].trim() : '';
}

function all(html, re) {
  return [...html.matchAll(re)].map((m) => m[1]);
}

function stripTags(html) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&[a-z]+;/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function contentHtml(html) {
  const main = html.match(/<main[\s\S]*?<\/main>/i);
  let body = main ? main[0] : html;
  body = body
    .replace(/<header[\s\S]*?<\/header>/gi, ' ')
    .replace(/<nav[\s\S]*?<\/nav>/gi, ' ')
    .replace(/<form[\s\S]*?<\/form>/gi, ' ')
    .replace(/id="contacts"[\s\S]*?<\/section>/i, ' ')
    .replace(/class="rk-sticky-cta"[\s\S]*?<\/nav>/i, ' ');
  return body;
}

function words(text) {
  return text.toLowerCase().split(/[^a-zа-яё0-9іңғүұқөһ-]+/i).filter(Boolean);
}

function grams(wordArr, n = 5) {
  const set = new Set();
  for (let i = 0; i <= wordArr.length - n; i++) set.add(wordArr.slice(i, i + n).join(' '));
  return set;
}

function jaccard(a, b) {
  if (!a.size && !b.size) return 1;
  let inter = 0;
  for (const x of a) if (b.has(x)) inter++;
  return inter / (a.size + b.size - inter);
}

function normalizeCityText(text, slug) {
  let t = text.toLowerCase();
  const city = CITIES.find((c) => c.slug === slug);
  for (const f of [...city.forms].sort((a, b) => b.length - a.length)) {
    t = t.split(f).join('CITY');
  }
  t = t.replace(/raskrutov/gi, 'BRAND');
  return t;
}

function titleLen(s) {
  return [...s].length;
}

function parsePage(slug, html, kind) {
  const title = attr(html, /<title>([^<]*)<\/title>/i);
  const desc = attr(html, /<meta[^>]*name=["']description["'][^>]*content=["']([^"']*)["']/i) ||
    attr(html, /<meta[^>]*content=["']([^"']*)["'][^>]*name=["']description["']/i);
  const canonical = attr(html, /<link[^>]*rel=["']canonical["'][^>]*href=["']([^"']*)["']/i);
  const robots = attr(html, /<meta[^>]*name=["']robots["'][^>]*content=["']([^"']*)["']/i);
  const h1s = all(html, /<h1[^>]*>([\s\S]*?)<\/h1>/gi).map((h) => stripTags(h));
  const forms = [...html.matchAll(/<form([^>]*)>/gi)].map((m) => {
    const attrs = m[1];
    return {
      name: (attrs.match(/name=["']([^"']+)["']/) || [])[1] || '',
      id: (attrs.match(/\sid=["']([^"']+)["']/) || [])[1] || '',
      formName: (attrs.match(/data-form-name=["']([^"']+)["']/) || [])[1] || '',
    };
  });
  let schema = null;
  let schemaOk = true;
  const schemaTypes = [];
  let areaServed = null;
  let orgLocality = null;
  for (const raw of all(html, /<script type=["']application\/ld\+json["']>([\s\S]*?)<\/script>/gi)) {
    try {
      const json = JSON.parse(raw);
      schema = json;
      const graph = json['@graph'] || (Array.isArray(json) ? json : [json]);
      for (const n of graph) {
        schemaTypes.push(n['@type']);
        if (n['@type'] === 'Service' && n.areaServed) areaServed = n.areaServed;
        if (Array.isArray(n['@type']) && n['@type'].includes('Organization') && n.address) {
          orgLocality = n.address.addressLocality;
        }
      }
    } catch {
      schemaOk = false;
    }
  }
  const faqVisible = (html.match(/class="gads-faq__item"/g) || []).length || (html.match(/class="[^"]*faq[^"]*"/gi) || []).length;
  const faqSchema = (() => {
    try {
      const graph = schema?.['@graph'] || [];
      const faq = graph.find((n) => n['@type'] === 'FAQPage');
      return faq?.mainEntity?.length || 0;
    } catch {
      return 0;
    }
  })();
  const priceHits = [...html.matchAll(/от\s*([0-9\s]+)\s*₸/g)].map((m) => m[0].replace(/\s+/g, ' '));
  const yandex = [...html.matchAll(/яндекс|yandex|директ|\bdirect\b/gi)].map((m) => m[0]);
  const officeClaims = [...html.matchAll(/наш офис[^.<]{0,80}|офис в [^.<]{0,40}|мы находимся в [^.<]{0,40}|местн(?:ая|ой) команд/gi)].map((m) => m[0]);
  const hrefs = all(html, /href=["']([^"']+)["']/gi);
  const scopeItems = (html.match(/gads-scope-list__item/g) || []).length;
  const scopeIcons = (html.match(/gads-scope-list__icon/g) || []).length;
  const taskLis = (html.match(/gads-tasks-panel__list[\s\S]*?<\/ul>/) || [''])[0];
  const taskLiCount = (taskLis.match(/<li/g) || []).length;
  const taskMarks = (html.match(/gads-tasks-panel__mark/g) || []).length;
  const hasContacts = /id=["']contacts["']/.test(html);
  const visible = stripTags(contentHtml(html));
  const fullVisible = stripTags(html);
  return {
    kind,
    slug,
    title,
    desc,
    canonical,
    robots,
    h1s,
    h1: h1s[0] || '',
    forms,
    schemaOk,
    schemaTypes,
    areaServed,
    orgLocality,
    faqVisible,
    faqSchema,
    priceHits,
    yandex,
    officeClaims,
    hrefs,
    scopeItems,
    scopeIcons,
    taskLiCount,
    taskMarks,
    hasContacts,
    visible,
    fullVisible,
  };
}

function sectionText(html, id) {
  const re = new RegExp(`<section[^>]*id=["']${id}["'][^>]*>([\\s\\S]*?)</section>`, 'i');
  const m = html.match(re);
  return m ? stripTags(m[1]).toLowerCase() : '';
}

const SECTION_IDS = [
  'ctx-hero',
  'about',
  'audience',
  'campaign-types',
  'format-decision',
  'setup',
  'management',
  'geo-astana',
  'analytics',
  'faq',
];

async function fetchStatus(url) {
  try {
    const res = await fetch(url, { redirect: 'manual', headers: { 'user-agent': 'raskrutov-cluster-audit' } });
    const loc = res.headers.get('location');
    return {
      url,
      status: res.status,
      location: loc,
      xrobots: res.headers.get('x-robots-tag'),
      final: res.status >= 300 && res.status < 400 && loc ? loc : url,
    };
  } catch (e) {
    return { url, status: 0, error: String(e) };
  }
}

const localGads = {};
const localPpc = {};
for (const c of CITIES) {
  localGads[c.slug] = parsePage(c.slug, fs.readFileSync(gadsPath(c.slug), 'utf8'), 'gads');
  localPpc[c.slug] = parsePage(c.slug, fs.readFileSync(ppcPath(c.slug), 'utf8'), 'ppc');
}

const issues = [];
function addIssue(severity, url, problem, evidence, rec) {
  issues.push({ severity, url, problem, evidence, recommended: rec });
}

// HTTP live
const live = {};
for (const c of CITIES) {
  live[c.slug] = await fetchStatus(liveUrl(c.slug));
  const extra = [
    liveUrl(c.slug).replace(/\/$/, ''),
    `${liveUrl(c.slug)}index.html`,
  ];
  live[c.slug].alts = [];
  for (const u of extra) live[c.slug].alts.push(await fetchStatus(u));
}

const national = await fetchStatus('https://raskrutov.kz/web-studiya/kontekstnaya-reklama/google-ads/');
const sitemapXml = await fetch('https://raskrutov.kz/sitemap.xml').then((r) => r.text());

const sitemapCounts = {};
for (const c of CITIES) {
  const u = liveUrl(c.slug);
  sitemapCounts[c.slug] = sitemapXml.split(u).length - 1;
}

const gadsHrefs = new Set();
const crossCity = [];
for (const c of CITIES) {
  for (const href of localGads[c.slug].hrefs) {
    if (href.startsWith('/') || href.startsWith('https://raskrutov.kz/')) {
      const abs = href.startsWith('http') ? href : `https://raskrutov.kz${href}`;
      if (!abs.includes('#') || abs.split('#')[0].length > 'https://raskrutov.kz'.length) {
        gadsHrefs.add(abs.split('#')[0]);
      }
    }
    const m = href.match(/\/google-ads\/([a-z-]+)\/?$/);
    if (m && m[1] && m[1] !== c.slug) {
      crossCity.push({ from: c.slug, to: m[1], href });
    }
    if (/localhost|127\.0\.0\.1|file:|staging/i.test(href)) {
      addIssue('HIGH', liveUrl(c.slug), 'non-production href', href, 'Replace with production path');
    }
  }
}

const linkResults = [];
let n200 = 0;
let n3xx = 0;
let n404 = 0;
let nOther = 0;
for (const u of [...gadsHrefs].sort()) {
  if (!u.startsWith('https://raskrutov.kz/')) continue;
  const r = await fetchStatus(u);
  linkResults.push(r);
  if (r.status === 200) n200++;
  else if (r.status >= 300 && r.status < 400) n3xx++;
  else if (r.status === 404) n404++;
  else nOther++;
  if (r.status === 404) addIssue('HIGH', u, 'broken internal link target', `404 from cluster pages`, 'Fix or remove link');
}

// wrong city
const wrongCity = [];
for (const c of CITIES) {
  const html = fs.readFileSync(gadsPath(c.slug), 'utf8');
  const text = stripTags(contentHtml(html)).toLowerCase();
  for (const other of CITIES) {
    if (other.slug === c.slug) continue;
    const hits = [];
    for (const f of other.forms) {
      const re = new RegExp(`(^|[^а-яёa-z])${f}([^а-яёa-z]|$)`, 'gi');
      if (re.test(text)) hits.push(f);
    }
    if (!hits.length) continue;
    const allowed =
      other.slug === 'petropavlovsk' && /петропавловск/.test(text) && /жумабаева|офис 606/.test(html.toLowerCase());
    wrongCity.push({
      source: c.slug,
      wrong: other.slug,
      forms: [...new Set(hits)],
      allowed: !!allowed,
      snippet: text.slice(Math.max(0, text.toLowerCase().indexOf(hits[0]) - 40), text.toLowerCase().indexOf(hits[0]) + 80),
    });
  }
}

// similarity
const rawSets = {};
const normSets = {};
for (const c of CITIES) {
  const w = words(localGads[c.slug].visible);
  rawSets[c.slug] = grams(w);
  normSets[c.slug] = grams(words(normalizeCityText(localGads[c.slug].visible, c.slug)));
}
const matrix = [];
const pairs = [];
for (let i = 0; i < CITIES.length; i++) {
  for (let j = i + 1; j < CITIES.length; j++) {
    const a = CITIES[i].slug;
    const b = CITIES[j].slug;
    const row = {
      a,
      b,
      raw: Number(jaccard(rawSets[a], rawSets[b]).toFixed(4)),
      cityNorm: Number(jaccard(normSets[a], normSets[b]).toFixed(4)),
    };
    pairs.push(row);
  }
}
pairs.sort((x, y) => y.cityNorm - x.cityNorm);
const median = (arr) => {
  const s = [...arr].sort((a, b) => a - b);
  return s[Math.floor(s.length / 2)];
};

// section similarity geo-ish
const geoSections = {};
for (const c of CITIES) {
  const html = fs.readFileSync(gadsPath(c.slug), 'utf8');
  geoSections[c.slug] = {};
  const ids = [...html.matchAll(/<section[^>]*id=["']([^"']+)["']/gi)].map((m) => m[1]);
  for (const id of ids) geoSections[c.slug][id] = sectionText(html, id);
}

const sectionDup = [];
const geoIds = ['geo-astana', 'geo', 'geotargeting', 'local'];
for (const c of CITIES) {
  const html = fs.readFileSync(gadsPath(c.slug), 'utf8');
  const geoId = [...html.matchAll(/<section[^>]*id=["']([^"']+)["']/gi)]
    .map((m) => m[1])
    .find((id) => /geo|local|region|zhetisu|zko|vko/i.test(id));
  geoSections[c.slug]._geoId = geoId || null;
  geoSections[c.slug]._geo = geoId ? sectionText(html, geoId) : '';
}

for (let i = 0; i < CITIES.length; i++) {
  for (let j = i + 1; j < CITIES.length; j++) {
    const a = CITIES[i].slug;
    const b = CITIES[j].slug;
    const ga = geoSections[a]._geo;
    const gb = geoSections[b]._geo;
    if (ga && gb && ga.length > 80 && gb.length > 80) {
      const ja = jaccard(grams(words(normalizeCityText(ga, a))), grams(words(normalizeCityText(gb, b))));
      if (ja >= 0.55) sectionDup.push({ a, b, section: 'geo', cityNorm: Number(ja.toFixed(4)) });
    }
    for (const id of ['setup', 'management', 'audience', 'faq']) {
      const sa = geoSections[a][id];
      const sb = geoSections[b][id];
      if (sa && sb && sa.length > 80) {
        const jn = jaccard(grams(words(normalizeCityText(sa, a))), grams(words(normalizeCityText(sb, b))));
        if (jn >= 0.7) sectionDup.push({ a, b, section: id, cityNorm: Number(jn.toFixed(4)) });
      }
    }
  }
}
sectionDup.sort((x, y) => y.cityNorm - x.cityNorm);

function intentFromTitleH1(title, h1, desc) {
  const t = `${title} ${h1} ${desc}`.toLowerCase();
  const gads = /google ads|реклам[аыу] google|реклам[аыу] в google|реклам[аыу] в гугл|настройк[аи] google|веден[иея] google/.test(t);
  const yandex = /яндекс|директ/.test(t);
  const ppc = /контекстн/.test(t);
  return { gads, yandex, ppc };
}

const cannibal = [];
for (const c of CITIES) {
  const g = localGads[c.slug];
  const p = localPpc[c.slug];
  const gi = intentFromTitleH1(g.title, g.h1, g.desc);
  const pi = intentFromTitleH1(p.title, p.h1, p.desc);
  const gSet = grams(words(g.visible));
  const pSet = grams(words(p.visible));
  const overlap = Number(jaccard(gSet, pSet).toFixed(4));
  const titleOverlap = g.title.replace(/raskrutov|\||—|-/gi, '').toLowerCase().includes('контекстн') &&
    p.title.toLowerCase().includes('контекстн');
  const h1Overlap = g.h1.toLowerCase().includes('контекстн') && p.h1.toLowerCase().includes('контекстн');
  let risk = 'LOW';
  let reason = 'Google Ads page owns Google intent; PPC twin owns general contextual advertising.';
  if (gi.ppc && !gi.gads) {
    risk = 'HIGH';
    reason = 'Google Ads page primary copy looks like general PPC.';
  } else if (titleOverlap || h1Overlap) {
    risk = 'HIGH';
    reason = 'Title/H1 both own контекстная реклама.';
  } else if (overlap >= 0.12) {
    risk = 'MEDIUM';
    reason = `Visible 5-gram overlap ${overlap} is elevated for different intents.`;
  }
  cannibal.push({
    city: c.slug,
    googleIntent: gi.gads ? 'google ads / реклама google' : gi.ppc ? 'contextual mixed' : 'unclear',
    ppcIntent: pi.ppc ? 'контекстная реклама' : pi.gads ? 'google-heavy' : 'unclear',
    titleG: g.title,
    titleP: p.title,
    h1G: g.h1,
    h1P: p.h1,
    overlap,
    risk,
    reason,
  });
}

// Playwright production smoke
const browser = await chromium.launch({ headless: true, channel: 'chrome' });
const smoke = {};
try {
  for (const c of CITIES) {
    const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
    const page = await context.newPage();
    const errors = [];
    page.on('pageerror', (e) => errors.push(String(e)));
    const resp = await page.goto(liveUrl(c.slug), { waitUntil: 'domcontentloaded', timeout: 60000 });
    await page.waitForTimeout(250);
    const geo = await page.evaluate(() => ({
      hScroll: Math.max(0, document.documentElement.scrollWidth - window.innerWidth),
      icons: document.querySelectorAll('.gads-scope-list__icon').length,
      items: document.querySelectorAll('.gads-scope-list__item').length,
      marks: document.querySelectorAll('.gads-tasks-panel__mark').length,
      lis: document.querySelectorAll('.gads-tasks-panel__list li').length,
      contacts: !!document.querySelector('#contacts'),
      h1: document.querySelector('h1')?.textContent?.trim() || '',
      canonical: document.querySelector('link[rel="canonical"]')?.href || '',
      robots: document.querySelector('meta[name="robots"]')?.content || '',
    }));
    smoke[c.slug] = { status: resp?.status() || 0, ...geo, console: errors.filter((e) => !/metrika|mc\.yandex/i.test(e)) };
    await context.close();
  }
} finally {
  await browser.close();
}

// issue scoring from collected data
for (const c of CITIES) {
  const url = liveUrl(c.slug);
  const g = localGads[c.slug];
  const l = live[c.slug];
  const sm = smoke[c.slug];
  if (l.status !== 200) addIssue('CRITICAL', url, 'not HTTP 200', String(l.status), 'Restore production page');
  if (l.status >= 300 && l.status < 400) addIssue('CRITICAL', url, 'redirect', l.location, 'Serve 200 at canonical URL');
  if (!/index,\s*follow/i.test(g.robots)) addIssue('CRITICAL', url, 'robots not index,follow', g.robots, 'Set index, follow');
  if (g.canonical !== url) addIssue('CRITICAL', url, 'canonical not self', g.canonical, 'Set self HTTPS trailing-slash canonical');
  if (sitemapCounts[c.slug] !== 1) addIssue('CRITICAL', url, 'sitemap count != 1', String(sitemapCounts[c.slug]), 'Keep URL once in sitemap');
  if (!g.schemaOk) addIssue('HIGH', url, 'JSON-LD parse fail', '', 'Fix JSON-LD');
  const areaName = g.areaServed?.name || '';
  const expectedArea = {
    almaty: 'Almaty',
    astana: 'Astana',
    shymkent: 'Shymkent',
    aktau: 'Aktau',
    aktobe: 'Aktobe',
    atyrau: 'Atyrau',
    karaganda: 'Karaganda',
    kokshetau: 'Kokshetau',
    kostanay: 'Kostanay',
    kyzylorda: 'Kyzylorda',
    pavlodar: 'Pavlodar',
    petropavlovsk: 'Petropavlovsk',
    semey: 'Semey',
    taldykorgan: 'Taldykorgan',
    taraz: 'Taraz',
    turkestan: 'Turkestan',
    uralsk: 'Uralsk',
    'ust-kamenogorsk': 'Ust-Kamenogorsk',
  }[c.slug];
  if (areaName !== expectedArea) addIssue('HIGH', url, 'areaServed name mismatch', `${areaName} vs ${expectedArea}`, 'Set Service.areaServed City name');
  if (g.h1s.length !== 1) addIssue('HIGH', url, 'H1 count', String(g.h1s.length), 'Keep one H1');
  if (sm.icons !== 6 || sm.items !== 6) addIssue('HIGH', url, 'DOM scope contract', `${sm.icons}/${sm.items}`, 'Restore icon+content 6/6');
  if (sm.marks !== 7 || sm.lis !== 7) addIssue('HIGH', url, 'DOM tasks contract', `${sm.marks}/${sm.lis}`, 'Restore mark+content 7/7');
  if (!sm.contacts) addIssue('HIGH', url, 'missing #contacts', '', 'Restore terminal section');
  if (sm.hScroll > 1) addIssue('MEDIUM', url, 'horizontal overflow 390', String(sm.hScroll), 'Fix overflow');
  const names = g.forms.map((f) => f.name).filter(Boolean);
  if (!names.some((n) => n.includes(c.slug.replace(/-/g, '_')) || n.includes(c.slug))) {
    addIssue('MEDIUM', url, 'form name may miss city slug', names.join(', '), 'Align form name with city');
  }
  if (g.faqVisible && g.faqSchema && g.faqVisible !== g.faqSchema) {
    addIssue('MEDIUM', url, 'FAQ visible vs schema count', `${g.faqVisible} vs ${g.faqSchema}`, 'Align FAQPage with visible FAQ');
  }
  const yBad = g.yandex.filter((x) => /яндекс|директ|yandex/i.test(x));
  if (yBad.length) addIssue('MEDIUM', url, 'Yandex/Direct token on Google Ads page', yBad.join(', '), 'Confirm contextual mention vs ownership leak');
  if (!g.priceHits.some((p) => /120\s*000/.test(p))) addIssue('HIGH', url, 'expected price missing', JSON.stringify(g.priceHits), 'Restore от 120 000 ₸ / мес');
}

const formNames = [];
for (const c of CITIES) {
  for (const f of localGads[c.slug].forms) formNames.push({ slug: c.slug, ...f });
}
const nameCount = {};
for (const f of formNames) nameCount[f.name] = (nameCount[f.name] || 0) + 1;
for (const [name, n] of Object.entries(nameCount)) {
  if (name && n > 1) addIssue('HIGH', 'cluster', 'duplicate form name', `${name} x${n}`, 'Make form names unique per city');
}

const titlesNorm = {};
for (const c of CITIES) {
  let t = localGads[c.slug].title.toLowerCase();
  t = normalizeCityText(t, c.slug).replace(/brand/g, '').replace(/[|—–,:.\-]/g, ' ').replace(/\s+/g, ' ').trim();
  titlesNorm[c.slug] = t;
}

const report = {
  generated: new Date().toISOString(),
  live,
  national,
  sitemapCounts,
  localGads: Object.fromEntries(
    CITIES.map((c) => [
      c.slug,
      {
        title: localGads[c.slug].title,
        desc: localGads[c.slug].desc,
        canonical: localGads[c.slug].canonical,
        robots: localGads[c.slug].robots,
        h1: localGads[c.slug].h1,
        h1Count: localGads[c.slug].h1s.length,
        forms: localGads[c.slug].forms,
        areaServed: localGads[c.slug].areaServed,
        orgLocality: localGads[c.slug].orgLocality,
        schemaTypes: localGads[c.slug].schemaTypes,
        schemaOk: localGads[c.slug].schemaOk,
        faqVisible: localGads[c.slug].faqVisible,
        faqSchema: localGads[c.slug].faqSchema,
        priceHits: localGads[c.slug].priceHits,
        yandex: localGads[c.slug].yandex,
        officeClaims: localGads[c.slug].officeClaims,
        titleLen: titleLen(localGads[c.slug].title),
        descLen: titleLen(localGads[c.slug].desc),
        titleNorm: titlesNorm[c.slug],
        h1Norm: normalizeCityText(localGads[c.slug].h1, c.slug),
      },
    ]),
  ),
  localPpc: Object.fromEntries(
    CITIES.map((c) => [
      c.slug,
      { title: localPpc[c.slug].title, h1: localPpc[c.slug].h1, desc: localPpc[c.slug].desc },
    ]),
  ),
  smoke,
  wrongCity,
  pairsTop: pairs.slice(0, 15),
  maxRaw: [...pairs].sort((a, b) => b.raw - a.raw)[0],
  maxNorm: pairs[0],
  medianRaw: median(pairs.map((p) => p.raw)),
  medianNorm: median(pairs.map((p) => p.cityNorm)),
  allPairs: pairs,
  sectionDup: sectionDup.slice(0, 40),
  cannibal,
  crossCity,
  linkSummary: { total: linkResults.length, n200, n3xx, n404, nOther, broken: linkResults.filter((r) => r.status === 404) },
  issues,
};

fs.writeFileSync(path.join(outDir, 'cluster-audit.json'), JSON.stringify(report, null, 2));

console.log('LIVE', CITIES.map((c) => `${c.slug}:${live[c.slug].status}`).join(' '));
console.log('SITEMAP', JSON.stringify(sitemapCounts));
console.log('DOM', CITIES.map((c) => `${c.slug}:${smoke[c.slug].icons}/${smoke[c.slug].items} ${smoke[c.slug].marks}/${smoke[c.slug].lis} h=${smoke[c.slug].hScroll}`).join('\n'));
console.log('MAX RAW', report.maxRaw);
console.log('MAX NORM', report.maxNorm);
console.log('MEDIAN', report.medianRaw, report.medianNorm);
console.log('WRONG CITY', wrongCity.filter((w) => !w.allowed).length, 'allowed', wrongCity.filter((w) => w.allowed).length);
console.log('CROSS', crossCity);
console.log('LINKS', report.linkSummary);
console.log('ISSUES', issues.length);
console.log('wrote cluster-audit.json');
