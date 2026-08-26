const fs = require("fs");

const BASE = "site_mirror/web-studiya/kontekstnaya-reklama/yandex-direct/";
const SLUG = "taraz";
const html = fs.readFileSync(BASE + SLUG + "/index.html", "utf8");
const tpl = fs.readFileSync(BASE + "astana/index.html", "utf8");

const out = [];
const ok = (label, pass, extra) =>
  out.push((pass ? "PASS" : "FAIL") + "  " + label + (extra === undefined ? "" : "  → " + extra));

// --- meta ---
const desc = html.match(/<meta name="description" content="([^"]+)">/)[1];
ok("description length 140-165", desc.length >= 140 && desc.length <= 165, desc.length + " симв.");
const title = html.match(/<title>([^<]+)<\/title>/)[1];
ok("title", title === "Яндекс Директ в Таразе — настройка и ведение | Raskrutov", title);
const h1 = [...html.matchAll(/<h1[^>]*>([\s\S]*?)<\/h1>/g)].map((m) => m[1].trim());
ok("ровно один H1", h1.length === 1, h1.join(" | "));
ok("H1 текст", h1[0] === "Настройка и ведение Яндекс Директ в Таразе");
ok(
  "canonical",
  html.includes('<link rel="canonical" href="https://raskrutov.kz/web-studiya/kontekstnaya-reklama/yandex-direct/taraz/">')
);
ok("lang ru-KZ", html.includes('<html lang="ru-KZ">'));

// --- geo leaks ---
const leaks = [];
for (const [name, re] of [
  ["астана", /астан/i],
  ["алматы", /алмат/i],
  ["шымкент", /шымкент/i],
  ["караганда", /караганд/i],
  ["актобе", /актобе|актюб/i],
]) {
  const hits = html.match(new RegExp(re.source, "gi")) || [];
  if (hits.length) leaks.push(name + " x" + hits.length);
}
ok("нет упоминаний других городов кластера", leaks.length === 0, leaks.join(", ") || "0");
ok("Петропавловск сохранён", /Петропавловск/.test(html), (html.match(/Петропавловск/g) || []).length + " вхождений");

// --- schema ---
let ld = null;
try {
  ld = JSON.parse(html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)[1]);
  ok("JSON.parse Schema", true);
} catch (e) {
  ok("JSON.parse Schema", false, e.message);
}
const node = (t) => ld["@graph"].find((n) => (Array.isArray(n["@type"]) ? n["@type"] : [n["@type"]]).includes(t));
ok("ровно один JSON-LD блок", (html.match(/application\/ld\+json/g) || []).length === 1);
ok("areaServed City name = Taraz", node("Service").areaServed.name === "Taraz" && node("Service").areaServed["@type"] === "City");
ok("Service url = canonical", node("Service").url.endsWith("/yandex-direct/taraz/"));
const crumb = node("BreadcrumbList").itemListElement;
ok("breadcrumb 5 уровней, last = Тараз", crumb.length === 5 && crumb[4].name === "Тараз");
ok("Schema description == meta description", node("WebPage").description === desc);
ok("Service description == meta description", node("Service").description === desc);

// --- FAQ visible vs schema ---
const qs = [...html.matchAll(/data-yd-faq-btn[^>]*id="yd-trz-faq-q(\d+)"[^>]*>([\s\S]*?)<\/button>/g)];
const as = [...html.matchAll(/<div class="yd-faq__a" id="yd-trz-faq-a(\d+)"[^>]*hidden>([\s\S]*?)<\/div>/g)];
const schemaFaq = node("FAQPage").mainEntity;
ok("12 видимых вопросов", qs.length === 12, String(qs.length));
ok("12 видимых ответов", as.length === 12, String(as.length));
ok("12 вопросов в Schema", schemaFaq.length === 12, String(schemaFaq.length));
const faqMismatch = [];
for (let i = 0; i < 12; i++) {
  if (!qs[i] || !as[i] || !schemaFaq[i]) { faqMismatch.push("отсутствует #" + (i + 1)); continue; }
  if (qs[i][2].trim() !== schemaFaq[i].name) faqMismatch.push("Q" + (i + 1));
  if (as[i][2].trim() !== schemaFaq[i].acceptedAnswer.text) faqMismatch.push("A" + (i + 1));
}
ok("FAQ видимый текст == Schema", faqMismatch.length === 0, faqMismatch.join(", ") || "12/12 совпадают");
const uniqQ = new Set(schemaFaq.map((q) => q.name));
ok("12 уникальных вопросов", uniqQ.size === 12, String(uniqQ.size));

