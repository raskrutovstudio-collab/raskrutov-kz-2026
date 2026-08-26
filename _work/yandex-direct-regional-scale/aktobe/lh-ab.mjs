import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

// Interleaved A/B: alternates aktobe and the approved astana template run-by-run so that
// machine load drift affects both pages equally. Single-page runs on this host swing 87-98.

const lhCli = path.join(process.cwd(), 'node_modules/lighthouse/cli/index.js');
const ORIGIN = process.env.QA_ORIGIN || 'http://127.0.0.1:8791';
const OUT = path.resolve('site_mirror/_work/yandex-direct-regional-scale/aktobe');
const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const RUNS = Number(process.env.LH_RUNS || 5);

const PAGES = {
  astana: ORIGIN + '/web-studiya/kontekstnaya-reklama/yandex-direct/astana/',
  aktobe: ORIGIN + '/web-studiya/kontekstnaya-reklama/yandex-direct/aktobe/'
};

function run(url, label) {
  const out = path.join(os.tmpdir(), 'lh-ab-' + label + '-' + Date.now() + '.json');
  const args = [lhCli, url, '--quiet', '--output=json', '--output-path=' + out,
    '--only-categories=performance,accessibility,best-practices,seo',
    '--throttling-method=devtools',
    '--form-factor=mobile', '--screenEmulation.mobile=true',
    '--chrome-flags=--headless=new --disable-gpu --no-sandbox'];
  if (fs.existsSync(CHROME)) args.push('--chrome-path=' + CHROME);
  const r = spawnSync(process.execPath, args, { stdio: 'ignore' });
  if (r.status !== 0) throw new Error('lighthouse failed ' + label);
  const rep = JSON.parse(fs.readFileSync(out, 'utf8'));
  fs.unlinkSync(out);
  const a = rep.audits, c = rep.categories;
  return {
    performance: Math.round(c.performance.score * 100),
    accessibility: Math.round(c.accessibility.score * 100),
    bestPractices: Math.round(c['best-practices'].score * 100),
    seo: Math.round(c.seo.score * 100),
    fcp: Math.round(a['first-contentful-paint'].numericValue),
    lcp: Math.round(a['largest-contentful-paint'].numericValue),
    tbt: Math.round(a['total-blocking-time'].numericValue),
    cls: Number(a['cumulative-layout-shift'].numericValue.toFixed(3)),
    si: Math.round(a['speed-index'].numericValue)
  };
}

const res = { astana: [], aktobe: [] };
for (let i = 1; i <= RUNS; i++) {
  // alternate which page goes first to cancel out ordering bias
  const order = i % 2 ? ['astana', 'aktobe'] : ['aktobe', 'astana'];
  for (const city of order) {
    const r = run(PAGES[city], city + i);
    res[city].push(r);
    console.log(`run ${i} ${city.padEnd(9)} perf ${String(r.performance).padStart(3)}  tbt ${String(r.tbt).padStart(4)}  lcp ${r.lcp}  cls ${r.cls}`);
  }
}

const median = (arr, k) => { const s = [...arr.map((x) => x[k])].sort((a, b) => a - b); return s[Math.floor(s.length / 2)]; };
const summary = {};
for (const city of ['astana', 'aktobe']) {
  summary[city] = {
    perf_runs: res[city].map((r) => r.performance),
    perf_median: median(res[city], 'performance'),
    tbt_runs: res[city].map((r) => r.tbt),
    tbt_median: median(res[city], 'tbt'),
    lcp_median: median(res[city], 'lcp'),
    cls_median: median(res[city], 'cls'),
    a11y: res[city][0].accessibility,
    bp: res[city][0].bestPractices,
    seo: res[city][0].seo
  };
}
console.log('\n' + JSON.stringify(summary, null, 2));
fs.writeFileSync(path.join(OUT, 'lighthouse-ab.json'), JSON.stringify({ runs: res, summary }, null, 2));
