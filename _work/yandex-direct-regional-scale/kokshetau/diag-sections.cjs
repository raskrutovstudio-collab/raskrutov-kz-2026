const fs = require("fs");
for (const s of ["astana", "aktau", "turkestan", "kokshetau", "taldykorgan", "kostanay"]) {
  const h = fs.readFileSync(
    `site_mirror/web-studiya/kontekstnaya-reklama/yandex-direct/${s}/index.html`,
    "utf8"
  );
  const secs = [...h.matchAll(/<section[^>]*id="([^"]+)"/g)].map((m) => m[1]);
  const open = (h.match(/<section/g) || []).length;
  console.log(s, "section", open, "ids", secs.join(","));
}
