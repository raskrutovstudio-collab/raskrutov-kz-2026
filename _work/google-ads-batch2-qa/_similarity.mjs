import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const files = {
  astana: 'site_mirror/web-studiya/kontekstnaya-reklama/google-ads/astana/index.html',
  aktau: 'site_mirror/web-studiya/kontekstnaya-reklama/google-ads/aktau/index.html',
  atyrau: 'site_mirror/web-studiya/kontekstnaya-reklama/google-ads/atyrau/index.html',
  kokshetau: 'site_mirror/web-studiya/kontekstnaya-reklama/google-ads/kokshetau/index.html',
  kostanay: 'site_mirror/web-studiya/kontekstnaya-reklama/google-ads/kostanay/index.html',
  ppc_aktau: 'site_mirror/web-studiya/kontekstnaya-reklama/aktau/index.html',
  ppc_atyrau: 'site_mirror/web-studiya/kontekstnaya-reklama/atyrau/index.html',
  ppc_kokshetau: 'site_mirror/web-studiya/kontekstnaya-reklama/kokshetau/index.html',
  ppc_kostanay: 'site_mirror/web-studiya/kontekstnaya-reklama/kostanay/index.html',
  almaty: 'site_mirror/web-studiya/kontekstnaya-reklama/google-ads/almaty/index.html',
  shymkent: 'site_mirror/web-studiya/kontekstnaya-reklama/google-ads/shymkent/index.html',
  karaganda: 'site_mirror/web-studiya/kontekstnaya-reklama/google-ads/karaganda/index.html',
  aktobe: 'site_mirror/web-studiya/kontekstnaya-reklama/google-ads/aktobe/index.html',
};

const CITY_RE =
  /астане|астана|астаны|алматы|шымкенте|шымкент|караганде|караганда|актобе|актау|атырау|кокшетау|костанае|костаная|костанай|мангистау|бурабая|бурабай|щучинска|щаучинск|рудный|лисаковск|жанаозен|форт-шевченко/gi;

function visibleText(html) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&[a-z]+;/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();
}

function grams(text, n = 5) {
  const words = text.split(' ').filter(Boolean);
  const set = new Set();
  for (let i = 0; i <= words.length - n; i++) set.add(words.slice(i, i + n).join(' '));
  return set;
}

function jaccard(a, b) {
  if (!a.size && !b.size) return 1;
  let inter = 0;
  for (const x of a) if (b.has(x)) inter++;
  return inter / (a.size + b.size - inter);
}

const texts = {};
const sets = {};
const normSets = {};
for (const [k, rel] of Object.entries(files)) {
  const html = fs.readFileSync(path.join(root, rel), 'utf8');
  const t = visibleText(html);
  texts[k] = t;
  sets[k] = grams(t);
  normSets[k] = grams(t.replace(CITY_RE, 'CITY'));
}

function pair(a, b) {
  return {
    pair: `${a} vs ${b}`,
    jaccard5: Number(jaccard(sets[a], sets[b]).toFixed(4)),
    cityNorm: Number(jaccard(normSets[a], normSets[b]).toFixed(4)),
  };
}

const rows = [
  pair('aktau', 'astana'),
  pair('atyrau', 'astana'),
  pair('kokshetau', 'astana'),
  pair('kostanay', 'astana'),
  pair('aktau', 'ppc_aktau'),
  pair('atyrau', 'ppc_atyrau'),
  pair('kokshetau', 'ppc_kokshetau'),
  pair('kostanay', 'ppc_kostanay'),
  pair('aktau', 'atyrau'),
  pair('aktau', 'kokshetau'),
  pair('aktau', 'kostanay'),
  pair('atyrau', 'kokshetau'),
  pair('atyrau', 'kostanay'),
  pair('kokshetau', 'kostanay'),
];

const batch1 = ['almaty', 'shymkent', 'karaganda', 'aktobe'];
const batch2 = ['aktau', 'atyrau', 'kokshetau', 'kostanay'];
for (const n of batch2) {
  let best = { city: null, jaccard5: -1, cityNorm: -1 };
  for (const o of batch1) {
    const r = pair(n, o);
    if (r.jaccard5 > best.jaccard5) best = { city: o, jaccard5: r.jaccard5, cityNorm: r.cityNorm };
    rows.push(r);
  }
  rows.push({ pair: `${n} vs closest-batch1`, closest: best.city, jaccard5: best.jaccard5, cityNorm: best.cityNorm });
}

rows.sort((a, b) => b.jaccard5 - a.jaccard5);
const max = rows[0];
const citySwap = rows.some((r) => r.cityNorm >= 0.85 && !String(r.pair).includes('closest'));

const out = {
  metric: 'word 5-gram Jaccard on visible text',
  maxPair: max,
  citySwapDetected: citySwap ? 'YES' : 'NO',
  citySwapRule: 'city-normalized Jaccard >= 0.85',
  rows,
};
const dest = path.join(root, 'site_mirror/_work/google-ads-batch2-qa/similarity.json');
fs.writeFileSync(dest, JSON.stringify(out, null, 2));
console.log(JSON.stringify(out, null, 2));
