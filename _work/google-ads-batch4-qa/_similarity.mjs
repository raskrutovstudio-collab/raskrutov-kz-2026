import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const gads = (s) => `site_mirror/web-studiya/kontekstnaya-reklama/google-ads/${s}/index.html`;
const ppc = (s) => `site_mirror/web-studiya/kontekstnaya-reklama/${s}/index.html`;

const files = {
  astana: gads('astana'),
  taldykorgan: gads('taldykorgan'),
  taraz: gads('taraz'),
  turkestan: gads('turkestan'),
  uralsk: gads('uralsk'),
  'ust-kamenogorsk': gads('ust-kamenogorsk'),
  ppc_taldykorgan: ppc('taldykorgan'),
  ppc_taraz: ppc('taraz'),
  ppc_turkestan: ppc('turkestan'),
  ppc_uralsk: ppc('uralsk'),
  'ppc_ust-kamenogorsk': ppc('ust-kamenogorsk'),
  almaty: gads('almaty'),
  shymkent: gads('shymkent'),
  karaganda: gads('karaganda'),
  aktobe: gads('aktobe'),
  aktau: gads('aktau'),
  atyrau: gads('atyrau'),
  kokshetau: gads('kokshetau'),
  kostanay: gads('kostanay'),
  kyzylorda: gads('kyzylorda'),
  pavlodar: gads('pavlodar'),
  petropavlovsk: gads('petropavlovsk'),
  semey: gads('semey'),
};

const CITY_RE =
  /астане|астана|астаны|алматы|шымкенте|шымкент|караганде|караганда|актобе|актау|атырау|кокшетау|костанае|костаная|костанай|мангистау|кызылорде|кызылорды|кызылорда|кызылординской|кызылординская|павлодаре|павлодара|павлодар|павлодарской|павлодарская|петропавловске|петропавловска|петропавловск|семее|семея|семей|талдыкоргане|талдыкоргана|талдыкорган|жетісу|жетису|таразе|тараза|тараз|жамбылской|жамбылская|туркестане|туркестана|туркестан|туркестанской|туркестанская|уральске|уральска|уральск|западно-казахстанской|западно-казахстанская|\bзко\b|усть-каменогорске|усть-каменогорска|усть-каменогорск|восточно-казахстанской|восточно-казахстанская|\bвко\b/gi;

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

const sets = {};
const normSets = {};
for (const [k, rel] of Object.entries(files)) {
  const t = visibleText(fs.readFileSync(path.join(root, rel), 'utf8'));
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

const batch4 = ['taldykorgan', 'taraz', 'turkestan', 'uralsk', 'ust-kamenogorsk'];
const batch1 = ['almaty', 'shymkent', 'karaganda', 'aktobe'];
const batch2 = ['aktau', 'atyrau', 'kokshetau', 'kostanay'];
const batch3 = ['kyzylorda', 'pavlodar', 'petropavlovsk', 'semey'];
const rows = [];

for (let i = 0; i < batch4.length; i++) {
  for (let j = i + 1; j < batch4.length; j++) rows.push(pair(batch4[i], batch4[j]));
}
for (const n of batch4) {
  rows.push(pair(n, 'astana'));
  rows.push(pair(n, `ppc_${n}`));
  let best1 = { city: null, jaccard5: -1, cityNorm: -1 };
  for (const o of batch1) {
    const r = pair(n, o);
    rows.push(r);
    if (r.jaccard5 > best1.jaccard5) best1 = { city: o, jaccard5: r.jaccard5, cityNorm: r.cityNorm };
  }
  rows.push({ pair: `${n} vs closest-batch1`, closest: best1.city, jaccard5: best1.jaccard5, cityNorm: best1.cityNorm });
  let best2 = { city: null, jaccard5: -1, cityNorm: -1 };
  for (const o of batch2) {
    const r = pair(n, o);
    rows.push(r);
    if (r.jaccard5 > best2.jaccard5) best2 = { city: o, jaccard5: r.jaccard5, cityNorm: r.cityNorm };
  }
  rows.push({ pair: `${n} vs closest-batch2`, closest: best2.city, jaccard5: best2.jaccard5, cityNorm: best2.cityNorm });
  let best3 = { city: null, jaccard5: -1, cityNorm: -1 };
  for (const o of batch3) {
    const r = pair(n, o);
    rows.push(r);
    if (r.jaccard5 > best3.jaccard5) best3 = { city: o, jaccard5: r.jaccard5, cityNorm: r.cityNorm };
  }
  rows.push({ pair: `${n} vs closest-batch3`, closest: best3.city, jaccard5: best3.jaccard5, cityNorm: best3.cityNorm });
}

rows.sort((a, b) => b.jaccard5 - a.jaccard5);
const intra = rows.filter((r) => {
  const [a, b] = String(r.pair).split(' vs ');
  return batch4.includes(a) && batch4.includes(b);
});
const vsAstana = rows.filter((r) => String(r.pair).endsWith(' vs astana'));
const vsPpc = rows.filter((r) => String(r.pair).includes(' vs ppc_'));
const vsPrev = rows.filter((r) => /closest-batch[123]$/.test(r.pair) === false && (
  batch1.some((x) => r.pair.includes(x)) || batch2.some((x) => r.pair.includes(x)) || batch3.some((x) => r.pair.includes(x))
) && batch4.some((x) => r.pair.startsWith(x + ' vs')));

const citySwap = rows.some((r) => r.cityNorm >= 0.85 && !String(r.pair).includes('closest'));
const out = {
  metric: 'word 5-gram Jaccard on visible text',
  maxPair: rows[0],
  maxIntraBatch: intra[0],
  vsAstanaRange: {
    min: Math.min(...vsAstana.map((r) => r.jaccard5)),
    max: Math.max(...vsAstana.map((r) => r.jaccard5)),
  },
  vsPpcRange: {
    min: Math.min(...vsPpc.map((r) => r.jaccard5)),
    max: Math.max(...vsPpc.map((r) => r.jaccard5)),
  },
  maxVsPreviousGoogleAds: vsPrev[0],
  citySwapDetected: citySwap ? 'YES' : 'NO',
  citySwapRule: 'city-normalized Jaccard >= 0.85',
  rows,
};
const dest = path.join(root, 'site_mirror/_work/google-ads-batch4-qa/similarity.json');
fs.writeFileSync(dest, JSON.stringify(out, null, 2));
console.log(JSON.stringify({
  maxPair: out.maxPair,
  maxIntraBatch: out.maxIntraBatch,
  vsAstanaRange: out.vsAstanaRange,
  vsPpcRange: out.vsPpcRange,
  maxVsPreviousGoogleAds: out.maxVsPreviousGoogleAds,
  citySwapDetected: out.citySwapDetected,
}, null, 2));
