/**
 * D5: Screenshots at 1500ms and 2500ms + font timing for .ctx-hero__lead
 */
const { chromium } = require("playwright");
const fs = require("fs");
const path = require("path");

const URL =
  "http://127.0.0.1:4180/web-studiya/kontekstnaya-reklama/google-ads/";
const OUT_DIR = __dirname;

async function applyThrottle(page) {
  const client = await page.context().newCDPSession(page);
  await client.send("Network.enable");
  await client.send("Network.emulateNetworkConditions", {
    offline: false,
    latency: 150,
    downloadThroughput: Math.floor((1.6 * 1024 * 1024) / 8),
    uploadThroughput: Math.floor((750 * 1024) / 8),
    connectionType: "cellular3g",
  });
  await client.send("Emulation.setCPUThrottlingRate", { rate: 4 });
  return client;
}

async function main() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 3,
    isMobile: true,
    hasTouch: true,
  });
  const page = await context.newPage();
  await applyThrottle(page);

  await page.addInitScript(() => {
    window.__fontLog = [];
    if (document.fonts) {
      document.fonts.ready.then(() => {
        window.__fontsReadyAt = performance.now();
      });
    }
  });

  // Don't wait for networkidle — we need mid-load screenshots
  const navPromise = page.goto(URL, { waitUntil: "commit", timeout: 120000 });

  // Poll until navigation starts then schedule screenshots from navigationStart
  await navPromise;

  // Wait until performance.now() reaches targets relative to navigation
  async function waitUntilPerf(ms) {
    await page.waitForFunction(
      (target) => performance.now() >= target,
      ms,
      { timeout: 120000 }
    );
  }

  await waitUntilPerf(1500);
  const shot1500 = path.join(OUT_DIR, "screenshot-1500ms.png");
  await page.screenshot({ path: shot1500, fullPage: false });
  const state1500 = await page.evaluate(() => {
    const lead = document.querySelector("p.ctx-hero__lead");
    if (!lead) return { missing: true, t: performance.now() };
    const cs = getComputedStyle(lead);
    const rect = lead.getBoundingClientRect();
    return {
      t: performance.now(),
      text: (lead.textContent || "").slice(0, 80),
      opacity: cs.opacity,
      visibility: cs.visibility,
      color: cs.color,
      fontFamily: cs.fontFamily,
      fontWeight: cs.fontWeight,
      fontSize: cs.fontSize,
      rect: { top: rect.top, height: rect.height, width: rect.width },
      fontsReadyAt: window.__fontsReadyAt || null,
      check400: document.fonts
        ? document.fonts.check("400 16px Montserrat")
        : null,
      check700: document.fonts
        ? document.fonts.check("700 16px Montserrat")
        : null,
    };
  });

  await waitUntilPerf(2500);
  const shot2500 = path.join(OUT_DIR, "screenshot-2500ms.png");
  await page.screenshot({ path: shot2500, fullPage: false });
  const state2500 = await page.evaluate(() => {
    const lead = document.querySelector("p.ctx-hero__lead");
    if (!lead) return { missing: true, t: performance.now() };
    const cs = getComputedStyle(lead);
    const rect = lead.getBoundingClientRect();
    return {
      t: performance.now(),
      text: (lead.textContent || "").slice(0, 80),
      opacity: cs.opacity,
      visibility: cs.visibility,
      color: cs.color,
      fontFamily: cs.fontFamily,
      fontWeight: cs.fontWeight,
      fontSize: cs.fontSize,
      rect: { top: rect.top, height: rect.height, width: rect.width },
      fontsReadyAt: window.__fontsReadyAt || null,
      check400: document.fonts
        ? document.fonts.check("400 16px Montserrat")
        : null,
      check700: document.fonts
        ? document.fonts.check("700 16px Montserrat")
        : null,
    };
  });

  // Wait for more resources / LCP
  await page.waitForTimeout(3000);
  const final = await page.evaluate(() => {
    const paint = performance.getEntriesByType("paint");
    const lcp = performance.getEntriesByType("largest-contentful-paint");
    const fonts = [];
    if (document.fonts) {
      document.fonts.forEach((f) =>
        fonts.push({
          family: f.family,
          weight: f.weight,
          status: f.status,
          style: f.style,
        })
      );
    }
    const fontRes = performance
      .getEntriesByType("resource")
      .filter((r) => /woff2|montserrat/i.test(r.name))
      .map((r) => ({
        name: r.name,
        startTime: r.startTime,
        responseEnd: r.responseEnd,
        transferSize: r.transferSize,
        decodedBodySize: r.decodedBodySize,
      }));
    const lead = document.querySelector("p.ctx-hero__lead");
    const cs = lead ? getComputedStyle(lead) : null;
    return {
      paint: paint.map((e) => ({ name: e.name, startTime: e.startTime })),
      lcp: lcp.map((e) => ({
        startTime: e.startTime,
        size: e.size,
        element: e.element
          ? e.element.tagName +
            (e.element.className
              ? "." + String(e.element.className).trim().split(/\s+/).join(".")
              : "")
          : null,
      })),
      fonts,
      fontRes,
      fontsReadyAt: window.__fontsReadyAt,
      leadWeight: cs ? cs.fontWeight : null,
      leadFamily: cs ? cs.fontFamily : null,
    };
  });

  const out = { state1500, state2500, final, shot1500, shot2500 };
  fs.writeFileSync(
    path.join(OUT_DIR, "d5-font-screens.json"),
    JSON.stringify(out, null, 2)
  );
  console.log(JSON.stringify(out, null, 2));
  await browser.close();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
