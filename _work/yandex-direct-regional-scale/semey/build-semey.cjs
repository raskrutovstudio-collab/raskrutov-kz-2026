/**
 * Build LOCAL-ONLY Semey Yandex Direct page from Astana template.
 * Angle: Abay region, city vs region geo, separate from Ust-Kamenogorsk, RU/KK if natural.
 * Do NOT use outdated East-Kazakhstan (ВКО) binding as current geo context.
 */
const fs = require("fs");
const path = require("path");

const SRC =
  "site_mirror/web-studiya/kontekstnaya-reklama/yandex-direct/astana/index.html";
const DEST =
  "site_mirror/web-studiya/kontekstnaya-reklama/yandex-direct/semey/index.html";

const TITLE =
  "Яндекс Директ в Семее — настройка и ведение | Raskrutov";
const DESC =
  "Яндекс Директ для Семея: город отдельно от области Абай и Усть-Каменогорска, RU/KK фразы, цели в Метрике. От 120 000 ₸ в месяц.";
const H1 = "Настройка и ведение Яндекс Директ в Семее";
const CANON =
  "https://raskrutov.kz/web-studiya/kontekstnaya-reklama/yandex-direct/semey/";

const faq = [
  [
    "Сколько стоит ведение Директа для бизнеса в Семее?",
    "Гонорар агентства начинается от 120 000 тенге в месяц и растёт с числом направлений, объёмом семантики и набором форматов. Медиабюджет клиент вносит на баланс своего кабинета отдельно.",
  ],
  [
    "Как не смешать Семей с областью Абай и Усть-Каменогорском?",
    "В регионах отмечаем городскую строку Семея. Пункты области Абай добавляем именами и только при реальной выдаче, курьере или выезде — со своим лимитом. Усть-Каменогорск остаётся отдельным городским контуром. После старта сверяем отчёт местоположений с картой продаж.",
  ],
  [
    "Есть ли у Raskrutov офис или филиал в Семее?",
    "Нет. Работаем по гостевому доступу к Директу и Метрике, созвонам и переписке. Единственный офис — в Петропавловске: ул. М. Жумабаева, 109, 6 этаж, офис 606а. Представительства в Семее нет.",
  ],
  [
    "Какой медиабюджет нужен на старте?",
    "Рамка зависит от конкуренции по торговым и сервисным фразам и от числа форматов. В первые недели часть расхода уходит на проверку гипотез. Конкретную сумму называем после разбора спроса и посадочной.",
  ],
  [
    "Что делаем на первой настройке?",
    "Разбираем нишу, сайт, городские и областные формулировки, минус-слова и схему кампаний. Затем тексты, гео по Семею, часы, устройства, Метрику и цели. Показы включаем после модерации и контрольных событий.",
  ],
  [
    "Нужна ли казахская ветка кампаний?",
    "Если есть живой KK-спрос и страница на kk — да. Калька с русского списка даёт слабое попадание: на казахском формулируют иначе. Ключи, объявления и минус-слова собираем отдельно.",
  ],
  [
    "Чем Поиск отличается от РСЯ в городе?",
    "Поиск отвечает на готовый вопрос по товару, услуге или доставке — путь до звонка короче. Сеть напоминает о бренде тем, кто уже был на сайте. Форматы ведём разными кампаниями, чтобы расход читался.",
  ],
  [
    "Как Метрика учитывает звонки?",
    "Тап по номеру со смартфона пишется целью так же, как отправка формы, поэтому источник звонка виден в отчётах. Без счётчика остаются только клики и списания. Цели описываем до включения показов.",
  ],
  [
    "Нужен ли новый аккаунт Директа?",
    "Чаще остаёмся в существующем: история помогает стратегиям стабилизироваться. Слабое отключаем, рабочее перекладываем под структуру Семея. Новый кабинет нужен редко — например, при потере доступа.",
  ],
  [
    "Когда стартуют показы?",
    "Срок зависит от готовности сайта, скорости доступов и объёма семантики. Порядок: согласование структуры, модерация, проверка целей. Календарную дату заранее не назначаем — модерация от нас не зависит.",
  ],
  [
    "Нужна ли отдельная посадочная под Семей?",
    "Отдельный URL нужен, когда условия по городу отличаются от общих или направлений несколько. Если общая страница уже называет Семей, цены и контакты, а текст совпадает с объявлением — её хватает. Анкету и кнопку звонка проверяем со смартфона до старта.",
  ],
  [
    "Что подготовить перед стартом?",
    "Направления и категории, карта самовывоза/доставки/выезда по Семею и согласованным точкам области Абай, гостевые доступы в Директ и Метрику, контакт принимающего заявки, потолок дневного расхода и один-два примера удачных обращений. С этим составляем план настройки.",
  ],
];

let html = fs.readFileSync(SRC, "utf8");

