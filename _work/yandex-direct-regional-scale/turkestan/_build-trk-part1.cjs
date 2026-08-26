/**
 * Build unique Turkestan YD page (LOCAL ONLY).
 * DOM shell: aktau (remote Petropavlovsk, viewport CSS) / cluster эталон astana.
 * Angle: pilgrimage/tourism hospitality + city services + construction;
 * city vs Turkestan oblast vs Shymkent; bilingual Түркістан; remote.
 * Form prefix yd-trk-; charts ydTrkChartFill / ydTrkChartFill2
 * Task: TASK-20260821-150056
 */
const fs = require("fs");
const path = require("path");

const SRC =
  "site_mirror/web-studiya/kontekstnaya-reklama/yandex-direct/aktau/index.html";
const DST =
  "site_mirror/web-studiya/kontekstnaya-reklama/yandex-direct/turkestan/index.html";

const TITLE = "Яндекс Директ в Туркестане — настройка и ведение | Raskrutov";
const H1 = "Настройка и ведение Яндекс Директ в Туркестане";
const DESC =
  "Яндекс Директ в Туркестане: город отдельно от Туркестанской области и Шымкента, паломнический и городской спрос, цели в Метрике. От 120 000 ₸ в месяц.";
const CANON =
  "https://raskrutov.kz/web-studiya/kontekstnaya-reklama/yandex-direct/turkestan/";

fs.mkdirSync(path.dirname(DST), { recursive: true });
let html = fs.readFileSync(SRC, "utf8");

function replaceBetween(src, startMarker, endMarker, replacement) {
  const i = src.indexOf(startMarker);
  if (i < 0) throw new Error("start not found: " + startMarker.slice(0, 80));
  const j = src.indexOf(endMarker, i + startMarker.length);
  if (j < 0) throw new Error("end not found after: " + startMarker.slice(0, 80));
  return src.slice(0, i) + replacement + src.slice(j);
}

function rep(a, b) {
  if (!html.includes(a)) {
    console.warn("MISS:", a.slice(0, 100).replace(/\n/g, " "));
    return false;
  }
  html = html.split(a).join(b);
  return true;
}

// --- mechanical IDs / paths (order matters) ---
rep("ydAktChartFill2", "ydTrkChartFill2");
rep("ydAktChartFill", "ydTrkChartFill");
rep("yd-akt-", "yd-trk-");
rep("rk-form-contacts-yd-aktau", "rk-form-contacts-yd-turkestan");
rep("contacts_yandex_direct_aktau", "contacts_yandex_direct_turkestan");
rep("rk-form-popup-yd-aktau", "rk-form-popup-yd-turkestan");
rep("popup_yandex_direct_aktau", "popup_yandex_direct_turkestan");
rep("Контакты — Яндекс Директ Актау", "Контакты — Яндекс Директ Туркестан");
rep("Попап — Яндекс Директ Актау", "Попап — Яндекс Директ Туркестан");
rep("/yandex-direct/aktau/", "/yandex-direct/turkestan/");
rep("/kontekstnaya-reklama/aktau/", "/kontekstnaya-reklama/turkestan/");
rep("/google-ads/aktau/", "/google-ads/turkestan/");
rep("example.kz › aktau", "example.kz › turkestan");
rep("example.kz › city-akt", "example.kz › city-trk");
rep("example.kz › port-akt", "example.kz › stay-trk");
rep("example.kz › akt-supply", "example.kz › trk-build");
rep('"Aktau"', '"Turkestan"');
rep("name\":\"Aktau\"", "name\":\"Turkestan\"");

// Broad toponym swap (will rewrite prose sections fully below)
rep("Мангистауской области", "Туркестанской области");
rep("Мангистаускую область", "Туркестанскую область");
rep("Мангистауская область", "Туркестанская область");
rep("Мангистау", "Туркестанская область");
rep("в Актау", "в Туркестане");
rep("по Актау", "по Туркестану");
rep("из Актау", "из Туркестана");
rep("для Актау", "для Туркестана");
rep("под Актау", "под Туркестан");
rep("Актау", "Туркестан");
rep("aktau", "turkestan");
rep("Aktau", "Turkestan");
rep("Ақтау", "Түркістан");

