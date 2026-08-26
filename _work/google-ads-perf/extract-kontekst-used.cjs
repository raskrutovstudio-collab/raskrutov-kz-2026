const fs = require("fs");
const path = require("path");

const cssPath = "site_mirror/assets/css/kontekst-clean.css";
const htmlPath = "site_mirror/web-studiya/kontekstnaya-reklama/google-ads/index.html";
const outPath = "site_mirror/_work/google-ads-perf/kontekst-used-extract.css";

const css = fs.readFileSync(cssPath, "utf8");
const html = fs.readFileSync(htmlPath, "utf8");

const requested = [
  "rk-section", "rk-h2", "rk-breadcrumbs",
  "ctx-btn", "ctx-btn--primary", "ctx-btn__arrow", "ctx-btn--ghost", "ctx-btn--light",
  "ctx-hero", "ctx-hero__grid", "ctx-hero__title", "ctx-hero__sub", "ctx-hero__lead", "ctx-hero__actions",
  "ctx-cta-band", "ctx-related__grid"
];
const bodyCheck = ["gads-page", "rk-clean", "ctx-page"];
const requestedSet = new Set(requested);

const pageClasses = new Set();
let m;
const classRe = /class="([^"]+)"/g;
while ((m = classRe.exec(html))) {
  m[1].split(/\s+/).filter(Boolean).forEach((c) => pageClasses.add(c));
}
const pageCtx = [...pageClasses].filter((c) => c.startsWith("ctx-")).sort();
console.log("PAGE ctx-:", pageCtx.join(", "));

function classTokenRe(cls) {
  return new RegExp("\\." + cls.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + "(?![a-zA-Z0-9_-])");
}
function selectorMentionsClass(sel, cls) {
  return classTokenRe(cls).test(sel);
}
function selectorMatchesList(sel, list) {
  return list.some((cls) => selectorMentionsClass(sel, cls));
}
function isRoot(sel) {
  return /(^|[,\s]):root\b/.test(sel);
}

function extractFlatRules(block) {
  const out = [];
  let i = 0;
  const n = block.length;
  while (i < n) {
    while (i < n && /\s/.test(block[i])) i++;
    if (i >= n) break;
    if (block[i] === "/" && block[i + 1] === "*") {
      const end = block.indexOf("*/", i + 2);
      i = end < 0 ? n : end + 2;
      continue;
    }
    if (block[i] === "@") {
      const brace = block.indexOf("{", i);
      if (brace < 0) break;
      let depth = 0;
      let j = brace;
      for (; j < n; j++) {
        if (block[j] === "{") depth++;
        else if (block[j] === "}") {
          depth--;
          if (depth === 0) {
            j++;
            break;
          }
        }
      }
      i = j;
      continue;
    }
    const brace = block.indexOf("{", i);
    if (brace < 0) break;
    const selector = block.slice(i, brace).trim();
    let depth = 0;
    let j = brace;
    for (; j < n; j++) {
      if (block[j] === "{") depth++;
      else if (block[j] === "}") {
        depth--;
        if (depth === 0) {
          j++;
          break;
        }
      }
    }
    const body = block.slice(brace + 1, j - 1);
    out.push({ selector, body, raw: block.slice(i, j).trim() });
    i = j;
  }
  return out;
}

