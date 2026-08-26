import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const lhCli = path.join(process.cwd(), 'node_modules/lighthouse/cli/index.js');
const origin = process.env.LH_ORIGIN || 'http://127.0.0.1:8768';
const url = `${origin}/web-studiya/kontekstnaya-reklama/google-ads/astana/`;
const outFile = path.resolve('site_mirror/_work/google-ads-astana-final-qa/lighthouse.json');

function runOnce(i) {
  const out = path.join(os.tmpdir(), `gads-ast-lh-${Date.now()}-${i}.json`);
  const run = spawnSync(
    process.execPath,
    [
      lhCli,
      url,
      '--quiet',
      '--output=json',
      `--output-path=${out}`,
      '--only-categories=performance,accessibility,best-practices,seo',
      '--form-factor=mobile',
      '--screenEmulation.mobile=true',
      '--chrome-flags=--headless=new --disable-gpu',
    ],
    { stdio: 'inherit' },
  );
  if (run.status !== 0) throw new Error(`lighthouse failed run ${i} status=${run.status}`);
  const report = JSON.parse(fs.readFileSync(out, 'utf8'));
  fs.unlinkSync(out);
  const cats = report.categories;
  const audits = report.audits;
  const node = audits['largest-contentful-paint-element']?.details?.items?.[0]?.items?.[0]?.node;
  return {
    performance: Math.round(cats.performance.score * 100),
    accessibility: Math.round(cats.accessibility.score * 100),
    bestPractices: Math.round(cats['best-practices'].score * 100),
    seo: Math.round(cats.seo.score * 100),
    fcp: Math.round(audits['first-contentful-paint'].numericValue),
    lcp: Math.round(audits['largest-contentful-paint'].numericValue),
    si: Math.round(audits['speed-index'].numericValue),
    tbt: Math.round(audits['total-blocking-time'].numericValue),
    cls: Number(audits['cumulative-layout-shift'].numericValue.toFixed(4)),
    lcpSnippet: node?.snippet || '',
  };
}

const median = (arr) => [...arr].sort((a, b) => a - b)[Math.floor(arr.length / 2)];
const runs = [];
for (let i = 1; i <= 3; i++) {
  console.log(`LH astana run ${i}`);
  runs.push(runOnce(i));
  console.log(JSON.stringify(runs[i - 1]));
}
const result = {
  url,
  note: 'official sequential 3-run set after current Astana HTML',
  runs,
  median: {
    performance: median(runs.map((r) => r.performance)),
    accessibility: median(runs.map((r) => r.accessibility)),
    bestPractices: median(runs.map((r) => r.bestPractices)),
    seo: median(runs.map((r) => r.seo)),
    fcp: median(runs.map((r) => r.fcp)),
    lcp: median(runs.map((r) => r.lcp)),
    si: median(runs.map((r) => r.si)),
    tbt: median(runs.map((r) => r.tbt)),
    cls: median(runs.map((r) => r.cls)),
  },
  minPerformance: Math.min(...runs.map((r) => r.performance)),
};
fs.writeFileSync(outFile, JSON.stringify(result, null, 2));
console.log('median', result.median, 'min', result.minPerformance);
console.log('wrote', outFile);