// Meta
html = html.replace(/<title>[\s\S]*?<\/title>/, `<title>${TITLE}</title>`);
html = html.replace(
  /<meta name="description" content="[^"]*"/,
  `<meta name="description" content="${DESC}"`
);
html = html.replace(
  /<meta property="og:title" content="[^"]*"/,
  `<meta property="og:title" content="${TITLE}"`
);
html = html.replace(
  /<meta property="og:description" content="[^"]*"/,
  `<meta property="og:description" content="${DESC}"`
);
html = html.replace(
  /<link rel="canonical" href="[^"]*"/,
  `<link rel="canonical" href="${CANON}"`
);
html = html.replace(
  /<meta property="og:url" content="[^"]*"/,
  `<meta property="og:url" content="${CANON}"`
);
html = html.replace(
  /<span aria-current="page">[^<]*<\/span>/,
  '<span aria-current="page">Туркестан</span>'
);

// ========== HERO ==========
html = replaceBetween(
  html,
  '<section class="ctx-hero" id="ctx-hero"',
  '<section class="rk-section" id="short-answer">',
  `<section class="ctx-hero" id="ctx-hero" aria-label="Яндекс Директ в Туркестане">
      <div class="rk-container ctx-hero__grid">
        <div class="ctx-hero__copy">
          <h1 class="ctx-hero__title">${H1}</h1>
          <p class="ctx-hero__sub">Паломнический поток · городской сервис · стройка · отдельно от области и Шымкента</p>
          <div class="yd-hero-price">
            <strong class="yd-hero-price__value">от 120 000 ₸ / мес</strong>
            <span class="yd-hero-price__note">Работа агентства · медиабюджет отдельно</span>
          </div>
          <p class="ctx-hero__lead">В регионах отмечаем город Туркестан. Туркестанскую область и соседний Шымкент не смешиваем с городским бюджетом без карты выдачи и выезда. Кампании ведём удалённо из Петропавловска.</p>
          <div class="ctx-hero__actions">
            <button class="ctx-btn ctx-btn--primary" type="button" data-rk-open-modal="rk-modal-lead">Разобрать Директ в Туркестане <span class="ctx-btn__arrow" aria-hidden="true">→</span></button>
            <a class="ctx-btn ctx-btn--ghost" href="#setup">Стоимость и состав работ</a>
          </div>
          <div class="yd-trust-strip" role="list">
            <div class="yd-trust-strip__item" role="listitem">
              <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" focusable="false"><path d="M12 3l7 3v5c0 4.5-2.8 7.8-7 10-4.2-2.2-7-5.5-7-10V6l7-3z" stroke="currentColor" stroke-width="1.8"/><path d="M9.2 12.2l2 2 3.8-4" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>
              <span>Кабинет остаётся у клиента</span>
            </div>
            <div class="yd-trust-strip__item" role="listitem">
              <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" focusable="false"><path d="M4 19V5M4 19h16" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/><path d="M8 15v-4M12 15V8M16 15v-6" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>
              <span>Обращения считаем в Метрике</span>
            </div>
            <div class="yd-trust-strip__item" role="listitem">
              <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" focusable="false"><circle cx="12" cy="12" r="8" stroke="currentColor" stroke-width="1.8"/><path d="M4.5 12h15M12 4.5c2.2 2.4 2.2 12.6 0 15M12 4.5c-2.2 2.4-2.2 12.6 0 15" stroke="currentColor" stroke-width="1.5"/></svg>
              <span>Город ≠ область ≠ Шымкент</span>
            </div>
          </div>
        </div>
        <figure class="yd-hero-visual" aria-label="Условная схема поискового объявления Яндекса для Туркестана">
          <div class="yd-serp" aria-hidden="true">
            <div class="yd-serp__chrome">
              <span class="yd-serp__dot yd-serp__dot--r"></span>
              <span class="yd-serp__dot yd-serp__dot--y"></span>
              <span class="yd-serp__dot yd-serp__dot--g"></span>
              <span class="yd-serp__chrome-label">Поиск Яндекса · схема Туркестан</span>
            </div>
            <div class="yd-serp__search">
              <svg class="yd-serp__g" viewBox="0 0 24 24" focusable="false" aria-hidden="true"><rect x="2" y="2" width="20" height="20" rx="4" fill="#FC3F1D"/><text x="12" y="17" text-anchor="middle" fill="#fff" font-size="13" font-weight="700" font-family="Arial, sans-serif">Я</text></svg>
              <span class="yd-serp__query">гостиница туркестан бронь</span>
              <span class="yd-serp__search-btn" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none" focusable="false" aria-hidden="true"><circle cx="11" cy="11" r="6.5" stroke="currentColor" stroke-width="1.8"/><path d="M16 16l4 4" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>
              </span>
            </div>
            <div class="yd-serp__body">
              <div class="yd-serp__ads">
                <article class="yd-serp-ad">
                  <div class="yd-serp-ad__meta"><span class="yd-serp-ad__badge">Реклама</span><span class="yd-serp-ad__url">example.kz › turkestan</span></div>
                  <p class="yd-serp-ad__title">Размещение и приём гостей в Туркестане — учебный макет</p>
                  <p class="yd-serp-ad__desc">Городской оффер, область по карте, Шымкент вне бюджета, цель Метрики. Без клиентских цифр.</p>
                  <div class="yd-serp-ad__sitelinks"><span>Условия</span><span>Заявка</span><span>Зона</span></div>
                </article>
                <article class="yd-serp-ad">
                  <div class="yd-serp-ad__meta"><span class="yd-serp-ad__badge">Реклама</span><span class="yd-serp-ad__url">example.kz › city-trk</span></div>
                  <p class="yd-serp-ad__title">Группа под городской контур Туркестана</p>
                  <p class="yd-serp-ad__desc">Заявки на жильё, бытовой сервис и отделку отделяем от фраз про всю область и Шымкент.</p>
                  <div class="yd-serp-ad__sitelinks"><span>Метрика</span><span>Отчёт</span></div>
                </article>
                <article class="yd-serp-ad yd-serp-ad--compact">
                  <div class="yd-serp-ad__meta"><span class="yd-serp-ad__badge">Реклама</span><span class="yd-serp-ad__url">example.kz › stay-trk</span></div>
                  <p class="yd-serp-ad__title">Каталог номеров и услуг с выдачей в городе</p>
                  <p class="yd-serp-ad__desc">Каталог уместен при свежем фиде и ясных условиях брони. Показатели компаний в макет не переносятся.</p>
                </article>
              </div>
              <aside class="yd-serp__aside">
                <div class="yd-serp-panel">
                  <p class="yd-serp-panel__title">Кабинет Директа · схема Туркестан</p>
                  <ul class="yd-serp-panel__list">
                    <li><span>Поиск · старт</span><em class="yd-status yd-status--ok">Активна</em></li>
                    <li><span>Регион показа</span><em class="yd-status yd-status--ok">Туркестан</em></li>
                    <li><span>Область · по карте</span><em class="yd-status yd-status--warn">По карте</em></li>
                    <li><span>Обращения в Метрике</span><em class="yd-status yd-status--ok">Готово</em></li>
                  </ul>
                </div>
                <div class="yd-serp-flow">
                  <span>Запрос</span>
                  <svg viewBox="0 0 16 16" fill="none" focusable="false" aria-hidden="true"><path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>
                  <span>Посадочная</span>
                  <svg viewBox="0 0 16 16" fill="none" focusable="false" aria-hidden="true"><path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>
                  <span>Обращение</span>
                </div>
                <div class="yd-serp-panel yd-serp-panel--chart">
                  <p class="yd-serp-panel__title">Контроль · демо</p>
                  <svg class="yd-serp-chart" viewBox="0 0 160 56" focusable="false" aria-hidden="true" preserveAspectRatio="none">
                    <defs>
                      <linearGradient id="ydTrkChartFill" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stop-color="#FC3F1D" stop-opacity="0.28"/>
                        <stop offset="100%" stop-color="#FC3F1D" stop-opacity="0"/>
                      </linearGradient>
                    </defs>
                    <path d="M0 42 C24 38, 36 28, 52 30 C72 33, 84 18, 104 20 C124 22, 136 12, 160 14 L160 56 L0 56 Z" fill="url(#ydTrkChartFill)"/>
                    <path d="M0 42 C24 38, 36 28, 52 30 C72 33, 84 18, 104 20 C124 22, 136 12, 160 14" fill="none" stroke="#FC3F1D" stroke-width="2.2" stroke-linecap="round"/>
                  </svg>
                </div>
              </aside>
            </div>
          </div>
          <figcaption class="yd-hero-visual__caption">Условная схема · гео Туркестан · сведения рекламодателей не раскрываются</figcaption>
        </figure>
      </div>
    </section>

    `
);

