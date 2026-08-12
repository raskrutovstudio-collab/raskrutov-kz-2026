const fs = require("fs");
const path = require("path");
const file = "d:/РАБОТА/111 ПОРТАЛ ,,, ПРОЕКТ РАСКРУТОВ 05,2026 111/raskrutov-kz-2026/site_mirror/web-studiya/kontekstnaya-reklama/google-ads/index.html";
let html = fs.readFileSync(file, "utf8");
const nl = html.includes("\r\n") ? "\r\n" : "\n";

// --- A. Rebuild ld+json while keeping org/website/webpage fields ---
const ldMatch = html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/);
if (!ldMatch) throw new Error("ld+json not found");
const old = JSON.parse(ldMatch[1]);
const byType = (type) => old["@graph"].find(x => (Array.isArray(x["@type"]) ? x["@type"].includes(type) : x["@type"] === type));
const org = byType("Organization");
const website = byType("WebSite");
const webpage = byType("WebPage");
const breadcrumb = byType("BreadcrumbList");
const service = byType("Service");

const faqItems = [
  ["Сколько стоит настройка и ведение Google Ads?", "Работа агентства начинается от 120 000 ₸ в месяц. Итоговая стоимость зависит от числа кампаний, сложности ниши и глубины аналитики. Рекламный бюджет оплачивается отдельно в Google."],
  ["Какой рекламный бюджет нужен?", "Медиабюджет зависит от конкуренции в нише, географии показов и цели кампании. На старте обычно выделяют сумму, достаточную для сбора статистики по ключевым запросам и тестам. Точный уровень бюджета согласуем после аудита спроса и посадочной страницы."],
  ["Что входит в настройку Google Ads?", "В настройку входят аудит ниши и сайта, сбор семантики, структура кампаний, объявления, расширения, геотаргетинг, параметры ставок и базовая аналитика. Подключаем отслеживание конверсий и проверяем корректность передачи заявок перед запуском."],
  ["Что входит в ведение Google Ads?", "Ведение включает контроль расходов, чистку нецелевых запросов, тесты объявлений, корректировки ставок и аудиторий, работу с автоматизацией и регулярную отчётность. Фокус — на качестве трафика и стоимости целевых действий."],
  ["Сколько времени занимает запуск?", "Срок запуска зависит от готовности сайта, доступа к аккаунту и объёма семантики. Часто первичную конфигурацию собираем за несколько рабочих дней после согласования структуры. Затем аккаунт проходит модерацию и начинает набирать статистику."],
  ["Когда можно оценивать эффективность кампании?", "Первые сигналы видны уже в первые дни показов, но устойчивые выводы требуют накопленной статистики. Обычно смотрим на динамику после достаточного числа кликов и конверсий по основным группам. Сроки оценки зависят от бюджета и частоты заявок."],
  ["Можно ли работать с существующим аккаунтом?", "Да. Работаем в аккаунте клиента после аудита: сохраняем полезную историю и пересобираем слабые кампании. Аккаунт остаётся у клиента; мы подключаемся с нужным уровнем доступа и отключаем его при завершении сотрудничества."],
  ["Как отслеживаются заявки?", "Настраиваем цели и конверсии: отправка форм, клики по телефону, переходы в мессенджеры и другие согласованные действия. При технической готовности связываем данные с CRM, чтобы видеть путь от клика до квалифицированного обращения."],
  ["Можно ли ограничить показы одним городом?", "Да. Геотаргетинг настраивается на город, область или набор населённых пунктов. Для услуг с выездом добавляем согласованные зоны обслуживания, чтобы не расходовать бюджет на нерелевантные показы."],
  ["Какие кампании подходят услугам и интернет-магазинам?", "Для услуг чаще используют поиск по коммерческим запросам, ремаркетинг и при необходимости Performance Max или Demand Gen. Для магазинов — Shopping, Performance Max, поиск по товарным и категорийным запросам, ремаркетинг. Выбор зависит от спроса, цикла сделки, фида и качества посадочных."],
  ["Что необходимо предоставить для начала работы?", "Нужны доступы к рекламному кабинету и связанным сервисам аналитики, описание услуг или товаров, география работы и контакты ответственного. Полезны примеры целевых заявок и ограничения по бюджету. На основе этого собираем план запуска."]
];

