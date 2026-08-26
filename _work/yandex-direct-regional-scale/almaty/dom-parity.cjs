const fs = require("fs");

// Compare tag + class + structural attribute sequence between template and clone.
function skeleton(html) {
  const body = html.slice(html.indexOf("<body"));
  const seq = [];
  const re = /<\/?([a-z][a-z0-9-]*)((?:\s[^>]*)?)>/gi;
  let m;
  while ((m = re.exec(body))) {
    const tag = m[1].toLowerCase();
    const attrs = m[2] || "";
    const cls = (attrs.match(/\sclass="([^"]*)"/) || [, ""])[1];
    const role = (attrs.match(/\srole="([^"]*)"/) || [, ""])[1];
    const closing = m[0].startsWith("</") ? "/" : "";
    seq.push(closing + tag + (cls ? "." + cls.trim().split(/\s+/).join(".") : "") + (role ? "[" + role + "]" : ""));
  }
  return seq;
}

const a = skeleton(fs.readFileSync("site_mirror/web-studiya/kontekstnaya-reklama/yandex-direct/astana/index.html", "utf8"));
const b = skeleton(fs.readFileSync("site_mirror/web-studiya/kontekstnaya-reklama/yandex-direct/almaty/index.html", "utf8"));

const diffs = [];
const max = Math.max(a.length, b.length);
for (let i = 0; i < max; i++) {
  if (a[i] !== b[i]) diffs.push({ i, astana: a[i], almaty: b[i] });
}

// Section id order
const ids = (h) => (h.match(/<section[^>]*id="([^"]+)"/g) || []).map((s) => s.match(/id="([^"]+)"/)[1]);
const astanaIds = ids(fs.readFileSync("site_mirror/web-studiya/kontekstnaya-reklama/yandex-direct/astana/index.html", "utf8"));
const almatyIds = ids(fs.readFileSync("site_mirror/web-studiya/kontekstnaya-reklama/yandex-direct/almaty/index.html", "utf8"));

console.log(JSON.stringify({
  skeleton_nodes_astana: a.length,
  skeleton_nodes_almaty: b.length,
  skeleton_identical: diffs.length === 0,
  first_diffs: diffs.slice(0, 20),
  section_order_identical: JSON.stringify(astanaIds) === JSON.stringify(almatyIds),
  section_ids: almatyIds,
}, null, 2));
