const { spawnSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const url = 'http://127.0.0.1:4180/web-studiya/kontekstnaya-reklama/google-ads/';
const outDir = path.resolve('site_mirror/_work/google-ads-perf');
const lhBin = path.resolve('node_modules/lighthouse/cli/index.js');
const userData = path.join(outDir, 'tmp-chrome', 'ud2');

function runOnce(i) {
  const out = path.join(outDir, 'lh-after2-' + i + '.json');
  console.log('RUN', i, '->', out);
  const args = [
    lhBin, url,
    '--only-categories=performance,accessibility,best-practices,seo',
    '--form-factor=mobile',
    '--screenEmulation.mobile=true',
    '--throttling-method=simulate',
    '--output=json',
    '--output-path=' + out,
    '--chrome-flags=--headless --no-sandbox --user-data-dir=' + userData + '-' + i,
    '--quiet'
  ];
  const r = spawnSync(process.execPath, args, { stdio: 'inherit', windowsHide: true, env: process.env });
  if (!fs.existsSync(out)) {
    console.error('Missing output for run', i, 'status', r.status);
    process.exit(1);
  }
  console.log('OK run', i, 'bytes', fs.statSync(out).size, 'status', r.status);
  return out;
}

for (let i = 1; i <= 3; i++) runOnce(i);
console.log('ALL_LH_AFTER2_DONE');
