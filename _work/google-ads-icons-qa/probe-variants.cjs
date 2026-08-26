const { chromium } = require('playwright');
(async () => {
  let browser;
  try { browser = await chromium.launch({ headless: true, channel: 'chrome' }); }
  catch { browser = await chromium.launch({ headless: true }); }
  const ctx = await browser.newContext();
  const req = ctx.request;
  async function probe(url) {
    try {
      let r = await req.fetch(url, { method: 'HEAD', timeout: 10000 });
      if ([400,403,405].includes(r.status())) {
        r = await req.fetch(url, { method: 'GET', timeout: 10000, headers: { Range: 'bytes=0-0' } });
      }
      return r.status();
    } catch (e) { return 'ERR:' + e.message; }
  }
  const base = 'https://bvconuycpdvgzbvbkijl.supabase.co/storage/v1/object/public/sizes/744cc0-rocket';
  const angles = ['dynamic','front','iso','clay','premium','gradient','plastic','flat'];
  const mats = ['color','clay','gradient','premium'];
  const sizes = ['16','32','48','60','64','100','128','200','256','300','400','512','1024'];
  console.log('=== angles x color @200 ===');
  for (const a of angles) {
    const u = `${base}/${a}/200/color.webp`;
    console.log(`[${await probe(u)}] ${u}`);
  }
  console.log('=== front x materials @200 ===');
  for (const m of mats) {
    const u = `${base}/front/200/${m}.webp`;
    console.log(`[${await probe(u)}] ${u}`);
  }
  console.log('=== dynamic x materials @200 ===');
  for (const m of mats) {
    const u = `${base}/dynamic/200/${m}.webp`;
    console.log(`[${await probe(u)}] ${u}`);
  }
  console.log('=== front/color sizes ===');
  for (const s of sizes) {
    const u = `${base}/front/${s}/color.webp`;
    console.log(`[${await probe(u)}] ${u}`);
  }
  // name-only without id fails; id-only?
  console.log('=== id-only folder ===');
  console.log(`[${await probe(base.replace('744cc0-rocket','744cc0') + '/dynamic/200/color.webp')}] id-only`);
  // detail page URL pattern
  console.log('=== site icon pages ===');
  for (const path of [
    'https://3dicons.co/icons/744cc0-rocket',
    'https://3dicons.co/icons/rocket',
    'https://3dicons.co/explore',
  ]) {
    const r = await req.get(path, { timeout: 20000 });
    console.log(`[${r.status()}] ${path}`);
  }
  await browser.close();
})().catch(e => { console.error(e); process.exit(1); });
