const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');
const outDir = path.join('site_mirror', '_work', 'google-ads-icons-qa', 'cand-alpha');
fs.mkdirSync(outDir, { recursive: true });

function pngAlpha(buf) {
  if (buf.length < 26 || buf.toString('ascii', 1, 4) !== 'PNG') return { hasAlpha: false, detail: 'not PNG' };
  const ct = buf[25];
  const map = { 0: 'gray', 2: 'RGB', 3: 'indexed', 4: 'gray+alpha', 6: 'RGBA' };
  let hasTrns = false, i = 8;
  while (i + 8 <= buf.length) {
    const len = buf.readUInt32BE(i);
    const type = buf.toString('ascii', i + 4, i + 8);
    if (type === 'tRNS') { hasTrns = true; break; }
    if (type === 'IEND') break;
    i += 12 + len;
    if (len > 50e6) break;
  }
  return { hasAlpha: ct === 4 || ct === 6 || hasTrns, detail: `IHDR colorType=${ct} (${map[ct]||ct}); tRNS=${hasTrns}` };
}
function webpAlpha(buf) {
  if (buf.length < 16 || buf.toString('ascii',0,4)!=='RIFF' || buf.toString('ascii',8,12)!=='WEBP') return { hasAlpha:false, detail:'not WebP' };
  let hasVp8x=false, alphaFlag=false, hasAlph=false, i=12;
  while (i+8<=buf.length) {
    const type=buf.toString('ascii',i,i+4); const size=buf.readUInt32LE(i+4);
    if (type==='VP8X' && i+10<buf.length) { hasVp8x=true; alphaFlag=(buf[i+8]&0x10)!==0; }
    if (type==='ALPH') hasAlph=true;
    let adv=8+size; if (size%2===1) adv++; i+=adv; if (size>50e6) break;
  }
  return { hasAlpha: alphaFlag||hasAlph, detail:`VP8X=${hasVp8x} alphaFlag=${alphaFlag} ALPH=${hasAlph}` };
}

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ acceptDownloads: true, viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();

  const net = [];
  page.on('response', async (res) => {
    const u = res.url();
    const ct = res.headers()['content-type'] || '';
    if (ct.startsWith('image/') || /supabase|storage|\.png|\.webp|\.zip/i.test(u)) {
      net.push({ url: u, status: res.status(), ct, type: 'resp' });
    }
  });

  // Hook fetch/XHR in page for download generation sources
  await page.addInitScript(() => {
    window.__captured = [];
    const origFetch = window.fetch;
    window.fetch = async function(...args) {
      const r = await origFetch.apply(this, args);
      try {
        const u = typeof args[0] === 'string' ? args[0] : (args[0] && args[0].url) || '';
        window.__captured.push({ kind: 'fetch', url: u, status: r.status, ct: r.headers.get('content-type') });
      } catch {}
      return r;
    };
  });

  async function probeIcon(iconPath, slug) {
    console.log('\\n==== ' + iconPath + ' ====');
    await page.goto('https://3dicons.co' + iconPath, { waitUntil: 'domcontentloaded', timeout: 90000 });
    try { await page.getByRole('button', { name: /accept/i }).click({ timeout: 3000 }); } catch {}
    await page.waitForTimeout(2500);

    // Open download menu
    const dlBtn = page.locator('button.download-button, button:has-text("download")').first();
    await dlBtn.click({ timeout: 10000 });
    await page.waitForTimeout(800);

    const menu = await page.evaluate(() => {
      const items = Array.from(document.querySelectorAll('[role="menu"] [role="menuitem"], .mantine-Menu-item, [data-menu-item], button, a'));
      return items.map(el => ({
        tag: el.tagName,
        role: el.getAttribute('role'),
        text: (el.innerText || '').trim().slice(0, 120),
        href: el.href || el.getAttribute('href') || '',
        html: el.outerHTML.slice(0, 400),
      })).filter(x => /png|webp|svg|download|current|all|zip|400|200|100|60/i.test(x.text + x.href + x.html));
    });
    console.log('MENU_ITEMS=' + JSON.stringify(menu, null, 2));

    // Click each menu item that looks like a download, reopen menu between
    const labels = await page.locator('[role="menuitem"], .mantine-Menu-item').allTextContents();
    console.log('MENU_TEXTS=' + JSON.stringify(labels));

    for (const label of labels) {
      const t = label.trim();
      if (!t || /copy/i.test(t)) continue;
      // reopen menu
      try {
        const expanded = await dlBtn.getAttribute('aria-expanded');
        if (expanded !== 'true') await dlBtn.click();
        await page.waitForTimeout(400);
      } catch {}
      const item = page.locator('[role="menuitem"], .mantine-Menu-item').filter({ hasText: t }).first();
      try {
        const [download] = await Promise.all([
          page.waitForEvent('download', { timeout: 8000 }).catch(() => null),
          item.click({ timeout: 3000 }),
        ]);
        if (download) {
          const name = download.suggestedFilename();
          const dest = path.join(outDir, `${slug}-${name}`);
          await download.saveAs(dest);
          const buf = fs.readFileSync(dest);
          const alpha = /\.png$/i.test(name) ? pngAlpha(buf) : (/\.webp$/i.test(name) ? webpAlpha(buf) : { hasAlpha: false, detail: 'other' });
          console.log(`DOWNLOAD label=${JSON.stringify(t)} file=${name} bytes=${buf.length} url=${download.url()} alpha=${JSON.stringify(alpha)}`);
          if (!alpha.hasAlpha) { fs.unlinkSync(dest); console.log('  deleted opaque'); }
          else console.log('  KEPT ' + dest);
        } else {
          console.log(`NO_DOWNLOAD for ${JSON.stringify(t)}`);
        }
      } catch (e) {
        console.log(`ITEM_ERR ${JSON.stringify(t)}: ${e.message}`);
      }
      await page.waitForTimeout(300);
    }

    const captured = await page.evaluate(() => window.__captured || []);
    console.log('FETCH_CAPTURED=' + JSON.stringify(captured.slice(-50), null, 2));

    // Network supabase urls
    const supabase = net.filter(n => /supabase/i.test(n.url));
    const uniq = [...new Map(supabase.map(n => [n.url, n])).values()];
    console.log('SUPABASE_NET=' + JSON.stringify(uniq, null, 2));

    // Canvas corner alpha on images
    const corners = await page.evaluate(() => {
      return Array.from(document.images).slice(0, 20).map(img => {
        try {
          if (!img.complete || !img.naturalWidth) return { src: img.src, skip: true };
          const c = document.createElement('canvas');
          c.width = img.naturalWidth; c.height = img.naturalHeight;
          const ctx = c.getContext('2d', { willReadFrequently: true });
          ctx.drawImage(img, 0, 0);
          const pts = [[0,0],[c.width-1,0],[0,c.height-1],[Math.floor(c.width/2),0]];
          const alphas = pts.map(([x,y]) => ctx.getImageData(x,y,1,1).data[3]);
          return { src: img.currentSrc || img.src, w: img.naturalWidth, h: img.naturalHeight, cornerAlphas: alphas, minAlpha: Math.min(...alphas) };
        } catch (e) { return { src: img.src, error: e.message }; }
      });
    });
    console.log('CANVAS=' + JSON.stringify(corners, null, 2));

    // Inspect next.js / app scripts for png path patterns
    const scriptHints = await page.evaluate(() => {
      const urls = Array.from(document.querySelectorAll('script[src]')).map(s => s.src).filter(u => /_next|chunk|icon/i.test(u));
      return urls.slice(0, 30);
    });
    console.log('SCRIPTS=' + JSON.stringify(scriptHints));
  }

  await probeIcon('/icons/49b6f4-target', 'target');
  net.length = 0;
  await page.evaluate(() => { window.__captured = []; });
  await probeIcon('/icons/744cc0-rocket', 'rocket');

  // Search JS bundles for storage path / png pattern
  const page2 = await context.newPage();
  await page2.goto('https://3dicons.co/icons/49b6f4-target', { waitUntil: 'networkidle', timeout: 90000 });
  const scriptSrcs = await page2.evaluate(() => Array.from(document.querySelectorAll('script[src]')).map(s => s.src));
  const hints = [];
  for (const src of scriptSrcs) {
    try {
      const txt = await (await page2.request.get(src)).text();
      const patterns = [
        /storage\/v1\/object\/public\/[a-zA-Z0-9_/-]+/g,
        /\/(png|sizes|original|icons|webp)\/[^"'`]+/g,
        /3dicons-[a-z0-9-]+\.png/g,
        /material.*gradient|gradient\.png|color\.png/g,
      ];
      for (const re of patterns) {
        const m = txt.match(re);
        if (m) hints.push({ src: src.slice(-80), sample: [...new Set(m)].slice(0, 20) });
      }
      if (/supabase\.co/.test(txt)) {
        const m2 = [...txt.matchAll(/https?:\\\/\\\/[^"'\\s]*supabase[^"'\\s]*/g)].map(x => x[0]).slice(0, 10);
        const m3 = [...txt.matchAll(/bvconuycpdvgzbvbkijl[^"'\\s]*/g)].map(x => x[0]).slice(0, 20);
        hints.push({ src: src.slice(-80), supabase: m2, paths: m3 });
      }
    } catch (e) {}
  }
  console.log('JS_HINTS=' + JSON.stringify(hints, null, 2));

  await browser.close();
  console.log('DONE');
})().catch(e => { console.error(e); process.exit(1); });