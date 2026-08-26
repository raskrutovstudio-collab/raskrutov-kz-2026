const fs = require("fs");
const PAGE =
  "site_mirror/web-studiya/kontekstnaya-reklama/yandex-direct/petropavlovsk/index.html";
let h = fs.readFileSync(PAGE, "utf8");

const bad = (h.match(/Петропавловсковск/g) || []).length;
console.log("bad count", bad);
h = h.replace(/Петропавловсковск/g, "Петропавловск");
h = h.replace(/петропавловсковск/g, "петропавловск");

const faqs = [];
const re =
  /id="yd-ppk-faq-q(\d+)"[^>]*>([^<]+)<\/button>[\s\S]*?id="yd-ppk-faq-a\1"[^>]*>([^<]+)<\/div>/g;
let m;
while ((m = re.exec(h))) {
  faqs.push({ q: m[2].trim(), a: m[3].trim() });
}
console.log("FAQ extracted", faqs.length);
if (faqs.length !== 12) {
  console.error("FAQ mismatch");
  process.exit(1);
}

const desc =
  "Яндекс Директ из офиса Raskrutov в Петропавловске: город отдельно от СКО, локальные встречи, поиск, РСЯ и цели Метрики. От 120 000 ₸ в месяц.";
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
      "@id":
        "https://raskrutov.kz/web-studiya/kontekstnaya-reklama/yandex-direct/petropavlovsk/#webpage",
      url: "https://raskrutov.kz/web-studiya/kontekstnaya-reklama/yandex-direct/petropavlovsk/",
      name: "Яндекс Директ в Петропавловске — настройка и ведение | Raskrutov",
      description: desc,
      isPartOf: { "@id": "https://raskrutov.kz/#website" },
      about: { "@id": "https://raskrutov.kz/#organization" },
      mainEntity: {
        "@id":
          "https://raskrutov.kz/web-studiya/kontekstnaya-reklama/yandex-direct/petropavlovsk/#service",
      },
      breadcrumb: {
        "@id":
          "https://raskrutov.kz/web-studiya/kontekstnaya-reklama/yandex-direct/petropavlovsk/#breadcrumb",
      },
      inLanguage: "ru-KZ",
    },
    {
      "@type": "BreadcrumbList",
      "@id":
        "https://raskrutov.kz/web-studiya/kontekstnaya-reklama/yandex-direct/petropavlovsk/#breadcrumb",
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          name: "Главная",
          item: "https://raskrutov.kz/",
        },
        {
          "@type": "ListItem",
          position: 2,
          name: "Студия",
          item: "https://raskrutov.kz/web-studiya/",
        },
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
        {
          "@type": "ListItem",
          position: 5,
          name: "Петропавловск",
          item: "https://raskrutov.kz/web-studiya/kontekstnaya-reklama/yandex-direct/petropavlovsk/",
        },
      ],
    },
    {
      "@type": "Service",
      "@id":
        "https://raskrutov.kz/web-studiya/kontekstnaya-reklama/yandex-direct/petropavlovsk/#service",
      name: "Настройка и ведение Яндекс Директ в Петропавловске",
      url: "https://raskrutov.kz/web-studiya/kontekstnaya-reklama/yandex-direct/petropavlovsk/",
      provider: { "@id": "https://raskrutov.kz/#organization" },
      areaServed: { "@type": "City", name: "Petropavlovsk" },
      serviceType: "Yandex Direct",
      description:
        "Настройка и ведение Яндекс Директ для бизнеса в Петропавловске из офиса Raskrutov: город и СКО разными контурами, поиск, РСЯ, Метрика.",
    },
    {
      "@type": "FAQPage",
      "@id":
        "https://raskrutov.kz/web-studiya/kontekstnaya-reklama/yandex-direct/petropavlovsk/#faq",
      mainEntity: faqs.map((f) => ({
        "@type": "Question",
        name: f.q,
        acceptedAnswer: { "@type": "Answer", text: f.a },
      })),
    },
  ],
};

h = h.replace(
  /<script type="application\/ld\+json">[\s\S]*?<\/script>/,
  '<script type="application/ld+json">' + JSON.stringify(graph) + "</script>"
);

fs.writeFileSync(PAGE, h);
console.log(
  "fixed double=",
  !h.includes("Петропавловсковск"),
  "office=",
  faqs[2].a.slice(0, 50)
);