const mech = [
  [/rk-form-contacts-yd-astana/g, "rk-form-contacts-yd-semey"],
  [/rk-form-popup-yd-astana/g, "rk-form-popup-yd-semey"],
  [/contacts_yandex_direct_astana/g, "contacts_yandex_direct_semey"],
  [/popup_yandex_direct_astana/g, "popup_yandex_direct_semey"],
  [/Контакты — Яндекс Директ Астана/g, "Контакты — Яндекс Директ Семей"],
  [/Попап — Яндекс Директ Астана/g, "Попап — Яндекс Директ Семей"],
  [/yd-ast-/g, "yd-smy-"],
  [/ydAstChartFill/g, "ydSmyChartFill"],
  [/\/yandex-direct\/astana\//g, "/yandex-direct/semey/"],
  [/\/kontekstnaya-reklama\/astana\//g, "/kontekstnaya-reklama/semey/"],
  [/\/google-ads\/astana\//g, "/google-ads/semey/"],
];
for (const [re, to] of mech) html = html.replace(re, to);

html = html
  .replace(/<title>[^<]+<\/title>/, `<title>${TITLE}</title>`)
  .replace(
    /<meta name="description" content="[^"]*">/,
    `<meta name="description" content="${DESC}">`
  )
  .replace(
    /<meta property="og:title" content="[^"]*">/,
    `<meta property="og:title" content="${TITLE}">`
  )
  .replace(
    /<meta property="og:description" content="[^"]*">/,
    `<meta property="og:description" content="${DESC}">`
  )
  .replace(
    /<link rel="canonical" href="[^"]*">/,
    `<link rel="canonical" href="${CANON}">`
  )
  .replace(
    /<meta property="og:url" content="[^"]*">/,
    `<meta property="og:url" content="${CANON}">`
  );

const swaps = [
  [
    '<span aria-current="page">Астана</span>',
    '<span aria-current="page">Семей</span>',
  ],
  [
    'aria-label="Яндекс Директ в Астане"',
    'aria-label="Яндекс Директ в Семее"',
  ],
  [
    '<h1 class="ctx-hero__title">Настройка и ведение Яндекс Директ в Астане</h1>',
    `<h1 class="ctx-hero__title">${H1}</h1>`,
  ],
  [
    '<p class="ctx-hero__sub">Поиск, РСЯ и Метрика под локальный спрос столицы</p>',
    '<p class="ctx-hero__sub">Кампании для города и согласованных точек области Абай</p>',
  ],
  [
    '<p class="ctx-hero__lead">Кампании под географию Астаны: фразы, объявления, цели Метрики. Работаем удалённо из Петропавловска.</p>',
    '<p class="ctx-hero__lead">Показы держим в черте Семея; область Абай подключаем только по фактической карте выдачи и доставки. Усть-Каменогорск ведём отдельным контуром. Сборка и правки идут удалённо из Петропавловска.</p>',
  ],
  ["Обсудить Директ в Астане", "Разобрать Директ в Семее"],
  ["Гео Астана", "Показы в черте города"],
  ["Кабинет клиента", "Аккаунт остаётся у вас"],
  ["Цели Метрики", "Учёт обращений в Метрике"],
  [
    'aria-label="Демонстрационный интерфейс поискового объявления Яндекса для Астаны"',
    'aria-label="Условная схема поискового объявления Яндекса для Семея"',
  ],
  ["Поиск Яндекса · демо Астана", "Поиск Яндекса · схема Семей"],
  ["яндекс директ услуги астана", "доставка самовывоз семей"],
  ["example.kz › astana", "example.kz › semey"],
  ["example.kz › search-astana", "example.kz › city-smy"],
  ["example.kz › catalog-astana", "example.kz › abai-smy"],
  ["Услуги в Астане — демо объявление", "Услуги и выдача в Семее — условный макет"],
  [
    "Локальный оффер, форма и цели Метрики. Пример без клиентских данных и KPI.",
    "Городской оффер, зона самовывоза и цель в Метрике. Без клиентских цифр.",
  ],
  ["Поиск и РСЯ под гео столицы", "Отдельная группа под городские запросы"],
  [
    "Фразы, минус-фразы и расписание под обработку обращений из Астаны.",
    "Заявки на самовывоз и доставку не смешиваем с областными фразами.",
  ],
  [
    "Товарные форматы с доставкой по городу",
    "Каталог с самовывозом и доставкой по карте",
  ],
  [
    "Демо каталога при готовом фиде. Без клиентских показателей.",
    "Каталожный сценарий при готовой выгрузке. Показатели компаний в макет не переносятся.",
  ],
  ["Кабинет Директа · демо Астана", "Кабинет Директа · схема Семей"],
  ["Поиск · Астана", "Поисковая кампания"],
  [
    "<li><span>География</span><em class=\"yd-status yd-status--ok\">Астана</em></li>",
    '<li><span>Гео показа</span><em class="yd-status yd-status--ok">Семей</em></li>',
  ],
  [
    '<li><span>РСЯ · возврат</span><em class="yd-status yd-status--warn">В работе</em></li>',
    '<li><span>Область Абай</span><em class="yd-status yd-status--warn">По карте</em></li>',
  ],
  [
    "Демонстрационный интерфейс · гео Астана · без клиентских данных",
    "Условная схема · гео Семей · сведения рекламодателей не раскрываются",
  ],
  [
    "Что входит в настройку для Астаны",
    "Семей в настройках Директа: с чего начинаем",
  ],
  [
    "Локальная конфигурация кампаний",
    "Параметры до модерации",
  ],
  [
    "Кому подходит Директ в Астане",
    "Для каких задач собираем Директ в Семее",
  ],
  [
    "Форматы кампаний для Астаны",
    "Какие форматы включаем и в каком порядке",
  ],
  [
    "Состав работ и границы услуги",
    "Что входит в ежемесячный гонорар",
  ],
  [
    "Готовы обсудить Яндекс Директ для Астаны?",
    "Разберём Директ для бизнеса из Семея",
  ],
  [
    "Частые вопросы о Директе в Астане",
    "FAQ по Яндекс Директ в Семее",
  ],
];

