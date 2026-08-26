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
    .replace(/&amp;/g, "&");
}
function attr(tag, name) {
  const m = tag.match(new RegExp("\\b" + name + '="([^"]*)"', "i"));
  return m ? unescapeHtml(m[1]) : null;
}
function hashFromSrc(src) {
  const m = String(src || "").match(/lpfile\/[0-9a-f/]+\/([0-9a-f]{32})/i);
  return m ? m[1].toLowerCase() : null;
}

const bp = read("site_mirror/o-kompanii/blagodarstvennye-pisma/index.html");
console.log("BP len", bp.length);
console.log("showOriginalImage", (bp.match(/showOriginalImage/g) || []).length);
console.log("showImagePreview", (bp.match(/showImagePreview/g) || []).length);
console.log("itemprop name", (bp.match(/itemprop="name"/g) || []).length);
console.log("Благодарствен count", (bp.match(/Благодарствен/g) || []).length);
console.log("Письмо count", (bp.match(/Письмо/g) || []).length);
console.log("img count", (bp.match(/<img\b/gi) || []).length);

// All itemprop names
const names = [];
let m;
const reName = /itemprop="name"\s+content="([^"]*)"/gi;
while ((m = reName.exec(bp))) names.push(unescapeHtml(m[1]));
console.log("\nAll itemprop names (" + names.length + "):");
names.forEach((n, i) => console.log(i + 1 + ".", n));

// All unique img hashes with attrs + nearby name
const imgs = new Map();
const reImg = /<img\b[^>]*>/gi;
while ((m = reImg.exec(bp))) {
  const tag = m[0];
  const src = attr(tag, "src") || "";
  const h = hashFromSrc(src);
  if (!h) continue;
  if (!imgs.has(h)) {
    // look back for name
    const prev = bp.slice(Math.max(0, m.index - 800), m.index);
    const nm = prev.match(/itemprop="name"\s+content="([^"]*)"/i);
    imgs.set(h, {
      hash: h,
      src,
      alt: attr(tag, "alt"),
      title: attr(tag, "title"),
      width: attr(tag, "width"),
      height: attr(tag, "height"),
      name: nm ? unescapeHtml(nm[1]) : null,
      count: 1,
      onclickNearby: /showOriginalImage|showImagePreview|linkRedirect/.test(prev.slice(-200) + tag),
    });
  } else {
    imgs.get(h).count++;
  }
}
console.log("\nUnique img hashes:", imgs.size);
[...imgs.values()].forEach((L, i) => {
  console.log(
    `\n${i + 1}. hash=${L.hash} count=${L.count} name=${JSON.stringify(L.name)}`
  );
  console.log(`   alt=${JSON.stringify(L.alt)} title=${JSON.stringify(L.title)}`);
  console.log(`   w=${L.width} h=${L.height} lightboxish=${L.onclickNearby}`);
  console.log(`   src=${L.src}`);
});

// Look at H1/H2 on letters page
console.log("\nHeadings:");
const reH = /<h([1-3])[^>]*>([\s\S]*?)<\/h\1>/gi;
while ((m = reH.exec(bp))) {
  const t = unescapeHtml(m[2].replace(/<[^>]+>/g, "")).replace(/\s+/g, " ").trim();
  if (t) console.log("H" + m[1] + ":", t.slice(0, 200));
}

