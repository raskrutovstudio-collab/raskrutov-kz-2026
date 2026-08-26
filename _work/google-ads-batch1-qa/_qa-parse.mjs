import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "../../..");

const PAGES = {
  astana: "site_mirror/web-studiya/kontekstnaya-reklama/google-ads/astana/index.html",
  almaty: "site_mirror/web-studiya/kontekstnaya-reklama/google-ads/almaty/index.html",
  shymkent: "site_mirror/web-studiya/kontekstnaya-reklama/google-ads/shymkent/index.html",
  karaganda: "site_mirror/web-studiya/kontekstnaya-reklama/google-ads/karaganda/index.html",
  aktobe: "site_mirror/web-studiya/kontekstnaya-reklama/google-ads/aktobe/index.html",
};

const BATCH = ["almaty", "shymkent", "karaganda", "aktobe"];
const ALL = ["astana", ...BATCH];

const CITY_RE =
  /Алматы|Шымкент|Караганда|Актобе|Астана|almaty|shymkent|karaganda|aktobe|astana|Almaty|Shymkent|Karaganda|Aktobe|Astana/gi;

function readPage(rel) {
  const abs = path.join(ROOT, rel);
  return fs.readFileSync(abs, "utf8");
}

function extractJsonLd(html) {
  const results = [];
  const re = /<script\b[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
  let m;
  while ((m = re.exec(html))) {
    const raw = m[1].trim();
    try {
      results.push({ ok: true, data: JSON.parse(raw), chars: raw.length });
    } catch (err) {
      results.push({ ok: false, error: String(err.message || err), snippet: raw.slice(0, 200), chars: raw.length });
    }
  }
  return results;
}

function extractFontPreloads(html) {
  const lines = html.split(/\r?\n/);
  const preloads = [];
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (/<link\b[^>]*rel=["']preload["'][^>]*>/i.test(line) && /as=["']font["']/i.test(line)) {
      const hrefMatch = line.match(/href=["']([^"']+)["']/i);
      preloads.push({
        line: i + 1,
        href: hrefMatch ? hrefMatch[1] : null,
        raw: line.trim(),
      });
    }
  }
  return preloads;
}

function fontOrderCheck(preloads) {
  const hrefs = preloads.map((p) => (p.href || "").toLowerCase());
  const normalIdx = hrefs.findIndex((h) => h.includes("montserrat_normal"));
  const boldIdx = hrefs.findIndex((h) => h.includes("montserrat_bold"));
  let status = "PASS";
  let reason = "montserrat_normal appears before montserrat_bold";
  if (normalIdx === -1 && boldIdx === -1) {
    status = "FAIL";
    reason = "both montserrat_normal and montserrat_bold missing";
  } else if (normalIdx === -1) {
    status = "FAIL";
    reason = "montserrat_normal missing";
  } else if (boldIdx === -1) {
    status = "FAIL";
    reason = "montserrat_bold missing";
  } else if (normalIdx > boldIdx) {
    status = "FAIL";
    reason = "reversed: montserrat_bold appears before montserrat_normal";
  }
  return { status, reason, normalIdx, boldIdx, count: preloads.length };
}

function stripBlocksByTag(html, tag) {
  const re = new RegExp(`<${tag}\\b[^>]*>[\\s\\S]*?<\\/${tag}>`, "gi");
  return html.replace(re, " ");
}

function stripSelfClosing(html, tag) {
  const re = new RegExp(`<${tag}\\b[^>]*\\/?>`, "gi");
  return html.replace(re, " ");
}

function classLooksLikeNoise(cls) {
  const c = (cls || "").toLowerCase();
  return (
    c.includes("price") ||
    c.includes("legal") ||
    c.includes("consent") ||
    /(^|[\s_-])form([\s_-]|$)/.test(c) ||
    c.includes("rk-form") ||
    c.includes("rk-consent")
  );
}

function stripNoiseElements(html) {
  return html.replace(/<([a-zA-Z][\w:-]*)\b([^>]*)>/gi, (full, tag, attrs) => {
    const classMatch = attrs.match(/\bclass=["']([^"']*)["']/i);
    if (classMatch && classLooksLikeNoise(classMatch[1])) {
      return `<${tag} data-qa-strip="1"${attrs}>`;
    }
    return full;
  }).replace(/<([a-zA-Z][\w:-]*)\b[^>]*data-qa-strip="1"[^>]*>[\s\S]*?<\/\1>/gi, " ");
}

function extractMainHtml(html) {
  const mainMatch = html.match(/<main\b[^>]*>([\s\S]*?)<\/main>/i);
  return mainMatch ? mainMatch[1] : html;
}

function htmlToPlainText(html) {
  let s = extractMainHtml(html);
  s = stripBlocksByTag(s, "header");
  s = stripBlocksByTag(s, "footer");
  s = stripBlocksByTag(s, "form");
  s = stripBlocksByTag(s, "script");
  s = stripBlocksByTag(s, "style");
  s = stripBlocksByTag(s, "nav");
  s = stripBlocksByTag(s, "noscript");
  s = stripNoiseElements(s);
  s = s.replace(/<!--[\s\S]*?-->/g, " ");
  s = stripSelfClosing(s, "br");
  s = s.replace(/<\/(p|div|li|h[1-6]|tr|section|article|blockquote)>/gi, "\n");
  s = s.replace(/<[^>]+>/g, " ");
  s = s.replace(/&nbsp;/gi, " ");
  s = s.replace(/&amp;/gi, "&");
  s = s.replace(/&quot;/gi, '"');
  s = s.replace(/&#39;/gi, "'");
  s = s.replace(/&lt;/gi, "<");
  s = s.replace(/&gt;/gi, ">");
  s = s.replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)));
  s = s.replace(/&[a-z]+;/gi, " ");
  s = s.replace(/[ \t\f\v]+/g, " ");
  s = s.replace(/\n[ \t]+/g, "\n");
  s = s.replace(/[ \t]+\n/g, "\n");
  s = s.replace(/\n{3,}/g, "\n\n");
  return s.trim();
}

