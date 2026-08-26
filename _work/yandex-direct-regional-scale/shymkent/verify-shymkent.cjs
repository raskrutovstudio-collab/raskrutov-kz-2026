const fs = require("fs");

const p = "site_mirror/web-studiya/kontekstnaya-reklama/yandex-direct/shymkent/index.html";
const h = fs.readFileSync(p, "utf8");
let fail = 0;
const ok = (label, cond, extra) => {
  console.log((cond ? "PASS  " : "FAIL  ") + label + (extra === undefined ? "" : " :: " + extra));
  if (!cond) fail++;
};

const m = h.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/);
let graph = null;
try {
  graph = JSON.parse(m[1]);
  ok("schema JSON.parse", true);
} catch (e) {
  ok("schema JSON.parse", false, e.message);
  process.exit(1);
}
const nodes = graph["@graph"];
const types = nodes.map((x) => (Array.isArray(x["@type"]) ? x["@type"].join("+") : x["@type"]));
console.log("      graph types: " + types.join(" | "));

const faq = nodes.find((x) => x["@type"] === "FAQPage");
const svc = nodes.find((x) => x["@type"] === "Service");
const crumb = nodes.find((x) => x["@type"] === "BreadcrumbList");
const page = nodes.find((x) => x["@type"] === "WebPage");

ok("schema FAQ = 12", faq.mainEntity.length === 12, faq.mainEntity.length);
ok("areaServed City Shymkent", svc.areaServed["@type"] === "City" && svc.areaServed.name === "Shymkent", JSON.stringify(svc.areaServed));
ok("breadcrumb last = Шымкент", crumb.itemListElement[4].name === "Шымкент", crumb.itemListElement[4].name);

const CANON = "https://raskrutov.kz/web-studiya/kontekstnaya-reklama/yandex-direct/shymkent/";
const can = h.match(/rel="canonical" href="([^"]+)"/)[1];
ok("canonical", can === CANON, can);
ok("schema urls use canonical", page.url === CANON && svc.url === CANON && crumb.itemListElement[4].item === CANON);

const desc = h.match(/<meta name="description" content="([^"]+)"/)[1];
ok("description 140-165 chars", desc.length >= 140 && desc.length <= 165, desc.length + " chars");
ok("description == schema description", desc === page.description && desc === svc.description);

const ogd = [...h.matchAll(/<meta property="og:description" content="([^"]+)"/g)].map((x) => x[1]);
ok("og:description matches", ogd.length === 1 && ogd[0] === desc);

const title = h.match(/<title>([^<]+)<\/title>/)[1];
ok("title exact", title === "Яндекс Директ в Шымкенте — настройка и ведение | Raskrutov", title);

const h1s = [...h.matchAll(/<h1[^>]*>([\s\S]*?)<\/h1>/g)].map((x) => x[1].trim());
ok("single H1", h1s.length === 1, h1s.join(" / "));
ok("H1 exact", h1s[0] === "Настройка и ведение Яндекс Директ в Шымкенте");

// FAQ parity
const btns = [...h.matchAll(/id="(yd-shy-faq-q\d+)"[^>]*>([\s\S]*?)<\/button>/g)];
ok("visible FAQ buttons = 12", btns.length === 12, btns.length);
const answers = [...h.matchAll(/id="(yd-shy-faq-a\d+)"[^>]*hidden>([\s\S]*?)<\/div>/g)];
ok("visible FAQ answers = 12", answers.length === 12, answers.length);
const qIds = btns.map((x) => x[1]).join(",");
const aIds = answers.map((x) => x[1]).join(",");
ok("faq q ids q1..q12", qIds === Array.from({ length: 12 }, (_, i) => "yd-shy-faq-q" + (i + 1)).join(","), qIds);
ok("faq a ids a1..a12", aIds === Array.from({ length: 12 }, (_, i) => "yd-shy-faq-a" + (i + 1)).join(","), aIds);

let qParity = true;
let aParity = true;
for (let i = 0; i < 12; i++) {
  if (btns[i][2].trim() !== faq.mainEntity[i].name) {
    qParity = false;
    console.log("      Q mismatch " + (i + 1) + ": [" + btns[i][2].trim() + "] vs [" + faq.mainEntity[i].name + "]");
  }
  if (answers[i][2].trim() !== faq.mainEntity[i].acceptedAnswer.text) {
    aParity = false;
    console.log("      A mismatch " + (i + 1));
  }
}
ok("FAQ questions match schema", qParity);
ok("FAQ answers match schema", aParity);
const uniqQ = new Set(faq.mainEntity.map((x) => x.name));
ok("12 unique FAQ questions", uniqQ.size === 12, uniqQ.size);

