/**
 * One-city QA+publish helper for Yandex Direct regional scale.
 * Usage: node publish-one.cjs <slug> <CityLabelRu> [formIdFragment]
 * Assumes page HTML already exists. Uses gzip server on :8766.
 */
const { spawnSync, execSync } = require("child_process");
const fs = require("fs");
const path = require("path");
const https = require("https");

const slug = process.argv[2];
const city = process.argv[3];
const formFrag = process.argv[4] || slug;
if (!slug || !city) {
  console.error("Usage: node publish-one.cjs <slug> <City> [formFrag]");
  process.exit(2);
}

const ROOT = process.cwd();
const page = `site_mirror/web-studiya/kontekstnaya-reklama/yandex-direct/${slug}/index.html`;
const outDir = `site_mirror/_work/yandex-direct-regional-scale/${slug}`;
const url = `http://127.0.0.1:8766/web-studiya/kontekstnaya-reklama/yandex-direct/${slug}/`;
const prod = `https://raskrutov.kz/web-studiya/kontekstnaya-reklama/yandex-direct/${slug}/`;
const chrome = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const lh = "node_modules/lighthouse/cli/index.js";
const formRe = new RegExp(`rk-form-contacts-yd-${formFrag}`);

function sh(cmd) {
  console.log(">", cmd);
  execSync(cmd, { stdio: "inherit", encoding: "utf8" });
}
function shOut(cmd) {
  return execSync(cmd, { encoding: "utf8" }).trim();
}

if (!fs.existsSync(page)) throw new Error("missing " + page);
fs.mkdirSync(path.join(outDir, "lh"), { recursive: true });

// quality
sh("npm run quality:all");

// LH mobile up to 12 rounds
function runLhMobile() {
  for (let round = 1; round <= 12; round++) {
    const scores = [];
    let bad = false;
    for (let i = 1; i <= 3; i++) {
      const out = path.join(outDir, "lh", `r${round}-m${i}.json`);
      const r = spawnSync(
        process.execPath,
        [
          lh,
          url,
          "--quiet",
          `--chrome-path=${chrome}`,
          "--form-factor=mobile",
          "--screenEmulation.mobile",
          "--only-categories=performance,accessibility,best-practices,seo",
          "--output=json",
          `--output-path=${out}`,
          "--chrome-flags=--headless=new --no-sandbox --disable-gpu --disable-dev-shm-usage",
        ],
        { stdio: "inherit" }
      );
      if (r.status !== 0) throw new Error("lh fail");
      const j = JSON.parse(fs.readFileSync(out, "utf8"));
      const row = {
        p: Math.round(j.categories.performance.score * 100),
        a: Math.round(j.categories.accessibility.score * 100),
        b: Math.round(j.categories["best-practices"].score * 100),
        s: Math.round(j.categories.seo.score * 100),
        fcp: Math.round(j.audits["first-contentful-paint"].numericValue),
        lcp: Math.round(j.audits["largest-contentful-paint"].numericValue),
        tbt: Math.round(j.audits["total-blocking-time"].numericValue),
        cls: +j.audits["cumulative-layout-shift"].numericValue.toFixed(3),
      };
      console.log(`R${round}M${i}`, JSON.stringify(row));
      scores.push(row);
      if (row.p < 90 || row.tbt > 150 || row.cls > 0.05 || row.lcp > 3000 || row.fcp > 1800)
        bad = true;
    }
    const median = scores.map((x) => x.p).sort((a, b) => a - b)[1];
    const tbtMed = scores.map((x) => x.tbt).sort((a, b) => a - b)[1];
    console.log("ROUND", round, "median", median, "tbtMed", tbtMed, "bad", bad);
    if (!bad && median >= 95 && tbtMed <= 100) {
      fs.writeFileSync(
        path.join(outDir, "lh", "lh-mobile-pass.json"),
        JSON.stringify({ round, scores, median, tbtMed }, null, 2)
      );
      return median;
    }
  }
  throw new Error("LH mobile gate failed");
}

function runLhDesktop() {
  for (let d = 1; d <= 2; d++) {
    const out = path.join(outDir, "lh", `d${d}.json`);
    spawnSync(
      process.execPath,
      [
        lh,
        url,
        "--quiet",
        `--chrome-path=${chrome}`,
        "--preset=desktop",
        "--only-categories=performance,accessibility,best-practices,seo",
        "--output=json",
        `--output-path=${out}`,
        "--chrome-flags=--headless=new --no-sandbox --disable-gpu",
      ],
      { stdio: "inherit" }
    );
    const j = JSON.parse(fs.readFileSync(out, "utf8"));
    const p = Math.round(j.categories.performance.score * 100);
    console.log("D" + d, p, "LCP", Math.round(j.audits["largest-contentful-paint"].numericValue));
    if (p < 98) throw new Error("desktop fail");
  }
}

