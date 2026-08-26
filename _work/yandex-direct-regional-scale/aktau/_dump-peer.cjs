const fs = require("fs");
const path = require("path");

const peer =
  process.argv[2] ||
  "site_mirror/web-studiya/kontekstnaya-reklama/yandex-direct/uralsk/index.html";
const html = fs.readFileSync(peer, "utf8");
const ids = [
  "ctx-hero",
  "short-answer",
  "local-config",
  "audience",
  "campaign-types",
  "setup",
  "control",
  "decision",
  "landing-analytics",
  "process",
  "faq",
  "related",
  "contacts",
];

function section(id) {
  const re = new RegExp(
    `<section[^>]*id="${id}"[\\s\\S]*?(?=<section |</main>)`,
    "i"
  );
  const m = html.match(re);
  return m ? m[0] : null;
}

const outDir = path.dirname(__filename);
for (const id of ids) {
  const s = section(id);
  if (!s) {
    console.log("MISSING", id);
    continue;
  }
  fs.writeFileSync(path.join(outDir, `_peer-${id}.html`), s, "utf8");
  console.log(id, s.length);
}

const meta = {
  title: (html.match(/<title>([^<]+)/) || [])[1],
  desc: (html.match(/name="description" content="([^"]+)/) || [])[1],
  h1: (html.match(/<h1[^>]*>([^<]+)/) || [])[1],
  forms: [...html.matchAll(/id="(rk-form-[^"]+)"/g)].map((m) => m[1]),
  names: [...html.matchAll(/name="(contacts_[^"]+|popup_[^"]+)"/g)].map(
    (m) => m[1]
  ),
  prefix: [...html.matchAll(/id="(yd-[a-z]+-[^"]+)"/g)]
    .map((m) => m[1])
    .slice(0, 8),
  charts: [...html.matchAll(/id="(yd[A-Za-z]+ChartFill2?)"/g)].map((m) => m[1]),
  viewportCss: /media="\(min-width: 769px\)"/.test(html),
  metrika: /101127167/.test(html),
};
fs.writeFileSync(
  path.join(outDir, "_peer-meta.json"),
  JSON.stringify(meta, null, 2),
  "utf8"
);
console.log(JSON.stringify(meta, null, 2));