function extractRules(cssText) {
  const results = [];
  let i = 0;
  const n = cssText.length;
  while (i < n) {
    while (i < n && /\s/.test(cssText[i])) i++;
    if (i >= n) break;
    if (cssText[i] === "/" && cssText[i + 1] === "*") {
      const end = cssText.indexOf("*/", i + 2);
      i = end < 0 ? n : end + 2;
      continue;
    }
    if (cssText[i] === "@") {
      const atStart = i;
      const brace = cssText.indexOf("{", i);
      if (brace < 0) break;
      const atHeader = cssText.slice(i, brace).trim();
      let depth = 0;
      let j = brace;
      for (; j < n; j++) {
        if (cssText[j] === "{") depth++;
        else if (cssText[j] === "}") {
          depth--;
          if (depth === 0) {
            j++;
            break;
          }
        }
      }
      const block = cssText.slice(brace + 1, j - 1);
      if (/^@media|^@supports|^@container/.test(atHeader)) {
        const inner = extractFlatRules(block);
        if (inner.length) {
          results.push({ type: "media", header: atHeader, rules: inner });
        }
      }
      i = j;
      continue;
    }
    const brace = cssText.indexOf("{", i);
    if (brace < 0) break;
    const selector = cssText.slice(i, brace).trim();
    let depth = 0;
    let j = brace;
    for (; j < n; j++) {
      if (cssText[j] === "{") depth++;
      else if (cssText[j] === "}") {
        depth--;
        if (depth === 0) {
          j++;
          break;
        }
      }
    }
    const body = cssText.slice(brace + 1, j - 1);
    results.push({ type: "rule", selector, body, raw: cssText.slice(i, j) });
    i = j;
  }
  return results;
}

function parseDecls(body) {
  const decls = [];
  body.split(";").forEach((part) => {
    const p = part.trim();
    if (!p) return;
    const colon = p.indexOf(":");
    if (colon < 0) return;
    decls.push({ prop: p.slice(0, colon).trim(), val: p.slice(colon + 1).trim() });
  });
  return decls;
}

const allParsed = extractRules(css);
const matched = [];
const matchedRoot = [];
const usedVars = new Set();
const varUseRe = /var\(--([a-zA-Z0-9_-]+)\)/g;

function collectVars(body) {
  let vm;
  while ((vm = varUseRe.exec(body))) usedVars.add(vm[1]);
  varUseRe.lastIndex = 0;
}

for (const item of allParsed) {
  if (item.type === "rule") {
    if (isRoot(item.selector)) {
      matchedRoot.push(item);
      continue;
    }
    if (selectorMatchesList(item.selector, requested) || selectorMatchesList(item.selector, bodyCheck)) {
      matched.push(item);
      collectVars(item.body);
    }
  } else if (item.type === "media") {
    const keep = item.rules.filter(
      (r) => selectorMatchesList(r.selector, requested) || selectorMatchesList(r.selector, bodyCheck)
    );
    if (keep.length) {
      matched.push({ type: "media", header: item.header, rules: keep });
      keep.forEach((r) => collectVars(r.body));
    }
  }
}

const rootDecls = [];
matchedRoot.forEach((r) => rootDecls.push(...parseDecls(r.body)));
const rootMap = Object.fromEntries(rootDecls.map((d) => [d.prop.replace(/^--/, ""), d.val]));

function collectTransitive(vars) {
  const all = new Set(vars);
  let changed = true;
  while (changed) {
    changed = false;
    for (const v of [...all]) {
      const val = rootMap[v];
      if (!val) continue;
      const re = /var\(--([a-zA-Z0-9_-]+)\)/g;
      let vm;
      while ((vm = re.exec(val))) {
        if (!all.has(vm[1])) {
          all.add(vm[1]);
          changed = true;
        }
      }
    }
  }
  return all;
}
const allNeededVars = collectTransitive(usedVars);

console.log("\n=== body/gads/rk-clean/ctx-page in kontekst-clean ===");
const bodyHits = [];
for (const item of allParsed) {
  if (item.type === "rule" && selectorMatchesList(item.selector, bodyCheck)) {
    bodyHits.push(item.selector.replace(/\s+/g, " ").trim());
  } else if (item.type === "media") {
    item.rules
      .filter((r) => selectorMatchesList(r.selector, bodyCheck))
      .forEach((r) => bodyHits.push(item.header + " :: " + r.selector.replace(/\s+/g, " ").trim()));
  }
}
console.log(bodyHits.length ? bodyHits.join("\n") : "(none)");

