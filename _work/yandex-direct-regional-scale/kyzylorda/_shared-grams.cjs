const fs = require("fs");
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
function toks(t) {
  return t.split(/\s+/).filter((w) => w.length > 2 && !STOP.has(w));
}
function core(html) {
  const parts = [];
  for (const id of ["ctx-hero", "short-answer", "local-config", "audience", "faq"]) {
    const m = html.match(new RegExp(`id="${id}"[\\s\\S]*?(?=<section|</main>)`, "i"));
    if (m) parts.push(m[0]);
  }
  return toks(strip(parts.join(" ")));
}
function grams(words, n = 5) {
  const s = new Set();
  for (let i = 0; i <= words.length - n; i++) s.add(words.slice(i, i + n).join(" "));
  return s;
}
const aHtml = fs.readFileSync(
  "site_mirror/web-studiya/kontekstnaya-reklama/yandex-direct/kyzylorda/index.html",
  "utf8"
);
const peer = process.argv[2] || "kostanay";
const bHtml = fs.readFileSync(
  `site_mirror/web-studiya/kontekstnaya-reklama/yandex-direct/${peer}/index.html`,
  "utf8"
);
const ca = core(aHtml);
const cb = core(bHtml);
const ga = grams(ca);
const gb = grams(cb);
const shared = [...ga].filter((g) => gb.has(g));
console.log("core shared 5-grams", shared.length, "of", ga.size);
shared.slice(0, 80).forEach((g) => console.log(g));

const ta = toks(strip(aHtml));
const tb = toks(strip(bHtml));
const ma = grams(ta);
const mb = grams(tb);
const mshared = [...ma].filter((g) => mb.has(g));
console.log("\nmain shared 5-grams", mshared.length, "of", ma.size);
// show ones not in core
const coreSet = new Set(shared);
mshared.filter((g) => !coreSet.has(g)).slice(0, 60).forEach((g) => console.log(g));
