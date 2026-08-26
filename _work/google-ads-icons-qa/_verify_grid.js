const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');
const DST = path.join(process.cwd(), 'site_mirror', 'assets', 'img', 'google-ads', '3d');
const SVG = path.join(process.cwd(), 'site_mirror', 'assets', 'img', 'google-ads', 'google-ads-icon.svg');
const files = ['b2b-briefcase.webp','ecommerce-bag.webp','local-map-pin.webp','account-chart.webp','camp-search-screen.webp','camp-pmax-target.webp','camp-shopping-box.webp','camp-remarketing-return.webp','camp-video-cam.webp'];
(async () => {
  const browser = await chromium.launch({ channel: 'chrome' });
  const page = await browser.newPage({ viewport: { width: 1000, height: 780 }, deviceScaleFactor: 2 });
  const cells = files.map((f) => {
    const b64 = fs.readFileSync(path.join(DST, f)).toString('base64');
    const kb = (fs.statSync(path.join(DST, f)).size / 1024).toFixed(1);
    return '<figure><img src="data:image/webp;base64,' + b64 + '" width="256" height="256" alt="' + f + '"><figcaption>' + f + ' &middot; ' + kb + ' KB</figcaption></figure>';
  }).join('');
  const svgB64 = fs.readFileSync(SVG).toString('base64');
  const html = '<!doctype html><meta charset="utf-8"><style>' +
    'body{margin:0;font:12px/1.4 system-ui;background:#111;color:#eee}' +
    '.grid{display:grid;grid-template-columns:repeat(5,1fr);gap:8px;padding:10px}' +
    'figure{margin:0;text-align:center}' +
    'img{width:170px;height:170px;background-image:linear-gradient(45deg,#888 25%,transparent 25%),linear-gradient(-45deg,#888 25%,transparent 25%),linear-gradient(45deg,transparent 75%,#888 75%),linear-gradient(-45deg,transparent 75%,#888 75%);background-size:16px 16px;background-position:0 0,0 8px,8px -8px,-8px 0}' +
    'figcaption{margin-top:4px}' +
    '.svgcell img{width:170px;height:170px;object-fit:contain;background:#fff}' +
    '</style><div class="grid">' + cells +
    '<figure class="svgcell"><img src="data:image/svg+xml;base64,' + svgB64 + '" alt="google ads icon"><figcaption>google-ads-icon.svg &middot; 799 B</figcaption></figure>' +
    '</div>';
  await page.setContent(html);
  await page.waitForTimeout(400);
  const out = path.join(process.cwd(), 'site_mirror', '_work', 'google-ads-icons-qa', '_verify_alpha_grid.png');
  await page.locator('.grid').screenshot({ path: out });
  const bad = await page.evaluate(() => Array.from(document.images).filter((i) => !i.complete || i.naturalWidth === 0).map((i) => i.alt));
  console.log('broken images: ' + JSON.stringify(bad));
  console.log('screenshot: ' + out);
  await browser.close();
})().catch((e) => { console.error(e); process.exit(1); });