// ========== SHORT-ANSWER ==========
html = replaceBetween(
  html,
  '<section class="rk-section" id="short-answer">',
  '<section class="rk-section" id="local-config">',
  `<section class="rk-section" id="short-answer">
      <div class="rk-container yd-prose">
        <div class="yd-about-heading">
          <svg class="yd-about-heading__icon" viewBox="0 0 44 44" width="44" height="44" aria-hidden="true" focusable="false">
            <rect width="44" height="44" rx="10" fill="#FC3F1D"/>
            <text x="22" y="30" text-anchor="middle" fill="#fff" font-size="22" font-weight="700" font-family="Arial, sans-serif">Я</text>
          </svg>
          <h2 class="rk-h2 yd-about-heading__title">Туркестан в Директе: гости, сервис и граница трёх зон</h2>
        </div>
        <p>Туркестан — административный центр Туркестанской области и узел паломнического и туристического интереса вокруг мавзолея Ходжи Ахмеда Ясави. Рядом живут запросы на размещение, питание, трансферы, бытовые услуги жителей и подряд на отделку или ремонт. В дереве регионов Директа строка города, Туркестанская область и Шымкент (город республиканского значения) — разные уровни. Широкая галочка на области тянет показы в Кентау, Арысь, Сарыагаш и другие пункты, куда бригада или склад могут не доезжать. Шымкентский спрос при городском бюджете Туркестана даёт чужие заявки. Поэтому городской лимит, областные точки и исключение Шымкента держим разными контурами. После карты покрытия собираем семантику, тексты, часы, устройства и цели Метрики. Общая логика канала — на <a href="/web-studiya/kontekstnaya-reklama/yandex-direct/">странице Яндекс Директ по Казахстану</a>; ниже — только контур Туркестана.</p>
        <p>Представительства в Туркестане у Raskrutov нет. Работаем из Петропавловска: гостевой вход в кабинет, звонки, переписка, сводка по циклу. Адрес офиса — ул. М. Жумабаева, 109, 6 этаж, офис 606а. Результат зависит от плотности спроса, ясности предложения, качества сайта, потолка расхода и скорости ответа. Число заявок до разбора ниши не обещаем.</p>
      </div>
    </section>

    `
);

