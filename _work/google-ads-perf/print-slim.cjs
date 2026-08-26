const fs = require('fs');
const s = JSON.parse(fs.readFileSync('site_mirror/_work/google-ads-perf/baseline-summary.json','utf8'));
const slim = {
  median: s.median,
  runs: s.runs.map(r => ({
    run: r.run,
    performance: r.performance,
    accessibility: r.accessibility,
    bestPractices: r.bestPractices,
    seo: r.seo,
    fcp: r.fcp,
    lcp: r.lcp,
    tbt: r.tbt,
    cls: r.cls,
    si: r.si,
    lcpElement: r.lcpElement && r.lcpElement.summary,
    renderBlocking: r.renderBlocking,
    colorContrastScore: r.colorContrast && r.colorContrast.score,
    colorContrastItems: ((r.colorContrast && r.colorContrast.items) || []).slice(0, 30).map(x => ({
      selector: x.node && x.node.selector,
      snippet: x.node && x.node.snippet,
      explanation: x.node && x.node.explanation
    }))
  }))
};
fs.writeFileSync('site_mirror/_work/google-ads-perf/baseline-slim.json', JSON.stringify(slim, null, 2));
console.log(JSON.stringify(slim, null, 2));