for (const [from, to] of swaps) {
  if (!html.includes(from)) {
    console.warn("MISSING SWAP:", from.slice(0, 90));
  } else {
    html = html.split(from).join(to);
  }
}

// Short-answer
{
  const start = html.indexOf('id="short-answer"');
  const p1 = html.indexOf("<p>", start);
  const p1e = html.indexOf("</p>", p1);
  const p2 = html.indexOf("<p>", p1e);
  const p2e = html.indexOf("</p>", p2);
  const new1 =
    "<p>Семей закрывает торговый и сервисный спрос области Абай: точка выдачи, курьер по согласованным адресам, подряд внутри города, локальный B2C. В Директе строка «Семей» не равна области Абай — отметка всей области тянет клики туда, куда заказ не увезут. Усть-Каменогорск (Өскемен) — отдельный городской контур со своей страницей; в семейский бюджет его не подмешиваем. Старт работ: письменно фиксируем карту покрытия, затем собираем RU/KK формулировки, объявления, часы показа, устройства и цели Метрики. Базовая логика услуги — на <a href=\"/web-studiya/kontekstnaya-reklama/yandex-direct/\">республиканской странице Яндекс Директ</a>; ниже раскрыт только городской уровень Семея.</p>";
  const new2 =
    "<p>Сборку и ведение ведём из Петропавловска: гостевой вход в кабинет, созвоны, переписка, периодическая сводка. Офис — ул. М. Жумабаева, 109, 6 этаж, офис 606а; филиала в Семее нет. Результат зависит от силы спроса, ясности оффера, удобства сайта, потолка расхода и скорости ответа менеджера. Прогноз числа заявок до аудита ниши и посадочной не даём.</p>";
  html = html.slice(0, p1) + new1 + html.slice(p1e + 4, p2) + new2 + html.slice(p2e + 4);
}

// local-config
{
  const start = html.indexOf('id="local-config"');
  const leadOpen = html.indexOf('class="yd-section-lead"', start);
  if (leadOpen > 0) {
    const o = html.indexOf(">", leadOpen) + 1;
    const c = html.indexOf("</p>", o);
    html =
      html.slice(0, o) +
      "Перед модерацией письменно утверждаем четыре настройки: гео, языки, окно показа и определение обращения." +
      html.slice(c);
  }
  const arts = [
    [
      "География",
      "Семей и область Абай — разные контуры",
      "В регионах включаем городскую строку Семея. Пункты области Абай добавляем именами и только при реальной выдаче, курьере или выезде. Усть-Каменогорск остаётся вне этого контура. Каждый цикл сверяем отчёт местоположений с вашей картой продаж.",
    ],
    [
      "Языки",
      "Русский и казахский без копирования",
      "KK-спрос собираем отдельным списком фраз и объявлений. Калька с русского набора даёт слабое попадание. Язык объявления, минус-слов и посадочной совпадает с языком запроса.",
    ],
    [
      "Расписание и устройства",
      "Окно склада плюс телефон",
      "Показы ставим на часы, когда менеджер принимает заказ — с учётом самовывоза и курьера. Сначала проверяем мобильный путь: тап по номеру, мессенджер, короткая форма.",
    ],
    [
      "Цели и качество",
      "Какое действие считаем заявкой",
      "До старта фиксируем события: отправка анкеты, звонок, заказ на выдачу. Просим помечать пустые касания, чтобы оптимизация не цеплялась за шум.",
    ],
  ];
  let cursor = start;
  for (const [label, title, note] of arts) {
    const li = html.indexOf('class="yd-demo-label"', cursor);
    const lo = html.indexOf(">", li) + 1;
    const lc = html.indexOf("<", lo);
    html = html.slice(0, lo) + label + html.slice(lc);
    const ti = html.indexOf('class="yd-artifact__title"', lc);
    const to = html.indexOf(">", ti) + 1;
    const tc = html.indexOf("<", to);
    html = html.slice(0, to) + title + html.slice(tc);
    const ni = html.indexOf('class="yd-artifact__note"', tc);
    const no = html.indexOf(">", ni) + 1;
    const nc = html.indexOf("<", no);
    html = html.slice(0, no) + note + html.slice(nc);
    cursor = nc;
  }
}

