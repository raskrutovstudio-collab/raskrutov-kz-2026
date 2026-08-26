const fs = require("fs");

function audit(slug, file) {
  const j = JSON.parse(fs.readFileSync(file, "utf8"));
  const mt = j.audits["mainthread-work-breakdown"].details.items;
  console.log("===", slug, "TBT", Math.round(j.audits["total-blocking-time"].numericValue));
  mt.forEach((i) => console.log(i.groupLabel, Math.round(i.duration)));
}

audit("aktau", "site_mirror/_work/yandex-direct-regional-scale/kokshetau/ctrl-aktau/m1.json");
audit("kokshetau", "site_mirror/_work/yandex-direct-regional-scale/kokshetau/lh-cool/m1.json");

const a = fs.readFileSync(
  "site_mirror/web-studiya/kontekstnaya-reklama/yandex-direct/aktau/index.html",
  "utf8"
);
const k = fs.readFileSync(
  "site_mirror/web-studiya/kontekstnaya-reklama/yandex-direct/kokshetau/index.html",
  "utf8"
);

function strip(h) {
  return h
    .replace(/<script type="application\/ld\+json">[\s\S]*?<\/script>/, "JSONLD")
    .replace(/>([^<]{1,})</g, "><");
}

console.log("stripped equal", strip(a) === strip(k));
console.log("bytes", a.length, k.length);
console.log(
  "faq items",
  (a.match(/@type":"Question"/g) || []).length,
  (k.match(/@type":"Question"/g) || []).length
);
console.log("h2", (a.match(/<h2/g) || []).length, (k.match(/<h2/g) || []).length);
console.log("p count", (a.match(/<p[ >]/g) || []).length, (k.match(/<p[ >]/g) || []).length);

// long unbroken strings that might force layout work
function longTokens(h) {
  const text = h.replace(/<[^>]+>/g, " ");
  return text.split(/\s+/).filter((t) => t.length > 40).slice(0, 10);
}
console.log("long tokens aktau", longTokens(a));
console.log("long tokens kokshetau", longTokens(k));
