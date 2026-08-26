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

function grams(words, n = 5) {
  const s = new Set();
  for (let i = 0; i <= words.length - n; i++) s.add(words.slice(i, i + n).join(" "));
  return s;
}

function setJaccard(a, b) {
  let i = 0;
  for (const x of a) if (b.has(x)) i++;
  const u = a.size + b.size - i;
  return u ? i / u : 0;
}

function containment(A, B) {
  const a = grams(A);
  const b = grams(B);
  if (!a.size) return 0;
  let h = 0;
  for (const g of a) if (b.has(g)) h++;
  return h / a.size;
}

function gramJaccard(A, B) {
  return setJaccard(grams(A), grams(B));
}

function core(html) {
  const parts = [];
  for (const id of ["ctx-hero", "short-answer", "local-config", "audience", "faq"]) {
    const m = html.match(new RegExp(`id="${id}"[\\s\\S]*?(?=<section|</main>)`, "i"));
    if (m) parts.push(m[0]);
  }
  return toks(strip(parts.join(" ")));
}

function longDups(ta, tb) {
  const sa = ta
    .split(/[.!?]+/)
    .map((s) => s.trim())
    .filter((s) => s.split(/\s+/).length > 12);
  const sb = new Set(
    tb
      .split(/[.!?]+/)
      .map((s) => s.trim())
  );
  return sa.filter((s) => sb.has(s));
}

const [pa, pb] = process.argv.slice(2);
const a = fs.readFileSync(pa, "utf8");
const b = fs.readFileSync(pb, "utf8");
const ta = toks(strip(a));
const tb = toks(strip(b));
const ca = core(a);
const cb = core(b);
const dups = longDups(strip(a), strip(b));
const r = {
  a: pa,
  b: pb,
  main_containment: +(containment(ta, tb) * 100).toFixed(2),
  main_jaccard: +(gramJaccard(ta, tb) * 100).toFixed(2),
  core_containment: +(containment(ca, cb) * 100).toFixed(2),
  core_jaccard: +(gramJaccard(ca, cb) * 100).toFixed(2),
  long_dups: dups.length,
  long_dup_samples: dups.slice(0, 3),
  pass:
    containment(ta, tb) <= 0.25 &&
    gramJaccard(ta, tb) <= 0.15 &&
    containment(ca, cb) <= 0.15 &&
    gramJaccard(ca, cb) <= 0.1 &&
    dups.length === 0,
};
console.log(JSON.stringify(r, null, 2));
process.exit(r.pass ? 0 : 1);
