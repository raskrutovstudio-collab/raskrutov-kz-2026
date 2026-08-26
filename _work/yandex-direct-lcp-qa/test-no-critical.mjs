import fs from 'node:fs';
import { spawnSync } from 'node:child_process';
import path from 'node:path';

const htmlPath = 'site_mirror/web-studiya/kontekstnaya-reklama/yandex-direct/index.html';
let h = fs.readFileSync(htmlPath, 'utf8');
const before = h;
h = h.replace(/<style id="yd-critical"[^>]*>[\s\S]*?<\/style>\s*/, '');
if (h === before) {
  console.error('critical not removed');
  process.exit(1);
}
fs.writeFileSync(htmlPath, h);
console.log('removed yd-critical; html delta', before.length - h.length);

const lh = 'node_modules/lighthouse/cli/index.js';
const out = 'site_mirror/_work/yandex-direct-lcp-qa';
const loc = 'http://127.0.0.1:8780/web-studiya/kontekstnaya-reklama/yandex-direct/';

function run(tag, form, extra = []) {
  const ud = path.join(out, `nocrit-chrome-${tag}`);
  fs.mkdirSync(ud, { recursive: true });
  const args = [
    lh,
    loc,
    '--quiet',
    '--output=json',
    `--output-path=${path.join(out, `nocrit-${tag}.json`)}`,
    '--only-categories=performance',
    `--form-factor=${form}`,
    `--chrome-flags=--headless=new --disable-gpu --no-first-run --user-data-dir=${ud}`,
    ...extra,
  ];
  if (form === 'mobile') args.push('--screenEmulation.mobile=true');
  else {
    args.push('--screenEmulation.mobile=false', '--screenEmulation.width=1350', '--screenEmulation.height=940', '--screenEmulation.deviceScaleFactor=1');
  }
  spawnSync(process.execPath, args, { stdio: 'inherit' });
  const report = JSON.parse(fs.readFileSync(path.join(out, `nocrit-${tag}.json`), 'utf8'));
  const a = report.audits;
  console.log(
    JSON.stringify({
      tag,
      perf: Math.round(report.categories.performance.score * 100),
      fcp: Math.round(a['first-contentful-paint'].numericValue),
      lcp: Math.round(a['largest-contentful-paint'].numericValue),
      tbt: Math.round(a['total-blocking-time'].numericValue),
      cls: a['cumulative-layout-shift'].numericValue,
    })
  );
}

run('d-prov', 'desktop', ['--throttling-method=provided']);
run('d-sim', 'desktop');
run('m1', 'mobile');
