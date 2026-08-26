const fs = require("fs");
const { spawnSync } = require("child_process");
const h = fs.readFileSync(
  "site_mirror/web-studiya/kontekstnaya-reklama/yandex-direct/taldykorgan/index.html",
  "utf8"
);
const checks = {
  title: (h.match(/<title>([^<]+)/) || [])[1],
  h1: (h.match(/<h1[^>]*>([^<]+)/) || [])[1],
  desc: (h.match(/name="description" content="([^"]+)/) || [])[1],
  formContacts: h.includes("rk-form-contacts-yd-taldykorgan"),
  formName: h.includes("contacts_yandex_direct_taldykorgan"),
  popup: h.includes("rk-form-popup-yd-taldykorgan"),
  popupName: h.includes("popup_yandex_direct_taldykorgan"),
  prefixCount: (h.match(/yd-tdk-/g) || []).length,
  chart1: h.includes("ydTdkChartFill"),
  chart2: h.includes("ydTdkChartFill2"),
  metrika: h.includes("101127167"),
  viewportCss: (h.match(/media="\(min-width: 769px\)"/g) || []).length,
  leftoverKost: /kostanay|yd-kst|ydKst|Костан|Рудн/.test(h),
  leftoverKks: /kokshetau|yd-kks|ydKks|Кокшетау/.test(h),
  areaServed: h.includes('"name":"Taldykorgan"') || h.includes('"name": "Taldykorgan"'),
  relatedCtx: h.includes("/kontekstnaya-reklama/taldykorgan/"),
  relatedGads: h.includes("/google-ads/taldykorgan/"),
};
console.log(JSON.stringify(checks, null, 2));

const r = spawnSync(
  "node",
  ["site_mirror/_work/yandex-direct-regional-scale/taldykorgan/_run-similarity.cjs"],
  { encoding: "utf8" }
);
fs.writeFileSync(
  "site_mirror/_work/yandex-direct-regional-scale/taldykorgan/similarity-result.json",
  r.stdout
);
console.log("sim exit", r.status);
