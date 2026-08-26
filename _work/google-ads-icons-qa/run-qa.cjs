const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');
const http = require('http');

const ROOT = path.resolve(__dirname, '..', '..');
const SITE = path.join(ROOT, 'site_mirror');
const OUT = path.join(ROOT, 'site_mirror', '_work', 'google-ads-icons-qa');
const PAGE = '/web-studiya/kontekstnaya-reklama/google-ads/';
const PORT = 4173;

fs.mkdirSync(OUT, { recursive: true });

function serve() {
  return new Promise((resolve) => {
    const server = http.createServer((req, res) => {
      let urlPath = decodeURIComponent((req.url || '/').split('?')[0]);
      if (urlPath.endsWith('/')) urlPath += 'index.html';
      const file = path.join(SITE, urlPath.replace(/^\//, ''));
      if (!file.startsWith(SITE) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) {
        res.writeHead(404); res.end('404'); return;
      }
      const ext = path.extname(file).toLowerCase();
      const types = { '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'application/javascript; charset=utf-8', '.svg': 'image/svg+xml', '.webp': 'image/webp', '.png': 'image/png', '.woff2': 'font/woff2' };
      res.writeHead(200, { 'Content-Type': types[ext] || 'application/octet-stream' });
      fs.createReadStream(file).pipe(res);
    });
    server.listen(PORT, '127.0.0.1', () => resolve(server));
  });
}

(async () => {
  let server;
  try {
    server = await serve();
  } catch (e) {
    server = null; // already running
  }

  const browser = await chromium.launch({ headless: true, channel: 'chrome' });
  const report = { widths: {}, fontSize: {}, presence: {}, seo: {}, forms: {}, consoleErrors: [], issues: [] };

  for (const width of [1440, 1024, 768, 390, 360]) {
    const context = await browser.newContext({ viewport: { width, height: width >= 1024 ? 900 : 844 } });
    const page = await context.newPage();
    const cons = [];
    page.on('console', (m) => { if (m.type() === 'error') cons.push(m.text()); });
    page.on('pageerror', (e) => cons.push(String(e.message)));
    await page.goto(`http://127.0.0.1:${PORT}${PAGE}`, { waitUntil: 'domcontentloaded', timeout: 60000 });
    await page.waitForTimeout(400);

    const metrics = await page.evaluate(() => {
      const title = document.querySelector('.gads-about-heading__title, #about h2');
      const cs = title ? getComputedStyle(title) : null;
      return {
        fontSize: cs ? cs.fontSize : null,
        scrollWidth: document.documentElement.scrollWidth,
        innerWidth: window.innerWidth,
        icon: !!document.querySelector('.gads-about-heading__icon'),
        visuals: document.querySelectorAll('.gads-card__visual').length,
        campVisuals: document.querySelectorAll('.gads-camp__visual').length,
        h1: document.querySelector('h1')?.textContent?.trim(),
        h1Count: document.querySelectorAll('h1').length,
        modal: !!document.querySelector('#rk-modal-lead'),
        ym: /mc\.yandex|ym\(/i.test(document.documentElement.innerHTML)
      };
    });

    report.widths[width] = {
      ok: metrics.scrollWidth <= metrics.innerWidth + 1,
      scrollWidth: metrics.scrollWidth,
      innerWidth: metrics.innerWidth
    };
    if (width === 1440 || width === 390) {
      report.fontSize[width] = metrics.fontSize;
    }
    if (width === 1440) {
      report.presence = {
        aboutIcon: metrics.icon,
        audienceVisuals: metrics.visuals,
        campVisuals: metrics.campVisuals
      };
      report.seo = { h1: metrics.h1, h1Count: metrics.h1Count };
      report.forms = { modal: metrics.modal, ym: metrics.ym };
      await page.locator('#about').screenshot({ path: path.join(OUT, 'about-1440.png') });
      await page.locator('#audience').screenshot({ path: path.join(OUT, 'audience-1440.png') });
      await page.locator('#campaign-types').screenshot({ path: path.join(OUT, 'campaigns-1440.png') });
    }
    if (width === 390) {
      await page.locator('#about').screenshot({ path: path.join(OUT, 'about-390.png') });
      await page.locator('#audience').screenshot({ path: path.join(OUT, 'audience-390.png') });
      await page.locator('#campaign-types').screenshot({ path: path.join(OUT, 'campaigns-390.png') });
    }
    for (const c of cons) {
      if (!/favicon|ERR_CERT/i.test(c)) report.consoleErrors.push({ width, text: c });
    }
    if (!report.widths[width].ok) report.issues.push(`overflow@${width}`);
    await context.close();
  }

  const sizes = {
    html: fs.statSync(path.join(SITE, 'web-studiya/kontekstnaya-reklama/google-ads/index.html')).size,
    css: fs.statSync(path.join(SITE, 'assets/css/google-ads-page.css')).size,
    iconSvg: fs.statSync(path.join(SITE, 'assets/img/google-ads/google-ads-icon.svg')).size
  };
  report.sizes = sizes;

  fs.writeFileSync(path.join(OUT, 'qa-report.json'), JSON.stringify(report, null, 2));
  console.log(JSON.stringify(report, null, 2));
  await browser.close();
  if (server) server.close();
  process.exit(report.issues.length ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(1); });
