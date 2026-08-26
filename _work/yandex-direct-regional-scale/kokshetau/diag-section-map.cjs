const fs = require("fs");

function count(slug) {
  const h = fs.readFileSync(
    `site_mirror/web-studiya/kontekstnaya-reklama/yandex-direct/${slug}/index.html`,
    "utf8"
  );
  const open = (h.match(/<section\b/g) || []).length;
  const close = (h.match(/<\/section>/g) || []).length;
  console.log(slug, "open", open, "close", close, "delta", open - close);
}

for (const s of [
  "aktau",
  "turkestan",
  "kokshetau",
  "taldykorgan",
  "petropavlovsk",
  "kostanay",
]) {
  count(s);
}

// Show section boundaries for aktau vs kokshetau around audience/campaign cards
function sectionMap(slug) {
  const h = fs.readFileSync(
    `site_mirror/web-studiya/kontekstnaya-reklama/yandex-direct/${slug}/index.html`,
    "utf8"
  );
  const re = /<\/?section\b[^>]*>/g;
  let m;
  let depth = 0;
  const rows = [];
  while ((m = re.exec(h))) {
    const isClose = m[0].startsWith("</");
    if (isClose) depth--;
    else depth++;
    const line = h.slice(0, m.index).split("\n").length;
    rows.push({ line, depth, tag: m[0].slice(0, 70) });
  }
  console.log("\n==", slug);
  rows.forEach((r) => console.log(r.line, "d=" + r.depth, r.tag));
}

sectionMap("aktau");
sectionMap("kokshetau");
