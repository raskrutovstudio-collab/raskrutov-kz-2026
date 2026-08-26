/**
 * Find shared 5-grams vs kyzylorda for rewrite targeting.
 */
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
function grams(words, n = 5) {
  const out = [];
  for (let i = 0; i <= words.length - n; i++) out.push(words.slice(i, i + n).join(" "));
  return out;
}
const peer = process.argv[2] || "kyzylorda";
const a = toks(
  strip(
    fs.readFileSync(
      "site_mirror/web-studiya/kontekstnaya-reklama/yandex-direct/uralsk/index.html",
      "utf8"
    )
  )
);
const b = new Set(
  grams(
    toks(
      strip(
        fs.readFileSync(
          `site_mirror/web-studiya/kontekstnaya-reklama/yandex-direct/${peer}/index.html`,
          "utf8"
        )
      )
    )
  )
);
const counts = new Map();
for (const g of grams(a)) {
  if (b.has(g)) counts.set(g, (counts.get(g) || 0) + 1);
}
const sorted = [...counts.entries()].sort((x, y) => y[1] - x[1]);
console.log("shared unique 5grams:", sorted.length);
for (const [g, c] of sorted.slice(0, 80)) console.log(c, g);
