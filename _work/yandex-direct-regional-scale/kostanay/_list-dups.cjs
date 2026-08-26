const fs = require("fs");
const { spawnSync } = require("child_process");
const page =
  "site_mirror/web-studiya/kontekstnaya-reklama/yandex-direct/kostanay/index.html";
const peer =
  "site_mirror/web-studiya/kontekstnaya-reklama/yandex-direct/atyrau/index.html";
const check =
  "site_mirror/_work/yandex-direct-regional-scale/similarity-check.cjs";
const r = spawnSync(process.execPath, [check, page, peer], { encoding: "utf8" });
const j = JSON.parse(r.stdout);
console.log("dups", j.long_dups);
j.long_dup_samples = undefined;
// re-run with all samples by patching - call longDups ourselves
const STOP = new Set(
  "яндекс директ метрика поиск рся кабинет клиента агентства медиабюджет отдельно работа от мес тнг тенге заявку заявки объявления кампании посадочная форма цели география расписание устройства минус фразы доступы отчёты петропавловске удалённо настройка ведение".split(
    /\s+/
  )
);
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
const sa = a
  .split(/[.!?]+/)
  .map((s) => s.trim())
  .filter((s) => s.split(/\s+/).length > 12);
const sb = new Set(b.split(/[.!?]+/).map((s) => s.trim()));
const dups = sa.filter((s) => sb.has(s));
dups.forEach((d, i) => console.log(String(i + 1).padStart(2), d));
