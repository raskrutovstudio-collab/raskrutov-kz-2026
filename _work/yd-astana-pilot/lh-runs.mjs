import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const url = process.argv[2];
const formFactor = process.argv[3] || 'mobile';
const runs = Number(process.argv[4] || (formFactor === 'mobile' ? 3 : 2));
const lhBin = path.resolve('node_modules/lighthouse/cli/index.js');
const outDir = 'site_mirror/_work/yd-astana-pilot-qa';
fs.mkdirSync(outDir, { recursive: true });

const results = [];
for (let i = 1; i <= runs; i++) {
  const out = path.join(outDir, `lh-${formFactor}-${i}.json`);
  const args = [
    lhBin,
    url,
    '--quiet',
    '--output=json',
    `--output-path=${out}`,
    '--only-categories=performance,accessibility,best-practices,seo',
    `--form-factor=${formFactor}`,
    '--chrome-flags=--headless=new --disable-gpu',
  ];
  if (formFactor === 'mobile') {
    args.push('--screenEmulation.mobile=true');
  } else {
    args.push('--screenEmulation.mobile=false', '--screenEmulation.width=1350', '--screenEmulation.height=940', '--screenEmulation.deviceScaleFactor=1');
  }
  const run = spawnSync(process.execPath, args, { stdio: 'inherit' });
  if (run.status !== 0) process.exit(run.status || 1);
  const report = JSON.parse(fs.readFileSync(out, 'utf8'));
  const row = {
    performance: Math.round(report.categories.performance.score * 100),
    accessibility: Math.round(report.categories.accessibility.score * 100),
    bestPractices: Math.round(report.categories['best-practices'].score * 100),
    seo: Math.round(report.categories.seo.score * 100),
    fcp: Math.round(report.audits['first-contentful-paint'].numericValue),
    lcp: Math.round(report.audits['largest-contentful-paint'].numericValue),
    cls: Number(report.audits['cumulative-layout-shift'].numericValue.toFixed(3)),
    tbt: Math.round(report.audits['total-blocking-time'].numericValue),
  };
  results.push(row);
  console.log(`${formFactor} run ${i}`, row);
}

const median = (key) => [...results.map((r) => r[key])].sort((a, b) => a - b)[Math.floor(results.length / 2)];
const summary = {
  formFactor,
  results,
  median: {
    performance: median('performance'),
    accessibility: median('accessibility'),
    bestPractices: median('bestPractices'),
    seo: median('seo'),
    fcp: median('fcp'),
    lcp: median('lcp'),
    cls: median('cls'),
    tbt: median('tbt'),
  },
};
fs.writeFileSync(path.join(outDir, `lh-${formFactor}-summary.json`), JSON.stringify(summary, null, 2));
console.log('MEDIAN', summary.median);
