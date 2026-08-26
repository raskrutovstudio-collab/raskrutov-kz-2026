const fs = require("fs");
const path = require("path");
const https = require("https");
const { spawnSync } = require("child_process");

const cities = [
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
];

const cityNames = {
  astana: "Астан",
  almaty: "Алмат",
  shymkent: "Шымкент",
  karaganda: "Караганд",
  aktobe: "Актоб",
  taraz: "Тараз",
  pavlodar: "Павлодар",
  "ust-kamenogorsk": "Усть-Каменогорск",
  semey: "Семей",
  atyrau: "Атырау",
  kostanay: "Костанай",
  kyzylorda: "Кызылорд",
  uralsk: "Уральск",
  petropavlovsk: "Петропавловск",
  aktau: "Актау",
  turkestan: "Туркестан",
  kokshetau: "Кокшетау",
  taldykorgan: "Талдыкорган",
};

const base = "site_mirror/web-studiya/kontekstnaya-reklama/yandex-direct";
const work = "site_mirror/_work/yandex-direct-regional-scale";

function sectionBalance(html) {
  const open = (html.match(/<section\b/gi) || []).length;
  const close = (html.match(/<\/section>/gi) || []).length;
  return { open, close, ok: open === close };
}

function get(url) {
  return new Promise((resolve) => {
    const req = https.get(
      url,
      {
        headers: { "User-Agent": "RaskrutovClusterQA/1.0", Accept: "text/html" },
        timeout: 20000,
      },
      (res) => {
        const chunks = [];
        res.on("data", (c) => chunks.push(c));
        res.on("end", () => {
          const body = Buffer.concat(chunks).toString("utf8");
          resolve({
            status: res.statusCode,
            contentType: String(res.headers["content-type"] || ""),
            body,
          });
        });
      }
    );
    req.on("error", (e) => resolve({ status: 0, contentType: "", body: "", error: String(e) }));
    req.on("timeout", () => {
      req.destroy();
      resolve({ status: 0, contentType: "", body: "", error: "timeout" });
    });
  });
}

function extractH1(html) {
  const m = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i);
  if (!m) return "";
  return m[1].replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

function officeFaqSnippet(html) {
  // look near office-related FAQ answers
  const lower = html.toLowerCase();
  const keys = ["офис", "офиса", "офисе"];
  const faqs = [];
  const re = /<details[\s\S]*?<\/details>/gi;
  let m;
  while ((m = re.exec(html))) {
    const block = m[0];
    const bl = block.toLowerCase();
    if (keys.some((k) => bl.includes(k))) {
      const text = block.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
      faqs.push(text.slice(0, 280));
    }
  }
  return faqs.slice(0, 3);
}

