const fs = require("fs");
const p = "d:/РАБОТА/111 ПОРТАЛ ,,, ПРОЕКТ РАСКРУТОВ 05,2026 111/raskrutov-kz-2026/site_mirror/web-studiya/kontekstnaya-reklama/google-ads/index.html";
const t = fs.readFileSync(p, "utf8");
const j = JSON.parse(t.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)[1]);
const faq = j["@graph"].find(x => x["@type"] === "FAQPage");
faq.mainEntity.forEach((q, i) => {
  console.log("Q"+(i+1)+": "+q.name);
  console.log("A"+(i+1)+": "+q.acceptedAnswer.text);
  console.log("---");
});
const checks = [
  "Собираем спрос, семантику и объявления",
  "Собираем семантику и объявления, подключаем конверсии",
  "Мы настраиваем кампании под задачу",
  "Собираем кампании под задачу",
  "Как мы используем автоматизацию Google Ads",
  "Как мы используем автоматизацию</h2>",
  "Настройка и ведение Google Ads</h2>",
  "Настройка и ведение</h2>",
  "Связываем данные Google Ads с GA4",
  "Связываем данные кабинета с GA4",
  "От поискового запроса в Google Ads до",
  "От поискового запроса до",
  "Без корректных конверсий Google Ads оптимизируется",
  "Без корректных конверсий кабинет оптимизируется",
  "Google Ads для лидогенерации",
  "Реклама для лидогенерации",
  "Google Ads для e-commerce",
  "Реклама для e-commerce",
  "товарные кампании, Performance Max, поиск",
  "товарные кампании, автоматизированные форматы, поиск",
  "настройке и ведению Google Ads начинается",
  "настройке и ведению начинается",
  "Кому подходит Google Ads",
  "Кому подходит этот формат",
  "Запустим Google Ads под ваш спрос в Казахстане",
  "Запустим рекламу под ваш спрос",
  "ведению Google Ads для бизнеса в Казахстане",
  "ведению рекламы для бизнеса:",
  "подготовим план по Google Ads",
  "подготовим план запуска",
  "Коротко о работе с Google Ads",
  "Коротко о работе с рекламой",
  "Какие задачи решает Google Ads",
  "Какие задачи решает реклама",
  "Типы кампаний Google Ads",
  "Типы кампаний</h2>",
  "Частые вопросы о Google Ads",
  "Частые вопросы</h2>",
  "aria-atomic",
  "gads-contact-regulation",
  "value=\"accepted\"",
  "hero-ctx.webp 600w"
];
for (const c of checks) console.log((t.includes(c) ? "YES" : "NO "), c);
console.log("\n--- FAQ HTML H2 ---");
const faqIdx = t.indexOf('id="faq"');
console.log(t.slice(faqIdx, faqIdx+200));
console.log("\n--- forms status ---");
let idx = 0; let n=0;
while ((idx = t.indexOf("data-form-status", idx)) !== -1) {
  console.log(t.slice(idx-80, idx+120));
  idx += 1; n++; if(n>5) break;
}
console.log("\n--- popup regulation ---");
const r = t.indexOf('name="regulation"');
while (r !== -1) {
  // find all
  break;
}
let pos=0, k=0;
while ((pos = t.indexOf('name="regulation"', pos)) !== -1) {
  console.log(t.slice(pos-100, pos+80));
  pos += 1; k++; if(k>5) break;
}
