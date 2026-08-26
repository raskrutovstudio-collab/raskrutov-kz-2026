import fs from 'node:fs';

const cities = ['kyzylorda', 'pavlodar', 'petropavlovsk', 'semey'];
const sm = fs.readFileSync('site_mirror/sitemap.xml', 'utf8');
for (const c of cities) {
  const url = `https://raskrutov.kz/web-studiya/kontekstnaya-reklama/google-ads/${c}/`;
  const n = sm.split(url).length - 1;
  console.log(c, 'sitemap_count', n);
}
console.log('astana_gads', sm.split('google-ads/astana/').length - 1);

for (const c of cities) {
  const p = `site_mirror/web-studiya/kontekstnaya-reklama/google-ads/${c}/index.html`;
  const html = fs.readFileSync(p, 'utf8');
  const m = html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/);
  try {
    JSON.parse(m[1]);
    console.log(c, 'schema PARSE_OK');
  } catch (e) {
    console.log(c, 'schema FAIL', e.message);
  }
  const canon = html.includes(
    `rel="canonical" href="https://raskrutov.kz/web-studiya/kontekstnaya-reklama/google-ads/${c}/"`,
  );
  console.log(c, 'canonical', canon);
  console.log(c, 'robots', html.includes('index, follow'));
  console.log(c, 'preload', (html.match(/rel="preload"/g) || []).length);
}