// form ids
const required = [
  'id="rk-form-contacts-yd-shymkent"',
  'name="contacts_yandex_direct_shymkent"',
  'id="rk-form-popup-yd-shymkent"',
  'name="popup_yandex_direct_shymkent"',
  'id="yd-shy-contact-name"',
  'id="yd-shy-contact-phone"',
  'id="yd-shy-contact-regulation"',
  'id="yd-shy-popup-name"',
  'id="yd-shy-popup-phone"',
  'id="yd-shy-popup-email"',
  'id="yd-shy-popup-message"',
  'id="yd-shy-popup-regulation"',
  'id="ydShyChartFill"',
  'id="ydShyChartFill2"',
  'url(#ydShyChartFill)',
  'url(#ydShyChartFill2)',
];
required.forEach((r) => ok("contains " + r, h.includes(r)));

// label/for coverage
const forAttrs = [...h.matchAll(/for="([^"]+)"/g)].map((x) => x[1]);
const inputIds = [...h.matchAll(/<(?:input|textarea)[^>]*id="([^"]+)"/g)].map((x) => x[1]);
ok("every labelled control exists", forAttrs.every((f) => inputIds.includes(f)), forAttrs.join(","));

// leaks
const leakPatterns = [
  ["Астан", /Астан/g],
  ["astana", /astana/gi],
  ["Алмат", /Алмат/g],
  ["almaty", /almaty/gi],
  ["yd-ast-", /yd-ast-/g],
  ["yd-alm-", /yd-alm-/g],
  ["ydAst", /ydAst/g],
  ["ydAlm", /ydAlm/g],
  ["столиц", /столиц/gi],
];
leakPatterns.forEach(([label, re]) => {
  const hits = h.match(re) || [];
  ok("no leak: " + label, hits.length === 0, hits.length + " hits");
});

// petropavlovsk office is expected
const petro = (h.match(/Петропавловск/g) || []).length;
ok("Petropavlovsk office retained", petro >= 3, petro + " mentions");

// duplicate DOM ids
const allIds = [...h.matchAll(/\sid="([^"]+)"/g)].map((x) => x[1]);
const dupes = allIds.filter((v, i) => allIds.indexOf(v) !== i);
ok("no duplicate DOM ids", dupes.length === 0, dupes.join(","));

// aria-controls resolve
const ariaControls = [...h.matchAll(/aria-controls="([^"]+)"/g)].map((x) => x[1]);
ok("aria-controls resolve", ariaControls.every((a) => allIds.includes(a)), ariaControls.filter((a) => !allIds.includes(a)).join(","));

// css preserved vs template
const tpl = fs.readFileSync("site_mirror/web-studiya/kontekstnaya-reklama/yandex-direct/astana/index.html", "utf8");
const critNew = h.match(/<style id="yd-critical"[\s\S]*?<\/style>/)[0];
const critTpl = tpl.match(/<style id="yd-critical"[\s\S]*?<\/style>/)[0];
ok("critical viewport CSS identical to template", critNew === critTpl);
const styleBlocksNew = [...h.matchAll(/<style>([\s\S]*?)<\/style>/g)].map((x) => x[1]);
const styleBlocksTpl = [...tpl.matchAll(/<style>([\s\S]*?)<\/style>/g)].map((x) => x[1]);
ok("desktop @media style block identical", styleBlocksNew.join("") === styleBlocksTpl.join(""));

// assets prefix + related links
const badPrefix = [...h.matchAll(/(?:src|href)="((?!\.\.\/\.\.\/\.\.\/\.\.\/)[^":#]*assets\/[^"]*)"/g)].map((x) => x[1]);
ok("all local asset refs use ../../../../", badPrefix.length === 0, badPrefix.join(","));

const relatedNeeded = [
  "/web-studiya/kontekstnaya-reklama/yandex-direct/",
  "/web-studiya/kontekstnaya-reklama/shymkent/",
  "/web-studiya/kontekstnaya-reklama/google-ads/shymkent/",
  "/web-studiya/seo-prodvizhenie/",
  "/web-studiya/sozdanie-saitov/",
  "/web-studiya/lidogeneratsiya/",
  "/keysy/",
  "/kontakty/",
];
relatedNeeded.forEach((r) => ok("related link " + r, h.includes('href="' + r + '"')));

// price
ok("price от 120 000 ₸ / мес present", (h.match(/от 120 000 ₸ \/ мес/g) || []).length >= 2);

// lp motor / builder residue
["public.bundle", "lpmotor", "m-files.cdn1.cc/web/build", "MsJs"].forEach((n) => {
  ok("no builder residue: " + n, !h.includes(n));
});

// img alt coverage
const imgs = [...h.matchAll(/<img\b[^>]*>/g)].map((x) => x[0]);
ok("every img has alt", imgs.every((i) => /\salt="/.test(i)), imgs.filter((i) => !/\salt="/.test(i)).join(" | "));
ok("every img has width+height", imgs.every((i) => /\swidth="/.test(i) && /\sheight="/.test(i)));

// terminal section
ok("terminal section #contacts present", h.includes('id="contacts"'));

console.log("\n" + (fail === 0 ? "ALL CHECKS PASS" : fail + " CHECK(S) FAILED"));
process.exit(fail === 0 ? 0 : 1);