// audience
{
  const start = html.indexOf('id="audience"');
  const lead = html.indexOf('class="yd-section-lead"', start);
  if (lead > 0) {
    const o = html.indexOf(">", lead) + 1;
    const c = html.indexOf("</p>", o);
    html =
      html.slice(0, o) +
      "Типовые сценарии рекламодателей. Конкретных кейсов и рейтингов по Семею на странице нет." +
      html.slice(c);
  }
  const cards = [
    [
      "Розница и самовывоз в городе",
      "Клиент смотрит остаток, цену и адрес выдачи в Семее. Группы режем по категориям, чтобы клик открывал карточку с условиями получения заказа.",
    ],
    [
      "Курьер по согласованным точкам Абай",
      "Область включаем точечно: только населённые пункты, куда логистика реально ездит. Список и лимит расхода выносим отдельно от городского контура.",
    ],
    [
      "Подряд и выездной сервис",
      "Бригада закрывает заказы в черте города или на коротком списке адресов. Вне карты — минус-слова и исключение в отчёте местоположений.",
    ],
    [
      "Слишком широкое гео в кабинете",
      "В регионах отмечена вся область Абай или соседние города без покрытия. Тогда непонятно, какой клик оплатил пустой интерес, а какой — рабочую заявку.",
    ],
    [
      "Общий бюджет с Усть-Каменогорском",
      "Города соседствуют в восприятии, но спрос, доставка и конкуренция разные. Один лимит без раздельных групп смешивает статистику и мешает управлению.",
    ],
    [
      "Поиск на казахском",
      "Если есть живой KK-спрос и страница на kk, собираем отдельную ветку: свои ключи, тексты и минус-слова без кальки с русского списка.",
    ],
  ];
  let cursor = start;
  for (const [h3, p] of cards) {
    const hi = html.indexOf("<h3>", cursor);
    const ho = hi + 4;
    const hc = html.indexOf("</h3>", ho);
    html = html.slice(0, ho) + h3 + html.slice(hc);
    const pi = html.indexOf("<p>", hc);
    const po = pi + 3;
    const pc = html.indexOf("</p>", po);
    html = html.slice(0, po) + p + html.slice(pc);
    cursor = pc;
  }
}

// campaign-types lead
{
  const start = html.indexOf('id="campaign-types"');
  const lead = html.indexOf('class="yd-section-lead"', start);
  if (lead > 0) {
    const o = html.indexOf(">", lead) + 1;
    const c = html.indexOf("</p>", o);
    html =
      html.slice(0, o) +
      "Стартуем с Поиска: там человек уже сформулировал задачу. Сеть, возврат и каталог подключаем после первых данных по городу." +
      html.slice(c);
  }
}

// setup lead
{
  const start = html.indexOf('id="setup"');
  const lead = html.indexOf('class="yd-section-lead"', start);
  if (lead > 0) {
    const o = html.indexOf(">", lead) + 1;
    const c = html.indexOf("</p>", o);
    html =
      html.slice(0, o) +
      "В гонорар входят первичная сборка под Семей и ежемесячное сопровождение. Клики и показы оплачивает владелец аккаунта со своего баланса. Доработку сайта, фид и CRM считаем отдельно, если без них нельзя посчитать обращение." +
      html.slice(c);
  }
}

// Remaining Astana tokens → city forms
html = html
  .replace(/в Астане/g, "в Семее")
  .replace(/из Астаны/g, "из Семея")
  .replace(/по Астане/g, "по Семею")
  .replace(/под Астану/g, "под Семей")
  .replace(/для Астаны/g, "для Семея")
  .replace(/Астаны/g, "Семея")
  .replace(/Астане/g, "Семее")
  .replace(/Астану/g, "Семей")
  .replace(/Астана/g, "Семей")
  .replace(/столицы/g, "города")
  .replace(/столице/g, "городе")
  .replace(/столицу/g, "город")
  .replace(/столица/g, "город");

// FAQ visible Q/A
{
  let cursor = html.indexOf('id="faq"');
  for (let n = 0; n < 12; n++) {
    const [q, a] = faq[n];
    const qId = `yd-smy-faq-q${n + 1}`;
    const aId = `yd-smy-faq-a${n + 1}`;
    const qBtn = html.indexOf(`id="${qId}"`, cursor);
    if (qBtn < 0) throw new Error("FAQ q missing " + qId);
    const qOpen = html.indexOf(">", qBtn) + 1;
    const qClose = html.indexOf("</button>", qOpen);
    html = html.slice(0, qOpen) + q + html.slice(qClose);
    const aDiv = html.indexOf(`id="${aId}"`, qClose);
    const aOpen = html.indexOf(">", aDiv) + 1;
    const aClose = html.indexOf("</div>", aOpen);
    html = html.slice(0, aOpen) + a + html.slice(aClose);
    cursor = aClose;
  }
}

