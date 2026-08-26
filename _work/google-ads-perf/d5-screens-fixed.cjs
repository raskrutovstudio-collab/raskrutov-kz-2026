/**
 * D5 corrected: capture at exact performance.now() milestones via in-page RAF,
 * then also record whether paint has happened yet.
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
  // No CPU throttle for accurate timed screenshots
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
    window.__marks = {};
    function mark(name) {
      const lead = document.querySelector("p.ctx-hero__lead");
      const cs = lead ? getComputedStyle(lead) : null;
      const paint = performance.getEntriesByType("paint");
      window.__marks[name] = {
        t: performance.now(),
        hasLead: !!lead,
        opacity: cs ? cs.opacity : null,
        visibility: cs ? cs.visibility : null,
        fontFamily: cs ? cs.fontFamily : null,
        fontWeight: cs ? cs.fontWeight : null,
        color: cs ? cs.color : null,
        paint: paint.map((p) => ({ name: p.name, startTime: p.startTime })),
        check400: document.fonts
          ? document.fonts.check("400 16px Montserrat")
          : null,
      };
    }
    const targets = [1500, 2500];
    function loop() {
      const now = performance.now();
      for (const t of targets) {
        const key = "t" + t;
        if (!window.__marks[key] && now >= t) mark(key);
      }
      if (!window.__marks.t1500 || !window.__marks.t2500) {
        requestAnimationFrame(loop);
      }
    }
    requestAnimationFrame(loop);
  });

  await page.goto(URL, { waitUntil: "commit", timeout: 120000 });

  // Wait until both marks exist
  await page.waitForFunction(
    () => window.__marks && window.__marks.t1500 && window.__marks.t2500,
    null,
    { timeout: 120000 }
  );

  // Screenshot as soon as each mark is ready — navigate twice for clean shots
  await browser.close();

  // Two separate navigations for accurate screenshots at ~1500 and ~2500
  async function shotAt(targetMs, filename) {
    const b = await chromium.launch({ headless: true });
    const ctx = await b.newContext({
      viewport: { width: 390, height: 844 },
      deviceScaleFactor: 3,
      isMobile: true,
      hasTouch: true,
    });
    const p = await ctx.newPage();
    await applyThrottle(p);
    await p.addInitScript((ms) => {
      window.__ready = false;
      window.__state = null;
      function grab() {
        const lead = document.querySelector("p.ctx-hero__lead");
        const cs = lead ? getComputedStyle(lead) : null;
        const paint = performance.getEntriesByType("paint");
        window.__state = {
          t: performance.now(),
          hasLead: !!lead,
          opacity: cs ? cs.opacity : null,
          visibility: cs ? cs.visibility : null,
          fontFamily: cs ? cs.fontFamily : null,
          fontWeight: cs ? cs.fontWeight : null,
          color: cs ? cs.color : null,
          text: lead ? (lead.textContent || "").slice(0, 60) : null,
          paint: paint.map((x) => ({ name: x.name, startTime: x.startTime })),
          check400: document.fonts
            ? document.fonts.check("400 16px Montserrat")
            : null,
        };
        window.__ready = true;
      }
      function loop() {
        if (performance.now() >= ms) grab();
        else requestAnimationFrame(loop);
      }
      requestAnimationFrame(loop);
    }, targetMs);

    await p.goto(URL, { waitUntil: "commit", timeout: 120000 });
    await p.waitForFunction(() => window.__ready === true, null, {
      timeout: 120000,
    });
    // tiny yield so layout paints
    await p.waitForTimeout(50);
    const file = path.join(OUT_DIR, filename);
    await p.screenshot({ path: file, fullPage: false });
    const state = await p.evaluate(() => window.__state);
    await b.close();
    return { file, state };
  }

  const s1500 = await shotAt(1500, "screenshot-1500ms.png");
  const s2500 = await shotAt(2500, "screenshot-2500ms.png");

  const out = { s1500, s2500 };
  fs.writeFileSync(
    path.join(OUT_DIR, "d5-font-screens-corrected.json"),
    JSON.stringify(out, null, 2)
  );
  console.log(JSON.stringify(out, null, 2));
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
