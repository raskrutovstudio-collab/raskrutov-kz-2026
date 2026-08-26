const fs = require("fs");
const html = fs.readFileSync(
  "site_mirror/web-studiya/kontekstnaya-reklama/yandex-direct/pavlodar/index.html",
  "utf8"
);
const checks = [];
const ok = (n, p, e) => checks.push({ n, p: !!p, e });
ok("one H1", (html.match(/<h1[\s\S]*?<\/h1>/g) || []).length === 1, (html.match(/<h1[^>]*>([^<]+)/) || [])[1]);
ok("canonical", html.includes('href="https://raskrutov.kz/web-studiya/kontekstnaya-reklama/yandex-direct/pavlodar/"'));
ok("title unique", html.includes("<title>Яндекс Директ в Павлодаре — настройка и ведение | Raskrutov</title>"));
ok("desc", /meta name="description" content="[^"]+Павлодар[^"]*"/.test(html));
ok("JSON-LD parse", (() => { try { JSON.parse(html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)[1]); return true; } catch { return false; } })());
ok("AreaServed Pavlodar", html.includes('"name":"Pavlodar"'));
ok("Petropavlovsk office", html.includes("Петропавловск") && html.includes("Жумабаева"));
ok("no Pavlodar office claim", !/офис[^\.]{0,40}Павлодар|филиал[^\.]{0,40}Павлодар|представительств[^\.]{0,40}Павлодар/.test(html) || /Филиала в Павлодаре нет/.test(html));
ok("Metrika 101127167", (html.match(/101127167/g) || []).length >= 2);
ok("price 120 000", html.includes("120 000"));
ok("form contacts", html.includes('id="rk-form-contacts-yd-pavlodar"') && html.includes('name="contacts_yandex_direct_pavlodar"'));
ok("form popup", html.includes('id="rk-form-popup-yd-pavlodar"') && html.includes('name="popup_yandex_direct_pavlodar"'));
ok("prefix yd-pvl-", html.includes("yd-pvl-faq-q1") && html.includes("yd-pvl-contact-name"));
ok("assets depth", html.includes('../../../../assets/'));
ok("no ne-x-a-y", !/не\s+[^,.]{2,40},\s+а\s+/i.test(html));
ok("no astana leftovers", !/Астан|astana|yd-ast-|ydAst/i.test(html));
console.log(JSON.stringify(checks, null, 2));
console.log("FAILS", checks.filter((c) => !c.p).map((c) => c.n));