function normalizeCity(text) {
  return text.replace(CITY_RE, "CITYTOKEN");
}

function tokenizeWords(text) {
  return text
    .toLowerCase()
    .replace(/ё/g, "е")
    .split(/[^\p{L}\p{N}]+/u)
    .filter(Boolean);
}

function ngrams(tokens, n) {
  const set = new Set();
  if (tokens.length < n) {
    if (tokens.length) set.add(tokens.join(" "));
    return set;
  }
  for (let i = 0; i <= tokens.length - n; i++) {
    set.add(tokens.slice(i, i + n).join(" "));
  }
  return set;
}

function jaccard(a, b) {
  if (!a.size && !b.size) return 1;
  let inter = 0;
  for (const x of a) if (b.has(x)) inter++;
  const union = a.size + b.size - inter;
  return union === 0 ? 0 : inter / union;
}

function overlapCoef(a, b) {
  const min = Math.min(a.size, b.size);
  if (min === 0) return 0;
  let inter = 0;
  for (const x of a) if (b.has(x)) inter++;
  return inter / min;
}

function splitSentences(text) {
  return text
    .split(/(?<=[.!?])\s+|\n+/)
    .map((s) => s.replace(/\s+/g, " ").trim())
    .filter(Boolean);
}

function sentenceKey(s) {
  return s.replace(/\s+/g, " ").trim();
}

function collectDuplicates(pageSentences) {
  const map = new Map();
  for (const [page, sentences] of Object.entries(pageSentences)) {
    const seenOnPage = new Set();
    for (const s of sentences) {
      const key = sentenceKey(s);
      if (key.length <= 80) continue;
      if (seenOnPage.has(key)) continue;
      seenOnPage.add(key);
      if (!map.has(key)) map.set(key, { sentence: key, pages: [], length: key.length });
      map.get(key).pages.push(page);
    }
  }
  return [...map.values()]
    .filter((x) => x.pages.length >= 2)
    .sort((a, b) => b.length - a.length || b.pages.length - a.pages.length);
}

const htmlByPage = {};
const textRaw = {};
const textNorm = {};
const jsonld = {};
const fonts = {};

for (const id of ALL) {
  const html = readPage(PAGES[id]);
  htmlByPage[id] = html;
  jsonld[id] = extractJsonLd(html);
  fonts[id] = {
    preloads: extractFontPreloads(html),
    order: fontOrderCheck(extractFontPreloads(html)),
  };
  const plain = htmlToPlainText(html);
  textRaw[id] = plain;
  textNorm[id] = normalizeCity(plain);
}

