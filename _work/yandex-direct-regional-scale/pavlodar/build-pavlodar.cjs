/**
 * Build LOCAL-ONLY Pavlodar Yandex Direct page from Astana template.
 */
const fs = require("fs");
const path = require("path");

const SRC =
  "site_mirror/web-studiya/kontekstnaya-reklama/yandex-direct/astana/index.html";
const DEST =
  "site_mirror/web-studiya/kontekstnaya-reklama/yandex-direct/pavlodar/index.html";

const TITLE =
  "Яндекс Директ в Павлодаре — настройка и ведение | Raskrutov";
const DESC =
  "Собираем Яндекс Директ для бизнеса на Иртыше: Павлодар отдельно от области, Аксу и Экибастуза, фразы, объявления и цели в Метрике. От 120 000 ₸ в месяц.";
const H1 = "Настройка и ведение Яндекс Директ в Павлодаре";
const CANON =
  "https://raskrutov.kz/web-studiya/kontekstnaya-reklama/yandex-direct/pavlodar/";

const faq = [
  [
    "Сколько стоит настройка и сопровождение Директа для Павлодара?",
    "Нижняя граница гонорара — 120 000 тенге за месяц. Дальше сумма растёт вместе с числом направлений, объёмом семантики и набором форматов. Оплату кликов рекламодатель вносит на баланс своего аккаунта отдельно.",
  ],
  [
    "Как удержать показы в Павлодаре, а не по области, Аксу и Экибастузу?",
    "В дереве регионов Директа Павлодар стоит отдельной строкой. Область целиком, Аксу и Экибастуз отмечаем только если туда реально едут или отгружают — и с собственным лимитом. После запуска сверяем отчёт по местоположениям с картой обслуживания.",
  ],
  [
    "Нужен ли офис агентства в Павлодаре?",
    "Нет. Кампании собираем по гостевому доступу к кабинету и счётчику, вопросы решаем звонками и перепиской. Единственный офис Raskrutov — в Петропавловске. Филиала в Павлодаре нет.",
  ],
  [
    "Какой рекламный бюджет заложить на старте?",
    "Старт зависит от конкуренции по фразам и числа включённых форматов. Пока статистики мало, часть расхода уходит на проверку гипотез. Конкретную рамку называем после разбора спроса и посадочной.",
  ],
  [
    "Что входит в первую настройку?",
    "Сначала разбор ниши, сайта, городских формулировок, стоп-слов и схемы кампаний. Затем тексты, граница показа по Павлодару, часы, устройства, Метрика и цели. Показы включаем после модерации и контрольной проверки событий.",
  ],
  [
    "Нужна ли отдельная ветка на казахском?",
    "Дословный перевод русского набора не годится: на казахском спрос формулируют иначе. Казахскую семантику, объявления и минус-слова собираем отдельно. Запуск такой ветки возможен, если на сайте есть страница того же языка.",
  ],
  [
    "Чем Поиск отличается от сети для городской кампании?",
    "В Поиске объявление отвечает на уже заданный вопрос, путь до звонка короче. Сеть удерживает название у тех, кто сайт уже открывал. Форматы ведём разными кампаниями, иначе расход перестаёт читаться.",
  ],
  [
    "Что даст Метрика, если заявки приходят звонками?",
    "Нажатие на номер со смартфона фиксируется целью наравне с отправкой формы, поэтому источник звонка виден в отчётах. Без счётчика остаются клики и списания без природы обращения. Цели описываем до включения показов.",
  ],
  [
    "Обязательно ли заводить новый аккаунт Директа?",
    "Чаще остаёмся в существующем: история помогает стратегиям быстрее стабилизироваться. Слабое останавливаем, рабочее перекладываем под городскую структуру. Новый аккаунт нужен редко — например, при потере доступа.",
  ],
  [
    "Когда появятся первые показы?",
    "Срок зависит от готовности сайта, скорости выдачи доступов и объёма семантики. Порядок один: согласование структуры, модерация, проверка целей. Точную дату заранее не называем — скорость модерации от нас не зависит.",
  ],
  [
    "Нужна ли отдельная посадочная под Павлодар?",
    "Отдельный URL оправдан, если условия по городу отличаются от общих или направлений несколько. Если на общей странице уже указаны город, цены и контакты, а текст совпадает с объявлением, её достаточно. Анкету и кнопку звонка проверяем со смартфона до старта.",
  ],
  [
    "Что подготовить к старту работ?",
    "Нужны направления и категории, реальная карта выездов и отгрузок, гостевые доступы в Директ и Метрику, контакт того, кто принимает заявки, потолок дневного расхода и один-два примера удачных обращений. С этим набором составляем план настройки.",
  ],
];

