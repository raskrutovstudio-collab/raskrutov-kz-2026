import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const OUT = path.dirname(fileURLToPath(import.meta.url));

function getLcp(report) {
  const a = report.audits['largest-contentful-paint-element'];
  const items = a?.details?.items || [];
  for (const top of items) {
    if (top.node?.snippet) return String(top.node.snippet);
    if (top.node?.selector) return String(top.node.selector);
    for (const n of top.items || []) {
      if (n.node?.snippet) return String(n.node.snippet);
      if (n.node?.selector) return String(n.node.selector);
    }
  }
  return '';
}

function clean(s) {
  return String(s).replace(/\s+/g, ' ').trim();
}

const cities = ['almaty', 'shymkent', 'karaganda', 'aktobe'];
const labels = ['m1', 'm2', 'm3', 'd'];
const lcpMap = {};
for (const city of cities) {
  lcpMap[city] = {};
  for (const lab of labels) {
    const report = JSON.parse(fs.readFileSync(path.join(OUT, `lh-pass2-${city}-${lab}.json`), 'utf8'));
    lcpMap[city][lab] = clean(getLcp(report));
  }
}

// Pass1 karaganda LCP too
const p1lcp = {};
for (const lab of labels) {
  const report = JSON.parse(fs.readFileSync(path.join(OUT, `lh-karaganda-${lab}.json`), 'utf8'));
  p1lcp[lab] = clean(getLcp(report));
}

let overview = fs.readFileSync(path.join(OUT, 'lh-pass2-overview.txt'), 'utf8');
for (const city of cities) {
  const blockRe = new RegExp(
    `(CITY: ${city.toUpperCase()}[\\s\\S]*?)LCP element m1: [^\\n]*\\nLCP element m2: [^\\n]*\\nLCP element m3: [^\\n]*\\nLCP element  d: [^\\n]*`,
    'm'
  );
  overview = overview.replace(
    blockRe,
    `$1LCP element m1: ${lcpMap[city].m1}\nLCP element m2: ${lcpMap[city].m2}\nLCP element m3: ${lcpMap[city].m3}\nLCP element  d: ${lcpMap[city].d}`
  );
}
fs.writeFileSync(path.join(OUT, 'lh-pass2-overview.txt'), overview, 'utf8');

let diag = fs.readFileSync(path.join(OUT, 'karaganda-perf-diagnosis.txt'), 'utf8');
const lcpSection = [
  '--- LCP ELEMENT ---',
  `Pass1 m1: ${p1lcp.m1}`,
  `Pass2 m1: ${lcpMap.karaganda.m1}`,
  `Pass1 m2: ${p1lcp.m2}`,
  `Pass2 m2: ${lcpMap.karaganda.m2}`,
  `Pass1 m3: ${p1lcp.m3}`,
  `Pass2 m3: ${lcpMap.karaganda.m3}`,
  `Pass1 d: ${p1lcp.d}`,
  `Pass2 d: ${lcpMap.karaganda.d}`,
  '',
].join('\n');
diag = diag.replace(/--- LCP ELEMENT ---[\s\S]*?(?=--- RENDER-BLOCKING ---)/, lcpSection + '\n');
fs.writeFileSync(path.join(OUT, 'karaganda-perf-diagnosis.txt'), diag, 'utf8');

console.log('Patched LCP elements');
console.log(JSON.stringify({ pass2: lcpMap, pass1Karaganda: p1lcp }, null, 2));
