const fs = require("fs");
const h = fs.readFileSync(
  "site_mirror/web-studiya/kontekstnaya-reklama/yandex-direct/astana/index.html",
  "utf8"
);
function sec(id) {
  const m = h.match(new RegExp(`id="${id}"[\\s\\S]*?(?=<section|</main>)`, "i"));
  return m
    ? m[0].replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim().slice(0, 900)
    : "missing";
}
for (const id of ["control", "decision", "process", "landing-analytics", "setup", "related"]) {
  console.log("==" + id + "==");
  console.log(sec(id));
  console.log("");
}
