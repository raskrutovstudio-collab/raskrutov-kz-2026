const { chromium } = require("playwright");
const fs = require("fs");
const path = require("path");
const cand = process.argv[2];
const files = fs.readdirSync(cand).filter((f) => f.endsWith(".webp") && f.includes("__")).sort();
(async () => {
  const browser = await chromium.launch({ headless: true, channel: "chrome" });
  const page = await browser.newPage();
  const results = [];
  for (const f of files) {
    const full = path.join(cand, f);
    const buf = fs.readFileSync(full);
    const dataUrl = "data:image/webp;base64," + buf.toString("base64");
    await page.setContent(
      "<!DOCTYPE html><html><body><img id=\"i\" src=\"" + dataUrl + "\"></body></html>"
    );
    await page.waitForFunction(() => {
      const img = document.getElementById("i");
      return img && img.complete && img.naturalWidth > 0;
    }, null, { timeout: 10000 });
    const dims = await page.evaluate(() => {
      const img = document.getElementById("i");
      return { w: img.naturalWidth, h: img.naturalHeight };
    });
    const m = f.match(/^(.+)__(gradient|color)__(\d+)\.webp$/);
    if (!m) {
      console.error("SKIP " + f);
      continue;
    }
    results.push({
      name: m[1],
      material: m[2],
      size: Number(m[3]),
      status: 200,
      bytes: buf.length,
      w: dims.w,
      h: dims.h,
    });
    console.error(m[1] + "|" + m[2] + "|" + m[3] + "|" + dims.w + "x" + dims.h + "|" + buf.length);
  }
  await browser.close();
  fs.writeFileSync(path.join(cand, "_dims_out.json"), JSON.stringify(results, null, 2));
  console.log("DONE " + results.length);
})().catch((e) => {
  console.error(e);
  process.exit(1);
});