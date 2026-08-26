const fs = require("fs");
const path = require("path");

const base = path.join(
  "d:",
  "РАБОТА",
  "111 ПОРТАЛ ,,, ПРОЕКТ РАСКРУТОВ 05,2026 111",
  "raskrutov-kz-2026"
);

function read(rel) {
  return fs.readFileSync(path.join(base, rel), "utf8");
}

function unescapeHtml(s) {
  return String(s || "")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&")
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)))
    .replace(/&#x([0-9a-f]+);/gi, (_, n) => String.fromCharCode(parseInt(n, 16)));
}

function attr(tag, name) {
  const m = tag.match(new RegExp("\\b" + name + '="([^"]*)"', "i"));
  return m ? unescapeHtml(m[1]) : null;
}

function hashFromSrc(src) {
  const m = String(src || "").match(/lpfile\/[0-9a-f/]+\/([0-9a-f]{32})/i);
  return m ? m[1].toLowerCase() : null;
}

function stripTags(html) {
  return unescapeHtml(
    String(html || "")
      .replace(/<br\s*\/?>/gi, "\n")
      .replace(/<\/p>/gi, "\n")
      .replace(/<[^>]+>/g, "")
      .replace(/[ \t]+/g, " ")
      .replace(/\n\s*\n+/g, "\n")
      .trim()
  );
}

function walkHtml(rootRel, filterFn) {
  const root = path.join(base, rootRel);
  const out = [];
  function walk(dir) {
    let entries;
    try {
      entries = fs.readdirSync(dir, { withFileTypes: true });
    } catch {
      return;
    }
    for (const e of entries) {
      const full = path.join(dir, e.name);
      if (e.isDirectory()) {
        if (e.name === "node_modules" || e.name === "_work") continue;
        walk(full);
      } else if (e.name === "index.html") {
        const rel = path.relative(path.join(base, "site_mirror"), full).split(path.sep).join("/");
        if (filterFn && !filterFn(rel)) continue;
        out.push(rel);
      }
    }
  }
  walk(root);
  return out;
}

// ===================== A =====================
const bpRel = "site_mirror/o-kompanii/blagodarstvennye-pisma/index.html";
const bp = read(bpRel);

console.log("=".repeat(80));
console.log("A. BLAGODARSTVENNYE-PISMA");
console.log("=".repeat(80));

const gallery = new Map();
const reShow = /showOriginalImage[\s\S]{0,2500}?(<img[^>]*>)/gi;
let m;
while ((m = reShow.exec(bp))) {
  const tag = m[1];
  const src = attr(tag, "src") || "";
  if (src.includes("81a3fe2ab76d8a7d4df2ea1900ce0265")) continue;
  const h = hashFromSrc(src);
  const key = h || src;
  if (gallery.has(key)) continue;
  const start = Math.max(0, m.index - 700);
  const prev = bp.slice(start, m.index);
  const nm = prev.match(/itemprop="name"\s+content="([^"]*)"/i);
  gallery.set(key, {
    name_meta: nm ? unescapeHtml(nm[1]).trim() : null,
    src,
    alt: attr(tag, "alt"),
    title: attr(tag, "title"),
    width: attr(tag, "width"),
    height: attr(tag, "height"),
    hash: h,
    source: "o-kompanii/blagodarstvennye-pisma/index.html",
  });
}

console.log("Unique showOriginalImage letter imgs:", gallery.size);
let i = 0;
for (const L of gallery.values()) {
  i++;
  console.log(`\nL${i}. META: ${L.name_meta}`);
  console.log(`   hash: ${L.hash}`);
  console.log(`   src: ${L.src}`);
  console.log(`   alt: ${JSON.stringify(L.alt)}`);
  console.log(`   title: ${JSON.stringify(L.title)}`);
  console.log(`   width x height: ${L.width} x ${L.height}`);
}

