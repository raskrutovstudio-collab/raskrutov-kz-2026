const fs = require("fs");
const a = fs.readFileSync(
  "site_mirror/web-studiya/kontekstnaya-reklama/yandex-direct/astana/index.html",
  "utf8"
);
const t = fs.readFileSync(
  "site_mirror/web-studiya/kontekstnaya-reklama/yandex-direct/taraz/index.html",
  "utf8"
);

function norm(html, cityRe, slug) {
  return html
    .replace(/<script type="application\/ld\+json"[\s\S]*?<\/script>/i, "")
    .replace(cityRe, "CITY")
    .replace(new RegExp(slug, "gi"), "CITY");
}

function grams(text) {
  const w = text
    .toLowerCase()
    .replace(/<[^>]+>/g, " ")
    .replace(/[^\u0400-\u04FFa-z0-9\s]/gi, " ")
    .split(/\s+/)
    .filter(Boolean);
  const s = new Set();
  for (let i = 0; i <= w.length - 5; i++) s.add(w.slice(i, i + 5).join(" "));
  return s;
}

const A = grams(norm(a, /Астан[аеуы]?/gi, "astana"));
const B = grams(norm(t, /Тараз[аеуы]?/gi, "taraz"));
let inter = 0;
for (const g of A) if (B.has(g)) inter++;
console.log({
  jaccard: +(inter / (A.size + B.size - inter)).toFixed(4),
  inter,
  a: A.size,
  b: B.size,
});
