import fs from "node:fs";
import path from "node:path";
import http from "node:http";
import zlib from "node:zlib";
import lighthouse from "lighthouse";
import desktopConfig from "lighthouse/core/config/desktop-config.js";
import * as chromeLauncher from "chrome-launcher";
import puppeteer from "puppeteer-core";

const root = process.cwd();
const qaDir = path.join(root, "site_mirror/_work/TASK-20260820-101639-yandex-direct-qa");
fs.mkdirSync(qaDir, { recursive: true });
const base = path.join(root, "site_mirror");

function mime(file) {
  if (file.endsWith(".html")) return "text/html; charset=utf-8";
  if (file.endsWith(".css")) return "text/css; charset=utf-8";
  if (file.endsWith(".js")) return "text/javascript; charset=utf-8";
  if (file.endsWith(".woff2")) return "font/woff2";
  if (file.endsWith(".webp")) return "image/webp";
  if (file.endsWith(".svg")) return "image/svg+xml";
  if (file.endsWith(".png")) return "image/png";
  if (file.endsWith(".ico")) return "image/x-icon";
  return "application/octet-stream";
}

const server = http.createServer((req, res) => {
  let urlPath = decodeURIComponent((req.url || "/").split("?")[0]);
  if (urlPath.endsWith("/")) urlPath += "index.html";
  const file = path.normalize(path.join(base, urlPath.replace(/^\//, "")));
  if (!file.startsWith(base) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) {
    res.writeHead(404);
    res.end("404");
    return;
  }
  const buf = fs.readFileSync(file);
  const type = mime(file);
  const compressible = /html|css|javascript|svg\+xml|json|xml|woff2?/.test(type) || file.endsWith(".woff2");
  const accept = req.headers["accept-encoding"] || "";
  if (compressible && accept.includes("gzip") && !file.endsWith(".woff2")) {
    res.writeHead(200, {
      "Content-Type": type,
      "Content-Encoding": "gzip",
      "Cache-Control": "no-store",
      Vary: "Accept-Encoding"
    });
    res.end(zlib.gzipSync(buf));
    return;
  }
  res.writeHead(200, { "Content-Type": type, "Cache-Control": "no-store" });
  res.end(buf);
});
await new Promise((r) => server.listen(0, "127.0.0.1", r));
const port = server.address().port;
const origin = `http://127.0.0.1:${port}/web-studiya/kontekstnaya-reklama/yandex-direct/`;
console.log("SERVER", origin);

function summarize(r) {
  const failed = [];
  for (const cat of Object.values(r.categories)) {
    for (const ref of cat.auditRefs) {
      const a = r.audits[ref.id];
      if (!a || a.score === null) continue;
      if (ref.weight > 0 && a.score < 1) failed.push({ cat: cat.id, id: ref.id, score: a.score, title: a.title });
    }
  }
  const lcpAudit = r.audits["largest-contentful-paint-element"];
  let lcpEl = null;
  try {
    lcpEl = lcpAudit?.details?.items?.[0]?.items?.[0]?.node?.snippet
      || lcpAudit?.details?.items?.[0]?.node?.snippet
      || null;
  } catch {}
  return {
    performance: Math.round(r.categories.performance.score * 100),
    accessibility: Math.round(r.categories.accessibility.score * 100),
    bestPractices: Math.round(r.categories["best-practices"].score * 100),
    seo: Math.round(r.categories.seo.score * 100),
    fcp: Math.round(r.audits["first-contentful-paint"].numericValue),
    lcp: Math.round(r.audits["largest-contentful-paint"].numericValue),
    tbt: Math.round(r.audits["total-blocking-time"].numericValue),
    cls: r.audits["cumulative-layout-shift"].numericValue,
    si: Math.round(r.audits["speed-index"].numericValue),
    lcpEl,
    failed
  };
}

const chrome = await chromeLauncher.launch({ chromeFlags: ["--headless=new", "--disable-gpu"] });
const browser = await puppeteer.connect({ browserURL: `http://127.0.0.1:${chrome.port}`, defaultViewport: null });

const geo = {};
const viewports = [390, 430, 768, 1440];
for (const w of viewports) {
  const page = await browser.newPage();
  await page.setViewport({ width: w, height: w === 1440 ? 900 : 844, deviceScaleFactor: 1 });
  const consoleErrors = [];
  const failed = [];
  page.on("console", (msg) => { if (msg.type() === "error") consoleErrors.push(msg.text()); });
  page.on("response", (resp) => {
    if (resp.status() >= 400) failed.push(resp.status() + " " + resp.url());
  });
  await page.goto(origin, { waitUntil: "load", timeout: 60000 });
  await new Promise((r) => setTimeout(r, 600));
  const metrics = await page.evaluate(() => {
    const docW = document.documentElement.scrollWidth;
    const vw = window.innerWidth;
    const scope = [...document.querySelectorAll(".yd-scope-list__item")].map((el) => ({
      children: el.children.length,
      hasIcon: !!el.querySelector(".yd-scope-list__icon"),
      hasDiv: !!el.querySelector(":scope > div")
    }));
    return {
      overflow: docW - vw,
      h1: !!document.querySelector("h1")?.offsetHeight,
      contacts: !!document.querySelector("#contacts")?.offsetHeight,
      metrikaScripts: [...document.scripts].filter((s) => /mc\.yandex\.ru/.test(s.src)).length,
      scopeBad: scope.filter((s) => !s.hasIcon || !s.hasDiv).length
    };
  });
  const shot = path.join(qaDir, `yandex-direct-republic-${w}.png`);
  await page.screenshot({ path: shot, fullPage: true });
  geo[w] = {
    ...metrics,
    consoleErrors,
    failed: failed.filter((u) => !u.includes("mc.yandex")),
    shot
  };
  await page.close();
}

const funcPage = await browser.newPage();
await funcPage.setViewport({ width: 390, height: 844, deviceScaleFactor: 1 });
await funcPage.goto(origin, { waitUntil: "load", timeout: 60000 });
const functional = await funcPage.evaluate(() => {
  const out = {};
  const btn = document.querySelector("[data-yd-faq-btn]");
  const panel = btn && document.getElementById(btn.getAttribute("aria-controls"));
  if (btn) {
    btn.click();
    out.faqExpanded = btn.getAttribute("aria-expanded") === "true" && panel && !panel.hasAttribute("hidden");
    btn.click();
    out.faqCollapsed = btn.getAttribute("aria-expanded") === "false";
  }
  document.querySelector('[data-rk-open-modal="rk-modal-lead"]')?.click();
  const modal = document.getElementById("rk-modal-lead");
  out.modalOpen = modal && !modal.hasAttribute("hidden");
  document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true }));
  out.modalAfterEsc = modal ? !modal.hasAttribute("hidden") : null;
  out.mailto = document.querySelector('a[href^="mailto:"]')?.getAttribute("href");
  out.tel = document.querySelector(".rk-header__phone")?.getAttribute("href");
  out.wa = document.querySelector(".rk-wa")?.getAttribute("href");
  out.formOk = !!document.querySelector("#rk-form-contacts-yd[data-lead-form]");
  return out;
});
await funcPage.close();
await browser.disconnect();