// ImageObject fallback for any missed
const lettersIo = new Map();
const reIo = /itemprop="name"\s+content="([^"]*)"/gi;
while ((m = reIo.exec(bp))) {
  const name = unescapeHtml(m[1]).trim();
  const after = bp.slice(m.index, m.index + 1800);
  const imgM = after.match(/<img[^>]*>/i);
  if (!imgM) continue;
  const tag = imgM[0];
  const src = attr(tag, "src") || "";
  if (src.includes("81a3fe2ab76d8a7d4df2ea1900ce0265")) continue;
  if (!/благодар|письм|сертификат|отзыв|письмо/i.test(name) && !gallery.size) {
    // keep if looks letter-like or empty gallery
  }
  const h = hashFromSrc(src);
  const key = h || src;
  if (!key) continue;
  if (!lettersIo.has(key)) {
    lettersIo.set(key, {
      name_meta: name,
      src,
      alt: attr(tag, "alt"),
      title: attr(tag, "title"),
      width: attr(tag, "width"),
      height: attr(tag, "height"),
      hash: h,
    });
  }
}
console.log("\nImageObject-linked imgs:", lettersIo.size);
for (const [k, L] of lettersIo) {
  if (!gallery.has(k)) {
    console.log("EXTRA ImageObject not in gallery:", L.name_meta, L.hash, L.src.slice(0, 100));
    gallery.set(k, { ...L, source: "o-kompanii/blagodarstvennye-pisma/index.html" });
  } else if (!gallery.get(k).name_meta && L.name_meta) {
    gallery.get(k).name_meta = L.name_meta;
  }
}
console.log("TOTAL UNIQUE LETTER IMAGES:", gallery.size);

// ===================== OTZIVI =====================
const otzRel = "site_mirror/assets/s239948.lpmotortest.com/otzivi/index.html";
const otz = read(otzRel);

console.log("\n" + "=".repeat(80));
console.log("OTZIVI PAGE");
console.log("=".repeat(80));
console.log("chars:", otz.length);

const headingRe = /<h([1-3])[^>]*>([\s\S]*?)<\/h\1>/gi;
while ((m = headingRe.exec(otz))) {
  const t = stripTags(m[2]);
  if (t) console.log("HEADING H" + m[1] + ":", t.slice(0, 200));
}

for (const kw of ["Google", "2GIS", "2ГИС", "2gis", "g.page", "maps.app.goo", "goo.gl/maps", "yandex"]) {
  const re = new RegExp(kw.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "gi");
  const c = (otz.match(re) || []).length;
  if (c) console.log(`Keyword '${kw}': ${c}`);
}

const otzImgs = new Map();
const prevRe = /<img[^>]*class="[^"]*preview__image[^"]*"[^>]*>/gi;
while ((m = prevRe.exec(otz))) {
  const tag = m[0];
  const src = attr(tag, "src") || "";
  const h = hashFromSrc(src);
  const key = h || src;
  if (otzImgs.has(key)) continue;
  otzImgs.set(key, {
    src,
    hash: h,
    data_index: attr(tag, "data-index"),
    alt: attr(tag, "alt"),
  });
}

// gallery thumbs may use background or nested img
const galRe = /section__gallery-image[\s\S]{0,900}?(?:src="([^"]+)"|url\(([^)]+)\))/gi;
while ((m = galRe.exec(otz))) {
  let src = (m[1] || m[2] || "").replace(/^['"]|['"]$/g, "");
  const h = hashFromSrc(src);
  const key = h || src;
  if (!otzImgs.has(key)) {
    otzImgs.set(key, { src, hash: h, data_index: null, alt: null });
  }
}

console.log("\nOtzivi unique gallery images:", otzImgs.size);
i = 0;
for (const L of otzImgs.values()) {
  i++;
  console.log(`O${i}. idx=${L.data_index} hash=${L.hash}`);
  console.log(`   src=${L.src}`);
}

// Text blocks
console.log("\n--- TEXT BLOCKS ---");
const texts = [];
const textRe = /<div class="blk blk_text[^"]*"[\s\S]*?<div class="blk-data[^"]*"[^>]*>([\s\S]*?)<\/div>/gi;
while ((m = textRe.exec(otz))) {
  const t = stripTags(m[1]);
  if (t.length >= 30) texts.push(t);
}

// also ms-active-string long texts
const spanRe = /<(?:p|span|li|div)[^>]*>([\s\S]{50,3000}?)<\/(?:p|span|li|div)>/gi;
while ((m = spanRe.exec(otz))) {
  const t = stripTags(m[1]);
  if (
    t.length >= 60 &&
    /сайт|работ|рекоменд|спасибо|отлично|агентств|студи|seo|реклам|разработ|сотруднич|качеств|результат/i.test(
      t
    )
  ) {
    if (!texts.includes(t)) texts.push(t);
  }
}

console.log("Candidate text blocks:", texts.length);
texts.slice(0, 50).forEach((t, idx) => {
  console.log(`\nT${idx + 1} (${t.length} chars):`);
  console.log(t.slice(0, 600));
  if (t.length > 600) console.log("...[truncated]");
});

console.log("\n--- RATING / AUTHOR patterns ---");
for (const pat of ["[★☆⭐]{1,5}", "\\d\\s*/\\s*5", "оценк", "рейтинг", "Review", "author", "Google", "2GIS", "2ГИС"]) {
  const re = new RegExp(pat, "gi");
  const matches = [...otz.matchAll(re)];
  if (matches.length) {
    console.log(`Pattern ${pat}: ${matches.length}`);
    matches.slice(0, 8).forEach((mm) => {
      const ctx = otz.slice(Math.max(0, mm.index - 100), mm.index + 180).replace(/\s+/g, " ");
      console.log("  ..." + ctx.slice(0, 220) + "...");
    });
  }
}

console.log("\n--- EXTERNAL LINKS ---");
const hrefRe = /href="([^"]+)"/gi;
const seenHref = new Set();
while ((m = hrefRe.exec(otz))) {
  const href = m[1];
  if (/google|g\.page|2gis|maps\.|yandex|flamp|zoon|goo\.gl/i.test(href)) {
    if (!seenHref.has(href)) {
      seenHref.add(href);
      console.log(href);
    }
  }
}

