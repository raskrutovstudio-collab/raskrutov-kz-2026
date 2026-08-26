import fs from 'node:fs';
import path from 'node:path';

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

const AREA = {
  almaty: 'Almaty', astana: 'Astana', shymkent: 'Shymkent', aktau: 'Aktau', aktobe: 'Aktobe',
  atyrau: 'Atyrau', karaganda: 'Karaganda', kokshetau: 'Kokshetau', kostanay: 'Kostanay',
  kyzylorda: 'Kyzylorda', pavlodar: 'Pavlodar', petropavlovsk: 'Petropavlovsk', semey: 'Semey',
  taldykorgan: 'Taldykorgan', taraz: 'Taraz', turkestan: 'Turkestan', uralsk: 'Uralsk',
  'ust-kamenogorsk': 'Ust-Kamenogorsk',
};

const liveUrl = (s) => `https://raskrutov.kz/web-studiya/kontekstnaya-reklama/google-ads/${s}/`;
const gadsPath = (s) => path.join(root, `site_mirror/web-studiya/kontekstnaya-reklama/google-ads/${s}/index.html`);
const ppcPath = (s) => path.join(root, `site_mirror/web-studiya/kontekstnaya-reklama/${s}/index.html`);

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
  return body
    .replace(/<header[\s\S]*?<\/header>/gi, ' ')
    .replace(/<nav[\s\S]*?<\/nav>/gi, ' ')
    .replace(/<form[\s\S]*?<\/form>/gi, ' ')
    .replace(/id="contacts"[\s\S]*?<\/section>/i, ' ')
    .replace(/class="rk-sticky-cta"[\s\S]*?<\/nav>/i, ' ');
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
  for (const f of [...city.forms].sort((a, b) => b.length - a.length)) t = t.split(f).join('CITY');
  return t.replace(/raskrutov/gi, 'BRAND');
}
function sectionText(html, id) {
  const re = new RegExp(`<section[^>]*id=["']${id}["'][^>]*>([\\s\\S]*?)</section>`, 'i');
  const m = html.match(re);
  return m ? stripTags(m[1]).toLowerCase() : '';
}

