const fs = require("fs");
const { spawnSync } = require("child_process");
const page =
  "site_mirror/web-studiya/kontekstnaya-reklama/yandex-direct/pavlodar/index.html";
const peer =
  "site_mirror/web-studiya/kontekstnaya-reklama/yandex-direct/astana/index.html";
const r = spawnSync(
  "node",
  [
    "site_mirror/_work/yandex-direct-regional-scale/similarity-check.cjs",
    page,
    peer,
  ],
  { encoding: "utf8" }
);
const j = JSON.parse(r.stdout);
console.log(JSON.stringify(j, null, 2));
