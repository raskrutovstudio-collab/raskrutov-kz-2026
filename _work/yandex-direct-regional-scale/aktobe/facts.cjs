const fs = require("fs");

const P = "site_mirror/web-studiya/kontekstnaya-reklama/yandex-direct/aktobe/index.html";
const h = fs.readFileSync(P, "utf8");
const count = (re) => (h.match(re) || []).length;

const d = h.match(/<meta name="description" content="([^"]+)"/)[1];
console.log("DESC(" + d.length + "): " + d);
console.log("lang: " + (h.match(/<html[^>]*lang="([^"]+)"/) || [])[1]);
console.log("Петропавловск: " + count(/Петропавловск/g));
console.log("Актобе: " + count(/Актобе/g));
console.log("Актюбинск*: " + count(/Актюбинск/g));
console.log("audience cards: " + (h.match(/yd-card yd-card--[a-z0-9]+/g) || []).join(" | "));
console.log("faq q ids: " + (h.match(/yd-aktb-faq-q\d+/g) || []).length);
console.log("chart gradients: " + (h.match(/ydAktb\w+/g) || []).join(" | "));
console.log("hours: " + (h.match(/Пн[^<]{0,30}/g) || []).slice(0, 2).join(" | "));

const links = [...new Set((h.match(/href="(\/[^"#]*)"/g) || []).map((x) => x.slice(6, -1)))].sort();
console.log("internal links:\n  " + links.join("\n  "));
