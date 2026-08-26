const fs = require("fs");
const h = fs.readFileSync(
  "site_mirror/web-studiya/kontekstnaya-reklama/yandex-direct/astana/index.html",
  "utf8"
);
const patterns = [
  /<h1[^>]*>[^<]+<\/h1>/,
  /class="ctx-hero__sub"[^>]*>[^<]+/,
  /class="ctx-hero__lead"[^>]*>[^<]{0,120}/,
  /class="ctx-hero__title"[^>]*>[^<]+/,
  /aria-label="[^"]*Директ[^"]*"/,
  /id="[^"]*answer[^"]*"/,
  /id="local[^"]*"/,
  /id="audience"/,
  /от 120[^<"']*/,
  /101\d{6}/,
  /Наш офис:[^<]+/,
  /ydAst[A-Za-z0-9]*/,
  /id="yd-ast-[^"]+"/g,
  /data-form-name="[^"]+"/g,
];
for (const p of patterns) {
  const m = h.match(p);
  console.log(String(p), "=>", m && (Array.isArray(m) ? m.slice(0, 5) : m[0]));
}
console.log(
  "section ids",
  [...h.matchAll(/<section[^>]*id="([^"]+)"/g)].map((m) => m[1])
);
console.log("h2s", [...h.matchAll(/<h2[^>]*>([^<]+)/g)].map((m) => m[1]));
