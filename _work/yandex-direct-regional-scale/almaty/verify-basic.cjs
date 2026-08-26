const fs = require("fs");
const ast = fs.readFileSync(
  "site_mirror/web-studiya/kontekstnaya-reklama/yandex-direct/astana/index.html",
  "utf8"
);
const alm = fs.readFileSync(
  "site_mirror/web-studiya/kontekstnaya-reklama/yandex-direct/almaty/index.html",
  "utf8"
);
const ld = (alm.match(
  /<script type="application\/ld\+json">([\s\S]*?)<\/script>/
) || [])[1];
const graph = JSON.parse(ld);
const faqDom = (alm.match(/yd-faq__item/g) || []).length;
const faqSchema = graph["@graph"].find((x) => x["@type"] === "FAQPage")
  .mainEntity.length;
const desc = (alm.match(/name="description" content="([^"]+)/) || [])[1] || "";
console.log(
  JSON.stringify(
    {
      bytes: Buffer.byteLength(alm),
      sizeRatio: +(alm.length / ast.length).toFixed(3),
      faqDom,
      faqSchema,
      title: (alm.match(/<title>([^<]+)/) || [])[1],
      h1: (alm.match(/<h1[^>]*>([^<]+)/) || [])[1],
      descLen: desc.length,
      desc,
      astanaLeak: /yandex-direct\/astana|yd-ast-|Астана|столиц/i.test(alm),
      hasViewportCss: /yandex-direct-page\.css\?v=5" media="\(min-width: 769px\)/.test(
        alm
      ),
      forms: {
        contacts: /id="rk-form-contacts-yd-almaty"/.test(alm),
        popup: /id="rk-form-popup-yd-almaty"/.test(alm),
        nameC: /name="contacts_yandex_direct_almaty"/.test(alm),
        nameP: /name="popup_yandex_direct_almaty"/.test(alm),
      },
      areaServed: JSON.stringify(
        graph["@graph"].find((x) => x["@type"] === "Service").areaServed
      ),
      chartIds: {
        alm: /ydAlmChartFill/.test(alm),
        ast: /ydAstChartFill/.test(alm),
      },
    },
    null,
    2
  )
);
