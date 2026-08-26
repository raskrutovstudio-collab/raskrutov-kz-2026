/**
 * Visual / functional QA for google-ads page. Writes only under _work/google-ads-perf/.
 */
const fs = require("fs");
const path = require("path");
const { chromium } = require("playwright");

const ROOT = path.resolve(__dirname, "../../..");
const OUT = path.join(__dirname, "shots");
const URL =
  "http://127.0.0.1:4180/web-studiya/kontekstnaya-reklama/google-ads/";
const CSS_PAGE = path.join(ROOT, "site_mirror/assets/css/google-ads-page.css");
const CSS_KON = path.join(ROOT, "site_mirror/assets/css/kontekst-clean.css");
const CSS_HOME = path.join(ROOT, "site_mirror/assets/css/home-clean.css");

fs.mkdirSync(OUT, { recursive: true });

function checkContrastColors() {
  const files = [CSS_PAGE, CSS_KON, CSS_HOME].filter((f) => fs.existsSync(f));
  const texts = files.map((f) => fs.readFileSync(f, "utf8")).join("\n");
  // also check page HTML for inline / linked rules in google-ads-page
  const pageCss = fs.existsSync(CSS_PAGE) ? fs.readFileSync(CSS_PAGE, "utf8") : "";
  const html = fs.readFileSync(
    path.join(
      ROOT,
      "site_mirror/web-studiya/kontekstnaya-reklama/google-ads/index.html"
    ),
    "utf8"
  );
  const blob = texts + "\n" + pageCss + "\n" + html;
  return {
    has0b57d0: /#0b57d0/i.test(blob),
    has3d3550: /#3d3550/i.test(blob),
    has5b21b6: /#5b21b6/i.test(blob),
    landingSeoUnderline: /#landing-seo\s+a[\s\S]{0,200}underline/i.test(blob) ||
      /#landing-seo a\s*\{[^}]*text-decoration\s*:\s*underline/i.test(blob),
    consentUnderline: /\.rk-consent\s+a[\s\S]{0,200}underline/i.test(blob) ||
      /\.rk-consent a\s*\{[^}]*text-decoration\s*:\s*underline/i.test(blob),
  };
}

async function overflowCheck(page, width, height, name) {
  await page.setViewportSize({ width, height });
  await page.goto(URL, { waitUntil: "networkidle", timeout: 60000 });
  await page.waitForTimeout(400);
  const shot = path.join(OUT, name);
  await page.screenshot({ path: shot, fullPage: false });
  const metrics = await page.evaluate(() => {
    const de = document.documentElement;
    return {
      scrollWidth: de.scrollWidth,
      innerWidth: window.innerWidth,
      overflow: de.scrollWidth > window.innerWidth + 1,
    };
  });
  return { shot, ...metrics };
}

