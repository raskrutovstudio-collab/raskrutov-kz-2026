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

const alm = editorial(fs.readFileSync("site_mirror/web-studiya/kontekstnaya-reklama/yandex-direct/almaty/index.html", "utf8"));
const ast = editorial(fs.readFileSync("site_mirror/web-studiya/kontekstnaya-reklama/yandex-direct/astana/index.html", "utf8"));

const dup = sentences(alm).filter((s) => new Set(sentences(ast)).has(s));
console.log(JSON.stringify({
  editorial_containment_5gram: containment(alm, ast),
  editorial_jaccard: jaccard(alm, ast),
  editorial_duplicate_sentences: dup.length,
  samples: dup.slice(0, 5),
  words_alm: alm.split(/\s+/).length,
  words_ast: ast.split(/\s+/).length,
}, null, 2));

const astG = grams(ast);
const shared = [...grams(alm)].filter((x) => astG.has(x));
console.log("\n--- shared 5-grams (" + shared.length + ") ---");
console.log(shared.join("\n"));