// Contacts intros (after Astana→Semey token pass)
html = html.replace(
  /Обсудим настройку и ведение Яндекс Директа для Семея:[\s\S]{20,280}?Петропавловске\./,
  "Напишите, чем занимается компания, где проходит граница обслуживания по Семею и области Абай, и какой сайт используется. В ответ разберём структуру Директа, цели в Метрике, состав работ и стоимость. Ведение дистанционное, офис — в Петропавловске."
);
html = html.replace(
  /Коротко опишите нишу и сайт[\s\S]{0,100}?Семей\./,
  "Коротко о нише, зоне выдачи и сайте — вернёмся с планом настройки Директа по Семею."
);

// CTA band
{
  const start = html.indexOf("ctx-cta-band");
  if (start > 0) {
    const p = html.indexOf("<p>", start);
    const pe = html.indexOf("</p>", p);
    if (p > 0 && pe > p) {
      html =
        html.slice(0, p) +
        "<p>Начнём с ниши, карты выдачи и доставки по Семею, текущего аккаунта и счётчика. По итогам назовём состав работ и стоимость.</p>" +
        html.slice(pe + 4);
    }
  }
}

// campaign-types cards
{
  const start = html.indexOf('id="campaign-types"');
  const end = html.indexOf("</section>", start);
  const cards = [
    [
      "Поиск",
      "Объявление отвечает на готовый запрос — товар со склада, услуга или курьер в Семее. Обычно это основной источник звонков и анкет.",
    ],
    [
      "РСЯ",
      "Показы вне выдачи на площадках сети. Напоминаем о бренде тем, кто уже заходил на сайт; сетевой расход всегда отделяем от поискового.",
    ],
    [
      "Ретаргетинг",
      "Возвращаем людей, которые смотрели карточку или бросили форму. Нужны рабочие цели в Метрике и накопленный сегмент.",
    ],
    [
      "Товарные и динамические",
      "Строятся на фиде: название, цена, наличие. Имеет смысл при регулярном обновлении выгрузки и ясных условиях самовывоза или доставки.",
    ],
    [
      "Смарт-баннеры",
      "Автоблок из позиций, которые человек уже открывал. Подключаем, когда карточки и фид приведены в порядок.",
    ],
    [
      "Медийные форматы",
      "Баннеры и ролики по утверждённым макетам. Полезны при длинном решении, когда название компании должно встретиться заранее.",
    ],
  ];
  let cursor = start;
  for (const [h3, p] of cards) {
    const h3i = html.indexOf("<h3>", cursor);
    if (h3i < 0 || h3i > end) throw new Error("camp h3");
    html = html.slice(0, h3i + 4) + h3 + html.slice(html.indexOf("</h3>", h3i + 4));
    const hc = html.indexOf("</h3>", h3i + 4);
    const pi = html.indexOf("<p>", hc);
    const pc = html.indexOf("</p>", pi + 3);
    html = html.slice(0, pi + 3) + p + html.slice(pc);
    cursor = pc;
  }
}

