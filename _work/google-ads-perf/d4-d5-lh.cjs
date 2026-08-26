/**
 * D4 / D5: Create temp diagnostic HTML copies, run Lighthouse 2x each, delete temps.
 * Does NOT modify production index.html permanently.
 */
const fs = require("fs");
const path = require("path");
const { spawnSync } = require("child_process");

const ROOT = path.resolve(__dirname, "../../..");
const PAGE_DIR = path.join(
  ROOT,
  "site_mirror/web-studiya/kontekstnaya-reklama/google-ads"
);
const INDEX = path.join(PAGE_DIR, "index.html");
const DIAG_NOANIM = path.join(PAGE_DIR, "diag-noanim.html");
const DIAG_FONT = path.join(PAGE_DIR, "diag-font.html");
const OUT_DIR = __dirname;
const LH_BIN = path.join(ROOT, "node_modules/lighthouse/cli/index.js");
const USER_DATA_ROOT = path.join(OUT_DIR, "tmp-chrome");
const BASE = "http://127.0.0.1:4180/web-studiya/kontekstnaya-reklama/google-ads";

const NOANIM_STYLE = `<style id="diag-noanim">
#ctx-hero, #ctx-hero * { animation: none !important; transition: none !important; }
#ctx-hero .ctx-hero__lead { opacity: 1 !important; visibility: visible !important; transform: none !important; content-visibility: visible !important; }
</style>`;

const FONT_STYLE = `<style id="diag-font">
.ctx-hero__lead { font-family: -apple-system, system-ui, sans-serif !important; }
</style>`;

function injectBeforeHeadClose(html, styleBlock) {
  const idx = html.indexOf("</head>");
  if (idx < 0) throw new Error("no </head>");
  return html.slice(0, idx) + "\n" + styleBlock + "\n" + html.slice(idx);
}

function cleanupDiag() {
  for (const f of [DIAG_NOANIM, DIAG_FONT]) {
    try {
      if (fs.existsSync(f)) fs.unlinkSync(f);
    } catch (_) {}
  }
}

function runLH(url, label, runIdx) {
  const out = path.join(OUT_DIR, `lh-${label}-run${runIdx}.json`);
  const userData = path.join(USER_DATA_ROOT, `ud-${label}-${runIdx}`);
  fs.mkdirSync(USER_DATA_ROOT, { recursive: true });
  const args = [
    LH_BIN,
    url,
    "--quiet",
    "--output=json",
    `--output-path=${out}`,
    "--only-categories=performance",
    "--form-factor=mobile",
    "--screenEmulation.mobile=true",
    "--throttling-method=simulate",
    `--chrome-flags=--headless --no-sandbox --user-data-dir=${userData}`,
  ];
  console.log("LH", label, runIdx, url);
  const run = spawnSync(process.execPath, args, {
    stdio: "inherit",
    cwd: ROOT,
    windowsHide: true,
    env: process.env,
  });
  if (!fs.existsSync(out)) {
    console.error("LH failed", label, runIdx, "status", run.status, "missing output");
    return null;
  }
  if (run.status !== 0) {
    console.warn("LH non-zero status but output exists", label, runIdx, run.status);
  }
  const report = JSON.parse(fs.readFileSync(out, "utf8"));
  if (report.runtimeError) {
    console.error("LH runtimeError", label, runIdx, report.runtimeError);
    return null;
  }
  const a = report.audits;
  const lcpDetails = a["largest-contentful-paint-element"] || {};
  function findPhases(obj, depth) {
    if (!obj || depth > 6) return null;
    if (Array.isArray(obj)) {
      for (const x of obj) {
        const r = findPhases(x, depth + 1);
        if (r) return r;
      }
      return null;
    }
    if (typeof obj === "object") {
      if (
        obj.renderDelay != null ||
        obj.key === "renderDelay" ||
        (obj.label && /render.?delay/i.test(String(obj.label)))
      ) {
        return obj;
      }
      if (obj.items && Array.isArray(obj.items)) {
        const map = {};
        for (const it of obj.items) {
          const k = it.phase || it.key || it.label || it.type;
          if (k && (it.timing != null || it.duration != null || it.value != null)) {
            map[String(k)] = it.timing ?? it.duration ?? it.value;
          }
        }
        if (Object.keys(map).length) return map;
      }
      for (const v of Object.values(obj)) {
        const r = findPhases(v, depth + 1);
        if (r) return r;
      }
    }
    return null;
  }
  const phaseMap =
    findPhases(a["lcp-breakdown-insight"], 0) ||
    findPhases(a["largest-contentful-paint"], 0) ||
    findPhases(lcpDetails, 0);

  return {
    label,
    run: runIdx,
    url,
    performance: Math.round((report.categories.performance.score || 0) * 100),
    fcp: Math.round(a["first-contentful-paint"].numericValue),
    lcp: Math.round(a["largest-contentful-paint"].numericValue),
    tbt: Math.round(a["total-blocking-time"].numericValue),
    cls: a["cumulative-layout-shift"].numericValue,
    si: Math.round(a["speed-index"].numericValue),
    phaseMap,
    lcpElementSnippet:
      lcpDetails.details && lcpDetails.details.items
        ? lcpDetails.details.items.slice(0, 2)
        : null,
    renderBlocking:
      (a["render-blocking-resources"] &&
        a["render-blocking-resources"].details &&
        a["render-blocking-resources"].details.items) ||
      null,
  };
}

function main() {
  process.on("exit", cleanupDiag);
  process.on("SIGINT", () => {
    cleanupDiag();
    process.exit(1);
  });

  const html = fs.readFileSync(INDEX, "utf8");
  fs.writeFileSync(DIAG_NOANIM, injectBeforeHeadClose(html, NOANIM_STYLE));
  fs.writeFileSync(DIAG_FONT, injectBeforeHeadClose(html, FONT_STYLE));
  console.log("Created temp pages");

  const results = [];
  try {
    results.push(runLH(BASE + "/", "real", 1));
    results.push(runLH(BASE + "/", "real", 2));
    results.push(runLH(BASE + "/diag-noanim.html", "noanim", 1));
    results.push(runLH(BASE + "/diag-noanim.html", "noanim", 2));
    results.push(runLH(BASE + "/diag-font.html", "font", 1));
    results.push(runLH(BASE + "/diag-font.html", "font", 2));
  } finally {
    cleanupDiag();
  }

  fs.writeFileSync(
    path.join(OUT_DIR, "d4-d5-lh-compare.json"),
    JSON.stringify(results, null, 2)
  );
  console.log(JSON.stringify(results, null, 2));
  console.log("Deleted temp HTML files");
  console.log(
    "exists noanim?",
    fs.existsSync(DIAG_NOANIM),
    "font?",
    fs.existsSync(DIAG_FONT)
  );
}

main();