// --- ids ---
const ids = [...html.matchAll(/\sid="([^"]+)"/g)].map((m) => m[1]);
const dupIds = ids.filter((v, i) => ids.indexOf(v) !== i);
ok("нет дублирующихся id", dupIds.length === 0, dupIds.join(", ") || "0");
const idSet = new Set(ids);
const refs = [
  ...[...html.matchAll(/aria-controls="([^"]+)"/g)].map((m) => ["aria-controls", m[1]]),
  ...[...html.matchAll(/aria-labelledby="([^"]+)"/g)].map((m) => ["aria-labelledby", m[1]]),
  ...[...html.matchAll(/<label[^>]*\sfor="([^"]+)"/g)].map((m) => ["label[for]", m[1]]),
];
const brokenRefs = refs.filter(([, v]) => !idSet.has(v));
ok("все aria/label ссылки разрешаются", brokenRefs.length === 0, brokenRefs.map((r) => r.join("=")).join(", ") || "0");

const required = [
  "rk-form-contacts-yd-taraz",
  "rk-form-popup-yd-taraz",
  "ydTrzChartFill",
  "ydTrzChartFill2",
  ...Array.from({ length: 12 }, (_, i) => "yd-trz-faq-q" + (i + 1)),
  ...Array.from({ length: 12 }, (_, i) => "yd-trz-faq-a" + (i + 1)),
];
ok("требуемые id на месте", required.every((r) => idSet.has(r)), required.filter((r) => !idSet.has(r)).join(", ") || "все");
ok('name="contacts_yandex_direct_taraz"', html.includes('name="contacts_yandex_direct_taraz"'));
ok('name="popup_yandex_direct_taraz"', html.includes('name="popup_yandex_direct_taraz"'));
ok(
  "префикс yd-trz-* у полей форм",
  ["yd-trz-contact-name", "yd-trz-contact-phone", "yd-trz-contact-regulation",
   "yd-trz-popup-name", "yd-trz-popup-phone", "yd-trz-popup-email",
   "yd-trz-popup-message", "yd-trz-popup-regulation"].every((i) => idSet.has(i))
);
ok("градиенты подключены по ссылке", html.includes("url(#ydTrzChartFill)") && html.includes("url(#ydTrzChartFill2)"));
ok("нет чужих префиксов id", !/yd-(ast|alm|shy|krg|aktb)-/.test(html) && !/ydAstChartFill|ydAlmChartFill/.test(html));