// setup scope items
{
  const start = html.indexOf('id="setup"');
  const items = [
    [
      "Разбор запросов по городу",
      "Собираем, как в Семее ищут вашу услугу на русском и казахском, и сверяем формулировки с текстом сайта. Расхождения между запросом и страницей видны сразу.",
    ],
    [
      "Договорённости до сборки",
      "Письменно фиксируем: что считаем обращением, в каком порядке включаем форматы и какой радиус выдачи, курьера или выезда допустим.",
    ],
    [
      "Подбор фраз",
      "Берём коммерческие ключи, городские привязки и лексику самовывоза/доставки. RU и KK ведём двумя независимыми наборами.",
    ],
    [
      "Отсечение лишнего",
      "Минус-слова убирают справочный интерес, вакансии и упоминания Усть-Каменогорска, чужих районов области и пунктов вне карты продаж.",
    ],
    [
      "Раскладка аккаунта",
      "Поиск, сеть, возврат и товарные форматы — отдельные кампании. Доставка за черту города получает свою строку расхода.",
    ],
    [
      "Тексты объявлений",
      "У каждой группы свой заголовок и URL нужного раздела. Быстрые ссылки, уточнения и визитку заполняем полностью.",
    ],
    [
      "Границы, время и устройства",
      "Закрепляем Семей, точечно добавляем пункты области Абай, подгоняем часы под приём звонков и приоритет отдаём смартфонам.",
    ],
    [
      "Счётчик и события",
      "Метрику ставим до показов и описываем цели: форма отправлена, номер набран, чат открыт. Каждое событие проверяем на живой странице.",
    ],
    [
      "Проверка посадочной со смартфона",
      "Открываем URL с телефона, отправляем тестовую заявку и засекаем ответ. Смотрим, совпадает ли оффер с запросом из объявления.",
    ],
    [
      "Открытие показов",
      "Старт после трёх условий: модерация пройдена, тестовые цели сработали, суточный потолок подтверждён владельцем кабинета.",
    ],
    [
      "Ведение",
      "Каждый цикл: разбор поисковых запросов, отключение пустых связок, усиление групп с живыми разговорами.",
    ],
    [
      "Сводка",
      "В конце периода отдаём список работ, найденные проблемы и план на следующий цикл. Утверждения сверяем по кабинету Директа или Метрике.",
    ],
  ];
  let cursor = html.indexOf("yd-scope-list", start);
  for (const [h3, p] of items) {
    const h3i = html.indexOf("<h3>", cursor);
    const hc = html.indexOf("</h3>", h3i + 4);
    html = html.slice(0, h3i + 4) + h3 + html.slice(hc);
    const pi = html.indexOf("<p>", hc);
    const pc = html.indexOf("</p>", pi + 3);
    html = html.slice(0, pi + 3) + p + html.slice(pc);
    cursor = pc;
  }
  const pb = html.indexOf("yd-price-board", start);
  if (pb > 0) {
    const lead = html.indexOf('class="yd-price-board__lead"', pb);
    if (lead > 0) {
      const o = html.indexOf(">", lead) + 1;
      const c = html.indexOf("</p>", o);
      html =
        html.slice(0, o) +
        "Указан ежемесячный гонорар за сопровождение. Рекламный баланс пополняет сам владелец аккаунта. Итоговая сумма зависит от числа направлений, объёма семантики и набора форматов." +
        html.slice(c);
    }
  }
}

// control
{
  const start = html.indexOf('id="control"');
  const lead = html.indexOf('class="yd-section-lead"', start);
  if (lead > 0) {
    const o = html.indexOf(">", lead) + 1;
    const c = html.indexOf("</p>", o);
    html =
      html.slice(0, o) +
      "Кабинет Директа принадлежит рекламодателю. Мы заходим гостевым доступом и ведём кампании из Петропавловска. Владелец видит настройки, лимиты и расход; платёжную карту привязывает сам. Цели и суточный потолок согласуем до первого показа." +
      html.slice(c);
  }
  const h2i = html.indexOf("<h2", start);
  const h2o = html.indexOf(">", h2i) + 1;
  const h2c = html.indexOf("</h2>", h2o);
  html = html.slice(0, h2o) + "Права доступа, лимиты и отчёты" + html.slice(h2c);

  const titles = [
    [
      "Структура кампаний · Семей",
      "Макет показывает, как делим аккаунт. Живые клиентские проекты сюда не копируем.",
    ],
    [
      "События для отчёта",
      "Набор целей зависит от сценария сайта. Здесь — учебный пример без цифр.",
    ],
    [
      "Цепочка до заявки",
      "Схема пути клика без показателей рекламодателя. Потолок расхода задаёт владелец кабинета.",
    ],
  ];
  let cursor = start;
  for (const [title, note] of titles) {
    const ti = html.indexOf('class="yd-artifact__title"', cursor);
    if (ti < 0) break;
    const to = html.indexOf(">", ti) + 1;
    const tc = html.indexOf("<", to);
    html = html.slice(0, to) + title + html.slice(tc);
    const ni = html.indexOf('class="yd-artifact__note"', tc);
    if (ni > 0) {
      const no = html.indexOf(">", ni) + 1;
      const nc = html.indexOf("<", no);
      html = html.slice(0, no) + note + html.slice(nc);
      cursor = nc;
    } else cursor = tc;
  }
}

// decision
{
  const start = html.indexOf('id="decision"');
  if (start > 0) {
    const h2o = html.indexOf(">", html.indexOf("<h2", start)) + 1;
    const h2c = html.indexOf("</h2>", h2o);
    html =
      html.slice(0, h2o) + "Сценарии старта для Семея" + html.slice(h2c);
    const cards = [
      [
        "Новый контур под город",
        "Кабинета ещё нет или старый не подходит. Собираем структуру под Семей, цели и согласованный список пунктов области Абай.",
      ],
      [
        "Переразметка текущего кабинета",
        "Показы идут, но гео шире зоны продаж. Останавливаем лишнее, отделяем город от области Абай и от Усть-Каменогорска, пересобираем группы.",
      ],
      [
        "Доработка точки входа",
        "Если посадочная отвечает на другой запрос или тормозит на телефоне, сначала правим страницу или готовим URL под группы — иначе клики уходят впустую.",
      ],
    ];
    let cursor = start;
    for (const [h3, p] of cards) {
      const h3i = html.indexOf("<h3>", cursor);
      const hc = html.indexOf("</h3>", h3i + 4);
      html = html.slice(0, h3i + 4) + h3 + html.slice(hc);
      const pi = html.indexOf("<p>", hc);
      const pc = html.indexOf("</p>", pi + 3);
      html = html.slice(0, pi + 3) + p + html.slice(pc);
      cursor = pc;
    }
  }
}