const graph = [
  org,
  website,
  {
    ...webpage,
    "@type": "WebPage",
    "@id": "https://raskrutov.kz/web-studiya/kontekstnaya-reklama/google-ads/#webpage",
    mainEntity: { "@id": "https://raskrutov.kz/web-studiya/kontekstnaya-reklama/google-ads/#service" },
    breadcrumb: { "@id": "https://raskrutov.kz/web-studiya/kontekstnaya-reklama/google-ads/#breadcrumb" }
  },
  {
    ...breadcrumb,
    "@type": "BreadcrumbList",
    "@id": "https://raskrutov.kz/web-studiya/kontekstnaya-reklama/google-ads/#breadcrumb"
  },
  {
    ...service,
    "@type": "Service",
    "@id": "https://raskrutov.kz/web-studiya/kontekstnaya-reklama/google-ads/#service",
    name: "Настройка и ведение Google Ads",
    provider: { "@id": "https://raskrutov.kz/#organization" }
  },
  {
    "@type": "FAQPage",
    "@id": "https://raskrutov.kz/web-studiya/kontekstnaya-reklama/google-ads/#faq",
    mainEntity: faqItems.map(([name, text]) => ({
      "@type": "Question",
      name,
      acceptedAnswer: { "@type": "Answer", text }
    }))
  }
];

const ldJson = JSON.stringify({ "@context": "https://schema.org", "@graph": graph });

// Ensure head assets block (from preload image through style) is correct
const headAssets = [
  '  <link rel="preload" as="image" href="../../../assets/img/kontekstnaya-reklama/hero-ctx.webp" type="image/webp" fetchpriority="high" imagesrcset="../../../assets/img/kontekstnaya-reklama/hero-ctx.webp 600w, ../../../assets/img/kontekstnaya-reklama/hero-ctx-640.webp 640w" imagesizes="(max-width: 767px) 92vw, 48vw">',
  '  <link rel="preload" href="../../../assets/m-files.cdn1.cc/web/user/fonts/montserrat/montserrat_bold.woff2" as="font" type="font/woff2" crossorigin>',
  '  <link rel="stylesheet" href="../../../assets/css/home-clean.css?v=39">',
  '  <link rel="stylesheet" href="../../../assets/css/kontekst-clean.css?v=7">',
  '  <link rel="stylesheet" href="../../../assets/css/lead-forms.css" media="print" onload="this.media=\'all\'">',
  '  <noscript><link rel="stylesheet" href="../../../assets/css/lead-forms.css"></noscript>',
  '  <style>.rk-form--contacts .rk-consent--contacts{margin:0 0 15px;font-size:12px;line-height:1.4}.rk-form--contacts .rk-consent--contacts input{width:18px;height:18px}</style>'
].join(nl);

html = html.replace(
  /  <link rel="preload" as="image"[\s\S]*?<\/style>\s*<script type="application\/ld\+json">[\s\S]*?<\/script>/,
  headAssets + nl + '  <script type="application/ld+json">' + ldJson + '</script>'
);

// --- B. Hero ---
html = html.replace(
  "Собираем спрос, семантику и объявления, подключаем аналитику и конверсии, системно оптимизируем рекламу в Google Ads. Работаем с аккаунтом клиента по понятному плану: от запуска до регулярного ведения.",
  "Собираем семантику и объявления, подключаем конверсии и оптимизируем кампании по плану: от запуска до регулярного ведения."
);

