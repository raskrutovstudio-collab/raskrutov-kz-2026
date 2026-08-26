const fs = require("fs");
const a = fs.readFileSync(
  "site_mirror/web-studiya/kontekstnaya-reklama/yandex-direct/astana/index.html",
  "utf8"
);
const t = fs.readFileSync(
  "site_mirror/web-studiya/kontekstnaya-reklama/yandex-direct/taraz/index.html",
  "utf8"
);
const crit = (h) => {
  const m = h.match(/<style id="yd-critical"[\s\S]*?<\/style>/);
  return m ? m[0] : null;
};
const ca = crit(a);
const ct = crit(t);
console.log("critical equal", ca === ct);
console.log("critical lengths", ca && ca.length, ct && ct.length);
const scriptsA = [...a.matchAll(/<script src="([^"]+)"/g)].map((m) => m[1]);
const scriptsT = [...t.matchAll(/<script src="([^"]+)"/g)].map((m) => m[1]);
console.log("scripts equal", JSON.stringify(scriptsA) === JSON.stringify(scriptsT));
console.log(scriptsA);
