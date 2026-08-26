/**
 * Similarity vs all published YD + yd index + kontekst/google-ads turkestan
 */
const fs = require("fs");
const path = require("path");
const { execFileSync } = require("child_process");

const ROOT = process.cwd();
const TARGET =
  "site_mirror/web-studiya/kontekstnaya-reklama/yandex-direct/turkestan/index.html";
const CHECK = path.join(
  ROOT,
  "site_mirror/_work/yandex-direct-regional-scale/similarity-check.cjs"
);

const peers = [
  "almaty",
  "shymkent",
  "karaganda",
  "aktobe",
  "taraz",
  "pavlodar",
  "ust-kamenogorsk",
  "semey",
  "atyrau",
  "kostanay",
  "kyzylorda",
  "uralsk",
  "petropavlovsk",
  "aktau",
  "astana",
];

const extra = [
  {
    label: "yd-index",
    file: "site_mirror/web-studiya/kontekstnaya-reklama/yandex-direct/index.html",
  },
  {
    label: "kontekst/turkestan",
    file: "site_mirror/web-studiya/kontekstnaya-reklama/turkestan/index.html",
  },
  {
    label: "google-ads/turkestan",
    file:
      "site_mirror/web-studiya/kontekstnaya-reklama/google-ads/turkestan/index.html",
  },
];

const rows = [];
let worst = null;

function run(label, peerPath) {
  let out;
  let code = 0;
  try {
    out = execFileSync("node", [CHECK, TARGET, peerPath], {
      encoding: "utf8",
      cwd: ROOT,
    });
  } catch (e) {
    code = e.status || 1;
    out = e.stdout || "";
  }
  const r = JSON.parse(out);
  r.label = label;
  r.exit = code;
  rows.push(r);
  const score =
    r.main_containment * 1000 +
    r.core_containment * 100 +
    r.main_jaccard * 10 +
    r.core_jaccard;
  if (!worst || score > worst._score) {
    worst = { ...r, _score: score };
  }
  console.log(
    `${label.padEnd(22)} main_c=${r.main_containment} core_c=${r.core_containment} main_j=${r.main_jaccard} core_j=${r.core_jaccard} dups=${r.long_dups} ${r.pass ? "PASS" : "FAIL"}`
  );
}

for (const slug of peers) {
  run(
    slug,
    `site_mirror/web-studiya/kontekstnaya-reklama/yandex-direct/${slug}/index.html`
  );
}
for (const e of extra) run(e.label, e.file);

rows.sort((a, b) => b.main_containment - a.main_containment);
const report = {
  target: TARGET,
  generated_at: new Date().toISOString(),
  all_pass: rows.every((r) => r.pass),
  worst_peer: worst.label,
  worst: {
    label: worst.label,
    main_containment: worst.main_containment,
    core_containment: worst.core_containment,
    main_jaccard: worst.main_jaccard,
    core_jaccard: worst.core_jaccard,
    long_dups: worst.long_dups,
  },
  rows,
};
fs.writeFileSync(
  "site_mirror/_work/yandex-direct-regional-scale/turkestan/similarity-report.json",
  JSON.stringify(report, null, 2),
  "utf8"
);
console.log("\nALL_PASS", report.all_pass);
console.log("WORST", report.worst_peer, report.worst);
process.exit(report.all_pass ? 0 : 1);