async function main() {
  const local = [];
  for (const c of cities) {
    const html = fs.readFileSync(path.join(base, c, "index.html"), "utf8");
    const bal = sectionBalance(html);
    const formId = `rk-form-contacts-yd-${c}`;
    const hasContactsForm = html.includes(`id="${formId}"`) || html.includes(formId);
    const formIds = [...html.matchAll(/id="(rk-form[^"]+)"/g)].map((x) => x[1]);
    const uniqueForms = [...new Set(formIds)];
    const hasPopup = uniqueForms.some((id) => id.includes("popup") || id.includes("modal") || id !== formId);
    const metrika = html.includes("101127167");
    const price =
      html.includes("120 000") ||
      html.includes("120&nbsp;000") ||
      html.includes("120\u00a0000");
    const h1 = extractH1(html);
    const cityHint = cityNames[c];
    local.push({
      slug: c,
      sectionOpen: bal.open,
      sectionClose: bal.close,
      sectionBal: bal.ok,
      contactsForm: formId,
      hasContactsForm,
      formIds: uniqueForms,
      hasPopupForm: hasPopup && uniqueForms.length >= 2,
      metrika,
      price,
      h1,
      h1HasYandex: /яндекс|директ/i.test(h1),
      h1HasCity: cityHint ? h1.includes(cityHint) : false,
      officeFaqs: officeFaqSnippet(html),
    });
  }

  // screenshots
  const shots = cities.map((c) => {
    const d = path.join(work, c);
    return {
      slug: c,
      "390": fs.existsSync(path.join(d, `${c}-390.png`)),
      "1440": fs.existsSync(path.join(d, `${c}-1440.png`)),
      "430": fs.existsSync(path.join(d, `${c}-430.png`)),
      "768": fs.existsSync(path.join(d, `${c}-768.png`)),
    };
  });

  // similarity pairs
  const pairs = [
    ["kostanay", "kyzylorda"],
    ["kyzylorda", "uralsk"],
    ["uralsk", "petropavlovsk"],
    ["aktau", "turkestan"],
    ["kokshetau", "taldykorgan"],
  ];
  const simScript = path.join(work, "similarity-check.cjs");
  const similarity = pairs.map(([a, b]) => {
    const pa = path.join(base, a, "index.html");
    const pb = path.join(base, b, "index.html");
    const r = spawnSync(process.execPath, [simScript, pa, pb], { encoding: "utf8" });
    let parsed = null;
    try {
      parsed = JSON.parse(r.stdout);
    } catch (_) {
      parsed = { raw: r.stdout, stderr: r.stderr, status: r.status };
    }
    return { a, b, exit: r.status, pass: r.status === 0, result: parsed };
  });

  // production HTTP
  const urls = [
    { slug: "hub", url: "https://raskrutov.kz/web-studiya/kontekstnaya-reklama/yandex-direct/" },
    ...cities.map((c) => ({
      slug: c,
      url: `https://raskrutov.kz/web-studiya/kontekstnaya-reklama/yandex-direct/${c}/`,
    })),
  ];

  const http = [];
  for (const u of urls) {
    const res = await get(u.url);
    const h1 = extractH1(res.body);
    const hint = u.slug === "hub" ? null : cityNames[u.slug];
    http.push({
      slug: u.slug,
      url: u.url,
      status: res.status,
      contentType: res.contentType,
      ok:
        res.status === 200 &&
        /text\/html/i.test(res.contentType),
      h1,
      h1HasYandex: /яндекс|директ/i.test(h1),
      h1HasCity: hint ? h1.includes(hint) : /яндекс|директ|казахстан|рк|республик/i.test(h1),
      error: res.error || null,
      bodyLen: res.body.length,
    });
  }

  // hub analysis from production
  const hubHttp = http.find((x) => x.slug === "hub");
  let hubLinks = { missing: [], found: [], pilotOnly: false, bodySnippet: "" };
  if (hubHttp && hubHttp.status === 200) {
    const hubRes = await get(hubHttp.url);
    const body = hubRes.body;
    hubLinks.pilotOnly =
      /только\s+астан/i.test(body) ||
      /pilot\s+only/i.test(body) ||
      /пилотный\s+город/i.test(body);
    for (const c of cities) {
      const re = new RegExp(`yandex-direct/${c}/`);
      if (re.test(body)) hubLinks.found.push(c);
      else hubLinks.missing.push(c);
    }
  }

  const out = {
    generated_at: new Date().toISOString(),
    local,
    shots,
    similarity,
    http,
    hubLinks,
    petropavlovsk_office: local.find((x) => x.slug === "petropavlovsk")?.officeFaqs || [],
    remote_office_sample: local.find((x) => x.slug === "turkestan")?.officeFaqs || [],
    kokshetau_office: local.find((x) => x.slug === "kokshetau")?.officeFaqs || [],
  };

  const outPath = path.join(work, "_cluster-qa-raw.json");
  fs.writeFileSync(outPath, JSON.stringify(out, null, 2), "utf8");
  console.log("Wrote", outPath);
  console.log(
    "SUMMARY sections fail:",
    local.filter((x) => !x.sectionBal).map((x) => x.slug)
  );
  console.log(
    "FORMS fail:",
    local
      .filter((x) => !x.hasContactsForm || !x.hasPopupForm || !x.metrika || !x.price)
      .map((x) => x.slug)
  );
  console.log(
    "SHOTS missing 390/1440:",
    shots.filter((x) => !x["390"] || !x["1440"]).map((x) => x.slug)
  );
  console.log(
    "SIM fail:",
    similarity.filter((x) => !x.pass).map((x) => `${x.a}-${x.b}`)
  );
  console.log(
    "HTTP fail:",
    http.filter((x) => !x.ok).map((x) => `${x.slug}:${x.status}`)
  );
  console.log("HUB missing links:", hubLinks.missing);
  console.log("HUB pilotOnly:", hubLinks.pilotOnly);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
