import fs from "node:fs";

const c = fs.readFileSync(
  "site_mirror/web-studiya/kontekstnaya-reklama/yandex-direct/astana/index.html",
  "utf8"
);
const size = fs.statSync(
  "site_mirror/web-studiya/kontekstnaya-reklama/yandex-direct/astana/index.html"
).size;
const title = (c.match(/<title>([^<]+)<\/title>/) || [])[1];
const h1 = (c.match(/<h1[^>]*>([^<]+)<\/h1>/) || [])[1];
const desc = (c.match(/name="description" content="([^"]+)"/) || [])[1];
const h1count = (c.match(/<h1\b/g) || []).length;
const assets4 = (c.match(/\.\.\/\.\.\/\.\.\/\.\.\/assets\//g) || []).length;
const assets3 = (c.match(/(?<!\.\.)\.\.\/\.\.\/\.\.\/assets\//g) || []).length;

console.log(JSON.stringify({
  size,
  title,
  h1,
  h1count,
  desc,
  descLen: desc?.length,
  forms: {
    contacts: c.includes("rk-form-contacts-yd-astana"),
    popup: c.includes("rk-form-popup-yd-astana"),
  },
  ydCritical: c.includes('id="yd-critical"'),
  assets4,
  assets3leftover: assets3,
  city: c.includes('"@type":"City"') && c.includes('"name":"Astana"'),
  forbidden: {
    publicBundle: /public\.bundle/i.test(c),
    mottor: /mottor|lpmotor/i.test(c),
    officeAstana: c.includes("офис в Астане"),
    localBusiness: c.includes("LocalBusiness"),
    review: c.includes('"@type":"Review"'),
    offer: c.includes('"@type":"Offer"'),
  },
  chart: c.includes("ydAstChartFill"),
  body: c.includes('class="rk-clean ctx-page yd-page"'),
}, null, 2));

const r = fs.readFileSync(
  "site_mirror/web-studiya/kontekstnaya-reklama/yandex-direct/index.html",
  "utf8"
);
const s = fs.readFileSync("site_mirror/sitemap.xml", "utf8");
console.log("republican link:", r.includes("/yandex-direct/astana/"));
console.log("sitemap:", s.includes("/yandex-direct/astana/"));
console.log("schema faq mentions astana page:", r.includes("yandex-direct/astana/"));

const triples = [...c.matchAll(/\.\.\/\.\.\/\.\.\/assets\//g)].filter((m) => {
  const i = m.index;
  return !(i >= 3 && c.slice(i - 3, i) === "../");
});
console.log("leftover ../../../assets:", triples.length);
const critStart = c.indexOf('id="yd-critical"');
const critEnd = c.indexOf("</style>", critStart);
const crit = c.slice(critStart, critEnd);
console.log("critical font path depth4:", crit.includes("../../../../assets/m-files"));
console.log("critical font path depth3 leftover:", /(?<!\.\.)\.\.\/\.\.\/\.\.\/assets/.test(crit) === false ? "none-or-nested" : "check");
console.log("critical has ../../../../assets:", (crit.match(/\.\.\/\.\.\/\.\.\/\.\.\/assets\//g) || []).length);