// Also look for data-page-link and onclick urls
const urlRe = /(https?:\/\/[^\s"'<>]+|(?:\/\/)?(?:www\.)?(?:google|2gis|g\.page)[^\s"'<>]+)/gi;
const urls = new Set();
while ((m = urlRe.exec(otz))) {
  if (/google|2gis|g\.page|maps/i.test(m[1])) urls.add(m[1]);
}
console.log("URL-like mentions:");
[...urls].slice(0, 40).forEach((u) => console.log(" ", u));

// ===================== D =====================
console.log("\n" + "=".repeat(80));
console.log("D. DUPLICATES");
console.log("=".repeat(80));
const letterHashes = new Set([...gallery.keys()]);
const otzHashes = new Set([...otzImgs.keys()]);
const common = [...letterHashes].filter((h) => otzHashes.has(h));
console.log("Letter hashes:", letterHashes.size);
console.log("Otzivi hashes:", otzHashes.size);
console.log("Common:", common.length);
common.forEach((h) => console.log(" ", h, "name=", gallery.get(h)?.name_meta));
console.log("Only otzivi:", otzHashes.size - common.length);
[...otzHashes].filter((h) => !letterHashes.has(h)).forEach((h) => {
  console.log(" ", h, otzImgs.get(h).src.slice(0, 120));
});
console.log("Only letters:", letterHashes.size - common.length);

// ===================== E =====================
console.log("\n" + "=".repeat(80));
console.log("E. CLEAN TEMPLATE CANDIDATES");
console.log("=".repeat(80));

const pages = walkHtml("site_mirror", (rel) => !rel.startsWith("assets/") && !rel.includes("_work"));
const candidates = [];
for (const rel of pages) {
  let txt;
  try {
    txt = read(path.join("site_mirror", rel));
  } catch {
    continue;
  }
  const hasPublic = txt.includes("public.bundle");
  const hasLpm = /lpmotor|m-files\.cdn1\.cc\/web\/build/i.test(txt);
  const rk = (txt.match(/\brk-[a-z0-9_-]+/gi) || []).length;
  const homeClean = /home-clean|rk-home/i.test(txt);
  const form = /<form\b/i.test(txt);
  const header = /<header\b|rk-header/i.test(txt);
  const footer = /<footer\b|rk-footer/i.test(txt);
  const size = Buffer.byteLength(txt, "utf8");
  if ((!hasPublic && !hasLpm && rk >= 5) || homeClean || (rk >= 15 && !hasPublic)) {
    candidates.push({ rel, rk, hasPublic, hasLpm, homeClean, form, header, footer, size });
  }
}
candidates.sort((a, b) => b.rk - a.rk || a.hasPublic - b.hasPublic || a.size - b.size);
console.log("Clean-ish:", candidates.length);
candidates.slice(0, 30).forEach((c) => {
  console.log(
    `${c.rel} | rk=${c.rk} | public=${c.hasPublic} | lpm=${c.hasLpm} | home_clean=${c.homeClean} | form=${c.form} | header=${c.header} | footer=${c.footer} | size=${c.size}`
  );
});

console.log("\n--- o-kompanii status ---");
for (const rel of walkHtml("site_mirror/o-kompanii")) {
  const txt = read(path.join("site_mirror", rel));
  const rk = (txt.match(/\brk-[a-z0-9_-]+/gi) || []).length;
  console.log(
    `${rel}: public=${txt.includes("public.bundle") ? "YES" : "no"} rk=${rk} size=${Buffer.byteLength(txt)}`
  );
}

// also check root index and known clean hubs
for (const rel of [
  "index.html",
  "web-studiya/podderzhka-saytov/index.html",
  "web-studiya/podderzhka-saytov/shymkent/index.html",
  "kontakty/index.html",
  "portfolio/index.html",
]) {
  const full = path.join(base, "site_mirror", rel);
  if (!fs.existsSync(full)) {
    console.log("MISSING", rel);
    continue;
  }
  const txt = fs.readFileSync(full, "utf8");
  const rk = (txt.match(/\brk-[a-z0-9_-]+/gi) || []).length;
  console.log(
    `CHECK ${rel}: public=${txt.includes("public.bundle") ? "YES" : "no"} rk=${rk} home-clean=${/home-clean/i.test(txt)} form=${/<form\b/i.test(txt)} footer=${/<footer\b|rk-footer/i.test(txt)}`
  );
}

// ===================== F =====================
console.log("\n" + "=".repeat(80));
console.log("F. LIGHTBOX ON CLEAN PAGES");
console.log("=".repeat(80));
const lightboxPats = [
  "lightbox",
  "fancybox",
  "glightbox",
  "data-lightbox",
  "photoswipe",
  "rk-lightbox",
  "rk-gallery",
  "showOriginalImage",
  "image-modal",
  "preview__wrapper",
];
for (const rel of pages) {
  const txt = read(path.join("site_mirror", rel));
  if (txt.includes("public.bundle")) continue;
  const hits = lightboxPats.filter((p) => new RegExp(p, "i").test(txt));
  if (hits.length) console.log(rel + ":", hits.join(", "));
}

// asset filenames
function walkFiles(dir, acc = []) {
  let entries;
  try {
    entries = fs.readdirSync(dir, { withFileTypes: true });
  } catch {
    return acc;
  }
  for (const e of entries) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) {
      if (["_work", "node_modules"].includes(e.name)) continue;
      walkFiles(full, acc);
    } else {
      const n = e.name.toLowerCase();
      if (/lightbox|glightbox|fancybox|photoswipe/.test(n)) acc.push(path.relative(base, full));
    }
  }
  return acc;
}
const assets = walkFiles(path.join(base, "site_mirror/assets"));
console.log("\nLightbox-named assets:", assets.length);
assets.slice(0, 20).forEach((a) => console.log(" ", a));

// redirects for otzivi
console.log("\n" + "=".repeat(80));
console.log("REDIRECTS / SITEMAP for otzivi");
console.log("=".repeat(80));
for (const f of [
  "site_mirror/.htaccess",
  "site_mirror/sitemap.xml",
  "docs/seo-regional/CLUSTERS.csv",
  "url_mapping.json",
]) {
  const full = path.join(base, f);
  if (!fs.existsSync(full)) continue;
  const txt = fs.readFileSync(full, "utf8");
  const lines = txt.split(/\r?\n/).filter((l) => /otziv|otzyv|blagodarstven/i.test(l));
  console.log("\n" + f + ":");
  lines.slice(0, 30).forEach((l) => console.log(" ", l.slice(0, 250)));
}

console.log("\nDONE");
