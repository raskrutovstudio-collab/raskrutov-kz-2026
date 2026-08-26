const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');

const outDir = path.join('site_mirror', '_work', 'google-ads-icons-qa', 'cand-alpha');
fs.mkdirSync(outDir, { recursive: true });

function fetchBuf(url) {
  return new Promise((resolve, reject) => {
    const lib = url.startsWith('https') ? https : http;
    const req = lib.get(url, { headers: { 'User-Agent': 'raskrutov-probe' } }, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return fetchBuf(res.headers.location).then(resolve, reject);
      }
      const chunks = [];
      res.on('data', (c) => chunks.push(c));
      res.on('end', () => {
        resolve({
          status: res.statusCode,
          contentType: res.headers['content-type'] || '',
          bytes: Buffer.concat(chunks),
        });
      });
    });
    req.on('error', reject);
    req.setTimeout(30000, () => { req.destroy(new Error('timeout')); });
  });
}

function pngAlpha(buf) {
  if (buf.length < 26 || buf.toString('ascii', 1, 4) !== 'PNG') return { hasAlpha: false, detail: 'not PNG' };
  const ct = buf[25];
  const map = { 0: 'gray', 2: 'RGB', 3: 'indexed', 4: 'gray+alpha', 6: 'RGBA' };
  let hasTrns = false;
  let i = 8;
  while (i + 8 <= buf.length) {
    const len = buf.readUInt32BE(i);
    const type = buf.toString('ascii', i + 4, i + 8);
    if (type === 'tRNS') { hasTrns = true; break; }
    if (type === 'IEND') break;
    i += 12 + len;
    if (len > 50e6) break;
  }
  const hasAlpha = ct === 4 || ct === 6 || hasTrns;
  return { hasAlpha, detail: `IHDR colorType=${ct} (${map[ct] || ct}); tRNS=${hasTrns}` };
}

