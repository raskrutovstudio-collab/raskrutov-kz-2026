const fs = require("fs");
const path = require("path");
const { spawnSync } = require("child_process");

const root = "site_mirror/web-studiya/kontekstnaya-reklama/yandex-direct";
const target = path.join(root, "kokshetau/index.html");
const check = "site_mirror/_work/yandex-direct-regional-scale/similarity-check.cjs";

const peers = fs
  .readdirSync(root, { withFileTypes: true })
  .filter((d) => d.isDirectory())
  .map((d) => d.name)
  .filter((n) => n !== "kokshetau")
  .map((n) => path.join(root, n, "index.html"));

peers.push(path.join(root, "index.html"));
peers.push("site_mirror/web-studiya/kontekstnaya-reklama/kokshetau/index.html");
peers.push("site_mirror/web-studiya/kontekstnaya-reklama/google-ads/kokshetau/index.html");

const rows = [];
let worst = null;
let fail = 0;

for (const p of peers) {
  if (!fs.existsSync(p)) {
    rows.push({ peer: p, missing: true });
    continue;
  }
  const r = spawnSync("node", [check, target, p], { encoding: "utf8" });
  let j;
  try {
    j = JSON.parse(r.stdout);
  } catch (e) {
    rows.push({ peer: p, parse_error: true, stdout: r.stdout, stderr: r.stderr });
    fail++;
    continue;
  }
  const label = p
    .replace(/\\/g, "/")
    .replace("site_mirror/web-studiya/kontekstnaya-reklama/yandex-direct/", "yd/")
    .replace("site_mirror/web-studiya/kontekstnaya-reklama/", "ctx/");
  const row = {
    peer: label,
    main_c: j.main_containment,
    core_c: j.core_containment,
    main_j: j.main_jaccard,
    core_j: j.core_jaccard,
    dups: j.long_dups,
    pass: j.pass,
    samples: j.long_dup_samples,
  };
  rows.push(row);
  if (!j.pass) fail++;
  const score = j.main_containment + j.core_containment + j.main_jaccard + j.core_jaccard;
  if (!worst || score > worst.score) worst = { ...row, score };
}

rows.sort((a, b) => (b.main_c || 0) - (a.main_c || 0));
console.log(JSON.stringify({ fail, worst, rows }, null, 2));
process.exit(fail ? 1 : 0);
