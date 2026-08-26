const fs = require('fs');
const h = fs.readFileSync('site_mirror/web-studiya/kontekstnaya-reklama/google-ads/astana/index.html', 'utf8');
const keys = ['modal', 'dialog', 'faq', 'sticky', 'ym(', '101127167', 'webvisor', 'data-open', 'aria-expanded', 'lead', 'popup'];
for (const k of keys) {
  console.log(k, h.toLowerCase().includes(k.toLowerCase()) ? 'YES' : 'NO');
}
const cls = [...h.matchAll(/class="([^"]+)"/g)].map(m => m[1]).filter(c => /modal|faq|sticky|dialog|popup|overlay|cta/i.test(c));
console.log([...new Set(cls)].slice(0, 50).join('\n'));
const ids = [...h.matchAll(/id="([^"]+)"/g)].map(m => m[1]).filter(c => /modal|faq|sticky|dialog|popup|form|cta/i.test(c));
console.log('IDS:', ids.join(', '));