// Fix hero srcset - replace any existing srcset on hero img
html = html.replace(
  /(src="\.\.\/\.\.\/\.\.\/assets\/img\/kontekstnaya-reklama\/hero-ctx\.webp"[^>]*?srcset=")([^"]*)(")/,
  '$1../../../assets/img/kontekstnaya-reklama/hero-ctx.webp 600w, ../../../assets/img/kontekstnaya-reklama/hero-ctx-640.webp 640w$3'
);
// also if srcset comes before src
html = html.replace(
  /(srcset=")([^"]*hero-ctx[^"]*)(")/,
  '$1../../../assets/img/kontekstnaya-reklama/hero-ctx.webp 600w, ../../../assets/img/kontekstnaya-reklama/hero-ctx-640.webp 640w$3'
);

// --- C. Surgical text replacements ---
const reps = [
  ["Мы настраиваем кампании под задачу, подключаем измерение конверсий и оптимизируем рекламу по обращениям и стоимости целевых действий.", "Собираем кампании под задачу, подключаем измерение конверсий и оптимизируем по обращениям и стоимости целевого действия."],
  ["Как мы используем автоматизацию Google Ads", "Как мы используем автоматизацию"],
  ["Настройка и ведение Google Ads</h2>", "Настройка и ведение</h2>"],
  ["Связываем данные Google Ads с GA4", "Связываем данные кабинета с GA4"],
  ["От поискового запроса в Google Ads до", "От поискового запроса до"],
  ["Без корректных конверсий Google Ads оптимизируется", "Без корректных конверсий кабинет оптимизируется"],
  ["Google Ads для лидогенерации", "Реклама для лидогенерации"],
  ["Google Ads для e-commerce", "Реклама для e-commerce"],
  ["Для интернет-магазинов используем товарные кампании, Performance Max, поиск", "Для интернет-магазинов используем товарные кампании, автоматизированные форматы, поиск"],
  ["Работа агентства по настройке и ведению Google Ads начинается", "Работа агентства по настройке и ведению начинается"],
  ["Кому подходит Google Ads", "Кому подходит этот формат"],
  ["Запустим Google Ads под ваш спрос в Казахстане", "Запустим рекламу под ваш спрос"],
  ["Обсудим настройку и ведение Google Ads для бизнеса в Казахстане:", "Обсудим настройку и ведение рекламы для бизнеса:"],
  ["Коротко опишите нишу и сайт — подготовим план по Google Ads.", "Коротко опишите нишу и сайт — подготовим план запуска."],
  ["Коротко о работе с Google Ads", "Коротко о работе с рекламой"],
  ["Какие задачи решает Google Ads", "Какие задачи решает реклама"],
  ["Типы кампаний Google Ads", "Типы кампаний"],
  ["Частые вопросы о Google Ads", "Частые вопросы"]
];
for (const [a,b] of reps) {
  if (!html.includes(a)) console.log("WARN missing:", a.slice(0,80));
  else html = html.split(a).join(b);
}

// Automation first paragraph - find section#automation first <p>
html = html.replace(
  /(<section[^>]*id="automation"[^>]*>[\s\S]*?<h2[^>]*>[\s\S]*?<\/h2>\s*)<p>[\s\S]*?<\/p>/,
  `$1<p>Автоматические стратегии ставок, Performance Max, AI Max и рекомендации платформы применяем после настройки конверсий и понятных целей. Сначала задаём рамки: география, минус-слова, бюджет, посадочные и критерии качества лида. Затем подключаем автоматизацию там, где она ускоряет тесты, и оставляем ручной контроль там, где важна точность семантики.</p>`
);

// --- D. Replace FAQ details block ---
const faqHtml = faqItems.map(([q, a]) => {
  return [
    "          <details>",
    `            <summary><h3 class="rk-faq__q">${q}</h3></summary>`,
    `            <div class="rk-faq__a">${a}</div>`,
    "          </details>"
  ].join(nl);
}).join(nl);

