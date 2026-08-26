const fs = require("fs");
const STOP = new Set(
  "яндекс директ метрика поиск рся кабинет клиента агентства медиабюджет отдельно работа от мес тнг тенге заявку заявки объявления кампании посадочная форма цели география расписание устройства минус фразы доступы отчёты петропавловске удалённо настройка ведение".split(
    /\s+/
  )
);
function strip(html) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&[a-z]+;/gi, " ")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
}
function toks(t) {
  return t.split(/\s+/).filter((w) => w.length > 2 && !STOP.has(w));
}
function grams(words, n = 5) {
  const s = new Set();
  for (let i = 0; i <= words.length - n; i++) s.add(words.slice(i, i + n).join(" "));
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
  "site_mirror/web-studiya/kontekstnaya-reklama/yandex-direct/ust-kamenogorsk/index.html",
  "utf8"
);
const b = fs.readFileSync(
  "site_mirror/web-studiya/kontekstnaya-reklama/yandex-direct/pavlodar/index.html",
  "utf8"
);
const ca = core(a);
const cb = core(b);
const ga = grams(ca);
const gb = grams(cb);
const shared = [...ga].filter((g) => gb.has(g));
shared.sort((x, y) => y.length - x.length);
console.log("shared core 5grams:", shared.length);
shared.slice(0, 40).forEach((g, i) => console.log(i + 1, g));
