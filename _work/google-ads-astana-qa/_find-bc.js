const fs = require('fs');
const p = 'site_mirror/web-studiya/kontekstnaya-reklama/google-ads/astana/index.html';
const h = fs.readFileSync(p, 'utf8');
const idx = h.indexOf('rk-breadcrumbs');
console.log('snippet around breadcrumbs:');
console.log(h.slice(Math.max(0, idx - 200), idx + 800));
console.log('---style tags count', (h.match(/<style/gi)||[]).length);
const styleMatch = h.match(/<style[\s\S]*?<\/style>/gi);
if (styleMatch) console.log('first style len', styleMatch[0].length, styleMatch[0].slice(0,300));
