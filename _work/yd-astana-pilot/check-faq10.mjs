import fs from "node:fs";
const c = fs.readFileSync(
  "site_mirror/web-studiya/kontekstnaya-reklama/yandex-direct/index.html",
  "utf8"
);
const m = c.match(
  /"name":"Можно ли ограничить показы одним городом\?","acceptedAnswer":\{"@type":"Answer","text":"([^"]+)"\}/
);
console.log("schema FAQ10:", m ? m[1] : "NOT FOUND");
const vis = c.match(/id="yd-faq-a10"[^>]*>([\s\S]*?)<\/div>/);
console.log("visible FAQ10:", vis ? vis[1].replace(/<[^>]+>/g, "").trim() : "NOT FOUND");
