const fs = require("fs");
const html = fs.readFileSync("site_mirror/web-studiya/kontekstnaya-reklama/google-ads/index.html", "utf8");
const sels = fs.readFileSync("site_mirror/_work/google-ads-perf/_kontekst-all-selectors.txt", "utf8").split(/\n/).filter(Boolean);
const requested = new Set([
  "rk-section","rk-h2","rk-breadcrumbs",
  "ctx-btn","ctx-btn--primary","ctx-btn__arrow","ctx-btn--ghost","ctx-btn--light",
  "ctx-hero","ctx-hero__grid","ctx-hero__title","ctx-hero__sub","ctx-hero__lead","ctx-hero__actions",
  "ctx-cta-band","ctx-related__grid","ctx-page","gads-page","rk-clean"
]);
const page = new Set();
for (const m of html.matchAll(/class="([^"]+)"/g)) m[1].split(/\s+/).filter(Boolean).forEach((c) => page.add(c));
function mentions(sel, cls) {
  return new RegExp("\\." + cls.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + "(?![a-zA-Z0-9_-])").test(sel);
}
const interesting = [];
for (const sel of sels) {
  const hits = [...page].filter((c) => (c.startsWith("ctx-") || c.startsWith("rk-")) && mentions(sel, c));
  const extra = hits.filter((h) => !requested.has(h));
  if (extra.length) interesting.push({ sel, extra });
}
console.log("Missed count", interesting.length);
interesting.forEach((x) => console.log("-", x.sel, "|", x.extra.join(",")));
console.log("FAQ id/class on page?", /id="faq"|rk-faq|class="[^"]*faq/.test(html));
console.log("ctx-related on page?", /\bctx-related\b/.test(html));
console.log("gads-page on page?", /\bgads-page\b/.test(html));

// List all kontekst rules that mention ctx-related (not only __grid)
const css = fs.readFileSync("site_mirror/assets/css/kontekst-clean.css", "utf8");
const relatedIdx = [];
const re = /\.ctx-related[^{]*\{[^}]*\}/g;
let m;
while ((m = re.exec(css))) relatedIdx.push(m[0].slice(0, 180));
console.log("\nctx-related* rule snippets:");
relatedIdx.forEach((s) => console.log(s.replace(/\s+/g, " ")));

// Check rk-clean and gads-page in kontekst
console.log("\nrk-clean in kontekst?", /\.rk-clean\b/.test(css));
console.log("gads-page in kontekst?", /\.gads-page\b/.test(css));

// Hero media queries in extract
const extract = fs.readFileSync("site_mirror/_work/google-ads-perf/kontekst-used-extract.css", "utf8");
console.log("\nExtract has @media?", /@media/.test(extract));
const mediaBlocks = extract.match(/@media[^{]+\{[\s\S]*?\n\}/g) || [];
console.log("media blocks:", mediaBlocks.length);
mediaBlocks.forEach((b) => console.log("---\n" + b.slice(0, 300)));

// Which requested tokens appear in extract
for (const t of [
  "rk-section","rk-h2","rk-breadcrumbs","ctx-btn","ctx-hero","ctx-hero__grid","ctx-hero__title",
  "ctx-hero__sub","ctx-hero__lead","ctx-hero__actions","ctx-cta-band","ctx-related__grid","ctx-btn--primary",
  "ctx-btn__arrow","ctx-btn--ghost","ctx-btn--light"
]) {
  console.log(t, "in extract:", extract.includes("." + t));
}