async function main() {
  const result = {
    overflow: {},
    fouc: {},
    noscript: {},
    console: { pageerrors: [], errors: [], filtered: [] },
    form: {},
    faq: {},
    contrastCss: checkContrastColors(),
  };

  const browser = await chromium.launch({ headless: true });

  // 1) Overflow screenshots at 4 widths
  {
    const page = await browser.newPage();
    for (const [w, h, name] of [
      [360, 800, "final-360.png"],
      [390, 844, "final-390.png"],
      [768, 1024, "final-768.png"],
      [1440, 900, "final-1440.png"],
    ]) {
      result.overflow[name] = await overflowCheck(page, w, h, name);
      console.log("overflow", name, result.overflow[name]);
    }
    await page.close();
  }

  // 2) FOUC check at 390
  {
    const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
    let firstPaintDone = false;
    page.on("framenavigated", () => {});
    // Navigate and capture early
    const navPromise = page.goto(URL, { waitUntil: "commit", timeout: 60000 });
    // Poll for body presence then wait ~200ms after first paint signal
    await navPromise;
    await page.waitForFunction(() => document.body && document.querySelector("h1"), {
      timeout: 15000,
    });
    await page.waitForTimeout(200);
    const earlyShot = path.join(OUT, "final-390-fouc-200ms.png");
    await page.screenshot({ path: earlyShot, fullPage: false });
    const early = await page.evaluate(() => {
      const h1 = document.querySelector("h1, .ctx-hero__title, #ctx-hero h1");
      const lead = document.querySelector(".ctx-hero__lead");
      const header = document.querySelector("header, .rk-header, .site-header");
      const hero = document.querySelector("#ctx-hero, .ctx-hero");
      const cs = (el) => (el ? getComputedStyle(el) : null);
      const h1cs = cs(h1);
      const leadcs = cs(lead);
      return {
        h1Text: h1 ? h1.textContent.trim().slice(0, 120) : null,
        leadText: lead ? lead.textContent.trim().slice(0, 120) : null,
        h1Visible: !!(h1 && h1cs && h1cs.visibility !== "hidden" && h1cs.opacity !== "0" && h1.getClientRects().length),
        leadVisible: !!(lead && leadcs && leadcs.visibility !== "hidden" && leadcs.opacity !== "0" && lead.getClientRects().length),
        headerPresent: !!header,
        heroPresent: !!hero,
        h1Font: h1cs ? h1cs.fontFamily : null,
        leadFont: leadcs ? leadcs.fontFamily : null,
      };
    });
    await page.waitForLoadState("load");
    await page.waitForTimeout(800);
    const lateShot = path.join(OUT, "final-390-fouc-loaded.png");
    await page.screenshot({ path: lateShot, fullPage: false });
    const late = await page.evaluate(() => {
      const h1 = document.querySelector("h1, .ctx-hero__title, #ctx-hero h1");
      const lead = document.querySelector(".ctx-hero__lead");
      const cs = (el) => (el ? getComputedStyle(el) : null);
      const h1cs = cs(h1);
      const leadcs = cs(lead);
      const fontsReady =
        document.fonts && document.fonts.status ? document.fonts.status : "unknown";
      return {
        h1Visible: !!(h1 && h1cs && h1cs.visibility !== "hidden" && h1cs.opacity !== "0" && h1.getClientRects().length),
        leadVisible: !!(lead && leadcs && leadcs.visibility !== "hidden" && leadcs.opacity !== "0" && lead.getClientRects().length),
        h1Font: h1cs ? h1cs.fontFamily : null,
        leadFont: leadcs ? leadcs.fontFamily : null,
        fontsStatus: fontsReady,
      };
    });
    result.fouc = {
      earlyShot,
      lateShot,
      early,
      late,
      fontsSwapped:
        early.h1Font !== late.h1Font || early.leadFont !== late.leadFont,
      heroVisibleBoth:
        early.h1Visible &&
        early.leadVisible &&
        late.h1Visible &&
        late.leadVisible &&
        early.headerPresent &&
        early.heroPresent,
    };
    console.log("fouc", JSON.stringify(result.fouc, null, 2));
    await page.close();
  }

  // 3) JS disabled
  {
    const context = await browser.newContext({
      javaScriptEnabled: false,
      viewport: { width: 390, height: 844 },
    });
    const page = await context.newPage();
    await page.goto(URL, { waitUntil: "load", timeout: 60000 });
    const noscriptShot = path.join(OUT, "final-390-noscript.png");
    await page.screenshot({ path: noscriptShot, fullPage: false });
    result.noscript = await page.evaluate(() => {
      const h1 = document.querySelector("h1");
      const lead = document.querySelector(".ctx-hero__lead");
      const forms = Array.from(document.querySelectorAll("form"));
      const hero = document.querySelector("#ctx-hero, .ctx-hero");
      return {
        shot: null,
        h1Present: !!h1,
        h1Text: h1 ? h1.textContent.trim().slice(0, 100) : null,
        leadPresent: !!lead,
        leadText: lead ? lead.textContent.trim().slice(0, 100) : null,
        formCount: forms.length,
        formsHaveFields: forms.map((f) => ({
          fields: f.querySelectorAll("input, textarea, select").length,
        })),
        heroPresent: !!hero,
        overflow: document.documentElement.scrollWidth > window.innerWidth + 1,
      };
    });
    result.noscript.shot = noscriptShot;
    console.log("noscript", result.noscript);
    await context.close();
  }

  // 4) Console errors at 390
  {
    const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
    page.on("pageerror", (err) => {
      result.console.pageerrors.push(String(err));
    });
    page.on("console", (msg) => {
      if (msg.type() === "error") {
        result.console.errors.push(msg.text());
      }
    });
    await page.goto(URL, { waitUntil: "networkidle", timeout: 60000 });
    await page.waitForTimeout(2000);
    const ignore = (t) =>
      /solid\.ws|mc\.yandex|metrika|webvisor|yandex\.ru\/metrica/i.test(t);
    result.console.filtered = [
      ...result.console.pageerrors,
      ...result.console.errors,
    ].filter((t) => !ignore(t));
    console.log("console filtered", result.console.filtered);
    await page.close();
  }

  // 5) Forms modal
  {
    const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
    await page.goto(URL, { waitUntil: "networkidle", timeout: 60000 });
    const openers = [
      '[data-rk-open-modal="rk-modal-lead"]',
      'button:has-text("Обсудить запуск рекламы")',
      'button:has-text("Оставить заявку")',
      'a:has-text("Оставить заявку")',
      '[data-modal]',
      '.rk-modal-open',
      'button[data-open-modal]',
      'a[href="#lead"]',
    ];
    let opened = false;
    let openerUsed = null;
    for (const sel of openers) {
      const el = page.locator(sel).first();
      if ((await el.count()) > 0) {
        try {
          await el.click({ timeout: 3000 });
          await page.waitForTimeout(500);
          const visibleForm = await page.evaluate(() => {
            const modal = document.querySelector("#rk-modal-lead");
            const form = modal
              ? modal.querySelector("form")
              : document.querySelector(".rk-modal form, form.rk-form");
            if (!form) return null;
            const modalEl = form.closest(".rk-modal, dialog, .modal");
            const style = modalEl
              ? getComputedStyle(modalEl)
              : getComputedStyle(form);
            const hiddenAttr = modalEl ? modalEl.hasAttribute("hidden") : false;
            const visible =
              !hiddenAttr &&
              style &&
              style.display !== "none" &&
              style.visibility !== "hidden";
            const fields = Array.from(
              form.querySelectorAll("input, textarea, select")
            )
              .filter((inp) => (inp.getAttribute("type") || "") !== "hidden")
              .map((inp) => {
                const id = inp.id;
                const label =
                  (id && document.querySelector(`label[for="${id}"]`)) ||
                  inp.closest("label") ||
                  form.querySelector(`label[for="${inp.name}"]`);
                const aria = inp.getAttribute("aria-label");
                return {
                  name: inp.getAttribute("name"),
                  type: inp.getAttribute("type") || inp.tagName.toLowerCase(),
                  hasLabel: !!(label || aria),
                };
              });
            const submit = form.querySelector(
              'button[type="submit"], input[type="submit"]'
            );
            return {
              visible,
              modalHidden: hiddenAttr,
              fieldCount: fields.length,
              fields,
              hasSubmit: !!submit,
              submitText: submit
                ? (submit.textContent || submit.value || "").trim()
                : null,
            };
          });
          if (visibleForm && visibleForm.visible && visibleForm.fieldCount > 0) {
            opened = true;
            openerUsed = sel;
            result.form = { opened: true, openerUsed, ...visibleForm };
            const modalShot = path.join(OUT, "final-390-modal.png");
            await page.screenshot({ path: modalShot, fullPage: false });
            result.form.shot = modalShot;
            break;
          }
        } catch (e) {
          // try next
        }
      }
    }
    if (!opened) {
      // Fallback: inspect inline forms without modal
      result.form = await page.evaluate(() => {
        const forms = Array.from(document.querySelectorAll("form"));
        return {
          opened: false,
          inlineForms: forms.map((form) => {
            const fields = Array.from(
              form.querySelectorAll("input, textarea, select")
            ).map((inp) => {
              const id = inp.id;
              const label =
                (id && document.querySelector(`label[for="${id}"]`)) ||
                inp.closest("label");
              const aria = inp.getAttribute("aria-label");
              return {
                name: inp.getAttribute("name"),
                type: inp.getAttribute("type") || inp.tagName.toLowerCase(),
                hasLabel: !!(label || aria),
              };
            });
            const submit = form.querySelector(
              'button[type="submit"], input[type="submit"]'
            );
            return {
              fieldCount: fields.length,
              fields,
              hasSubmit: !!submit,
            };
          }),
        };
      });
    }
    console.log("form", JSON.stringify(result.form, null, 2));
    await page.close();
  }

  // 6) FAQ
  {
    const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
    await page.goto(URL, { waitUntil: "networkidle", timeout: 60000 });
    result.faq = await page.evaluate(async () => {
      const target =
        document.querySelector("[data-gads-faq-btn]") ||
        document.querySelector(".gads-faq__btn") ||
        document.querySelector("button[aria-controls^='gads-faq']");
      if (!target) return { found: false };
      const before = target.getAttribute("aria-expanded");
      target.click();
      await new Promise((r) => setTimeout(r, 400));
      const after = target.getAttribute("aria-expanded");
      let answerVisible = false;
      const panelId = target.getAttribute("aria-controls");
      if (panelId) {
        const panel = document.getElementById(panelId);
        if (panel) {
          const cs = getComputedStyle(panel);
          const hidden = panel.hasAttribute("hidden");
          answerVisible =
            !hidden &&
            cs.display !== "none" &&
            cs.visibility !== "hidden" &&
            panel.getClientRects().length > 0 &&
            (panel.textContent || "").trim().length > 0;
        }
      }
      return {
        found: true,
        ariaExpandedBefore: before,
        ariaExpandedAfter: after,
        ariaChanged: before !== after,
        answerVisible,
      };
    });
    console.log("faq", result.faq);
    await page.close();
  }

  await browser.close();

  const outPath = path.join(__dirname, "final-qa.json");
  fs.writeFileSync(outPath, JSON.stringify(result, null, 2), "utf8");
  console.log("Wrote", outPath);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
