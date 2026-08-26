import fs from 'node:fs';
import { spawnSync } from 'node:child_process';
import path from 'node:path';

const htmlPath = 'site_mirror/web-studiya/kontekstnaya-reklama/yandex-direct/index.html';
let h = fs.readFileSync(htmlPath, 'utf8');

// 1) Production-like font preloads (no media)
h = h.replace(
  /<link rel="preload" href="\.\.\/\.\.\/\.\.\/assets\/m-files\.cdn1\.cc\/web\/user\/fonts\/montserrat\/montserrat_normal\.woff2"[^>]*>\s*<link rel="preload" href="\.\.\/\.\.\/\.\.\/assets\/m-files\.cdn1\.cc\/web\/user\/fonts\/montserrat\/montserrat_normal\.woff2"[^>]*>\s*<link rel="preload" href="\.\.\/\.\.\/\.\.\/assets\/m-files\.cdn1\.cc\/web\/user\/fonts\/montserrat\/montserrat_bold\.woff2"[^>]*>/,
  `<link rel="preload" href="../../../assets/m-files.cdn1.cc/web/user/fonts/montserrat/montserrat_normal.woff2" as="font" type="font/woff2" crossorigin>
  <link rel="preload" href="../../../assets/m-files.cdn1.cc/web/user/fonts/montserrat/montserrat_bold.woff2" as="font" type="font/woff2" crossorigin>`
);

// 2) Remove yd-prod-critical block entirely (use production tiny style instead)
h = h.replace(/<style id="yd-prod-critical">[\s\S]*?<\/style>\s*/, '');

// 3) Ensure production tiny style exists after noscript (if missing)
if (!h.includes('yd-page .ctx-hero__title,.yd-page .ctx-hero__sub,.yd-page .ctx-hero__lead{visibility:visible')) {
  h = h.replace(
    '</noscript>',
    `</noscript>
  <style>
    .rk-form--contacts .rk-consent--contacts{margin:0 0 15px;font-size:12px;line-height:1.4}
    .rk-form--contacts .rk-consent--contacts input{width:18px;height:18px}
    .yd-page .ctx-hero__title,.yd-page .ctx-hero__sub,.yd-page .ctx-hero__lead{visibility:visible;opacity:1}
    .yd-page .ctx-hero__lead{margin:0 0 20px;max-width:54ch;font-size:16px;line-height:1.55;color:#3a3a3a;font-weight:400}
    .yd-page .yd-hero-price{display:flex;flex-wrap:wrap;align-items:center;gap:8px 10px;width:fit-content;max-width:100%;box-sizing:border-box;margin:0 0 14px;padding:8px 14px;border-radius:14px;font-size:14px;line-height:1.35;background:#fff5f2;border:1px solid rgba(252,63,29,.18)}
    .yd-page .yd-hero-price__value{font-weight:700;color:#2f2740}
    .yd-page .yd-hero-price__note{color:#5c5468}
    .yd-page .yd-trust-strip{display:flex;flex-wrap:wrap;gap:8px;margin:4px 0 0}
    .yd-page .yd-trust-strip__item{display:inline-flex;align-items:center;gap:8px;padding:8px 12px;border-radius:12px;background:#f4f2f7;font-size:13px;line-height:1.3;color:#2f2740}
    .yd-page .yd-trust-strip__item svg{width:18px;height:18px;color:#fc3f1d;flex:0 0 auto}
    .yd-page .yd-hero-visual{margin:0}
    .yd-page .yd-hero-visual__caption{margin:8px 0 0;font-size:12px;line-height:1.4;color:#6b6478}
  </style>`
  );
}

fs.writeFileSync(htmlPath, h);
console.log('aligned fonts + production tiny style; removed yd-prod-critical');
console.log('yd-critical?', h.includes('id="yd-critical"'));
console.log('blocking home?', /home-clean\.css\?v=39">/.test(h));

const lh = 'node_modules/lighthouse/cli/index.js';
const out = 'site_mirror/_work/yandex-direct-lcp-qa';
const loc = 'http://127.0.0.1:8780/web-studiya/kontekstnaya-reklama/yandex-direct/';

function run(tag, form, extra = []) {
  const ud = path.join(out, `align-chrome-${tag}`);
  fs.mkdirSync(ud, { recursive: true });
  const args = [
    lh,
    loc,
    '--quiet',
    '--output=json',
    `--output-path=${path.join(out, `align-${tag}.json`)}`,
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
  const report = JSON.parse(fs.readFileSync(path.join(out, `align-${tag}.json`), 'utf8'));
  const a = report.audits;
  console.log(
    JSON.stringify({
      tag,
      perf: Math.round(report.categories.performance.score * 100),
      fcp: Math.round(a['first-contentful-paint'].numericValue),
      lcp: Math.round(a['largest-contentful-paint'].numericValue),
      tbt: Math.round(a['total-blocking-time'].numericValue),
      cls: a['cumulative-layout-shift'].numericValue,
      el: (a['largest-contentful-paint-element']?.details?.items?.[0]?.items?.[0]?.node?.selector || '').slice(0, 60),
    })
  );
}

run('d-prov', 'desktop', ['--throttling-method=provided']);
run('d-sim', 'desktop');
run('m1', 'mobile');
