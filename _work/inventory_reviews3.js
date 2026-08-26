const fs = require("fs");
const path = require("path");

const base = path.join(
  "d:",
  "РАБОТА",
  "111 ПОРТАЛ ,,, ПРОЕКТ РАСКРУТОВ 05,2026 111",
  "raskrutov-kz-2026"
);

function walk(dir, acc = []) {
  let ents;
  try {
    ents = fs.readdirSync(dir, { withFileTypes: true });
  } catch {
    return acc;
  }
  for (const e of ents) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) {
      if (["_work", "node_modules", ".git"].includes(e.name)) continue;
      walk(full, acc);
    } else if (/\.(html|json|md|csv|txt)$/i.test(e.name)) {
      acc.push(full);
    }
  }
  return acc;
}

function unescapeHtml(s) {
  return String(s || "")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&");
}

const letterHashes = [
  "54bf40700e8e987e359d73bd97e57a13",
  "b5186d124bd7b548d25a20d6b095a3fb",
  "b1fccd4e8418812ce4ee0f9e09501a9d",
  "b31d83bd90e50afb268a6d633fbaa5cc",
  "c9a59117d0bda607ec821368b659adea",
  "26f97aa4261cb5482493d9854372abc2",
  "5bf57122736eea77a71cabf84c254770",
  "5b82959b1704c7d0c60dbfaf3c12aa68",
  "5c7db6ed1c0c8fd0cb6b12dd5a4a5ce6",
  "7e451be32fb06765c70cbc9653a3253a",
  "9faf6971402e1dc7f28af85871661ffa",
  "3af18b26863671835eb1eb4d8de36ec1",
  "c2da339090372d865027b4f7e625d165",
  "d58b0d3dc14e83eadbd5d34c902cff1c",
  "4be51cc3cafbdae38191d104761d29ba",
  "08d77280fef689a63d0c5ae13bc1b957",
  "fcb54c058baec77355158320da5dbfd4",
  // nav thumbs on BP page with alt Благодарственные письма
  "1f94f922bceb0e18774002fc68f6ad3d",
  "9923b38fdf8891afdc551544d366a7d8",
  "40ff175497408df50d99e35d0490535b",
  "33c84469ad93a8fcd360d946de122019",
];

const nameMap = new Map(); // hash -> Set of names/alts

const files = walk(path.join(base, "site_mirror"));
console.log("Scanning HTML files:", files.length);

for (const full of files) {
  let txt;
  try {
    txt = fs.readFileSync(full, "utf8");
  } catch {
    continue;
  }
  for (const h of letterHashes) {
    if (!txt.includes(h)) continue;
    // find contexts
    let idx = 0;
    while ((idx = txt.indexOf(h, idx)) !== -1) {
      const start = Math.max(0, idx - 500);
      const chunk = txt.slice(start, idx + 200);
      const names = [];
      const m1 = chunk.match(/itemprop="name"\s+content="([^"]*)"/i);
      if (m1) names.push("meta:" + unescapeHtml(m1[1]));
      const m2 = chunk.match(/\balt="([^"]*)"/i);
      if (m2 && m2[1]) names.push("alt:" + unescapeHtml(m2[1]));
      const m3 = chunk.match(/\btitle="([^"]*)"/i);
      if (m3 && m3[1] && m3[1] !== "/") names.push("title:" + unescapeHtml(m3[1]));
      if (!nameMap.has(h)) nameMap.set(h, new Set());
      names.forEach((n) => nameMap.get(h).add(n));
      // also record file
      nameMap.get(h).add("file:" + path.relative(base, full).split(path.sep).join("/"));
      idx += h.length;
    }
  }
}

