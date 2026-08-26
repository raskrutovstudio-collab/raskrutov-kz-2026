const fs = require('fs');
const path = require('path');
const outDir = path.resolve('site_mirror/_work/google-ads-perf');
const report = JSON.parse(fs.readFileSync(path.join(outDir, 'lh-after2-2.json'), 'utf8'));
const cats = report.categories.accessibility;
const a = report.audits;
console.log('Accessibility score:', Math.round(cats.score * 100));
for (const ref of cats.auditRefs) {
  const au = a[ref.id];
  if (au && au.score !== null && au.score < 1 && !['manual','notApplicable','informative'].includes(au.scoreDisplayMode)) {
    console.log('\nFAIL:', au.id, '-', au.title);
    const items = (au.details && au.details.items) || [];
    items.slice(0, 12).forEach((it, idx) => {
      const node = it.node || it;
      console.log('  ['+idx+']', node.selector || '(n/a)');
      if (node.snippet) console.log('       snippet:', node.snippet.slice(0, 160));
      if (node.explanation) console.log('       why:', node.explanation.replace(/\s+/g, ' ').slice(0, 200));
    });
  }
}
