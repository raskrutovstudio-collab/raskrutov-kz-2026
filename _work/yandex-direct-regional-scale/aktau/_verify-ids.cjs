const fs = require("fs");
const h = fs.readFileSync(
  "site_mirror/web-studiya/kontekstnaya-reklama/yandex-direct/aktau/index.html",
  "utf8"
);
const checks = {
  title: (h.match(/<title>([^<]+)/) || [])[1],
  h1: (h.match(/<h1[^>]*>([^<]+)/) || [])[1],
  desc: (h.match(/name="description" content="([^"]+)/) || [])[1],
  canonical: (h.match(/rel="canonical" href="([^"]+)/) || [])[1],
  forms: [...h.matchAll(/id="(rk-form-[^"]+)"/g)].map((m) => m[1]),
  names: [...h.matchAll(/name="(contacts_[^"]+|popup_[^"]+)"/g)].map((m) => m[1]),
  fieldPrefix: [...h.matchAll(/id="(yd-akt-[^"]+)"/g)].length,
  aktbLeak: /yd-aktb-/.test(h),
  charts: [...h.matchAll(/id="(ydAktChartFill2?)"/g)].map((m) => m[1]),
  metrika: /101127167/.test(h),
  viewportCss: /media="\(min-width: 769px\)"/.test(h),
  areaServed: /"name":"Aktau"/.test(h),
  officeClaim: /офис[а]? Raskrutov в Актау(?! нет)/i.test(h),
  noOffice: /Офиса Raskrutov в Актау нет/.test(h),
  ural: /\bУрал\b/.test(h),
  atyrau: /Атырау/.test(h),
  aktobe: /Актобе|aktobe/.test(h),
  notXorY: /не\s+[^,.]{2,40},\s+а\s+/i.test(h),
  schemaOk: (() => {
    try {
      const m = h.match(/application\/ld\+json">([\s\S]*?)<\/script>/);
      JSON.parse(m[1]);
      return true;
    } catch (e) {
      return String(e);
    }
  })(),
};
console.log(JSON.stringify(checks, null, 2));
