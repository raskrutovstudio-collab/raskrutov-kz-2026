const fs = require("fs");
const path = require("path");
const { spawnSync } = require("child_process");

const page =
  "site_mirror/web-studiya/kontekstnaya-reklama/yandex-direct/kyzylorda/index.html";
const check =
  "site_mirror/_work/yandex-direct-regional-scale/similarity-check.cjs";
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
  "site_mirror/web-studiya/kontekstnaya-reklama/yandex-direct/index.html",
  "site_mirror/web-studiya/kontekstnaya-reklama/kyzylorda/index.html",
  "site_mirror/web-studiya/kontekstnaya-reklama/google-ads/kyzylorda/index.html",
];

const rows = [];
let worst = null;
for (const p of peers) {
  const r = spawnSync(process.execPath, [check, page, p], { encoding: "utf8" });
  const j = JSON.parse(r.stdout || "{}");
  const name = p.includes("/google-ads/")
    ? "google-ads/kyzylorda"
    : p.includes("/kontekstnaya-reklama/kyzylorda/")
      ? "kontekst/kyzylorda"
      : p.includes("/yandex-direct/index")
        ? "yd-index"
        : path.basename(path.dirname(p));
  const row = {
    peer: name,
    pass: j.pass,
    main_c: j.main_containment,
    core_c: j.core_containment,
    main_j: j.main_jaccard,
    core_j: j.core_jaccard,
    dups: j.long_dups,
    samples: j.long_dup_samples,
  };
  rows.push(row);
  const score =
    (j.main_containment || 0) +
    (j.core_containment || 0) +
    (j.main_jaccard || 0) +
    (j.core_jaccard || 0) +
    (j.long_dups || 0) * 10;
  if (!worst || score > worst.score) worst = { ...row, score };
  console.log(
    (j.pass ? "PASS" : "FAIL") +
      " " +
      name +
      " mc=" +
      j.main_containment +
      " cc=" +
      j.core_containment +
      " mj=" +
      j.main_jaccard +
      " cj=" +
      j.core_jaccard +
      " dups=" +
      j.long_dups
  );
  if (!j.pass && j.long_dup_samples) {
    console.log("  dups:", JSON.stringify(j.long_dup_samples, null, 0));
  }
}
console.log("\nWORST:", JSON.stringify(worst, null, 2));
fs.writeFileSync(
  "site_mirror/_work/yandex-direct-regional-scale/kyzylorda/_sim-out.json",
  JSON.stringify({ rows, worst }, null, 2)
);
process.exit(rows.every((r) => r.pass) ? 0 : 1);
