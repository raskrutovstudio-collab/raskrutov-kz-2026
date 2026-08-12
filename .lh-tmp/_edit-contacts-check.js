const fs = require("fs");
const p = "d:/РАБОТА/111 ПОРТАЛ ,,, ПРОЕКТ РАСКРУТОВ 05,2026 111/raskrutov-kz-2026/site_mirror/web-studiya/kontekstnaya-reklama/google-ads/index.html";
const t = fs.readFileSync(p, "utf8");
const m = t.match(/rk-contacts__intro">([^<]+)/);
console.log(JSON.stringify(m && m[1]));
const m2 = t.match(/rk-form__lead">([^<]+)/);
console.log(JSON.stringify(m2 && m2[1]));
