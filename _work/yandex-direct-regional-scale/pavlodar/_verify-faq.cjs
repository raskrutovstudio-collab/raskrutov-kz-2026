const fs = require("fs");
const h = fs.readFileSync(
  "site_mirror/web-studiya/kontekstnaya-reklama/yandex-direct/pavlodar/index.html",
  "utf8"
);
console.log("DESC", h.match(/name="description" content="([^"]+)/)[1]);
console.log(
  "а не patterns",
  [...h.matchAll(/,\s*а не\s+[^?]{0,60}/gi)].map((m) => m[0])
);
console.log(
  "не X, а Y",
  [...h.matchAll(/не\s+[^,.]{2,40},\s+а\s+/gi)].map((m) => m[0])
);
const ld = JSON.parse(
  h.match(/application\/ld\+json">([\s\S]*?)<\/script>/)[1]
);
const faqs = ld["@graph"].find((x) => x["@type"] === "FAQPage").mainEntity;
const qs = [...h.matchAll(/id="yd-pvl-faq-q(\d+)"[^>]*>([^<]+)/g)];
const as = [...h.matchAll(/id="yd-pvl-faq-a(\d+)"[^>]*>([\s\S]*?)<\/div>/g)];
let mism = 0;
for (let i = 0; i < 12; i++) {
  if (qs[i][2] !== faqs[i].name) {
    console.log("Q mismatch", i + 1, qs[i][2], "||", faqs[i].name);
    mism++;
  }
  if (as[i][2] !== faqs[i].acceptedAnswer.text) {
    console.log("A mismatch", i + 1);
    mism++;
  }
}
console.log("faq mismatches", mism);
