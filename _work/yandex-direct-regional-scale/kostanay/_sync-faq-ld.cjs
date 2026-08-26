/**
 * Sync FAQPage JSON-LD with visible FAQ answers.
 */
const fs = require("fs");
const PAGE =
  "site_mirror/web-studiya/kontekstnaya-reklama/yandex-direct/kostanay/index.html";
let html = fs.readFileSync(PAGE, "utf8");

const faqs = [];
const re =
  /aria-controls="(yd-kst-faq-a\d+)"[^>]*>([^<]+)<\/button>[\s\S]*?id="\1"[^>]*>([\s\S]*?)<\/div>/g;
let m;
while ((m = re.exec(html))) {
  faqs.push({
    q: m[2].trim(),
    a: m[3].replace(/\s+/g, " ").trim(),
  });
}
console.log("faq count", faqs.length);
if (faqs.length !== 12) {
  console.error("expected 12 FAQ");
  process.exit(1);
}

const faqJson = faqs
  .map(
    (f) =>
      `{"@type":"Question","name":${JSON.stringify(f.q)},"acceptedAnswer":{"@type":"Answer","text":${JSON.stringify(f.a)}}}`
  )
  .join(",");

const CANON =
  "https://raskrutov.kz/web-studiya/kontekstnaya-reklama/yandex-direct/kostanay/";

if (!/"@type":"FAQPage"/.test(html)) {
  console.error("no FAQPage");
  process.exit(1);
}

html = html.replace(
  /"@type":"FAQPage"[^}]*"mainEntity":\[[\s\S]*?\]\}/,
  `"@type":"FAQPage","@id":"${CANON}#faq","mainEntity":[${faqJson}]}`
);

// Fix setup list: restore sensible pairing for mislabeled items
html = html.replace(
  /<div><h3>Минус-слова<\/h3><p>Отсекаем справочные запросы, вакансии, сезонный найм и названия пунктов области вне карты обслуживания\.<\/p><\/div>/,
  "<div><h3>Минус-слова</h3><p>Отсекаем справочные запросы, вакансии, сезонный найм и названия пунктов области вне карты обслуживания.</p></div>"
);

// The "Гео, часы и устройства" item that still has minus-word body should become ads text
html = html.replace(
  /<div><h3>Гео, часы и устройства<\/h3><p>Убираем справочные запросы, вакансии, сезонный кадровый интерес и названия пунктов области вне зоны обслуживания\.<\/p><\/div>/,
  "<div><h3>Объявления</h3><p>Тексты пишем под конкретный оффер и URL, дополняем быстрыми ссылками и уточнениями, чтобы человек быстрее выбрал направление.</p></div>"
);

fs.writeFileSync(PAGE, html);
console.log("synced FAQ LD + setup fix");

// validate JSON-LD
const ld = html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)[1];
JSON.parse(ld);
console.log("JSON-LD ok");
