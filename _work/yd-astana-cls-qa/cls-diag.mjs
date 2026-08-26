import puppeteer from "puppeteer-core";
import fs from "fs";
import path from "path";

const chrome = process.env.CHROME;
const outDir = process.env.OUT;
const url = process.env.URL;

async function run(width, height, isMobile, label) {
  const browser = await puppeteer.launch({
    executablePath: chrome,
    headless: "new",
    args: ["--no-sandbox", "--disable-gpu", `--window-size=${width},${height}`],
  });
  const page = await browser.newPage();
  await page.setViewport({
    width,
    height,
    deviceScaleFactor: isMobile ? 2 : 1,
    isMobile,
    hasTouch: isMobile,
  });
  await page.setCacheEnabled(false);
  const cssReqs = [];
  page.on("request", (req) => {
    if (req.url().includes("yandex-direct-page.css")) cssReqs.push(req.url());
  });
  await page.evaluateOnNewDocument(() => {
    window.__cls = { total: 0, shifts: [] };
    new PerformanceObserver((list) => {
      for (const e of list.getEntries()) {
        const src = e.sources && e.sources[0];
        const node = src && src.node;
        const info = {
          value: e.value,
          hadRecentInput: e.hadRecentInput,
          startTime: e.startTime,
          node: node
            ? node.id
              ? "#" + node.id
              : node.tagName +
                (node.className
                  ? "." +
                    String(node.className)
                      .trim()
                      .split(/\s+/)
                      .slice(0, 2)
                      .join(".")
                  : "")
            : null,
        };
        window.__cls.shifts.push(info);
        if (!e.hadRecentInput) window.__cls.total += e.value;
      }
    }).observe({ type: "layout-shift", buffered: true });
  });
  await page.goto(url, { waitUntil: "domcontentloaded", timeout: 60000 });
  const earlyMedia = await page.evaluate(() => {
    const l = [...document.querySelectorAll("link[rel=stylesheet]")].find((x) =>
      (x.getAttribute("href") || "").includes("yandex-direct-page")
    );
    return l ? { media: l.media, sheet: !!l.sheet } : null;
  });
  await page.waitForFunction(() => document.readyState === "complete", {
    timeout: 30000,
  });
  await new Promise((r) => setTimeout(r, 1500));
  const after = await page.evaluate(() => {
    const l = [...document.querySelectorAll("link[rel=stylesheet]")].find((x) =>
      (x.getAttribute("href") || "").includes("yandex-direct-page")
    );
    const sa = document.querySelector("#short-answer");
    const r = sa && sa.getBoundingClientRect();
    const shortCls = (window.__cls.shifts || [])
      .filter((s) => s.node === "#short-answer")
      .reduce((a, b) => a + (b.hadRecentInput ? 0 : b.value), 0);
    return {
      media: l && l.media,
      sheet: !!(l && l.sheet),
      cls: window.__cls,
      shortCls,
      saTop: r && r.top,
      saH: r && r.height,
      docW: document.documentElement.scrollWidth,
      vw: innerWidth,
    };
  });
  await page.screenshot({
    path: path.join(outDir, label + ".png"),
    fullPage: true,
  });
  await browser.close();
  return { label, width, earlyMedia, after, cssReqCount: cssReqs.length };
}

const results = [];
for (const c of [
  [1440, 900, false, "astana-1440"],
  [390, 844, true, "astana-390"],
  [430, 932, true, "astana-430"],
  [768, 1024, false, "astana-768"],
]) {
  results.push(await run(c[0], c[1], c[2], c[3]));
}
fs.writeFileSync(
  path.join(outDir, "cls-media-diag.json"),
  JSON.stringify(results, null, 2)
);
for (const r of results) {
  console.log(
    r.label,
    "early",
    JSON.stringify(r.earlyMedia),
    "afterMedia",
    r.after.media,
    "CLS",
    r.after.cls.total,
    "shortCls",
    r.after.shortCls,
    "shifts",
    JSON.stringify(r.after.cls.shifts),
    "cssReqs",
    r.cssReqCount,
    "hScroll",
    r.after.docW > r.after.vw + 1
  );
}
