const { spawnSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const url = 'http://127.0.0.1:4180/web-studiya/kontekstnaya-reklama/google-ads/';
const outDir = path.resolve('site_mirror/_work/google-ads-perf');
const lhBin = path.resolve('node_modules/lighthouse/cli/index.js');

function runOnce(i) {
  const out = path.join(outDir, 'lh-mobile-' + i + '.json');
  console.log('RUN', i, '->', out);
  const args = [
    lhBin, url,
    '--only-categories=performance,accessibility,best-practices,seo',
    '--form-factor=mobile',
    '--screenEmulation.mobile=true',
    '--throttling-method=simulate',
    '--output=json',
    '--output-path=' + out,
    '--chrome-flags=--headless --no-sandbox',
    '--quiet'
  ];
  const r = spawnSync(process.execPath, args, { stdio: 'inherit', windowsHide: true });
  if (r.status !== 0) {
    console.error('Lighthouse failed run', i, 'status', r.status);
    process.exit(r.status || 1);
  }
  return out;
}

for (let i = 1; i <= 3; i++) runOnce(i);
console.log('ALL_LH_DONE');
