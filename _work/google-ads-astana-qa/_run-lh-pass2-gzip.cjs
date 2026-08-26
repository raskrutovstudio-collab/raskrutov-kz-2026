/**
 * Pass2: 3× mobile + 1× desktop Lighthouse on gzip server (:8765)
 */
const { spawnSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const OUT = path.resolve(__dirname);
const URL =
  'http://127.0.0.1:8765/web-studiya/kontekstnaya-reklama/google-ads/astana/';
const lhCli = path.resolve(
  __dirname,
  '../../../node_modules/lighthouse/cli/index.js'
);

function runLh(label, formFactor) {
  const outPath = path.join(OUT, `lh-pass2-gzip-${label}.json`);
  const args = [
    lhCli,
    URL,
    '--quiet',
    '--output=json',
    `--output-path=${outPath}`,
    '--only-categories=performance,accessibility,best-practices,seo',
    `--form-factor=${formFactor}`,
    '--throttling-method=simulate',
    '--chrome-flags=--headless --no-sandbox --disable-gpu',
  ];
  if (formFactor === 'mobile') {
    args.push('--screenEmulation.mobile=true');
  } else {
    args.push(
      '--screenEmulation.mobile=false',
      '--screenEmulation.width=1350',
      '--screenEmulation.height=940',
      '--screenEmulation.deviceScaleFactor=1',
      '--emulated-form-factor=desktop'
    );
  }
  console.log(`\n=== LH ${label} (${formFactor}) ===`);
  const run = spawnSync(process.execPath, args, {
    stdio: 'inherit',
    cwd: path.resolve(__dirname, '../../..'),
    env: process.env,
  });
  if (run.status !== 0) {
    console.error('lighthouse exit', run.status, run.error);
    process.exit(run.status || 1);
  }
  const report = JSON.parse(fs.readFileSync(outPath, 'utf8'));
  const cats = report.categories || {};
  const scores = {
    performance: Math.round((cats.performance?.score || 0) * 100),
    accessibility: Math.round((cats.accessibility?.score || 0) * 100),
    bestPractices: Math.round((cats['best-practices']?.score || 0) * 100),
    seo: Math.round((cats.seo?.score || 0) * 100),
  };
  const metrics = {
    fcp: Math.round(report.audits['first-contentful-paint']?.numericValue || 0),
    lcp: Math.round(
      report.audits['largest-contentful-paint']?.numericValue || 0
    ),
    tbt: Math.round(report.audits['total-blocking-time']?.numericValue || 0),
    cls: report.audits['cumulative-layout-shift']?.numericValue ?? 0,
    si: Math.round(report.audits['speed-index']?.numericValue || 0),
  };
  const lcpEl = report.audits['largest-contentful-paint-element'];
  const lcpSnippet =
    lcpEl?.details?.items?.[0]?.node?.snippet ||
    lcpEl?.details?.items?.[0]?.items?.[0]?.node?.snippet ||
    null;
  const bpRef = cats['best-practices']?.auditRefs || [];
  const bpFailed = [];
  for (const ref of bpRef) {
    const a = report.audits[ref.id];
    if (!a || typeof a.score !== 'number' || a.score >= 1) continue;
    bpFailed.push({
      id: a.id,
      title: a.title,
      score: a.score,
      displayValue: a.displayValue || null,
    });
  }
  const summary = {
    label,
    formFactor,
    lighthouseVersion: report.lighthouseVersion,
    fetchTime: report.fetchTime,
    scores,
    metrics,
    lcpElementSnippet: lcpSnippet,
    bpFailed,
    outPath,
  };
  console.log(JSON.stringify(summary, null, 2));
  return summary;
}

function median(nums) {
  const s = [...nums].sort((a, b) => a - b);
  return s[Math.floor(s.length / 2)];
}

const mobile = [runLh('1', 'mobile'), runLh('2', 'mobile'), runLh('3', 'mobile')];
const desktop = runLh('d', 'desktop');

const med = {
  performance: median(mobile.map((r) => r.scores.performance)),
  accessibility: median(mobile.map((r) => r.scores.accessibility)),
  bestPractices: median(mobile.map((r) => r.scores.bestPractices)),
  seo: median(mobile.map((r) => r.scores.seo)),
  fcp: median(mobile.map((r) => r.metrics.fcp)),
  lcp: median(mobile.map((r) => r.metrics.lcp)),
  tbt: median(mobile.map((r) => r.metrics.tbt)),
  cls: median(mobile.map((r) => r.metrics.cls)),
  si: median(mobile.map((r) => r.metrics.si)),
};

const allBp = {};
for (const r of [...mobile, desktop]) {
  for (const f of r.bpFailed) {
    if (!allBp[f.id]) allBp[f.id] = { ...f, runs: [] };
    allBp[f.id].runs.push(r.label);
  }
}

const summary = {
  url: URL,
  measuredAt: new Date().toISOString(),
  mobileRuns: mobile,
  mobileMedian: med,
  desktop,
  allBpFailures: Object.values(allBp),
  gate: {
    mobileMedianPerfGte90: med.performance >= 90,
    a11y100: med.accessibility === 100,
    seo100: med.seo === 100,
    stopCssArchitecture:
      med.performance >= 90 &&
      med.accessibility === 100 &&
      med.seo === 100,
  },
};

fs.writeFileSync(
  path.join(OUT, 'lh-pass2-gzip-summary.json'),
  JSON.stringify(summary, null, 2)
);
console.log('\n=== MEDIAN MOBILE ===');
console.log(JSON.stringify(med, null, 2));
console.log('gate.stopCssArchitecture =', summary.gate.stopCssArchitecture);
