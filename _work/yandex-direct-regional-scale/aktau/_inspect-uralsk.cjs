const fs = require("fs");
const h = fs.readFileSync(
  "site_mirror/web-studiya/kontekstnaya-reklama/yandex-direct/uralsk/index.html",
  "utf8"
);
const m = h.match(/application\/ld\+json">([\s\S]*?)<\/script>/);
const j = JSON.parse(m[1]);
console.log(
  JSON.stringify(
    j["@graph"].map((x) => ({
      type: x["@type"],
      name: x.name,
      desc: (x.description || "").slice(0, 160),
      area: x.areaServed,
    })),
    null,
    2
  )
);
const bc = h.match(/rk-breadcrumbs[\s\S]*?<\/nav>/);
console.log(bc[0].replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim());
console.log("media769", /media="\(min-width: 769px\)"/.test(h));
