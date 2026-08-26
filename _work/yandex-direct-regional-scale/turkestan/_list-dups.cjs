const fs = require("fs");
function strip(html) {
  return html
    .replace(/<header[\s\S]*?<\/header>/gi, " ")
    .replace(/id="contacts"[\s\S]*?(?=<nav class="rk-sticky|<\/main>)/gi, " ")
    .replace(/<div class="rk-modal"[\s\S]*?<\/div>\s*(?=<script)/gi, " ")
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
}
function longSents(t) {
  return t
    .split(/[.!?]+/)
    .map((s) => s.trim())
    .filter((s) => s.split(/\s+/).length > 12);
}
const a = strip(
  fs.readFileSync(
    "site_mirror/web-studiya/kontekstnaya-reklama/yandex-direct/turkestan/index.html",
    "utf8"
  )
);
for (const peer of ["uralsk", "aktau"]) {
  const b = strip(
    fs.readFileSync(
      `site_mirror/web-studiya/kontekstnaya-reklama/yandex-direct/${peer}/index.html`,
      "utf8"
    )
  );
  const sb = new Set(longSents(b));
  const dups = longSents(a).filter((s) => sb.has(s));
  console.log("\n====", peer, dups.length, "====");
  dups.forEach((s, i) => console.log(i + 1, s));
}
