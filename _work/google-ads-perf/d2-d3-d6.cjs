/**
 * Google Ads LCP diagnosis: D2 styles timeline, D3 paint correlation, D6 HTML weight.
 * Mobile emulation + Slow 4G + 4x CPU via CDP.
 */
const { chromium } = require("playwright");
const fs = require("fs");
const path = require("path");

const URL =
  process.env.DIAG_URL ||
  "http://127.0.0.1:4180/web-studiya/kontekstnaya-reklama/google-ads/";
const OUT_DIR = __dirname;
const PROPS = [
  "display",
  "visibility",
  "opacity",
  "contentVisibility",
  "contain",
  "transform",
  "filter",
  "animation",
  "animationDelay",
  "transitionProperty",
  "transitionDelay",
  "fontFamily",
  "fontWeight",
];

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
    userAgent:
      "Mozilla/5.0 (Linux; Android 11; Pixel 5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36",
  });
  const page = await context.newPage();
  await applyThrottle(page);

  await page.addInitScript(() => {
    window.__diag = {
      snapshots: [],
      lcpEntries: [],
      fonts: [],
      longTasks: [],
      fontsReadyAt: null,
      heroAttrsT0: null,
      heroAttrsT2000: null,
      earlyPollDone: false,
    };

    const PROPS = [
      "display",
      "visibility",
      "opacity",
      "contentVisibility",
      "contain",
      "transform",
      "filter",
      "animation",
      "animationDelay",
      "transitionProperty",
      "transitionDelay",
      "fontFamily",
      "fontWeight",
    ];

    function cssPath(el) {
      if (!el || el.nodeType !== 1) return "";
      if (el === document.documentElement) return "html";
      if (el === document.body) return "body";
      if (el.id) return "#" + el.id;
      const tag = el.tagName.toLowerCase();
      const cls = (el.className && String(el.className).trim())
        ? "." + String(el.className).trim().split(/\s+/).slice(0, 3).join(".")
        : "";
      return tag + cls;
    }

    function snapshotChain(label) {
      const lead = document.querySelector("p.ctx-hero__lead");
      if (!lead) {
        window.__diag.snapshots.push({
          label,
          t: performance.now(),
          missing: true,
        });
        return;
      }
      const chain = [];
      let el = lead;
      while (el) {
        const cs = getComputedStyle(el);
        const styles = {};
        for (const p of PROPS) styles[p] = cs[p];
        chain.push({
          sel: cssPath(el),
          tag: el.tagName,
          id: el.id || null,
          className: el.className || null,
          styles,
        });
        el = el.parentElement;
      }
      window.__diag.snapshots.push({
        label,
        t: performance.now(),
        chain,
      });
    }

    function heroAttrDump() {
      const nodes = [];
      let el = document.querySelector("#ctx-hero");
      while (el) {
        const attrs = {};
        for (const a of el.attributes || []) attrs[a.name] = a.value;
        nodes.push({
          sel: cssPath(el),
          attrs,
          outerStart: (el.outerHTML || "").slice(0, 200),
        });
        el = el.parentElement;
      }
      return nodes;
    }

    // Early polling until lead exists
    const earlyIv = setInterval(() => {
      if (document.querySelector("p.ctx-hero__lead")) {
        if (!window.__diag.earlyPollDone) {
          window.__diag.earlyPollDone = true;
          snapshotChain("early-as-possible");
          window.__diag.heroAttrsT0 = heroAttrDump();
        }
        clearInterval(earlyIv);
      }
    }, 8);

    document.addEventListener("DOMContentLoaded", () => {
      snapshotChain("DOMContentLoaded");
    });

    const navStartTarget = performance.timeOrigin;
    function scheduleFromNav(ms, label) {
      const elapsed = performance.now();
      const wait = Math.max(0, ms - elapsed);
      setTimeout(() => {
        snapshotChain(label);
        if (label === "t=2000") {
          window.__diag.heroAttrsT2000 = heroAttrDump();
        }
      }, wait);
    }
    scheduleFromNav(500, "t=500");
    scheduleFromNav(1000, "t=1000");
    scheduleFromNav(2000, "t=2000");

    try {
      const po = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          window.__diag.lcpEntries.push({
            startTime: entry.startTime,
            size: entry.size,
            url: entry.url || "",
            id: entry.id || "",
            element:
              entry.element && entry.element.tagName
                ? (() => {
                    const e = entry.element;
                    let s = e.tagName.toLowerCase();
                    if (e.id) s += "#" + e.id;
                    if (e.className)
                      s +=
                        "." +
                        String(e.className)
                          .trim()
                          .split(/\s+/)
                          .slice(0, 4)
                          .join(".");
                    return s;
                  })()
                : null,
          });
          // Snapshot styles at this LCP candidate moment
          snapshotChain("LCP@" + Math.round(entry.startTime));
        }
      });
      po.observe({ type: "largest-contentful-paint", buffered: true });
    } catch (e) {
      window.__diag.lcpObsError = String(e);
    }

    try {
      const lt = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          window.__diag.longTasks.push({
            startTime: entry.startTime,
            duration: entry.duration,
            name: entry.name,
            attribution: (entry.attribution || []).map((a) => ({
              name: a.name,
              entryType: a.entryType,
              startTime: a.startTime,
              duration: a.duration,
              containerType: a.containerType,
              containerSrc: a.containerSrc,
              containerId: a.containerId,
              containerName: a.containerName,
            })),
          });
        }
      });
      lt.observe({ type: "longtask", buffered: true });
    } catch (e) {
      window.__diag.longTaskError = String(e);
    }

    // Font face set monitoring
    if (document.fonts) {
      document.fonts.addEventListener("loadingdone", (ev) => {
        window.__diag.fonts.push({
          event: "loadingdone",
          t: performance.now(),
          faces: Array.from(ev.fontfaces || []).map((f) => ({
            family: f.family,
            weight: f.weight,
            status: f.status,
            style: f.style,
          })),
        });
      });
      document.fonts.addEventListener("loadingerror", (ev) => {
        window.__diag.fonts.push({
          event: "loadingerror",
          t: performance.now(),
          faces: Array.from(ev.fontfaces || []).map((f) => ({
            family: f.family,
            weight: f.weight,
            status: f.status,
          })),
        });
      });
      document.fonts.ready.then(() => {
        window.__diag.fontsReadyAt = performance.now();
        const faces = [];
        document.fonts.forEach((f) => {
          faces.push({
            family: f.family,
            weight: f.weight,
            status: f.status,
            style: f.style,
          });
        });
        window.__diag.fontsAtReady = faces;
      });
    }
  });

  const navResp = await page.goto(URL, {
    waitUntil: "networkidle",
    timeout: 120000,
  });

  // Wait past LCP / 4s for delayed snapshots
  await page.waitForTimeout(4500);

  const data = await page.evaluate(() => {
    const paint = performance.getEntriesByType("paint").map((e) => ({
      name: e.name,
      startTime: e.startTime,
    }));
    const nav = performance.getEntriesByType("navigation")[0];
    const resources = performance
      .getEntriesByType("resource")
      .filter((r) => {
        const n = r.name;
        return (
          /\.(css|js|woff2?)(\?|$)/i.test(n) ||
          /fonts?\//i.test(n) ||
          n.includes("montserrat") ||
          n.endsWith("/") ||
          n.includes("google-ads")
        );
      })
      .map((r) => ({
        name: r.name,
        initiatorType: r.initiatorType,
        startTime: r.startTime,
        responseEnd: r.responseEnd,
        duration: r.duration,
        transferSize: r.transferSize,
        encodedBodySize: r.encodedBodySize,
        decodedBodySize: r.decodedBodySize,
        renderBlockingStatus: r.renderBlockingStatus || null,
      }));

    // All resources for HTML doc itself
    const allRes = performance.getEntriesByType("resource").map((r) => ({
      name: r.name,
      initiatorType: r.initiatorType,
      startTime: r.startTime,
      responseEnd: r.responseEnd,
      transferSize: r.transferSize,
      decodedBodySize: r.decodedBodySize,
      renderBlockingStatus: r.renderBlockingStatus || null,
    }));

    const lead = document.querySelector("p.ctx-hero__lead");
    let leadComputed = null;
    let usedFonts = null;
    if (lead) {
      const cs = getComputedStyle(lead);
      leadComputed = {
        fontFamily: cs.fontFamily,
        fontWeight: cs.fontWeight,
        fontSize: cs.fontSize,
        opacity: cs.opacity,
        visibility: cs.visibility,
        contentVisibility: cs.contentVisibility,
        display: cs.display,
      };
      if (document.fonts && document.fonts.check) {
        usedFonts = {
          check400: document.fonts.check("400 16px Montserrat"),
          check700: document.fonts.check("700 16px Montserrat"),
          checkLead: document.fonts.check(
            cs.fontWeight + " " + cs.fontSize + " " + cs.fontFamily.split(",")[0]
          ),
        };
      }
    }

    const lcpFinal =
      window.__diag.lcpEntries.length > 0
        ? window.__diag.lcpEntries[window.__diag.lcpEntries.length - 1]
        : null;
    const longBeforeLcp = window.__diag.longTasks.filter(
      (t) => !lcpFinal || t.startTime < lcpFinal.startTime
    );

    // Diff hero attrs
    function attrDiff(a, b) {
      if (!a || !b) return { error: "missing dumps", a: !!a, b: !!b };
      const diffs = [];
      const n = Math.max(a.length, b.length);
      for (let i = 0; i < n; i++) {
        const A = a[i] || {};
        const B = b[i] || {};
        const keys = new Set([
          ...Object.keys(A.attrs || {}),
          ...Object.keys(B.attrs || {}),
        ]);
        const changed = {};
        for (const k of keys) {
          const va = (A.attrs || {})[k];
          const vb = (B.attrs || {})[k];
          if (va !== vb) changed[k] = { from: va, to: vb };
        }
        if (Object.keys(changed).length || A.sel !== B.sel) {
          diffs.push({ sel: B.sel || A.sel, changed });
        }
      }
      return diffs;
    }

    // Changed props across snapshots
    function changedPropsTable(snapshots) {
      const rows = [];
      for (let i = 1; i < snapshots.length; i++) {
        const prev = snapshots[i - 1];
        const cur = snapshots[i];
        if (!prev.chain || !cur.chain) continue;
        const bySel = {};
        for (const n of prev.chain) bySel[n.sel] = n.styles;
        for (const n of cur.chain) {
          const p = bySel[n.sel];
          if (!p) {
            rows.push({
              from: prev.label,
              to: cur.label,
              sel: n.sel,
              change: "NEW_NODE",
            });
            continue;
          }
          for (const key of Object.keys(n.styles)) {
            if (p[key] !== n.styles[key]) {
              rows.push({
                from: prev.label,
                to: cur.label,
                tFrom: prev.t,
                tTo: cur.t,
                sel: n.sel,
                prop: key,
                before: p[key],
                after: n.styles[key],
              });
            }
          }
        }
      }
      return rows;
    }

    const lcpSnap = [...window.__diag.snapshots]
      .reverse()
      .find((s) => String(s.label).startsWith("LCP@"));

    return {
      paint,
      nav: nav
        ? {
            responseStart: nav.responseStart,
            domInteractive: nav.domInteractive,
            domContentLoadedEventStart: nav.domContentLoadedEventStart,
            domContentLoadedEventEnd: nav.domContentLoadedEventEnd,
            loadEventEnd: nav.loadEventEnd,
            transferSize: nav.transferSize,
            encodedBodySize: nav.encodedBodySize,
            decodedBodySize: nav.decodedBodySize,
            responseEnd: nav.responseEnd,
          }
        : null,
      resources,
      allResCount: allRes.length,
      diag: window.__diag,
      changedProps: changedPropsTable(window.__diag.snapshots),
      lcpSnapFull: lcpSnap || null,
      longBeforeLcp,
      leadComputed,
      usedFonts,
      heroAttrDiff: attrDiff(
        window.__diag.heroAttrsT0,
        window.__diag.heroAttrsT2000
      ),
      nodeCount: document.getElementsByTagName("*").length,
      readyState: document.readyState,
    };
  });

  // Metrics via CDP
  let metrics = null;
  try {
    const client = await page.context().newCDPSession(page);
    const m = await client.send("Performance.getMetrics");
    metrics = m.metrics;
  } catch (e) {
    metrics = { error: String(e) };
  }

  const status = navResp ? navResp.status() : null;
  const headers = navResp ? navResp.headers() : null;

  const out = {
    url: URL,
    status,
    responseHeaders: headers,
    ...data,
    cdpMetrics: metrics,
  };

  const outPath = path.join(OUT_DIR, "d2-d3-d6-result.json");
  fs.writeFileSync(outPath, JSON.stringify(out, null, 2));
  console.log("WROTE", outPath);

  // Compact console summary
  console.log("\n=== PAINT ===");
  console.log(JSON.stringify(data.paint, null, 2));
  console.log("\n=== LCP CANDIDATES ===");
  console.log(JSON.stringify(data.diag.lcpEntries, null, 2));
  console.log("\n=== FONTS READY ===", data.diag.fontsReadyAt);
  console.log("\n=== FONT EVENTS ===");
  console.log(JSON.stringify(data.diag.fonts, null, 2));
  console.log("\n=== LONG TASKS BEFORE LCP ===");
  console.log(JSON.stringify(data.longBeforeLcp, null, 2));
  console.log("\n=== CSS/JS/FONT RESOURCES ===");
  console.log(JSON.stringify(data.resources, null, 2));
  console.log("\n=== CHANGED PROPS ===");
  console.log(JSON.stringify(data.changedProps, null, 2));
  console.log("\n=== LEAD COMPUTED ===");
  console.log(JSON.stringify(data.leadComputed, null, 2));
  console.log("\n=== USED FONTS CHECK ===");
  console.log(JSON.stringify(data.usedFonts, null, 2));
  console.log("\n=== NAV / D6 ===");
  console.log(JSON.stringify(data.nav, null, 2));
  console.log("nodeCount", data.nodeCount);
  console.log("\n=== HERO ATTR DIFF ===");
  console.log(JSON.stringify(data.heroAttrDiff, null, 2));

  await browser.close();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
