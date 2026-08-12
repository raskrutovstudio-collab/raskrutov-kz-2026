const fs = require("fs");
const p = "d:/РАБОТА/111 ПОРТАЛ ,,, ПРОЕКТ РАСКРУТОВ 05,2026 111/raskrutov-kz-2026/site_mirror/web-studiya/kontekstnaya-reklama/google-ads/index.html";
const t = fs.readFileSync(p, "utf8");
const faqStart = t.indexOf('<section class="rk-section" id="faq">');
const faqEnd = t.indexOf("</section>", faqStart);
console.log(t.slice(faqStart, faqEnd + 10));
console.log("\n\n===== CONTACTS =====");
const cStart = t.indexOf('id="contacts"');
console.log(t.slice(cStart, cStart + 2500));
