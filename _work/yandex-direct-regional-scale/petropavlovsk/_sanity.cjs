const fs = require("fs");
const h = fs.readFileSync(
  "site_mirror/web-studiya/kontekstnaya-reklama/yandex-direct/petropavlovsk/index.html",
  "utf8"
);
const checks = {
  title: /<title>([^<]+)/.exec(h)[1],
  h1: /<h1[^>]*>([^<]+)/.exec(h)[1],
  desc: /name="description" content="([^"]+)"/.exec(h)[1],
  contacts: h.includes("rk-form-contacts-yd-petropavlovsk") &&
    h.includes("contacts_yandex_direct_petropavlovsk"),
  popup: h.includes("rk-form-popup-yd-petropavlovsk") &&
    h.includes("popup_yandex_direct_petropavlovsk"),
  prefixCount: (h.match(/yd-ppk-/g) || []).length,
  charts: h.includes("ydPpkChartFill") && h.includes("ydPpkChartFill2"),
  officeYes: /Да\. Офис Raskrutov находится в Петропавловске/.test(h),
  address: h.includes("ул. М. Жумабаева, 109, 6 этаж, офис 606а"),
  noRemoteOnly: !/офиса нет|филиала нет|представительства нет|ведём удалённо из|Нет\. Работаем удалённо/i.test(
    h
  ),
  metrika: h.includes("101127167"),
  viewport: h.includes('media="(min-width: 769px)"'),
  canonical: /canonical" href="([^"]+)"/.exec(h)[1],
  areaServed: /"name":"Petropavlovsk"/.test(h),
  noDouble: !h.includes("Петропавловсковск"),
  relatedCtx: h.includes("/kontekstnaya-reklama/petropavlovsk/"),
  relatedGads: h.includes("/google-ads/petropavlovsk/"),
};
JSON.parse(h.match(/application\/ld\+json">([\s\S]*?)<\/script>/)[1]);
console.log(JSON.stringify(checks, null, 2));
console.log("JSON-LD OK");