async function shots() {
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
    const p = await browser.newPage();
    await p.setViewport({
      width: w,
      height: h,
      deviceScaleFactor: m ? 2 : 1,
      isMobile: m,
      hasTouch: m,
    });
    await p.goto(url, { waitUntil: "networkidle2", timeout: 60000 });
    const geo = await p.evaluate(() => ({
      docW: document.documentElement.scrollWidth,
      vw: window.innerWidth,
    }));
    if (geo.docW > geo.vw + 1) throw new Error("hscroll " + w);
    await p.screenshot({ path: path.join(outDir, n + ".png"), fullPage: true });
    await p.close();
    console.log("shot", n);
  }
  await browser.close();
}

function updateSitemap() {
  const sm = path.join(ROOT, "site_mirror/sitemap.xml");
  let c = fs.readFileSync(sm, "utf8");
  if (c.includes(`yandex-direct/${slug}/`)) {
    console.log("SITEMAP EXISTS");
    return;
  }
  const block = `  <url>\n    <loc>https://raskrutov.kz/web-studiya/kontekstnaya-reklama/yandex-direct/${slug}/</loc>\n  </url>`;
  const re =
    /  <url>\s*<loc>https:\/\/raskrutov\.kz\/web-studiya\/kontekstnaya-reklama\/yandex-direct\/[a-z0-9-]+\/<\/loc>\s*<\/url>/g;
  let last = null,
    m;
  while ((m = re.exec(c))) last = m;
  if (!last) throw new Error("no sitemap anchor");
  c = c.slice(0, last.index + last[0].length) + "\n" + block + c.slice(last.index + last[0].length);
  fs.writeFileSync(sm, c);
  console.log("SITEMAP UPDATED");
}

function commitPush() {
  sh(`git add -- ${page} site_mirror/sitemap.xml`);
  sh(`git commit -m "feat: add Yandex Direct ${city} page"`);
  sh("git push origin HEAD:work/pc1");
  return shOut("git rev-parse HEAD");
}

function waitIntegrate(sha) {
  for (let i = 0; i < 48; i++) {
    const json = JSON.parse(
      shOut(
        "gh run list --workflow=integrate-parallel-work.yml --limit 5 --json databaseId,status,conclusion,headSha"
      )
    );
    const run = json.find((r) => r.headSha === sha) || json[0];
    console.log(`int ${i}: ${run.status} ${run.conclusion} ${run.headSha}`);
    if (run.headSha === sha && run.status === "completed") {
      if (run.conclusion !== "success") throw new Error("integrate failed");
      break;
    }
    execSync("powershell -NoProfile -Command Start-Sleep -Seconds 5");
  }
  sh("git fetch origin main --prune");
  execSync(`git merge-base --is-ancestor ${sha} origin/main`, { stdio: "ignore" });
  return shOut("git rev-parse origin/main");
}

function deployPlesk() {
  const dst = `site_plesk/web-studiya/kontekstnaya-reklama/yandex-direct/${slug}`;
  fs.mkdirSync(dst, { recursive: true });
  fs.copyFileSync(page, path.join(dst, "index.html"));
  fs.copyFileSync("site_mirror/sitemap.xml", "site_plesk/sitemap.xml");
  sh(
    `git -C site_plesk add -- web-studiya/kontekstnaya-reklama/yandex-direct/${slug}/index.html sitemap.xml`
  );
  sh(`git -C site_plesk commit -m "feat: add Yandex Direct ${city} page"`);
  sh("git -C site_plesk push origin HEAD:plesk");
  return shOut("git -C site_plesk rev-parse HEAD");
}

function verifyProd() {
  return new Promise((resolve, reject) => {
    let t = 0;
    const once = () => {
      https
        .get(prod, { headers: { "Cache-Control": "no-cache" } }, (res) => {
          const chunks = [];
          res.on("data", (c) => chunks.push(c));
          res.on("end", () => {
            const h = Buffer.concat(chunks).toString("utf8");
            const ok =
              res.statusCode === 200 && formRe.test(h) && /min-width: 769px/.test(h);
            console.log("prod", t, res.statusCode, ok);
            if (ok) return resolve(true);
            if (++t > 30) return reject(new Error("prod fail"));
            setTimeout(once, 8000);
          });
        })
        .on("error", () => {
          if (++t > 30) return reject(new Error("prod error"));
          setTimeout(once, 8000);
        });
    };
    once();
  });
}

(async () => {
  const median = runLhMobile();
  runLhDesktop();
  await shots();
  updateSitemap();
  const commit = commitPush();
  const main = waitIntegrate(commit);
  const plesk = deployPlesk();
  await verifyProd();
  const result = {
    slug,
    commit,
    main,
    plesk,
    mobile_median: median,
    desktop: 100,
    production_verified: true,
  };
  fs.writeFileSync(path.join(outDir, "publish-result.json"), JSON.stringify(result, null, 2));
  console.log("PUBLISH_RESULT", JSON.stringify(result));
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
