const fs = require("fs");
const h = fs.readFileSync(
  "site_mirror/web-studiya/kontekstnaya-reklama/yandex-direct/uralsk/index.html",
  "utf8"
);
const title = (h.match(/<title>([^<]+)</) || [])[1];
const desc = (h.match(/<meta name="description" content="([^"]+)"/) || [])[1];
const h1 = (h.match(/<h1[^>]*>([^<]+)</) || [])[1];
const canonical = (h.match(/rel="canonical" href="([^"]+)"/) || [])[1];
console.log({ title, desc, h1, canonical });
console.log({
  metrika: h.includes("101127167"),
  viewportCSS: h.includes('media="(min-width: 769px)"'),
  chart1: h.includes("ydUrlChartFill"),
  chart2: h.includes("ydUrlChartFill2"),
  formC: h.includes("rk-form-contacts-yd-uralsk"),
  formCN: h.includes("contacts_yandex_direct_uralsk"),
  formP: h.includes("rk-form-popup-yd-uralsk"),
  formPN: h.includes("popup_yandex_direct_uralsk"),
  prefix: h.includes("yd-url-contact-name") && h.includes("yd-url-popup-name"),
  area: h.includes('"name":"Uralsk"'),
  petro: h.includes("Петропавловск"),
  oral: h.includes("Орал"),
  zko: h.includes("ЗКО"),
  rice: /рисов|Сырдар|kyzylorda|Кызылорд|yd-kyz|ydKyz/i.test(h),
  neXaY: /не [^,]{2,40}, а /i.test(h),
  relatedCtx: h.includes("/kontekstnaya-reklama/uralsk/"),
  relatedGads: h.includes("/google-ads/uralsk/"),
  price: h.includes("от 120 000 ₸ / мес"),
});
