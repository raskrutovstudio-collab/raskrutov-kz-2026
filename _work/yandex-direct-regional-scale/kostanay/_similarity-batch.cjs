const fs = require("fs");
const path = require("path");
const { spawnSync } = require("child_process");

const page =
  "site_mirror/web-studiya/kontekstnaya-reklama/yandex-direct/kostanay/index.html";
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
  "site_mirror/web-studiya/kontekstnaya-reklama/yandex-direct/index.html",
  "site_mirror/web-studiya/kontekstnaya-reklama/kostanay/index.html",
  "site_mirror/web-studiya/kontekstnaya-reklama/google-ads/kostanay/index.html",
];

const rows = [];
let fails = 0;
for (const peer of peers) {
  const r = spawnSync(process.execPath, [check, page, peer], {
    encoding: "utf8",
  });
  let j;
  try {
    j = JSON.parse(r.stdout);
  } catch (e) {
    console.error("parse fail", peer, r.stdout, r.stderr);
    fails++;
    continue;
  }
  const label = peer
    .replace("site_mirror/web-studiya/kontekstnaya-reklama/", "")
    .replace("/index.html", "");
  rows.push({
    peer: label,
    main_c: j.main_containment,
    core_c: j.core_containment,
    main_j: j.main_jaccard,
    core_j: j.core_jaccard,
    dups: j.long_dups,
    pass: j.pass,
    samples: j.long_dup_samples,
  });
  if (!j.pass) fails++;
}

rows.sort((a, b) => b.main_c - a.main_c);
console.log(JSON.stringify(rows, null, 2));
console.log("FAILS", fails);
console.log("WORST", rows[0]);

// quick sanity
const h = fs.readFileSync(page, "utf8");
console.log("title", (h.match(/<title>([^<]+)/) || [])[1]);
console.log("h1", (h.match(/<h1[^>]*>([^<]+)/) || [])[1]);
console.log("desc", (h.match(/name="description" content="([^"]+)/) || [])[1]);
console.log(
  "forms",
  [...h.matchAll(/id="(rk-form-[^"]+)"/g)].map((m) => m[1]),
  [...h.matchAll(/name="(contacts_[^"]+|popup_[^"]+)"/g)].map((m) => m[1])
);
console.log("charts", [...h.matchAll(/id="(ydKst[^"]+)"/g)].map((m) => m[1]));
console.log("metrika", /101127167/.test(h));
console.log("media769", /media="\(min-width: 769px\)"/.test(h));
console.log("office", /Жумабаева, 109/.test(h));
console.log("areaServed", (h.match(/"areaServed"[^}]+}/) || [])[0]);
