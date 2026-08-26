const fs = require("fs");
const DST =
  "site_mirror/web-studiya/kontekstnaya-reklama/yandex-direct/turkestan/index.html";
const TITLE = "Яндекс Директ в Туркестане — настройка и ведение | Raskrutov";
const H1 = "Настройка и ведение Яндекс Директ в Туркестане";
const DESC =
  "Яндекс Директ в Туркестане: город отдельно от Туркестанской области и Шымкента, паломнический и городской спрос, цели в Метрике. От 120 000 ₸ в месяц.";
const CANON =
  "https://raskrutov.kz/web-studiya/kontekstnaya-reklama/yandex-direct/turkestan/";
let html = fs.readFileSync(DST, "utf8");
const faqPairs = [];
const faqRe =
  /id="yd-trk-faq-q(\d+)"[^>]*>([^<]+)<[\s\S]*?id="yd-trk-faq-a\1"[^>]*>([^<]+)</g;
let fm;
while ((fm = faqRe.exec(html))) {
  faqPairs.push({ q: fm[2].trim(), a: fm[3].trim() });
}
const graph = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": ["Organization", "ProfessionalService"],
      "@id": "https://raskrutov.kz/#organization",
      name: "Raskrutov",
      url: "https://raskrutov.kz/",
      logo: {
        "@type": "ImageObject",
        url: "https://raskrutov.kz/assets/m-files.cdn1.cc/web/images/raskrutov/logo.png",
      },
      email: "info@raskrutov.kz",
      telephone: "+7 700 021 69 00",
      address: {
        "@type": "PostalAddress",
        addressCountry: "KZ",
        addressLocality: "Петропавловск",
        streetAddress: "ул. М. Жумабаева, 109, 6 этаж, офис 606а",
      },
      sameAs: [
        "https://www.instagram.com/raskrutov.kz/",
        "https://www.youtube.com/@raskrutov-kz",
        "https://t.me/Raskrutov_web",
        "https://www.tiktok.com/@raskrutov.kz",
      ],
    },
    {
      "@type": "WebSite",
      "@id": "https://raskrutov.kz/#website",
      url: "https://raskrutov.kz/",
      name: "Raskrutov",
      publisher: { "@id": "https://raskrutov.kz/#organization" },
      inLanguage: "ru-KZ",
    },
    {
      "@type": "WebPage",
      "@id": CANON + "#webpage",
      url: CANON,
      name: TITLE,
      description: DESC,
      isPartOf: { "@id": "https://raskrutov.kz/#website" },
      about: { "@id": "https://raskrutov.kz/#organization" },
      mainEntity: { "@id": CANON + "#service" },
      breadcrumb: { "@id": CANON + "#breadcrumb" },
      inLanguage: "ru-KZ",
    },
    {
      "@type": "BreadcrumbList",
      "@id": CANON + "#breadcrumb",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Главная", item: "https://raskrutov.kz/" },
        { "@type": "ListItem", position: 2, name: "Студия", item: "https://raskrutov.kz/web-studiya/" },
        {
          "@type": "ListItem",
          position: 3,
          name: "Контекстная реклама",
          item: "https://raskrutov.kz/web-studiya/kontekstnaya-reklama/",
        },
        {
          "@type": "ListItem",
          position: 4,
          name: "Яндекс Директ",
          item: "https://raskrutov.kz/web-studiya/kontekstnaya-reklama/yandex-direct/",
        },
        { "@type": "ListItem", position: 5, name: "Туркестан", item: CANON },
      ],
    },
    {
      "@type": "Service",
      "@id": CANON + "#service",
      name: H1,
      url: CANON,
      provider: { "@id": "https://raskrutov.kz/#organization" },
      areaServed: { "@type": "City", name: "Turkestan" },
      serviceType: "Yandex Direct",
      description: DESC,
    },
    {
      "@type": "FAQPage",
      "@id": CANON + "#faq",
      mainEntity: faqPairs.map((p) => ({
        "@type": "Question",
        name: p.q,
        acceptedAnswer: { "@type": "Answer", text: p.a },
      })),
    },
  ],
};
html = html.replace(
  /<script type="application\/ld\+json">[\s\S]*?<\/script>/,
  `<script type="application/ld+json">${JSON.stringify(graph)}</script>`
);
fs.writeFileSync(DST, html, "utf8");
console.log("schema faq", faqPairs.length);
