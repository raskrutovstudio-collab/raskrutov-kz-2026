const { chromium } = require('playwright');

(async () => {
  const imageResponses = [];
  const seenResponseUrls = new Set();

  let browser;
  try {
    browser = await chromium.launch({ headless: true, channel: 'chrome' });
    console.log('Launched: channel=chrome');
  } catch (e) {
    console.log('Chrome channel unavailable, using bundled chromium:', e.message);
    browser = await chromium.launch({ headless: true });
  }

  const context = await browser.newContext({
    userAgent:
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    viewport: { width: 1440, height: 900 },
  });
  const page = await context.newPage();

  page.on('response', async (response) => {
    try {
      const url = response.url();
      const status = response.status();
      const headers = response.headers();
      const ct = (headers['content-type'] || '').toLowerCase();
      const isImage =
        ct.startsWith('image/') ||
        /\.(png|webp|svg|jpe?g|gif|avif)(\?|$)/i.test(url);
      if (!isImage) return;
      if (seenResponseUrls.has(url)) return;
      seenResponseUrls.add(url);
      const cl = headers['content-length'] || null;
      imageResponses.push({ url, status, contentType: ct || null, contentLength: cl });
    } catch (_) {
      /* ignore */
    }
  });

  async function scrollToLoad(p, times = 8) {
    for (let i = 0; i < times; i++) {
      await p.evaluate(() => window.scrollBy(0, window.innerHeight * 1.2));
      await p.waitForTimeout(800);
    }
    await p.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await p.waitForTimeout(1200);
  }

  async function collectDomImages(p) {
    return p.evaluate(() => {
      function closestLabel(el) {
        const fig = el.closest('figure');
        if (fig) {
          const cap = fig.querySelector('figcaption');
          if (cap && cap.textContent.trim()) return cap.textContent.trim();
        }
        const card = el.closest('[class*="card"], [class*="icon"], article, li, a');
        if (card) {
          const texts = [];
          card.querySelectorAll('h1,h2,h3,h4,h5,h6,p,span,label').forEach((n) => {
            const t = (n.textContent || '').trim();
            if (t && t.length < 80) texts.push(t);
          });
          if (texts.length) return texts[0];
          const aria = card.getAttribute('aria-label');
          if (aria) return aria.trim();
          const title = card.getAttribute('title');
          if (title) return title.trim();
        }
        let prev = el.previousElementSibling;
        while (prev) {
          const t = (prev.textContent || '').trim();
          if (t && t.length < 80) return t;
          prev = prev.previousElementSibling;
        }
        let parent = el.parentElement;
        for (let i = 0; i < 4 && parent; i++) {
          const t = (parent.getAttribute('aria-label') || parent.getAttribute('title') || '').trim();
          if (t) return t;
          parent = parent.parentElement;
        }
        return el.alt || '';
      }

      const imgs = Array.from(document.querySelectorAll('img')).map((img) => ({
        tag: 'img',
        src: img.currentSrc || img.src || '',
        srcset: img.srcset || '',
        alt: img.alt || '',
        label: closestLabel(img),
      }));

      const sources = Array.from(document.querySelectorAll('source')).map((s) => ({
        tag: 'source',
        src: s.src || '',
        srcset: s.srcset || '',
        alt: '',
        label: '',
      }));

      return { imgs, sources };
    });
  }

  function originOf(u) {
    try {
      return new URL(u).origin;
    } catch {
      return '(invalid)';
    }
  }

  function extractUrlsFromSrcset(srcset) {
    if (!srcset) return [];
    return srcset
      .split(',')
      .map((part) => part.trim().split(/\s+/)[0])
      .filter(Boolean);
  }

  console.log('\n=== STEP 1-5: Homepage scrape ===');
  await page.goto('https://3dicons.co/', { waitUntil: 'networkidle', timeout: 120000 });
  await scrollToLoad(page, 10);
  await page.waitForTimeout(2000);

  const homeDom = await collectDomImages(page);

  const exploreLinks = await page.evaluate(() => {
    const out = [];
    document.querySelectorAll('a[href]').forEach((a) => {
      const text = (a.textContent || '').trim().toLowerCase();
      const href = a.href;
      if (
        /download all|explore|all icons|view all|browse|get all|v1/i.test(text) ||
        /download.?all|explore/i.test(href)
      ) {
        out.push({ text: (a.textContent || '').trim().slice(0, 120), href });
      }
    });
    return out;
  });

  const allDomUrls = new Set();
  const labeled = [];

  for (const item of [...homeDom.imgs, ...homeDom.sources]) {
    const urls = [item.src, ...extractUrlsFromSrcset(item.srcset)].filter(Boolean);
    for (const u of urls) {
      allDomUrls.add(u);
      if (labeled.length < 40 && (item.alt || item.label)) {
        labeled.push({ url: u, alt: item.alt, label: item.label });
      }
    }
  }

  for (const r of imageResponses) {
    allDomUrls.add(r.url);
  }

  const originCounts = {};
  for (const u of allDomUrls) {
    const o = originOf(u);
    originCounts[o] = (originCounts[o] || 0) + 1;
  }

  console.log('\n--- Distinct image host origins ---');
  Object.entries(originCounts)
    .sort((a, b) => b[1] - a[1])
    .forEach(([o, c]) => console.log(`${c}\t${o}`));

  const exampleUrls = Array.from(allDomUrls).slice(0, 80);
  console.log(`\n--- Up to 80 example full image URLs (deduped, total=${allDomUrls.size}) ---`);
  exampleUrls.forEach((u, i) => console.log(`${i + 1}. ${u}`));

  console.log('\n--- First 40 with alt/label ---');
  labeled.slice(0, 40).forEach((item, i) => {
    console.log(`${i + 1}. alt=${JSON.stringify(item.alt)} | label=${JSON.stringify(item.label)}`);
    console.log(`   ${item.url}`);
  });

  console.log('\n--- Network-intercepted image responses (sample) ---');
  console.log(`Total intercepted image responses: ${imageResponses.length}`);
  imageResponses.slice(0, 40).forEach((r, i) => {
    console.log(`${i + 1}. [${r.status}] cl=${r.contentLength} ct=${r.contentType} ${r.url}`);
  });

  console.log('\n--- Explore / Download links on homepage ---');
  if (!exploreLinks.length) console.log('(none matched)');
  exploreLinks.forEach((l, i) => console.log(`${i + 1}. "${l.text}" -> ${l.href}`));

  // Icon name extraction from alts/labels/urls
  const nameCandidates = new Set();
  for (const img of homeDom.imgs) {
    [img.alt, img.label].forEach((t) => {
      if (!t) return;
      const cleaned = t
        .toLowerCase()
        .replace(/[^a-z0-9\s\-_/]/g, ' ')
        .trim();
      if (cleaned && cleaned.length < 60 && !/download|explore|premium|free|icon/i.test(cleaned.split(' ')[0] || '')) {
        nameCandidates.add(cleaned.replace(/\s+/g, '-'));
      }
      cleaned.split(/[\s_/]+/).forEach((w) => {
        if (w.length >= 2 && w.length <= 40 && /^[a-z][a-z0-9\-]*$/.test(w)) nameCandidates.add(w);
      });
    });
  }
  for (const u of allDomUrls) {
    try {
      const path = new URL(u).pathname;
      const base = path.split('/').pop() || '';
      const stem = base.replace(/\.(png|webp|svg|jpe?g|gif|avif)$/i, '');
      if (stem) {
        nameCandidates.add(stem);
        stem.split(/[-_]/).forEach((p) => {
          if (p.length >= 2 && /^[a-z][a-z0-9]*$/i.test(p)) nameCandidates.add(p.toLowerCase());
        });
      }
    } catch (_) {}
  }

  console.log('\n--- Discovered name/token candidates (from DOM+URLs) ---');
  const sortedNames = Array.from(nameCandidates).sort();
  console.log(`count=${sortedNames.length}`);
  console.log(sortedNames.join(', '));

  // Style/variant tokens from URLs
  const variantHints = [
    'clay',
    'color',
    'colour',
    'gradient',
    'dynamic',
    'front',
    'iso',
    'premium',
    'plastic',
    'flat',
    '3d',
  ];
  const foundVariants = new Set();
  for (const u of allDomUrls) {
    const lower = u.toLowerCase();
    for (const v of variantHints) {
      if (lower.includes(v)) foundVariants.add(v);
    }
    // also capture path segments that look like style tokens
    try {
      new URL(u).pathname
        .split('/')
        .filter(Boolean)
        .forEach((seg) => {
          if (/^(clay|color|colour|gradient|dynamic|front|iso|premium|plastic)$/i.test(seg)) {
            foundVariants.add(seg.toLowerCase());
          }
        });
    } catch (_) {}
  }
  console.log('\n--- Style/variant tokens seen in URLs ---');
  console.log(Array.from(foundVariants).sort().join(', ') || '(none)');

  // Infer URL patterns
  console.log('\n--- Observed URL pattern analysis ---');
  const pathTemplates = {};
  for (const u of Array.from(allDomUrls).slice(0, 500)) {
    try {
      const parsed = new URL(u);
      const parts = parsed.pathname.split('/').filter(Boolean);
      const templ = parts
        .map((p, idx) => {
          if (/\.(png|webp|svg|jpe?g|gif|avif)$/i.test(p)) {
            return '{file}';
          }
          if (/^[0-9a-f]{8,}$/i.test(p) || /^\d+$/.test(p)) return '{id}';
          if (idx === parts.length - 1) return '{name}';
          return p;
        })
        .join('/');
      const key = `${parsed.origin}/${templ}`;
      pathTemplates[key] = (pathTemplates[key] || 0) + 1;
    } catch (_) {}
  }
  Object.entries(pathTemplates)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 30)
    .forEach(([t, c]) => console.log(`${c}\t${t}`));

  console.log('\n=== STEP 6: Candidate listing pages ===');
  const candidates = [
    'https://3dicons.co/icons',
    'https://3dicons.co/all',
    'https://3dicons.co/free',
    'https://3dicons.co/premium',
    'https://3dicons.co/collections',
  ];

  for (const url of candidates) {
    const before = imageResponses.length;
    const beforeUrls = new Set(allDomUrls);
    try {
      const resp = await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 });
      const status = resp ? resp.status() : 'no-response';
      await page.waitForTimeout(1500);
      try {
        await page.waitForLoadState('networkidle', { timeout: 15000 });
      } catch (_) {}
      await scrollToLoad(page, 6);
      const dom = await collectDomImages(page);
      const pageUrls = new Set();
      for (const item of [...dom.imgs, ...dom.sources]) {
        [item.src, ...extractUrlsFromSrcset(item.srcset)].filter(Boolean).forEach((u) => pageUrls.add(u));
      }
      // newly intercepted since before
      const newNet = imageResponses.slice(before).map((r) => r.url);
      newNet.forEach((u) => pageUrls.add(u));
      console.log(`PAGE ${url}`);
      console.log(`  HTTP ${status} | unique image URLs on page: ${pageUrls.size} | new network images: ${newNet.length}`);
      Array.from(pageUrls).slice(0, 5).forEach((u) => console.log(`  eg: ${u}`));
      pageUrls.forEach((u) => allDomUrls.add(u));
    } catch (err) {
      console.log(`PAGE ${url}`);
      console.log(`  ERROR: ${err.message}`);
    }
  }

  // Follow first obvious explore/download link
  if (exploreLinks.length) {
    const target = exploreLinks[0];
    console.log(`\n=== Following explore link: ${target.href} ===`);
    try {
      const resp = await page.goto(target.href, { waitUntil: 'domcontentloaded', timeout: 60000 });
      console.log(`HTTP ${resp ? resp.status() : 'n/a'}`);
      await scrollToLoad(page, 6);
      const dom = await collectDomImages(page);
      const pageUrls = new Set();
      for (const item of [...dom.imgs, ...dom.sources]) {
        [item.src, ...extractUrlsFromSrcset(item.srcset)].filter(Boolean).forEach((u) => pageUrls.add(u));
      }
      console.log(`unique image URLs: ${pageUrls.size}`);
      Array.from(pageUrls).slice(0, 15).forEach((u) => console.log(`  ${u}`));
    } catch (err) {
      console.log(`ERROR following link: ${err.message}`);
    }
  }

  console.log('\n=== STEP 7: Probe predictable URL patterns ===');
  // Derive observed pattern(s) from real URLs
  const sampleIconFiles = Array.from(allDomUrls).filter((u) =>
    /\.(png|webp|svg)(\?|$)/i.test(u)
  );
  console.log(`Sample real image URLs for pattern derivation (up to 10):`);
  sampleIconFiles.slice(0, 10).forEach((u) => console.log(`  ${u}`));

  const probeNames = ['rocket', 'target', 'play', 'setting', 'map-pin', 'search', 'fire', 'heart', 'star', 'camera'];
  // also try names extracted from filenames
  for (const u of sampleIconFiles.slice(0, 20)) {
    try {
      const base = new URL(u).pathname.split('/').pop() || '';
      const stem = base.replace(/\.(png|webp|svg|jpe?g).*$/i, '');
      // try to get icon name portion before style tokens
      const parts = stem.split(/[-_]/);
      if (parts[0] && parts[0].length > 1) probeNames.push(parts[0].toLowerCase());
    } catch (_) {}
  }
  const uniqueProbeNames = Array.from(new Set(probeNames)).slice(0, 12);

  function substituteName(templateUrl, name) {
    // Replace last path filename stem, or {name} placeholder
    try {
      const u = new URL(templateUrl);
      const parts = u.pathname.split('/');
      const file = parts[parts.length - 1];
      const m = file.match(/^(.+?)(\.(png|webp|svg|jpe?g|gif|avif))$/i);
      if (m) {
        // If filename has tokens like rocket-dynamic-color.png, replace first segment
        const stem = m[1];
        const segs = stem.split('-');
        // heuristic: replace leading name-ish segment(s) until a known style token
        const styles = new Set(['clay', 'color', 'colour', 'gradient', 'dynamic', 'front', 'iso', 'premium', 'plastic']);
        let cut = 1;
        for (let i = 0; i < segs.length; i++) {
          if (styles.has(segs[i].toLowerCase())) {
            cut = i;
            break;
          }
          cut = i + 1;
        }
        const newStem = [name, ...segs.slice(cut)].join('-');
        parts[parts.length - 1] = newStem + m[2];
        u.pathname = parts.join('/');
        return u.toString();
      }
    } catch (_) {}
    return templateUrl.replace(/\{name\}/g, name);
  }

  const probePatterns = [
    'https://3dicons.co/static/{name}.png',
    'https://3dicons.co/images/{name}.png',
  ];

  // Add observed pattern templates from real URLs
  const observedTemplates = [];
  for (const u of sampleIconFiles.slice(0, 5)) {
    observedTemplates.push(u);
  }

  const probeClient = await context.request;

  async function probe(url) {
    try {
      const head = await probeClient.fetch(url, { method: 'HEAD', timeout: 15000 });
      let status = head.status();
      // some CDNs reject HEAD
      if (status === 405 || status === 403 || status === 400) {
        const get = await probeClient.fetch(url, {
          method: 'GET',
          timeout: 15000,
          headers: { Range: 'bytes=0-0' },
        });
        status = get.status();
      }
      return status;
    } catch (err) {
      return `ERR:${err.message}`;
    }
  }

  console.log('\n--- Probing static/images candidates ---');
  for (const name of uniqueProbeNames.slice(0, 6)) {
    for (const pat of probePatterns) {
      const url = pat.replace('{name}', name);
      const status = await probe(url);
      console.log(`[${status}] ${url}`);
    }
  }

  console.log('\n--- Probing observed-pattern substitutions ---');
  if (observedTemplates.length) {
    for (const name of uniqueProbeNames.slice(0, 6)) {
      for (const tmpl of observedTemplates.slice(0, 3)) {
        const url = substituteName(tmpl, name);
        if (url === tmpl && !tmpl.includes(name)) {
          // still try replacing entire filename stem with name + same extension
          try {
            const u = new URL(tmpl);
            const ext = (u.pathname.match(/\.(png|webp|svg)$/i) || ['.png'])[0];
            const parts = u.pathname.split('/');
            parts[parts.length - 1] = name + ext;
            const altUrl = u.origin + parts.join('/');
            const status = await probe(altUrl);
            console.log(`[${status}] ${altUrl}`);
          } catch (_) {}
        } else {
          const status = await probe(url);
          console.log(`[${status}] ${url}`);
        }
      }
    }
  } else {
    console.log('(no observed image URL templates to substitute)');
  }

  // Also try common 3dicons github/cdn patterns if we saw 3dicons tokens
  const extraPatterns = [
    'https://3dicons.sgp1.cdn.digitaloceanspaces.com/v1/{name}/clay/{name}-clay-color.png',
    'https://3dicons.sgp1.cdn.digitaloceanspaces.com/v1/{name}/dynamic-color/{name}-dynamic-color.png',
    'https://cdn.jsdelivr.net/gh/nayoar/3dicons@main/png/{name}.png',
  ];
  // Only probe extras if we saw digitalocean or jsdelivr in results
  const allText = Array.from(allDomUrls).join(' ');
  console.log('\n--- Extra known-CDN probes (if relevant) ---');
  for (const name of ['rocket', 'fire', 'heart']) {
    for (const pat of extraPatterns) {
      if (
        /digitaloceanspaces|jsdelivr|3dicons\.sgp/i.test(allText) ||
        true /* always try a few for discovery */
      ) {
        const url = pat.replace(/\{name\}/g, name);
        const status = await probe(url);
        console.log(`[${status}] ${url}`);
      }
    }
  }

  console.log('\n=== FINAL SUMMARY DUMP ===');
  console.log('TOTAL_UNIQUE_IMAGE_URLS:', allDomUrls.size);
  console.log('TOTAL_NETWORK_IMAGE_RESPONSES:', imageResponses.length);
  console.log('ALL_UNIQUE_URLS:');
  Array.from(allDomUrls).forEach((u) => console.log(u));

  await browser.close();
  console.log('\nDone.');
})().catch((err) => {
  console.error('FATAL:', err);
  process.exit(1);
});
