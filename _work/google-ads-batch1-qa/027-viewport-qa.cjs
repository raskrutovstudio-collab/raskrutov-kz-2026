const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');
const http = require('http');

const ROOT = path.resolve(__dirname, '../../..');
const SITE = path.join(ROOT, 'site_mirror');
const OUT = path.join(__dirname, '027');
const PORT = Number(process.env.QA_PORT || 4188);
const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.mjs': 'application/javascript; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.webp': 'image/webp',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.woff2': 'font/woff2',
  '.woff': 'font/woff',
  '.json': 'application/json',
};

fs.mkdirSync(OUT, { recursive: true });

const CITIES = ['almaty', 'shymkent', 'karaganda', 'aktobe'];
const REPRESENTATIVE = 'almaty';
const SECTIONS = [
  ['hero', '#ctx-hero'],
  ['about', '#about'],
  ['audience', '#audience'],
  ['campaigns', '#campaign-types'],
  ['decision', '#format-decision'],
  ['setup', '#setup'],
  ['management', '#management'],
  ['analytics', '#analytics'],
  ['pricing', '#pricing'],
  ['related', '#related'],
  ['faq', '#faq'],
  ['forms', '#contacts'],
  ['footer', 'footer'],
];

function serve() {
  return new Promise((resolve, reject) => {
    const server = http.createServer((req, res) => {
      let urlPath = decodeURIComponent((req.url || '/').split('?')[0]);
      if (urlPath.endsWith('/')) urlPath += 'index.html';
      const file = path.join(SITE, urlPath.replace(/^\//, ''));
      if (!file.startsWith(SITE) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) {
        res.writeHead(404);
        res.end('404');
        return;
      }
      const ext = path.extname(file).toLowerCase();
      res.writeHead(200, { 'Content-Type': MIME[ext] || 'application/octet-stream' });
      fs.createReadStream(file).pipe(res);
    });
    server.on('error', reject);
    server.listen(PORT, '127.0.0.1', () => resolve(server));
  });
}

async function evaluatePage(page, viewportWidth) {
  return page.evaluate((vw) => {
    const issues = [];
    const doc = document.documentElement;
    const overflowPx = Math.max(0, doc.scrollWidth - doc.clientWidth);
    const hScroll = overflowPx > 1;

    const visible = (sel) => {
      const el = document.querySelector(sel);
      if (!el) return false;
      const r = el.getBoundingClientRect();
      const st = getComputedStyle(el);
      return r.width > 0 && r.height > 0 && st.visibility !== 'hidden' && st.display !== 'none';
    };

    if (document.querySelectorAll('h1').length !== 1) issues.push(`h1 count=${document.querySelectorAll('h1').length}`);
    if (!visible('h1')) issues.push('h1 not visible');
    if (!visible('header')) issues.push('header not visible');
    if (!document.querySelector('main')) issues.push('missing main');
    if (!document.querySelector('footer')) issues.push('missing footer');

    const overflowing = [...document.querySelectorAll('body *')].filter((el) => {
      const r = el.getBoundingClientRect();
      return r.width > 8 && r.right > doc.clientWidth + 2;
    }).slice(0, 12).map((el) => ({
      tag: el.tagName,
      cls: String(el.className || '').slice(0, 80),
      right: Math.round(el.getBoundingClientRect().right),
    }));
    if (overflowing.length && hScroll) {
      issues.push(`overflowing els: ${overflowing.map((e) => e.cls || e.tag).join(', ')}`);
    }

    const contracts = {
      scopeItems: 0,
      scopeIcons: 0,
      scopeNarrow: [],
      cards: 0,
      cardVisuals: 0,
      camps: 0,
      campVisuals: 0,
      taskLis: 0,
      taskMarks: 0,
      decisionNarrow: [],
      wrapping: [],
    };

    document.querySelectorAll('.gads-scope-list__item').forEach((li, i) => {
      contracts.scopeItems += 1;
      const icon = li.querySelector('.gads-scope-list__icon');
      const content = li.querySelector(':scope > div');
      if (icon) contracts.scopeIcons += 1;
      else issues.push(`DOM: scope item ${i} missing icon`);
      const itemW = li.getBoundingClientRect().width;
      const contentW = content ? content.getBoundingClientRect().width : 0;
      const contentH = content ? content.getBoundingClientRect().height : 0;
      const grid = getComputedStyle(li).gridTemplateColumns;
      if (!icon && contentW <= 55) issues.push(`GEOMETRY: scope ${i} content in ~40px column (${contentW}px)`);
      if (vw >= 800 && contentW > 0 && contentW <= 200) {
        issues.push(`GEOMETRY: scope ${i} desktop contentWidth=${contentW}`);
        contracts.scopeNarrow.push({ i, contentW, itemW, grid });
      }
      if (contentW > 0 && itemW > 0 && contentW / itemW < 0.4 && contentW < 120) {
        issues.push(`GEOMETRY: scope ${i} content/parent=${(contentW / itemW).toFixed(2)} w=${contentW}`);
      }
      const p = content && content.querySelector('p');
      if (p && contentW > 0 && contentW < 70 && p.getBoundingClientRect().height > 120) {
        issues.push(`GEOMETRY: scope ${i} excessive wrapping h=${Math.round(p.getBoundingClientRect().height)}`);
        contracts.wrapping.push({ i, contentW, h: p.getBoundingClientRect().height });
      }
      if (content && (contentW <= 0 || contentH <= 0)) issues.push(`GEOMETRY: scope ${i} collapsed bbox`);
    });

    document.querySelectorAll('.gads-card').forEach((card, i) => {
      contracts.cards += 1;
      const vis = card.querySelector('.gads-card__visual');
      if (vis) contracts.cardVisuals += 1;
      else issues.push(`DOM: card ${i} missing visual`);
      const h3 = card.querySelector('h3');
      const p = card.querySelector('p');
      const text = p || h3;
      if (text) {
        const tw = text.getBoundingClientRect().width;
        const cw = card.getBoundingClientRect().width;
        if (cw > 120 && tw > 0 && tw < 60) issues.push(`GEOMETRY: card ${i} text width ${tw} vs card ${cw}`);
      }
    });

    document.querySelectorAll('.gads-camp').forEach((card, i) => {
      contracts.camps += 1;
      const vis = card.querySelector('.gads-camp__visual');
      if (vis) contracts.campVisuals += 1;
      else issues.push(`DOM: camp ${i} missing visual`);
      const p = card.querySelector('p');
      if (p) {
        const tw = p.getBoundingClientRect().width;
        const cw = card.getBoundingClientRect().width;
        if (cw > 120 && tw > 0 && tw < 60) issues.push(`GEOMETRY: camp ${i} text width ${tw} vs card ${cw}`);
      }
    });

    document.querySelectorAll('.gads-tasks-panel__list li').forEach((li, i) => {
      contracts.taskLis += 1;
      const mark = li.querySelector('.gads-tasks-panel__mark');
      if (mark) contracts.taskMarks += 1;
      else issues.push(`DOM: task li ${i} missing mark`);
      const w = li.getBoundingClientRect().width;
      if (w > 0 && w < 80) issues.push(`GEOMETRY: task li ${i} width ${w}`);
    });

    document.querySelectorAll('.gads-decision__card').forEach((card, i) => {
      const r = card.getBoundingClientRect();
      const p = card.querySelector('p, h3');
      const tw = p ? p.getBoundingClientRect().width : 0;
      if (r.width > 0 && r.width < 80) {
        issues.push(`GEOMETRY: decision ${i} width ${Math.round(r.width)}`);
        contracts.decisionNarrow.push({ i, w: r.width });
      }
      if (r.width > 120 && tw > 0 && tw < 60) issues.push(`GEOMETRY: decision ${i} text ${tw}`);
    });

    document.querySelectorAll('.gads-about-heading').forEach((el, i) => {
      if (!el.querySelector('.gads-about-heading__icon')) issues.push(`DOM: about-heading ${i} missing icon`);
    });

    const headings = [...document.querySelectorAll('h1, h2, h3')].map((el) => {
      const r = el.getBoundingClientRect();
      const fs = parseFloat(getComputedStyle(el).fontSize) || 16;
      const lines = r.height / (fs * 1.25);
      return {
        tag: el.tagName,
        text: (el.textContent || '').trim().slice(0, 80),
        w: Math.round(r.width),
        h: Math.round(r.height),
        lines: Math.round(lines * 10) / 10,
      };
    });
    headings.forEach((h) => {
      if (h.w > 0 && h.w < 40 && h.text.length > 12) issues.push(`GEOMETRY: heading too narrow ${h.tag} w=${h.w}`);
      if (vw >= 800 && h.lines > 6 && h.text.length < 80) issues.push(`GEOMETRY: heading excessive wrap ${h.tag} lines=${h.lines}`);
    });

    return {
      overflowPx,
      hScroll,
      overflowing,
      contracts,
      issues,
      headings: headings.filter((h) => h.tag === 'H1' || h.lines >= 3).slice(0, 20),
      viewport: { w: doc.clientWidth, h: doc.clientHeight, scrollH: doc.scrollHeight },
    };
  }, viewportWidth);
}

(async () => {
  const report = { ok: true, pages: [], errors: [], shots: [] };
  const server = await serve();
  const browser = await chromium.launch({ headless: true });

  try {
    for (const city of CITIES) {
      const viewports = [390, 430, 768, 1440];
      const cityResult = { city, viewports: [] };
      for (const width of viewports) {
        const needShot = width === 390 || width === 1440 || city === REPRESENTATIVE;
        const page = await browser.newPage({
          viewport: { width, height: width <= 430 ? 844 : 900 },
          deviceScaleFactor: 1,
        });
        const owned = [];
        page.on('pageerror', (err) => owned.push(String(err)));
        page.on('console', (msg) => {
          if (msg.type() === 'error') owned.push(msg.text());
        });
        const url = `http://127.0.0.1:${PORT}/web-studiya/kontekstnaya-reklama/google-ads/${city}/`;
        const resp = await page.goto(url, { waitUntil: 'networkidle', timeout: 60000 });
        await page.waitForTimeout(350);
        const metrics = await evaluatePage(page, width);
        const pageOwned = owned.filter((e) => !/ym\(|metrika|mc\.yandex|googletagmanager|ERR_CERT|Failed to load resource: net::ERR_/i.test(e));
        const failures = [...metrics.issues];
        if (!resp || !resp.ok()) failures.push(`HTTP ${resp && resp.status()}`);
        if (metrics.hScroll) failures.push(`h-scroll overflowPx=${metrics.overflowPx}`);
        if (pageOwned.length) failures.push(`page-owned errors: ${pageOwned.join(' | ')}`);

        const shots = {};
        if (needShot) {
          const fullPath = path.join(OUT, `${city}-${width}-full.png`);
          await page.screenshot({ path: fullPath, fullPage: true });
          shots.full = fullPath;
          report.shots.push(fullPath);
          for (const [name, sel] of SECTIONS) {
            const loc = page.locator(sel).first();
            if (await loc.count()) {
              try {
                await loc.scrollIntoViewIfNeeded();
                await page.waitForTimeout(80);
                const pth = path.join(OUT, `${city}-${width}-${name}.png`);
                await loc.screenshot({ path: pth });
                shots[name] = pth;
                report.shots.push(pth);
              } catch (e) {
                issuesSafe(failures, `${name} screenshot: ${e.message}`);
              }
            }
          }
        }

        const vp = {
          width,
          status: resp ? resp.status() : 0,
          screenshotRequired: needShot,
          failures,
          metrics,
          shots,
        };
        if (failures.length) {
          report.ok = false;
          report.errors.push(`${city}@${width}: ${failures.join('; ')}`);
        }
        cityResult.viewports.push(vp);
        await page.close();
      }
      report.pages.push(cityResult);
    }
  } finally {
    await browser.close();
    await new Promise((r) => server.close(r));
  }

  const jsonPath = path.join(OUT, '027-report.json');
  const slim = {
    ok: report.ok,
    errors: report.errors,
    representative: REPRESENTATIVE,
    requiredFullShots: CITIES.length * 2 + 2,
    pages: report.pages.map((p) => ({
      city: p.city,
      viewports: p.viewports.map((v) => ({
        width: v.width,
        screenshotRequired: v.screenshotRequired,
        failures: v.failures,
        hScroll: v.metrics.hScroll,
        overflowPx: v.metrics.overflowPx,
        contracts: v.metrics.contracts,
        headings: v.metrics.headings,
        shots: Object.fromEntries(Object.entries(v.shots).map(([k, val]) => [k, path.basename(val)])),
      })),
    })),
  };
  fs.writeFileSync(jsonPath, JSON.stringify(slim, null, 2));
  console.log(JSON.stringify({
    ok: slim.ok,
    errors: slim.errors,
    json: jsonPath,
    out: OUT,
    summary: slim.pages.map((p) => ({
      city: p.city,
      vps: p.viewports.map((v) => ({
        w: v.width,
        fail: v.failures,
        hScroll: v.hScroll,
        scope: `${v.contracts.scopeIcons}/${v.contracts.scopeItems}`,
        cards: `${v.contracts.cardVisuals}/${v.contracts.cards}`,
        camps: `${v.contracts.campVisuals}/${v.contracts.camps}`,
        tasks: `${v.contracts.taskMarks}/${v.contracts.taskLis}`,
        fullShot: v.shots.full || null,
      })),
    })),
  }, null, 2));
  process.exit(report.ok ? 0 : 1);

  function issuesSafe(failures, msg) {
    failures.push(msg);
  }
})().catch((err) => {
  console.error(err);
  process.exit(1);
});
