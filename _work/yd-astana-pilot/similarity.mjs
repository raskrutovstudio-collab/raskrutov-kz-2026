import fs from 'fs';

function mainText(html) {
  let t = html.replace(/<script[\s\S]*?<\/script>/gi, ' ').replace(/<style[\s\S]*?<\/style>/gi, ' ');
  const m = t.match(/<main[\s\S]*?<\/main>/i);
  t = m ? m[0] : t;
  t = t
    .replace(/<nav class="rk-breadcrumbs"[\s\S]*?<\/nav>/i, ' ')
    .replace(/id="contacts"[\s\S]*?<\/section>/i, ' ')
    .replace(/id="related"[\s\S]*?<\/section>/i, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&[a-z#0-9]+;/gi, ' ')
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]+/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  return t;
}

function grams(s, n = 5) {
  const w = s.split(' ').filter(Boolean);
  const set = new Set();
  for (let i = 0; i + n <= w.length; i++) set.add(w.slice(i, i + n).join(' '));
  return set;
}

function jaccard(a, b) {
  let inter = 0;
  for (const x of a) if (b.has(x)) inter++;
  const uni = a.size + b.size - inter;
  return uni ? inter / uni : 0;
}

function containment(a, b) {
  if (!a.size) return 0;
  let inter = 0;
  for (const x of a) if (b.has(x)) inter++;
  return inter / a.size;
}

function longest(aText, bText) {
  const a = aText.split(' ');
  const b = bText.split(' ');
  const bindex = new Map();
  for (let i = 0; i < b.length; i++) {
    const w = b[i];
    if (!bindex.has(w)) bindex.set(w, []);
    bindex.get(w).push(i);
  }
  let best = { len: 0, text: '' };
  for (let i = 0; i < a.length; i++) {
    for (const j of bindex.get(a[i]) || []) {
      let k = 0;
      while (i + k < a.length && j + k < b.length && a[i + k] === b[j + k]) k++;
      if (k > best.len) best = { len: k, text: a.slice(i, i + Math.min(k, 30)).join(' ') };
    }
  }
  return best;
}

const files = {
  ydAst: 'site_mirror/web-studiya/kontekstnaya-reklama/yandex-direct/astana/index.html',
  yd: 'site_mirror/web-studiya/kontekstnaya-reklama/yandex-direct/index.html',
  ctxAst: 'site_mirror/web-studiya/kontekstnaya-reklama/astana/index.html',
  gadsAst: 'site_mirror/web-studiya/kontekstnaya-reklama/google-ads/astana/index.html',
  ctx: 'site_mirror/web-studiya/kontekstnaya-reklama/index.html',
};

const texts = {};
for (const [k, p] of Object.entries(files)) texts[k] = mainText(fs.readFileSync(p, 'utf8'));
const base = grams(texts.ydAst);
const rows = [];
for (const [k, t] of Object.entries(texts)) {
  if (k === 'ydAst') continue;
  const g = grams(t);
  const lc = longest(texts.ydAst, t);
  rows.push({
    vs: k,
    containment: +(containment(base, g) * 100).toFixed(2),
    jaccard: +(jaccard(base, g) * 100).toFixed(2),
    longestWords: lc.len,
    preview: lc.text,
    pass: containment(base, g) <= 0.15 && jaccard(base, g) <= 0.1,
  });
}
console.log(JSON.stringify(rows, null, 2));