const grams = {};
for (const id of ALL) {
  grams[id] = ngrams(tokenizeWords(textNorm[id]), 5);
}

const pairMatrix = {};
for (const a of ALL) {
  pairMatrix[a] = {};
  for (const b of ALL) {
    if (a === b) {
      pairMatrix[a][b] = { jaccard: 1, overlap: 1, gramsA: grams[a].size, gramsB: grams[b].size, intersection: grams[a].size };
      continue;
    }
    let inter = 0;
    for (const x of grams[a]) if (grams[b].has(x)) inter++;
    pairMatrix[a][b] = {
      jaccard: Number(jaccard(grams[a], grams[b]).toFixed(4)),
      overlap: Number(overlapCoef(grams[a], grams[b]).toFixed(4)),
      gramsA: grams[a].size,
      gramsB: grams[b].size,
      intersection: inter,
    };
  }
}

const sentencesRaw = {};
const sentencesNorm = {};
for (const id of ALL) {
  sentencesRaw[id] = splitSentences(textRaw[id]);
  sentencesNorm[id] = splitSentences(textNorm[id]);
}

const dupNorm = collectDuplicates(sentencesNorm);
const dupRaw = collectDuplicates(sentencesRaw);

const uniqueLongNorm = new Set();
for (const id of ALL) {
  for (const s of sentencesNorm[id]) {
    const k = sentenceKey(s);
    if (k.length > 80) uniqueLongNorm.add(k);
  }
}
const uniqueLongRaw = new Set();
for (const id of ALL) {
  for (const s of sentencesRaw[id]) {
    const k = sentenceKey(s);
    if (k.length > 80) uniqueLongRaw.add(k);
  }
}

const longNormCount = [...uniqueLongNorm].length;
const longRawCount = [...uniqueLongRaw].length;
const sharedNormCount = dupNorm.length;
const sharedRawCount = dupRaw.length;
const sharedNormChars = dupNorm.reduce((n, x) => n + x.length, 0);
const totalLongNormChars = [...uniqueLongNorm].reduce((n, s) => n + s.length, 0);

const citySwapRatio = longNormCount ? sharedNormCount / longNormCount : 0;
const extraCitySwap = Math.max(0, sharedNormCount - sharedRawCount);

let citySwapFlag = false;
let citySwapRecommendation = "NO city-swap flag. Identical-after-normalization duplicates are not dominant.";
if (extraCitySwap >= 8 || citySwapRatio >= 0.35 || (sharedNormCount >= 12 && sharedNormCount > sharedRawCount * 1.5)) {
  citySwapFlag = true;
  citySwapRecommendation =
    "FLAG city-swap: many long sentences are identical after city-name normalization, meaning pages largely differ by city swap rather than unique local copy.";
} else if (sharedNormCount >= 5 && extraCitySwap >= 3) {
  citySwapFlag = true;
  citySwapRecommendation =
    "FLAG city-swap (moderate): several long sentences match after city normalization and do not match in raw form.";
}

const jsonldSummary = {};
for (const id of BATCH) {
  const items = jsonld[id];
  jsonldSummary[id] = {
    blocks: items.length,
    success: items.length > 0 && items.every((x) => x.ok),
    fail: items.some((x) => !x.ok),
    errors: items.filter((x) => !x.ok).map((x) => x.error),
    types: items
      .filter((x) => x.ok)
      .map((x) => {
        const d = x.data;
        if (Array.isArray(d)) return d.map((i) => i["@type"] || "unknown");
        if (d && d["@graph"]) return d["@graph"].map((i) => i["@type"] || "unknown");
        return d && d["@type"] ? d["@type"] : typeof d;
      }),
  };
}

const fontsSummary = {};
for (const id of BATCH) {
  fontsSummary[id] = {
    status: fonts[id].order.status,
    reason: fonts[id].order.reason,
    preloads: fonts[id].preloads.map((p) => ({ line: p.line, href: p.href })),
  };
}

