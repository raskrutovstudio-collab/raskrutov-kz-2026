const fs = require("fs");

const file = "site_mirror/web-studiya/kontekstnaya-reklama/yandex-direct/almaty/index.html";
const out = {};

out.file_exists = fs.existsSync(file);
const html = fs.readFileSync(file, "utf8");

const ld = html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/);
let graph = null;
try {
  graph = JSON.parse(ld[1]);
  out.json_ld_parse = "OK";
} catch (e) {
  out.json_ld_parse = "FAIL: " + e.message;
}

out.ld_blocks = (html.match(/application\/ld\+json/g) || []).length;
out.faq_items = (html.match(/yd-faq__item/g) || []).length;

const visibleQ = [...html.matchAll(/data-yd-faq-btn[^>]*>([\s\S]*?)<\/button>/g)].map((m) => m[1].trim());
const visibleA = [...html.matchAll(/class="yd-faq__a"[^>]*hidden>([\s\S]*?)<\/div>/g)].map((m) => m[1].trim());
out.visible_q = visibleQ.length;
out.visible_a = visibleA.length;

if (graph) {
  const faq = graph["@graph"].find((n) => n["@type"] === "FAQPage");
  const schemaQ = faq.mainEntity.map((q) => q.name.trim());
  const schemaA = faq.mainEntity.map((q) => q.acceptedAnswer.text.trim());
  out.schema_faq_count = schemaQ.length;
  out.faq_q_match = JSON.stringify(schemaQ) === JSON.stringify(visibleQ);
  out.faq_a_match = JSON.stringify(schemaA) === JSON.stringify(visibleA);
  if (!out.faq_q_match) out.q_diff = schemaQ.filter((q, i) => q !== visibleQ[i]);
  if (!out.faq_a_match) out.a_diff = schemaA.map((a, i) => (a !== visibleA[i] ? [a, visibleA[i]] : null)).filter(Boolean);
  const svc = graph["@graph"].find((n) => n["@type"] === "Service");
  out.area_served = svc.areaServed.name;
  const org = graph["@graph"].find((n) => Array.isArray(n["@type"]) && n["@type"].includes("Organization"));
  out.org_locality = org.address.addressLocality;
  out.ids_all_almaty = graph["@graph"]
    .filter((n) => n["@id"] && n["@id"].includes("kontekstnaya-reklama"))
    .every((n) => n["@id"].includes("/yandex-direct/almaty/"));
}

const desc = html.match(/<meta name="description" content="([^"]+)"/)[1];
out.description = desc;
out.description_len = desc.length;
out.title = html.match(/<title>([^<]+)<\/title>/)[1];
out.h1 = html.match(/<h1[^>]*>([^<]+)<\/h1>/)[1];
out.h1_count = (html.match(/<h1/g) || []).length;
out.canonical = html.match(/rel="canonical" href="([^"]+)"/)[1];
out.og_url = html.match(/property="og:url" content="([^"]+)"/)[1];

out.astana_slug_paths = (html.match(/yandex-direct\/astana/g) || []).length;
out.astana_any = [...html.matchAll(/[Аа]стан\w*|astana/g)].map((m) => m[0]);
out.yd_ast_forms = (html.match(/yd-ast-/g) || []).length;
out.stolitsa = (html.match(/столиц\w*/gi) || []).length;
out.gradient_ids = (html.match(/id="(yd\w*ChartFill\d?)"/g) || []);
out.metrika = (html.match(/101127167/g) || []).length;
out.price = (html.match(/от 120 000 ₸ \/ мес/g) || []).length;
out.forms = (html.match(/id="(rk-form-[^"]+)"/g) || []);
out.form_names = (html.match(/name="(contacts_[^"]+|popup_[^"]+)"/g) || []);
out.faq_ids_ok = (html.match(/yd-alm-faq-q\d+/g) || []).length === 24 || (html.match(/yd-alm-faq-q(\d+)"/g) || []).length;
out.related_links = html.match(/<div class="ctx-related__grid">([\s\S]*?)<\/div>/)[1].match(/href="([^"]+)"/g);
out.css_links = (html.match(/href="[^"]*\.css[^"]*"/g) || []);
out.js_links = (html.match(/src="[^"]*\.js[^"]*"/g) || []);
out.rel_prefix_bad = (html.match(/"\.\.\/\.\.\/\.\.\/(?!\.\.)/g) || []).length;

console.log(JSON.stringify(out, null, 2));
