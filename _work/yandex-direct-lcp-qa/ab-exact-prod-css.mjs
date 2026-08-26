import fs from 'node:fs';
import { spawnSync } from 'node:child_process';
import path from 'node:path';

const htmlPath = 'site_mirror/web-studiya/kontekstnaya-reklama/yandex-direct/index.html';
let h = fs.readFileSync(htmlPath, 'utf8');
const re =
  /<link rel="stylesheet" href="\.\.\/\.\.\/\.\.\/assets\/css\/home-clean\.css\?v=39"[^>]*>\s*<link rel="stylesheet" href="\.\.\/\.\.\/\.\.\/assets\/css\/kontekst-clean\.css\?v=7"[^>]*>\s*<link rel="stylesheet" href="\.\.\/\.\.\/\.\.\/assets\/css\/yandex-direct-page\.css\?v=5"[^>]*>\s*<link rel="stylesheet" href="\.\.\/\.\.\/\.\.\/assets\/css\/lead-forms\.css"[^>]*>/;
const to = `<link rel="stylesheet" href="../../../assets/css/home-clean.css?v=39">
  <link rel="stylesheet" href="../../../assets/css/kontekst-clean.css?v=7">
  <link rel="stylesheet" href="../../../assets/css/yandex-direct-page.css?v=5" media="print" onload="this.media='all'">
  <link rel="stylesheet" href="../../../assets/css/lead-forms.css" media="print" onload="this.media='all'">`;
if (!re.test(h)) {
  console.error('CSS link block not found');
  process.exit(1);
}
h = h.replace(re, to);
fs.writeFileSync(htmlPath, h);
console.log('patched exact production CSS links');

const lh = 'node_modules/lighthouse/cli/index.js';
const out = 'site_mirror/_work/yandex-direct-lcp-qa';
const loc = 'http://127.0.0.1:8780/web-studiya/kontekstnaya-reklama/yandex-direct/';

function run(tag, form, extra = []) {
  const ud = path.join(out, `ex-chrome-${tag}`);
  fs.mkdirSync(ud, { recursive: true });
  const args = [
    lh,
    loc,
    '--quiet',
    '--output=json',
    `--output-path=${path.join(out, `ex-${tag}.json`)}`,
    '--only-categories=performance,accessibility,best-practices,seo',
    `--form-factor=${form}`,
    `--chrome-flags=--headless=new --disable-gpu --no-first-run --user-data-dir=${ud}`,
    ...extra,
  ];
  if (form === 'mobile') args.push('--screenEmulation.mobile=true');
  else {
    args.push('--screenEmulation.mobile=false');
    args.push('--screenEmulation.width=1350');
    args.push('--screenEmulation.height=940');
    args.push('--screenEmulation.deviceScaleFactor=1');
  }
  const r = spawnSync(process.execPath, args, { stdio: 'inherit' });
  if (r.status !== 0) throw new Error('lh fail ' + tag);
  const report = JSON.parse(fs.readFileSync(path.join(out, `ex-${tag}.json`), 'utf8'));
  const a = report.audits;
  const row = {
    tag,
    perf: Math.round(report.categories.performance.score * 100),
    fcp: Math.round(a['first-contentful-paint'].numericValue),
    lcp: Math.round(a['largest-contentful-paint'].numericValue),
    tbt: Math.round(a['total-blocking-time'].numericValue),
    cls: a['cumulative-layout-shift'].numericValue,
    rb: (a['render-blocking-resources']?.details?.items || []).map((x) => x.url.split('/').pop()),
    el: (a['largest-contentful-paint-element']?.details?.items?.[0]?.items?.[0]?.node?.selector || '').slice(0, 70),
  };
  console.log(JSON.stringify(row));
  return row;
}

run('d-sim', 'desktop');
run('d-prov', 'desktop', ['--throttling-method=provided']);
run('m1', 'mobile');
run('m2', 'mobile');
run('m3', 'mobile');
