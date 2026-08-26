const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const outDir = path.join('site_mirror', '_work', 'google-ads-icons-qa', 'cand-alpha');
const zipDir = path.join(outDir, '_zips');
fs.mkdirSync(zipDir, { recursive: true });

function pngAlpha(buf) {
  if (buf.length < 26 || buf.toString('ascii', 1, 4) !== 'PNG') return { hasAlpha: false, detail: 'not PNG' };
  const ct = buf[25];
  const map = { 0: 'gray', 2: 'RGB', 3: 'indexed', 4: 'gray+alpha', 6: 'RGBA' };
  return { hasAlpha: ct === 4 || ct === 6, detail: `IHDR colorType=${ct} (${map[ct]||ct})` };
}

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ acceptDownloads: true });
  const page = await context.newPage();
  const netLog = [];
  page.on('response', (res) => {
    const u = res.url();
    if (/supabase|\.png|\.webp|\.zip|storage/i.test(u)) netLog.push({ url: u, status: res.status(), ct: res.headers()['content-type'] || '' });
  });

  for (const [iconPath, slug] of [['/icons/49b6f4-target','target'],['/icons/744cc0-rocket','rocket']]) {
    await page.goto('https://3dicons.co' + iconPath, { waitUntil: 'domcontentloaded', timeout: 90000 });
    try { await page.getByRole('button', { name: /accept/i }).click({ timeout: 2000 }); } catch {}
    await page.waitForTimeout(1500);
    const dlBtn = page.locator('button.download-button').first();
    for (const label of ['iso all', 'dynamic all', 'front all']) {
      await dlBtn.click();
      await page.waitForTimeout(400);
      const item = page.locator('[role="menuitem"]').filter({ hasText: label }).first();
      const [download] = await Promise.all([
        page.waitForEvent('download', { timeout: 15000 }),
        item.click(),
      ]);
      const fname = `${slug}-${label.replace(/\s+/g,'-')}.zip`;
      const dest = path.join(zipDir, fname);
      await download.saveAs(dest);
      console.log(`SAVED_ZIP ${dest} bytes=${fs.statSync(dest).size} url=${download.url()}`);
    }
    // list unique supabase from net
    const uniq = [...new Map(netLog.filter(n=>/supabase/i.test(n.url)).map(n=>[n.url,n])).values()];
    console.log(`NET_${slug}=` + JSON.stringify(uniq, null, 2));
    // canvas
    const corners = await page.evaluate(() => Array.from(document.images).filter(i=>i.naturalWidth>50).slice(0,8).map(img => {
      try {
        const c=document.createElement('canvas'); c.width=img.naturalWidth; c.height=img.naturalHeight;
        const ctx=c.getContext('2d'); ctx.drawImage(img,0,0);
        const a=[0,0,img.naturalWidth-1,0,0,img.naturalHeight-1].reduce((acc,_,i,arr)=>{ if(i%2)return acc; acc.push(ctx.getImageData(arr[i],arr[i+1],1,1).data[3]); return acc;},[]);
        return { src: img.currentSrc, w: img.naturalWidth, h: img.naturalHeight, cornerAlphas: a };
      } catch(e) { return { src: img.src, error: e.message }; }
    }));
    console.log(`CANVAS_${slug}=` + JSON.stringify(corners, null, 2));
    netLog.length = 0;
  }
  await browser.close();

  // Extract zips with PowerShell Expand-Archive via tar or powershell
  const zips = fs.readdirSync(zipDir).filter(f => f.endsWith('.zip'));
  for (const z of zips) {
    const zp = path.join(zipDir, z);
    const extractTo = path.join(zipDir, z.replace(/\.zip$/, ''));
    fs.mkdirSync(extractTo, { recursive: true });
    try {
      execSync(`powershell -NoProfile -Command "Expand-Archive -LiteralPath '${zp.replace(/'/g,"''")}' -DestinationPath '${extractTo.replace(/'/g,"''")}' -Force"`, { stdio: 'pipe' });
    } catch (e) {
      console.log('EXPAND_ERR ' + z + ' ' + e.message);
      continue;
    }
    function walk(dir) {
      for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
        const p = path.join(dir, ent.name);
        if (ent.isDirectory()) walk(p);
        else if (/\.png$/i.test(ent.name)) {
          const buf = fs.readFileSync(p);
          const a = pngAlpha(buf);
          console.log(`PNG ${path.relative(zipDir, p)} bytes=${buf.length} ${JSON.stringify(a)}`);
          if (a.hasAlpha) {
            const dest = path.join(outDir, z.replace(/\.zip$/,'') + '__' + ent.name);
            fs.copyFileSync(p, dest);
            console.log('  KEPT ' + dest);
          }
        } else {
          console.log(`FILE ${path.relative(zipDir, p)} bytes=${fs.statSync(p).size}`);
        }
      }
    }
    walk(extractTo);
  }
  console.log('EXTRACT_DONE');
})().catch(e => { console.error(e); process.exit(1); });