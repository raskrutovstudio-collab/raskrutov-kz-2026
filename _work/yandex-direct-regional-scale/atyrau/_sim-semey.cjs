const fs = require("fs");
const r = require("child_process").spawnSync(
  "node",
  [
    "site_mirror/_work/yandex-direct-regional-scale/similarity-check.cjs",
    "site_mirror/web-studiya/kontekstnaya-reklama/yandex-direct/atyrau/index.html",
    "site_mirror/web-studiya/kontekstnaya-reklama/yandex-direct/semey/index.html",
  ],
  { encoding: "utf8" }
);
console.log(r.stdout);