// ========== LOCAL-CONFIG ==========
html = replaceBetween(
  html,
  '<section class="rk-section" id="local-config">',
  '<section class="rk-section" id="audience">',
  `<section class="rk-section" id="local-config">
      <div class="rk-container">
        <h2 class="rk-h2">Что фиксируем до модерации</h2>
        <p class="yd-section-lead">До модерации утверждаем границу города Туркестан, согласованные пункты области, исключение Шымкента при необходимости, языки RU/KK, окно приёма у ресепшена или диспетчера и признак рабочей заявки.</p>
        <div class="yd-artifact-grid">
          <article class="yd-artifact yd-artifact--cabinet">
            <span class="yd-demo-label">География</span>
            <h3 class="yd-artifact__title">Город, область и Шымкент — разными контурами</h3>
            <p class="yd-artifact__note">В регионах отмечаем Туркестан. Пункты Туркестанской области вносим поимённо лишь при реальной выдаче, доставке или выезде. Шымкент не включаем в городской бюджет, если компания там не обслуживает заказ. Раз в цикл сверяем отчёт местоположений с вашей картой.</p>
          </article>
          <article class="yd-artifact yd-artifact--flow">
            <span class="yd-demo-label">Языки</span>
            <h3 class="yd-artifact__title">Русский и казахский — разными ветками</h3>
            <p class="yd-artifact__note">Казахские формулировки услуг и топоним Түркістан собираем отдельным списком. Прямой перевод RU-набора даёт промахи. Язык объявления, минус-слов и URL совпадает с языком запроса.</p>
          </article>
          <article class="yd-artifact yd-artifact--flow">
            <span class="yd-demo-label">Расписание и устройства</span>
            <h3 class="yd-artifact__title">Окно приёма гостей и городских заявок</h3>
            <p class="yd-artifact__note">Показы совпадают с часами ресепшена, диспетчерской службы или склада в Туркестане. Сначала проверяем смартфон: клик по номеру, мессенджер, короткая форма.</p>
          </article>
          <article class="yd-artifact yd-artifact--report">
            <span class="yd-demo-label">Цели и качество</span>
            <h3 class="yd-artifact__title">Какое обращение считаем целевым</h3>
            <p class="yd-artifact__note">До старта описываем события: бронь или анкета, звонок, заявка на выезд мастера, самовывоз. Пустые касания помечаем, чтобы оптимизация не опиралась на шум.</p>
          </article>
        </div>
      </div>
    </section>

    `
);

