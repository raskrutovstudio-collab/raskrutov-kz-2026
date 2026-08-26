import fs from "node:fs";
import path from "node:path";
import http from "node:http";
import zlib from "node:zlib";
import lighthouse from "lighthouse";
import desktopConfig from "lighthouse/core/config/desktop-config.js";
import * as chromeLauncher from "chrome-launcher";

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
  return "application/octet-stream";
}
const server = http.createServer((req, res) => {
  let urlPath = decodeURIComponent((req.url || "/").split("?")[0]);
  if (urlPath.endsWith("/")) urlPath += "index.html";
  const file = path.normalize(path.join(base, urlPath.replace(/^\//, "")));
  if (!file.startsWith(base) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) {
    res.writeHead(404); res.end("404"); return;
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
const origin = `http://127.0.0.1:${server.address().port}/web-studiya/kontekstnaya-reklama/yandex-direct/`;
console.log(origin);

function summarize(r) {
  const failed = [];
  for (const cat of Object.values(r.categories)) {
    for (const ref of cat.auditRefs) {
      const a = r.audits[ref.id];
      if (!a || a.score === null) continue;
      if (ref.weight > 0 && a.score < 1) failed.push({ cat: cat.id, id: ref.id, score: a.score, title: a.title });
    }
  }
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
    failed
  };
}

const chrome = await chromeLauncher.launch({ chromeFlags: ["--headless=new", "--disable-gpu"] });
await lighthouse(origin, { port: chrome.port, output: "json", logLevel: "error" }); // warmup
const mobile = [];
for (let i = 1; i <= 3; i++) {
  const { lhr } = await lighthouse(origin, { port: chrome.port, output: "json", logLevel: "error" });
  const row = summarize(lhr);
  console.log("MOBILE", i, JSON.stringify(row, null, 2));
  mobile.push(row);
}
const { lhr: desk } = await lighthouse(origin, { port: chrome.port, output: "json", logLevel: "error" }, desktopConfig);
const desktop = summarize(desk);
console.log("DESKTOP", JSON.stringify(desktop, null, 2));
const med = (key) => mobile.map((r) => r[key]).sort((a, b) => a - b)[1];
const out = { mobile, median: { performance: med("performance"), fcp: med("fcp"), lcp: med("lcp"), tbt: med("tbt"), cls: med("cls") }, desktop };
fs.writeFileSync(path.join(qaDir, "lighthouse.json"), JSON.stringify(out, null, 2));
await chrome.kill();
server.close();
