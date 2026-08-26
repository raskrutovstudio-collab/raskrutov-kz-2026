const fs = require('fs');
const path = require('path');

const outDir = path.resolve('site_mirror/_work/google-ads-perf');
const runs = [];

function extract(report, i) {
  const cats = report.categories || {};
  const a = report.audits || {};
  const score = (c) => (cats[c] && typeof cats[c].score === 'number') ? Math.round(cats[c].score * 100) : null;
  const nv = (k) => (a[k] && typeof a[k].numericValue === 'number') ? a[k].numericValue : null;

  const rb = a['render-blocking-resources'];
  let renderBlocking = { score: rb ? rb.score : null, overallSavingsMs: rb && rb.details ? rb.details.overallSavingsMs : null, items: [] };
  if (rb && rb.details && Array.isArray(rb.details.items)) {
    renderBlocking.items = rb.details.items.map(it => ({ url: it.url, totalBytes: it.totalBytes, wastedMs: it.wastedMs }));
  }

  const cc = a['color-contrast'];
  let colorContrast = { score: cc ? cc.score : null, items: [] };
  if (cc && cc.details && Array.isArray(cc.details.items)) {
    colorContrast.items = cc.details.items.map(it => ({
      selector: it.node ? it.node.selector : null,
      explanation: it.node ? it.node.explanation : null
    }));
  }

  const lcpEl = a['largest-contentful-paint-element'];
  let lcpSelector = null;
  if (lcpEl && lcpEl.details && Array.isArray(lcpEl.details.items) && lcpEl.details.items[0]) {
    const first = lcpEl.details.items[0];
    if (first.items && first.items[0] && first.items[0].node) lcpSelector = first.items[0].node.selector;
  }

  // Failing accessibility audits (score < 1 and scoreDisplayMode binary/numeric)
  const a11yRefs = (cats.accessibility && cats.accessibility.auditRefs) || [];
  const a11yFailing = a11yRefs
    .map(ref => a[ref.id])
    .filter(au => au && au.score !== null && au.score < 1 && au.scoreDisplayMode !== 'manual' && au.scoreDisplayMode !== 'notApplicable' && au.scoreDisplayMode !== 'informative')
    .map(au => ({ id: au.id, title: au.title, score: au.score }));

  return {
    run: i,
    performance: score('performance'),
    accessibility: score('accessibility'),
    bestPractices: score('best-practices'),
    seo: score('seo'),
    fcp: nv('first-contentful-paint'),
    lcp: nv('largest-contentful-paint'),
    tbt: nv('total-blocking-time'),
    cls: nv('cumulative-layout-shift'),
    si: nv('speed-index'),
    lcpSelector,
    renderBlocking,
    colorContrast,
    a11yFailing
  };
}

function median(arr) {
  const s = [...arr].filter(v => typeof v === 'number').sort((a,b)=>a-b);
  if (!s.length) return null;
  const mid = Math.floor(s.length / 2);
  return s.length % 2 ? s[mid] : (s[mid-1] + s[mid]) / 2;
}

for (let i = 1; i <= 3; i++) {
  const p = path.join(outDir, 'lh-after2-' + i + '.json');
  const report = JSON.parse(fs.readFileSync(p, 'utf8'));
  if (!report.categories) {
    console.error('Run', i, 'has no categories. runtimeError:', report.runtimeError && report.runtimeError.message);
    process.exit(2);
  }
  runs.push(extract(report, i));
}

const summary = {
  url: 'http://127.0.0.1:4180/web-studiya/kontekstnaya-reklama/google-ads/',
  timestamp: new Date().toISOString(),
  formFactor: 'mobile',
  throttlingMethod: 'simulate',
  runs,
  median: {
    performance: median(runs.map(r => r.performance)),
    fcp: median(runs.map(r => r.fcp)),
    lcp: median(runs.map(r => r.lcp)),
    tbt: median(runs.map(r => r.tbt)),
    cls: median(runs.map(r => r.cls)),
    si: median(runs.map(r => r.si)),
    accessibility: median(runs.map(r => r.accessibility)),
    bestPractices: median(runs.map(r => r.bestPractices)),
    seo: median(runs.map(r => r.seo))
  }
};

fs.writeFileSync(path.join(outDir, 'after2-summary.json'), JSON.stringify(summary, null, 2), 'utf8');

// concise console table
console.log('PERF runs:', runs.map(r => r.performance).join(', '), '| median', summary.median.performance);
console.log('LCP  runs:', runs.map(r => Math.round(r.lcp)).join(', '), '| median', Math.round(summary.median.lcp));
console.log('FCP  runs:', runs.map(r => Math.round(r.fcp)).join(', '), '| median', Math.round(summary.median.fcp));
console.log('TBT  runs:', runs.map(r => Math.round(r.tbt)).join(', '), '| median', Math.round(summary.median.tbt));
console.log('CLS  runs:', runs.map(r => r.cls.toFixed(4)).join(', '), '| median', summary.median.cls.toFixed(4));
console.log('A11Y:', runs.map(r => r.accessibility).join(', '), '| BP:', runs.map(r => r.bestPractices).join(', '), '| SEO:', runs.map(r => r.seo).join(', '));
console.log('RenderBlocking run2 items:', JSON.stringify(runs[1].renderBlocking.items));
console.log('A11Y failing run2:', JSON.stringify(runs[1].a11yFailing));
console.log('LCP selector run2:', runs[1].lcpSelector);
console.log('AFTER2_SUMMARY_DONE');
