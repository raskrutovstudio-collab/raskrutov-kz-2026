const fs = require("fs");
const h = fs.readFileSync(
  "site_mirror/web-studiya/kontekstnaya-reklama/yandex-direct/kostanay/index.html",
  "utf8"
);
function extract(id) {
  const m = h.match(new RegExp(`id="${id}"[\\s\\S]*?(?=<section |</main>)`, "i"));
  return m ? m[0] : "MISSING " + id;
}
const ids = [
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
  "contacts",
];
let out = "";
for (const id of ids) {
  const block = extract(id);
  const text = block
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<svg[\s\S]*?<\/svg>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  out += `\n==== ${id} ====\n${text}\n`;
}
fs.writeFileSync(
  "site_mirror/_work/yandex-direct-regional-scale/kyzylorda/_kostanay-text.txt",
  out,
  "utf8"
);
console.log("wrote", out.length);
