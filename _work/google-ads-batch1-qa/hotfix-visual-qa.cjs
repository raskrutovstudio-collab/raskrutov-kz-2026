const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');
const http = require('http');

const ROOT = path.resolve(__dirname, '../../..');
const SITE = path.join(ROOT, 'site_mirror');
const OUT = path.join(SITE, '_work', 'google-ads-batch1-qa', 'screenshots');
const PORT = Number(process.env.QA_PORT || 4177);
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

const pages = [
  { city: 'astana', viewports: [390, 430, 768, 1440] },
  { city: 'almaty', viewports: [390, 1440] },
  { city: 'shymkent', viewports: [390, 1440] },
  { city: 'karaganda', viewports: [390, 1440] },
  { city: 'aktobe', viewports: [390, 1440] },
];

const sectionSelectors = [
  '#setup',
  '#ctx-hero, .ctx-hero, .gads-hero',
  '.gads-camps, #campaigns, [id*="camp"]',
  '.gads-manage, #management, [id*="manage"]',
  '.gads-analytics, #analytics',
  '.gads-price-board, #pricing, .gads-pricing',
  '.gads-faq, #faq',
  'footer',
];

async function measure(page) {
  return page.evaluate(() => {
    const overflow = document.documentElement.scrollWidth > document.documentElement.clientWidth + 1;
    const items = [...document.querySelectorAll('.gads-scope-list__item')].map((li, i) => {
      const icon = li.querySelector('.gads-scope-list__icon');
      const content = li.querySelector(':scope > div');
      const grid = getComputedStyle(li).gridTemplateColumns;
      const contentBox = content ? content.getBoundingClientRect() : null;
      return {
        i,
        hasIcon: !!icon,
        grid,
        itemWidth: Math.round(li.getBoundingClientRect().width),
        contentWidth: contentBox ? Math.round(contentBox.width) : 0,
        contentLeft: contentBox ? Math.round(contentBox.left) : null,
        iconWidth: icon ? Math.round(icon.getBoundingClientRect().width) : 0,
      };
    });
    const hScrollEls = [...document.querySelectorAll('body *')].filter((el) => {
      const r = el.getBoundingClientRect();
      return r.width > 0 && r.right > document.documentElement.clientWidth + 2;
    }).slice(0, 8).map((el) => el.className || el.id || el.tagName);
    const pageErrors = [];
    return {
      overflow,
      hScrollEls,
      items,
      h1: document.querySelectorAll('h1').length,
      setup: !!document.querySelector('#setup'),
      pageErrors,
    };
  });
}

(async () => {
  const report = { ok: true, pages: [], errors: [] };
  const server = await serve();
  const browser = await chromium.launch({ headless: true });
  const consoleErrors = [];

  try {
    for (const spec of pages) {
      const url = `http://127.0.0.1:${PORT}/web-studiya/kontekstnaya-reklama/google-ads/${spec.city}/`;
      const cityResult = { city: spec.city, url, viewports: [] };
      for (const width of spec.viewports) {
        const page = await browser.newPage({
          viewport: { width, height: width <= 430 ? 844 : 900 },
          deviceScaleFactor: 1,
        });
        const ownedErrors = [];
        page.on('pageerror', (err) => ownedErrors.push(String(err)));
        page.on('console', (msg) => {
          if (msg.type() === 'error') ownedErrors.push(msg.text());
        });
        const resp = await page.goto(url, { waitUntil: 'networkidle', timeout: 60000 });
        await page.waitForTimeout(400);
        const metrics = await measure(page);
        const desktop = width >= 800;
        const failures = [];
        if (!resp || !resp.ok()) failures.push(`HTTP ${resp && resp.status()}`);
        if (metrics.h1 !== 1) failures.push(`h1=${metrics.h1}`);
        if (!metrics.setup) failures.push('missing #setup');
        if (metrics.overflow) failures.push('horizontal overflow');
        if (metrics.items.length !== 6) failures.push(`scope items=${metrics.items.length}`);
        for (const item of metrics.items) {
          if (!item.hasIcon) failures.push(`item ${item.i} missing icon`);
          if (desktop && item.contentWidth <= 200) {
            failures.push(`item ${item.i} contentWidth=${item.contentWidth} (<=200)`);
          }
          if (desktop && item.contentWidth <= 50) {
            failures.push(`item ${item.i} collapsed into ~40px column`);
          }
          if (!/40px/.test(item.grid) && !item.grid.includes('40px')) {
            // still ok if auto, but report
          }
        }
        const shotFull = path.join(OUT, `${spec.city}-${width}-full.png`);
        const shotSetup = path.join(OUT, `${spec.city}-${width}-setup.png`);
        const shotHero = path.join(OUT, `${spec.city}-${width}-hero.png`);
        await page.screenshot({ path: shotFull, fullPage: true });
        const setup = page.locator('#setup');
        if (await setup.count()) await setup.screenshot({ path: shotSetup });
        const hero = page.locator('#ctx-hero, .ctx-hero').first();
        if (await hero.count()) await hero.screenshot({ path: shotHero });
        const vp = {
          width,
          status: resp ? resp.status() : 0,
          failures,
          ownedErrors: ownedErrors.filter((e) => !/ym\(|metrika|mc\.yandex|googletagmanager/i.test(e)),
          metrics,
          shots: { full: shotFull, setup: shotSetup, hero: shotHero },
        };
        if (failures.length || vp.ownedErrors.length) {
          report.ok = false;
          report.errors.push(`${spec.city}@${width}: ${[...failures, ...vp.ownedErrors].join('; ')}`);
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

  const jsonPath = path.join(OUT, '..', 'hotfix-visual-qa.json');
  fs.writeFileSync(jsonPath, JSON.stringify(report, null, 2));
  console.log(JSON.stringify({
    ok: report.ok,
    errors: report.errors,
    shots: OUT,
    json: jsonPath,
    summary: report.pages.map((p) => ({
      city: p.city,
      viewports: p.viewports.map((v) => ({
        width: v.width,
        fail: v.failures,
        contentWidths: v.metrics.items.map((i) => i.contentWidth),
        grids: v.metrics.items[0] && v.metrics.items[0].grid,
      })),
    })),
  }, null, 2));
  process.exit(report.ok ? 0 : 1);
})().catch((err) => {
  console.error(err);
  process.exit(1);
});