// --- preserved chrome ---
ok(
  "Метрика 101127167 не изменена",
  (html.match(/101127167/g) || []).length === (tpl.match(/101127167/g) || []).length,
  (html.match(/101127167/g) || []).length + " вхождений"
);
ok("критический CSS на месте", html.includes('<style id="yd-critical" media="(max-width:768px)">'));
ok(
  "критический CSS идентичен шаблону",
  html.match(/<style id="yd-critical"[\s\S]*?<\/style>/)[0] === tpl.match(/<style id="yd-critical"[\s\S]*?<\/style>/)[0]
);
ok("viewport-aware CSS-подключение", (html.match(/media="\(min-width: 769px\)"/g) || []).length === 3);
ok("yandex-direct-page.css подключён", html.includes("assets/css/yandex-direct-page.css?v=5"));
ok("цена от 120 000 ₸ / мес", (html.match(/от 120 000 ₸ \/ мес/g) || []).length === 2);
ok(
  "набор JS совпадает с шаблоном",
  JSON.stringify([...html.matchAll(/<script src="([^"]+)"/g)].map((m) => m[1])) ===
    JSON.stringify([...tpl.matchAll(/<script src="([^"]+)"/g)].map((m) => m[1]))
);

// --- related links ---
for (const href of [
  "/web-studiya/kontekstnaya-reklama/taraz/",
  "/web-studiya/kontekstnaya-reklama/google-ads/taraz/",
  "/web-studiya/kontekstnaya-reklama/yandex-direct/",
  "/web-studiya/seo-prodvizhenie/",
  "/web-studiya/sozdanie-saitov/",
  "/web-studiya/lidogeneratsiya/",
  "/keysy/",
  "/kontakty/",
]) ok("ссылка " + href, html.includes('href="' + href + '"'));

// --- DOM contract vs template ---
const counters = {
  "yd-card": /class="yd-card yd-card--/g,
  "yd-camp": /class="yd-camp yd-camp--/g,
  "yd-artifact": /class="yd-artifact yd-artifact--/g,
  "scope-item": /class="yd-scope-list__item"/g,
  "scope-icon": /class="yd-scope-list__icon"/g,
  "decision-card": /class="yd-decision__card"/g,
  "timeline-item": /class="yd-timeline__item"/g,
  "trust-item": /class="yd-trust-strip__item"/g,
  "check-list li": /<li>(?=[^<]*<\/li>)/g,
  "serp-ad": /class="yd-serp-ad(?: |")/g,
  "card__visual": /class="yd-card__visual"/g,
  "faq__item": /class="yd-faq__item"/g,
};
const cmp = [];
for (const [k, re] of Object.entries(counters)) {
  const a = (tpl.match(re) || []).length;
  const b = (html.match(re) || []).length;
  cmp.push(k + ": " + b + (a === b ? " = " : " ≠ ") + a);
  if (a !== b) out.push("FAIL  DOM count " + k + " " + b + " vs эталон " + a);
}
const sections = (s) => [...s.matchAll(/<section[^>]*\sid="([^"]+)"/g)].map((m) => m[1]).join(",");
ok("порядок секций совпадает с эталоном", sections(tpl) === sections(html), sections(html));
ok(
  "все scope-item имеют icon + content",
  (html.match(/class="yd-scope-list__item"/g) || []).length ===
    (html.match(/class="yd-scope-list__icon"/g) || []).length
);
const imgs = [...html.matchAll(/<img\b[^>]*>/g)].map((m) => m[0]);
ok("у всех img есть alt", imgs.every((i) => /\salt="/.test(i)), imgs.length + " img");
ok("у всех img есть width/height", imgs.every((i) => /\swidth="/.test(i) && /\sheight="/.test(i)));

// --- editorial uniqueness ---
function clean(s) {
  return s.replace(/<script[\s\S]*?<\/script>/gi, " ").replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ").replace(/&[a-z]+;/gi, " ").replace(/\s+/g, " ").trim().toLowerCase();
}
function editorial(h) {
  const main = h.match(/<main id="main">([\s\S]*?)<\/main>/i)[1];
  return clean(main.replace(/<nav class="rk-breadcrumbs"[\s\S]*?<\/nav>/gi, " ")
    .replace(/<section class="rk-section ctx-related"[\s\S]*?<\/section>/gi, " ")
    .replace(/<section class="rk-section rk-section--contacts"[\s\S]*$/i, " "));
}
const mainText = (h) => clean(h.match(/<main id="main">([\s\S]*?)<\/main>/i)[1]);
function grams(t, n = 5) {
  const w = t.split(/\s+/).filter(Boolean); const s = new Set();
  for (let i = 0; i <= w.length - n; i++) s.add(w.slice(i, i + n).join(" "));
  return s;
}
function containment(a, b) {
  const A = grams(a), B = grams(b); let hit = 0;
  for (const g of A) if (B.has(g)) hit++;
  return { pct: +((hit / A.size) * 100).toFixed(2), shared: hit, total: A.size };
}
function jaccard(a, b) {
  const A = new Set(a.split(/\s+/)), B = new Set(b.split(/\s+/)); let i = 0;
  for (const x of A) if (B.has(x)) i++;
  return +((i / (A.size + B.size - i)) * 100).toFixed(2);
}
const sentences = (t) => t.split(/[.!?]+/).map((s) => s.trim()).filter((s) => s.split(/\s+/).length >= 5);

const trzE = editorial(html), trzM = mainText(html);
const uniq = {};
const shared = {};
for (const slug of ["astana", "almaty", "shymkent", "karaganda", "aktobe"]) {
  const o = fs.readFileSync(BASE + slug + "/index.html", "utf8");
  const oE = editorial(o);
  const dup = sentences(trzE).filter((s) => new Set(sentences(oE)).has(s));
  const c = containment(trzE, oE);
  uniq[slug] = {
    editorial_containment_5gram_pct: c.pct,
    shared_5grams: c.shared + "/" + c.total,
    editorial_jaccard_pct: jaccard(trzE, oE),
    main_containment_5gram_pct: containment(trzM, mainText(o)).pct,
    duplicate_sentences: dup.length,
    duplicate_samples: dup.slice(0, 3),
  };
  const oG = grams(oE);
  shared[slug] = [...grams(trzE)].filter((x) => oG.has(x));
  ok("containment vs " + slug + " < 1.5%", c.pct < 1.5, c.pct + "%");
  ok("нет повторяющихся предложений vs " + slug, dup.length === 0, String(dup.length));
}

console.log(out.join("\n"));
console.log("\n--- DOM counts (taraz vs astana) ---\n" + cmp.join("\n"));
console.log("\n--- editorial words: " + trzE.split(/\s+/).length + " ---");
console.log("\n--- uniqueness ---\n" + JSON.stringify(uniq, null, 2));
for (const k of Object.keys(shared)) {
  console.log("\n--- shared editorial 5-grams vs " + k + " (" + shared[k].length + ") ---");
  console.log(shared[k].join("\n"));
}
console.log("\nFAILS: " + out.filter((l) => l.startsWith("FAIL")).length);
