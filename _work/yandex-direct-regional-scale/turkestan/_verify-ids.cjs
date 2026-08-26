const fs = require("fs");
const h = fs.readFileSync(
  "site_mirror/web-studiya/kontekstnaya-reklama/yandex-direct/turkestan/index.html",
  "utf8"
);
const title = (h.match(/<title>([^<]+)/) || [])[1];
const desc = (h.match(/name="description" content="([^"]+)/) || [])[1];
const h1 = (h.match(/<h1[^>]*>([\s\S]*?)<\/h1>/) || [])[1]
  .replace(/<[^>]+>/g, "")
  .replace(/\s+/g, " ")
  .trim();
const forms = [...h.matchAll(/id="(rk-form-[^"]+)"/g)].map((m) => m[1]);
const names = [
  ...h.matchAll(/name="(contacts_yandex_direct_[^"]+|popup_yandex_direct_[^"]+)"/g),
].map((m) => m[1]);
const charts = [...h.matchAll(/id="(ydTrk[^"]+)"/g)].map((m) => m[1]);
console.log(
  JSON.stringify(
    {
      title,
      h1,
      desc,
      forms,
      names,
      charts,
      prefixCount: (h.match(/yd-trk-/g) || []).length,
      metrika: /101127167/.test(h),
      viewport: /media="\(min-width: 769px\)"/.test(h),
      areaServed: /"name":"Turkestan"/.test(h),
      bytes: h.length,
    },
    null,
    2
  )
);
