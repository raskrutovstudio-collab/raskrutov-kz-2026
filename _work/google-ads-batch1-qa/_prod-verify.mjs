const urls = [
  ['almaty', 'https://raskrutov.kz/web-studiya/kontekstnaya-reklama/google-ads/almaty/'],
  ['shymkent', 'https://raskrutov.kz/web-studiya/kontekstnaya-reklama/google-ads/shymkent/'],
  ['karaganda', 'https://raskrutov.kz/web-studiya/kontekstnaya-reklama/google-ads/karaganda/'],
  ['aktobe', 'https://raskrutov.kz/web-studiya/kontekstnaya-reklama/google-ads/aktobe/'],
];
const expect = {
  almaty: {
    title: 'Google Ads в Алматы — настройка и ведение рекламы | Raskrutov',
    h1: 'Настройка и ведение Google Ads в Алматы',
  },
  shymkent: {
    title: 'Google Ads в Шымкенте — настройка и ведение рекламы | Raskrutov',
    h1: 'Настройка и ведение Google Ads в Шымкенте',
  },
  karaganda: {
    title: 'Google Ads в Караганде — настройка и ведение рекламы | Raskrutov',
    h1: 'Настройка и ведение Google Ads в Караганде',
  },
  aktobe: {
    title: 'Google Ads в Актобе — настройка и ведение рекламы | Raskrutov',
    h1: 'Настройка и ведение Google Ads в Актобе',
  },
};

function pick(html, re) {
  const m = html.match(re);
  return m ? m[1].trim() : '';
}

const out = [];
for (const [city, url] of urls) {
  const r = {
    city,
    http: null,
    title: 'FAIL',
    canonical: 'FAIL',
    robots: 'FAIL',
    schema: 'FAIL',
    assets: 'FAIL',
    h1: 'FAIL',
    consoleNote: 'not-browser',
    verdict: 'FAIL',
  };
  try {
    const res = await fetch(url, { redirect: 'manual' });
    r.http = res.status;
    const html = await res.text();
    const title = pick(html, /<title>([^<]*)<\/title>/i);
    const canonical = pick(html, /rel="canonical" href="([^"]+)"/i);
    const robots = pick(html, /name="robots" content="([^"]+)"/i);
    const h1 = pick(html, /<h1[^>]*>([\s\S]*?)<\/h1>/i).replace(/<[^>]+>/g, '').trim();
    r.title = title === expect[city].title ? 'PASS' : `FAIL:${title.slice(0, 90)}`;
    r.canonical = canonical === url ? 'PASS' : `FAIL:${canonical}`;
    r.robots = robots === 'index, follow' ? 'PASS' : `FAIL:${robots}`;
    r.h1 = h1 === expect[city].h1 ? 'PASS' : `FAIL:${h1}`;
    let schemaOk = false;
    const sm = html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/i);
    if (sm) {
      try {
        JSON.parse(sm[1]);
        schemaOk = true;
      } catch {}
    }
    r.schema = schemaOk ? 'PASS' : 'FAIL';
    const cssMatch = html.match(/href="([^"]+google-ads-page\.css[^"]*)"/);
    let cssOk = false;
    if (cssMatch) {
      const cssUrl = new URL(cssMatch[1], url).href;
      const cr = await fetch(cssUrl, { method: 'HEAD' });
      cssOk = cr.status === 200;
    }
    const form = /data-lead-form/.test(html);
    r.assets = cssOk && form ? 'PASS' : `FAIL css=${cssOk} form=${form}`;
    r.verdict =
      r.http === 200 &&
      r.title === 'PASS' &&
      r.canonical === 'PASS' &&
      r.robots === 'PASS' &&
      r.schema === 'PASS' &&
      r.h1 === 'PASS' &&
      r.assets === 'PASS'
        ? 'LIVE'
        : 'FAIL';
  } catch (e) {
    r.verdict = `FAIL:${e.message}`;
  }
  out.push(r);
  console.log(JSON.stringify(r));
}

const smRes = await fetch('https://raskrutov.kz/sitemap.xml');
const sxml = await smRes.text();
console.log('sitemap_http', smRes.status);
for (const [, u] of urls) {
  const n = sxml.split(u).length - 1;
  console.log('sitemap', u, 'count=' + n);
}
console.log('sitemap_astana_google_ads', (sxml.match(/google-ads\/astana/g) || []).length);
console.log('protected_ppc_almaty', (sxml.match(/kontekstnaya-reklama\/almaty\//g) || []).length);
