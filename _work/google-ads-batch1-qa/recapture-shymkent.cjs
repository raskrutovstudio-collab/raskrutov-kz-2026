const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');
const http = require('http');

const ROOT = path.resolve(__dirname, '../../..');
const SITE = path.join(ROOT, 'site_mirror');
const OUT = path.join(__dirname, 'screenshots');
const PORT = 4178;
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

(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  const server = await serve();
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 390, height: 2000 } });
  const url = `http://127.0.0.1:${PORT}/web-studiya/kontekstnaya-reklama/google-ads/shymkent/`;
  const resp = await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 });
  console.log('HTTP', resp ? resp.status() : 'no-response', url);

  const setup = page.locator('#setup');
  await setup.waitFor({ state: 'attached', timeout: 15000 });
  await setup.evaluate((el) => el.scrollIntoView({ block: 'start' }));
  await page.waitForTimeout(300);

  const setupPath = path.join(OUT, 'shymkent-390-setup.png');
  const fullPath = path.join(OUT, 'shymkent-390-full.png');
  await setup.screenshot({ path: setupPath });
  await page.screenshot({ path: fullPath, fullPage: true });
  console.log('wrote', setupPath);
  console.log('wrote', fullPath);

  const boxes = await page.evaluate(() => {
    const setupEl = document.querySelector('#setup');
    const setupBox = setupEl ? setupEl.getBoundingClientRect() : null;
    const items = [...document.querySelectorAll('.gads-scope-list__item')].map((li, i) => {
      const content = li.querySelector(':scope > div');
      const box = content ? content.getBoundingClientRect() : null;
      return {
        i,
        contentWidth: box ? Math.round(box.width * 100) / 100 : null,
        contentLeft: box ? Math.round(box.left * 100) / 100 : null,
        contentTop: box ? Math.round(box.top * 100) / 100 : null,
        contentHeight: box ? Math.round(box.height * 100) / 100 : null,
      };
    });
    return {
      setup: setupBox
        ? {
            x: Math.round(setupBox.x * 100) / 100,
            y: Math.round(setupBox.y * 100) / 100,
            width: Math.round(setupBox.width * 100) / 100,
            height: Math.round(setupBox.height * 100) / 100,
            top: Math.round(setupBox.top * 100) / 100,
            left: Math.round(setupBox.left * 100) / 100,
            bottom: Math.round(setupBox.bottom * 100) / 100,
            right: Math.round(setupBox.right * 100) / 100,
          }
        : null,
      items,
    };
  });
  console.log(JSON.stringify(boxes, null, 2));

  await browser.close();
  server.close();
})().catch((err) => {
  console.error(err);
  process.exit(1);
});
