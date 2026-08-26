const fs = require('fs');
function paras(p) {
  const h = fs.readFileSync(p, 'utf8');
  return [...h.matchAll(/<p[^>]*>([\s\S]*?)<\/p>/gi)]
    .map(m => m[1].replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim())
    .filter(t => t.length > 120);
}
const pilot = paras('site_mirror/web-studiya/kontekstnaya-reklama/google-ads/astana/index.html');
const rep = paras('site_mirror/web-studiya/kontekstnaya-reklama/google-ads/index.html');
const kontekst = paras('site_mirror/web-studiya/kontekstnaya-reklama/astana/index.html');
console.log('PILOT#1:', (pilot[0] || 'NONE').slice(0, 200));
console.log('PILOT#2:', (pilot[1] || 'NONE').slice(0, 200));
console.log('REP#1:', (rep[0] || 'NONE').slice(0, 200));
console.log('REP#2:', (rep[1] || 'NONE').slice(0, 200));
console.log('KONTEKST#1:', (kontekst[0] || 'NONE').slice(0, 200));
console.log('KONTEKST#2:', (kontekst[1] || 'NONE').slice(0, 200));
function anyIdent(a, b, label) {
  let hits = 0;
  for (const p of a) {
    if (b.includes(p)) {
      hits++;
      console.log('IDENTICAL vs ' + label + ':', p.slice(0, 120));
    }
  }
  if (!hits) console.log('No identical long paras vs ' + label);
}
anyIdent(pilot, rep, 'republican google-ads');
anyIdent(pilot, kontekst, 'kontekst/astana');
