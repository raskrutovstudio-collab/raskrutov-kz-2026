import { chromium } from 'playwright';

const urls = [
  'https://raskrutov.kz/web-studiya/kontekstnaya-reklama/google-ads/almaty/',
  'https://raskrutov.kz/web-studiya/kontekstnaya-reklama/google-ads/shymkent/',
  'https://raskrutov.kz/web-studiya/kontekstnaya-reklama/google-ads/karaganda/',
  'https://raskrutov.kz/web-studiya/kontekstnaya-reklama/google-ads/aktobe/',
];

const browser = await chromium.launch({ headless: true });
for (const url of urls) {
  const page = await browser.newPage();
  const errors = [];
  page.on('pageerror', (e) => errors.push('pageerror:' + e.message));
  page.on('console', (msg) => {
    if (msg.type() === 'error') errors.push(msg.text());
  });
  await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 45000 });
  await page.waitForTimeout(1200);
  const hScroll = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  const owned = errors.filter((e) => !/yandex|metrika|mc\.yandex|ERR_BLOCKED|net::ERR/i.test(e));
  console.log(JSON.stringify({ url, hScroll, consoleAll: errors.length, pageOwned: owned, errors: errors.slice(0, 8) }));
  await page.close();
}
await browser.close();
