const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');
const SRC_DIR = path.join(process.cwd(), 'site_mirror', '_work', 'google-ads-icons-qa', 'cand-alpha');
const DST_DIR = path.join(process.cwd(), 'site_mirror', 'assets', 'img', 'google-ads', '3d');
const MAP = [
  ['travel__gradient__dynamic.png', 'b2b-briefcase.webp'],
  ['bag__gradient__dynamic.png', 'ecommerce-bag.webp'],
  ['map-pin__gradient__dynamic.png', 'local-map-pin.webp'],
  ['chart__gradient__dynamic.png', 'account-chart.webp'],
  ['computer__gradient__dynamic.png', 'camp-search-screen.webp'],
  ['target__gradient__dynamic.png', 'camp-pmax-target.webp'],
  ['gift-box__gradient__dynamic.png', 'camp-shopping-box.webp'],
  ['back__gradient__dynamic.png', 'camp-remarketing-return.webp'],
  ['video-cam__gradient__dynamic.png', 'camp-video-cam.webp']
];
(async () => {
  const browser = await chromium.launch({ channel: 'chrome' });
  const page = await browser.newPage();
  await page.setContent('<!doctype html><html><body></body></html>');
  console.log('dest | current(KB) | q0.90(KB) | maxRGBAdelta | meanRGBAdelta');
  for (const [srcName, dstName] of MAP) {
    const srcB64 = fs.readFileSync(path.join(SRC_DIR, srcName)).toString('base64');
    const curB64 = fs.readFileSync(path.join(DST_DIR, dstName)).toString('base64');
    const out = await page.evaluate(async (a) => {
      const load = (u) => new Promise((res, rej) => { const i = new Image(); i.onload = () => res(i); i.onerror = rej; i.src = u; });
      const ref = await load('data:image/png;base64,' + a.srcB64);
      const c = document.createElement('canvas'); c.width = 256; c.height = 256;
      const ctx = c.getContext('2d', { willReadFrequently: true });
      ctx.imageSmoothingEnabled = true; ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(ref, 0, 0, 256, 256);
      const refData = ctx.getImageData(0, 0, 256, 256).data;
      const q90blob = await new Promise((r) => c.toBlob(r, 'image/webp', 0.90));
      const q90size = q90blob.size;
      const q90url = URL.createObjectURL(q90blob);
      const measure = async (url) => {
        const im = await load(url);
        const c2 = document.createElement('canvas'); c2.width = 256; c2.height = 256;
        const x2 = c2.getContext('2d', { willReadFrequently: true });
        x2.clearRect(0, 0, 256, 256); x2.drawImage(im, 0, 0);
        const d = x2.getImageData(0, 0, 256, 256).data;
        let max = 0, sum = 0;
        for (let i = 0; i < d.length; i++) { const dv = Math.abs(d[i] - refData[i]); if (dv > max) max = dv; sum += dv; }
        return { max, mean: +(sum / d.length).toFixed(2) };
      };
      const cur = await measure('data:image/webp;base64,' + a.curB64);
      const q90 = await measure(q90url);
      return { q90size, cur, q90 };
    }, { srcB64, curB64 });
    const curSize = fs.statSync(path.join(DST_DIR, dstName)).size;
    console.log([dstName, (curSize / 1024).toFixed(1), (out.q90size / 1024).toFixed(1),
      'cur ' + out.cur.max + ' / q90 ' + out.q90.max,
      'cur ' + out.cur.mean + ' / q90 ' + out.q90.mean].join(' | '));
  }
  await browser.close();
})().catch((e) => { console.error(e); process.exit(1); });
