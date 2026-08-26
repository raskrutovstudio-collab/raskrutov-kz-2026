const fs = require('fs');
const report = JSON.parse(fs.readFileSync('site_mirror/_work/google-ads-perf/lh-mobile-2.json','utf8'));
const a = report.audits['largest-contentful-paint-element'];
console.log('LCP audit keys', Object.keys(a||{}));
console.log('details type', a && a.details && a.details.type);
console.log(JSON.stringify(a && a.details, null, 2).slice(0, 8000));
