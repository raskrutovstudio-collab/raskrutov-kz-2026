const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');

const ROOT = process.cwd();
const SRC_DIR = path.join(ROOT, 'site_mirror', '_work', 'google-ads-icons-qa', 'cand-alpha');
const DST_DIR = path.join(ROOT, 'site_mirror', 'assets', 'img', 'google-ads', '3d');

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

const MAX_HARD = 28 * 1024;
const MAX_PREF = 25 * 1024;
const MIN_PREF = 15 * 1024;

async function encode(page, dataUrl, quality) {
  return await page.evaluate(async (args) => {
    const img = new Image();
    img.decoding = 'sync';
    await new Promise((res, rej) => {
      img.onload = res;
      img.onerror = rej;
      img.src = args.dataUrl;
    });
    const c = document.createElement('canvas');
    c.width = 256;
    c.height = 256;
    const ctx = c.getContext('2d', { alpha: true });
    ctx.clearRect(0, 0, 256, 256);
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(img, 0, 0, 256, 256);
    const blob = await new Promise((res) => c.toBlob(res, 'image/webp', args.quality));
    const buf = new Uint8Array(await blob.arrayBuffer());
    let bin = '';
    for (let i = 0; i < buf.length; i++) bin += String.fromCharCode(buf[i]);
    return { type: blob.type, b64: btoa(bin), size: buf.length, srcW: img.naturalWidth, srcH: img.naturalHeight };
  }, { dataUrl, quality });
}

async function verify(page, fileB64) {
  return await page.evaluate(async (b64) => {
    const img = new Image();
    await new Promise((res, rej) => {
      img.onload = res;
      img.onerror = rej;
      img.src = 'data:image/webp;base64,' + b64;
    });
    const c = document.createElement('canvas');
    c.width = img.naturalWidth;
    c.height = img.naturalHeight;
    const ctx = c.getContext('2d', { alpha: true, willReadFrequently: true });
    ctx.clearRect(0, 0, c.width, c.height);
    ctx.drawImage(img, 0, 0);
    const px = (x, y) => Array.from(ctx.getImageData(x, y, 1, 1).data);
    const corners = [px(0, 0), px(c.width - 1, 0), px(0, c.height - 1), px(c.width - 1, c.height - 1)];
    const center = px(Math.floor(c.width / 2), Math.floor(c.height / 2));
    let maxA = 0, minA = 255;
    const d = ctx.getImageData(0, 0, c.width, c.height).data;
    let transparentCount = 0;
    for (let i = 3; i < d.length; i += 4) {
      const a = d[i];
      if (a > maxA) maxA = a;
      if (a < minA) minA = a;
      if (a === 0) transparentCount++;
    }
    return {
      w: img.naturalWidth,
      h: img.naturalHeight,
      cornerAlphas: corners.map((p) => p[3]),
      centerAlpha: center[3],
      centerRGB: center.slice(0, 3),
      minAlpha: minA,
      maxAlpha: maxA,
      transparentPct: +(100 * transparentCount / (c.width * c.height)).toFixed(1)
    };
  }, fileB64);
}

(async () => {
  const browser = await chromium.launch({ channel: 'chrome' });
  const page = await browser.newPage();
  await page.setContent('<!doctype html><html><body></body></html>');

  const rows = [];
  for (const [srcName, dstName] of MAP) {
    const srcPath = path.join(SRC_DIR, srcName);
    const dstPath = path.join(DST_DIR, dstName);
    const dataUrl = 'data:image/png;base64,' + fs.readFileSync(srcPath).toString('base64');

    const cands = [];
    const seen = new Set();
    const tryQ = async (q) => {
      q = Math.round(q * 100) / 100;
      if (seen.has(q)) return null;
      seen.add(q);
      const r = await encode(page, dataUrl, q);
      if (r.type !== 'image/webp') throw new Error('not webp: ' + r.type);
      const rec = { q, size: r.size, b64: r.b64, srcW: r.srcW, srcH: r.srcH };
      cands.push(rec);
      return rec;
    };

    let r = await tryQ(0.82);
    let q = 0.82;
    while (r.size > MAX_PREF && q > 0.55) {
      q = Math.round((q - 0.04) * 100) / 100;
      r = await tryQ(q);
    }
    await tryQ(0.90);
    let best = cands.filter((c) => c.size <= MAX_HARD);
    let inBand = best.filter((c) => c.size >= MIN_PREF && c.size <= MAX_PREF);
    if (inBand.length === 0 && Math.max(...cands.map((c) => c.size)) < MIN_PREF) {
      for (const extra of [0.94, 0.97, 0.99]) {
        const rr = await tryQ(extra);
        if (rr && rr.size >= MIN_PREF) break;
      }
      best = cands.filter((c) => c.size <= MAX_HARD);
      inBand = best.filter((c) => c.size >= MIN_PREF && c.size <= MAX_PREF);
    }
    let chosen;
    if (inBand.length) {
      chosen = inBand.sort((a, b) => a.size - b.size)[0];
    } else {
      const under = best.filter((c) => c.size <= MAX_PREF);
      chosen = (under.length ? under : best).sort((a, b) => b.size - a.size)[0];
    }

    fs.writeFileSync(dstPath, Buffer.from(chosen.b64, 'base64'));
    const onDisk = fs.readFileSync(dstPath);
    const v = await verify(page, onDisk.toString('base64'));
    rows.push({
      dest: dstName,
      src: srcName,
      srcSize: chosen.srcW + 'x' + chosen.srcH,
      bytes: onDisk.length,
      kb: +(onDisk.length / 1024).toFixed(1),
      quality: chosen.q,
      wh: v.w + 'x' + v.h,
      cornerAlpha: v.cornerAlphas.join(','),
      centerAlpha: v.centerAlpha,
      transparentPct: v.transparentPct,
      tried: cands.map((c) => c.q + ':' + c.size).join(' ')
    });
    console.log('done ' + dstName + ' q=' + chosen.q + ' ' + onDisk.length + 'B');
  }

  await browser.close();
  fs.writeFileSync(path.join(SRC_DIR, '..', '_convert_alpha_webp_report.json'), JSON.stringify(rows, null, 2));
  console.log('\nRESULT_TABLE');
  console.log(['dest', 'bytes', 'KB', 'WxH', 'cornerAlpha', 'centerAlpha', 'transparent%', 'quality'].join(' | '));
  for (const r of rows) {
    console.log([r.dest, r.bytes, r.kb, r.wh, r.cornerAlpha, r.centerAlpha, r.transparentPct, r.quality].join(' | '));
  }
  console.log('\nQUALITY_TRIALS');
  for (const r of rows) console.log(r.dest + ' -> ' + r.tried);
})().catch((e) => { console.error(e); process.exit(1); });