const offDiagPairs = [];
for (const a of ALL) {
  for (const b of ALL) {
    if (a >= b) continue;
    offDiagPairs.push({ a, b, jaccard: pairMatrix[a][b].jaccard, overlap: pairMatrix[a][b].overlap });
  }
}
offDiagPairs.sort((x, y) => y.jaccard - x.jaccard);

const parseReport = {
  generatedAt: new Date().toISOString(),
  pages: BATCH,
  reference: "astana",
  jsonld: jsonldSummary,
  fonts: fontsSummary,
  similarity: {
    method: "word 5-gram Jaccard and overlap coefficient after city-name normalization",
    textChars: Object.fromEntries(ALL.map((id) => [id, { raw: textRaw[id].length, cityNorm: textNorm[id].length, words: tokenizeWords(textNorm[id]).length, grams5: grams[id].size }])),
    highestPairs: offDiagPairs.slice(0, 8),
    lowestPairs: [...offDiagPairs].sort((a, b) => a.jaccard - b.jaccard).slice(0, 4),
    vsAstana: Object.fromEntries(
      BATCH.map((id) => [
        id,
        {
          jaccard: pairMatrix.astana[id].jaccard,
          overlap: pairMatrix.astana[id].overlap,
          intersection: pairMatrix.astana[id].intersection,
        },
      ])
    ),
    amongBatch: BATCH.map((a, i) =>
      BATCH.slice(i + 1).map((b) => ({
        a,
        b,
        jaccard: pairMatrix[a][b].jaccard,
        overlap: pairMatrix[a][b].overlap,
      }))
    ).flat(),
  },
  duplicates: {
    longSentenceThreshold: 80,
    uniqueLongRaw: longRawCount,
    uniqueLongCityNorm: longNormCount,
    sharedRaw: sharedRawCount,
    sharedCityNorm: sharedNormCount,
    extraSharedAfterCityNorm: extraCitySwap,
    cityNormSharedRatio: Number(citySwapRatio.toFixed(4)),
    topSharedCityNormCount: Math.min(40, dupNorm.length),
  },
  citySwap: {
    flag: citySwapFlag,
    extraSharedAfterCityNorm: extraCitySwap,
    sharedCityNorm: sharedNormCount,
    sharedRaw: sharedRawCount,
    recommendation: citySwapRecommendation,
  },
  verdict: {
    jsonldAllPass: BATCH.every((id) => jsonldSummary[id].success),
    fontsAllPass: BATCH.every((id) => fontsSummary[id].status === "PASS"),
    citySwapFlag,
  },
};

const similarityOut = {
  method: "word 5-grams; Jaccard = |A∩B|/|A∪B|; overlap = |A∩B|/min(|A|,|B|)",
  cityNormalization: String(CITY_RE),
  pages: ALL,
  grams: Object.fromEntries(ALL.map((id) => [id, grams[id].size])),
  matrix: pairMatrix,
};

const duplicateOut = {
  thresholdChars: 80,
  citySwap: {
    flag: citySwapFlag,
    recommendation: citySwapRecommendation,
    extraSharedAfterCityNorm: extraCitySwap,
  },
  cityNormalized: {
    totalShared: dupNorm.length,
    items: dupNorm,
  },
  raw: {
    totalShared: dupRaw.length,
    items: dupRaw,
  },
};

fs.writeFileSync(path.join(__dirname, "parse-report.json"), JSON.stringify(parseReport, null, 2), "utf8");
fs.writeFileSync(path.join(__dirname, "similarity-5gram.json"), JSON.stringify(similarityOut, null, 2), "utf8");
fs.writeFileSync(path.join(__dirname, "duplicate-sentences.json"), JSON.stringify(duplicateOut, null, 2), "utf8");

console.log("WROTE parse-report.json, similarity-5gram.json, duplicate-sentences.json");
console.log("JSONLD:", JSON.stringify(Object.fromEntries(BATCH.map((id) => [id, jsonldSummary[id].success])), null, 0));
console.log("FONTS:", JSON.stringify(Object.fromEntries(BATCH.map((id) => [id, fontsSummary[id].status])), null, 0));
console.log("CITYSWAP flag=", citySwapFlag);
console.log("dupNorm=", dupNorm.length, "dupRaw=", dupRaw.length, "extra=", extraCitySwap);
console.log("vsAstana Jaccard:", JSON.stringify(parseReport.similarity.vsAstana));
