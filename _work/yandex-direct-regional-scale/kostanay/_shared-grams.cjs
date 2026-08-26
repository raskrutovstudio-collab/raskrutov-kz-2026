const fs = require("fs");

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
const STOP = new Set(
  "яндекс директ метрика поиск рся кабинет клиента агентства медиабюджет отдельно работа от мес тнг тенге заявку заявки объявления кампании посадочная форма цели география расписание устройства минус фразы доступы отчёты петропавловске удалённо настройка ведение".split(
    /\s+/
  )
);
function toks(t) {
  return t.split(/\s+/).filter((w) => w.length > 2 && !STOP.has(w));
}
function grams(words, n = 5) {
  const s = [];
  for (let i = 0; i <= words.length - n; i++) s.push(words.slice(i, i + n).join(" "));
  return s;
}
function core(html) {
  const parts = [];
  for (const id of ["ctx-hero", "short-answer", "local-config", "audience", "faq"]) {
    const m = html.match(new RegExp(`id="${id}"[\\s\\S]*?(?=<section|</main>)`, "i"));
    if (m) parts.push(m[0]);
  }
  return toks(strip(parts.join(" ")));
}

const a = fs.readFileSync(
  "site_mirror/web-studiya/kontekstnaya-reklama/yandex-direct/kostanay/index.html",
  "utf8"
);
const b = fs.readFileSync(
  "site_mirror/web-studiya/kontekstnaya-reklama/yandex-direct/atyrau/index.html",
  "utf8"
);
const ga = grams(toks(strip(a)));
const gb = new Set(grams(toks(strip(b))));
const shared = {};
for (const g of ga) if (gb.has(g)) shared[g] = (shared[g] || 0) + 1;
const top = Object.entries(shared)
  .sort((x, y) => y[1] - x[1])
  .slice(0, 40);
console.log("shared 5grams", Object.keys(shared).length, "of", ga.length);
top.forEach(([g, c]) => console.log(c, g));

const ca = core(a);
const cb = new Set(grams(core(b)));
const sharedC = {};
for (const g of grams(ca)) if (cb.has(g)) sharedC[g] = (sharedC[g] || 0) + 1;
console.log("\nCORE shared", Object.keys(sharedC).length);
Object.entries(sharedC)
  .sort((x, y) => y[1] - x[1])
  .slice(0, 30)
  .forEach(([g, c]) => console.log(c, g));
