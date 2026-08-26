const fs = require("fs");
const h = fs.readFileSync(
  "site_mirror/web-studiya/kontekstnaya-reklama/yandex-direct/kyzylorda/index.html",
  "utf8"
);
const t = h.match(/<title>([^<]+)/)[1];
const d = h.match(/name="description" content="([^"]+)/)[1];
const h1 = h.match(/<h1[^>]*>([^<]+)/)[1];
const can = h.match(/rel="canonical" href="([^"]+)/)[1];
console.log(JSON.stringify({
  title: t,
  h1,
  desc: d,
  can,
  contacts: h.includes("rk-form-contacts-yd-kyzylorda") && h.includes("contacts_yandex_direct_kyzylorda"),
  popup: h.includes("rk-form-popup-yd-kyzylorda") && h.includes("popup_yandex_direct_kyzylorda"),
  prefixCount: (h.match(/yd-kyz-/g) || []).length,
  charts: h.includes("ydKyzChartFill") && h.includes("ydKyzChartFill2"),
  metrika: h.includes("101127167"),
  viewportCss: (h.match(/media="\(min-width: 769px\)"/g) || []).length,
  areaServed: /"name":"Kyzylorda"/.test(h),
  badPeers: (h.match(/Костанай|Рудн|Атырау|kostanay|atyrau|yd-kst|ydAtr|gads-kyz/gi) || []).length,
  neXaY: /не\s+[^,.]{1,30},\s+а\s+/i.test(h),
}, null, 2));
