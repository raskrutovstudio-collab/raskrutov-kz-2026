const fs = require("fs");
const src = process.argv[2] || "site_mirror/web-studiya/kontekstnaya-reklama/yandex-direct/kyzylorda/index.html";
const h = fs.readFileSync(src, "utf8");
function extract(id) {
  const m = h.match(new RegExp(`id="${id}"[\\s\\S]*?(?=<section |</main>)`, "i"));
  return m ? m[0].replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim() : "MISSING";
}
for (const id of [
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
]) {
  console.log("\n==== " + id + " ====");
  console.log(extract(id).slice(0, 2800));
}