fs.writeFileSync(path.join(qaDir, "viewport-geo.json"), JSON.stringify({ geo, functional }, null, 2));
console.log("GEO", JSON.stringify(geo, null, 2));
console.log("FUNC", functional);

await lighthouse(origin, { port: chrome.port, output: "json", logLevel: "error" });
const mobile = [];
for (let i = 1; i <= 3; i++) {
  const { lhr } = await lighthouse(origin, { port: chrome.port, output: "json", logLevel: "error" });
  const row = summarize(lhr);
  console.log("MOBILE", i, JSON.stringify(row, null, 2));
  mobile.push(row);
  fs.writeFileSync(path.join(qaDir, `lh-mobile-${i}.json`), JSON.stringify(lhr, null, 2));
}
const { lhr: desk } = await lighthouse(origin, { port: chrome.port, output: "json", logLevel: "error" }, desktopConfig);
const desktop = summarize(desk);
console.log("DESKTOP", JSON.stringify(desktop, null, 2));
fs.writeFileSync(path.join(qaDir, "lh-desktop.json"), JSON.stringify(desk, null, 2));
const med = (key) => mobile.map((r) => r[key]).sort((a, b) => a - b)[1];
const out = {
  mobile,
  median: { performance: med("performance"), fcp: med("fcp"), lcp: med("lcp"), tbt: med("tbt"), cls: med("cls") },
  desktop,
  notes: {
    metrikaOnLocalhost: false,
    bpCauseWas: ["third-party-cookies", "inspector-issues"],
    pageOwnedBpExpected: 100
  }
};
fs.writeFileSync(path.join(qaDir, "lighthouse.json"), JSON.stringify(out, null, 2));
await chrome.kill();
server.close();
