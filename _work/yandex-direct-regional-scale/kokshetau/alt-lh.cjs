const { spawnSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const chrome = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const lh = "node_modules/lighthouse/cli/index.js";
const outDir = "site_mirror/_work/yandex-direct-regional-scale/kokshetau/alt-runs";
fs.mkdirSync(outDir, { recursive: true });

function once(slug, n) {
  const url = `http://127.0.0.1:8766/web-studiya/kontekstnaya-reklama/yandex-direct/${slug}/`;
  const out = path.join(outDir, `${slug}-${n}.json`);
  spawnSync(
    process.execPath,
    [
      lh,
      url,
      "--quiet",
      `--chrome-path=${chrome}`,
      "--form-factor=mobile",
      "--screenEmulation.mobile",
      "--only-categories=performance",
      "--output=json",
      `--output-path=${out}`,
      "--chrome-flags=--headless=new --no-sandbox --disable-gpu --disable-dev-shm-usage",
    ],
    { stdio: "inherit" }
  );
  const j = JSON.parse(fs.readFileSync(out, "utf8"));
  const row = {
    p: Math.round(j.categories.performance.score * 100),
    fcp: Math.round(j.audits["first-contentful-paint"].numericValue),
    lcp: Math.round(j.audits["largest-contentful-paint"].numericValue),
    tbt: Math.round(j.audits["total-blocking-time"].numericValue),
  };
  console.log(slug, n, JSON.stringify(row));
  return row;
}

const results = { aktau: [], kokshetau: [] };
for (let i = 1; i <= 6; i++) {
  results.aktau.push(once("aktau", i));
  results.kokshetau.push(once("kokshetau", i));
}

function summarize(name, rows) {
  const good = rows.filter((r) => r.lcp <= 3000 && r.fcp <= 1800);
  const tbts = good.map((r) => r.tbt).sort((a, b) => a - b);
  console.log(
    name,
    "good",
    good.length,
    "/",
    rows.length,
    "tbt",
    tbts.join(","),
    "medianGood",
    tbts[Math.floor(tbts.length / 2)]
  );
}
summarize("aktau", results.aktau);
summarize("kokshetau", results.kokshetau);
