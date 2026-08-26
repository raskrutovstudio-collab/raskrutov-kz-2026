const fs = require("fs");
const path = require("path");

function stripChrome(html) {
  return html
    .replace(/<header[\s\S]*?<\/header>/gi, " ")
    .replace(/<nav class="rk-sticky-cta"[\s\S]*?<\/nav>/gi, " ")
    .replace(/<div class="rk-soc-widget"[\s\S]*?<\/div>\s*(?=<div class="rk-modal"|<script)/gi, " ")
    .replace(/<div class="rk-modal"[\s\S]*?<\/div>\s*(?=<script)/gi, " ")
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&[a-z]+;/gi, " ")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
}

function sentences(text) {
  return text.split(/[.!?]+/).map((s) => s.trim()).filter((s) => s.split(/\s+/).length >= 5);
}

function grams(text, n = 5) {
  const w = text.split(/\s+/).filter(Boolean);
  const out = new Set();
  for (let i = 0; i <= w.length - n; i++) out.add(w.slice(i, i + n).join(" "));
  return out;
}

function jaccard(a, b) {
  const A = new Set(a.split(/\s+/));
  const B = new Set(b.split(/\s+/));
  let inter = 0;
  for (const x of A) if (B.has(x)) inter++;
  const uni = A.size + B.size - inter;
  return uni ? inter / uni : 0;
}

function containment(a, b) {
  const A = grams(a);
  const B = grams(b);
  if (!A.size) return 0;
  let hit = 0;
  for (const g of A) if (B.has(g)) hit++;
  return hit / A.size;
}

function extractCore(html) {
  const parts = [];
  for (const id of ["ctx-hero", "short-answer", "local-config", "audience", "faq"]) {
    const m = html.match(new RegExp(`id="${id}"[\\s\\S]*?(?=<section|</main>)`, "i"));
    if (m) parts.push(m[0]);
  }
  return stripChrome(parts.join(" "));
}

function compare(aPath, bPath) {
  const a = fs.readFileSync(aPath, "utf8");
  const b = fs.readFileSync(bPath, "utf8");
  const ta = stripChrome(a);
  const tb = stripChrome(b);
  const ca = extractCore(a);
  const cb = extractCore(b);
  const longDup = [];
  const sa = sentences(ta);
  const sb = new Set(sentences(tb));
  for (const s of sa) {
    const words = s.split(/\s+/);
    if (words.length > 12 && sb.has(s)) longDup.push(s.slice(0, 120));
  }
  return {
    a: path.basename(path.dirname(aPath)),
    b: path.basename(path.dirname(bPath)),
    main_containment: +(containment(ta, tb) * 100).toFixed(2),
    main_jaccard: +(jaccard(ta, tb) * 100).toFixed(2),
    core_containment: +(containment(ca, cb) * 100).toFixed(2),
    core_jaccard: +(jaccard(ca, cb) * 100).toFixed(2),
    long_dups: longDup.length,
    long_dup_samples: longDup.slice(0, 5),
    pass:
      containment(ta, tb) <= 0.25 &&
      jaccard(ta, tb) <= 0.15 &&
      containment(ca, cb) <= 0.15 &&
      jaccard(ca, cb) <= 0.1 &&
      longDup.length === 0,
  };
}

const args = process.argv.slice(2);
if (args.length < 2) {
  console.error("Usage: node similarity-check.mjs <pageA> <pageB> [more...]");
  process.exit(2);
}
const base = args[0];
for (let i = 1; i < args.length; i++) {
  const r = compare(base, args[i]);
  console.log(JSON.stringify(r));
  if (!r.pass) process.exitCode = 1;
}
