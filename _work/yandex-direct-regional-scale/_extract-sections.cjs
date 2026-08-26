const fs = require('fs');
const path = require('path');
const city = process.argv[2] || 'taraz';
const file = path.join(
  'site_mirror/web-studiya/kontekstnaya-reklama/yandex-direct',
  city,
  'index.html'
);
const h = fs.readFileSync(file, 'utf8');
const sections = [...h.matchAll(/<section\b([^>]*)>([\s\S]*?)<\/section>/gi)];
for (const m of sections) {
  const attrs = m[1];
  const id = (attrs.match(/\bid="([^"]+)"/) || [])[1] || '(no-id)';
  const aria = (attrs.match(/\baria-label="([^"]+)"/) || [])[1] || '';
  const text = m[2]
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  console.log('\n==== ' + id + (aria ? ' | ' + aria : '') + ' ====');
  console.log(text.slice(0, 900));
}
console.log('\nTOTAL_SECTIONS', sections.length);
console.log('BYTES', Buffer.byteLength(h));
