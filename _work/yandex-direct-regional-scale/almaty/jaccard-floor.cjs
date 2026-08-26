const fs = require("fs");

function stripChrome(html) {
  return html
    .replace(/<header[\s\S]*?<\/header>/gi, " ")
    .replace(/<nav class="rk-sticky-cta"[\s\S]*?<\/nav>/gi, " ")
    .replace(/<div class="rk-soc-widget"[\s\S]*?<\/div>\s*(?=<div class="rk-modal"|<script)/gi, " ")
    .replace(/<div class="rk-modal"[\s\S]*?<\/div>\s*(?=<script)/gi, " ")
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&[a-z]+;/gi, " ")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
}

function jac(a, b) {
  const A = new Set(a.split(/\s+/));
  const B = new Set(b.split(/\s+/));
  let inter = 0;
  for (const x of A) if (B.has(x)) inter++;
  return { pct: +((inter / (A.size + B.size - inter)) * 100).toFixed(2), a: A.size, b: B.size, inter };
}

const base = "site_mirror/web-studiya/kontekstnaya-reklama/yandex-direct/astana/index.html";
const cmp = {
  "almaty (new yd page)": "site_mirror/web-studiya/kontekstnaya-reklama/yandex-direct/almaty/index.html",
  "google-ads/astana (other service, other city page)": "site_mirror/web-studiya/kontekstnaya-reklama/google-ads/astana/index.html",
  "kontekstnaya-reklama/almaty (other service)": "site_mirror/web-studiya/kontekstnaya-reklama/almaty/index.html",
  "seo-prodvizhenie (unrelated service)": "site_mirror/web-studiya/seo-prodvizhenie/index.html",
  "kontakty (unrelated page)": "site_mirror/kontakty/index.html",
};

const ta = stripChrome(fs.readFileSync(base, "utf8"));
for (const [label, p] of Object.entries(cmp)) {
  if (!fs.existsSync(p)) {
    console.log(label.padEnd(52), "MISSING", p);
    continue;
  }
  const tb = stripChrome(fs.readFileSync(p, "utf8"));
  const r = jac(ta, tb);
  console.log(label.padEnd(52), "jaccard=" + r.pct + "%", "uniqA=" + r.a, "uniqB=" + r.b, "shared=" + r.inter);
}
