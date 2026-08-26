const fs = require("fs");
const path = require("path");
const { spawnSync } = require("child_process");

const base =
  "site_mirror/web-studiya/kontekstnaya-reklama/yandex-direct/aktau/index.html";
const peers = [
  "site_mirror/web-studiya/kontekstnaya-reklama/yandex-direct/astana/index.html",
  "site_mirror/web-studiya/kontekstnaya-reklama/yandex-direct/almaty/index.html",
  "site_mirror/web-studiya/kontekstnaya-reklama/yandex-direct/shymkent/index.html",
  "site_mirror/web-studiya/kontekstnaya-reklama/yandex-direct/karaganda/index.html",
  "site_mirror/web-studiya/kontekstnaya-reklama/yandex-direct/aktobe/index.html",
  "site_mirror/web-studiya/kontekstnaya-reklama/yandex-direct/taraz/index.html",
  "site_mirror/web-studiya/kontekstnaya-reklama/yandex-direct/pavlodar/index.html",
  "site_mirror/web-studiya/kontekstnaya-reklama/yandex-direct/ust-kamenogorsk/index.html",
  "site_mirror/web-studiya/kontekstnaya-reklama/yandex-direct/semey/index.html",
  "site_mirror/web-studiya/kontekstnaya-reklama/yandex-direct/atyrau/index.html",
  "site_mirror/web-studiya/kontekstnaya-reklama/yandex-direct/kostanay/index.html",
  "site_mirror/web-studiya/kontekstnaya-reklama/yandex-direct/kyzylorda/index.html",
  "site_mirror/web-studiya/kontekstnaya-reklama/yandex-direct/uralsk/index.html",
  "site_mirror/web-studiya/kontekstnaya-reklama/yandex-direct/petropavlovsk/index.html",
  "site_mirror/web-studiya/kontekstnaya-reklama/yandex-direct/index.html",
  "site_mirror/web-studiya/kontekstnaya-reklama/aktau/index.html",
  "site_mirror/web-studiya/kontekstnaya-reklama/google-ads/aktau/index.html",
];

const checker = "site_mirror/_work/yandex-direct-regional-scale/similarity-check.cjs";
const rows = [];
let worst = null;
let fail = 0;

for (const p of peers) {
  if (!fs.existsSync(p)) {
    console.log("SKIP missing", p);
    continue;
  }
  const r = spawnSync(process.execPath, [checker, base, p], { encoding: "utf8" });
  const j = JSON.parse(r.stdout);
  const label =
    p.includes("/yandex-direct/index")
      ? "yd-index"
      : p.includes("/google-ads/")
        ? "google-ads/aktau"
        : p.includes("/kontekstnaya-reklama/aktau/")
          ? "kontekst/aktau"
          : path.basename(path.dirname(p));
  const score =
    j.main_containment +
    j.core_containment +
    j.main_jaccard +
    j.core_jaccard +
    j.long_dups * 10;
  rows.push({ label, ...j, score });
  if (!j.pass) fail++;
  if (!worst || score > worst.score) worst = { label, ...j, score };
}

rows.sort((a, b) => b.score - a.score);
console.log(JSON.stringify({ fail, worst, rows }, null, 2));
fs.writeFileSync(
  "site_mirror/_work/yandex-direct-regional-scale/aktau/similarity-report.json",
  JSON.stringify({ fail, worst, rows }, null, 2),
  "utf8"
);
process.exit(fail ? 1 : 0);
