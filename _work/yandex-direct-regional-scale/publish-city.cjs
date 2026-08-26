/**
 * Publish pipeline for one Yandex Direct city page.
 * Usage: node publish-city.cjs <slug> [CityNameForCommit]
 */
const { execSync, spawnSync } = require("child_process");
const fs = require("fs");
const path = require("path");
const https = require("https");
const http = require("http");

const slug = process.argv[2];
const cityLabel = process.argv[3] || slug;
if (!slug) {
  console.error("Usage: node publish-city.cjs <slug> [CityName]");
  process.exit(2);
}

const ROOT = process.cwd();
const page = `site_mirror/web-studiya/kontekstnaya-reklama/yandex-direct/${slug}/index.html`;
const outDir = `site_mirror/_work/yandex-direct-regional-scale/${slug}`;
const sim = `site_mirror/_work/yandex-direct-regional-scale/similarity-check.cjs`;
const chrome = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const lh = "node_modules/lighthouse/cli/index.js";
const url = `http://127.0.0.1:8766/web-studiya/kontekstnaya-reklama/yandex-direct/${slug}/`;
const prodUrl = `https://raskrutov.kz/web-studiya/kontekstnaya-reklama/yandex-direct/${slug}/`;

function sh(cmd, opts = {}) {
  console.log(">", cmd);
  return execSync(cmd, {
    stdio: "inherit",
    encoding: "utf8",
    ...opts,
  });
}

function shOut(cmd) {
  return execSync(cmd, { encoding: "utf8" }).trim();
}

function ensureDir(p) {
  fs.mkdirSync(p, { recursive: true });
}

function waitHttp(u, tries = 20) {
  return new Promise((resolve, reject) => {
    let n = 0;
    const once = () => {
      const lib = u.startsWith("https") ? https : http;
      lib
        .get(u, (res) => {
          res.resume();
          if (res.statusCode === 200) return resolve();
          if (++n > tries) return reject(new Error("http wait fail " + res.statusCode));
          setTimeout(once, 500);
        })
        .on("error", () => {
          if (++n > tries) return reject(new Error("http wait error"));
          setTimeout(once, 500);
        });
    };
    once();
  });
}

function runSim() {
  const published = [
    "astana",
    "almaty",
    "shymkent",
    "karaganda",
    "aktobe",
    "taraz",
    "pavlodar",
    "ust-kamenogorsk",
    "semey",
    "atyrau",
    "kostanay",
    "kyzylorda",
    "uralsk",
    "petropavlovsk",
    "aktau",
    "turkestan",
    "kokshetau",
    "taldykorgan",
  ].filter((s) => s !== slug && fs.existsSync(`site_mirror/web-studiya/kontekstnaya-reklama/yandex-direct/${s}/index.html`));

  const peers = [
    ...published.map(
      (s) => `site_mirror/web-studiya/kontekstnaya-reklama/yandex-direct/${s}/index.html`
    ),
    "site_mirror/web-studiya/kontekstnaya-reklama/yandex-direct/index.html",
    `site_mirror/web-studiya/kontekstnaya-reklama/${slug}/index.html`,
    `site_mirror/web-studiya/kontekstnaya-reklama/google-ads/${slug}/index.html`,
  ].filter((p) => fs.existsSync(p));

  for (const p of peers) {
    const r = spawnSync("node", [sim, page, p], { encoding: "utf8" });
    process.stdout.write(r.stdout || "");
    if (r.status !== 0) {
      console.error("SIM FAIL vs", p);
      process.exit(3);
    }
  }
  console.log("SIMILARITY PASS");
}

function updateSitemap() {
  const smPath = path.join(ROOT, "site_mirror/sitemap.xml");
  let c = fs.readFileSync(smPath, "utf8");
  if (c.includes(`yandex-direct/${slug}/`)) {
    console.log("SITEMAP EXISTS");
    return;
  }
  // Insert after the last existing yandex-direct city URL in sitemap, or after republican if none
  const loc = `https://raskrutov.kz/web-studiya/kontekstnaya-reklama/yandex-direct/${slug}/`;
  const block = `  <url>\n    <loc>${loc}</loc>\n  </url>\n`;
  const ydCityRe =
    /  <url>\s*<loc>https:\/\/raskrutov\.kz\/web-studiya\/kontekstnaya-reklama\/yandex-direct\/[a-z0-9-]+\/<\/loc>\s*<\/url>/g;
  let last = null;
  let m;
  while ((m = ydCityRe.exec(c))) last = m;
  if (last) {
    const insertAt = last.index + last[0].length;
    c = c.slice(0, insertAt) + "\n" + block.trimEnd() + c.slice(insertAt);
  } else {
    const rep =
      /  <url>\s*<loc>https:\/\/raskrutov\.kz\/web-studiya\/kontekstnaya-reklama\/yandex-direct\/<\/loc>\s*<\/url>/;
    if (!rep.test(c)) throw new Error("Cannot find yandex-direct sitemap anchor");
    c = c.replace(
      rep,
      (s) => s + "\n" + block.trimEnd()
    );
  }
  fs.writeFileSync(smPath, c, { encoding: "utf8" });
  console.log("SITEMAP UPDATED");
}

