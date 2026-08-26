const { chromium } = require('playwright');

(async () => {
  const imageUrls = new Set();
  const apiPayloads = [];

  let browser;
  try {
    browser = await chromium.launch({ headless: true, channel: 'chrome' });
  } catch {
    browser = await chromium.launch({ headless: true });
  }
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
  });
  const page = await context.newPage();

  page.on('response', async (response) => {
    const url = response.url();
    const ct = (response.headers()['content-type'] || '').toLowerCase();
    if (ct.startsWith('image/') || /\.(png|webp|svg)(\?|$)/i.test(url)) {
      imageUrls.add(url);
    }
    if (
      /supabase|graphql|api|icons|rest\/v1/i.test(url) &&
      (ct.includes('json') || url.includes('rest/v1') || url.includes('rpc'))
    ) {
      try {
        const status = response.status();
        let body = null;
        try {
          body = await response.text();
        } catch (_) {}
        if (body && body.length < 2000000) {
          apiPayloads.push({ url, status, bodyPreview: body.slice(0, 500), bodyLen: body.length, body });
        } else {
          apiPayloads.push({ url, status, bodyPreview: null, bodyLen: body ? body.length : 0 });
        }
      } catch (_) {}
    }
  });

  console.log('=== EXPLORE deep scrape ===');
  await page.goto('https://3dicons.co/explore', { waitUntil: 'networkidle', timeout: 120000 });

  // aggressive scroll + wait for virtualized lists
  let prevCount = 0;
  for (let i = 0; i < 40; i++) {
    await page.evaluate(() => window.scrollBy(0, window.innerHeight));
    await page.waitForTimeout(500);
    const count = await page.evaluate(() => document.querySelectorAll('img').length);
    if (i % 5 === 0) console.log(`scroll ${i}: imgs=${count} netImages=${imageUrls.size}`);
    if (count === prevCount && i > 10) {
      // try scroll to bottom
      await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
      await page.waitForTimeout(1000);
      const count2 = await page.evaluate(() => document.querySelectorAll('img').length);
      if (count2 === prevCount) break;
    }
    prevCount = count;
  }

  const domData = await page.evaluate(() => {
    const items = [];
    document.querySelectorAll('img').forEach((img) => {
      const a = img.closest('a');
      items.push({
        src: img.currentSrc || img.src || '',
        alt: img.alt || '',
        href: a ? a.href : '',
        text: a ? (a.textContent || '').trim().slice(0, 100) : '',
      });
    });
    // also collect any data attributes / JSON in script tags mentioning sizes/
    const scripts = Array.from(document.querySelectorAll('script'))
      .map((s) => s.textContent || '')
      .filter((t) => /sizes\/|3dicons|supabase/i.test(t))
      .map((t) => t.slice(0, 2000));
    return { items, scriptsCount: scripts.length, scriptsSample: scripts.slice(0, 3) };
  });

  console.log(`DOM imgs: ${domData.items.length}`);
  console.log(`Network image URLs: ${imageUrls.size}`);
  console.log(`API-ish responses captured: ${apiPayloads.length}`);

  // Parse icon ids/names from URLs
  const iconMap = new Map(); // key: id-name
  const re = /\/sizes\/([a-f0-9]+)-([^/]+)\/([^/]+)\/(\d+)\/([^/.]+)\.(webp|png)/i;
  for (const u of [...imageUrls, ...domData.items.map((i) => i.src)]) {
    const m = u.match(re);
    if (m) {
      const key = `${m[1]}-${m[2]}`;
      if (!iconMap.has(key)) {
        iconMap.set(key, {
          id: m[1],
          name: m[2],
          style: m[3],
          size: m[4],
          variant: m[5],
          ext: m[6],
          url: u,
        });
      }
    }
  }

  console.log(`\nParsed unique icons from sizes/ URLs: ${iconMap.size}`);
  const names = Array.from(iconMap.values())
    .map((x) => x.name)
    .sort();
  console.log('ICON_NAMES_SORTED:');
  console.log(names.join('\n'));

  console.log('\nICON_ID_NAME_PAIRS:');
  Array.from(iconMap.values())
    .sort((a, b) => a.name.localeCompare(b.name))
    .forEach((x) => console.log(`${x.id}\t${x.name}\t${x.style}/${x.size}/${x.variant}.${x.ext}`));

  // DOM alts
  const alts = [...new Set(domData.items.map((i) => i.alt).filter(Boolean))].sort();
  console.log(`\nUnique alts (${alts.length}):`);
  alts.forEach((a) => console.log(a));

  // href patterns for icon detail pages
  const hrefs = [...new Set(domData.items.map((i) => i.href).filter(Boolean))];
  console.log(`\nSample icon hrefs (${hrefs.length}):`);
  hrefs.slice(0, 30).forEach((h) => console.log(h));

  // API payloads summary
  console.log('\n=== API responses ===');
  for (const p of apiPayloads) {
    console.log(`[${p.status}] len=${p.bodyLen} ${p.url}`);
    if (p.bodyPreview) console.log(p.bodyPreview.slice(0, 300).replace(/\s+/g, ' '));
  }

  // Try to find __NEXT_DATA__ or similar
  const nextData = await page.evaluate(() => {
    const el = document.querySelector('#__NEXT_DATA__');
    if (el) return el.textContent;
    const nuxt = window.__NUXT__;
    if (nuxt) return JSON.stringify(nuxt).slice(0, 5000);
    return null;
  });
  if (nextData) {
    console.log('\n=== __NEXT_DATA__ / state found (len=' + nextData.length + ') ===');
    // extract icon names from JSON
    const nameHits = [...nextData.matchAll(/"name"\s*:\s*"([^"]+)"/g)].map((m) => m[1]);
    const slugHits = [...nextData.matchAll(/"slug"\s*:\s*"([^"]+)"/g)].map((m) => m[1]);
    console.log('name fields sample:', [...new Set(nameHits)].slice(0, 50).join(', '));
    console.log('slug fields sample:', [...new Set(slugHits)].slice(0, 50).join(', '));
    // save truncated
    require('fs').writeFileSync(
      'site_mirror/_work/google-ads-icons-qa/explore-next-data.json',
      nextData.slice(0, 500000),
      'utf8'
    );
    console.log('Wrote explore-next-data.json (truncated)');
  } else {
    console.log('\nNo __NEXT_DATA__ found');
  }

  // Visit one icon detail page
  const detail = hrefs.find((h) => /\/icons\//.test(h)) || 'https://3dicons.co/icons/744cc0-rocket';
  console.log(`\n=== Icon detail page: ${detail} ===`);
  const before = imageUrls.size;
  await page.goto(detail, { waitUntil: 'networkidle', timeout: 90000 });
  await page.waitForTimeout(2000);
  const detailImgs = await page.evaluate(() =>
    Array.from(document.querySelectorAll('img')).map((img) => ({
      src: img.currentSrc || img.src,
      alt: img.alt,
    }))
  );
  console.log('Detail DOM imgs:');
  detailImgs.forEach((i) => console.log(`  ${i.alt} | ${i.src}`));
  console.log('New network images since detail:', imageUrls.size - before);
  [...imageUrls].filter((u) => /sizes\//.test(u)).slice(-30).forEach((u) => console.log('  net:', u));

  // Probe style/size/variant matrix on known icon
  const base =
    'https://bvconuycpdvgzbvbkijl.supabase.co/storage/v1/object/public/sizes/744cc0-rocket';
  const styles = ['dynamic', 'clay', 'gradient', 'premium', 'plastic', 'flat', 'iso', 'front'];
  const variants = ['color', 'colour', 'gradient', 'premium'];
  const sizes = ['64', '128', '200', '256', '512', '1024'];
  const exts = ['webp', 'png'];

  console.log('\n=== Probe style/size/variant matrix for rocket ===');
  const req = context.request;
  async function headOrGet(url) {
    try {
      let r = await req.fetch(url, { method: 'HEAD', timeout: 10000 });
      if ([400, 403, 405].includes(r.status())) {
        r = await req.fetch(url, { method: 'GET', timeout: 10000, headers: { Range: 'bytes=0-0' } });
      }
      return r.status();
    } catch (e) {
      return 'ERR';
    }
  }

  // First probe observed exact path components from detail page
  for (const u of [...imageUrls].filter((x) => /744cc0-rocket/.test(x))) {
    console.log(`[observed] ${u}`);
  }

  for (const style of styles) {
    for (const size of sizes) {
      for (const variant of variants) {
        for (const ext of exts) {
          // skip most combos; sample strategically
          if (!(size === '200' || size === '512' || size === '1024')) continue;
          if (variant !== 'color' && !(style === 'dynamic' && size === '200')) continue;
          if (ext === 'png' && size !== '200') continue;
          const url = `${base}/${style}/${size}/${variant}.${ext}`;
          const status = await headOrGet(url);
          if (status === 200 || status === 206) {
            console.log(`[${status}] ${url}`);
          } else if (style === 'dynamic' && variant === 'color') {
            console.log(`[${status}] ${url}`);
          }
        }
      }
    }
  }

  // Also try without id prefix: /sizes/rocket/...
  console.log('\n=== Probe without id prefix ===');
  for (const style of ['dynamic', 'clay']) {
    const url = `https://bvconuycpdvgzbvbkijl.supabase.co/storage/v1/object/public/sizes/rocket/${style}/200/color.webp`;
    console.log(`[${await headOrGet(url)}] ${url}`);
  }

  // Try github release / npm patterns commonly used by 3dicons
  console.log('\n=== Probe github raw / npm cdn ===');
  const gh = [
    'https://raw.githubusercontent.com/realvjy/3dicons/master/assets/icons/png/dynamic-color/rocket.png',
    'https://raw.githubusercontent.com/realvjy/3dicons/main/assets/icons/png/dynamic-color/rocket.png',
    'https://cdn.jsdelivr.net/npm/3dicons@latest/assets/icons/png/dynamic-color/rocket.png',
    'https://unpkg.com/3dicons/assets/icons/png/dynamic-color/rocket.png',
  ];
  for (const url of gh) {
    console.log(`[${await headOrGet(url)}] ${url}`);
  }

  // Capture __NEXT_DATA__ from explore if we re-fetch HTML
  const htmlResp = await req.get('https://3dicons.co/explore');
  const html = await htmlResp.text();
  const m = html.match(/<script id="__NEXT_DATA__"[^>]*>([\s\S]*?)<\/script>/);
  if (m) {
    require('fs').writeFileSync(
      'site_mirror/_work/google-ads-icons-qa/explore-html-next-data.json',
      m[1],
      'utf8'
    );
    console.log('\nSaved explore-html-next-data.json len=' + m[1].length);
  } else {
    console.log('\nNo __NEXT_DATA__ in explore HTML (likely client-rendered)');
    // look for supabase keys / endpoints in HTML/JS bundles
    const scriptSrcs = [...html.matchAll(/<script[^>]+src="([^"]+)"/g)].map((x) => x[1]);
    console.log('Script srcs:', scriptSrcs.slice(0, 20).join('\n'));
  }

  await browser.close();
  console.log('\nDone deep scrape.');
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