// ========== AUDIENCE ==========
html = replaceBetween(
  html,
  '<section class="rk-section" id="audience">',
  '<section class="rk-section" id="campaign-types">',
  `<section class="rk-section" id="audience">
      <div class="rk-container">
        <h2 class="rk-h2">Кому в Туркестане собираем Директ</h2>
        <p class="yd-section-lead">Ниже — типовые сценарии для города с паломническим потоком, бытовым спросом и стройкой. Клиентских кейсов, отзывов и рейтингов на странице нет.</p>
        <div class="yd-card-grid">
          <article class="yd-card yd-card--local">
            <span class="yd-card__visual" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none" focusable="false" aria-hidden="true"><path d="M12 21s7-6.2 7-11a7 7 0 10-14 0c0 4.8 7 11 7 11z" stroke="currentColor" stroke-width="1.8"/><circle cx="12" cy="10" r="2.2" stroke="currentColor" stroke-width="1.8"/></svg>
            </span>
            <h3>Размещение и приём гостей</h3>
            <p>Гость ищет номер, гостевой дом, питание или трансфер рядом с объектами паломничества. Группы делим по типу заявки, чтобы клик вёл на страницу с условиями брони и зоной подачи транспорта по городу.</p>
          </article>
          <article class="yd-card yd-card--b2b">
            <span class="yd-card__visual" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none" focusable="false" aria-hidden="true"><rect x="4" y="7" width="16" height="12" rx="2" stroke="currentColor" stroke-width="1.8"/><path d="M8 7V5.8A2.8 2.8 0 0110.8 3h2.4A2.8 2.8 0 0116 5.8V7" stroke="currentColor" stroke-width="1.8"/></svg>
            </span>
            <h3>Стройка, отделка и подряд</h3>
            <p>Подрядчик или заказчик ищет бригаду, материалы или выезд с базой в Туркестане. Областные адреса добавляем точечно — только куда машина или мастер реально доезжает.</p>
          </article>
          <article class="yd-card yd-card--ecom">
            <span class="yd-card__visual" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none" focusable="false" aria-hidden="true"><path d="M6 8h12l-1 11H7L6 8z" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/><path d="M9 8V6.5A3 3 0 0112 3.5 3 3 0 0115 6.5V8" stroke="currentColor" stroke-width="1.8"/></svg>
            </span>
            <h3>Бытовой сервис жителей</h3>
            <p>Житель ищет услугу или товар внутри Туркестана круглый год. Эти группы отделяем от гостевого пика и областного выезда: другая посадочная и другой критерий качественного контакта.</p>
          </article>
          <article class="yd-card yd-card--account">
            <span class="yd-card__visual" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none" focusable="false" aria-hidden="true"><path d="M4 19V5M4 19h16" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/><path d="M8 15v-4M12 15V8M16 15v-6" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>
            </span>
            <h3>Область или Шымкент шире зоны работы</h3>
            <p>Если в регионах отмечена вся Туркестанская область или случайно попал Шымкент без фактического обслуживания, в отчёте смешиваются пустой интерес и рабочие заявки — разделить их позже почти невозможно.</p>
          </article>
          <article class="yd-card yd-card--b2b">
            <span class="yd-card__visual" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none" focusable="false" aria-hidden="true"><path d="M4 12a8 8 0 101.8-5.1" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/><path d="M4 4v5h5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>
            </span>
            <h3>Справочный и кадровый шум</h3>
            <p>Фразы про расписание объектов, вакансии и набор персонала часто пересекаются с коммерческим спросом. Уводим их в минус-лист, если нужна продажа услуги или подряд, а не найм.</p>
          </article>
          <article class="yd-card yd-card--local">
            <span class="yd-card__visual" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none" focusable="false" aria-hidden="true"><rect x="3" y="4" width="18" height="16" rx="2" stroke="currentColor" stroke-width="1.8"/><path d="M3 9h18M8 4v5" stroke="currentColor" stroke-width="1.8"/></svg>
            </span>
            <h3>Несколько направлений в одном кабинете</h3>
            <p>Гостевой приём, городской сервис и стройподряд требуют разных групп, объявлений и URL. Смешение в одной кампании ломает чтение расхода и качества.</p>
          </article>
        </div>
      </div>
    </section>

    `
);

console.log("hero/short/local/audience done");
fs.writeFileSync(DST, html, "utf8");
console.log("partial write", DST, html.length);
