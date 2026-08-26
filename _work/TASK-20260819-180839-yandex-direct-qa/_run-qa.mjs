import fs from "node:fs";
import path from "node:path";
import http from "node:http";
import zlib from "node:zlib";
import { spawnSync } from "node:child_process";
import puppeteer from "puppeteer-core";
import * as chromeLauncher from "chrome-launcher";

const root = process.cwd();
const qaDir = path.join(root, "site_mirror/_work/TASK-20260819-180839-yandex-direct-qa");
const pageUrlPath = "/web-studiya/kontekstnaya-reklama/yandex-direct/";

function stripTags(html) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&[a-z]+;/gi, " ")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
}

function semanticMain(html) {
  let main = html;
  const m = html.match(/<main\b[\s\S]*?<\/main>/i);
  if (m) main = m[0];
  main = main.replace(/<nav class="rk-breadcrumbs"[\s\S]*?<\/nav>/i, " ");
  main = main.replace(/<section class="rk-section rk-section--contacts"[\s\S]*?<\/section>/i, " ");
  main = main.replace(/<form\b[\s\S]*?<\/form>/gi, " ");
  return stripTags(main);
}

function grams(text, n = 5) {
  const words = text.split(" ").filter(Boolean);
  const set = new Set();
  for (let i = 0; i <= words.length - n; i++) set.add(words.slice(i, i + n).join(" "));
  return set;
}

function containment(a, b) {
  if (!a.size) return 0;
  let hit = 0;
  for (const g of a) if (b.has(g)) hit++;
  return (hit / a.size) * 100;
}

function jaccard(a, b) {
  const u = new Set([...a, ...b]);
  if (!u.size) return 0;
  let hit = 0;
  for (const g of a) if (b.has(g)) hit++;
  return (hit / u.size) * 100;
}

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

function startServer() {
  const base = path.join(root, "site_mirror");
  const server = http.createServer((req, res) => {
    let urlPath = decodeURIComponent((req.url || "/").split("?")[0]);
    if (urlPath.endsWith("/")) urlPath += "index.html";
    const file = path.normalize(path.join(base, urlPath.replace(/^\//, "")));
    if (!file.startsWith(base)) {
      res.writeHead(403);
      res.end();
      return;
    }
    if (!fs.existsSync(file) || fs.statSync(file).isDirectory()) {
      res.writeHead(404);
      res.end("404");
      return;
    }
    const buf = fs.readFileSync(file);
    const type = mime(file);
    const compressible = /html|css|javascript|svg\+xml/.test(type);
    if (compressible && (req.headers["accept-encoding"] || "").includes("gzip")) {
      const gz = zlib.gzipSync(buf);
      res.writeHead(200, { "Content-Type": type, "Content-Encoding": "gzip", "Cache-Control": "no-store" });
      res.end(gz);
      return;
    }
    res.writeHead(200, { "Content-Type": type, "Cache-Control": "no-store" });
    res.end(buf);
  });
  return new Promise((resolve) => {
    server.listen(0, "127.0.0.1", () => resolve(server));
  });
}

const ydHtml = fs.readFileSync(path.join(root, "site_mirror/web-studiya/kontekstnaya-reklama/yandex-direct/index.html"), "utf8");
const yd = grams(semanticMain(ydHtml));
const pairs = [
  ["parent", "site_mirror/web-studiya/kontekstnaya-reklama/index.html"],
  ["google-ads", "site_mirror/web-studiya/kontekstnaya-reklama/google-ads/index.html"],
  ["city-almaty", "site_mirror/web-studiya/kontekstnaya-reklama/almaty/index.html"],
  ["city-astana", "site_mirror/web-studiya/kontekstnaya-reklama/astana/index.html"],
  ["city-shymkent", "site_mirror/web-studiya/kontekstnaya-reklama/shymkent/index.html"]
];
const sim = {};
for (const [name, file] of pairs) {
  const other = grams(semanticMain(fs.readFileSync(path.join(root, file), "utf8")));
  sim[name] = {
    containment: Number(containment(yd, other).toFixed(2)),
    jaccard: Number(jaccard(yd, other).toFixed(2))
  };
}
fs.writeFileSync(path.join(qaDir, "similarity.json"), JSON.stringify(sim, null, 2));
console.log("SIMILARITY", sim);

const server = await startServer();
const PORT = server.address().port;
const origin = `http://127.0.0.1:${PORT}${pageUrlPath}`;
console.log("SERVER", origin);

const chrome = await chromeLauncher.launch({ chromeFlags: ["--headless=new", "--disable-gpu", "--no-first-run"] });
const browser = await puppeteer.connect({ browserURL: `http://127.0.0.1:${chrome.port}`, defaultViewport: null });
const viewports = [390, 430, 768, 1440];
const geo = {};
for (const w of viewports) {
  const page = await browser.newPage();
  await page.setViewport({ width: w, height: w === 1440 ? 900 : 844, deviceScaleFactor: 1 });
  const consoleErrors = [];
  const failed = [];
  page.on("console", (msg) => { if (msg.type() === "error") consoleErrors.push(msg.text()); });
  page.on("response", (r) => { if (r.status() >= 400) failed.push(r.status() + " " + r.url()); });
  await page.goto(origin, { waitUntil: "load", timeout: 60000 });
  await new Promise((r) => setTimeout(r, 800));
  const metrics = await page.evaluate(() => {
    const docW = document.documentElement.scrollWidth;
    const vw = window.innerWidth;
    const h1 = document.querySelector("h1");
    const header = document.querySelector("header");
    const contacts = document.querySelector("#contacts");
    const cards = [...document.querySelectorAll(".yd-card, .yd-camp, .yd-scope-list__item, .yd-decision__card, .yd-faq__item")];
    const narrow = [];
    for (const el of cards) {
      const r = el.getBoundingClientRect();
      const p = el.parentElement ? el.parentElement.getBoundingClientRect() : r;
      if (r.width > 0 && p.width > 80 && r.width / p.width < 0.18) {
        narrow.push({ cls: el.className, w: Math.round(r.width), pw: Math.round(p.width) });
      }
    }
    const scope = [...document.querySelectorAll(".yd-scope-list__item")].map((el) => ({
      children: el.children.length,
      hasIcon: !!el.querySelector(".yd-scope-list__icon"),
      hasDiv: !!el.querySelector("div")
    }));
    return {
      overflow: docW - vw,
      h1: !!(h1 && h1.offsetHeight),
      header: !!(header && header.offsetHeight),
      contacts: !!(contacts && contacts.offsetHeight),
      scope,
      narrow
    };
  });
  const shot = path.join(qaDir, `yandex-direct-republic-${w}.png`);
  await page.screenshot({ path: shot, fullPage: true });
  geo[w] = { ...metrics, consoleErrors, failed: failed.filter((u) => !u.includes("mc.yandex")), shot };
  await page.close();
}

const funcPage = await browser.newPage();
await funcPage.setViewport({ width: 390, height: 844, deviceScaleFactor: 1 });
await funcPage.goto(origin, { waitUntil: "load", timeout: 60000 });
const functional = await funcPage.evaluate(async () => {
  const out = {};
  const btn = document.querySelector("[data-yd-faq-btn]");
  const panelId = btn && btn.getAttribute("aria-controls");
  const panel = panelId && document.getElementById(panelId);
  if (btn) {
    btn.click();
    out.faqExpanded = btn.getAttribute("aria-expanded") === "true" && panel && !panel.hasAttribute("hidden");
    btn.click();
    out.faqCollapsed = btn.getAttribute("aria-expanded") === "false";
  }
  const open = document.querySelector('[data-rk-open-modal="rk-modal-lead"]');
  if (open) open.click();
  const modal = document.getElementById("rk-modal-lead");
  out.modalOpen = modal && !modal.hasAttribute("hidden");
  document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true }));
  out.modalAfterEsc = modal ? !modal.hasAttribute("hidden") : null;
  const form = document.getElementById("rk-form-contacts-yd");
  out.formNames = form ? [...form.querySelectorAll("[name]")].map((el) => el.getAttribute("name")) : [];
  out.mailto = document.querySelector('a[href^="mailto:"]')?.getAttribute("href");
  out.mailtoText = document.querySelector('a[href^="mailto:"]')?.textContent.replace(/\s+/g, " ").trim();
  out.tel = document.querySelector(".rk-header__phone")?.getAttribute("href");
  out.wa = document.querySelector(".rk-wa")?.getAttribute("href");
  out.h1count = document.querySelectorAll("h1").length;
  return out;
});
await funcPage.close();
await browser.disconnect();
await chrome.kill();

