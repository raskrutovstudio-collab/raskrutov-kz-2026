import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const lhCli = path.join(process.cwd(), 'node_modules/lighthouse/cli/index.js');
const ORIGIN = process.env.QA_ORIGIN || 'http://127.0.0.1:8791';
const city = process.env.LH_CITY || 'aktobe';
const url = ORIGIN + '/web-studiya/kontekstnaya-reklama/yandex-direct/' + city + '/';
const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

const out = path.join(os.tmpdir(), 'lh-attr-' + city + '-' + Date.now() + '.json');
const args = [lhCli, url, '--quiet', '--output=json', '--output-path=' + out,
  '--only-categories=performance',
  '--throttling-method=devtools',
  '--form-factor=mobile', '--screenEmulation.mobile=true',
  '--chrome-flags=--headless=new --disable-gpu --no-sandbox'];
if (fs.existsSync(CHROME)) args.push('--chrome-path=' + CHROME);
spawnSync(process.execPath, args, { stdio: 'ignore' });

const rep = JSON.parse(fs.readFileSync(out, 'utf8'));
fs.unlinkSync(out);
const a = rep.audits;

console.log(city.toUpperCase(), 'perf', Math.round(rep.categories.performance.score * 100), 'tbt', Math.round(a['total-blocking-time'].numericValue));

console.log('\n-- bootup-time (JS execution per script) --');
for (const it of a['bootup-time']?.details?.items || []) {
  console.log(`  ${Math.round(it.total)}ms  (script ${Math.round(it.scripting)} / parse ${Math.round(it.scriptParseCompile)})  ${it.url}`);
}

console.log('\n-- third-party-summary --');
for (const it of a['third-party-summary']?.details?.items || []) {
  console.log(`  block ${Math.round(it.blockingTime)}ms  main ${Math.round(it.mainThreadTime)}ms  ${it.entity?.text || it.entity}`);
}

console.log('\n-- long tasks --');
for (const it of (a['long-tasks']?.details?.items || []).slice(0, 10)) {
  console.log(`  ${Math.round(it.duration)}ms  ${it.url}`);
}

console.log('\n-- mainthread-work-breakdown --');
for (const it of a['mainthread-work-breakdown']?.details?.items || []) {
  console.log(`  ${Math.round(it.duration)}ms  ${it.group}`);
}