console.log("\n=== HASH NAME RESOLUTION ===");
for (const h of letterHashes) {
  const set = nameMap.get(h) || new Set();
  const metas = [...set].filter((x) => x.startsWith("meta:"));
  const alts = [...set].filter((x) => x.startsWith("alt:"));
  const filesHit = [...set].filter((x) => x.startsWith("file:"));
  console.log("\n" + h);
  console.log("  metas:", metas.length ? metas.join(" | ") : "(none)");
  console.log("  alts:", alts.length ? [...new Set(alts)].join(" | ") : "(none)");
  console.log("  files:", filesHit.length);
  filesHit.slice(0, 8).forEach((f) => console.log("   -", f.slice(5)));
}

// BP page: extract the 18 white box cards more carefully - showOriginalImage blocks
const bp = fs.readFileSync(
  path.join(base, "site_mirror/o-kompanii/blagodarstvennye-pisma/index.html"),
  "utf8"
);
console.log("\n=== BP showOriginalImage contexts ===");
let m;
const re = /showOriginalImage[\s\S]{0,50}/g;
let c = 0;
while ((m = re.exec(bp)) && c < 10) {
  const around = bp.slice(Math.max(0, m.index - 400), m.index + 600);
  const src = (around.match(/src="([^"]*lpfile[^"]*)"/) || [])[1];
  const alt = (around.match(/alt="([^"]*)"/) || [])[1];
  console.log(++c, "alt=", alt, "src=", src && src.slice(0, 120));
}

// Check if BP is duplicate of o-nas / o-kompanii
function fingerprint(rel) {
  const t = fs.readFileSync(path.join(base, rel), "utf8");
  const h1 = (t.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i) || [])[1];
  const title = (t.match(/<title>([\s\S]*?)<\/title>/i) || [])[1];
  const canon = (t.match(/rel="canonical"\s+href="([^"]+)"/i) || [])[1];
  return {
    rel,
    title: h1 ? unescapeHtml(h1.replace(/<[^>]+>/g, "")).trim() : null,
    metaTitle: title ? unescapeHtml(title).trim() : null,
    canon,
    size: t.length,
  };
}
console.log("\n=== PAGE FINGERPRINTS ===");
[
  "site_mirror/o-kompanii/blagodarstvennye-pisma/index.html",
  "site_mirror/o-kompanii/o-nas/index.html",
  "site_mirror/o-kompanii/index.html",
  "site_mirror/o-kompanii/klienty/index.html",
].forEach((r) => console.log(fingerprint(r)));

// Compare file equality roughly
const a = fs.readFileSync(path.join(base, "site_mirror/o-kompanii/blagodarstvennye-pisma/index.html"));
const b = fs.readFileSync(path.join(base, "site_mirror/o-kompanii/o-nas/index.html"));
console.log("BP vs o-nas identical?", a.equals(b));
console.log("BP vs o-nas size diff", a.length - b.length);

// otzivi redirects
console.log("\n=== otzivi refs in htaccess / redirects ===");
for (const f of [
  "site_mirror/.htaccess",
  "site_mirror/robots.txt",
  "docs/seo-regional/CLUSTERS.csv",
]) {
  const full = path.join(base, f);
  if (!fs.existsSync(full)) continue;
  const t = fs.readFileSync(full, "utf8");
  t.split(/\r?\n/)
    .filter((l) => /otziv|otzyv|redirect|Rewrite/i.test(l))
    .forEach((l) => console.log(f + ":", l));
}

// Elfsight widget id
const otz = fs.readFileSync(
  path.join(base, "site_mirror/assets/s239948.lpmotortest.com/otzivi/index.html"),
  "utf8"
);
const elf = otz.match(/elfsight-app-([a-f0-9-]+)/i);
console.log("\nElfsight app id:", elf && elf[0]);
const branch = otz.match(/__branchId__\s*=\s*'([^']+)'/);
const org = otz.match(/__orgId__\s*=\s*'([^']+)'/);
console.log("2GIS branchId:", branch && branch[1]);
console.log("2GIS orgId:", org && org[1]);

