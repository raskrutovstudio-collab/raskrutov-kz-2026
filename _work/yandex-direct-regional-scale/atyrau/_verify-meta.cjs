const fs = require("fs");
const h = fs.readFileSync(
  "site_mirror/web-studiya/kontekstnaya-reklama/yandex-direct/atyrau/index.html",
  "utf8"
);
const checks = [
  "rk-form-contacts-yd-atyrau",
  "contacts_yandex_direct_atyrau",
  "rk-form-popup-yd-atyrau",
  "popup_yandex_direct_atyrau",
  "ydAtrChartFill",
  "ydAtrChartFill2",
  "yd-atr-",
  "Петропавловск",
  "120 000",
  "101127167",
  'media="(min-width: 769px)"',
];
for (const c of checks) {
  if (!h.includes(c)) console.error("MISSING", c);
}
console.log("TITLE:", h.match(/<title>([^<]+)/)[1]);
console.log("H1:", h.match(/<h1[^>]*>([^<]+)/)[1]);
console.log("DESC:", h.match(/name="description" content="([^"]+)/)[1]);
console.log("LEAD:", h.match(/class="ctx-hero__lead">([^<]+)/)[1]);
console.log("OK checks");
