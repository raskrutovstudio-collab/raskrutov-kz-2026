/**
 * Batch1: 3× mobile + 1× desktop Lighthouse (simulate) per city on gzip :8765
 */
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '../../..');
const OUT = __dirname;
const CITIES = ['almaty', 'shymkent', 'karaganda', 'aktobe'];
const lhCli = path.resolve(ROOT, 'node_modules/lighthouse/cli/index.js');

function urlFor(city) {
  return `http://127.0.0.1:8765/web-studiya/kontekstnaya-reklama/google-ads/${city}/`;
}

function runLh(city, label, formFactor) {
  const outPath = path.join(OUT, `lh-${city}-${label}.json`);
  const args = [
    lhCli,
    urlFor(city),
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
  console.log(`\n=== LH ${city} ${label} (${formFactor}) ===`);
  const run = spawnSync(process.execPath, args, {
    stdio: 'inherit',
    cwd: ROOT,
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
    lcp: Math.round(report.audits['largest-contentful-paint']?.numericValue || 0),
    tbt: Math.round(report.audits['total-blocking-time']?.numericValue || 0),
    cls: report.audits['cumulative-layout-shift']?.numericValue ?? 0,
    si: Math.round(report.audits['speed-index']?.numericValue || 0),
  };
  const a11yFailed = [];
  for (const ref of cats.accessibility?.auditRefs || []) {
    const a = report.audits[ref.id];
    if (!a || typeof a.score !== 'number' || a.score >= 1) continue;
    a11yFailed.push({ id: a.id, title: a.title, score: a.score });
  }
  const seoFailed = [];
  for (const ref of cats.seo?.auditRefs || []) {
    const a = report.audits[ref.id];
    if (!a || typeof a.score !== 'number' || a.score >= 1) continue;
    seoFailed.push({ id: a.id, title: a.title, score: a.score });
  }
  const summary = {
    city,
    label,
    formFactor,
    lighthouseVersion: report.lighthouseVersion,
    fetchTime: report.fetchTime,
    scores,
    metrics,
    a11yFailed,
    seoFailed,
    outPath,
  };
  console.log(JSON.stringify(summary, null, 2));
  return summary;
}

function median(nums) {
  const s = [...nums].sort((a, b) => a - b);
  return s[Math.floor(s.length / 2)];
}

function medianFloat(nums) {
  const s = [...nums].sort((a, b) => a - b);
  return s[Math.floor(s.length / 2)];
}

const batch = { measuredAt: new Date().toISOString(), cities: {} };

for (const city of CITIES) {
  const mobile = [
    runLh(city, 'm1', 'mobile'),
    runLh(city, 'm2', 'mobile'),
    runLh(city, 'm3', 'mobile'),
  ];
  const desktop = runLh(city, 'd', 'desktop');
  const med = {
    performance: median(mobile.map((r) => r.scores.performance)),
    accessibility: median(mobile.map((r) => r.scores.accessibility)),
    bestPractices: median(mobile.map((r) => r.scores.bestPractices)),
    seo: median(mobile.map((r) => r.scores.seo)),
    fcp: median(mobile.map((r) => r.metrics.fcp)),
    lcp: median(mobile.map((r) => r.metrics.lcp)),
    tbt: median(mobile.map((r) => r.metrics.tbt)),
    cls: medianFloat(mobile.map((r) => r.metrics.cls)),
    si: median(mobile.map((r) => r.metrics.si)),
  };
  batch.cities[city] = {
    url: urlFor(city),
    mobileRuns: mobile,
    mobileMedian: med,
    desktop,
    gate: {
      mobileMedianPerfGte90: med.performance >= 90,
      a11y100: med.accessibility === 100,
      seo100: med.seo === 100,
      bp100: med.bestPractices === 100,
    },
  };
  fs.writeFileSync(
    path.join(OUT, `lh-${city}-summary.json`),
    JSON.stringify(batch.cities[city], null, 2)
  );
}

fs.writeFileSync(path.join(OUT, 'lh-batch1-all.json'), JSON.stringify(batch, null, 2));
console.log('\n=== BATCH1 LH DONE ===');
console.log(
  JSON.stringify(
    Object.fromEntries(
      Object.entries(batch.cities).map(([c, v]) => [
        c,
        { median: v.mobileMedian, desktopPerf: v.desktop.scores.performance, gate: v.gate },
      ])
    ),
    null,
    2
  )
);