// landing-analytics
{
  const start = html.indexOf('id="landing-analytics"');
  if (start > 0) {
    let cursor = start;
    const paras = [
      "Объявление обещает то, что человек увидит на первом экране: Семей, тип услуги, способ связаться. Если после клика открывается общий текст без города и без понятной кнопки, часть бюджета сгорает на отказе.",
      "Метрика показывает, дошло ли обращение. Без событий оптимизация сводится к кликам. Когда сайт готов, связываем источник с CRM и скоростью ответа менеджера. Многоканальный сбор заявок — на странице <a href=\"/web-studiya/lidogeneratsiya/\">лидогенерации</a>; органический спрос закрывает <a href=\"/web-studiya/seo-prodvizhenie/\">SEO-продвижение</a>.",
    ];
    for (const p of paras) {
      const pi = html.indexOf("<p>", cursor);
      if (pi < 0 || pi > html.indexOf("</section>", start)) break;
      const pc = html.indexOf("</p>", pi + 3);
      html = html.slice(0, pi + 3) + p + html.slice(pc);
      cursor = pc + 4;
    }
  }
}

// process
{
  const start = html.indexOf('id="process"');
  if (start > 0) {
    const h2o = html.indexOf(">", html.indexOf("<h2", start)) + 1;
    const h2c = html.indexOf("</h2>", h2o);
    html = html.slice(0, h2o) + "Удалённый запуск по шагам" + html.slice(h2c);
    const steps = [
      [
        "Бриф и карта обслуживания",
        "Фиксируем направления, черту Семея, при необходимости пункты области Абай, рамку расхода и примеры удачных обращений. Параллельно запрашиваем доступы в Директ и Метрику.",
      ],
      [
        "Фразы и раскладка групп",
        "Ключи собираем по направлениям и сразу готовим минус-слова. Поиск, сеть и возврат — разные кампании; KK-ветка идёт отдельно.",
      ],
      [
        "Сборка кампаний",
        "Пишем объявления, ставим регион, часы, устройства и цели. До модерации перепроверяем URL посадочных и дневной потолок.",
      ],
      [
        "Включение показов",
        "Старт после модерации и контрольного срабатывания целей. Срок зависит от готовности материалов, календарную дату заранее не назначаем.",
      ],
      [
        "Цикл оптимизации",
        "Дальше — разбор запросов, отключение пустых связок, усиление групп с разговорами и сводка с задачами следующего периода.",
      ],
    ];
    let cursor = start;
    for (const [h3, p] of steps) {
      const h3i = html.indexOf("<h3>", cursor);
      const hc = html.indexOf("</h3>", h3i + 4);
      html = html.slice(0, h3i + 4) + h3 + html.slice(hc);
      const pi = html.indexOf("<p>", hc);
      const pc = html.indexOf("</p>", pi + 3);
      html = html.slice(0, pi + 3) + p + html.slice(pc);
      cursor = pc;
    }
  }
}

html = html.replace(
  /Схема без клиентских данных/g,
  "Макет без цифр рекламодателя"
);
html = html.replace(
  /Путь от клика до ответа менеджера/g,
  "От клика до ответа менеджера"
);
html = html.replace(
  /Иллюстрация динамики · без чисел/g,
  "Условный график без KPI"
);
html = html.replace(
  /Лимиты расхода задаём в кабинете/g,
  "Потолок расхода задаёт владелец кабинета"
);

html = html.replace(
  /Поиск · услуги · Семей/g,
  "Поиск · выдача · Семей"
);
html = html.replace(
  /example\.kz › semey-service/g,
  "example.kz › smy-pickup"
);
html = html.replace(
  /Запись \/ выезд по Семею — пример/g,
  "Самовывоз / доставка в Семее — пример"
);

// Related links already swapped via /kontekstnaya-reklama/semey/ and /google-ads/semey/

const orgAddress = {
  "@type": "PostalAddress",
  addressCountry: "KZ",
  addressLocality: "Петропавловск",
  streetAddress: "ул. М. Жумабаева, 109, 6 этаж, офис 606а",
};

