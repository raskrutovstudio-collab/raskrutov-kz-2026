import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const lhCli = path.join(process.cwd(), 'node_modules/lighthouse/cli/index.js');
const origin = process.env.LH_ORIGIN || 'http://127.0.0.1:8768';
const slugs = ['kyzylorda', 'pavlodar', 'petropavlovsk', 'semey'];
const outFile = path.resolve('site_mirror/_work/google-ads-batch3-qa/lighthouse.json');
const results = {};

function runOnce(url, i) {
  const out = path.join(os.tmpdir(), `gads-b3-lh-${Date.now()}-${i}.json`);
  const args = [
    lhCli,
    url,
    '--quiet',
    '--output=json',
    `--output-path=${out}`,
    '--only-categories=performance,accessibility,best-practices,seo',
    '--form-factor=mobile',
    '--screenEmulation.mobile=true',
    '--chrome-flags=--headless=new --disable-gpu',
  ];
  const run = spawnSync(process.execPath, args, { stdio: 'inherit' });
  if (run.status !== 0) {
    throw new Error(`lighthouse failed ${url} run ${i} status=${run.status} err=${run.error || ''}`);
  }
  const report = JSON.parse(fs.readFileSync(out, 'utf8'));
  fs.unlinkSync(out);
  const cats = report.categories;
  const audits = report.audits;
  return {
    performance: Math.round(cats.performance.score * 100),
    accessibility: Math.round(cats.accessibility.score * 100),
    bestPractices: Math.round(cats['best-practices'].score * 100),
    seo: Math.round(cats.seo.score * 100),
    fcp: Math.round(audits['first-contentful-paint'].numericValue),
    lcp: Math.round(audits['largest-contentful-paint'].numericValue),
    tbt: Math.round(audits['total-blocking-time'].numericValue),
    cls: audits['cumulative-layout-shift'].numericValue,
    lcpElement:
      audits['largest-contentful-paint-element']?.displayValue ||
      audits['largest-contentful-paint']?.displayValue ||
      '',
  };
}

const median = (arr) => [...arr].sort((a, b) => a - b)[Math.floor(arr.length / 2)];

for (const slug of slugs) {
  const url = `${origin}/web-studiya/kontekstnaya-reklama/google-ads/${slug}/`;
  const runs = [];
  for (let i = 1; i <= 3; i++) {
    console.log(`LH ${slug} run ${i}`);
    runs.push(runOnce(url, i));
  }
  results[slug] = {
    url,
    runs,
    median: {
      performance: median(runs.map((r) => r.performance)),
      accessibility: median(runs.map((r) => r.accessibility)),
      bestPractices: median(runs.map((r) => r.bestPractices)),
      seo: median(runs.map((r) => r.seo)),
      fcp: median(runs.map((r) => r.fcp)),
      lcp: median(runs.map((r) => r.lcp)),
      tbt: median(runs.map((r) => r.tbt)),
      cls: median(runs.map((r) => r.cls)),
    },
  };
  console.log(`${slug} median`, results[slug].median);
}

fs.writeFileSync(outFile, JSON.stringify(results, null, 2));
console.log('wrote', outFile);
