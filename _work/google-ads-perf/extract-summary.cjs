const fs = require('fs');
const path = require('path');

const outDir = path.resolve('site_mirror/_work/google-ads-perf');
const runs = [];

function extract(report, i) {
  const cats = report.categories || {};
  const a = report.audits || {};
  const score = (c) => (cats[c] && typeof cats[c].score === 'number') ? Math.round(cats[c].score * 100) : null;
  const nv = (k) => (a[k] && typeof a[k].numericValue === 'number') ? a[k].numericValue : null;

  let lcpElement = null;
  const lcpEl = a['largest-contentful-paint-element'];
  if (lcpEl && lcpEl.details) {
    lcpElement = {
      type: lcpEl.details.type,
      items: lcpEl.details.items || null,
      nodes: null
    };
    // try common shapes
    if (lcpEl.details.items) {
      lcpElement.summary = lcpEl.details.items.map(it => {
        const node = it.node || it;
        return {
          snippet: node.snippet || it.snippet || null,
          selector: node.selector || it.selector || null,
          nodeLabel: node.nodeLabel || it.nodeLabel || null,
          type: it.type || null
        };
      });
    }
  }
  // also check lcp-lazy-loaded
  const lazy = a['lcp-lazy-loaded'];
  const lcpLazy = lazy ? { score: lazy.score, title: lazy.title, description: lazy.description, details: lazy.details || null } : null;

  const rb = a['render-blocking-resources'];
  let renderBlocking = { score: rb ? rb.score : null, overallSavingsMs: rb && rb.details ? rb.details.overallSavingsMs : null, items: [] };
  if (rb && rb.details && Array.isArray(rb.details.items)) {
    renderBlocking.items = rb.details.items.map(it => ({
      url: it.url,
      totalBytes: it.totalBytes,
      wastedMs: it.wastedMs
    }));
  }

  const cc = a['color-contrast'];
  let colorContrast = { score: cc ? cc.score : null, items: [] };
  if (cc && cc.details && Array.isArray(cc.details.items)) {
    colorContrast.items = cc.details.items.map(it => ({
      node: it.node ? { selector: it.node.selector, snippet: it.node.snippet, explanation: it.node.explanation } : null,
      failingElement: it
    }));
  }

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
    lcpElement,
    lcpLazyLoaded: lcpLazy ? { score: lcpLazy.score, title: lcpLazy.title } : null,
    renderBlocking,
    colorContrast
  };
}

function median(arr) {
  const s = [...arr].sort((a,b)=>a-b);
  const mid = Math.floor(s.length / 2);
  return s.length % 2 ? s[mid] : (s[mid-1] + s[mid]) / 2;
}

for (let i = 1; i <= 3; i++) {
  const p = path.join(outDir, 'lh-mobile-' + i + '.json');
  const report = JSON.parse(fs.readFileSync(p, 'utf8'));
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

fs.writeFileSync(path.join(outDir, 'baseline-summary.json'), JSON.stringify(summary, null, 2), 'utf8');
console.log(JSON.stringify(summary, null, 2));
