const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const outDir = path.join('site_mirror', '_work', 'google-ads-icons-qa', 'cand-alpha');
const zipDir = path.join(outDir, '_zips');
fs.mkdirSync(zipDir, { recursive: true });

const ICONS = [
  ['fa6099-travel', 'travel'],
  ['f71a3e-bag', 'bag'],
  ['1858b9-map-pin', 'map-pin'],
  ['4a4275-chart', 'chart'],
  ['5f20be-computer', 'computer'],
  ['49b6f4-target', 'target'],
  ['269bcd-gift-box', 'gift-box'],
  ['14180b-back', 'back'],
  ['b1dccf-video-cam', 'video-cam'],
];

function findFile(dir, name) {
  const out = [];
  (function walk(d) {
    for (const e of fs.readdirSync(d, { withFileTypes: true })) {
      const p = path.join(d, e.name);
      if (e.isDirectory()) walk(p);
      else if (e.name.toLowerCase() === name) out.push(p);
    }
  })(dir);
  return out;
}

function unzip(zipPath, destDir) {
  fs.mkdirSync(destDir, { recursive: true });
  execSync('tar -xf ' + JSON.stringify(path.resolve(zipPath)) + ' -C ' + JSON.stringify(path.resolve(destDir)), { stdio: 'pipe' });
}

(async () => {
  let browser;
  try { browser = await chromium.launch({ headless: true, channel: 'chrome' }); console.log('LAUNCH channel=chrome'); }
  catch (e) { browser = await chromium.launch({ headless: true }); console.log('LAUNCH bundled-chromium'); }

  const context = await browser.newContext({ acceptDownloads: true, viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();
  const signed = [];
  page.on('response', (res) => {
    const u = res.url();
    if (/object\/sign|\.zip/i.test(u)) signed.push(u);
  });

  const results = [];

  for (const [id, slug] of ICONS) {
    const zipPath = path.join(zipDir, slug + '-dynamic-all.zip');
    const extractTo = path.join(zipDir, slug + '-dynamic-all');
    let zipUrl = '';

    try {
      if (!fs.existsSync(zipPath)) {
        await page.goto('https://3dicons.co/icons/' + id, { waitUntil: 'domcontentloaded', timeout: 90000 });
        try { await page.getByRole('button', { name: /accept/i }).click({ timeout: 2500 }); } catch {}
        await page.waitForTimeout(2000);
        const dlBtn = page.locator('button.download-button').first();
        await dlBtn.click({ timeout: 15000 });
        await page.waitForTimeout(600);
        const item = page.locator('[role="menuitem"]').filter({ hasText: 'dynamic all' }).first();
        const [download] = await Promise.all([
          page.waitForEvent('download', { timeout: 40000 }),
          item.click({ timeout: 10000 }),
        ]);
        await download.saveAs(zipPath);
        zipUrl = download.url();
        console.log('ZIP ' + slug + ' bytes=' + fs.statSync(zipPath).size);
      } else {
        console.log('ZIP ' + slug + ' reused bytes=' + fs.statSync(zipPath).size);
      }

      if (!fs.existsSync(extractTo) || findFile(extractTo, 'gradient.png').length === 0) {
        unzip(zipPath, extractTo);
      }

      const hits = findFile(extractTo, 'gradient.png');
      if (!hits.length) throw new Error('gradient.png not found in zip');
      const src = hits[0];
      const dest = path.join(outDir, slug + '__gradient__dynamic.png');
      fs.copyFileSync(src, dest);
      const buf = fs.readFileSync(dest);
      results.push({
        slug, dest, bytes: buf.length,
        w: buf.readUInt32BE(16), h: buf.readUInt32BE(20), colorType: buf[25],
        zipEntry: path.relative(zipDir, src), zipUrl, status: 'OK'
      });
    } catch (e) {
      console.log('FAIL ' + slug + ': ' + e.message);
      results.push({ slug, status: 'FAIL', error: e.message });
    }
  }

  const vp = await context.newPage();
  await vp.goto('about:blank');
  for (const r of results) {
    if (r.status !== 'OK') continue;
    const b64 = fs.readFileSync(r.dest).toString('base64');
    r.cornerAlpha = await vp.evaluate(async (b64) => {
      const img = new Image();
      img.src = 'data:image/png;base64,' + b64;
      await img.decode();
      const c = document.createElement('canvas');
      c.width = img.naturalWidth; c.height = img.naturalHeight;
      const ctx = c.getContext('2d', { willReadFrequently: true });
      ctx.drawImage(img, 0, 0);
      const pts = [[0,0],[c.width-1,0],[0,c.height-1],[c.width-1,c.height-1]];
      return pts.map(function(p) { return ctx.getImageData(p[0],p[1],1,1).data[3]; });
    }, b64);
  }

  await browser.close();
  console.log('RESULTS=' + JSON.stringify(results, null, 2));
  console.log('SIGNED_SAMPLE=' + JSON.stringify([...new Set(signed)].slice(0, 12), null, 2));
})().catch(e => { console.error(e); process.exit(1); });
