const fs = require("fs");
const h = fs.readFileSync(
  "site_mirror/web-studiya/kontekstnaya-reklama/yandex-direct/pavlodar/index.html",
  "utf8"
);
for (const m of h.matchAll(/[^.]{0,40}а не[^.]{0,40}/gi)) {
  console.log("-", m[0].replace(/\s+/g, " ").trim());
}