// Extract from sozdanie-saitov index the letter names (preview of 5)
const city = read("site_mirror/web-studiya/sozdanie-saitov/index.html");
console.log("\n=== Letter names from sozdanie-saitov preview ===");
const reL = /itemprop="name"\s+content="([^"]*Благодарствен[^"]*)"/gi;
const cityLetters = [];
while ((m = reL.exec(city))) {
  const name = unescapeHtml(m[1]);
  const after = city.slice(m.index, m.index + 1500);
  const img = after.match(/<img\b[^>]*>/i);
  let src = null, alt = null, w = null, h = null, hash = null;
  if (img) {
    src = attr(img[0], "src");
    alt = attr(img[0], "alt");
    w = attr(img[0], "width");
    h = attr(img[0], "height");
    hash = hashFromSrc(src);
  }
  cityLetters.push({ name, src, alt, w, h, hash });
}
cityLetters.forEach((L, i) => {
  console.log(`\nC${i + 1}. ${L.name}`);
  console.log(`   hash=${L.hash} w=${L.w} h=${L.h} alt=${JSON.stringify(L.alt)}`);
  console.log(`   src=${L.src}`);
});

// OTZIVI: Google section detail - extract imgs between Goole and 2GIS headings
const otz = read("site_mirror/assets/s239948.lpmotortest.com/otzivi/index.html");
const gooleIdx = otz.indexOf("Отзывы Goole");
const gisIdx = otz.indexOf("Отзывы 2GIS");
const partnersIdx = otz.indexOf("Отзывы наших партнеров");
console.log("\n=== OTZIVI section offsets ===");
console.log({ partnersIdx, gooleIdx, gisIdx });

function sectionImgs(label, start, end) {
  const chunk = otz.slice(start, end);
  const map = new Map();
  let mm;
  const re = /<img\b[^>]*>/gi;
  while ((mm = re.exec(chunk))) {
    const tag = mm[0];
    const src = attr(tag, "src") || "";
    const h = hashFromSrc(src);
    const key = h || src;
    if (!key || map.has(key)) continue;
    // skip tiny icons? keep all
    map.set(key, {
      src,
      hash: h,
      alt: attr(tag, "alt"),
      title: attr(tag, "title"),
      width: attr(tag, "width"),
      height: attr(tag, "height"),
      data_index: attr(tag, "data-index"),
    });
  }
  // also background urls in gallery
  const reBg = /url\((['"]?)([^)'"]+)\1\)/gi;
  while ((mm = reBg.exec(chunk))) {
    const src = mm[2];
    if (!/lpfile/i.test(src)) continue;
    const h = hashFromSrc(src);
    const key = h || src;
    if (!map.has(key)) map.set(key, { src, hash: h, alt: null, title: null, width: null, height: null, data_index: null });
  }
  console.log(`\n${label}: ${map.size} unique imgs`);
  [...map.values()].forEach((L, i) => {
    console.log(`${i + 1}. hash=${L.hash} idx=${L.data_index} alt=${JSON.stringify(L.alt)} w=${L.width} h=${L.height}`);
    console.log(`   src=${L.src}`);
  });
  return map;
}

const partnerSection = sectionImgs("PARTNER GALLERY", 0, gooleIdx > 0 ? gooleIdx : otz.length);
const googleSection = sectionImgs("GOOGLE SECTION", gooleIdx, gisIdx > 0 ? gisIdx : otz.length);
const gisSection = sectionImgs("2GIS SECTION", gisIdx, otz.length);

// Extract iframe / widget / links around google and 2gis
console.log("\n=== Google/2GIS embeds & links (raw snippets) ===");
function snippetsAround(needle, radius = 500) {
  let idx = 0;
  let n = 0;
  while ((idx = otz.indexOf(needle, idx)) !== -1 && n < 6) {
    const snip = otz.slice(idx, idx + radius).replace(/\s+/g, " ");
    console.log(`\n[${needle} #${++n}]`, snip.slice(0, 450));
    idx += needle.length;
  }
}
snippetsAround("g.page");
snippetsAround("go.2gis");
snippetsAround("2gis.com");
snippetsAround("iframe");
snippetsAround("Отзывы Goole");
snippetsAround("Отзывы 2GIS");

// Check local mirrored assets for letter hashes
console.log("\n=== Local mirrored lpfile assets for letter-like pages ===");
const assetRoot = path.join(base, "site_mirror/assets/m-files.cdn1.cc/lpfile");
function findHashDir(hash) {
  // lpfile/a/b/c/hash
  if (!hash || hash.length < 3) return null;
  const p = path.join(assetRoot, hash[0], hash[1], hash[2], hash);
  return fs.existsSync(p) ? p : null;
}

// Compare partner gallery hashes with city letter hashes and BP imgs
const partnerHashes = new Set([...partnerSection.keys()].map(String));
const bpHashes = new Set([...imgs.keys()]);
const cityHashes = new Set(cityLetters.map((x) => x.hash).filter(Boolean));
console.log("\nOverlap partner gallery vs BP imgs:", [...partnerHashes].filter((h) => bpHashes.has(h)));
console.log("Overlap city preview vs BP imgs:", [...cityHashes].filter((h) => bpHashes.has(h)));
console.log("Overlap city preview vs partner gallery:", [...cityHashes].filter((h) => partnerHashes.has(h) || [...partnerSection.values()].some((v) => v.hash === h)));

// Check if BP letter images use webp paths without img tags (background?)
console.log("\n=== background-image lpfile on BP page ===");
const bgHashes = new Map();
const reBg2 = /url\(['"]?([^)'"]*lpfile[^)'"]+)['"]?\)/gi;
while ((m = reBg2.exec(bp))) {
  const src = m[1];
  const h = hashFromSrc(src);
  if (!h) continue;
  if (!bgHashes.has(h)) bgHashes.set(h, src);
}
console.log("bg lpfile hashes", bgHashes.size);
[...bgHashes.entries()].forEach(([h, src], i) => console.log(i + 1 + ".", h, src.slice(0, 140)));

// Search for resize dimensions in CSS related to letter cards on BP
// Look around line content with blk_box padding 10px which we saw for letter cards
const boxIdx = bp.indexOf('padding:10px 10px;border-radius:10px;background:#ffffff;');
console.log("\nletter box occurrences", (bp.match(/padding:10px 10px;border-radius:10px;background:#ffffff;/g) || []).length);

// Extract each blk_box white card near main content - after breadcrumbs
const crumbs = bp.indexOf("Благодарственные письма</span>");
const main = bp.slice(crumbs > 0 ? crumbs : 0, bp.indexOf("Контакты</h2>") > 0 ? bp.indexOf("Контакты</h2>") : bp.length);
console.log("main slice length", main.length);
const mainImgs = new Map();
const reImg2 = /<img\b[^>]*>/gi;
while ((m = reImg2.exec(main))) {
  const tag = m[0];
  const src = attr(tag, "src") || "";
  const h = hashFromSrc(src);
  if (!h) continue;
  if (h === "81a3fe2ab76d8a7d4df2ea1900ce0265") continue; // logo
  if (!mainImgs.has(h)) {
    const prev = main.slice(Math.max(0, m.index - 900), m.index);
    const nm = prev.match(/itemprop="name"\s+content="([^"]*)"/i);
    mainImgs.set(h, {
      hash: h,
      src,
      alt: attr(tag, "alt"),
      title: attr(tag, "title"),
      width: attr(tag, "width"),
      height: attr(tag, "height"),
      name: nm ? unescapeHtml(nm[1]) : null,
    });
  }
}
console.log("\nMAIN CONTENT unique imgs (excl logo):", mainImgs.size);
[...mainImgs.values()].forEach((L, i) => {
  console.log(`\nM${i + 1}. name=${JSON.stringify(L.name)}`);
  console.log(`   hash=${L.hash}`);
  console.log(`   alt=${JSON.stringify(L.alt)} title=${JSON.stringify(L.title)}`);
  console.log(`   w=${L.width} h=${L.height}`);
  console.log(`   src=${L.src}`);
  const local = findHashDir(L.hash);
  console.log(`   local_asset=${local ? path.relative(base, local) : "NOT MIRRORED AS DIR"}`);
});

// Check local webp files under assets for these hashes
function findAnyLocal(hash) {
  const d = findHashDir(hash);
  if (!d) return null;
  try {
    return fs.readdirSync(d).slice(0, 10);
  } catch {
    return null;
  }
}

console.log("\nDONE2");
