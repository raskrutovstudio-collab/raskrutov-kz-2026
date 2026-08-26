const fs = require("fs");
const { execSync } = require("child_process");

const a = fs.readFileSync(
  "site_mirror/web-studiya/kontekstnaya-reklama/yandex-direct/aktau/index.html",
  "utf8"
);
const k = fs.readFileSync(
  "site_mirror/web-studiya/kontekstnaya-reklama/yandex-direct/kokshetau/index.html",
  "utf8"
);

function tags(h) {
  return (h.match(/<\/?[a-zA-Z][^>]*>/g) || []).map((t) =>
    t.replace(/\s+/g, " ").replace(/ (class|id|href|src|name|for|type|aria-[a-z-]+|data-[a-z-]+|width|height|alt|loading|decoding|fetchpriority|rel|as|media|onload|crossorigin)="[^"]*"/g, "")
  );
}

const ta = tags(a);
const tk = tags(k);
console.log("tag counts", ta.length, tk.length);

// find first structural divergence ignoring text
let i = 0;
while (i < Math.min(ta.length, tk.length) && ta[i] === tk[i]) i++;
console.log("first diverge at", i);
console.log("aktau", ta[i - 2], ta[i - 1], ta[i], ta[i + 1], ta[i + 2]);
console.log("koks", tk[i - 2], tk[i - 1], tk[i], tk[i + 1], tk[i + 2]);

// count by tag name
function hist(arr) {
  const m = {};
  for (const t of arr) {
    const n = (t.match(/^<\/?([a-zA-Z0-9]+)/) || [])[1] || "?";
    m[n] = (m[n] || 0) + 1;
  }
  return m;
}
const ha = hist(ta);
const hk = hist(tk);
const keys = new Set([...Object.keys(ha), ...Object.keys(hk)]);
for (const key of [...keys].sort()) {
  if (ha[key] !== hk[key]) console.log("tagdiff", key, ha[key] || 0, hk[key] || 0);
}

// compare critical CSS length
const ca = (a.match(/<style id="yd-critical"[\s\S]*?<\/style>/) || [""])[0].length;
const ck = (k.match(/<style id="yd-critical"[\s\S]*?<\/style>/) || [""])[0].length;
console.log("critical css len", ca, ck);

const sa = (a.match(/<style[\s\S]*?<\/style>/g) || []).map((x) => x.length);
const sk = (k.match(/<style[\s\S]*?<\/style>/g) || []).map((x) => x.length);
console.log("all styles", sa, sk);