const missedUnique = [];
const seenMiss = new Set();
for (const item of allParsed) {
  const check = (sel) => {
    const hits = [...pageClasses].filter(
      (cls) => (cls.startsWith("ctx-") || cls.startsWith("rk-")) && selectorMentionsClass(sel, cls)
    );
    if (!hits.length) return;
    const reallyExtra = hits.filter((h) => !requestedSet.has(h));
    if (!reallyExtra.length) return;
    const key = sel.trim().replace(/\s+/g, " ");
    if (seenMiss.has(key)) return;
    seenMiss.add(key);
    missedUnique.push({ selector: key.slice(0, 220), hits: reallyExtra });
  };
  if (item.type === "rule") check(item.selector);
  else if (item.type === "media") item.rules.forEach((r) => check(r.selector));
}
console.log("\n=== POSSIBLY MISSED ===");
missedUnique.forEach((x) => console.log("-", x.selector, "| extra:", x.hits.join(",")));

const heroTokens = [
  "ctx-hero",
  "ctx-hero__grid",
  "ctx-hero__title",
  "ctx-hero__sub",
  "ctx-hero__lead",
  "ctx-hero__actions",
  "ctx-hero__copy"
];
console.log("\n=== HERO TOKENS ===");
for (const t of heroTokens) {
  const inSource = allParsed.some((item) => {
    if (item.type === "rule") return selectorMentionsClass(item.selector, t);
    if (item.type === "media") return item.rules.some((r) => selectorMentionsClass(r.selector, t));
    return false;
  });
  const inExtract = matched.some((item) => {
    if (item.type === "rule") return selectorMentionsClass(item.selector, t);
    return item.rules.some((r) => selectorMentionsClass(r.selector, t));
  });
  console.log(t + ": source=" + inSource + " extract=" + inExtract);
}

function formatRule(sel, body, indent) {
  const pad = " ".repeat(indent);
  const lines = [pad + sel.trim() + " {"];
  body
    .trim()
    .split(/;\s*/)
    .filter(Boolean)
    .forEach((d) => lines.push(pad + "  " + d.trim() + ";"));
  lines.push(pad + "}");
  return lines;
}

const lines = [];
lines.push("/* Extracted from kontekst-clean.css for Google Ads page */");
lines.push("/* Source: site_mirror/assets/css/kontekst-clean.css */");
lines.push("/* Requested classes + related media + used :root vars */");
lines.push("");

const keptVars = rootDecls.filter((d) => allNeededVars.has(d.prop.replace(/^--/, "")));
if (keptVars.length) {
  lines.push(":root {");
  keptVars.forEach((d) => lines.push("  " + d.prop + ": " + d.val + ";"));
  lines.push("}");
  lines.push("");
}

for (const item of matched) {
  if (item.type === "rule") {
    lines.push(...formatRule(item.selector, item.body, 0));
    lines.push("");
  } else {
    lines.push(item.header + " {");
    for (const r of item.rules) {
      lines.push(...formatRule(r.selector, r.body, 2));
    }
    lines.push("}");
    lines.push("");
  }
}

fs.mkdirSync(path.dirname(outPath), { recursive: true });
const out = lines.join("\n").replace(/\n+$/, "\n");
fs.writeFileSync(outPath, out, "utf8");
console.log("\n=== OUTPUT ===");
console.log("bytes:", Buffer.byteLength(out, "utf8"));
console.log("matched items:", matched.length);
console.log("used vars:", [...allNeededVars].join(", ") || "(none)");
console.log("path:", outPath);

// Also dump all selectors in kontekst-clean for overview
const allSels = [];
for (const item of allParsed) {
  if (item.type === "rule") allSels.push(item.selector.replace(/\s+/g, " ").trim().slice(0, 160));
  else item.rules.forEach((r) => allSels.push(item.header.slice(0, 40) + " :: " + r.selector.replace(/\s+/g, " ").trim().slice(0, 120)));
}
fs.writeFileSync(
  "site_mirror/_work/google-ads-perf/_kontekst-all-selectors.txt",
  allSels.join("\n"),
  "utf8"
);
console.log("total selectors in kontekst-clean:", allSels.length);
