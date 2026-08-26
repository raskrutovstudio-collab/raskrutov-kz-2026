import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const htmlPath = path.join(root, "site_mirror/web-studiya/kontekstnaya-reklama/yandex-direct/index.html");
const midPath = path.join(root, "site_mirror/_work/TASK-20260819-180839-yandex-direct-qa/_unique-mid.html");
let html = fs.readFileSync(htmlPath, "utf8");
const mid = fs.readFileSync(midPath, "utf8").replace(/\r\n/g, "\n");

const start = html.indexOf('    <section class="rk-section" id="about">');
const end = html.indexOf('<section class="rk-section rk-section--contacts"');
if (start < 0 || end < 0 || end <= start) {
  throw new Error("markers not found " + start + " " + end);
}
html = html.slice(0, start) + mid + html.slice(end);

const faqItems = [];
const re = /id="yd-faq-q(\d+)"[^>]*>([^<]+)<[\s\S]*?id="yd-faq-a\1"[^>]*>([^<]+)</g;
let m;
while ((m = re.exec(html))) {
  faqItems.push({
    "@type": "Question",
    name: m[2].trim(),
    acceptedAnswer: { "@type": "Answer", text: m[3].trim() }
  });
}
if (faqItems.length !== 12) throw new Error("FAQ count " + faqItems.length);

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
        url: "https://raskrutov.kz/assets/m-files.cdn1.cc/web/images/raskrutov/logo.png"
      },
      email: "info@raskrutov.kz",
      telephone: "+7 700 021 69 00",
      address: {
        "@type": "PostalAddress",
        addressCountry: "KZ",
        addressLocality: "Петропавловск",
        streetAddress: "ул. М. Жумабаева, 109, 6 этаж, офис 606а"
      },
      sameAs: [
        "https://www.instagram.com/raskrutov.kz/",
        "https://www.youtube.com/@raskrutov-kz",
        "https://t.me/Raskrutov_web",
        "https://www.tiktok.com/@raskrutov.kz"
      ]
    },
    {
      "@type": "WebSite",
      "@id": "https://raskrutov.kz/#website",
      url: "https://raskrutov.kz/",
      name: "Raskrutov",
      publisher: { "@id": "https://raskrutov.kz/#organization" },
      inLanguage: "ru-KZ"
    },
    {
      "@type": "WebPage",
      "@id": "https://raskrutov.kz/web-studiya/kontekstnaya-reklama/yandex-direct/#webpage",
      url: "https://raskrutov.kz/web-studiya/kontekstnaya-reklama/yandex-direct/",
      name: "Яндекс Директ в Казахстане — настройка и ведение | Raskrutov",
      description:
        "Настраиваем и ведём Яндекс Директ в Казахстане: поиск, РСЯ, товарные кампании, Метрика, цели, аналитика и регулярная оптимизация.",
      isPartOf: { "@id": "https://raskrutov.kz/#website" },
      about: { "@id": "https://raskrutov.kz/#organization" },
      mainEntity: { "@id": "https://raskrutov.kz/web-studiya/kontekstnaya-reklama/yandex-direct/#service" },
      breadcrumb: { "@id": "https://raskrutov.kz/web-studiya/kontekstnaya-reklama/yandex-direct/#breadcrumb" },
      inLanguage: "ru-KZ"
    },
    {
      "@type": "BreadcrumbList",
      "@id": "https://raskrutov.kz/web-studiya/kontekstnaya-reklama/yandex-direct/#breadcrumb",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Главная", item: "https://raskrutov.kz/" },
        { "@type": "ListItem", position: 2, name: "Студия", item: "https://raskrutov.kz/web-studiya/" },
        {
          "@type": "ListItem",
          position: 3,
          name: "Контекстная реклама",
          item: "https://raskrutov.kz/web-studiya/kontekstnaya-reklama/"
        },
        {
          "@type": "ListItem",
          position: 4,
          name: "Яндекс Директ",
          item: "https://raskrutov.kz/web-studiya/kontekstnaya-reklama/yandex-direct/"
        }
      ]
    },
    {
      "@type": "Service",
      "@id": "https://raskrutov.kz/web-studiya/kontekstnaya-reklama/yandex-direct/#service",
      name: "Настройка и ведение Яндекс Директ",
      url: "https://raskrutov.kz/web-studiya/kontekstnaya-reklama/yandex-direct/",
      provider: { "@id": "https://raskrutov.kz/#organization" },
      areaServed: { "@type": "Country", name: "Kazakhstan" },
      serviceType: "Yandex Direct",
      description:
        "Настраиваем и ведём Яндекс Директ в Казахстане: поиск, РСЯ, товарные кампании, Метрика, цели, аналитика и регулярная оптимизация."
    },
    {
      "@type": "FAQPage",
      "@id": "https://raskrutov.kz/web-studiya/kontekstnaya-reklama/yandex-direct/#faq",
      mainEntity: faqItems
    }
  ]
};

html = html.replace(
  /<script type="application\/ld\+json">[\s\S]*?<\/script>/,
  '<script type="application/ld+json">' + JSON.stringify(graph) + "</script>"
);

html = html.replaceAll("+7 700 021 6900", "+7 700 021 69 00");
html = html.replace(
  '<label class="rk-consent">\n          <input type="checkbox" name="regulation" value="accepted" required>',
  '<label class="rk-consent" for="yd-popup-regulation">\n          <input id="yd-popup-regulation" type="checkbox" name="regulation" value="accepted" required>'
);
html = html.replace('yandex-direct-page.css?v=1', 'yandex-direct-page.css?v=2');
html = html.replace('Обсудим Ваш проект?', 'Обсудим запуск рекламы в Яндексе');
html = html.replace(
  'Оставьте заявку — и мы предложим оптимальное digital-решение под ваши задачи',
  'Опишите нишу и сайт — разберём кабинет Директа, Метрику и состав работ.'
);

JSON.parse(html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)[1]);
if (/google-ads\/3d|Performance Max|gads-|AdWords|google-ads-icon|google-ads\/#webpage/.test(html)) {
  throw new Error("Google remnants remain");
}

fs.writeFileSync(htmlPath, html);
console.log("html bytes", Buffer.byteLength(html), "faq", faqItems.length);

let sitemap = fs.readFileSync(path.join(root, "site_mirror/sitemap.xml"), "utf8");
sitemap = sitemap.replace(
  "<loc>https://raskrutov.kz/web-studiya/kontekstnaya-reklama/yandex-direct</loc>",
  "<loc>https://raskrutov.kz/web-studiya/kontekstnaya-reklama/yandex-direct/</loc>"
);
fs.writeFileSync(path.join(root, "site_mirror/sitemap.xml"), sitemap);

let ht = fs.readFileSync(path.join(root, "site_mirror/.htaccess"), "utf8");
ht = ht.replace(
  "Redirect 301 /pages/web-studiya_kontekstnaya-reklama_yandex-direct.html /web-studiya/kontekstnaya-reklama/yandex-direct\n",
  "Redirect 301 /pages/web-studiya_kontekstnaya-reklama_yandex-direct.html /web-studiya/kontekstnaya-reklama/yandex-direct/\nRedirectMatch 301 ^/web-studiya/kontekstnaya-reklama/yandex-direct$ /web-studiya/kontekstnaya-reklama/yandex-direct/\n"
);
fs.writeFileSync(path.join(root, "site_mirror/.htaccess"), ht);
console.log("sitemap+htaccess updated");
