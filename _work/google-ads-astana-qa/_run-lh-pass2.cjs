/**
 * One Lighthouse mobile run — extract BP audits score < 1 + render-blocking
 */
const { spawnSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const OUT = path.resolve(__dirname);
const URL = 'http://127.0.0.1:4180/web-studiya/kontekstnaya-reklama/google-ads/astana/';
const lhJson = path.join(OUT, 'lh-mobile-pass2.json');
const diagPath = path.join(OUT, 'perf-pass2-diag.json');

const lhCli = path.resolve(
  __dirname,
  '../../../node_modules/lighthouse/cli/index.js'
);

const args = [
  lhCli,
  URL,
  '--quiet',
  '--output=json',
  `--output-path=${lhJson}`,
  '--only-categories=performance,accessibility,best-practices,seo',
  '--form-factor=mobile',
  '--screenEmulation.mobile=true',
  '--throttling-method=simulate',
  '--chrome-flags=--headless --no-sandbox --disable-gpu',
];

console.log('Running lighthouse...');
const run = spawnSync(process.execPath, args, {
  stdio: 'inherit',
  cwd: path.resolve(__dirname, '../../..'),
  env: process.env,
});
if (run.status !== 0) {
  console.error('lighthouse exit', run.status, run.error);
  process.exit(run.status || 1);
}

const report = JSON.parse(fs.readFileSync(lhJson, 'utf8'));
const cats = report.categories || {};
const scores = {
  performance: Math.round((cats.performance?.score || 0) * 100),
  accessibility: Math.round((cats.accessibility?.score || 0) * 100),
  bestPractices: Math.round((cats['best-practices']?.score || 0) * 100),
  seo: Math.round((cats.seo?.score || 0) * 100),
};

const metrics = {
  fcp: report.audits['first-contentful-paint']?.numericValue,
  lcp: report.audits['largest-contentful-paint']?.numericValue,
  tbt: report.audits['total-blocking-time']?.numericValue,
  cls: report.audits['cumulative-layout-shift']?.numericValue,
  si: report.audits['speed-index']?.numericValue,
  tti: report.audits['interactive']?.numericValue,
};

// Best practices audits with score < 1
const bpRef = cats['best-practices']?.auditRefs || [];
const bpFailed = [];
for (const ref of bpRef) {
  const a = report.audits[ref.id];
  if (!a) continue;
  const score = a.score;
  // score null = manual/informative; include only numeric score < 1
  if (typeof score === 'number' && score < 1) {
    const urls = [];
    const details = a.details;
    if (details?.items) {
      for (const item of details.items) {
        if (item.url) urls.push(item.url);
        if (item.node?.snippet) urls.push(item.node.snippet.slice(0, 120));
        if (item.source?.url) urls.push(item.source.url);
        if (item.href) urls.push(item.href);
      }
    }
    bpFailed.push({
      id: a.id,
      title: a.title,
      description: (a.description || '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 280),
      score,
      displayValue: a.displayValue || null,
      detailsUrls: [...new Set(urls)].slice(0, 30),
      detailsType: details?.type || null,
      itemCount: details?.items?.length ?? 0,
    });
  }
}

const rbr = report.audits['render-blocking-resources'];
const renderBlocking = rbr
  ? {
      id: rbr.id,
      title: rbr.title,
      score: rbr.score,
      displayValue: rbr.displayValue || null,
      description: (rbr.description || '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 280),
      items: (rbr.details?.items || []).map((it) => ({
        url: it.url,
        totalBytes: it.totalBytes,
        wastedMs: it.wastedMs,
      })),
      overallSavingsMs: rbr.details?.overallSavingsMs ?? null,
      overallSavingsBytes: rbr.details?.overallSavingsBytes ?? null,
    }
  : null;

const sectionF = {
  scores,
  metrics,
  bestPracticesFailed: bpFailed,
  renderBlockingResources: renderBlocking,
  lighthouseVersion: report.lighthouseVersion,
  fetchTime: report.fetchTime,
};

// Merge into perf-pass2-diag.json
let diag = {};
if (fs.existsSync(diagPath)) {
  diag = JSON.parse(fs.readFileSync(diagPath, 'utf8'));
}

// Section A file sizes
const root = path.resolve(__dirname, '../../..');
function sz(rel) {
  const p = path.join(root, rel);
  return fs.statSync(p).size;
}
diag.sectionA = {
  'home-clean.css': sz('site_mirror/assets/css/home-clean.css'),
  'kontekst-clean.css': sz('site_mirror/assets/css/kontekst-clean.css'),
  'google-ads-page.css': sz('site_mirror/assets/css/google-ads-page.css'),
  'lead-forms.css': sz('site_mirror/assets/css/lead-forms.css'),
  'montserrat_bold.woff2': sz(
    'site_mirror/assets/m-files.cdn1.cc/web/user/fonts/montserrat/montserrat_bold.woff2'
  ),
  'montserrat_normal.woff2': sz(
    'site_mirror/assets/m-files.cdn1.cc/web/user/fonts/montserrat/montserrat_normal.woff2'
  ),
  'astana/index.html': sz(
    'site_mirror/web-studiya/kontekstnaya-reklama/google-ads/astana/index.html'
  ),
};

diag.sectionE = {
  gzipStaticServerFound: true,
  primaryScript: '_tmp_gzip_serve.mjs',
  details: {
    description:
      'Node http.createServer over site_mirror; zlib.gzip every response; sets Content-Encoding: gzip; default PORT 8765 (env PORT override).',
    alwaysGzip: true,
    note: 'Current audit server on :4180 returned no Content-Encoding (uncompressed). Gzip script is available but not the process serving :4180.',
  },
  otherFindings: [
    'docs/HANDOFF-PERF.md notes prod gzip/brotli works',
    'PERFORMANCE_OPTIMIZATION_PLAN.md recommends gzip/brotli server config',
    'No express/sirv/compression middleware found in package scripts',
    'package.json has no gzip serve script; only _tmp_gzip_serve.mjs at repo root',
  ],
};

diag.sectionF = sectionF;
diag.lighthouseRawPath = lhJson;
diag.mergedAt = new Date().toISOString();

fs.writeFileSync(diagPath, JSON.stringify(diag, null, 2));
fs.writeFileSync(
  path.join(OUT, 'lh-mobile-pass2-extract.json'),
  JSON.stringify(sectionF, null, 2)
);

console.log(
  JSON.stringify(
    {
      scores,
      metrics,
      bpFailedCount: bpFailed.length,
      bpFailedIds: bpFailed.map((x) => x.id),
      renderBlockingItems: renderBlocking?.items?.length ?? 0,
      wrote: diagPath,
    },
    null,
    2
  )
);