fs.writeFileSync(path.join(qaDir, "viewport-geo.json"), JSON.stringify({ geo, functional }, null, 2));
console.log("GEO", JSON.stringify(geo, null, 2).slice(0, 4000));
console.log("FUNC", functional);

function runLh(formFactor, i) {
  const out = path.join(qaDir, `lh-${formFactor}-${i}.json`);
  const args = [
    "lighthouse",
    origin,
    "--quiet",
    "--output=json",
    `--output-path=${out}`,
    "--only-categories=performance,accessibility,best-practices,seo",
    `--form-factor=${formFactor}`,
    "--chrome-flags=--headless --disable-gpu"
  ];
  if (formFactor === "mobile") args.push("--screenEmulation.mobile=true");
  else args.push("--screenEmulation.mobile=false", "--screenEmulation.width=1350", "--screenEmulation.height=940", "--screenEmulation.deviceScaleFactor=1");
  const run = spawnSync(process.platform === "win32" ? "npx.cmd" : "npx", args, { stdio: "inherit", cwd: root });
  if (run.status !== 0) throw new Error("lighthouse failed " + formFactor + " " + i);
  const report = JSON.parse(fs.readFileSync(out, "utf8"));
  return {
    performance: Math.round(report.categories.performance.score * 100),
    accessibility: Math.round(report.categories.accessibility.score * 100),
    bestPractices: Math.round(report.categories["best-practices"].score * 100),
    seo: Math.round(report.categories.seo.score * 100),
    fcp: Math.round(report.audits["first-contentful-paint"].numericValue),
    lcp: Math.round(report.audits["largest-contentful-paint"].numericValue),
    tbt: Math.round(report.audits["total-blocking-time"].numericValue),
    cls: report.audits["cumulative-layout-shift"].numericValue,
    si: Math.round(report.audits["speed-index"].numericValue),
    lcpEl: report.audits["largest-contentful-paint-element"]?.details?.items?.[0]?.items?.[0]?.node?.snippet || null
  };
}

const mobile = [runLh("mobile", 1), runLh("mobile", 2), runLh("mobile", 3)];
const desktop = runLh("desktop", 1);
const med = (arr, key) => arr.map((r) => r[key]).sort((a, b) => a - b)[1];
const lh = { mobile, median: { performance: med(mobile, "performance"), fcp: med(mobile, "fcp"), lcp: med(mobile, "lcp"), tbt: med(mobile, "tbt"), cls: med(mobile, "cls") }, desktop };
fs.writeFileSync(path.join(qaDir, "lighthouse.json"), JSON.stringify(lh, null, 2));
console.log("LH", JSON.stringify(lh, null, 2));

server.close();
