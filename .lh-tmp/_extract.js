const fs = require("fs");
const path = require("path");
const data = JSON.parse(fs.readFileSync(".lh-tmp/google-ads-prerelease-run2.json", "utf8"));
const a = data.audits["inspector-issues"];
const lcp = data.audits["largest-contentful-paint-element"];
const tpc = data.audits["third-party-cookies"];
const out = [];
out.push("=== CATEGORY SCORES ===");
for (const [k, v] of Object.entries(data.categories || {})) out.push(k + ": " + v.score + " (" + v.title + ")");
out.push("");
out.push("=== inspector-issues DETAILS ===");
out.push(JSON.stringify(a && a.details, null, 2));
out.push("");
out.push("=== LCP ELEMENT DETAILS ===");
out.push(JSON.stringify(lcp && lcp.details, null, 2));
out.push("");
out.push("=== third-party-cookies DETAILS ===");
out.push(JSON.stringify(tpc && tpc.details, null, 2));
fs.writeFileSync(".lh-tmp/_inspector-lcp-detail.txt", out.join("\n"), "utf8");

const pagePath = "site_mirror/web-studiya/kontekstnaya-reklama/google-ads/index.html";
const html = fs.readFileSync(pagePath, "utf8");
const hrefRe = /href\s*=\s*["'](\/[^"'#?]*)/gi;
const found = new Set();
let m;
while ((m = hrefRe.exec(html)) !== null) {
  let p = m[1];
  try { p = decodeURIComponent(p); } catch (e) {}
  found.add(p);
}
const results = [];
for (const p of [...found].sort()) {
  const rel = p.replace(/^\//, "");
  const candidates = [];
  if (rel === "" || rel.endsWith("/")) {
    const dir = rel.replace(/\/$/, "");
    candidates.push(path.join("site_mirror", dir, "index.html"));
    if (dir) candidates.push(path.join("site_mirror", dir + ".html"));
  } else {
    candidates.push(path.join("site_mirror", rel));
    candidates.push(path.join("site_mirror", rel, "index.html"));
    candidates.push(path.join("site_mirror", rel + ".html"));
    candidates.push(path.join("site_mirror", rel.replace(/\.html$/, ""), "index.html"));
  }
  const existing = candidates.filter((c) => fs.existsSync(c));
  results.push({ href: p, exists: existing.length > 0, matched: existing, tried: candidates });
}
const missing = results.filter((r) => !r.exists);
const ok = results.filter((r) => r.exists);
const hout = [];
hout.push("PAGE: " + pagePath);
hout.push("Unique path-only hrefs: " + results.length);
hout.push("EXIST: " + ok.length);
hout.push("MISSING: " + missing.length);
hout.push("");
hout.push("=== MISSING ===");
for (const r of missing) {
  hout.push(r.href);
  hout.push("  tried: " + r.tried.join(" | "));
}
hout.push("");
hout.push("=== EXIST (href -> matched) ===");
for (const r of ok) hout.push(r.href + " -> " + r.matched.join(", "));
fs.writeFileSync(".lh-tmp/_local-hrefs.txt", hout.join("\n"), "utf8");
console.log("OK missing=" + missing.length + " exist=" + ok.length);
