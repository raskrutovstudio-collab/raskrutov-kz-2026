const fs = require("fs");

const TPL = "site_mirror/web-studiya/kontekstnaya-reklama/yandex-direct/astana/index.html";
const PAGE = "site_mirror/web-studiya/kontekstnaya-reklama/yandex-direct/karaganda/index.html";

const ast = fs.readFileSync(TPL, "utf8");
const kar = fs.readFileSync(PAGE, "utf8");

const ld = (kar.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/) || [])[1];
let graph = null;
let jsonParse = "FAIL";
try {
  graph = JSON.parse(ld);
  jsonParse = "PASS";
} catch (e) {
  jsonParse = "FAIL: " + e.message;
}

const decode = (s) =>
  s
    .replace(/&nbsp;/g, " ")
    .replace(/&mdash;/g, "\u2014")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .trim();

// FAQ DOM
const qs = [...kar.matchAll(/id="yd-kar-faq-q(\d+)"[^>]*>([\s\S]*?)<\/button>/g)].map((m) => ({
  n: +m[1],
  text: decode(m[2].replace(/<[^>]+>/g, "")),
}));
const as = [...kar.matchAll(/id="yd-kar-faq-a(\d+)"[^>]*hidden>([\s\S]*?)<\/div>/g)].map((m) => ({
  n: +m[1],
  text: decode(m[2].replace(/<[^>]+>/g, "")),
}));

const faqSchema = graph ? graph["@graph"].find((x) => x["@type"] === "FAQPage").mainEntity : [];
const faqMismatch = [];
for (let i = 0; i < Math.max(qs.length, faqSchema.length); i++) {
  const dq = qs[i] && qs[i].text;
  const da = as[i] && as[i].text;
  const sq = faqSchema[i] && faqSchema[i].name;
  const sa = faqSchema[i] && faqSchema[i].acceptedAnswer.text;
  if (dq !== sq) faqMismatch.push({ i: i + 1, kind: "question", dom: dq, schema: sq });
  if (da !== sa) faqMismatch.push({ i: i + 1, kind: "answer", dom: da, schema: sa });
}

// ID uniqueness
const allIds = [...kar.matchAll(/\sid="([^"]+)"/g)].map((m) => m[1]);
const dupIds = allIds.filter((v, i, arr) => arr.indexOf(v) !== i);

// aria-controls / labelledby resolution
const refs = [...kar.matchAll(/\saria-(?:controls|labelledby)="([^"]+)"/g)].map((m) => m[1]);
const brokenRefs = [...new Set(refs)].filter((r) => !allIds.includes(r));
// label for=
const labelFor = [...kar.matchAll(/<label[^>]*\sfor="([^"]+)"/g)].map((m) => m[1]);
const brokenLabels = labelFor.filter((r) => !allIds.includes(r));

const desc = (kar.match(/name="description" content="([^"]+)/) || [])[1] || "";
const ogDesc = (kar.match(/og:description" content="([^"]+)/) || [])[1] || "";

// Foreign city leak (Petropavlovsk allowed)
const forbiddenCities = [
  "Астан", "Алмат", "Шымкент", "Актобе", "Тараз", "Павлодар", "Усть-Каменогорск",
  "Өскемен", "Семей", "Атырау", "Костана", "Кызылорд", "Уральск", "Актау",
  "Туркестан", "Кокшетау", "Талдыкорган", "Темиртау", "Сарань", "Шахтинск",
  "Балхаш", "Жезказган", "Абай", "Каскелен", "Талгар", "Қонаев", "столиц",
];
const leaks = forbiddenCities.filter((c) => new RegExp(c, "i").test(kar));

const slugLeaks = ["/astana/", "/almaty/", "/shymkent/", "yd-ast-", "yd-alm-", "yd-shy-", "ydAstChartFill", "ydAlmChartFill", "ydShyChartFill"].filter(
  (s) => kar.includes(s)
);

const out = {
  jsonParse,
  bytes: Buffer.byteLength(kar),
  sizeRatio: +(kar.length / ast.length).toFixed(3),
  title: (kar.match(/<title>([^<]+)/) || [])[1],
  h1: (kar.match(/<h1[^>]*>([^<]+)/) || [])[1],
  h1count: (kar.match(/<h1/g) || []).length,
  canonical: (kar.match(/rel="canonical" href="([^"]+)/) || [])[1],
  descLen: desc.length,
  descInRange: desc.length >= 140 && desc.length <= 165,
  descMatchesOg: desc === ogDesc,
  faqDom: (kar.match(/yd-faq__item/g) || []).length,
  faqQ: qs.length,
  faqA: as.length,
  faqSchema: faqSchema.length,
  faqMismatch,
  dupIds,
  brokenRefs,
  brokenLabels,
  cityLeaks: leaks,
  slugLeaks,
  petropavlovskMentions: (kar.match(/Петропавловск/g) || []).length,
  price: (kar.match(/от 120 000 ₸ \/ мес/g) || []).length,
  metrika: (kar.match(/101127167/g) || []).length,
  chartIds: {
    ydKarChartFill: kar.includes('id="ydKarChartFill"'),
    ydKarChartFill2: kar.includes('id="ydKarChartFill2"'),
  },
  forms: {
    contactsId: /id="rk-form-contacts-yd-karaganda"/.test(kar),
    popupId: /id="rk-form-popup-yd-karaganda"/.test(kar),
    contactsName: /name="contacts_yandex_direct_karaganda"/.test(kar),
    popupName: /name="popup_yandex_direct_karaganda"/.test(kar),
  },
  areaServed: graph ? JSON.stringify(graph["@graph"].find((x) => x["@type"] === "Service").areaServed) : null,
  breadcrumbLast: graph
    ? graph["@graph"].find((x) => x["@type"] === "BreadcrumbList").itemListElement.slice(-1)[0]
    : null,
  viewportCssPreserved:
    /yandex-direct-page\.css\?v=5" media="\(min-width: 769px\)/.test(kar) &&
    /home-clean\.css\?v=39" media="\(min-width: 769px\)/.test(kar) &&
    /kontekst-clean\.css\?v=7" media="\(min-width: 769px\)/.test(kar),
  criticalCssIdentical:
    (ast.match(/<style id="yd-critical"[\s\S]*?<\/style>/) || [])[0] ===
    (kar.match(/<style id="yd-critical"[\s\S]*?<\/style>/) || [])[0],
  relatedLinks: [
    ...((kar.match(/<div class="ctx-related__grid">([\s\S]*?)<\/div>/) || [, ""])[1]).matchAll(/href="([^"]+)"/g),
  ].map((x) => x[1]),
};

console.log(JSON.stringify(out, null, 2));
