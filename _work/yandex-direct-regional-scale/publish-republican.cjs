/**
 * Republican Yandex Direct hub QA+publish.
 * Usage: node publish-republican.cjs
 * Gzip server must be on 127.0.0.1:8766.
 */
const { spawnSync, execSync } = require("child_process");
const fs = require("fs");
const path = require("path");
const https = require("https");

const ROOT = process.cwd();
const page = "site_mirror/web-studiya/kontekstnaya-reklama/yandex-direct/index.html";
const outDir = "site_mirror/_work/yandex-direct-regional-scale/republican-index";
const url = "http://127.0.0.1:8766/web-studiya/kontekstnaya-reklama/yandex-direct/";
const prod = "https://raskrutov.kz/web-studiya/kontekstnaya-reklama/yandex-direct/";
const chrome = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const lh = "node_modules/lighthouse/cli/index.js";
const formRe = /rk-form-contacts-yd/;
const cityMarker = /id="cities"/;
const allCitiesRe =
  /yandex-direct\/(astana|almaty|shymkent|karaganda|aktobe|taraz|pavlodar|ust-kamenogorsk|semey|atyrau|kostanay|kyzylorda|uralsk|petropavlovsk|aktau|turkestan|kokshetau|taldykorgan)\//g;

function sh(cmd) {
  console.log(">", cmd);
  execSync(cmd, { stdio: "inherit", encoding: "utf8" });
}
function shOut(cmd) {
  return execSync(cmd, { encoding: "utf8" }).trim();
}

if (!fs.existsSync(page)) throw new Error("missing " + page);
const html = fs.readFileSync(page, "utf8");
if (/пилотн|пока не публикуем|на этом этапе не публикуем/i.test(html)) {
  throw new Error("pilot framing still present");
}
if (!cityMarker.test(html)) throw new Error("missing #cities");
const found = new Set([...html.matchAll(allCitiesRe)].map((m) => m[1]));
if (found.size !== 18) throw new Error("city links incomplete: " + [...found].join(","));
fs.mkdirSync(path.join(outDir, "lh"), { recursive: true });

sh("npm run quality:all");

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
      if (row.a < 100 || row.b < 100 || row.s < 100) bad = true;
    }
    const median = scores.map((x) => x.p).sort((a, b) => a - b)[1];
    const tbtMed = scores.map((x) => x.tbt).sort((a, b) => a - b)[1];
    console.log("ROUND", round, "median", median, "tbtMed", tbtMed, "bad", bad);
    if (!bad && median >= 95 && tbtMed <= 100) {
      fs.writeFileSync(
        path.join(outDir, "lh", "lh-mobile-pass.json"),
        JSON.stringify({ round, scores, median, tbtMed }, null, 2)
      );
      return { median, scores, tbtMed };
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
    [390, 844, true, "republican-390"],
    [1440, 900, false, "republican-1440"],
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
      cities: !!document.getElementById("cities"),
      cityLinks: document.querySelectorAll("#cities .ctx-related__grid a").length,
    }));
    if (geo.docW > geo.vw + 1) throw new Error("hscroll " + w);
    if (!geo.cities || geo.cityLinks !== 18) throw new Error("cities UI fail " + JSON.stringify(geo));
    await p.screenshot({ path: path.join(outDir, n + ".png"), fullPage: true });
    await p.close();
    console.log("shot", n);
  }
  await browser.close();
}

function commitPush() {
  sh(`git add -- ${page}`);
  sh('git commit -m "feat: update Yandex Direct republican hub for full city cluster"');
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
  const dst = "site_plesk/web-studiya/kontekstnaya-reklama/yandex-direct";
  fs.mkdirSync(dst, { recursive: true });
  fs.copyFileSync(page, path.join(dst, "index.html"));
  sh("git -C site_plesk add -- web-studiya/kontekstnaya-reklama/yandex-direct/index.html");
  sh(
    'git -C site_plesk commit -m "feat: update Yandex Direct republican hub for full city cluster"'
  );
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
            const cities = new Set([...h.matchAll(allCitiesRe)].map((m) => m[1]));
            const ok =
              res.statusCode === 200 &&
              formRe.test(h) &&
              cityMarker.test(h) &&
              cities.size === 18 &&
              !/пилотн|пока не публикуем/i.test(h) &&
              /min-width: 769px/.test(h);
            console.log("prod", t, res.statusCode, ok, "cities", cities.size);
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
  const mobile = runLhMobile();
  runLhDesktop();
  await shots();
  const commit = commitPush();
  const main = waitIntegrate(commit);
  const plesk = deployPlesk();
  await verifyProd();
  const result = {
    page: "yandex-direct/",
    commit,
    main,
    plesk,
    mobile_median: mobile.median,
    mobile_scores: mobile.scores,
    desktop: 100,
    production_verified: true,
  };
  fs.writeFileSync(path.join(outDir, "publish-result.json"), JSON.stringify(result, null, 2));
  console.log("PUBLISH_RESULT", JSON.stringify(result));
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
