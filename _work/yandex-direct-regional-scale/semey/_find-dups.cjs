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

function longDups(ta, tb) {
  const sa = ta
    .split(/[.!?]+/)
    .map((s) => s.trim())
    .filter((s) => s.split(/\s+/).length > 12);
  const sb = new Set(tb.split(/[.!?]+/).map((s) => s.trim()));
  return sa.filter((s) => sb.has(s));
}

const a = strip(fs.readFileSync(process.argv[2], "utf8"));
const b = strip(fs.readFileSync(process.argv[3], "utf8"));
const dups = longDups(a, b);
console.log("count", dups.length);
dups.forEach((d, i) => console.log("\n---", i + 1, "---\n", d));
