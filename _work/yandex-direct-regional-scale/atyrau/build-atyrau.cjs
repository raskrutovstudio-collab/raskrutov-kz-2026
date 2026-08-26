/**
 * Build LOCAL-ONLY Atyrau Yandex Direct page from Astana template.
 * Angle: oil/energy + Ural river / Caspian logistics; city vs Atyrau oblast;
 * remote Petropavlovsk office. No invented client KPIs or reviews.
 */
const fs = require("fs");
const path = require("path");

const SRC =
  "site_mirror/web-studiya/kontekstnaya-reklama/yandex-direct/astana/index.html";
const DEST =
  "site_mirror/web-studiya/kontekstnaya-reklama/yandex-direct/atyrau/index.html";

const TITLE =
  "Яндекс Директ в Атырау — настройка и ведение | Raskrutov";
const DESC =
  "Яндекс Директ для Атырау: город отдельно от Атырауской области, нефтяной и сервисный спрос у Урала и каспийской логистики, цели в Метрике. От 120 000 ₸ в месяц.";
const H1 = "Настройка и ведение Яндекс Директ в Атырау";
const CANON =
  "https://raskrutov.kz/web-studiya/kontekstnaya-reklama/yandex-direct/atyrau/";

const faq = [
  [
    "Сколько стоит ведение Директа для бизнеса в Атырау?",
    "Сопровождение кабинета — от 120 000 тенге ежемесячно. Цена сдвигается, если растёт число ниш, длина семантики или набор форматов. Расход на клики клиент кладёт на свой баланс отдельно от гонорара.",
  ],
  [
    "Как развести Атырау и Атыраускую область в регионах?",
    "Включаем городскую позицию Атырау. Областные населённые пункты вносим по именам и только там, где реально отгружаем, выезжаем или доставляем, с отдельным лимитом. После запуска сверяем отчёт по местоположениям с вашей картой покрытия.",
  ],
  [
    "Есть ли у Raskrutov офис или филиал в Атырау?",
    "Локального представительства нет. Связь — через гостевой доступ к Директу и Метрике, звонки и переписку. Юридический адрес офиса: Петропавловск, ул. М. Жумабаева, 109, 6 этаж, офис 606а.",
  ],
  [
    "Какой медиабюджет нужен на старте?",
    "Ориентир зависит от конкуренции по подрядным, сервисным и розничным запросам и от числа форматов. Первые недели часть суммы уходит на проверку гипотез. Цифру называем после разбора спроса и посадочной.",
  ],
  [
    "Что делаем на первой настройке?",
    "Смотрим нишу и сайт, городские и областные формулировки, минус-слова и схему кампаний. Дальше — тексты, гео Атырау, часы, устройства, Метрика и цели. Показы открываем после модерации и контрольных событий.",
  ],
  [
    "Нужна ли казахская ветка кампаний?",
    "Да, когда есть живой KK-спрос и посадочная на kk. Перевод русского списка обычно промахивается: формулировки другие. Ключи, тексты и минус-слова собираем самостоятельным набором.",
  ],
  [
    "Чем Поиск отличается от РСЯ в городе?",
    "Поиск ловит уже сформулированный запрос на поставку, услугу или городской сервис — до звонка ближе. Сеть догоняет тех, кто уже был на сайте. Бюджеты форматов держим раздельными, чтобы читать расход.",
  ],
  [
    "Как Метрика учитывает звонки?",
    "Нажатие на номер со смартфона фиксируется целью наравне с отправкой анкеты, поэтому источник звонка виден в отчётах. Без счётчика остаются только клики и списания. События описываем до включения показов.",
  ],
  [
    "Нужен ли новый аккаунт Директа?",
    "Обычно остаёмся в текущем: история помогает стратегиям. Слабое режем, рабочее перекладываем под контур Атырау. Новый кабинет — редкий случай, например при потере доступа.",
  ],
  [
    "Когда стартуют показы?",
    "Срок зависит от готовности сайта, скорости доступов и объёма семантики. Сначала согласуем структуру, затем модерация и проверка целей. Календарную дату заранее не назначаем — модерация от нас не зависит.",
  ],
  [
    "Нужна ли отдельная посадочная под Атырау?",
    "Свой URL полезен, если условия по городу отличаются или направлений несколько. Когда общая страница уже называет Атырау, цены и контакты и совпадает с объявлением — её достаточно. Анкету и кнопку звонка проверяем со смартфона до старта.",
  ],
  [
    "Что подготовить перед стартом?",
    "Список направлений, карта отгрузки и выезда по Атырау и согласованным точкам области, гостевые доступы в Директ и Метрику, контакт принимающего заявки, дневной потолок расхода и пара примеров удачных обращений. По этому набору собираем план настройки.",
  ],
];

