/**
 * Five mobile Lighthouse runs on restored baseline. Writes only under _work/google-ads-perf/.
 */
const fs = require("fs");
const path = require("path");
const { spawnSync } = require("child_process");

const ROOT = path.resolve(__dirname, "../../..");
const OUT_DIR = __dirname;
const LH_BIN = path.join(ROOT, "node_modules/lighthouse/cli/index.js");
const URL =
  "http://127.0.0.1:4180/web-studiya/kontekstnaya-reklama/google-ads/";
const USER_DATA_ROOT = path.join(OUT_DIR, "tmp-chrome-final");

function score100(v) {
  if (v == null || Number.isNaN(v)) return null;
  return Math.round(v * 100);
}

function ms(v) {
  if (v == null || Number.isNaN(v)) return null;
  return Math.round(v);
}

function findPhases(obj, depth) {
  if (!obj || depth > 8) return null;
  if (Array.isArray(obj)) {
    for (const x of obj) {
      const r = findPhases(x, depth + 1);
      if (r) return r;
    }
    return null;
  }
  if (typeof obj === "object") {
    if (obj.items && Array.isArray(obj.items)) {
      const phases = [];
      for (const it of obj.items) {
        const phase = it.phase || it.key || it.label || it.type;
        const timing = it.timing ?? it.duration ?? it.value;
        if (phase != null && timing != null) {
          phases.push({
            phase: String(phase),
            timing: Number(timing),
            percent: it.percent != null ? String(it.percent) : undefined,
          });
        }
      }
      const names = phases.map((p) => p.phase.toLowerCase()).join(" ");
      if (
        phases.length >= 3 &&
        /ttfb|load.?delay|render.?delay|load.?time/i.test(names)
      ) {
        const total = phases.reduce((s, p) => s + (p.timing || 0), 0);
        return phases.map((p) => ({
          phase: p.phase,
          timing: p.timing,
          percent:
            p.percent ||
            (total > 0 ? `${Math.round((p.timing / total) * 100)}%` : "0%"),
        }));
      }
    }
    for (const v of Object.values(obj)) {
      const r = findPhases(v, depth + 1);
      if (r) return r;
    }
  }
  return null;
}

function extractLcpSelector(audit) {
  if (!audit) return null;
  const d = audit.details;
  if (!d) return null;
  if (d.items && d.items[0]) {
    const it = d.items[0];
    if (it.node && it.node.selector) return it.node.selector;
    if (it.selector) return it.selector;
  }
  if (d.nodes && d.nodes[0] && d.nodes[0].selector) return d.nodes[0].selector;
  // nested items
  const walk = (obj, depth) => {
    if (!obj || depth > 6) return null;
    if (Array.isArray(obj)) {
      for (const x of obj) {
        const r = walk(x, depth + 1);
        if (r) return r;
      }
      return null;
    }
    if (typeof obj === "object") {
      if (obj.selector && typeof obj.selector === "string") return obj.selector;
      if (obj.node && obj.node.selector) return obj.node.selector;
      for (const v of Object.values(obj)) {
        const r = walk(v, depth + 1);
        if (r) return r;
      }
    }
    return null;
  };
  return walk(d, 0);
}

function extractRun(report, run) {
  const a = report.audits || {};
  const cats = report.categories || {};
  const rb = a["render-blocking-resources"];
  const renderBlocking = (rb && rb.details && rb.details.items
    ? rb.details.items
    : []
  ).map((it) => ({
    url: it.url,
    wastedMs: it.wastedMs != null ? Math.round(it.wastedMs) : null,
  }));

  const agentic = {};
  for (const [id, audit] of Object.entries(a)) {
    if (/agentic/i.test(id)) {
      agentic[id] = {
        score: audit.score,
        scoreDisplayMode: audit.scoreDisplayMode,
        title: audit.title,
      };
    }
  }

  const litb = a["link-in-text-block"];
  const phases =
    findPhases(a["lcp-breakdown-insight"], 0) ||
    findPhases(a["largest-contentful-paint-element"], 0) ||
    findPhases(a["largest-contentful-paint"], 0);

  return {
    run,
    performance: score100(cats.performance && cats.performance.score),
    accessibility: score100(cats.accessibility && cats.accessibility.score),
    bestPractices: score100(
      cats["best-practices"] && cats["best-practices"].score
    ),
    seo: score100(cats.seo && cats.seo.score),
    fcp: ms(a["first-contentful-paint"] && a["first-contentful-paint"].numericValue),
    lcp: ms(
      a["largest-contentful-paint"] && a["largest-contentful-paint"].numericValue
    ),
    tbt: ms(a["total-blocking-time"] && a["total-blocking-time"].numericValue),
    cls:
      a["cumulative-layout-shift"] && a["cumulative-layout-shift"].numericValue != null
        ? Number(a["cumulative-layout-shift"].numericValue.toFixed(4))
        : null,
    si: ms(a["speed-index"] && a["speed-index"].numericValue),
    colorContrast: a["color-contrast"] ? a["color-contrast"].score : null,
    linkInTextBlock: litb ? litb.score : null,
    linkInTextBlockMode: litb ? litb.scoreDisplayMode : null,
    lcpSelector: extractLcpSelector(a["largest-contentful-paint-element"]),
    lcpPhases: phases,
    renderBlocking,
    agentic: Object.keys(agentic).length ? agentic : null,
  };
}

