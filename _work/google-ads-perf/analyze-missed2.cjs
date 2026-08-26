const fs = require("fs");
const html = fs.readFileSync("site_mirror/web-studiya/kontekstnaya-reklama/google-ads/index.html", "utf8");
const css = fs.readFileSync("site_mirror/assets/css/kontekst-clean.css", "utf8");
const extract = fs.readFileSync("site_mirror/_work/google-ads-perf/kontekst-used-extract.css", "utf8");
const crit = fs.readFileSync("site_mirror/assets/css/home-clean-critical.v1.css", "utf8");
const crit80 = crit.split(/\n/).slice(0, 80).join("\n");

console.log("=== FAQ / related HTML snippets ===");
const faqHits = [...html.matchAll(/id="faq"|rk-faq|gads-faq|class="[^"]*faq[^"]*"/gi)].map(m => m[0]);
console.log("faq-like:", [...new Set(faqHits)].join(" | ") || "(none)");
// show nearby context for id=faq
const idx = html.indexOf('id="faq"');
if (idx >= 0) console.log("id=faq context:", html.slice(Math.max(0,idx-80), idx+200).replace(/\s+/g," "));
const idx2 = html.indexOf("rk-faq");
if (idx2 >= 0) console.log("rk-faq context:", html.slice(Math.max(0,idx2-40), idx2+120).replace(/\s+/g," "));
else console.log("rk-faq string: absent");

console.log("\n=== kontekst rules for page classes NOT in extract request ===");
// Find classes on page that appear in kontekst but weren't in user request list
const page = new Set();
for (const m of html.matchAll(/class="([^"]+)"/g)) m[1].split(/\s+/).filter(Boolean).forEach(c => page.add(c));
const userReq = new Set(["rk-section","rk-h2","rk-breadcrumbs","ctx-btn","ctx-btn--primary","ctx-btn__arrow","ctx-btn--ghost","ctx-btn--light","ctx-hero","ctx-hero__grid","ctx-hero__title","ctx-hero__sub","ctx-hero__lead","ctx-hero__actions","ctx-cta-band","ctx-related__grid"]);
function inCss(cls) {
  return new RegExp("\\." + cls.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + "(?![a-zA-Z0-9_-])").test(css);
}
const pageInKontekst = [...page].filter(c => (c.startsWith("ctx-") || c.startsWith("rk-")) && inCss(c)).sort();
const notRequested = pageInKontekst.filter(c => !userReq.has(c));
console.log("page ctx/rk classes that EXIST in kontekst-clean:");
pageInKontekst.forEach(c => console.log(" ", c, userReq.has(c) ? "(requested)" : "*** NOT in user request list ***"));
console.log("\nUnrequested but present in both page+kontekst:", notRequested.join(", ") || "(none)");

// For each unrequested, show selectors from kontekst
const selsFile = fs.readFileSync("site_mirror/_work/google-ads-perf/_kontekst-all-selectors.txt","utf8").split(/\n/);
for (const cls of notRequested) {
  const re = new RegExp("\\." + cls.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + "(?![a-zA-Z0-9_-])");
  const hits = selsFile.filter(s => re.test(s));
  console.log("\nRules for ." + cls + ":");
  hits.forEach(h => console.log("  ", h));
}

console.log("\n=== HERO full check: all ctx-hero* selectors in source ===");
selsFile.filter(s => /\.ctx-hero/.test(s)).forEach(s => console.log(" ", s));

console.log("\n=== :root in extract ===");
const rootMatch = extract.match(/:root\s*\{[\s\S]*?\}/);
console.log(rootMatch ? rootMatch[0] : "(no :root)");

console.log("\n=== home-clean-critical FIRST 80 coverage ===");
const checks = {
  header: /\.rk-header\b|header\b/.test(crit80),
  logo: /\.rk-logo\b/.test(crit80),
  nav: /\.rk-nav\b|\.rk-mobile-nav\b/.test(crit80),
  burger: /\.rk-burger\b/.test(crit80),
  container: /\.rk-container\b|--rk-container/.test(crit80),
  "body reset": /box-sizing|body\.rk-clean/.test(crit80),
  "breadcrumbs basics": /\.rk-breadcrumbs\b/.test(crit80)
};
Object.entries(checks).forEach(([k,v]) => console.log(k + ":", v ? "YES in first 80" : "NO in first 80"));

// Also where they appear in full file (line numbers)
function firstLine(re) {
  const lines = crit.split(/\n/);
  for (let i=0;i<lines.length;i++) if (re.test(lines[i])) return i+1;
  return null;
}
console.log("\nFirst occurrence in FULL home-clean-critical.v1.css:");
[["header", /\.rk-header\b/],["logo", /\.rk-logo\b/],["nav", /\.rk-nav\b/],["burger", /\.rk-burger\b/],["container", /\.rk-container\b/],["breadcrumbs", /\.rk-breadcrumbs\b/]].forEach(([n,re]) => {
  console.log(n + ": line", firstLine(re) || "ABSENT");
});

console.log("\nExtract byte length:", Buffer.byteLength(extract));
console.log("File size on disk:", fs.statSync("site_mirror/_work/google-ads-perf/kontekst-used-extract.css").size);
