const fs = require("fs");
const h = fs.readFileSync(
  "site_mirror/web-studiya/kontekstnaya-reklama/yandex-direct/astana/index.html",
  "utf8"
);
function extract(id) {
  const m = h.match(new RegExp(`id="${id}"[\\s\\S]*?(?=<section |</main>)`, "i"));
  return m ? m[0].replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim().slice(0, 2500) : "MISSING";
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
  console.log("\n==== " + id + " ====\n" + extract(id));
}