function runLhMobile() {
  ensureDir(outDir);
  for (let round = 1; round <= 5; round++) {
    console.log("LH_ROUND", round);
    const scores = [];
    let bad = false;
    for (let i = 1; i <= 3; i++) {
      const out = path.join(outDir, `lh-r${round}-m${i}.json`);
      spawnSync(
        "node",
        [
          lh,
          url,
          "--quiet",
          `--chrome-path=${chrome}`,
          "--form-factor=mobile",
          "--screenEmulation.mobile",
          "--only-categories=performance,accessibility,seo",
          "--output=json",
          `--output-path=${out}`,
          "--chrome-flags=--headless=new --no-sandbox --disable-gpu",
        ],
        { stdio: "inherit" }
      );
      const r = JSON.parse(fs.readFileSync(out, "utf8"));
      const a = r.audits;
      const p = Math.round(r.categories.performance.score * 100);
      const tbt = Math.round(a["total-blocking-time"].numericValue);
      const cls = a["cumulative-layout-shift"].numericValue;
      const lcp = Math.round(a["largest-contentful-paint"].numericValue);
      const fcp = Math.round(a["first-contentful-paint"].numericValue);
      const acc = Math.round(r.categories.accessibility.score * 100);
      const seo = Math.round(r.categories.seo.score * 100);
      console.log(`M${i}`, p, "FCP", fcp, "LCP", lcp, "CLS", cls, "TBT", tbt, "A", acc, "SEO", seo);
      scores.push({ p, tbt, cls, lcp, fcp, acc, seo });
      if (p < 90 || tbt > 150 || cls > 0.05 || lcp > 3000 || fcp > 1800) bad = true;
    }
    const ps = scores.map((s) => s.p).sort((a, b) => a - b);
    const median = ps[1];
    const tbts = scores.map((s) => s.tbt).sort((a, b) => a - b);
    const tbtMed = tbts[1];
    console.log("median", median, "tbtMed", tbtMed, "bad", bad);
    if (!bad && median >= 95 && tbtMed <= 100) {
      fs.writeFileSync(
        path.join(outDir, "lh-mobile-pass.json"),
        JSON.stringify({ round, scores, median, tbtMed }, null, 2)
      );
      return { median, scores };
    }
  }
  throw new Error("LH mobile gate failed after retries");
}

function runLhDesktop() {
  for (let i = 1; i <= 2; i++) {
    const out = path.join(outDir, `lh-d${i}.json`);
    spawnSync(
      "node",
      [
        lh,
        url,
        "--quiet",
        `--chrome-path=${chrome}`,
        "--preset=desktop",
        "--only-categories=performance,accessibility,seo",
        "--output=json",
        `--output-path=${out}`,
        "--chrome-flags=--headless=new --no-sandbox --disable-gpu",
      ],
      { stdio: "inherit" }
    );
    const r = JSON.parse(fs.readFileSync(out, "utf8"));
    const a = r.audits;
    const p = Math.round(r.categories.performance.score * 100);
    const cls = a["cumulative-layout-shift"].numericValue;
    const tbt = Math.round(a["total-blocking-time"].numericValue);
    const lcp = Math.round(a["largest-contentful-paint"].numericValue);
    console.log(`D${i}`, p, "LCP", lcp, "CLS", cls, "TBT", tbt);
    if (p < 98 || cls > 0.05 || tbt > 100 || lcp > 1500) {
      throw new Error("LH desktop gate failed");
    }
  }
}

