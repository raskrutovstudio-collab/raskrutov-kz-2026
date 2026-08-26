import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const lhCli = path.join(process.cwd(), 'node_modules/lighthouse/cli/index.js');
const url = (process.env.QA_ORIGIN || 'http://127.0.0.1:8791') + '/web-studiya/kontekstnaya-reklama/yandex-direct/astana/';
const OUT = path.resolve('site_mirror/_work/yandex-direct-regional-scale/aktobe');
const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

function run(label, extra) {
  const out = path.join(os.tmpdir(), 'lh-ctl-' + label + '-' + Date.now() + '.json');
  const args = [lhCli, url, '--quiet', '--output=json', '--output-path=' + out,
    '--only-categories=performance,accessibility,best-practices,seo',
    '--throttling-method=devtools',
    '--chrome-flags=--headless=new --disable-gpu --no-sandbox', ...extra];
  if (fs.existsSync(CHROME)) args.push('--chrome-path=' + CHROME);
  const r = spawnSync(process.execPath, args, { stdio: 'inherit' });
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
    si: Math.round(a['speed-index'].numericValue),
    lcpElement: a['largest-contentful-paint-element']?.details?.items?.[0]?.items?.[0]?.node?.snippet || ''
  };
}

const mobileFlags = ['--form-factor=mobile', '--screenEmulation.mobile=true'];
const desktopFlags = ['--preset=desktop'];

const mobile = [];
for (let i = 1; i <= 3; i++) { const r = run('m' + i, mobileFlags); console.log('MOBILE ' + i, JSON.stringify(r)); mobile.push(r); }
const med = (k) => [...mobile.map((r) => r[k])].sort((a, b) => a - b)[1];
const median = { performance: med('performance'), accessibility: med('accessibility'), bestPractices: med('bestPractices'), seo: med('seo'), fcp: med('fcp'), lcp: med('lcp'), tbt: med('tbt'), cls: med('cls'), si: med('si') };
console.log('MOBILE MEDIAN', JSON.stringify(median));

const desktop = run('d1', desktopFlags);
console.log('DESKTOP', JSON.stringify(desktop));

fs.writeFileSync(path.join(OUT, 'lighthouse.json'), JSON.stringify({ url, mobile, median, desktop }, null, 2));