function webpAlpha(buf) {
  if (buf.length < 16 || buf.toString('ascii', 0, 4) !== 'RIFF' || buf.toString('ascii', 8, 12) !== 'WEBP') {
    return { hasAlpha: false, detail: 'not WebP' };
  }
  let hasVp8x = false, alphaFlag = false, hasAlph = false;
  let i = 12;
  while (i + 8 <= buf.length) {
    const type = buf.toString('ascii', i, i + 4);
    const size = buf.readUInt32LE(i + 4);
    if (type === 'VP8X' && i + 10 < buf.length) {
      hasVp8x = true;
      alphaFlag = (buf[i + 8] & 0x10) !== 0;
    }
    if (type === 'ALPH') hasAlph = true;
    let adv = 8 + size;
    if (size % 2 === 1) adv++;
    i += adv;
    if (size > 50e6) break;
  }
  return { hasAlpha: alphaFlag || hasAlph, detail: `VP8X=${hasVp8x} alphaFlag=${alphaFlag} ALPH=${hasAlph}` };
}

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  });
  const page = await context.newPage();
  const imageReqs = [];
  page.on('request', (req) => {
    const t = req.resourceType();
    const u = req.url();
    if (t === 'image' || /\.(png|webp|jpg|jpeg|gif|svg)(\?|$)/i.test(u) || /supabase|storage|cdn|download|blob:/i.test(u)) {
      imageReqs.push({ type: t, url: u, method: req.method() });
    }
  });
  page.on('response', async (res) => {
    const u = res.url();
    const ct = (res.headers()['content-type'] || '');
    if (ct.startsWith('image/') || /\.(png|webp)(\?|$)/i.test(u)) {
      imageReqs.push({ type: 'response', url: u, status: res.status(), contentType: ct });
    }
  });

  const url = 'https://3dicons.co/icons/49b6f4-target';
  console.log('NAV ' + url);
  await page.goto(url, { waitUntil: 'networkidle', timeout: 90000 });
  await page.waitForTimeout(2000);

  // DOM dump of download-related areas
  const downloadDom = await page.evaluate(() => {
    const pick = [];
    const candidates = Array.from(document.querySelectorAll('a,button,[role="button"],[class*="download" i],[id*="download" i]'));
    for (const el of candidates) {
      const text = (el.innerText || el.textContent || '').trim().slice(0, 200);
      const href = el.getAttribute('href') || el.href || '';
      const cls = el.className ? String(el.className).slice(0, 200) : '';
      const id = el.id || '';
      const dl = el.getAttribute('download');
      if (/download|png|webp|svg|figma|blender|zip|pack/i.test(text + ' ' + href + ' ' + cls + ' ' + id) || dl != null) {
        pick.push({
          tag: el.tagName,
          text,
          href,
          download: dl,
          id,
          className: cls,
          outerHTML: el.outerHTML.slice(0, 800),
        });
      }
    }
    // also sections with Download heading
    const sections = [];
    for (const h of Array.from(document.querySelectorAll('h1,h2,h3,h4,p,div,span'))) {
      const t = (h.innerText || '').trim();
      if (/^download/i.test(t) || /download (png|webp|file)/i.test(t)) {
        const parent = h.closest('section,div,aside,main') || h.parentElement;
        sections.push({
          heading: t.slice(0, 100),
          parentHTML: parent ? parent.outerHTML.slice(0, 3000) : '',
        });
      }
    }
    return { pick, sections: sections.slice(0, 10), title: document.title, bodySnippet: document.body.innerText.slice(0, 2500) };
  });

  console.log('=== DOWNLOAD CONTROLS ===');
  console.log(JSON.stringify(downloadDom.pick, null, 2));
  console.log('=== DOWNLOAD SECTIONS COUNT ' + downloadDom.sections.length + ' ===');
  for (const s of downloadDom.sections) {
    console.log('HEADING: ' + s.heading);
    console.log(s.parentHTML.slice(0, 1500));
    console.log('---');
  }
  console.log('=== TITLE: ' + downloadDom.title + ' ===');
  console.log('=== BODY TEXT SNIPPET ===');
  console.log(downloadDom.bodySnippet);

  // Try clicking Download buttons
  const clickables = await page.locator('a,button').all();
  const clickedUrls = [];
  for (const loc of clickables) {
    let text = '';
    try { text = (await loc.innerText({ timeout: 500 })).trim(); } catch { continue; }
    if (!/download/i.test(text)) continue;
    console.log('FOUND DOWNLOAD TEXT: ' + JSON.stringify(text.slice(0, 80)));
    try {
      const href = await loc.evaluate((el) => el.href || el.getAttribute('href') || '');
      console.log('  href before click: ' + href);
      // capture popup/new page or download
      const [download] = await Promise.all([
        page.waitForEvent('download', { timeout: 5000 }).catch(() => null),
        page.waitForEvent('popup', { timeout: 5000 }).catch(() => null),
        loc.click({ timeout: 3000, modifiers: [] }).catch((e) => console.log('  click err: ' + e.message)),
      ]);
      // Promise.all with two waiters is awkward - do sequentially better
    } catch (e) {
      console.log('  click fail: ' + e.message);
    }
  }

  // Better click approach for each download-like control
  const dlLocators = page.locator('a:has-text("Download"), button:has-text("Download"), a:has-text("download"), button:has-text("download")');
  const dlCount = await dlLocators.count();
  console.log('DL_LOCATOR_COUNT=' + dlCount);
  for (let i = 0; i < dlCount; i++) {
    const loc = dlLocators.nth(i);
    const text = (await loc.innerText()).trim().slice(0, 100);
    const href = await loc.evaluate((el) => el.href || el.getAttribute('href') || '');
    console.log(`DL[${i}] text=${JSON.stringify(text)} href=${href}`);
    clickedUrls.push({ text, href });
    // try download event
    try {
      const [dl] = await Promise.all([
        page.waitForEvent('download', { timeout: 4000 }).catch(() => null),
        loc.click({ timeout: 2000 }),
      ]);
      if (dl) {
        const suggested = dl.suggestedFilename();
        const fail = await dl.failure();
        console.log(`  DOWNLOAD_EVENT file=${suggested} fail=${fail} url=${dl.url()}`);
        clickedUrls.push({ text, href, downloadUrl: dl.url(), filename: suggested });
        if (!fail) {
          const dest = path.join(outDir, 'pw-' + suggested);
          await dl.saveAs(dest);
          const buf = fs.readFileSync(dest);
          let alpha;
          if (/\.png$/i.test(suggested)) alpha = pngAlpha(buf);
          else if (/\.webp$/i.test(suggested)) alpha = webpAlpha(buf);
          else alpha = { hasAlpha: false, detail: 'other' };
          console.log(`  SAVED ${dest} bytes=${buf.length} alpha=${JSON.stringify(alpha)}`);
          if (!alpha.hasAlpha) {
            // keep only if alpha - delete opaque? instructions say save successfully downloaded transparent. Remove if no alpha.
            fs.unlinkSync(dest);
            console.log('  removed (no alpha)');
          }
        }
      } else {
        await page.waitForTimeout(500);
      }
    } catch (e) {
      console.log('  err: ' + e.message);
    }
  }

  // Also inspect any <a download> 
  const anchors = await page.evaluate(() => Array.from(document.querySelectorAll('a[href]')).map(a => ({
    href: a.href,
    download: a.getAttribute('download'),
    text: (a.innerText || '').trim().slice(0, 120),
  })).filter(a => /\.(png|webp|zip|rar|7z|svg|blend|fig)(\?|$)/i.test(a.href) || a.download != null || /download|png|webp/i.test(a.text)));
  console.log('=== ANCHORS ===');
  console.log(JSON.stringify(anchors, null, 2));

  // Unique image network URLs
  const uniq = [];
  const seen = new Set();
  for (const r of imageReqs) {
    const key = (r.url || '') + '|' + (r.status || '') + '|' + (r.contentType || '');
    if (seen.has(key)) continue;
    seen.add(key);
    uniq.push(r);
  }
  console.log('=== NETWORK IMAGE/RELATED (' + uniq.length + ') ===');
  for (const r of uniq) {
    console.log(JSON.stringify(r));
  }

  // Canvas corner alpha on main preview images
  const canvasAlpha = await page.evaluate(async () => {
    const imgs = Array.from(document.images).slice(0, 30);
    const results = [];
    for (const img of imgs) {
      try {
        if (!img.complete || !img.naturalWidth) continue;
        const c = document.createElement('canvas');
        c.width = img.naturalWidth;
        c.height = img.naturalHeight;
        const ctx = c.getContext('2d', { willReadFrequently: true });
        ctx.drawImage(img, 0, 0);
        const corners = [
          [0, 0],
          [c.width - 1, 0],
          [0, c.height - 1],
          [c.width - 1, c.height - 1],
          [Math.floor(c.width / 2), 0],
        ];
        const alphas = corners.map(([x, y]) => ctx.getImageData(x, y, 1, 1).data[3]);
        results.push({
          src: img.currentSrc || img.src,
          w: img.naturalWidth,
          h: img.naturalHeight,
          cornerAlphas: alphas,
          minAlpha: Math.min(...alphas),
        });
      } catch (e) {
        results.push({ src: img.src, error: e.message });
      }
    }
    return results;
  });
  console.log('=== CANVAS CORNER ALPHA ===');
  console.log(JSON.stringify(canvasAlpha, null, 2));

  // Try rocket page briefly for download links pattern
  console.log('NAV rocket');
  const rocketReqs = [];
  page.on('response', (res) => {
    const u = res.url();
    if (/\.(png|webp)(\?|$)/i.test(u) || /supabase/i.test(u)) rocketReqs.push({ url: u, status: res.status(), ct: res.headers()['content-type'] });
  });
  await page.goto('https://3dicons.co/icons/744cc0-rocket', { waitUntil: 'networkidle', timeout: 90000 });
  await page.waitForTimeout(1500);
  const rocketAnchors = await page.evaluate(() => Array.from(document.querySelectorAll('a[href]')).map(a => ({
    href: a.href,
    download: a.getAttribute('download'),
    text: (a.innerText || '').trim().slice(0, 120),
  })).filter(a => /\.(png|webp|zip)(\?|$)/i.test(a.href) || a.download != null || /download/i.test(a.text)));
  console.log('=== ROCKET ANCHORS ===');
  console.log(JSON.stringify(rocketAnchors, null, 2));
  const rocketDl = page.locator('a:has-text("Download"), button:has-text("Download")');
  console.log('ROCKET_DL_COUNT=' + (await rocketDl.count()));
  for (let i = 0; i < await rocketDl.count(); i++) {
    const loc = rocketDl.nth(i);
    console.log(`RDL[${i}] ${(await loc.innerText()).trim().slice(0,80)} href=${await loc.evaluate(el => el.href || el.getAttribute('href') || '')}`);
  }

  // dump page HTML scripts referencing storage paths
  const storageRefs = await page.evaluate(() => {
    const html = document.documentElement.innerHTML;
    const re = /https?:\/\/[^"'\\s]*supabase[^"'\\s]*|\/storage\/v1\/object\/public\/[^"'\\s]+|\.png|\.webp/gi;
    // better extract supabase URLs
    const urls = new Set();
    const re2 = /https?:\/\/[a-z0-9.-]+\.supabase\.co\/[^"'\\s)]+/gi;
    let m;
    while ((m = re2.exec(html))) urls.add(m[0]);
    const re3 = /https?:\/\/[^"'\\s]+\.(png|webp|zip)/gi;
    while ((m = re3.exec(html))) urls.add(m[0]);
    return Array.from(urls).slice(0, 100);
  });
  console.log('=== STORAGE/ASSET URLS IN HTML ===');
  console.log(JSON.stringify(storageRefs, null, 2));

  await browser.close();
  console.log('=== PLAYWRIGHT DONE ===');
})().catch((e) => { console.error('FATAL', e); process.exit(1); });