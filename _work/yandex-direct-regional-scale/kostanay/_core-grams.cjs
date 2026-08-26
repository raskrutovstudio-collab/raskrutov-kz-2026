const fs = require("fs");

function strip(html) {
  return html
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
const ca = core(a);
const cb = new Set(grams(core(b)));
const shared = {};
for (const g of grams(ca)) if (cb.has(g)) shared[g] = (shared[g] || 0) + 1;
console.log("core grams", grams(ca).length, "shared", Object.keys(shared).length);
Object.entries(shared)
  .sort((x, y) => y[1] - x[1])
  .slice(0, 50)
  .forEach(([g, c]) => console.log(c, g));
