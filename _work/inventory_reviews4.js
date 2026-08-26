const fs = require("fs");
const path = require("path");

const otz = fs.readFileSync(
  "site_mirror/assets/s239948.lpmotortest.com/otzivi/index.html",
  "utf8"
);

const idx = otz.indexOf('atob(u)),l.contentWindow');
const slice = otz.slice(idx, idx + 50);
console.log("slice near atob:", slice);

// Find the quoted base64 after the function call
const re = /decodeURIComponent\(escape\(atob\(u\)\)\)[\s\S]{0,120}?\("big_light_[^"]+",\s*"([A-Za-z0-9+/=]+)"\)/;
const m = otz.match(re);
if (!m) {
  // alternate: payload is second arg
  const re2 = /\("big_light_70000001041348422",\s*"([A-Za-z0-9+/=]+)"\)/;
  const m2 = otz.match(re2);
  if (!m2) {
    console.log("NO MATCH");
    process.exit(0);
  }
  var b64 = m2[1];
} else {
  var b64 = m[1];
}
console.log("b64 length", b64.length);
const html = Buffer.from(b64, "base64").toString("utf8");
fs.writeFileSync("site_mirror/_work/otzivi_2gis_widget_decoded.html", html, "utf8");
console.log(html.slice(0, 1000));
for (const mm of html.matchAll(/__([A-Za-z0-9]+)__\s*=\s*'([^']*)'/g)) {
  console.log(mm[1] + "=" + mm[2]);
}
console.log(
  "urls:",
  [...html.matchAll(/https?:\/\/[^"'\\\s]+/g)].map((x) => x[0])
);

// Inspect local letter asset folder structure
const h = "54bf40700e8e987e359d73bd97e57a13";
const root = path.join(
  "site_mirror/assets/m-files.cdn1.cc/lpfile",
  h[0],
  h[1],
  h[2],
  h
);
function walk(d, depth = 0, acc = []) {
  if (depth > 4) return acc;
  for (const e of fs.readdirSync(d, { withFileTypes: true })) {
    const full = path.join(d, e.name);
    if (e.isDirectory()) walk(full, depth + 1, acc);
    else acc.push(path.relative("site_mirror", full).split(path.sep).join("/"));
  }
  return acc;
}
console.log("\nLocal files under first letter hash:");
if (fs.existsSync(root)) console.log(walk(root).slice(0, 30));
else console.log("missing");

// sizes from sozdanie named letters
const city = fs.readFileSync(
  "site_mirror/web-studiya/sozdanie-saitov/index.html",
  "utf8"
);
const reL =
  /itemprop="name"\s+content="([^"]*Благодарствен[^"]*)"[\s\S]{0,1200}?<img([^>]*)>/gi;
let mm;
while ((mm = reL.exec(city))) {
  const name = mm[1];
  const tag = mm[2];
  const src = (tag.match(/src="([^"]*)"/) || [])[1];
  const alt = (tag.match(/alt="([^"]*)"/) || [])[1];
  const w = (tag.match(/width="([^"]*)"/) || [])[1];
  const hgt = (tag.match(/height="([^"]*)"/) || [])[1];
  const hash = (src.match(/\/([0-9a-f]{32})\//i) || [])[1];
  console.log({ name, hash, w, h: hgt, alt: alt && alt.slice(0, 80), src: src && src.slice(0, 120) });
}