function parse(slug, html) {
  const title = attr(html, /<title>([^<]*)<\/title>/i);
  const desc =
    attr(html, /<meta[^>]*name=["']description["'][^>]*content=["']([^"']*)["']/i) ||
    attr(html, /<meta[^>]*content=["']([^"']*)["'][^>]*name=["']description["']/i);
  const canonical = attr(html, /<link[^>]*rel=["']canonical["'][^>]*href=["']([^"']*)["']/i);
  const robots = attr(html, /<meta[^>]*name=["']robots["'][^>]*content=["']([^"']*)["']/i);
  const h1s = all(html, /<h1[^>]*>([\s\S]*?)<\/h1>/gi).map((h) => stripTags(h));
  const forms = [...html.matchAll(/<form([^>]*)>/gi)].map((m) => ({
    name: (m[1].match(/name=["']([^"']+)["']/) || [])[1] || '',
    id: (m[1].match(/\sid=["']([^"']+)["']/) || [])[1] || '',
    formName: (m[1].match(/data-form-name=["']([^"']+)["']/) || [])[1] || '',
  }));
  let schemaOk = true;
  const schemaTypes = [];
  let areaServed = null;
  let orgLocality = null;
  let faqSchema = 0;
  let breadcrumb = [];
  for (const raw of all(html, /<script type=["']application\/ld\+json["']>([\s\S]*?)<\/script>/gi)) {
    try {
      const json = JSON.parse(raw);
      const graph = json['@graph'] || (Array.isArray(json) ? json : [json]);
      for (const n of graph) {
        schemaTypes.push(n['@type']);
        if (n['@type'] === 'Service' && n.areaServed) areaServed = n.areaServed;
        if (Array.isArray(n['@type']) && n['@type'].includes('Organization') && n.address) orgLocality = n.address.addressLocality;
        if (n['@type'] === 'FAQPage') faqSchema = n.mainEntity?.length || 0;
        if (n['@type'] === 'BreadcrumbList') breadcrumb = n.itemListElement || [];
      }
    } catch {
      schemaOk = false;
    }
  }
  const faqVisible = (html.match(/gads-faq__item/g) || []).length;
  const hrefs = all(html, /href=["']([^"']+)["']/gi);
  return {
    title, desc, canonical, robots, h1s, h1: h1s[0] || '', forms, schemaOk, schemaTypes, areaServed, orgLocality,
    faqVisible, faqSchema, breadcrumb,
    priceHits: [...html.matchAll(/от\s*[0-9\s]+₸/g)].map((m) => m[0].replace(/\s+/g, ' ')),
    yandex: [...html.matchAll(/яндекс|yandex|директ/gi)].map((m) => m[0]),
    officeClaims: [...html.matchAll(/наш офис[^.<]{0,90}|офис в [^.<]{0,50}|местн(?:ая|ой) команд/gi)].map((m) => m[0]),
    hrefs,
    scopeItems: (html.match(/gads-scope-list__item/g) || []).length,
    scopeIcons: (html.match(/gads-scope-list__icon/g) || []).length,
    taskMarks: (html.match(/gads-tasks-panel__mark/g) || []).length,
    taskLis: ((html.match(/gads-tasks-panel__list[\s\S]*?<\/ul>/) || [''])[0].match(/<li/g) || []).length,
    hasContacts: /id=["']contacts["']/.test(html),
    visible: stripTags(contentHtml(html)),
    html,
  };
}

const gads = {};
const ppc = {};
for (const c of CITIES) {
  gads[c.slug] = parse(c.slug, fs.readFileSync(gadsPath(c.slug), 'utf8'));
  ppc[c.slug] = parse(c.slug, fs.readFileSync(ppcPath(c.slug), 'utf8'));
}

const rawSets = {};
const normSets = {};
for (const c of CITIES) {
  rawSets[c.slug] = grams(words(gads[c.slug].visible));
  normSets[c.slug] = grams(words(normalizeCityText(gads[c.slug].visible, c.slug)));
}
const pairs = [];
for (let i = 0; i < CITIES.length; i++) {
  for (let j = i + 1; j < CITIES.length; j++) {
    const a = CITIES[i].slug;
    const b = CITIES[j].slug;
    pairs.push({
      a, b,
      raw: Number(jaccard(rawSets[a], rawSets[b]).toFixed(4)),
      cityNorm: Number(jaccard(normSets[a], normSets[b]).toFixed(4)),
    });
  }
}
pairs.sort((x, y) => y.cityNorm - x.cityNorm);
const median = (arr) => [...arr].sort((a, b) => a - b)[Math.floor(arr.length / 2)];

const wrongCity = [];
for (const c of CITIES) {
  const text = gads[c.slug].visible.toLowerCase();
  const html = gads[c.slug].html.toLowerCase();
  for (const other of CITIES) {
    if (other.slug === c.slug) continue;
    const hits = other.forms.filter((f) => new RegExp(`(^|[^а-яёa-z-])${f}([^а-яёa-z-]|$)`, 'i').test(text));
    if (!hits.length) continue;
    const allowed = other.slug === 'petropavlovsk' && /жумабаева|офис 606/.test(html);
    const idx = text.indexOf(hits[0]);
    wrongCity.push({
      source: c.slug, wrong: other.slug, forms: hits, allowed,
      snippet: text.slice(Math.max(0, idx - 50), idx + 70),
    });
  }
}

const sectionDup = [];
for (let i = 0; i < CITIES.length; i++) {
  for (let j = i + 1; j < CITIES.length; j++) {
    const a = CITIES[i].slug;
    const b = CITIES[j].slug;
    const ha = gads[a].html;
    const hb = gads[b].html;
    const idsA = [...ha.matchAll(/<section[^>]*id=["']([^"']+)["']/gi)].map((m) => m[1]);
    const geoA = idsA.find((id) => /geo|local|region/i.test(id));
    const idsB = [...hb.matchAll(/<section[^>]*id=["']([^"']+)["']/gi)].map((m) => m[1]);
    const geoB = idsB.find((id) => /geo|local|region/i.test(id));
    if (geoA && geoB) {
      const ja = jaccard(grams(words(normalizeCityText(sectionText(ha, geoA), a))), grams(words(normalizeCityText(sectionText(hb, geoB), b))));
      if (ja >= 0.5) sectionDup.push({ a, b, section: `${geoA}/${geoB}`, cityNorm: Number(ja.toFixed(4)) });
    }
    for (const id of ['setup', 'management', 'audience', 'faq', 'about']) {
      const sa = sectionText(ha, id);
      const sb = sectionText(hb, id);
      if (sa.length > 80 && sb.length > 80) {
        const jn = jaccard(grams(words(normalizeCityText(sa, a))), grams(words(normalizeCityText(sb, b))));
        if (jn >= 0.65) sectionDup.push({ a, b, section: id, cityNorm: Number(jn.toFixed(4)) });
      }
    }
  }
}
sectionDup.sort((x, y) => y.cityNorm - x.cityNorm);

function intent(title, h1, desc) {
  const t = `${title} ${h1} ${desc}`.toLowerCase();
  return {
    gads: /google ads|реклам[аыу] google|реклам[аыу] в google|реклам[аыу] в гугл|настройк[аие] google|веден[иея] google/.test(t),
    yandex: /яндекс|директ/.test(t),
    ppc: /контекстн/.test(t),
  };
}

const cannibal = CITIES.map((c) => {
  const g = gads[c.slug];
  const p = ppc[c.slug];
  const gi = intent(g.title, g.h1, g.desc);
  const pi = intent(p.title, p.h1, p.desc);
  const overlap = Number(jaccard(grams(words(g.visible)), grams(words(p.visible))).toFixed(4));
  const gOwnsPpc = /контекстн/.test(g.title.toLowerCase()) && !/google/.test(g.title.toLowerCase());
  const h1Ppc = /контекстн/.test(g.h1.toLowerCase()) && !/google/.test(g.h1.toLowerCase());
  let risk = 'LOW';
  let reason = 'Google Ads title/H1 own Google intent; PPC twin owns контекстная реклама.';
  if (gOwnsPpc || h1Ppc) {
    risk = 'HIGH';
    reason = 'Google Ads page title/H1 looks like general PPC.';
  } else if (gi.ppc && gi.gads) {
    risk = 'MEDIUM';
    reason = 'Google Ads metadata also contains контекстная реклама phrasing.';
  } else if (overlap >= 0.12) {
    risk = 'MEDIUM';
    reason = `5-gram overlap ${overlap} is elevated.`;
  }
  return {
    city: c.slug, gi, pi, overlap, risk, reason,
    titleG: g.title, titleP: p.title, h1G: g.h1, h1P: p.h1,
  };
});

const crossCity = [];
const hrefs = new Set();
for (const c of CITIES) {
  for (const href of gads[c.slug].hrefs) {
    if (href.startsWith('/') || href.startsWith('https://raskrutov.kz/')) {
      const abs = (href.startsWith('http') ? href : `https://raskrutov.kz${href}`).split('#')[0];
      hrefs.add(abs);
    }
    const m = href.match(/\/google-ads\/([a-z-]+)\/?$/);
    if (m && m[1] && m[1] !== c.slug) crossCity.push({ from: c.slug, to: m[1], href });
  }
}

const expectedLinks = {};
for (const c of CITIES) {
  const h = gads[c.slug].hrefs;
  expectedLinks[c.slug] = {
    parent: h.some((x) => x === '/web-studiya/kontekstnaya-reklama/google-ads/' || x.endsWith('/google-ads/')),
    ppc: h.some((x) => x.includes(`/kontekstnaya-reklama/${c.slug}`)),
    studio: h.some((x) => x === `/web-studiya/${c.slug}/` || x.endsWith(`/web-studiya/${c.slug}/`)),
    seo: h.some((x) => x.includes(`/seo-prodvizhenie/${c.slug}`)),
    sites: h.some((x) => x.includes(`/sozdanie-saitov/${c.slug}`)),
    cases: h.some((x) => x.includes('/keysy/prodvizhenie')),
  };
}

const formDup = {};
for (const c of CITIES) {
  for (const f of gads[c.slug].forms) {
    if (!f.name) continue;
    formDup[f.name] = formDup[f.name] || [];
    formDup[f.name].push(c.slug);
  }
}

const titlesNorm = {};
for (const c of CITIES) {
  titlesNorm[c.slug] = normalizeCityText(gads[c.slug].title, c.slug).replace(/brand/g, '').replace(/[|—–,:.\-]/g, ' ').replace(/\s+/g, ' ').trim();
}
const titleGroups = {};
for (const [slug, t] of Object.entries(titlesNorm)) {
  titleGroups[t] = titleGroups[t] || [];
  titleGroups[t].push(slug);
}

const descNorm = {};
for (const c of CITIES) {
  descNorm[c.slug] = normalizeCityText(gads[c.slug].desc, c.slug).replace(/brand/g, '').replace(/\s+/g, ' ').trim();
}

fs.writeFileSync(path.join(outDir, 'local-cluster.json'), JSON.stringify({
  gads: Object.fromEntries(CITIES.map((c) => [c.slug, {
    title: gads[c.slug].title, desc: gads[c.slug].desc, canonical: gads[c.slug].canonical, robots: gads[c.slug].robots,
    h1: gads[c.slug].h1, h1Count: gads[c.slug].h1s.length, forms: gads[c.slug].forms, areaServed: gads[c.slug].areaServed,
    orgLocality: gads[c.slug].orgLocality, schemaOk: gads[c.slug].schemaOk, schemaTypes: gads[c.slug].schemaTypes,
    faqVisible: gads[c.slug].faqVisible, faqSchema: gads[c.slug].faqSchema, breadcrumb: gads[c.slug].breadcrumb,
    priceHits: gads[c.slug].priceHits, yandex: gads[c.slug].yandex, officeClaims: gads[c.slug].officeClaims,
    scopeItems: gads[c.slug].scopeItems, scopeIcons: gads[c.slug].scopeIcons, taskMarks: gads[c.slug].taskMarks,
    taskLis: gads[c.slug].taskLis, hasContacts: gads[c.slug].hasContacts, titleLen: [...gads[c.slug].title].length,
    descLen: [...gads[c.slug].desc].length, titleNorm: titlesNorm[c.slug], h1Norm: normalizeCityText(gads[c.slug].h1, c.slug),
    expectedLinks: expectedLinks[c.slug],
  }])),
  ppc: Object.fromEntries(CITIES.map((c) => [c.slug, { title: ppc[c.slug].title, h1: ppc[c.slug].h1, desc: ppc[c.slug].desc }])),
  pairsTop: pairs.slice(0, 15),
  maxRaw: [...pairs].sort((a, b) => b.raw - a.raw)[0],
  maxNorm: pairs[0],
  medianRaw: median(pairs.map((p) => p.raw)),
  medianNorm: median(pairs.map((p) => p.cityNorm)),
  allPairs: pairs,
  wrongCity,
  sectionDup: sectionDup.slice(0, 50),
  cannibal,
  crossCity,
  hrefs: [...hrefs].sort(),
  formDup: Object.fromEntries(Object.entries(formDup).filter(([, v]) => v.length > 1)),
  titleGroups: Object.fromEntries(Object.entries(titleGroups).filter(([, v]) => v.length > 1)),
  descNorm,
}, null, 2));

console.log('maxRaw', [...pairs].sort((a, b) => b.raw - a.raw)[0]);
console.log('maxNorm', pairs[0]);
console.log('median', median(pairs.map((p) => p.raw)), median(pairs.map((p) => p.cityNorm)));
console.log('wrong allowed', wrongCity.filter((w) => w.allowed).length, 'suspicious', wrongCity.filter((w) => !w.allowed).length);
console.log('cross', crossCity);
console.log('formDup', formDup);
console.log('titleGroups', titleGroups);
console.log('hrefs', hrefs.size);
console.log('sectionDup top', sectionDup.slice(0, 10));
