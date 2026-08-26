import fs from 'fs';

const p = 'site_mirror/web-studiya/kontekstnaya-reklama/yandex-direct/astana/index.html';
let h = fs.readFileSync(p, 'utf8');
const qs = [...h.matchAll(/class="yd-faq__btn"[^>]*>([^<]+)<\/button>/g)].map((m) => m[1].trim());
const as = [...h.matchAll(/class="yd-faq__a"[^>]*>([\s\S]*?)<\/div>/g)].map((m) =>
  m[1].replace(/<[^>]+>/g, '').trim()
);
if (qs.length !== as.length) throw new Error(`FAQ mismatch ${qs.length} vs ${as.length}`);
const entities = qs.map((q, i) => ({
  '@type': 'Question',
  name: q,
  acceptedAnswer: { '@type': 'Answer', text: as[i] },
}));
const m = h.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/);
if (!m) throw new Error('no ld+json');
const data = JSON.parse(m[1]);
const faq = data['@graph'].find((x) => x['@type'] === 'FAQPage');
faq.mainEntity = entities;
h = h.replace(m[0], `<script type="application/ld+json">${JSON.stringify(data)}</script>`);
fs.writeFileSync(p, h);
let ok = true;
entities.forEach((e, i) => {
  if (e.name !== qs[i] || e.acceptedAnswer.text !== as[i]) ok = false;
});
console.log(JSON.stringify({ count: entities.length, match: ok, q1: qs[0], a1: as[0].slice(0, 80) }, null, 2));
