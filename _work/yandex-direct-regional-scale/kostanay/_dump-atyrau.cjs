const fs = require("fs");
const h = fs.readFileSync(
  "site_mirror/web-studiya/kontekstnaya-reklama/yandex-direct/atyrau/index.html",
  "utf8"
);
function dump(id) {
  const re = new RegExp(
    `<section[^>]*id="${id}"[^>]*>[\\s\\S]*?</section>`,
    "i"
  );
  const m = h.match(re);
  if (!m) {
    console.log("MISSING", id);
    return;
  }
  const text = m[0]
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  console.log("\n====", id, "len", m[0].length, "====");
  console.log(text.slice(0, 900));
}
[
  "ctx-hero",
  "short-answer",
  "local-config",
  "audience",
  "campaign-types",
  "setup",
  "pricing",
  "control",
  "decision",
  "landing-analytics",
  "process",
  "faq",
  "related",
].forEach(dump);
console.log("\nlines", h.split(/\n/).length);
console.log("title", (h.match(/<title>([^<]+)/) || [])[1]);
