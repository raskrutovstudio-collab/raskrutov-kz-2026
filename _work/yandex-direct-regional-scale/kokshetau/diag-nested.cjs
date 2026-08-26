const fs = require("fs");

function analyze(slug) {
  const h = fs.readFileSync(
    `site_mirror/web-studiya/kontekstnaya-reklama/yandex-direct/${slug}/index.html`,
    "utf8"
  );
  const opens = [...h.matchAll(/<section\b([^>]*)>/g)].map((m, i) => ({
    i,
    attrs: m[1].trim().slice(0, 80),
  }));
  console.log("\n==", slug, "section opens", opens.length);
  opens.forEach((o) => console.log(o.i, o.attrs || "(no attrs)"));
}

analyze("aktau");
analyze("kokshetau");
analyze("turkestan");
