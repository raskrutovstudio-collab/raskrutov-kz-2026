const fs = require("fs");

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
  return { pct: +((inter / (A.size + B.size - inter)) * 100).toFixed(2), inter, a: A.size, b: B.size };
}

function sentences(t) {
  return t.split(/[.!?]+/).map((s) => s.trim()).filter((s) => s.split(/\s+/).length >= 5);
}

const BASE = "site_mirror/web-studiya/kontekstnaya-reklama/yandex-direct/";
const shy = editorial(fs.readFileSync(BASE + "shymkent/index.html", "utf8"));

for (const other of ["astana", "almaty"]) {
  const txt = editorial(fs.readFileSync(BASE + other + "/index.html", "utf8"));
  const dup = sentences(shy).filter((s) => new Set(sentences(txt)).has(s));
  console.log("=== shymkent vs " + other + " ===");
  console.log(JSON.stringify({
    editorial_containment_5gram: containment(shy, txt),
    editorial_jaccard: jaccard(shy, txt),
    editorial_duplicate_sentences: dup.length,
    duplicate_samples: dup.slice(0, 8),
    words_shymkent: shy.split(/\s+/).length,
    ["words_" + other]: txt.split(/\s+/).length,
  }, null, 2));
  const otherG = grams(txt);
  const shared = [...grams(shy)].filter((x) => otherG.has(x));
  console.log("--- shared 5-grams (" + shared.length + ") ---");
  console.log(shared.join("\n"));
  console.log("");
}
