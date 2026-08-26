const fs = require("fs");
const { spawnSync } = require("child_process");
const page =
  "site_mirror/web-studiya/kontekstnaya-reklama/yandex-direct/kyzylorda/index.html";
for (const peer of ["kostanay", "atyrau"]) {
  const r = spawnSync(
    process.execPath,
    [
      "site_mirror/_work/yandex-direct-regional-scale/similarity-check.cjs",
      page,
      `site_mirror/web-studiya/kontekstnaya-reklama/yandex-direct/${peer}/index.html`,
    ],
    { encoding: "utf8" }
  );
  const j = JSON.parse(r.stdout);
  console.log("====", peer, "dups", j.long_dups);
  for (const s of j.long_dup_samples || []) console.log("-", s);
  // re-run to get ALL dups by patching? long_dup_samples only 3. Extract all:
}
// local extract all dups
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
function longDups(ta, tb) {
  const sa = ta
    .split(/[.!?]+/)
    .map((s) => s.trim())
    .filter((s) => s.split(/\s+/).length > 12);
  const sb = new Set(tb.split(/[.!?]+/).map((s) => s.trim()));
  return sa.filter((s) => sb.has(s));
}
const a = strip(fs.readFileSync(page, "utf8"));
for (const peer of ["kostanay", "atyrau", "semey"]) {
  const b = strip(
    fs.readFileSync(
      `site_mirror/web-studiya/kontekstnaya-reklama/yandex-direct/${peer}/index.html`,
      "utf8"
    )
  );
  const d = longDups(a, b);
  console.log("\nALL DUPS vs", peer, d.length);
  d.forEach((s, i) => console.log(i + 1, s));
}