// support page review images
console.log("\n=== support page review screenshots ===");
const supportPages = [
  "site_mirror/web-studiya/podderzhka-saytov/shymkent/index.html",
  "site_mirror/web-studiya/podderzhka-saytov/index.html",
];
for (const rel of supportPages) {
  const full = path.join(base, rel);
  if (!fs.existsSync(full)) continue;
  const t = fs.readFileSync(full, "utf8");
  const reImg = /<figure class="support-review">[\s\S]*?<img([^>]*)>/gi;
  let mm;
  let i = 0;
  console.log("\n" + rel);
  while ((mm = reImg.exec(t))) {
    const tag = mm[1];
    const src = (tag.match(/src="([^"]*)"/) || [])[1];
    const alt = (tag.match(/alt="([^"]*)"/) || [])[1];
    const w = (tag.match(/width="([^"]*)"/) || [])[1];
    const h = (tag.match(/height="([^"]*)"/) || [])[1];
    console.log(++i, { src, alt, w, h });
  }
}

// clean template detail: index.html structure markers
const home = fs.readFileSync(path.join(base, "site_mirror/index.html"), "utf8");
console.log("\n=== HOME CLEAN markers ===");
console.log({
  homeCleanCss: /home-clean/i.test(home),
  rkHeader: /rk-header|class="[^"]*header/i.test(home),
  rkFooter: /<footer|rk-footer/i.test(home),
  form: /<form/i.test(home),
  modal: /rk-modal|data-rk-open-modal/i.test(home),
  lightbox: /lightbox|glightbox|fancybox|photoswipe/i.test(home),
  publicBundle: /public\.bundle/i.test(home),
});

const support = fs.readFileSync(
  path.join(base, "site_mirror/web-studiya/podderzhka-saytov/index.html"),
  "utf8"
);
console.log("=== SUPPORT CLEAN markers ===");
console.log({
  homeCleanCss: /home-clean/i.test(support),
  form: /<form/i.test(support),
  modal: /rk-modal|data-rk-open-modal/i.test(support),
  lightbox: /lightbox|glightbox|fancybox|photoswipe|support-review/i.test(support),
  reviewSection: /support-review|reviews-title/i.test(support),
  footer: /<footer|rk-footer/i.test(support),
  publicBundle: /public\.bundle/i.test(support),
});

// Check if support has image click zoom
console.log("support onclick img patterns:", (support.match(/support-review[\s\S]{0,200}/g) || []).slice(0, 2));

// List local files for first letter hash
function listHash(h) {
  const d = path.join(
    base,
    "site_mirror/assets/m-files.cdn1.cc/lpfile",
    h[0],
    h[1],
    h[2],
    h
  );
  if (!fs.existsSync(d)) return { h, exists: false };
  return { h, exists: true, files: fs.readdirSync(d).slice(0, 15) };
}
console.log("\n=== Local assets for gallery hashes ===");
letterHashes.slice(0, 17).forEach((h) => console.log(listHash(h)));

// Write UTF-8 JSON summary for parent
const summary = {
  otzivi_gallery_hashes: letterHashes.slice(0, 17),
  named_from_sozdanie: {},
  unresolved: [],
};
for (const h of letterHashes.slice(0, 17)) {
  const set = nameMap.get(h) || new Set();
  const metas = [...set].filter((x) => x.startsWith("meta:")).map((x) => x.slice(5));
  const alts = [...set].filter((x) => x.startsWith("alt:")).map((x) => x.slice(4));
  const best = metas.find((x) => /Благодарствен|Письм|отзыв|Отзыв/i.test(x)) ||
    alts.find((x) => /Благодарствен|Письм|отзыв|Отзыв/i.test(x)) ||
    metas[0] ||
    alts.find((x) => x && x !== "/") ||
    null;
  if (best) summary.named_from_sozdanie[h] = best;
  else summary.unresolved.push(h);
}
fs.writeFileSync(
  path.join(base, "site_mirror/_work/reviews_inventory_summary.json"),
  JSON.stringify(summary, null, 2),
  "utf8"
);
console.log("\nWrote summary JSON");
console.log(JSON.stringify(summary, null, 2));
