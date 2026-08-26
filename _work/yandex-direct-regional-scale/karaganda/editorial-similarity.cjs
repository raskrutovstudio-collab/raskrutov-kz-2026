const fs = require("fs");

const BASE = "site_mirror/web-studiya/kontekstnaya-reklama/yandex-direct/";

function clean(s) {
  return s
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&[a-z]+;/gi, " ")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
}

// Editorial body only: drop header, breadcrumbs, contacts, related, sticky, soc widget, modal.
function editorial(html) {
  const main = html.match(/<main id="main">([\s\S]*?)<\/main>/i)[1];
  const stripped = main
    .replace(/<nav class="rk-breadcrumbs"[\s\S]*?<\/nav>/gi, " ")
    .replace(/<section class="rk-section ctx-related"[\s\S]*?<\/section>/gi, " ")
    .replace(/<section class="rk-section rk-section--contacts"[\s\S]*$/i, " ");
  return clean(stripped);
}

function mainText(html) {
  return clean(html.match(/<main id="main">([\s\S]*?)<\/main>/i)[1]);
}

function grams(text, n = 5) {
  const w = text.split(/\s+/).filter(Boolean);
  const out = new Set();
  for (let i = 0; i <= w.length - n; i++) out.add(w.slice(i, i + n).join(" "));
  return out;
}

function containment(a, b) {
  const A = grams(a);
  const B = grams(b);
  let hit = 0;
  for (const g of A) if (B.has(g)) hit++;
  return { pct: +((hit / A.size) * 100).toFixed(2), shared: hit, total: A.size };
}

function jaccard(a, b) {
  const A = new Set(a.split(/\s+/));
  const B = new Set(b.split(/\s+/));
  let inter = 0;
  for (const x of A) if (B.has(x)) inter++;
  return +((inter / (A.size + B.size - inter)) * 100).toFixed(2);
}

function sentences(t) {
  return t
    .split(/[.!?]+/)
    .map((s) => s.trim())
    .filter((s) => s.split(/\s+/).length >= 5);
}

const read = (slug) => fs.readFileSync(BASE + slug + "/index.html", "utf8");

const kar = read("karaganda");
const karE = editorial(kar);
const karM = mainText(kar);

const report = {};
const sharedDump = {};

for (const slug of ["astana", "almaty", "shymkent"]) {
  const other = read(slug);
  const oE = editorial(other);
  const oM = mainText(other);
  const dup = sentences(karE).filter((s) => new Set(sentences(oE)).has(s));
  report[slug] = {
    main_containment_5gram_pct: containment(karM, oM).pct,
    editorial_containment_5gram: containment(karE, oE),
    editorial_jaccard_pct: jaccard(karE, oE),
    main_jaccard_pct: jaccard(karM, oM),
    editorial_duplicate_sentences: dup.length,
    duplicate_samples: dup.slice(0, 5),
  };
  const oG = grams(oE);
  sharedDump[slug] = [...grams(karE)].filter((x) => oG.has(x));
}

report.words_karaganda_editorial = karE.split(/\s+/).length;

console.log(JSON.stringify(report, null, 2));
for (const slug of Object.keys(sharedDump)) {
  console.log("\n--- shared editorial 5-grams vs " + slug + " (" + sharedDump[slug].length + ") ---");
  console.log(sharedDump[slug].join("\n"));
}
