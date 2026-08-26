import { chromium } from 'playwright';
import fs from 'node:fs';
import path from 'node:path';

const ORIGIN = process.env.QA_ORIGIN || 'http://127.0.0.1:8791';
const URL = ORIGIN + '/web-studiya/kontekstnaya-reklama/yandex-direct/karaganda/';
const OUT = path.resolve('site_mirror/_work/yandex-direct-regional-scale/karaganda/slices');
fs.mkdirSync(OUT, { recursive: true });

const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const browser = fs.existsSync(CHROME)
  ? await chromium.launch({ executablePath: CHROME })
  : await chromium.launch({ channel: 'chrome' });

for (const vp of [{ w: 390, h: 844, mobile: true }, { w: 1440, h: 900, mobile: false }]) {
  const ctx = await browser.newContext({
    viewport: { width: vp.w, height: vp.h },
    deviceScaleFactor: 1,
    isMobile: vp.mobile,
    hasTouch: vp.mobile
  });
  const page = await ctx.newPage();
  await page.goto(URL, { waitUntil: 'networkidle' });
  await page.addStyleTag({ content: '*, *::before, *::after { content-visibility: visible !important; contain-intrinsic-size: none !important; }' });
  // force all lazy images to load
  await page.evaluate(async () => {
    document.querySelectorAll('img[loading="lazy"]').forEach((i) => i.setAttribute('loading', 'eager'));
    const step = window.innerHeight;
    for (let y = 0; y < document.documentElement.scrollHeight; y += step) {
      window.scrollTo(0, y);
      await new Promise((r) => setTimeout(r, 90));
    }
    window.scrollTo(0, 0);
    await new Promise((r) => setTimeout(r, 400));
  });
  await page.waitForTimeout(600);

  const sections = await page.evaluate(() =>
    [...document.querySelectorAll('main section, header, .rk-footer, footer')].map((el) => ({
      id: el.id || el.className.split(/\s+/)[0] || el.tagName.toLowerCase(),
      top: Math.round(el.getBoundingClientRect().top + window.scrollY),
      h: Math.round(el.getBoundingClientRect().height)
    }))
  );

  const MAX = 2400;
  let n = 0;
  for (const s of sections) {
    let y = s.top;
    let left = s.h;
    let part = 0;
    if (left <= 0) continue;
    while (left > 0) {
      const h = Math.min(left, MAX);
      n++;
      const name = `${vp.w}-${String(n).padStart(2, '0')}-${s.id}${part ? '-p' + (part + 1) : ''}.png`;
      await page.screenshot({
        path: path.join(OUT, name),
        fullPage: true,
        clip: { x: 0, y, width: vp.w, height: h }
      });
      y += h; left -= h; part++;
    }
  }
  console.log(vp.w, 'slices:', n);
  await ctx.close();
}
await browser.close();
