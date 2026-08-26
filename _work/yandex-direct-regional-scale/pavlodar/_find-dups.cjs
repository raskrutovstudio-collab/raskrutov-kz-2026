const fs = require("fs");

function strip(html) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&[a-z]+;/gi, " ")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
}

const a = strip(
  fs.readFileSync(
    "site_mirror/web-studiya/kontekstnaya-reklama/yandex-direct/pavlodar/index.html",
    "utf8"
  )
);
const b = strip(
  fs.readFileSync(
    "site_mirror/web-studiya/kontekstnaya-reklama/yandex-direct/astana/index.html",
    "utf8"
  )
);
const sa = a
  .split(/[.!?]+/)
  .map((s) => s.trim())
  .filter((s) => s.split(/\s+/).length > 12);
const sb = new Set(
  b
    .split(/[.!?]+/)
    .map((s) => s.trim())
);
const dups = sa.filter((s) => sb.has(s));
console.log("DUP COUNT", dups.length);
dups.forEach((d, i) => console.log("\n#" + (i + 1) + "\n" + d));
