/**
 * List long-sentence dups vs a peer using similarity-check logic.
 */
const fs = require("fs");
const checkPath =
  "site_mirror/_work/yandex-direct-regional-scale/similarity-check.cjs";
// reuse by spawning
const { spawnSync } = require("child_process");
const page =
  "site_mirror/web-studiya/kontekstnaya-reklama/yandex-direct/petropavlovsk/index.html";
const peer = process.argv[2];
const r = spawnSync(
  process.execPath,
  [checkPath, page, peer],
  { encoding: "utf8", maxBuffer: 10 * 1024 * 1024 }
);
const j = JSON.parse(r.stdout);
console.log(JSON.stringify({ pass: j.pass, dups: j.long_dups, samples: j.long_dup_samples, metrics: { mc: j.main_containment, cc: j.core_containment, mj: j.main_jaccard, cj: j.core_jaccard } }, null, 2));

// dump all dups by reimplementing longDups briefly
function strip(html) {
  return html
    .replace(/<header[\s\S]*?<\/header>/gi, " ")
    .replace(/<nav class="rk-breadcrumbs"[\s\S]*?<\/nav>/gi, " ")
    .replace(/id="contacts"[\s\S]*?(?=<nav class="rk-sticky|<\/main>)/gi, " ")
    .replace(/<nav class="rk-sticky-cta"[\s\S]*?<\/nav>/gi, " ")
    .replace(/<div class="rk-modal"[\s\S]*?<\/div>\s*(?=<script)/gi, " ")
    .replace(/<div class="rk-soc-widget"[\s\S]*?<\/div>\s*(?=<div class="rk-modal"|<script)/gi, " ")
    .replace(/<button class="rk-scroll-top"[\s\S]*?<\/button>/gi, " ")
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/от 120 000 ₸ \/ мес/g, " ")
    .replace(/Работа агентства · медиабюджет отдельно/g, " ")
    .replace(/Я принимаю[\s\S]*?персональных данных\./g, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&[a-z]+;/gi, " ")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
}
const a = strip(fs.readFileSync(page, "utf8"));
const b = strip(fs.readFileSync(peer, "utf8"));
const sa = a.split(/[.!?]+/).map((s) => s.trim()).filter((s) => s.split(/\s+/).length > 12);
const sb = new Set(b.split(/[.!?]+/).map((s) => s.trim()));
const all = sa.filter((s) => sb.has(s));
console.log("\nALL DUPS (" + all.length + "):");
all.forEach((s, i) => console.log(i + 1, s));
