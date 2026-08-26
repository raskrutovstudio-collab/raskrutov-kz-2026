const fs = require("fs");
const { spawnSync } = require("child_process");
const r = spawnSync(
  process.execPath,
  [
    "site_mirror/_work/yandex-direct-regional-scale/similarity-check.cjs",
    "site_mirror/web-studiya/kontekstnaya-reklama/yandex-direct/aktau/index.html",
    "site_mirror/web-studiya/kontekstnaya-reklama/yandex-direct/uralsk/index.html",
  ],
  { encoding: "utf8" }
);
const j = JSON.parse(r.stdout);
// re-extract all long dups manually
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
const a = strip(
  fs.readFileSync(
    "site_mirror/web-studiya/kontekstnaya-reklama/yandex-direct/aktau/index.html",
    "utf8"
  )
);
const b = strip(
  fs.readFileSync(
    "site_mirror/web-studiya/kontekstnaya-reklama/yandex-direct/uralsk/index.html",
    "utf8"
  )
);
const sa = a
  .split(/[.!?]+/)
  .map((s) => s.trim())
  .filter((s) => s.split(/\s+/).length > 12);
const sb = new Set(b.split(/[.!?]+/).map((s) => s.trim()));
const dups = sa.filter((s) => sb.has(s));
console.log("count", dups.length);
dups.forEach((d, i) => console.log(i + 1, d));
