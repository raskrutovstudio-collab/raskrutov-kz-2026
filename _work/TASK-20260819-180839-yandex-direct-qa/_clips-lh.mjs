import fs from "node:fs";
import path from "node:path";
import http from "node:http";
import zlib from "node:zlib";
import lighthouse from "lighthouse";
import * as chromeLauncher from "chrome-launcher";
import puppeteer from "puppeteer-core";

const root = process.cwd();
const qaDir = path.join(root, "site_mirror/_work/TASK-20260819-180839-yandex-direct-qa");
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
  const compressible = /html|css|javascript|svg\+xml/.test(type);
  if (compressible && (req.headers["accept-encoding"] || "").includes("gzip")) {
    res.writeHead(200, { "Content-Type": type, "Content-Encoding": "gzip", "Cache-Control": "no-store" });
    res.end(zlib.gzipSync(buf));
    return;
  }
  res.writeHead(200, { "Content-Type": type, "Cache-Control": "no-store" });
  res.end(buf);
});
await new Promise((r) => server.listen(0, "127.0.0.1", r));
const port = server.address().port;
const origin = `http://127.0.0.1:${port}/web-studiya/kontekstnaya-reklama/yandex-direct/`;
console.log(origin);

const chrome = await chromeLauncher.launch({ chromeFlags: ["--headless=new", "--disable-gpu"] });
const browser = await puppeteer.connect({ browserURL: `http://127.0.0.1:${chrome.port}`, defaultViewport: null });
const page = await browser.newPage();
await page.setViewport({ width: 390, height: 844 });
await page.goto(origin, { waitUntil: "load", timeout: 60000 });
const textCheck = await page.evaluate(() => ({
  h1: document.querySelector("h1")?.textContent.trim(),
  sub: document.querySelector(".ctx-hero__sub")?.textContent.trim(),
  price: document.querySelector(".yd-hero-price")?.innerText.replace(/\s+/g, " ").trim(),
  about: document.querySelector("#about h2")?.textContent.trim(),
  office: document.querySelector(".rk-contacts__office")?.textContent.trim()
}));
console.log("TEXT", textCheck);
for (const [name, sel] of [
  ["clip-hero-390", "#ctx-hero"],
  ["clip-about-390", "#about"],
  ["clip-audience-390", "#audience"],
  ["clip-camps-390", "#campaign-types"],
  ["clip-setup-390", "#setup"],
  ["clip-control-390", "#control"],
  ["clip-faq-390", "#faq"],
  ["clip-contacts-390", "#contacts"]
]) {
  const el = await page.$(sel);
  if (el) await el.screenshot({ path: path.join(qaDir, name + ".png") });
}
await page.setViewport({ width: 1440, height: 900 });
await page.goto(origin, { waitUntil: "load", timeout: 60000 });
for (const [name, sel] of [
  ["clip-hero-1440", "#ctx-hero"],
  ["clip-camps-1440", "#campaign-types"],
  ["clip-control-1440", "#control"],
  ["clip-contacts-1440", "#contacts"]
]) {
  const el = await page.$(sel);
  if (el) await el.screenshot({ path: path.join(qaDir, name + ".png") });
}
await browser.disconnect();

async function runLh(formFactor) {
  const flags = { logLevel: "error", output: "json", port: chrome.port };
  const config = formFactor === "mobile"
    ? { extends: "lighthouse:default", settings: { formFactor: "mobile", screenEmulation: { mobile: true, width: 412, height: 823, deviceScaleFactor: 1.75, disabled: false }, throttlingMethod: "simulate" } }
    : { extends: "lighthouse:default", settings: { formFactor: "desktop", screenEmulation: { mobile: false, width: 1350, height: 940, deviceScaleFactor: 1, disabled: false }, throttlingMethod: "simulate" } };
  const result = await lighthouse(origin, flags, config);
  const r = result.lhr;
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
    failedA11y: (r.audits["accessibility"] && r.categories.accessibility.auditRefs.filter((a) => r.audits[a.id]?.score === 0).map((a) => a.id)) ||
      r.categories.accessibility.auditRefs.filter((a) => r.audits[a.id] && r.audits[a.id].score !== null && r.audits[a.id].score < 1 && a.weight > 0).map((a) => a.id)
  };
}

const mobile = [];
for (let i = 1; i <= 3; i++) {
  const row = await runLh("mobile");
  console.log("MOBILE", i, row);
  mobile.push(row);
}
const desktop = await runLh("desktop");
console.log("DESKTOP", desktop);
const med = (key) => mobile.map((r) => r[key]).sort((a, b) => a - b)[1];
const lh = { mobile, median: { performance: med("performance"), fcp: med("fcp"), lcp: med("lcp"), tbt: med("tbt"), cls: med("cls") }, desktop };
fs.writeFileSync(path.join(qaDir, "lighthouse.json"), JSON.stringify(lh, null, 2));
await chrome.kill();
server.close();