html = html.replace(
  /(<div class="rk-faq">\s*)[\s\S]*?(\s*<\/div>\s*<\/div>\s*<\/section>\s*\n\s*<section class="rk-section" id="contacts">)/,
  `$1${nl}${faqHtml}${nl}        </div>$2`.replace('</div>\s*</div>\s*</section>', '') // placeholder - fix below
);

// Better FAQ replace: from rk-faq open to its close before contacts
const faqSec = html.match(/<section class="rk-section ctx-faq" id="faq">[\s\S]*?<\/section>/);
if (!faqSec) throw new Error("faq section missing after edits");
const newFaqSec = [
  '<section class="rk-section ctx-faq" id="faq">',
  '      <div class="rk-container">',
  '        <h2 class="rk-h2">Частые вопросы</h2>',
  '        <div class="rk-faq">',
  faqHtml,
  '        </div>',
  '      </div>',
  '    </section>'
].join(nl);
html = html.replace(faqSec[0], newFaqSec);

// --- E. Contacts consent before honeypot ---
const consent = [
  '                <label class="rk-consent rk-consent--contacts" for="gads-contact-regulation">',
  '                  <input id="gads-contact-regulation" type="checkbox" name="regulation" value="accepted" required>',
  '                  <span>Я принимаю <a href="/regulation/" target="_blank" rel="noopener">Положение</a> и даю <a href="/consent/" target="_blank" rel="noopener">Согласие</a> на обработку персональных данных.</span>',
  '                </label>'
].join(nl);

if (!html.includes("gads-contact-regulation")) {
  html = html.replace(
    /(<form id="rk-form-contacts-gads"[\s\S]*?)(\s*<input type="text" name="website" autocomplete="off" tabindex="-1" aria-hidden="true" class="lead-form-honeypot"[^>]*>)/,
    `$1${nl}${consent}$2`
  );
}

// aria-atomic on both form status divs
html = html.replace(
  /<div data-form-status aria-live="polite" class="lead-form-status"><\/div>/g,
  '<div data-form-status aria-live="polite" aria-atomic="true" class="lead-form-status"></div>'
);

// Popup regulation value=accepted
html = html.replace(
  /(<input type="checkbox" name="regulation")( required>)/,
  '$1 value="accepted"$2'
);
// if already has required but no value
html = html.replace(
  /(<input type="checkbox" name="regulation" )(?!value=)/g,
  '$1value="accepted" '
);
// cleanup duplicate value if any
html = html.replace(
  /name="regulation" value="accepted" value="accepted"/g,
  'name="regulation" value="accepted"'
);

// --- F. Metrika timeout ---
html = html.replace("timeout: 1800", "timeout: 4000");

fs.writeFileSync(file, html, "utf8");

// --- G. Verify ---
const out = fs.readFileSync(file, "utf8");
const size = Buffer.byteLength(out, "utf8");
let ldOk = false;
try {
  JSON.parse(out.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)[1]);
  ldOk = true;
} catch (e) {
  console.log("ld parse error", e.message);
}
const faqSec2 = out.match(/<section class="rk-section ctx-faq" id="faq">[\s\S]*?<\/section>/)[0];
console.log("Google Ads", (out.match(/Google Ads/g) || []).length);
console.log("Kazakhstan", (out.match(/Казахстан/g) || []).length);
console.log("Performance Max", (out.match(/Performance Max/g) || []).length);
console.log("FAQ details", (faqSec2.match(/<details/g) || []).length);
console.log("consent contacts", out.includes("gads-contact-regulation"));
console.log("lead-forms media=print", /lead-forms\.css" media="print"/.test(out));
console.log("ld+json parses", ldOk);
console.log("file size", size);
console.log("timeout 4000", out.includes("timeout: 4000"));
console.log("aria-atomic count", (out.match(/aria-atomic="true"/g) || []).length);
console.log("regulation accepted", (out.match(/name="regulation" value="accepted"/g) || []).length);
console.log("hero lead ok", out.includes("Собираем семантику и объявления, подключаем конверсии"));
console.log("old hero gone", !out.includes("Собираем спрос, семантику и объявления"));