function runLH(runIdx) {
  const out = path.join(OUT_DIR, `lh-final-${runIdx}.json`);
  const userData = path.join(USER_DATA_ROOT, `ud-${runIdx}-${Date.now()}`);
  fs.mkdirSync(userData, { recursive: true });
  const args = [
    LH_BIN,
    URL,
    "--quiet",
    "--output=json",
    `--output-path=${out}`,
    "--only-categories=performance,accessibility,best-practices,seo",
    "--form-factor=mobile",
    "--screenEmulation.mobile=true",
    "--throttling-method=simulate",
    `--chrome-flags=--headless=new --no-sandbox --disable-gpu --user-data-dir=${userData}`,
  ];
  console.log(`[${new Date().toISOString()}] LH run ${runIdx} start`);
  let attempt = 0;
  while (attempt < 4) {
    attempt += 1;
    const run = spawnSync(process.execPath, args, {
      stdio: "inherit",
      cwd: ROOT,
      windowsHide: true,
      env: process.env,
      timeout: 300000,
    });
    if (fs.existsSync(out)) {
      try {
        const report = JSON.parse(fs.readFileSync(out, "utf8"));
        if (report.runtimeError) {
          console.error("runtimeError", report.runtimeError);
          if (attempt < 4) {
            console.log("retry after Chrome busy / runtimeError...");
            Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, 8000);
            continue;
          }
          return null;
        }
        console.log(`[${new Date().toISOString()}] LH run ${runIdx} ok status=${run.status}`);
        return extractRun(report, runIdx);
      } catch (e) {
        console.error("parse fail", e.message);
      }
    } else {
      console.error("missing output", runIdx, "status", run.status, "signal", run.signal);
    }
    if (attempt < 4) {
      console.log("retry...");
      Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, 10000);
    }
  }
  return null;
}

function medianOf3(values) {
  const s = [...values].sort((a, b) => a - b);
  return s[1];
}

function main() {
  fs.mkdirSync(OUT_DIR, { recursive: true });
  const runs = [];
  for (let i = 1; i <= 5; i++) {
    const r = runLH(i);
    if (!r) throw new Error(`Lighthouse run ${i} failed`);
    runs.push(r);
    console.log(
      `run ${i}: perf=${r.performance} fcp=${r.fcp} lcp=${r.lcp} tbt=${r.tbt} cls=${r.cls} si=${r.si}`
    );
  }

  // discard best and worst by Performance; tie-break LCP (lower = better)
  const ranked = [...runs].sort((a, b) => {
    if (a.performance !== b.performance) return a.performance - b.performance;
    return a.lcp - b.lcp;
  });
  // worst = lowest perf (or highest LCP if tie at bottom)
  // best = highest perf (or lowest LCP if tie at top)
  // After ascending sort by perf then lcp:
  // index 0 = worst perf (or among worst, lowest LCP — wait)
  // User said: discard BEST and WORST by Performance (if tie, use LCP as tie-break: lower LCP = better)
  // So "better" means higher perf, and for same perf lower LCP is better.
  // Sort ascending by quality: worst first, best last.
  const byQuality = [...runs].sort((a, b) => {
    if (a.performance !== b.performance) return a.performance - b.performance;
    // lower LCP = better, so higher LCP sorts earlier (worse)
    return b.lcp - a.lcp;
  });
  const worst = byQuality[0];
  const best = byQuality[byQuality.length - 1];
  const middle = byQuality.slice(1, 4);

  const median = {
    performance: medianOf3(middle.map((r) => r.performance)),
    fcp: medianOf3(middle.map((r) => r.fcp)),
    lcp: medianOf3(middle.map((r) => r.lcp)),
    tbt: medianOf3(middle.map((r) => r.tbt)),
    cls: medianOf3(middle.map((r) => r.cls)),
    si: medianOf3(middle.map((r) => r.si)),
    accessibility: medianOf3(middle.map((r) => r.accessibility)),
    bestPractices: medianOf3(middle.map((r) => r.bestPractices)),
    seo: medianOf3(middle.map((r) => r.seo)),
  };

  // representative run for LCP phases: middle run whose LCP is the median LCP
  const midSortedByLcp = [...middle].sort((a, b) => a.lcp - b.lcp);
  const medianRep = midSortedByLcp[1];

  const summary = {
    page: URL,
    lighthouse: "12.8.2",
    formFactor: "mobile",
    throttlingMethod: "simulate",
    timestamp: new Date().toISOString(),
    note: "Restored baseline; no LCP fix applied",
    runs,
    discarded: {
      best: { run: best.run, performance: best.performance, lcp: best.lcp },
      worst: { run: worst.run, performance: worst.performance, lcp: worst.lcp },
    },
    medianOf3: median,
    medianRepresentativeRun: medianRep.run,
    medianRepresentativeLcpPhases: medianRep.lcpPhases,
    medianRepresentativeLcpSelector: medianRep.lcpSelector,
    medianRepresentativeRenderBlocking: medianRep.renderBlocking,
  };

  const outPath = path.join(OUT_DIR, "final-summary.json");
  fs.writeFileSync(outPath, JSON.stringify(summary, null, 2), "utf8");
  console.log("Wrote", outPath);
  console.log(JSON.stringify({ discarded: summary.discarded, medianOf3: median }, null, 2));
}

main();