async function screenshots() {
  const puppeteer = require("puppeteer-core");
  const browser = await puppeteer.launch({
    executablePath: chrome,
    headless: "new",
    args: ["--no-sandbox", "--disable-gpu"],
  });
  for (const [w, h, m, n] of [
    [390, 844, true, `${slug}-390`],
    [430, 932, true, `${slug}-430`],
    [768, 1024, false, `${slug}-768`],
    [1440, 900, false, `${slug}-1440`],
  ]) {
    const page = await browser.newPage();
    await page.setViewport({
      width: w,
      height: h,
      deviceScaleFactor: m ? 2 : 1,
      isMobile: m,
      hasTouch: m,
    });
    await page.goto(url, { waitUntil: "networkidle2", timeout: 60000 });
    await page.screenshot({
      path: path.join(outDir, n + ".png"),
      fullPage: true,
    });
    await page.close();
    console.log("shot", n);
  }
  await browser.close();
}

function commitPush() {
  sh(`git add -- ${page} site_mirror/sitemap.xml`);
  sh(`git commit -m "feat: add Yandex Direct ${cityLabel} page"`);
  sh("git push origin HEAD:work/pc1");
  return shOut("git rev-parse HEAD");
}

function waitIntegrate(sha) {
  for (let i = 0; i < 36; i++) {
    const json = shOut(
      "gh run list --workflow=integrate-parallel-work.yml --branch work/pc1 --limit 1 --json databaseId,status,conclusion,headSha"
    );
    const run = JSON.parse(json)[0];
    console.log(`int ${i}: ${run.status} ${run.conclusion} ${run.headSha}`);
    if (run.status === "completed") {
      if (run.conclusion !== "success") throw new Error("integrate failed");
      break;
    }
    execSync("powershell -NoProfile -Command Start-Sleep -Seconds 5");
  }
  sh("git fetch origin main --prune");
  try {
    execSync(`git merge-base --is-ancestor ${sha} origin/main`, {
      stdio: "ignore",
    });
    console.log("IN_MAIN=YES");
  } catch {
    throw new Error("commit not in main");
  }
  return shOut("git rev-parse origin/main");
}

function deployPlesk() {
  const dstDir = `site_plesk/web-studiya/kontekstnaya-reklama/yandex-direct/${slug}`;
  ensureDir(dstDir);
  fs.copyFileSync(page, path.join(dstDir, "index.html"));
  fs.copyFileSync("site_mirror/sitemap.xml", "site_plesk/sitemap.xml");
  sh(
    `git -C site_plesk add -- web-studiya/kontekstnaya-reklama/yandex-direct/${slug}/index.html sitemap.xml`
  );
  sh(`git -C site_plesk commit -m "feat: add Yandex Direct ${cityLabel} page"`);
  sh("git -C site_plesk push origin HEAD:plesk");
  return shOut("git -C site_plesk rev-parse HEAD");
}

function verifyProd() {
  return new Promise((resolve, reject) => {
    let t = 0;
    const once = () => {
      https
        .get(prodUrl, { headers: { "Cache-Control": "no-cache" } }, (res) => {
          const chunks = [];
          res.on("data", (c) => chunks.push(c));
          res.on("end", () => {
            const h = Buffer.concat(chunks).toString("utf8");
            const formOk = new RegExp(`rk-form-contacts-yd-${slug}`).test(h);
            const cssOk = /min-width: 769px/.test(h);
            const ok = res.statusCode === 200 && formOk && cssOk;
            console.log("prod try", t, "status", res.statusCode, "ok", ok);
            if (ok) return resolve(true);
            if (++t > 30) return reject(new Error("prod verify fail"));
            setTimeout(once, 8000);
          });
        })
        .on("error", () => {
          if (++t > 30) return reject(new Error("prod verify error"));
          setTimeout(once, 8000);
        });
    };
    once();
  });
}

(async () => {
  if (!fs.existsSync(page)) throw new Error("missing page " + page);
  ensureDir(outDir);
  await waitHttp(url);
  runSim();
  updateSitemap();
  sh("npm run quality:all");
  const mobile = runLhMobile();
  runLhDesktop();
  await screenshots();
  const commit = commitPush();
  const main = waitIntegrate(commit);
  const plesk = deployPlesk();
  await verifyProd();
  const result = {
    slug,
    commit,
    main,
    plesk,
    mobile_median: mobile.median,
    production_verified: true,
  };
  fs.writeFileSync(
    path.join(outDir, "publish-result.json"),
    JSON.stringify(result, null, 2)
  );
  console.log("PUBLISH_RESULT", JSON.stringify(result));
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
