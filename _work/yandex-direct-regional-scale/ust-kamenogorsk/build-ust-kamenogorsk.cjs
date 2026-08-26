/**
 * Build LOCAL-ONLY Ust-Kamenogorsk Yandex Direct page from Astana template.
 * Content angle: metallurgy / Өскемен, RU+KK demand, city vs East Kazakhstan region, Semey separate.
 */
const fs = require("fs");
const path = require("path");

const SRC =
  "site_mirror/web-studiya/kontekstnaya-reklama/yandex-direct/astana/index.html";
const DEST =
  "site_mirror/web-studiya/kontekstnaya-reklama/yandex-direct/ust-kamenogorsk/index.html";

const TITLE =
  "Яндекс Директ в Усть-Каменогорске — настройка и ведение | Raskrutov";
const DESC =
  "Яндекс Директ для металлургического Усть-Каменогорска (Өскемен): город отдельно от Восточного Казахстана и Семея, RU/KK фразы, цели в Метрике. От 120 000 ₸ в месяц.";
const H1 = "Настройка и ведение Яндекс Директ в Усть-Каменогорске";
const CANON =
  "https://raskrutov.kz/web-studiya/kontekstnaya-reklama/yandex-direct/ust-kamenogorsk/";

const faq = [
  [
    "Сколько стоит настройка и сопровождение Директа для Усть-Каменогорска?",
    "Нижняя граница гонорара агентства — 120 000 тенге в месяц. Сумма растёт с числом направлений, объёмом фраз и набором форматов. Оплату кликов рекламодатель вносит на баланс своего аккаунта отдельно от гонорара.",
  ],
  [
    "Как ограничить показы Усть-Каменогорском без захвата области и Семея?",
    "В дереве регионов Директа Усть-Каменогорск выбирается отдельной строкой. Восточно-Казахстанскую область целиком и Семей подключаем только при подтверждённых выездах или отгрузках — и с собственным лимитом. Семей ведётся как отдельный городской контур, если там есть самостоятельная задача. После запуска сверяем отчёт по местоположениям с картой обслуживания.",
  ],
  [
    "Нужен ли офис агентства в Усть-Каменогорске?",
    "Нет. Кампании собираем по гостевому доступу к кабинету и счётчику, вопросы закрываем звонками и перепиской. Единственный офис Raskrutov — в Петропавловске по адресу ул. М. Жумабаева, 109, 6 этаж, офис 606а. Филиала и представительства в Усть-Каменогорске нет.",
  ],
  [
    "Какой рекламный бюджет заложить на старте?",
    "Стартовый расход зависит от конкуренции по промышленным и сервисным фразам и от числа включённых форматов. Пока статистики мало, часть бюджета уходит на проверку гипотез. Конкретную рамку называем после разбора спроса и посадочной.",
  ],
  [
    "Что входит в первую настройку?",
    "Сначала разбор ниши, сайта, городских и отраслевых формулировок, стоп-слов и схемы кампаний. Затем тексты, граница показа по Усть-Каменогорску, часы, устройства, Метрика и цели. Показы включаем после модерации и контрольной проверки событий.",
  ],
  [
    "Нужна ли отдельная ветка на казахском (Өскемен)?",
    "Да, если есть живой спрос на kk. Дословный перевод русского набора не подходит: на казахском запросы формулируют иначе, в том числе с названием Өскемен. Казахскую семантику, объявления и минус-слова собираем отдельно. Условие запуска — на сайте есть страница того же языка.",
  ],
  [
    "Чем Поиск отличается от сети для городской кампании?",
    "В Поиске объявление отвечает на уже заданный вопрос по поставке, сервису или услуге — путь до звонка короче. Сеть удерживает название у тех, кто сайт уже открывал. Форматы ведём разными кампаниями, иначе расход перестаёт читаться.",
  ],
  [
    "Что даст Метрика, если заявки приходят звонками?",
    "Нажатие на номер со смартфона фиксируется целью наравне с отправкой формы, поэтому источник звонка виден в отчётах. Без счётчика остаются клики и списания без природы обращения. Цели описываем до включения показов.",
  ],
  [
    "Обязательно ли заводить новый аккаунт Директа?",
    "Чаще остаёмся в существующем: история помогает стратегиям стабилизироваться быстрее. Слабое останавливаем, рабочее перекладываем под городскую структуру Усть-Каменогорска. Новый аккаунт нужен редко — например, при потере доступа.",
  ],
  [
    "Когда появятся первые показы?",
    "Срок зависит от готовности сайта, скорости выдачи доступов и объёма семантики. Порядок один: согласование структуры, модерация, проверка целей. Точную дату заранее не называем — скорость модерации от нас не зависит.",
  ],
  [
    "Нужна ли отдельная посадочная под Усть-Каменогорск?",
    "Отдельный URL оправдан, если условия по городу отличаются от общих или направлений несколько. Если на общей странице уже указаны город, цены и контакты, а текст совпадает с объявлением, её достаточно. Анкету и кнопку звонка проверяем со смартфона до старта.",
  ],
  [
    "Что подготовить к старту работ?",
    "Нужны направления и категории, реальная карта выездов и отгрузок по Усть-Каменогорску (и отдельно — если есть задача по Семею или области), гостевые доступы в Директ и Метрику, контакт того, кто принимает заявки, потолок дневного расхода и один-два примера удачных обращений. С этим набором составляем план настройки.",
  ],
];

