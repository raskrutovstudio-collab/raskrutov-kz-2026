const fs = require("fs");
const h = fs.readFileSync(
  "site_mirror/web-studiya/kontekstnaya-reklama/yandex-direct/astana/index.html",
  "utf8"
);
console.log("len", h.length);
console.log("yd-ast-", (h.match(/yd-ast-/g) || []).length);
console.log("ydAst", (h.match(/ydAst/g) || []).length);
console.log("Astana/Астан", (h.match(/Астан/g) || []).length);
console.log("astana", (h.match(/astana/gi) || []).length);
console.log(
  "forms",
  [...h.matchAll(/id="(rk-form[^"]+)"/g)].map((m) => m[1])
);
console.log(
  "charts",
  [...h.matchAll(/id="(ydAst[^"]+|yd-ast[^"]*chart[^"]*)"/gi)].map((m) => m[1])
);
console.log("title", (h.match(/<title>([^<]+)/) || [])[1]);
console.log("h1", (h.match(/<h1[^>]*>([^<]+)/) || [])[1]);
console.log("price samples", [...h.matchAll(/от 120[^<]{0,40}/g)].slice(0, 3));
console.log("metrika", [...h.matchAll(/101\d{6}/g)]);
console.log("office", (h.match(/Наш офис:[\s\S]{0,120}/) || [])[0]);
