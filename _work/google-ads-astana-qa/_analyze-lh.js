const fs = require('fs');
const j = JSON.parse(fs.readFileSync('site_mirror/_work/google-ads-astana-qa/lh-mobile-1.json', 'utf8'));
const ts = j.audits['target-size'];
console.log('TARGET-SIZE score', ts.score);
console.log(JSON.stringify(ts.details && ts.details.items ? ts.details.items.slice(0, 20) : ts, null, 2));
console.log('---PERF OPP---');
for (const id of ['render-blocking-resources','unused-css-rules','unused-javascript','modern-image-formats','uses-responsive-images','total-byte-weight','bootup-time','mainthread-work-breakdown','lcp-lazy-loaded','prioritize-lcp-image','font-display','server-response-time','network-server-latency','uses-text-compression','dom-size']) {
  const a = j.audits[id];
  if (!a) continue;
  if (a.score !== null && a.score < 1) {
    console.log(id, 'score', a.score, a.displayValue || '', '|', a.title);
    if (a.details && a.details.items) {
      console.log(JSON.stringify(a.details.items.slice(0, 6), null, 2).slice(0, 900));
    }
  }
}
const lcpEl = j.audits['largest-contentful-paint-element'];
console.log('---LCP ELEMENT---');
console.log(JSON.stringify(lcpEl && lcpEl.details && lcpEl.details.items, null, 2).slice(0, 1500));
console.log('---BP/A11Y binary fails---');
for (const [id, a] of Object.entries(j.audits)) {
  if (a.score !== null && a.score < 1 && a.scoreDisplayMode === 'binary') {
    console.log(id, '|', a.title);
  }
}
