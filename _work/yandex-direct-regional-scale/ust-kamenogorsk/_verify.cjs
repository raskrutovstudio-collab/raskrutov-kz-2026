const fs = require("fs");
const h = fs.readFileSync(
  "site_mirror/web-studiya/kontekstnaya-reklama/yandex-direct/ust-kamenogorsk/index.html",
  "utf8"
);
const checks = {
  title: (h.match(/<title>([^<]+)/) || [])[1],
  h1: (h.match(/<h1[^>]*>([^<]+)/) || [])[1],
  desc: (h.match(/name="description" content="([^"]+)/) || [])[1],
  contactsId: h.includes('id="rk-form-contacts-yd-ust-kamenogorsk"'),
  contactsName: h.includes('name="contacts_yandex_direct_ust_kamenogorsk"'),
  popupId: h.includes('id="rk-form-popup-yd-ust-kamenogorsk"'),
  popupName: h.includes('name="popup_yandex_direct_ust_kamenogorsk"'),
  prefix: (h.match(/yd-osk-/g) || []).length,
  chart1: h.includes("ydOskChartFill"),
  chart2: h.includes("ydOskChartFill2"),
  metrika: h.includes("101127167"),
  price: h.includes("120 000"),
  media: h.includes('media="(min-width: 769px)"'),
  oskemen: h.includes("Өскемен"),
  semey: h.includes("Семей"),
  petrop: h.includes("Петропавловск"),
  jumab: h.includes("Жумабаева"),
  relatedCtx: h.includes("/kontekstnaya-reklama/ust-kamenogorsk/"),
  relatedGads: h.includes("/google-ads/ust-kamenogorsk/"),
  areaServed: h.includes('"name":"Ust-Kamenogorsk"'),
  astanaLeft: (h.match(/Астан|astana/gi) || []).length,
  rhetoric: (h.match(/не [^.]{0,40}, а /gi) || []).length,
  h1count: (h.match(/<h1[\s\S]*?<\/h1>/g) || []).length,
  localOfficeClaim: /офис[^.]*Усть-Каменогорске(?!\s+нет)/i.test(h),
};
console.log(JSON.stringify(checks, null, 2));
fs.writeFileSync(
  "site_mirror/_work/yandex-direct-regional-scale/ust-kamenogorsk/_verify.json",
  JSON.stringify(checks, null, 2),
  "utf8"
);
