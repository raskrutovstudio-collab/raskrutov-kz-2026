const fs = require("fs");
const p = "d:/РАБОТА/111 ПОРТАЛ ,,, ПРОЕКТ РАСКРУТОВ 05,2026 111/raskrutov-kz-2026/site_mirror/web-studiya/kontekstnaya-reklama/google-ads/index.html";
const t = fs.readFileSync(p, "utf8");
const checks = [
  "Собираем семантику и объявления, подключаем конверсии и оптимизируем кампании по плану",
  "Собираем кампании под задачу",
  "Как мы используем автоматизацию</h2>",
  "Настройка и ведение</h2>",
  "Связываем данные кабинета с GA4",
  "От поискового запроса до",
  "Без корректных конверсий кабинет оптимизируется",
  "Реклама для лидогенерации",
  "Реклама для e-commerce",
  "товарные кампании, автоматизированные форматы, поиск",
  "настройке и ведению начинается",
  "Кому подходит этот формат",
  "Запустим рекламу под ваш спрос",
  "ведению рекламы для бизнеса:",
  "подготовим план запуска",
  "Коротко о работе с рекламой",
  "Какие задачи решает реклама",
  "Типы кампаний</h2>",
  "Частые вопросы</h2>",
  "timeout: 4000",
  "gads-contact-regulation",
  "aria-atomic=\"true\"",
  "media=\"print\"",
  // should be gone
];
const gone = [
  "Собираем спрос, семантику",
  "Мы настраиваем кампании под задачу",
  "автоматизацию Google Ads</h2>",
  "Настройка и ведение Google Ads</h2>",
  "данные Google Ads с GA4",
  "запроса в Google Ads до",
  "конверсий Google Ads оптимизируется",
  "Google Ads для лидогенерации",
  "Google Ads для e-commerce",
  "товарные кампании, Performance Max, поиск",
  "ведению Google Ads начинается",
  "Кому подходит Google Ads",
  "Запустим Google Ads под ваш спрос в Казахстане",
  "ведению Google Ads для бизнеса в Казахстане",
  "план по Google Ads.",
  "работе с Google Ads</h2>",
  "решает Google Ads</h2>",
  "кампаний Google Ads</h2>",
  "вопросы о Google Ads</h2>",
  "timeout: 1800"
];
for (const c of checks) console.log((t.includes(c)?"OK ":"MISS"), c);
console.log("---gone---");
for (const c of gone) console.log((t.includes(c)?"STILL":"gone"), c);
// schema FAQ vs visible FAQ match
const j = JSON.parse(t.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)[1]);
const faq = j["@graph"].find(x=>x["@type"]==="FAQPage");
const faqSec = t.match(/<section class="rk-section ctx-faq" id="faq">[\s\S]*?<\/section>/)[0];
const qs = [...faqSec.matchAll(/<h3 class="rk-faq__q">([^<]+)<\/h3>/g)].map(m=>m[1]);
const as = [...faqSec.matchAll(/<div class="rk-faq__a">([\s\S]*?)<\/div>/g)].map(m=>m[1]);
let mismatch=0;
faq.mainEntity.forEach((q,i)=>{
  if (q.name!==qs[i] || q.acceptedAnswer.text!==as[i]) { mismatch++; console.log("MISMATCH", i+1); }
});
console.log("schema/html FAQ mismatch", mismatch);
console.log("CRLF", t.includes("\r\n"));
console.log("size bytes", Buffer.byteLength(t,"utf8"));
