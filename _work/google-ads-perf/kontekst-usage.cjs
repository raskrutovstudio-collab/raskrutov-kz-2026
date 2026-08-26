const fs = require("fs");
const css = fs.readFileSync("site_mirror/assets/css/kontekst-clean.css", "utf8");
const html = fs.readFileSync("site_mirror/web-studiya/kontekstnaya-reklama/google-ads/index.html", "utf8");
const classRe = /\.([a-zA-Z_][\w-]*)/g;
const cssClasses = new Set();
let m;
while ((m = classRe.exec(css)) !== null) cssClasses.add(m[1]);
const bodyMatch = html.match(/<body[^>]*>([\s\S]*)<\/body>/i);
const body = bodyMatch ? bodyMatch[1] : html;
const usedInBody = {};
for (const cls of cssClasses) {
  const attrRe = /class="([^"]*)"/g;
  let count = 0;
  let am;
  while ((am = attrRe.exec(body)) !== null) {
    const parts = am[1].split(/\s+/);
    if (parts.includes(cls)) count++;
  }
  if (count > 0) usedInBody[cls] = count;
}
const sorted = Object.entries(usedInBody).sort((a,b) => b[1]-a[1]);
console.log("kontekst-clean unique class selectors in CSS:", cssClasses.size);
console.log("used in HTML body class attrs:", sorted.length);
console.log("TOP used:");
sorted.forEach(([c,n]) => console.log(n + "\t" + c));
fs.writeFileSync("site_mirror/_work/google-ads-perf/kontekst-class-usage.json", JSON.stringify({
  cssClassCount: cssClasses.size,
  usedCount: sorted.length,
  used: Object.fromEntries(sorted)
}, null, 2));