let html = fs.readFileSync(SRC, "utf8");

// Mechanical identity
const mech = [
  [/rk-form-contacts-yd-astana/g, "rk-form-contacts-yd-pavlodar"],
  [/rk-form-popup-yd-astana/g, "rk-form-popup-yd-pavlodar"],
  [/contacts_yandex_direct_astana/g, "contacts_yandex_direct_pavlodar"],
  [/popup_yandex_direct_astana/g, "popup_yandex_direct_pavlodar"],
  [/Контакты — Яндекс Директ Астана/g, "Контакты — Яндекс Директ Павлодар"],
  [/Попап — Яндекс Директ Астана/g, "Попап — Яндекс Директ Павлодар"],
  [/yd-ast-/g, "yd-pvl-"],
  [/ydAstChartFill/g, "ydPvlChartFill"],
  [/\/yandex-direct\/astana\//g, "/yandex-direct/pavlodar/"],
  [/\/kontekstnaya-reklama\/astana\//g, "/kontekstnaya-reklama/pavlodar/"],
  [/\/google-ads\/astana\//g, "/google-ads/pavlodar/"],
];
for (const [re, to] of mech) html = html.replace(re, to);

// Meta
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

// Exact phrase swaps (Astana → unique Pavlodar)
const swaps = [
  [
    '<span aria-current="page">Астана</span>',
    '<span aria-current="page">Павлодар</span>',
  ],
  [
    'aria-label="Яндекс Директ в Астане"',
    'aria-label="Яндекс Директ в Павлодаре"',
  ],
  [
    '<h1 class="ctx-hero__title">Настройка и ведение Яндекс Директ в Астане</h1>',
    `<h1 class="ctx-hero__title">${H1}</h1>`,
  ],
  [
    '<p class="ctx-hero__sub">Поиск, РСЯ и Метрика под локальный спрос столицы</p>',
    '<p class="ctx-hero__sub">Кампании для промышленности, энергетики, сервиса и поставок вдоль Иртыша</p>',
  ],
  [
    '<p class="ctx-hero__lead">Кампании под географию Астаны: фразы, объявления, цели Метрики. Работаем удалённо из Петропавловска.</p>',
    '<p class="ctx-hero__lead">Показы держим в черте Павлодара; область, Аксу и Экибастуз подключаем только по фактической карте выездов и отгрузок. Сборка и правки идут удалённо из Петропавловска.</p>',
  ],
  [
    "Обсудить Директ в Астане",
    "Разобрать Директ в Павлодаре",
  ],
  ["Гео Астана", "Показы в черте Павлодара"],
  ["Кабинет клиента", "Аккаунт остаётся у вас"],
  ["Цели Метрики", "Учёт обращений в Метрике"],
  [
    'aria-label="Демонстрационный интерфейс поискового объявления Яндекса для Астаны"',
    'aria-label="Условная схема поискового объявления Яндекса для Павлодара"',
  ],
  ["Поиск Яндекса · демо Астана", "Поиск Яндекса · схема Павлодар"],
  ["яндекс директ услуги астана", "поставка запчастей павлодар"],
  ["example.kz › astana", "example.kz › pavlodar"],
  ["example.kz › search-astana", "example.kz › plant-pvl"],
  ["example.kz › catalog-astana", "example.kz › energy-pvl"],
  ["Услуги в Астане — демо объявление", "Поставка и сервис в Павлодаре — условный макет"],
  [
    "Локальный оффер, форма и цели Метрики. Пример без клиентских данных и KPI.",
    "Городской оффер для площадки на Иртыше, поле для номера и цель в Метрике. Без клиентских цифр.",
  ],
  ["Поиск и РСЯ под гео столицы", "Отдельная группа под запросы предприятий"],
  [
    "Фразы, минус-фразы и расписание под обработку обращений из Астаны.",
    "Заявки на спецификацию и выезд на площадку не смешиваем с розничными фразами.",
  ],
  [
    "Товарные форматы с доставкой по городу",
    "Сезонные позиции для энергетики и ремонта",
  ],
  [
    "Демо каталога при готовом фиде. Без клиентских показателей.",
    "Каталожный сценарий при готовой выгрузке. Показатели компаний в макет не переносятся.",
  ],
  ["Кабинет Директа · демо Астана", "Кабинет Директа · схема Павлодар"],
  ["Поиск · Астана", "Поисковая кампания"],
  [
    "<li><span>География</span><em class=\"yd-status yd-status--ok\">Астана</em></li>",
    '<li><span>Гео показа</span><em class="yd-status yd-status--ok">Павлодар</em></li>',
  ],
  ["РСЯ · возврат", "Аксу / Экибастуз"],
  [
    '<li><span>Аксу / Экибастуз</span><em class="yd-status yd-status--warn">В работе</em></li>',
    '<li><span>Аксу / Экибастуз</span><em class="yd-status yd-status--warn">По списку</em></li>',
  ],
  [
    "Демонстрационный интерфейс · гео Астана · без клиентских данных",
    "Условная схема · регион Павлодар · сведения рекламодателей не раскрываются",
  ],
  [
    "Что входит в настройку для Астаны",
    "Павлодар в настройках Директа: с чего начинаем",
  ],
  [
    "Локальная конфигурация кампаний",
    "Что согласуем до включения показов",
  ],
  [
    "Кому подходит Директ в Астане",
    "С какими задачами приходят в Директ",
  ],
  [
    "Форматы кампаний для Астаны",
    "Форматы Директа и очередь их запуска",
  ],
  [
    "Состав работ и границы услуги",
    "Что входит в счёт агентства",
  ],
  [
    "Готовы обсудить Яндекс Директ для Астаны?",
    "Разберём Директ для бизнеса из Павлодара",
  ],
  [
    "Частые вопросы о Директе в Астане",
    "Ответы на частые вопросы по Павлодару",
  ],
];

for (const [from, to] of swaps) {
  if (!html.includes(from)) {
    console.warn("MISSING SWAP:", from.slice(0, 90));
  } else {
    html = html.split(from).join(to);
  }
}

// Short-answer paragraphs (first two <p> inside #short-answer)
{
  const start = html.indexOf('id="short-answer"');
  const p1 = html.indexOf("<p>", start);
  const p1e = html.indexOf("</p>", p1);
  const p2 = html.indexOf("<p>", p1e);
  const p2e = html.indexOf("</p>", p2);
  const new1 =
    "<p>Павлодар стоит на Иртыше и живёт промышленным и энергетическим контуром: площадки, подряд, поставка комплектующих, сервис оборудования. В кабинете Директа город выбирается отдельной позицией — отдельно от Павлодарской области, Аксу и Экибастуза. Галочка на области раскрывает показы там, куда бригада или машина с грузом может не выехать ни разу. Поэтому первым вопросом фиксируем реальную границу обслуживания: город, точечные выезды или согласованный список населённых пунктов. Затем собираем формулировки по направлениям, тексты объявлений, окно показов, устройства и цели счётчика. Общий стек услуги описан на странице <a href=\"/web-studiya/kontekstnaya-reklama/yandex-direct/\">Яндекс Директ в Казахстане</a>; здесь — уровень одного города.</p>";
  const new2 =
    "<p>Работы ведём дистанционно: гостевой доступ к аккаунту, звонки, переписка и сводка по циклу. Офис компании — в Петропавловске; представительства в Павлодаре нет. На отдачу влияют спрос по теме, ясность предложения, удобство сайта, лимит расхода и скорость ответа продавца. Число обращений до разбора ниши и сайта не прогнозируем.</p>";
  html = html.slice(0, p1) + new1 + html.slice(p1e + 4, p2) + new2 + html.slice(p2e + 4);
}

// local-config lead + 4 artifacts
{
  const start = html.indexOf('id="local-config"');
  const leadOpen = html.indexOf('class="yd-section-lead"', start);
  if (leadOpen > 0) {
    const o = html.indexOf(">", leadOpen) + 1;
    const c = html.indexOf("</p>", o);
    html =
      html.slice(0, o) +
      "Ниже — четыре параметра, которые фиксируем письменно до подачи объявлений на модерацию." +
      html.slice(c);
  }
  const arts = [
    [
      "География",
      "Павлодар отдельно от области",
      "Отмечаем городскую позицию. Павлодарскую область, Аксу и Экибастуз добавляем поимённо и только при подтверждённых выездах или отгрузках. Раз в цикл сверяем отчёт по местоположениям с картой обслуживания клиента.",
    ],
    [
      "Языки",
      "Два независимых списка фраз",
      "Казахская часть спроса собирается своими формулировками, перевод с русского здесь не подходит. Язык объявления, стоп-списка и страницы должен совпадать с языком запроса.",
    ],
    [
      "Расписание и устройства",
      "Смена на площадке и смартфон",
      "Показы держим в часы, когда заявку есть кому принять — в том числе с учётом сменного графика производств. Мобильный сценарий проверяем первым: набор номера, чат, ввод с маленького экрана.",
    ],
    [
      "Цели и качество",
      "Что считаем обращением",
      "Заранее утверждаем список действий: анкета, звонок, запрос спецификации. Просим отмечать, какие контакты дошли до предметного разговора — иначе кампании подстраиваются под пустые касания.",
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

// audience lead + cards
{
  const start = html.indexOf('id="audience"');
  const lead = html.indexOf('class="yd-section-lead"', start);
  if (lead > 0) {
    const o = html.indexOf(">", lead) + 1;
    const c = html.indexOf("</p>", o);
    html =
      html.slice(0, o) +
      "Перечисленное ниже — возможные задачи рекламодателей. Выполненных проектов по городу страница не заявляет." +
      html.slice(c);
  }
  const cards = [
    [
      "Сервис и выезд на площадку",
      "Ремонт, монтаж и обслуживание оборудования у заказчика. Радиус выезда прописываем и в кампании, и в объявлении, чтобы показ не уходил на дальние адреса вне карты.",
    ],
    [
      "Поставки предприятиям",
      "Между кликом и договором стоят спецификация, согласование и созвон. От рекламы нужен контакт снабженца — дальше ведёт отдел продаж.",
    ],
    [
      "Склады, базы и отгрузка по городу",
      "Покупатель уточняет остаток, цену и способ забрать товар. Запросы раскладываем по категориям, чтобы переход открывал нужную карточку.",
    ],
    [
      "Регион в кабинете шире зоны работы",
      "Кампании идут, а в географии отмечены область, Аксу или Экибастуз без фактического покрытия. В отчётах не видно, откуда пришли обращения и куда ушёл лимит.",
    ],
    [
      "Стройка, монтаж, материалы",
      "Подряд с длинным согласованием: разговор часто начинается с просьбы посчитать смету. Цель на расчёт здесь важнее общего счётчика визитов.",
    ],
    [
      "Энергетика и промышленный сервис",
      "Запросы на комплектующие, ремонт узлов и выезд специалиста идут волнами под график остановок и плановых работ. Кампании включаем и приостанавливаем по календарю площадки.",
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
      "Начинаем с поисковых кампаний: там спрос уже сформулирован. Сетевые, возвратные и каталожные размещения ставим в очередь после первых данных." +
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
      "Гонорар закрывает первичную сборку кампаний под Павлодар и ежемесячную работу по ним. За показы и переходы платит владелец аккаунта со своего баланса. Правки сайта, порядок в товарной выгрузке и связку с CRM считаем отдельно, если без них нельзя зафиксировать обращение." +
      html.slice(c);
  }
}

// Remaining Astana tokens → Pavlodar forms (after unique blocks)
html = html
  .replace(/в Астане/g, "в Павлодаре")
  .replace(/из Астаны/g, "из Павлодара")
  .replace(/по Астане/g, "по Павлодару")
  .replace(/под Астану/g, "под Павлодар")
  .replace(/для Астаны/g, "для Павлодара")
  .replace(/Астаны/g, "Павлодара")
  .replace(/Астане/g, "Павлодаре")
  .replace(/Астану/g, "Павлодар")
  .replace(/Астана/g, "Павлодар")
  .replace(/столицы/g, "города")
  .replace(/столице/g, "городе")
  .replace(/столицу/g, "город")
  .replace(/столица/g, "город");

// FAQ visible Q/A
{
  let cursor = html.indexOf('id="faq"');
  for (let n = 0; n < 12; n++) {
    const [q, a] = faq[n];
    const qId = `yd-pvl-faq-q${n + 1}`;
    const aId = `yd-pvl-faq-a${n + 1}`;
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

// Contacts intros — soft replace if present
html = html.replace(
  /Напишите[\s\S]{20,280}?Петропавловске\./,
  "Напишите, чем занимается компания, где проходит граница обслуживания по Павлодару, Аксу и Экибастузу, и какой сайт используется. В ответ разберём структуру Директа, цели в Метрике, состав работ и стоимость. Ведение дистанционное, офис — в Петропавловске."
);
html = html.replace(
  /Коротко о нише и сайте[\s\S]{0,80}?Павлодару\./,
  "Коротко о нише, зоне выезда и сайте — вернёмся с планом настройки Директа по Павлодару."
);

// CTA band paragraph if still capital-ish
{
  const start = html.indexOf("ctx-cta-band");
  if (start > 0) {
    const p = html.indexOf("<p>", start);
    const pe = html.indexOf("</p>", p);
    if (p > 0 && pe > p) {
      html =
        html.slice(0, p) +
        "<p>Начнём с ниши, карты выездов по Павлодару и соседним пунктам, текущего аккаунта и счётчика. По итогам назовём состав работ и стоимость.</p>" +
        html.slice(pe + 4);
    }
  }
}

// JSON-LD rebuild
const orgAddress = {
  "@type": "PostalAddress",
  addressCountry: "KZ",
  addressLocality: "Петропавловск",
  streetAddress: "ул. М. Жумабаева, 109, 6 этаж, офис 606а",
};

// Preserve org fields from original if possible
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
        { "@type": "ListItem", position: 5, name: "Павлодар", item: CANON },
      ],
    },
    {
      "@type": "Service",
      "@id": CANON + "#service",
      name: "Настройка и ведение Яндекс Директ в Павлодаре",
      url: CANON,
      provider: { "@id": "https://raskrutov.kz/#organization" },
      areaServed: {
        "@type": "City",
        name: "Pavlodar",
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
if (!html.includes('id="rk-form-contacts-yd-pavlodar"')) throw new Error("contacts form");
if (!html.includes('name="contacts_yandex_direct_pavlodar"')) throw new Error("contacts name");
if (!html.includes('id="rk-form-popup-yd-pavlodar"')) throw new Error("popup form");
if (!html.includes('name="popup_yandex_direct_pavlodar"')) throw new Error("popup name");
if ((html.match(/<h1[\s\S]*?<\/h1>/g) || []).length !== 1) throw new Error("H1 count");
JSON.parse(html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)[1]);

fs.mkdirSync(path.dirname(DEST), { recursive: true });
fs.writeFileSync(DEST, html, "utf8");
console.log("OK", DEST, Buffer.byteLength(html));
console.log("TITLE:", TITLE);
console.log("H1:", H1);
console.log("DESC:", DESC);
