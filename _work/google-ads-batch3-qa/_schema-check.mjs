import fs from 'node:fs';

const cities = ['kyzylorda', 'pavlodar', 'petropavlovsk', 'semey'];
for (const c of cities) {
  const html = fs.readFileSync(
    `site_mirror/web-studiya/kontekstnaya-reklama/google-ads/${c}/index.html`,
    'utf8',
  );
  const m = html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/);
  if (!m) throw new Error(`${c} no jsonld`);
  const data = JSON.parse(m[1]);
  const g = data['@graph'];
  const types = g.map((x) => [].concat(x['@type']).join('+'));
  const area = g.find((x) => x['@type'] === 'Service').areaServed;
  const blob = JSON.stringify(g);
  const fake = blob.includes('LocalBusiness') || blob.includes('aggregateRating');
  const org = g.find((x) => [].concat(x['@type']).includes('Organization'));
  console.log(
    JSON.stringify({
      c,
      types,
      area: area.name,
      office: org.address.addressLocality,
      fake,
      faq: g.find((x) => x['@type'] === 'FAQPage').mainEntity.length,
    }),
  );
}