const ld = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": ["Organization", "ProfessionalService"],
      "@id": "https://raskrutov.kz/#organization",
      name: "Raskrutov",
      url: "https://raskrutov.kz/",
      logo: {
        "@type": "ImageObject",
        url: "https://raskrutov.kz/assets/m-files.cdn1.cc/web/images/raskrutov/logo.png",
      },
      email: "info@raskrutov.kz",
      telephone: "+7 700 021 69 00",
      address: orgAddress,
      sameAs: [
        "https://www.instagram.com/raskrutov.kz/",
        "https://www.youtube.com/@raskrutov-kz",
        "https://t.me/Raskrutov_web",
        "https://www.tiktok.com/@raskrutov.kz",
      ],
    },
    {
      "@type": "WebSite",
      "@id": "https://raskrutov.kz/#website",
      url: "https://raskrutov.kz/",
      name: "Raskrutov",
      publisher: { "@id": "https://raskrutov.kz/#organization" },
      inLanguage: "ru-KZ",
    },
    {
      "@type": "WebPage",
      "@id": CANON + "#webpage",
      url: CANON,
      name: TITLE,
      description: DESC,
      isPartOf: { "@id": "https://raskrutov.kz/#website" },
      about: { "@id": "https://raskrutov.kz/#organization" },
      mainEntity: { "@id": CANON + "#service" },
      breadcrumb: { "@id": CANON + "#breadcrumb" },
      inLanguage: "ru-KZ",
    },
    {
      "@type": "BreadcrumbList",
      "@id": CANON + "#breadcrumb",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Главная", item: "https://raskrutov.kz/" },
        { "@type": "ListItem", position: 2, name: "Студия", item: "https://raskrutov.kz/web-studiya/" },
        {
          "@type": "ListItem",
          position: 3,
          name: "Контекстная реклама",
          item: "https://raskrutov.kz/web-studiya/kontekstnaya-reklama/",
        },
        {
          "@type": "ListItem",
          position: 4,
          name: "Яндекс Директ",
          item: "https://raskrutov.kz/web-studiya/kontekstnaya-reklama/yandex-direct/",
        },
        { "@type": "ListItem", position: 5, name: "Семей", item: CANON },
      ],
    },
    {
      "@type": "Service",
      "@id": CANON + "#service",
      name: "Настройка и ведение Яндекс Директ в Семее",
      url: CANON,
      provider: { "@id": "https://raskrutov.kz/#organization" },
      areaServed: {
        "@type": "City",
        name: "Semey",
        containedInPlace: { "@type": "Country", name: "Kazakhstan" },
      },
      serviceType: "Yandex Direct",
      description: DESC,
    },
    {
      "@type": "FAQPage",
      "@id": CANON + "#faq",
      mainEntity: faq.map(([q, a]) => ({
        "@type": "Question",
        name: q,
        acceptedAnswer: { "@type": "Answer", text: a },
      })),
    },
  ],
};

if (!/<script type="application\/ld\+json">/.test(html)) {
  throw new Error("ld+json block missing");
}
html = html.replace(
  /<script type="application\/ld\+json">[\s\S]*?<\/script>/,
  `<script type="application/ld+json">${JSON.stringify(ld)}</script>`
);

// Sanity
const bad = html.match(/Астан|astana|столиц/gi) || [];
if (bad.length) console.warn("LEFTOVERS", [...new Set(bad)]);
if (/\bВКО\b|Восточно-Казахстанск|East Kazakhstan/i.test(html)) {
  throw new Error("outdated VKO / East Kazakhstan binding found");
}
if (!html.includes("Петропавловск")) throw new Error("Petropavlovsk missing");
if (!html.includes("Жумабаева")) throw new Error("office street missing");
if (!html.includes("101127167")) throw new Error("Metrika missing");
if (!html.includes("120 000")) throw new Error("price missing");
if (!html.includes("области Абай") && !html.includes("область Абай") && !html.includes("Область Абай")) {
  throw new Error("Abay region missing");
}
if (!html.includes("Усть-Каменогорск")) throw new Error("Ust-Kamenogorsk separation missing");
if (!html.includes('media="(min-width: 769px)"')) throw new Error("viewport CSS pattern missing");
if (!html.includes("ydSmyChartFill")) throw new Error("chart fill missing");
if (!html.includes("ydSmyChartFill2")) throw new Error("chart fill2 missing");
if (!html.includes('id="rk-form-contacts-yd-semey"')) throw new Error("contacts form");
if (!html.includes('name="contacts_yandex_direct_semey"')) throw new Error("contacts name");
if (!html.includes('id="rk-form-popup-yd-semey"')) throw new Error("popup form");
if (!html.includes('name="popup_yandex_direct_semey"')) throw new Error("popup name");
if (!html.includes("yd-smy-")) throw new Error("field prefix missing");
if ((html.match(/<h1[\s\S]*?<\/h1>/g) || []).length !== 1) throw new Error("H1 count");
JSON.parse(html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)[1]);

fs.mkdirSync(path.dirname(DEST), { recursive: true });
fs.writeFileSync(DEST, html, "utf8");
console.log("OK", DEST, Buffer.byteLength(html));
console.log("TITLE:", TITLE);
console.log("H1:", H1);
console.log("DESC:", DESC);
