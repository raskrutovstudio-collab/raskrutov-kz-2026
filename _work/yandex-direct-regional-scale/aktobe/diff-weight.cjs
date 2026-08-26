const fs = require("fs");

const base = "site_mirror/web-studiya/kontekstnaya-reklama/yandex-direct/";
const rows = [];

for (const city of ["astana", "karaganda", "aktobe"]) {
  const h = fs.readFileSync(base + city + "/index.html", "utf8");
  const scripts = [...h.matchAll(/<script([^>]*)>([\s\S]*?)<\/script>/g)];
  const inlineBytes = scripts.reduce((a, m) => a + (m[1].includes("src=") ? 0 : Buffer.byteLength(m[2], "utf8")), 0);
  const styles = [...h.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/g)];
  const styleBytes = styles.reduce((a, m) => a + Buffer.byteLength(m[1], "utf8"), 0);
  rows.push({
    city,
    kb: +(Buffer.byteLength(h, "utf8") / 1024).toFixed(1),
    tags: (h.match(/<[a-zA-Z][^>]*>/g) || []).length,
    svg: (h.match(/<svg/g) || []).length,
    svgPath: (h.match(/<path/g) || []).length,
    scriptTags: scripts.length,
    inlineJsKb: +(inlineBytes / 1024).toFixed(1),
    styleTags: styles.length,
    inlineCssKb: +(styleBytes / 1024).toFixed(1),
    extScripts: scripts.filter((m) => m[1].includes("src=")).map((m) => (m[1].match(/src="([^"]+)"/) || [])[1]),
    extCss: [...h.matchAll(/<link[^>]+rel="stylesheet"[^>]*>/g)].map((m) => (m[0].match(/href="([^"]+)"/) || [])[1]),
  });
}

for (const r of rows) {
  const { extScripts, extCss, ...rest } = r;
  console.log(JSON.stringify(rest));
}
console.log("\nastana js:", JSON.stringify(rows[0].extScripts));
console.log("aktobe js:", JSON.stringify(rows[2].extScripts));
console.log("\nastana css:", JSON.stringify(rows[0].extCss));
console.log("aktobe css:", JSON.stringify(rows[2].extCss));
