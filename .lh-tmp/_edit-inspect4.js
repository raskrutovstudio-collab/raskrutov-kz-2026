const fs = require("fs");
const p = "d:/РАБОТА/111 ПОРТАЛ ,,, ПРОЕКТ РАСКРУТОВ 05,2026 111/raskrutov-kz-2026/site_mirror/web-studiya/kontekstnaya-reklama/google-ads/index.html";
const t = fs.readFileSync(p, "utf8");
const idx = t.indexOf('id="faq"');
console.log("idx", idx);
console.log(JSON.stringify(t.slice(idx-80, idx+100)));
// find section containing faq
const m = t.match(/<section[^>]*id="faq"[^>]*>[\s\S]*?<\/section>/);
console.log("match", !!m, m ? m[0].length : 0);
if (m) console.log(m[0].slice(0, 500));
if (m) console.log("... details count in faq", (m[0].match(/<details/g)||[]).length);
// also first details
const d = t.indexOf("<details>");
console.log("first details near", t.slice(d, d+300));
