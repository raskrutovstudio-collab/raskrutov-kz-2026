import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const lhCli = path.join(process.cwd(), 'node_modules/lighthouse/cli/index.js');
const origin = process.env.LH_ORIGIN || 'http://127.0.0.1:8768';
const outDir = path.resolve('site_mirror/_work/google-ads-batch3-qa');
const slugs = (process.env.LH_SLUGS || 'kyzylorda,petropavlovsk').split(',');
const runsPer = Number(process.env.LH_DIAG_RUNS || 2);

function pickLcp(audits) {
  const a = audits['largest-contentful-paint-element'];
  const items = a?.details?.items || [];
  const first = items[0];
  const node = first?.items?.[0]?.node || first?.node || null;
  return {
    display: a?.displayValue || '',
    snippet: node?.snippet || node?.nodeLabel || '',
    selector: node?.selector || '',
    type: first?.type || '',
  };
}

function table(audit) {
  return (audit?.details?.items || []).slice(0, 12).map((item) => {
    const out = {};
    for (const [k, v] of Object.entries(item)) {
      if (typeof v === 'number' || typeof v === 'string') out[k] = v;
      if (k === 'entity' && v && typeof v === 'object') out.entity = v.text || v.name || v.url || v;
      if (k === 'url' && typeof v === 'string') out.url = v.replace(origin, '');
    }
    return out;
  });
}

function runOnce(url, label) {
  const out = path.join(os.tmpdir(), `gads-b3-diag-${label}-${Date.now()}.json`);
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
  if (run.status !== 0) throw new Error(`lh fail ${url} ${run.status}`);
  const report = JSON.parse(fs.readFileSync(out, 'utf8'));
  fs.unlinkSync(out);
  const a = report.audits;
  const net = (a['network-requests']?.details?.items || []).map((n) => ({
    url: String(n.url || '').replace(origin, '').slice(0, 140),
    mime: n.mimeType,
    transfer: n.transferSize,
    resource: n.resourceSize,
    start: Math.round(n.networkRequestTime || n.startTime || 0),
    end: Math.round(n.networkEndTime || 0),
    protocol: n.protocol,
  }));
  const thirdPartyNet = net.filter((n) => /^https?:/.test(n.url) && !n.url.startsWith('/'));
  return {
    url,
    performance: Math.round(report.categories.performance.score * 100),
    fcp: Math.round(a['first-contentful-paint'].numericValue),
    lcp: Math.round(a['largest-contentful-paint'].numericValue),
    si: Math.round(a['speed-index'].numericValue),
    tbt: Math.round(a['total-blocking-time'].numericValue),
    cls: a['cumulative-layout-shift'].numericValue,
    tti: Math.round(a.interactive?.numericValue || 0),
    lcpElement: pickLcp(a),
    renderBlocking: table(a['render-blocking-resources']),
    unusedCss: table(a['unused-css-rules']).map((x) => ({ url: x.url, wastedBytes: x.wastedBytes, totalBytes: x.totalBytes })),
    bootup: table(a['bootup-time']),
    mainthread: table(a['mainthread-work-breakdown']),
    thirdParty: table(a['third-party-summary']),
    unusedJs: table(a['unused-javascript']),
    fonts: table(a['font-display']),
    longTasks: table(a['long-tasks']),
    network: net,
    thirdPartyNet,
  };
}

const results = {};
for (const slug of slugs) {
  const url = `${origin}/web-studiya/kontekstnaya-reklama/google-ads/${slug}/`;
  results[slug] = [];
  for (let i = 1; i <= runsPer; i++) {
    console.log(`DIAG ${slug} ${i}`);
    results[slug].push(runOnce(url, `${slug}-${i}`));
    const r = results[slug][i - 1];
    console.log(
      JSON.stringify({
        slug,
        i,
        perf: r.performance,
        fcp: r.fcp,
        lcp: r.lcp,
        si: r.si,
        tbt: r.tbt,
        lcpEl: r.lcpElement,
        third: r.thirdParty,
        bootup: r.bootup,
        blocking: r.renderBlocking,
      }),
    );
  }
}

const dest = path.join(outDir, 'perf-diag.json');
fs.writeFileSync(dest, JSON.stringify(results, null, 2));
console.log('wrote', dest);
