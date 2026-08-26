const fs = require("fs");

const TPL = "site_mirror/web-studiya/kontekstnaya-reklama/yandex-direct/astana/index.html";
const PAGE = "site_mirror/web-studiya/kontekstnaya-reklama/yandex-direct/karaganda/index.html";

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

const tplHtml = fs.readFileSync(TPL, "utf8");
const pageHtml = fs.readFileSync(PAGE, "utf8");
const a = skeleton(tplHtml);
const b = skeleton(pageHtml);

const diffs = [];
const max = Math.max(a.length, b.length);
for (let i = 0; i < max; i++) {
  if (a[i] !== b[i]) diffs.push({ i, astana: a[i], karaganda: b[i] });
}

const ids = (h) => (h.match(/<section[^>]*id="([^"]+)"/g) || []).map((s) => s.match(/id="([^"]+)"/)[1]);

// repeated component counts
const count = (h, re) => (h.match(re) || []).length;
const comps = (h) => ({
  ydCard: count(h, /class="yd-card /g),
  ydCamp: count(h, /class="yd-camp /g),
  ydArtifact: count(h, /class="yd-artifact /g),
  scopeItem: count(h, /yd-scope-list__item/g),
  decisionCard: count(h, /yd-decision__card/g),
  timelineItem: count(h, /yd-timeline__item/g),
  trustItem: count(h, /yd-trust-strip__item/g),
  checkList: count(h, /<li>/g),
  serpAd: count(h, /class="yd-serp-ad/g),
  cardVisualSvg: count(h, /yd-card__visual/g),
  campVisual: count(h, /yd-camp__visual/g),
  scopeIcon: count(h, /yd-scope-list__icon/g),
});

// DOM contract: every yd-card has visual span + h3 + p; every scope item has icon + div>h3+p
const cardBlocks = [...pageHtml.matchAll(/<article class="yd-card [^"]*">([\s\S]*?)<\/article>/g)].map((m) => m[1]);
const cardContract = cardBlocks.map((c, i) => ({
  i,
  visual: /<span class="yd-card__visual"[\s\S]*?<\/span>/.test(c),
  svg: /<svg /.test(c),
  h3: /<h3>[^<]+<\/h3>/.test(c),
  p: /<p>[^<]+<\/p>/.test(c),
}));
const scopeBlocks = [...pageHtml.matchAll(/<li class="yd-scope-list__item">([\s\S]*?)<\/li>/g)].map((m) => m[1]);
const scopeContract = scopeBlocks.map((c, i) => ({
  i,
  icon: /<span class="yd-scope-list__icon"/.test(c),
  svg: /<svg /.test(c),
  divWrap: /<div><h3>[^<]+<\/h3><p>[\s\S]*?<\/p><\/div>/.test(c),
}));

console.log(
  JSON.stringify(
    {
      skeleton_nodes_astana: a.length,
      skeleton_nodes_karaganda: b.length,
      skeleton_identical: diffs.length === 0,
      first_diffs: diffs.slice(0, 20),
      section_order_identical: JSON.stringify(ids(tplHtml)) === JSON.stringify(ids(pageHtml)),
      section_ids: ids(pageHtml),
      components_astana: comps(tplHtml),
      components_karaganda: comps(pageHtml),
      card_contract_broken: cardContract.filter((c) => !(c.visual && c.svg && c.h3 && c.p)),
      scope_contract_broken: scopeContract.filter((c) => !(c.icon && c.svg && c.divWrap)),
    },
    null,
    2
  )
);
