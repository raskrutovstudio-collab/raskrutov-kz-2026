const fs = require('fs');
const path = require('path');

const PAGE = path.resolve(__dirname, '../../../web-studiya/kontekstnaya-reklama/yandex-direct/karaganda/index.html');
let html = fs.readFileSync(PAGE, 'utf8');

const decode = (s) => s
  .replace(/<[^>]+>/g, '')
  .replace(/&nbsp;/g, ' ')
  .replace(/&mdash;/g, '—')
  .replace(/&laquo;/g, '«')
  .replace(/&raquo;/g, '»')
  .replace(/&amp;/g, '&')
  .replace(/&lt;/g, '<')
  .replace(/&gt;/g, '>')
  .replace(/&quot;/g, '"')
  .replace(/\s+/g, ' ')
  .trim();

const pairs = [];
for (let i = 1; i <= 12; i++) {
  const qRe = new RegExp('id="yd-kar-faq-q' + i + '"[^>]*>([\\s\\S]*?)</button>');
  const qAlt = new RegExp('<button[^>]*id="yd-kar-faq-q' + i + '"[^>]*>([\\s\\S]*?)</button>');
  const aRe = new RegExp('id="yd-kar-faq-a' + i + '"[^>]*>([\\s\\S]*?)</div>');
  const qm = html.match(qRe) || html.match(qAlt);
  const am = html.match(aRe);
  if (!qm || !am) throw new Error('FAQ ' + i + ' not found in DOM');
  pairs.push({ q: decode(qm[1]), a: decode(am[1]) });
}

const scriptRe = /<script type="application\/ld\+json">([\s\S]*?)<\/script>/g;
let replaced = 0;
html = html.replace(scriptRe, (full, body) => {
  let data;
  try { data = JSON.parse(body); } catch (e) { throw new Error('JSON-LD parse failed: ' + e.message); }
  const nodes = data['@graph'] || [data];
  let touched = false;
  for (const node of nodes) {
    const t = node['@type'];
    const types = Array.isArray(t) ? t : [t];
    if (types.includes('FAQPage')) {
      node.mainEntity = pairs.map(p => ({
        '@type': 'Question',
        name: p.q,
        acceptedAnswer: { '@type': 'Answer', text: p.a }
      }));
      touched = true;
    }
  }
  if (!touched) return full;
  replaced++;
  return '<script type="application/ld+json">' + JSON.stringify(data) + '</script>';
});

if (!replaced) throw new Error('FAQPage node not found in JSON-LD');
fs.writeFileSync(PAGE, html, 'utf8');
console.log('FAQPage synced from DOM. Items: ' + pairs.length);
pairs.forEach((p, i) => console.log((i + 1) + '. ' + p.q));
