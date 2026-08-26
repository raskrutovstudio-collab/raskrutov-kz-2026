const fs = require("fs");
const h = fs.readFileSync(
  "site_mirror/web-studiya/kontekstnaya-reklama/yandex-direct/astana/index.html",
  "utf8"
);
const sectionIds = [...h.matchAll(/<(?:section|nav|div|aside)\s[^>]*id="([^"]+)"/g)].map(
  (m) => m[1]
);
console.log("sections:", sectionIds.join(", "));
const forms = [...h.matchAll(/id="(rk-form[^"]+)"|id="(yd-ast[^"]+)"|name="(contacts_[^"]+|popup_[^"]+)"/g)];
console.log(
  "forms:",
  forms.map((m) => m[1] || m[2] || m[3]).join("\n")
);
const charts = [...h.matchAll(/id="(yd[^"]*Chart[^"]*)"/g)].map((m) => m[1]);
console.log("charts:", charts.join(", "));
const h2 = [...h.matchAll(/<h2[^>]*>([\s\S]*?)<\/h2>/g)].map((m) =>
  m[1].replace(/<[^>]+>/g, "").trim()
);
console.log("H2s:\n" + h2.join("\n"));
console.log("bytes", h.length);
