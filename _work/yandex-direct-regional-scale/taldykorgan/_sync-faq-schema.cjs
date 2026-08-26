const fs = require("fs");
const OUT =
  "site_mirror/web-studiya/kontekstnaya-reklama/yandex-direct/taldykorgan/index.html";
let h = fs.readFileSync(OUT, "utf8");

const m = h.match(
  /<script type="application\/ld\+json">([\s\S]*?)<\/script>/
);
if (!m) throw new Error("no schema");
const schema = JSON.parse(m[1]);
const faq = schema["@graph"].find((x) => x["@type"] === "FAQPage");

const qs = [...h.matchAll(/class="yd-faq__btn"[^>]*>([^<]+)/g)].map((x) => x[1]);
const as = [...h.matchAll(/class="yd-faq__a"[^>]*>([^<]+)/g)].map((x) => x[1]);

if (qs.length !== as.length || qs.length !== faq.mainEntity.length) {
  throw new Error(
    `count mismatch schema=${faq.mainEntity.length} q=${qs.length} a=${as.length}`
  );
}

let mismatch = 0;
faq.mainEntity.forEach((e, i) => {
  if (e.name !== qs[i] || e.acceptedAnswer.text !== as[i]) {
    mismatch++;
    e.name = qs[i];
    e.acceptedAnswer.text = as[i];
  }
});

if (mismatch) {
  h = h.replace(
    /<script type="application\/ld\+json">[\s\S]*?<\/script>/,
    `<script type="application/ld+json">${JSON.stringify(schema)}</script>`
  );
  fs.writeFileSync(OUT, h);
  console.log("synced schema FAQ answers:", mismatch);
} else {
  console.log("schema FAQ already in sync");
}

// re-run similarity quickly on worst peers
const { spawnSync } = require("child_process");
for (const peer of ["kostanay", "kokshetau", "turkestan", "almaty"]) {
  const r = spawnSync(
    "node",
    [
      "site_mirror/_work/yandex-direct-regional-scale/similarity-check.cjs",
      OUT,
      `site_mirror/web-studiya/kontekstnaya-reklama/yandex-direct/${peer}/index.html`,
    ],
    { encoding: "utf8" }
  );
  const j = JSON.parse(r.stdout);
  console.log(
    peer,
    "pass",
    j.pass,
    "main_c",
    j.main_containment,
    "core_c",
    j.core_containment
  );
}