let html = fs.readFileSync(SRC, "utf8");

// Mechanical identity
const mech = [
  [/rk-form-contacts-yd-astana/g, "rk-form-contacts-yd-ust-kamenogorsk"],
  [/rk-form-popup-yd-astana/g, "rk-form-popup-yd-ust-kamenogorsk"],
  [/contacts_yandex_direct_astana/g, "contacts_yandex_direct_ust_kamenogorsk"],
  [/popup_yandex_direct_astana/g, "popup_yandex_direct_ust_kamenogorsk"],
  [/Контакты — Яндекс Директ Астана/g, "Контакты — Яндекс Директ Усть-Каменогорск"],
  [/Попап — Яндекс Директ Астана/g, "Попап — Яндекс Директ Усть-Каменогорск"],
  [/yd-ast-/g, "yd-osk-"],
  [/ydAstChartFill/g, "ydOskChartFill"],
  [/\/yandex-direct\/astana\//g, "/yandex-direct/ust-kamenogorsk/"],
  [/\/kontekstnaya-reklama\/astana\//g, "/kontekstnaya-reklama/ust-kamenogorsk/"],
  [/\/google-ads\/astana\//g, "/google-ads/ust-kamenogorsk/"],
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

const swaps = [
  [
    '<span aria-current="page">Астана</span>',
    '<span aria-current="page">Усть-Каменогорск</span>',
  ],
  [
    'aria-label="Яндекс Директ в Астане"',
    'aria-label="Яндекс Директ в Усть-Каменогорске"',
  ],
  [
    '<h1 class="ctx-hero__title">Настройка и ведение Яндекс Директ в Астане</h1>',
    `<h1 class="ctx-hero__title">${H1}</h1>`,
  ],
  [
    '<p class="ctx-hero__sub">Поиск, РСЯ и Метрика под локальный спрос столицы</p>',
    '<p class="ctx-hero__sub">Кампании для металлургии, поставок и сервиса в Өскемене</p>',
  ],
  [
    '<p class="ctx-hero__lead">Кампании под географию Астаны: фразы, объявления, цели Метрики. Работаем удалённо из Петропавловска.</p>',
    '<p class="ctx-hero__lead">Показы держим в черте Усть-Каменогорска; Восточный Казахстан и Семей подключаем только по фактической карте выездов. Сборка и правки идут удалённо из Петропавловска.</p>',
  ],
  ["Обсудить Директ в Астане", "Разобрать Директ в Усть-Каменогорске"],
  ["Гео Астана", "Показы в черте города"],
  ["Кабинет клиента", "Аккаунт остаётся у вас"],
  ["Цели Метрики", "Учёт обращений в Метрике"],
  [
    'aria-label="Демонстрационный интерфейс поискового объявления Яндекса для Астаны"',
    'aria-label="Условная схема поискового объявления Яндекса для Усть-Каменогорска"',
  ],
  ["Поиск Яндекса · демо Астана", "Поиск Яндекса · схема Өскемен"],
  ["яндекс директ услуги астана", "металлургическая поставка усть-каменогорск"],
  ["example.kz › astana", "example.kz › ust-kamenogorsk"],
  ["example.kz › search-astana", "example.kz › metal-osk"],
  ["example.kz › catalog-astana", "example.kz › plant-osk"],
  ["Услуги в Астане — демо объявление", "Поставка и сервис в Усть-Каменогорске — условный макет"],
  [
    "Локальный оффер, форма и цели Метрики. Пример без клиентских данных и KPI.",
    "Городской оффер для промышленной площадки, поле для номера и цель в Метрике. Без клиентских цифр.",
  ],
  ["Поиск и РСЯ под гео столицы", "Отдельная группа под запросы предприятий"],
  [
    "Фразы, минус-фразы и расписание под обработку обращений из Астаны.",
    "Заявки на спецификацию и выезд на площадку не смешиваем с розничными фразами.",
  ],
  [
    "Товарные форматы с доставкой по городу",
    "Каталог комплектующих и расходников для площадок",
  ],
  [
    "Демо каталога при готовом фиде. Без клиентских показателей.",
    "Каталожный сценарий при готовой выгрузке. Показатели компаний в макет не переносятся.",
  ],
  ["Кабинет Директа · демо Астана", "Кабинет Директа · схема Усть-Каменогорск"],
  ["Поиск · Астана", "Поисковая кампания"],
  [
    "<li><span>География</span><em class=\"yd-status yd-status--ok\">Астана</em></li>",
    '<li><span>Гео показа</span><em class="yd-status yd-status--ok">Усть-Каменогорск</em></li>',
  ],
  ["РСЯ · возврат", "ВКО / Семей"],
  [
    '<li><span>Аксу / Экибастуз</span><em class="yd-status yd-status--warn">В работе</em></li>',
    '<li><span>ВКО / Семей</span><em class="yd-status yd-status--warn">По списку</em></li>',
  ],
  [
    "Демонстрационный интерфейс · гео Астана · без клиентских данных",
    "Условная схема · гео Усть-Каменогорск · сведения рекламодателей не раскрываются",
  ],
  [
    "Что входит в настройку для Астаны",
    "Усть-Каменогорск в настройках Директа: с чего начинаем",
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
    "Разберём Директ для бизнеса из Усть-Каменогорска",
  ],
  [
    "Частые вопросы о Директе в Астане",
    "Ответы на частые вопросы по Усть-Каменогорску",
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
    "<p>Усть-Каменогорск (Өскемен) — промышленный центр Восточного Казахстана с металлургией, поставками комплектующих, подрядными работами и городским сервисом. В кабинете Директа город выбирается отдельной позицией — отдельно от Восточно-Казахстанской области и от Семея. Галочка на области раскрывает показы там, куда бригада или машина с грузом может не выехать ни разу. Семей при необходимости собираем как самостоятельный городской контур. Поэтому первым вопросом фиксируем реальную границу обслуживания: город, точечные выезды или согласованный список населённых пунктов. Затем собираем формулировки по направлениям на русском и казахском, тексты объявлений, окно показов, устройства и цели счётчика. Общий стек услуги описан на странице <a href=\"/web-studiya/kontekstnaya-reklama/yandex-direct/\">Яндекс Директ в Казахстане</a>; здесь — уровень одного города.</p>";
  const new2 =
    "<p>Работы ведём дистанционно: гостевой доступ к аккаунту, звонки, переписка и сводка по циклу. Офис компании — в Петропавловске (ул. М. Жумабаева, 109, 6 этаж, офис 606а); представительства в Усть-Каменогорске нет. На отдачу влияют спрос по теме, ясность предложения, удобство сайта, лимит расхода и скорость ответа продавца. Число обращений до разбора ниши и сайта не прогнозируем.</p>";
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
      "Четыре параметра, которые фиксируем письменно до подачи объявлений на модерацию." +
      html.slice(c);
  }
  const arts = [
    [
      "География",
      "Город отдельно от области и Семея",
      "Отмечаем городскую позицию Усть-Каменогорска. Восточно-Казахстанскую область и Семей добавляем поимённо и только при подтверждённых выездах или отгрузках. Раз в цикл сверяем отчёт по местоположениям с картой обслуживания клиента.",
    ],
    [
      "Языки",
      "RU и KK — два независимых контура",
      "Казахская часть спроса собирается своими формулировками, в том числе с названием Өскемен. Перевод с русского здесь не подходит. Язык объявления, стоп-списка и страницы должен совпадать с языком запроса.",
    ],
    [
      "Расписание и устройства",
      "Сменный график и смартфон",
      "Показы держим в часы, когда заявку есть кому принять — с учётом смен на площадках. Мобильный сценарий проверяем первым: набор номера, чат, ввод с маленького экрана.",
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

// audience
{
  const start = html.indexOf('id="audience"');
  const lead = html.indexOf('class="yd-section-lead"', start);
  if (lead > 0) {
    const o = html.indexOf(">", lead) + 1;
    const c = html.indexOf("</p>", o);
    html =
      html.slice(0, o) +
      "Ниже — возможные задачи рекламодателей. Выполненных проектов по городу страница не заявляет." +
      html.slice(c);
  }
  const cards = [
    [
      "Металлургия и поставки на площадку",
      "Комплектующие, расходники и сервис для промышленных объектов. Между кликом и договором стоят спецификация и согласование — от рекламы нужен контакт снабженца.",
    ],
    [
      "Подряд, монтаж и ремонт оборудования",
      "Выезд на площадку с длинным циклом согласования. Радиус выезда прописываем и в кампании, и в объявлении, чтобы показ не уходил на адреса вне карты.",
    ],
    [
      "Склады и отгрузка по городу",
      "Покупатель уточняет остаток, цену и способ забрать товар. Запросы раскладываем по категориям, чтобы переход открывал нужную карточку.",
    ],
    [
      "Гео в кабинете шире зоны работы",
      "Кампании идут, а в географии отмечены Восточный Казахстан или Семей без фактического покрытия. В отчётах не видно, откуда пришли обращения и куда ушёл лимит.",
    ],
    [
      "Городские услуги и B2C-сервис",
      "Рядом с промышленным спросом живут бытовые и сервисные запросы. Их ведём отдельными группами, чтобы розничный трафик не смешивался со снабженческими фразами.",
    ],
    [
      "Двуязычный поиск RU / KK",
      "Часть аудитории ищет на казахском, в том числе по Өскемен. Казахскую ветку собираем самостоятельно: свои фразы, тексты и минус-слова при наличии страницы на kk.",
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
      "Стартуем с поисковых кампаний: там спрос уже сформулирован. Сетевые, возвратные и каталожные размещения ставим в очередь после первых данных." +
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
      "Гонорар закрывает первичную сборку кампаний под Усть-Каменогорск и ежемесячную работу по ним. За показы и переходы платит владелец аккаунта со своего баланса. Правки сайта, порядок в товарной выгрузке и связку с CRM считаем отдельно, если без них нельзя зафиксировать обращение." +
      html.slice(c);
  }
}

// Remaining Astana tokens → city forms (order matters)
html = html
  .replace(/в Астане/g, "в Усть-Каменогорске")
  .replace(/из Астаны/g, "из Усть-Каменогорска")
  .replace(/по Астане/g, "по Усть-Каменогорску")
  .replace(/под Астану/g, "под Усть-Каменогорск")
  .replace(/для Астаны/g, "для Усть-Каменогорска")
  .replace(/Астаны/g, "Усть-Каменогорска")
  .replace(/Астане/g, "Усть-Каменогорске")
  .replace(/Астану/g, "Усть-Каменогорск")
  .replace(/Астана/g, "Усть-Каменогорск")
  .replace(/столицы/g, "города")
  .replace(/столице/g, "городе")
  .replace(/столицу/g, "город")
  .replace(/столица/g, "город");

// FAQ visible Q/A
{
  let cursor = html.indexOf('id="faq"');
  for (let n = 0; n < 12; n++) {
    const [q, a] = faq[n];
    const qId = `yd-osk-faq-q${n + 1}`;
    const aId = `yd-osk-faq-a${n + 1}`;
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
  /Напишите[\s\S]{20,320}?Петропавловске\./,
  "Напишите, чем занимается компания, где проходит граница обслуживания по Усть-Каменогорску, Восточному Казахстану и Семею, и какой сайт используется. В ответ разберём структуру Директа, цели в Метрике, состав работ и стоимость. Ведение дистанционное, офис — в Петропавловске."
);
html = html.replace(
  /Коротко о нише и сайте[\s\S]{0,100}?Усть-Каменогорску\./,
  "Коротко о нише, зоне выезда и сайте — вернёмся с планом настройки Директа по Усть-Каменогорску."
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
        "<p>Начнём с ниши, карты выездов по Усть-Каменогорску, текущего аккаунта и счётчика. По итогам назовём состав работ и стоимость.</p>" +
        html.slice(pe + 4);
    }
  }
}

// --- Extra uniqueness (campaign / setup / control / decision / process) ---

// campaign-types cards
{
  const start = html.indexOf('id="campaign-types"');
  const end = html.indexOf("</section>", start);
  const cards = [
    [
      "Поиск",
      "Объявление встречается с уже сформулированным запросом — поставка, подряд или сервис в Усть-Каменогорске. Отсюда обычно приходит основная доля звонков и заявок.",
    ],
    [
      "РСЯ",
      "Показы на партнёрских площадках вне выдачи. Держим название на виду у тех, кто сайт уже открывал; расход по сети всегда выносим в отдельную кампанию.",
    ],
    [
      "Ретаргетинг",
      "Возвращаем посетителей, которые смотрели страницу или бросили анкету. Нужны рабочие события в Метрике и накопленный сегмент.",
    ],
    [
      "Товарные и динамические",
      "Строятся на выгрузке каталога: название, цена, остаток. Имеет смысл только при регулярно обновляемом файле и понятных условиях отгрузки по городу.",
    ],
    [
      "Смарт-баннеры",
      "Блок собирается автоматически из позиций, которые человек уже смотрел. Подключаем после того, как карточки и фид приведены в рабочий вид.",
    ],
    [
      "Медийные форматы",
      "Графика и ролики по утверждённым макетам. Нужны там, где решение принимают долго и название компании должно примелькаться заранее.",
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
      "Собираем формулировки, которыми в Өскемене описывают вашу задачу на русском и казахском, и сверяем их с текстом сайта. Места, где страница отвечает на другой вопрос, видны сразу.",
    ],
    [
      "Договорённости до сборки",
      "Письменно закрепляем три вещи: что засчитывается за обращение, очередь подключения форматов и предельный радиус выездов или отгрузок по городу.",
    ],
    [
      "Подбор фраз",
      "Берём коммерческие запросы, городские привязки и отраслевую лексику металлургии и сервиса. Русские и казахские формулировки ведём двумя раздельными наборами.",
    ],
    [
      "Отсечение лишнего",
      "Стоп-слова снимают справочные запросы, поиск работы и упоминания Восточного Казахстана, Семея и прочих пунктов вне согласованной карты.",
    ],
    [
      "Раскладка аккаунта",
      "Под поиск, сеть, ретаргетинг и товарные форматы заводим собственные кампании. Выезд за черту города тоже идёт отдельной строкой расхода.",
    ],
    [
      "Тексты объявлений",
      "Каждой группе — свой заголовок и адрес соответствующего раздела. Быстрые ссылки, уточнения и визитку заполняем целиком.",
    ],
    [
      "Границы, время и устройства",
      "Закрепляем Усть-Каменогорск, поимённо добавляем пункты вне его границ, подгоняем окно показов под часы приёма звонков и отдаём приоритет смартфонам.",
    ],
    [
      "Счётчик и события",
      "Метрику ставим до запуска и описываем цели пошагово: анкета отправлена, номер набран, чат открыт. Срабатывание каждой цели проверяем руками на живой странице.",
    ],
    [
      "Проверка посадочной со смартфона",
      "Открываем страницу с телефона, оставляем тестовую заявку и засекаем время до ответа. Заодно смотрим, совпадает ли предложение с исходным запросом.",
    ],
    [
      "Открытие показов",
      "Запускаем при трёх выполненных условиях: модерация пройдена, тестовые события в счётчике зафиксированы, суточный потолок расхода подтверждён владельцем.",
    ],
    [
      "Ведение",
      "В каждом цикле разбираем отчёт по поисковым запросам, гасим связки без отдачи и перекладываем деньги в группы, где появляются разговоры.",
    ],
    [
      "Сводка",
      "По окончании периода отдаём документ: перечень работ, найденные проблемы, план на следующий цикл. Каждое утверждение сверяется по кабинету Директа или Метрике.",
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
        "Указан ежемесячный гонорар за сопровождение. Рекламный баланс пополняет сам владелец аккаунта. На конечную цифру влияют количество направлений, размер собранной семантики и набор включённых форматов." +
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
      "Аккаунт Директа оформляется на компанию рекламодателя. Мы подключаемся гостевым входом и работаем на расстоянии из Петропавловска. Владелец видит настройки, лимиты и расход; карту привязывает сам. Перечень целей и потолок суточного расхода согласуем до первого показа." +
      html.slice(c);
  }
  const h2i = html.indexOf("<h2", start);
  const h2o = html.indexOf(">", h2i) + 1;
  const h2c = html.indexOf("</h2>", h2o);
  html = html.slice(0, h2o) + "Доступы, лимиты и отчётность" + html.slice(h2c);

  const titles = [
    [
      "Раскладка кампаний · Усть-Каменогорск",
      "Схема показывает принцип разбивки аккаунта. Действующие проекты клиентов в неё не попадают.",
    ],
    [
      "Шаги, которые идут в статистику",
      "Итоговый список зависит от сценария сайта. Здесь он приведён как учебный пример.",
    ],
    [
      "Из чего складывается путь до заявки",
      "Иллюстрация цепочки без цифр клиента. Лимиты расхода задаются в кабинете владельца.",
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
      html.slice(0, h2o) + "Сценарии старта для Усть-Каменогорска" + html.slice(h2c);
    const cards = [
      [
        "Новый контур под город",
        "Аккаунта ещё нет или старый не годится. Собираем структуру под Усть-Каменогорск, цели и согласованный список пунктов за чертой города.",
      ],
      [
        "Переразметка текущего кабинета",
        "Кампании крутятся, но география шире зоны работы. Останавливаем лишнее, отделяем город от Восточного Казахстана и Семея, пересобираем группы.",
      ],
      [
        "Доработка точки входа",
        "Если страница отвечает на другой запрос или тормозит на телефоне, сначала правим посадочную или готовим отдельные URL под группы — иначе бюджет уходит вхолостую.",
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
      "Объявление обещает то, что человек увидит на первом экране: город, тип услуги, способ связаться. Если после клика открывается общий текст без Усть-Каменогорска и без понятной кнопки, часть бюджета сгорает на отказе.",
      "Метрика нужна, чтобы видеть, дошло ли обращение. Без событий оптимизация сводится к кликам. Когда сайт готов, связываем источник с CRM и скоростью ответа менеджера. Многоканальный сбор заявок — на странице <a href=\"/web-studiya/lidogeneratsiya/\">лидогенерации</a>; органический спрос закрывает <a href=\"/web-studiya/seo-prodvizhenie/\">SEO-продвижение</a>.",
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
    html = html.slice(0, h2o) + "Как запускаем удалённо" + html.slice(h2c);
    const steps = [
      [
        "Бриф и карта обслуживания",
        "Фиксируем направления, границу Усть-Каменогорска, список пунктов Восточного Казахстана или отдельную задачу по Семею при необходимости, рамку расхода и примеры удачных обращений. Параллельно просим доступы в Директ и Метрику.",
      ],
      [
        "Фразы и раскладка групп",
        "Список запросов собираем по каждому направлению, сразу формируем минус-слова. Поиск, сеть и возврат разносим по разным кампаниям; казахская часть с Өскемен идёт самостоятельной веткой.",
      ],
      [
        "Сборка кампаний",
        "Пишем объявления, выставляем регион показа, окно времени, устройства и цели. До модерации перепроверяем адреса посадочных и дневной потолок.",
      ],
      [
        "Включение показов",
        "Кампании стартуют, когда модерация пройдена и цели дали контрольное срабатывание. Скорость зависит от готовности материалов, поэтому дату в календаре заранее не назначаем.",
      ],
      [
        "Цикл оптимизации",
        "Дальше идёт разбор запросов, отключение пустых связок, усиление групп с разговорами и сводка с задачами следующего цикла.",
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
  "Учебная схема · без цифр клиента"
);
html = html.replace(
  /Путь от клика до ответа менеджера/g,
  "Цепочка от клика до ответа менеджера"
);
html = html.replace(
  /Иллюстрация динамики · без чисел/g,
  "Условный график · без показателей"
);
html = html.replace(
  /Лимиты расхода задаём в кабинете/g,
  "Потолок расхода задаёт владелец кабинета"
);

// Soften control demo leftovers that still echo Astana phrasing
html = html.replace(
  /Поиск · услуги · Усть-Каменогорск/g,
  "Поиск · поставки · Усть-Каменогорск"
);
html = html.replace(
  /example\.kz › ust-kamenogorsk-service/g,
  "example.kz › osk-plant"
);
html = html.replace(
  /Запись \/ выезд по Усть-Каменогорску — пример/g,
  "Поставка / выезд в Усть-Каменогорске — пример"
);

// JSON-LD rebuild
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
        { "@type": "ListItem", position: 5, name: "Усть-Каменогорск", item: CANON },
      ],
    },
    {
      "@type": "Service",
      "@id": CANON + "#service",
      name: "Настройка и ведение Яндекс Директ в Усть-Каменогорске",
      url: CANON,
      provider: { "@id": "https://raskrutov.kz/#organization" },
      areaServed: {
        "@type": "City",
        name: "Ust-Kamenogorsk",
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
if (!html.includes("Өскемен")) throw new Error("kk city name missing");
if (!html.includes("Семей")) throw new Error("Semey mention missing");
if (!html.includes('media="(min-width: 769px)"')) throw new Error("viewport CSS pattern missing");
if (!html.includes("ydOskChartFill")) throw new Error("chart fill missing");
if (!html.includes("ydOskChartFill2")) throw new Error("chart fill2 missing");
if (!html.includes('id="rk-form-contacts-yd-ust-kamenogorsk"')) throw new Error("contacts form");
if (!html.includes('name="contacts_yandex_direct_ust_kamenogorsk"')) throw new Error("contacts name");
if (!html.includes('id="rk-form-popup-yd-ust-kamenogorsk"')) throw new Error("popup form");
if (!html.includes('name="popup_yandex_direct_ust_kamenogorsk"')) throw new Error("popup name");
if (!html.includes("yd-osk-")) throw new Error("field prefix missing");
if ((html.match(/<h1[\s\S]*?<\/h1>/g) || []).length !== 1) throw new Error("H1 count");
JSON.parse(html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)[1]);

fs.mkdirSync(path.dirname(DEST), { recursive: true });
fs.writeFileSync(DEST, html, "utf8");
console.log("OK", DEST, Buffer.byteLength(html));
console.log("TITLE:", TITLE);
console.log("H1:", H1);
console.log("DESC:", DESC);
