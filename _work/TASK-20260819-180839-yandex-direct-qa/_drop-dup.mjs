import fs from 'node:fs';
const p = 'site_mirror/web-studiya/kontekstnaya-reklama/yandex-direct/index.html';
const lines = fs.readFileSync(p, 'utf8').split(/\r?\n/);
const out = [...lines.slice(0, 183), ...lines.slice(252)].join('\n');
fs.writeFileSync(p, out);
console.log('lines', lines.length, '->', out.split('\n').length);