let html = fs.readFileSync(SRC, "utf8");

const mech = [
  [/rk-form-contacts-yd-astana/g, "rk-form-contacts-yd-atyrau"],
  [/rk-form-popup-yd-astana/g, "rk-form-popup-yd-atyrau"],
  [/contacts_yandex_direct_astana/g, "contacts_yandex_direct_atyrau"],
  [/popup_yandex_direct_astana/g, "popup_yandex_direct_atyrau"],
  [/Контакты — Яндекс Директ Астана/g, "Контакты — Яндекс Директ Атырау"],
  [/Попап — Яндекс Директ Астана/g, "Попап — Яндекс Директ Атырау"],
  [/yd-ast-/g, "yd-atr-"],
  [/ydAstChartFill2/g, "ydAtrChartFill2"],
  [/ydAstChartFill/g, "ydAtrChartFill"],
  [/\/yandex-direct\/astana\//g, "/yandex-direct/atyrau/"],
  [/\/kontekstnaya-reklama\/astana\//g, "/kontekstnaya-reklama/atyrau/"],
  [/\/google-ads\/astana\//g, "/google-ads/atyrau/"],
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
    '<span aria-current="page">Атырау</span>',
  ],
  [
    'aria-label="Яндекс Директ в Астане"',
    'aria-label="Яндекс Директ в Атырау"',
  ],
  [
    '<h1 class="ctx-hero__title">Настройка и ведение Яндекс Директ в Астане</h1>',
    `<h1 class="ctx-hero__title">${H1}</h1>`,
  ],
  [
    '<p class="ctx-hero__sub">Поиск, РСЯ и Метрика под локальный спрос столицы</p>',
    '<p class="ctx-hero__sub">Кампании для нефтяного сервиса, поставок и городского спроса у Урала</p>',
  ],
  [
    '<p class="ctx-hero__lead">Кампании под географию Астаны: фразы, объявления, цели Метрики. Работаем удалённо из Петропавловска.</p>',
    '<p class="ctx-hero__lead">География — город Атырау; область подключаем точечно по карте отгрузки у Урала и каспийской логистики. Кампании собираем удалённо из Петропавловска.</p>',
  ],
  ["Обсудить Директ в Астане", "Разобрать Директ в Атырау"],
  ["Гео Астана", "Показы в черте города"],
  ["Кабинет клиента", "Аккаунт остаётся у вас"],
  ["Цели Метрики", "Учёт обращений в Метрике"],
  [
    'aria-label="Демонстрационный интерфейс поискового объявления Яндекса для Астаны"',
    'aria-label="Условная схема поискового объявления Яндекса для Атырау"',
  ],
  ["Поиск Яндекса · демо Астана", "Поиск Яндекса · схема Атырау"],
  ["яндекс директ услуги астана", "поставка сервис атырау"],
  ["example.kz › astana", "example.kz › atyrau"],
  ["example.kz › search-astana", "example.kz › city-atr"],
  ["example.kz › catalog-astana", "example.kz › oil-atr"],
  ["Услуги в Астане — демо объявление", "Поставка и сервис в Атырау — условный макет"],
  [
    "Локальный оффер, форма и цели Метрики. Пример без клиентских данных и KPI.",
    "Городской оффер у Урала, зона отгрузки и цель в Метрике. Без клиентских цифр.",
  ],
  ["Поиск и РСЯ под гео столицы", "Отдельная группа под городские запросы"],
  [
    "Фразы, минус-фразы и расписание под обработку обращений из Астаны.",
    "Заявки на поставку и сервис не смешиваем с областными фразами.",
  ],
  [
    "Товарные форматы с доставкой по городу",
    "Каталог с отгрузкой и доставкой по карте",
  ],
  [
    "Демо каталога при готовом фиде. Без клиентских показателей.",
    "Каталожный сценарий при готовой выгрузке. Показатели компаний в макет не переносятся.",
  ],
  ["Кабинет Директа · демо Астана", "Кабинет Директа · схема Атырау"],
  ["Поиск · Астана", "Поисковая кампания"],
  [
    "<li><span>География</span><em class=\"yd-status yd-status--ok\">Астана</em></li>",
    '<li><span>Гео показа</span><em class="yd-status yd-status--ok">Атырау</em></li>',
  ],
  [
    '<li><span>РСЯ · возврат</span><em class="yd-status yd-status--warn">В работе</em></li>',
    '<li><span>Атырауская область</span><em class="yd-status yd-status--warn">По карте</em></li>',
  ],
  [
    "Демонстрационный интерфейс · гео Астана · без клиентских данных",
    "Условная схема · гео Атырау · сведения рекламодателей не раскрываются",
  ],
  [
    "Что входит в настройку для Астаны",
    "Атырау в настройках Директа: с чего начинаем",
  ],
  [
    "Локальная конфигурация кампаний",
    "Четыре настройки до модерации",
  ],
  [
    "Кому подходит Директ в Астане",
    "Каким компаниям в Атырау нужен Директ",
  ],
  [
    "Форматы кампаний для Астаны",
    "Порядок подключения форматов",
  ],
  [
    "Состав работ и границы услуги",
    "Границы ежемесячного гонорара",
  ],
  [
    "Готовы обсудить Яндекс Директ для Астаны?",
    "Обсудим Директ для проектов из Атырау",
  ],
  [
    "Частые вопросы о Директе в Астане",
    "Вопросы о Яндекс Директ в Атырау",
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
    "<p>Атырау стоит на реке Урал и входит в нефтяной и портово-логистический контур Каспия: подряд для площадок, снабжение, сервис оборудования, плюс бытовые услуги внутри города. В кабинете Директа город выбирается отдельной строкой — галочка на всей Атырауской области открывает показы там, куда машина или бригада может не доехать. Поэтому сначала письменно фиксируем карту покрытия, затем собираем формулировки по направлениям, тексты объявлений, часы, устройства и цели Метрики. Общая логика услуги — на <a href=\"/web-studiya/kontekstnaya-reklama/yandex-direct/\">республиканской странице Яндекс Директ</a>; ниже — только городской контур Атырау.</p>";
  const new2 =
    "<p>Работы ведём из Петропавловска без филиала в Атырау: гостевой доступ к кабинету, звонки, переписка и сводка по циклу. Офис — ул. М. Жумабаева, 109, 6 этаж, офис 606а. На результат влияют плотность спроса, ясность оффера, удобство сайта, потолок расхода и скорость ответа менеджера. До аудита ниши и посадочной число заявок не обещаем.</p>";
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
      "До модерации письменно закрываем гео, языки, окно показов и критерий качественной заявки." +
      html.slice(c);
  }
  const arts = [
    [
      "География",
      "Город и область не смешиваем",
      "В регионах ставим городскую позицию Атырау. Пункты Атырауской области вносим по именам только при реальной отгрузке или выезде. Каждый цикл сверяем отчёт местоположений с вашей картой покрытия.",
    ],
    [
      "Языки",
      "RU и KK — два независимых набора",
      "Казахский спрос собираем отдельным списком ключей и объявлений. Механический перевод русского набора обычно промахивается. Язык текста, минус-слов и посадочной совпадает с языком запроса.",
    ],
    [
      "Расписание и устройства",
      "Окно склада и диспетчера",
      "Показы привязываем к часам, когда менеджер реально берёт заказ — с учётом отгрузки и выезда. Сначала проверяем путь со смартфона: номер, мессенджер, короткая форма.",
    ],
    [
      "Цели и качество",
      "Какое событие считаем заявкой",
      "До запуска фиксируем: анкета отправлена, звонок, запрос на поставку. Просим помечать пустые касания, чтобы оптимизация не цеплялась за шум.",
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
      "Сценарии ниже — типовые постановки. Выполненных кейсов, отзывов и рейтингов по Атырау страница не публикует." +
      html.slice(c);
  }
  const cards = [
    [
      "Нефтесервис и подряд",
      "Закупщик ищет поставку, ремонт или подряд в городе и на согласованных площадках. Группы делим по типу заявки, чтобы клик вёл на страницу с условиями работы.",
    ],
    [
      "Логистика у Урала и Каспия",
      "Склад, отгрузка и перевозка соседствуют с промышленным спросом. Область включаем точечно — только пункты, куда техника или бригада реально доезжает.",
    ],
    [
      "Городской сервис и розница",
      "Житель ищет услугу или товар в Атырау. Эти группы держим отдельно от B2B: другая посадочная и другой критерий качественного контакта.",
    ],
    [
      "Широкое гео без покрытия",
      "В регионах отмечена вся Атырауская область, хотя выезд туда не ведётся. Тогда нельзя понять, какой клик дал пустой интерес, а какой — рабочую заявку.",
    ],
    [
      "Кадровый и вахтовый шум",
      "Запросы про работу и вахту часто пересекаются с коммерческим интересом. Выносим их в минус-слова, если кампания не набирает персонал.",
    ],
    [
      "Казахскоязычный спрос",
      "При живом KK-трафике и посадочной на kk поднимаем отдельную ветку: свои ключи, тексты и минус-лист без перевода русского набора.",
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
      "Первым включаем Поиск: запрос уже сформулирован. Сетевые, возвратные и каталожные размещения ставим в очередь после первых данных по городу." +
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
      "Гонорар закрывает первичную сборку под Атырау и ежемесячную работу по кампаниям. За показы и переходы платит владелец аккаунта со своего баланса. Правки сайта, товарную выгрузку и связку с CRM выносим отдельно, если без них нельзя зафиксировать обращение." +
      html.slice(c);
  }
}

// Remaining Astana tokens → city forms (Атырау не склоняется)
html = html
  .replace(/в Астане/g, "в Атырау")
  .replace(/из Астаны/g, "из Атырау")
  .replace(/по Астане/g, "по Атырау")
  .replace(/под Астану/g, "под Атырау")
  .replace(/для Астаны/g, "для Атырау")
  .replace(/Астаны/g, "Атырау")
  .replace(/Астане/g, "Атырау")
  .replace(/Астану/g, "Атырау")
  .replace(/Астана/g, "Атырау")
  .replace(/столицы/g, "города")
  .replace(/столице/g, "городе")
  .replace(/столицу/g, "город")
  .replace(/столица/g, "город");

// FAQ visible Q/A
{
  let cursor = html.indexOf('id="faq"');
  for (let n = 0; n < 12; n++) {
    const [q, a] = faq[n];
    const qId = `yd-atr-faq-q${n + 1}`;
    const aId = `yd-atr-faq-a${n + 1}`;
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

// Contacts intros
html = html.replace(
  /Обсудим настройку и ведение Яндекс Директа для Атырау:[\s\S]{20,280}?Петропавловске\./,
  "Опишите направление бизнеса, границу отгрузки и выезда по Атырау и Атырауской области, плюс URL сайта. Ответим планом структуры Директа, целями Метрики, объёмом работ и стоимостью. Ведем удалённо; офис компании — в Петропавловске."
);
html = html.replace(
  /Коротко опишите нишу и сайт[\s\S]{0,100}?Атырау\./,
  "Кратко: ниша, зона отгрузки, ссылка на сайт — пришлём схему настройки Директа под Атырау."
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
        "<p>Стартуем с ниши, карты отгрузки вдоль Урала, действующего кабинета и счётчика. После разбора назовём состав работ и цену.</p>" +
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
      "Реклама встаёт в выдачу по запросу на поставку, подряд, сервис или бытовую услугу в Атырау. Здесь обычно рождаются первые звонки и формы.",
    ],
    [
      "РСЯ",
      "Показы на сайтах сети вне поисковой строки. Напоминаем о компании тем, кто уже заходил; сетевой лимит ведём отдельно от поискового.",
    ],
    [
      "Ретаргетинг",
      "Догоняем людей, смотревших карточку или бросивших анкету. Нужны настроенные цели Метрики и накопленный сегмент аудитории.",
    ],
    [
      "Товарные и динамические",
      "Опираются на фид: название, цена, остаток. Имеет смысл при свежей выгрузке и понятных условиях отгрузки со склада в городе.",
    ],
    [
      "Смарт-баннеры",
      "Автоматический набор позиций, которые посетитель уже открывал. Включаем после порядка в карточках и фиде.",
    ],
    [
      "Медийные форматы",
      "Баннеры и видео по согласованным макетам. Уместны при длинном цикле закупки, когда бренд должен встретиться заранее.",
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
      "Спрос по Атырау",
      "Снимаем, какими словами ищут поставку, сервис и городские услуги на RU и KK, и сверяем это с текстом сайта. Места, где страница отвечает мимо запроса, отмечаем сразу.",
    ],
    [
      "Рамки до сборки",
      "Письменно фиксируем критерий заявки, порядок включения форматов и допустимый радиус отгрузки или выезда по городу и области.",
    ],
    [
      "Семантика",
      "Берём коммерческие ключи, городские маркеры и лексику нефтесервиса, логистики и розницы. Русский и казахский списки ведём независимо.",
    ],
    [
      "Минус-слова",
      "Отсекаем справочные запросы, вакансии, вахтовый интерес и названия пунктов области, куда компания не ездит.",
    ],
    [
      "Структура кабинета",
      "Поиск, сеть, возврат и товарные форматы — разные кампании. Расход на отгрузку за черту города выносим отдельной строкой.",
    ],
    [
      "Тексты и расширения",
      "У группы свой заголовок и URL раздела. Быстрые ссылки, уточнения и визитку заполняем до модерации.",
    ],
    [
      "Гео, часы, устройства",
      "Закрепляем Атырау, точечно добавляем пункты области, подстраиваем окно под приём звонков, приоритет — смартфоны.",
    ],
    [
      "Метрика до старта",
      "Счётчик ставим заранее и описываем цели: анкета, звонок, открытие чата. Каждое событие прогоняем на живой странице.",
    ],
    [
      "Мобильная проверка URL",
      "Открываем посадочную с телефона, шлём тестовую заявку и засекаем ответ. Смотрим, совпадает ли оффер с текстом объявления.",
    ],
    [
      "Запуск показов",
      "Включаем, когда модерация пройдена, тестовые цели сработали и суточный потолок подтверждён владельцем аккаунта.",
    ],
    [
      "Ежемесячное ведение",
      "В цикле разбираем поисковые запросы, режем пустые связки и усиливаем группы, где идут живые разговоры.",
    ],
    [
      "Отчёт по периоду",
      "В конце отдаём список сделанного, найденные сбои и план на следующий цикл. Цифры сверяем по кабинету Директа или Метрике.",
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
        "На табло — ежемесячный гонорар за сопровождение. Рекламный баланс пополняет владелец аккаунта. Итог зависит от числа направлений, объёма семантики и набора форматов." +
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
      "Аккаунт Директа оформлен на рекламодателя. Мы входим гостевым доступом и ведём кампании из Петропавловска. Владелец видит настройки, лимиты и расход; карту привязывает сам. Перечень целей и суточный потолок согласуем до первого показа." +
      html.slice(c);
  }
  const h2i = html.indexOf("<h2", start);
  const h2o = html.indexOf(">", h2i) + 1;
  const h2c = html.indexOf("</h2>", h2o);
  html = html.slice(0, h2o) + "Доступы, лимиты и прозрачность" + html.slice(h2c);

  const titles = [
    [
      "Раскладка кампаний · Атырау",
      "Учебный макет деления аккаунта. Реальные клиентские кабинеты сюда не переносим.",
    ],
    [
      "Цели в отчёте",
      "Состав событий зависит от сценария сайта. Ниже — демонстрационный пример без KPI.",
    ],
    [
      "Путь до заявки",
      "Условная схема клика без цифр рекламодателя. Потолок расхода задаёт владелец кабинета.",
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
      html.slice(0, h2o) + "Как стартуем в Атырау" + html.slice(h2c);
    const cards = [
      [
        "С нуля под город",
        "Кабинета нет или старый не годится. Собираем структуру под Атырау, цели и согласованный список пунктов области.",
      ],
      [
        "Пересборка текущего аккаунта",
        "Показы уже идут, но гео шире зоны продаж. Режем лишнее, отделяем город от Атырауской области, пересобираем группы.",
      ],
      [
        "Усиление посадочной",
        "Когда страница отвечает мимо запроса или тормозит на телефоне, сначала правим URL или готовим отдельные посадочные под группы — иначе клики сгорают впустую.",
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
      "Текст объявления должен совпадать с первым экраном: Атырау, тип услуги, понятный способ связи. Если после клика открывается общий шаблон без города и без кнопки, часть бюджета уходит в отказ.",
      "Метрика показывает, состоялось ли обращение. Без целей оптимизация крутится вокруг кликов. При готовом сайте связываем источник с CRM и скоростью ответа менеджера. Многоканальный сбор — на странице <a href=\"/web-studiya/lidogeneratsiya/\">лидогенерации</a>; органику закрывает <a href=\"/web-studiya/seo-prodvizhenie/\">SEO-продвижение</a>.",
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
    html = html.slice(0, h2o) + "Дистанционный запуск: пять шагов" + html.slice(h2c);
    const steps = [
      [
        "Бриф и карта покрытия",
        "Записываем направления бизнеса, границу Атырау, при необходимости список пунктов области, рамку расхода и пару примеров удачных обращений. Одновременно запрашиваем гостевые доступы в Директ и Метрику.",
      ],
      [
        "Ключи и группы",
        "Семантику раскладываем по направлениям и сразу готовим минус-лист. Поиск, сеть и возврат — разные кампании; казахская ветка идёт своим набором ключей.",
      ],
      [
        "Сборка в кабинете",
        "Готовим объявления, задаём регион, расписание, устройства и цели. Перед модерацией ещё раз сверяем URL посадочных и суточный потолок.",
      ],
      [
        "Старт показов",
        "Включаем после модерации и контрольного срабатывания целей. Срок зависит от готовности материалов; фиксированную дату запуска заранее не обещаем.",
      ],
      [
        "Оптимизация по циклу",
        "В каждом периоде разбираем запросы, отключаем пустые связки, усиливаем группы с живыми разговорами и отдаём сводку с задачами на следующий цикл.",
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
  "Учебный макет без KPI клиента"
);
html = html.replace(
  /Путь от клика до ответа менеджера/g,
  "От клика до ответа диспетчера"
);
html = html.replace(
  /Иллюстрация динамики · без чисел/g,
  "Условный график без клиентских цифр"
);
html = html.replace(
  /Лимиты расхода задаём в кабинете/g,
  "Суточный лимит задаёт владелец аккаунта"
);

html = html.replace(
  /Поиск · услуги · Атырау/g,
  "Поиск · поставка · Атырау"
);
html = html.replace(
  /example\.kz › atyrau-service/g,
  "example.kz › atr-supply"
);
html = html.replace(
  /Запись \/ выезд по Атырау — пример/g,
  "Отгрузка / сервис в Атырау — пример"
);

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
        { "@type": "ListItem", position: 5, name: "Атырау", item: CANON },
      ],
    },
    {
      "@type": "Service",
      "@id": CANON + "#service",
      name: "Настройка и ведение Яндекс Директ в Атырау",
      url: CANON,
      provider: { "@id": "https://raskrutov.kz/#organization" },
      areaServed: {
        "@type": "City",
        name: "Atyrau",
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
if (!html.includes("Петропавловск")) throw new Error("Petropavlovsk missing");
if (!html.includes("Жумабаева")) throw new Error("office street missing");
if (!html.includes("101127167")) throw new Error("Metrika missing");
if (!html.includes("120 000")) throw new Error("price missing");
if (!html.includes("Атырауск")) throw new Error("Atyrau oblast missing");
if (!html.includes("Урал") && !html.includes("Каспи")) {
  throw new Error("Ural/Caspian context missing");
}
if (!html.includes('media="(min-width: 769px)"')) throw new Error("viewport CSS pattern missing");
if (!html.includes("ydAtrChartFill")) throw new Error("chart fill missing");
if (!html.includes("ydAtrChartFill2")) throw new Error("chart fill2 missing");
if (!html.includes('id="rk-form-contacts-yd-atyrau"')) throw new Error("contacts form");
if (!html.includes('name="contacts_yandex_direct_atyrau"')) throw new Error("contacts name");
if (!html.includes('id="rk-form-popup-yd-atyrau"')) throw new Error("popup form");
if (!html.includes('name="popup_yandex_direct_atyrau"')) throw new Error("popup name");
if (!html.includes("yd-atr-")) throw new Error("field prefix missing");
if ((html.match(/<h1[\s\S]*?<\/h1>/g) || []).length !== 1) throw new Error("H1 count");
if (/не\s+[^,]{2,40},\s*а\s+/i.test(html.replace(/<[^>]+>/g, " "))) {
  throw new Error("forbidden не X, а Y pattern");
}
JSON.parse(html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)[1]);

fs.mkdirSync(path.dirname(DEST), { recursive: true });
fs.writeFileSync(DEST, html, "utf8");
console.log("OK", DEST, Buffer.byteLength(html));
console.log("TITLE:", TITLE);
console.log("H1:", H1);
console.log("DESC:", DESC);
