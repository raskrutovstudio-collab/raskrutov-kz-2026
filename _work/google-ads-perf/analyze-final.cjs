const fs = require("fs");
const css = fs.readFileSync("site_mirror/assets/css/kontekst-clean.css", "utf8");
const extract = fs.readFileSync("site_mirror/_work/google-ads-perf/kontekst-used-extract.css", "utf8");
const html = fs.readFileSync("site_mirror/web-studiya/kontekstnaya-reklama/google-ads/index.html", "utf8");
const crit = fs.readFileSync("site_mirror/assets/css/home-clean-critical.v1.css", "utf8");
const crit80 = crit.split(/\n/).slice(0, 80).join("\n");

console.log("kontekst has :root?", /:root\s*\{/.test(css));
console.log("kontekst start (200 chars):", css.slice(0, 200).replace(/\s+/g, " "));
const varUses = [...extract.matchAll(/var\(--([a-zA-Z0-9_-]+)\)/g)].map(m => m[1]);
console.log("vars used in extract:", [...new Set(varUses)].join(", ") || "(none)");

console.log("\n#faq .rk-h2 in extract?", extract.includes("#faq"));
console.log(".rk-faq in extract?", extract.includes("rk-faq"));
console.log("ctx-hero__visual in extract?", extract.includes("ctx-hero__visual"));
console.log("ctx-hero__visual on page?", /ctx-hero__visual/.test(html));
console.log("ctx-hero__copy on page?", /ctx-hero__copy/.test(html));

// Show hero HTML structure briefly
const h = html.indexOf('class="ctx-hero"');
console.log("\nhero snippet:", html.slice(h, h+900).replace(/\s+/g, " ").slice(0, 700));

// Correct first-80 coverage (strict class selectors only)
console.log("\n=== STRICT first-80 coverage ===");
const strict = {
  "header (.rk-header)": /\.rk-header\b/.test(crit80),
  "logo (.rk-logo)": /\.rk-logo\b/.test(crit80),
  "nav (.rk-nav / .rk-mobile-nav)": /\.rk-nav\b|\.rk-mobile-nav\b/.test(crit80),
  "burger (.rk-burger)": /\.rk-burger\b/.test(crit80),
  "container (.rk-container)": /\.rk-container\b/.test(crit80),
  "container var (--rk-container)": /--rk-container\b/.test(crit80),
  "body reset (*, body.rk-clean)": /\*\s*,|body\.rk-clean/.test(crit80),
  "breadcrumbs (.rk-breadcrumbs)": /\.rk-breadcrumbs\b/.test(crit80),
  "header height var": /--rk-header-h\b/.test(crit80)
};
Object.entries(strict).forEach(([k,v]) => console.log(k + ":", v ? "YES" : "NO"));

console.log("\nLines 81-100 of critical:");
console.log(crit.split(/\n/).slice(80, 100).join("\n"));

// Count rules in extract
const ruleCount = (extract.match(/\{/g) || []).length;
console.log("\nextract approx blocks:", ruleCount);
console.log("extract lines:", extract.split(/\n/).length);
