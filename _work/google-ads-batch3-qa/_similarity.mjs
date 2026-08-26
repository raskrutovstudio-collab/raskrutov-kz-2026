import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const files = {
  astana: 'site_mirror/web-studiya/kontekstnaya-reklama/google-ads/astana/index.html',
  kyzylorda: 'site_mirror/web-studiya/kontekstnaya-reklama/google-ads/kyzylorda/index.html',
  pavlodar: 'site_mirror/web-studiya/kontekstnaya-reklama/google-ads/pavlodar/index.html',
  petropavlovsk: 'site_mirror/web-studiya/kontekstnaya-reklama/google-ads/petropavlovsk/index.html',
  semey: 'site_mirror/web-studiya/kontekstnaya-reklama/google-ads/semey/index.html',
  ppc_kyzylorda: 'site_mirror/web-studiya/kontekstnaya-reklama/kyzylorda/index.html',
  ppc_pavlodar: 'site_mirror/web-studiya/kontekstnaya-reklama/pavlodar/index.html',
  ppc_petropavlovsk: 'site_mirror/web-studiya/kontekstnaya-reklama/petropavlovsk/index.html',
  ppc_semey: 'site_mirror/web-studiya/kontekstnaya-reklama/semey/index.html',
  almaty: 'site_mirror/web-studiya/kontekstnaya-reklama/google-ads/almaty/index.html',
  shymkent: 'site_mirror/web-studiya/kontekstnaya-reklama/google-ads/shymkent/index.html',
  karaganda: 'site_mirror/web-studiya/kontekstnaya-reklama/google-ads/karaganda/index.html',
  aktobe: 'site_mirror/web-studiya/kontekstnaya-reklama/google-ads/aktobe/index.html',
  aktau: 'site_mirror/web-studiya/kontekstnaya-reklama/google-ads/aktau/index.html',
  atyrau: 'site_mirror/web-studiya/kontekstnaya-reklama/google-ads/atyrau/index.html',
  kokshetau: 'site_mirror/web-studiya/kontekstnaya-reklama/google-ads/kokshetau/index.html',
  kostanay: 'site_mirror/web-studiya/kontekstnaya-reklama/google-ads/kostanay/index.html',
};

const CITY_RE =
  /астане|астана|астаны|алматы|шымкенте|шымкент|караганде|караганда|актобе|актау|атырау|кокшетау|костанае|костаная|костанай|мангистау|бурабая|бурабай|щучинска|щаучинск|рудный|лисаковск|жанаозен|форт-шевченко|кызылорде|кызылорды|кызылорда|кызылординской|кызылординская|павлодаре|павлодара|павлодар|павлодарской|павлодарская|аксу|экибастуз|петропавловске|петропавловска|петропавловск|северо-казахстанской|северо-казахстанская|семее|семея|семей|области абай|область абай|абай/gi;

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

const batch3 = ['kyzylorda', 'pavlodar', 'petropavlovsk', 'semey'];
const batch1 = ['almaty', 'shymkent', 'karaganda', 'aktobe'];
const batch2 = ['aktau', 'atyrau', 'kokshetau', 'kostanay'];
const rows = [];

for (const n of batch3) {
  rows.push(pair(n, 'astana'));
  rows.push(pair(n, `ppc_${n}`));
}

for (let i = 0; i < batch3.length; i++) {
  for (let j = i + 1; j < batch3.length; j++) {
    rows.push(pair(batch3[i], batch3[j]));
  }
}

for (const n of batch3) {
  let best1 = { city: null, jaccard5: -1, cityNorm: -1 };
  for (const o of batch1) {
    const r = pair(n, o);
    if (r.jaccard5 > best1.jaccard5) best1 = { city: o, jaccard5: r.jaccard5, cityNorm: r.cityNorm };
    rows.push(r);
  }
  rows.push({ pair: `${n} vs closest-batch1`, closest: best1.city, jaccard5: best1.jaccard5, cityNorm: best1.cityNorm });

  let best2 = { city: null, jaccard5: -1, cityNorm: -1 };
  for (const o of batch2) {
    const r = pair(n, o);
    if (r.jaccard5 > best2.jaccard5) best2 = { city: o, jaccard5: r.jaccard5, cityNorm: r.cityNorm };
    rows.push(r);
  }
  rows.push({ pair: `${n} vs closest-batch2`, closest: best2.city, jaccard5: best2.jaccard5, cityNorm: best2.cityNorm });
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
const dest = path.join(root, 'site_mirror/_work/google-ads-batch3-qa/similarity.json');
fs.writeFileSync(dest, JSON.stringify(out, null, 2));
console.log(JSON.stringify(out, null, 2));
