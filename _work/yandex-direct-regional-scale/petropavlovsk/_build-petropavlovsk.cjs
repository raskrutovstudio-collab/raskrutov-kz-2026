/**
 * Build Petropavlovsk YD page from uralsk copy with unique local-office prose.
 * Task: TASK-20260821-142532
 */
const fs = require("fs");
const path = require("path");

const PAGE =
  "site_mirror/web-studiya/kontekstnaya-reklama/yandex-direct/petropavlovsk/index.html";

let html = fs.readFileSync(PAGE, "utf8");

// --- mechanical IDs / URLs (order matters) ---
const mech = [
  [/Уральске/g, "Петропавловске"],
  [/Уральска/g, "Петропавловска"],
  [/Уральск/g, "Петропавловск"],
  [/уральск/g, "петропавловск"],
  [/uralsk/g, "petropavlovsk"],
  [/Uralsk/g, "Petropavlovsk"],
  [/yd-url-/g, "yd-ppk-"],
  [/ydUrlChartFill/g, "ydPpkChartFill"],
  [/yd-url/g, "yd-ppk"],
  [/Орал/g, "Петропавл"], // temporary; cleaned below for KK where needed
  [/ЗКО/g, "СКО"],
  [/Западно-Казахстанской области/g, "Северо-Казахстанской области"],
  [/Западно-Казахстанская область/g, "Северо-Казахстанская область"],
];
for (const [re, to] of mech) html = html.replace(re, to);

// Fix accidental KK leftovers from Орал→Петропавл
html = html.replace(/Петропавл/g, "Петропавловск");
// Undo double city name if any
html = html.replace(/Петропавловскск/g, "Петропавловск");
html = html.replace(/петропавловскск/g, "петропавловск");

// Schema / meta that still need unique strings (rewrite after mech)
html = html.replace(
  /<title>.*?<\/title>/,
  "<title>Яндекс Директ в Петропавловске — настройка и ведение | Raskrutov</title>"
);
html = html.replace(
  /<meta name="description" content="[^"]*">/,
  '<meta name="description" content="Яндекс Директ из офиса Raskrutov в Петропавловске: город отдельно от СКО, локальные встречи, поиск, РСЯ и цели Метрики. От 120 000 ₸ в месяц.">'
);
html = html.replace(
  /<meta property="og:title" content="[^"]*">/,
  '<meta property="og:title" content="Яндекс Директ в Петропавловске — настройка и ведение | Raskrutov">'
);
html = html.replace(
  /<meta property="og:description" content="[^"]*">/,
  '<meta property="og:description" content="Яндекс Директ из офиса Raskrutov в Петропавловске: город отдельно от СКО, локальные встречи, поиск, РСЯ и цели Метрики. От 120 000 ₸ в месяц.">'
);

// Fix areaServed if still wrong
html = html.replace(
  /"areaServed":\{"@type":"City","name":"[^"]*"\}/,
  '"areaServed":{"@type":"City","name":"Petropavlovsk"}'
);

function replaceBetween(src, startMarker, endMarker, replacement) {
  const i = src.indexOf(startMarker);
  if (i < 0) throw new Error("start not found: " + startMarker.slice(0, 60));
  const j = src.indexOf(endMarker, i + startMarker.length);
  if (j < 0) throw new Error("end not found after: " + startMarker.slice(0, 60));
  return src.slice(0, i) + replacement + src.slice(j);
}

// ========== HERO ==========
html = replaceBetween(
  html,
  '<section class="ctx-hero" id="ctx-hero"',
  '<section class="rk-section" id="short-answer">',
  `<section class="ctx-hero" id="ctx-hero" aria-label="Яндекс Директ в Петропавловске">
      <div class="rk-container ctx-hero__grid">
        <div class="ctx-hero__copy">
          <h1 class="ctx-hero__title">Настройка и ведение Яндекс Директ в Петропавловске</h1>
          <p class="ctx-hero__sub">Кампании из офиса Raskrutov: город, СКО по карте и северный локальный спрос</p>
          <div class="yd-hero-price">
            <strong class="yd-hero-price__value">от 120 000 ₸ / мес</strong>
            <span class="yd-hero-price__note">Работа агентства · медиабюджет отдельно</span>
          </div>
          <p class="ctx-hero__lead">Показы режем по Петропавловску; Северо-Казахстанскую область включаем точечно, если есть реальная выдача или выезд. Бриф и разбор кабинета можно провести в офисе на ул. М. Жумабаева, 109.</p>
          <div class="ctx-hero__actions">
            <button class="ctx-btn ctx-btn--primary" type="button" data-rk-open-modal="rk-modal-lead">Разобрать рекламу в Петропавловске <span class="ctx-btn__arrow" aria-hidden="true">→</span></button>
            <a class="ctx-btn ctx-btn--ghost" href="#setup">Цена и состав работ</a>
          </div>
          <div class="yd-trust-strip" role="list">
            <div class="yd-trust-strip__item" role="listitem">
              <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" focusable="false"><path d="M12 3l7 3v5c0 4.5-2.8 7.8-7 10-4.2-2.2-7-5.5-7-10V6l7-3z" stroke="currentColor" stroke-width="1.8"/><path d="M9.2 12.2l2 2 3.8-4" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>
              <span>Кабинет принадлежит клиенту</span>
            </div>
            <div class="yd-trust-strip__item" role="listitem">
              <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" focusable="false"><path d="M4 19V5M4 19h16" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/><path d="M8 15v-4M12 15V8M16 15v-6" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>
              <span>Обращения считаем целями Метрики</span>
            </div>
            <div class="yd-trust-strip__item" role="listitem">
              <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" focusable="false"><circle cx="12" cy="12" r="8" stroke="currentColor" stroke-width="1.8"/><path d="M4.5 12h15M12 4.5c2.2 2.4 2.2 12.6 0 15M12 4.5c-2.2 2.4-2.2 12.6 0 15" stroke="currentColor" stroke-width="1.5"/></svg>
              <span>Город отдельно от СКО</span>
            </div>
          </div>
        </div>
        <figure class="yd-hero-visual" aria-label="Условная схема поискового объявления Яндекса для Петропавловска">
          <div class="yd-serp" aria-hidden="true">
            <div class="yd-serp__chrome">
              <span class="yd-serp__dot yd-serp__dot--r"></span>
              <span class="yd-serp__dot yd-serp__dot--y"></span>
              <span class="yd-serp__dot yd-serp__dot--g"></span>
              <span class="yd-serp__chrome-label">Поиск Яндекса · схема Петропавловск</span>
            </div>
            <div class="yd-serp__search">
              <svg class="yd-serp__g" viewBox="0 0 24 24" focusable="false" aria-hidden="true"><rect x="2" y="2" width="20" height="20" rx="4" fill="#FC3F1D"/><text x="12" y="17" text-anchor="middle" fill="#fff" font-size="13" font-weight="700" font-family="Arial, sans-serif">Я</text></svg>
              <span class="yd-serp__query">сервис снабжение петропавловск</span>
              <span class="yd-serp__search-btn" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none" focusable="false" aria-hidden="true"><circle cx="11" cy="11" r="6.5" stroke="currentColor" stroke-width="1.8"/><path d="M16 16l4 4" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>
              </span>
            </div>
            <div class="yd-serp__body">
              <div class="yd-serp__ads">
                <article class="yd-serp-ad">
                  <div class="yd-serp-ad__meta"><span class="yd-serp-ad__badge">Реклама</span><span class="yd-serp-ad__url">example.kz › petropavlovsk</span></div>
                  <p class="yd-serp-ad__title">Сервис и снабжение в Петропавловске — демо-макет</p>
                  <p class="yd-serp-ad__desc">Городской оффер, зона СКО по карте продаж и цель Метрики. Клиентские цифры в макет не входят.</p>
                  <div class="yd-serp-ad__sitelinks"><span>Условия</span><span>Заявка</span><span>Зона</span></div>
                </article>
                <article class="yd-serp-ad">
                  <div class="yd-serp-ad__meta"><span class="yd-serp-ad__badge">Реклама</span><span class="yd-serp-ad__url">example.kz › city-ppk</span></div>
                  <p class="yd-serp-ad__title">Группа под городской контур Петропавловска</p>
                  <p class="yd-serp-ad__desc">Заявки на бытовой сервис, снабжение организаций и выезд отделяем от фраз про всю СКО.</p>
                  <div class="yd-serp-ad__sitelinks"><span>Отчёт</span><span>Цели</span></div>
                </article>
                <article class="yd-serp-ad yd-serp-ad--compact">
                  <div class="yd-serp-ad__meta"><span class="yd-serp-ad__badge">Реклама</span><span class="yd-serp-ad__url">example.kz › supply-ppk</span></div>
                  <p class="yd-serp-ad__title">Каталог с выдачей в городе и по СКО</p>
                  <p class="yd-serp-ad__desc">Каталог уместен при свежем фиде и ясных условиях отгрузки. Показатели клиентов в демо-экран не подставляем.</p>
                </article>
              </div>
              <aside class="yd-serp__aside">
                <div class="yd-serp-panel">
                  <p class="yd-serp-panel__title">Кабинет Директа · схема Петропавловск</p>
                  <ul class="yd-serp-panel__list">
                    <li><span>Поиск · старт</span><em class="yd-status yd-status--ok">Активна</em></li>
                    <li><span>Регион показа</span><em class="yd-status yd-status--ok">Петропавловск</em></li>
                    <li><span>СКО · по карте</span><em class="yd-status yd-status--warn">По карте</em></li>
                    <li><span>Обращения считаем целями Метрики</span><em class="yd-status yd-status--ok">Готово</em></li>
                  </ul>
                </div>
                <div class="yd-serp-flow">
                  <span>Поиск</span>
                  <svg viewBox="0 0 16 16" fill="none" focusable="false" aria-hidden="true"><path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>
                  <span>Страница</span>
                  <svg viewBox="0 0 16 16" fill="none" focusable="false" aria-hidden="true"><path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>
                  <span>Заявка</span>
                </div>
                <div class="yd-serp-panel yd-serp-panel--chart">
                  <p class="yd-serp-panel__title">Динамика · демо</p>
                  <svg class="yd-serp-chart" viewBox="0 0 160 56" focusable="false" aria-hidden="true" preserveAspectRatio="none">
                    <defs>
                      <linearGradient id="ydPpkChartFill" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stop-color="#FC3F1D" stop-opacity="0.28"/>
                        <stop offset="100%" stop-color="#FC3F1D" stop-opacity="0"/>
                      </linearGradient>
                    </defs>
                    <path d="M0 42 C24 38, 36 28, 52 30 C72 33, 84 18, 104 20 C124 22, 136 12, 160 14 L160 56 L0 56 Z" fill="url(#ydPpkChartFill)"/>
                    <path d="M0 42 C24 38, 36 28, 52 30 C72 33, 84 18, 104 20 C124 22, 136 12, 160 14" fill="none" stroke="#FC3F1D" stroke-width="2.2" stroke-linecap="round"/>
                  </svg>
                </div>
              </aside>
            </div>
          </div>
          <figcaption class="yd-hero-visual__caption">Условная схема · гео Петропавловск · сведения рекламодателей не раскрываются</figcaption>
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
          <h2 class="rk-h2 yd-about-heading__title">Как собираем Директ для Петропавловска из местного офиса</h2>
        </div>
        <p>Северный городской спрос смешивает магазины, бытовой и профессиональный сервис, комплектацию предприятий и короткие выезды по Северо-Казахстанской области. Отметка всей СКО в Директе разносит показы по районам, куда компания может не ездить. Поэтому городской бюджет и пункты области держим разными контурами. После согласования карты покрытия собираем семантику, тексты, часы показа, устройства и цели Метрики. Общая логика канала — на <a href="/web-studiya/kontekstnaya-reklama/yandex-direct/">странице Яндекс Директ по Казахстану</a>; ниже — только Петропавловск.</p>
        <p>Raskrutov ведёт проекты из собственного офиса в Петропавловске: ул. М. Жумабаева, 109, 6 этаж, офис 606а. Встречу по брифу и разбор кабинета можно провести лично; дальнейшее ведение — через доступы, звонки и сводки. На отдачу влияют объём интереса к теме, убедительность оффера, устройство сайта, выставленный лимит и скорость ответа продавца. Пока тема и сайт не разобраны, числа будущих обращений не называем.</p>
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
        <p class="yd-section-lead">До модерации утверждаем географию Петропавловска и СКО, формат встреч в офисе или онлайн, часы приёма и признак целевого обращения.</p>
        <div class="yd-artifact-grid">
          <article class="yd-artifact yd-artifact--cabinet">
            <span class="yd-demo-label">География</span>
            <h3 class="yd-artifact__title">Город и СКО — разными контурами</h3>
            <p class="yd-artifact__note">В дереве регионов отмечаем Петропавловск. Населённые пункты СКО попадают в кампанию по отдельному списку и только при реальных выездах или отгрузках. Раз в цикл сверяем, откуда фактически шли показы.</p>
          </article>
          <article class="yd-artifact yd-artifact--flow">
            <span class="yd-demo-label">Офис</span>
            <h3 class="yd-artifact__title">Встреча на Жумабаева или дистанционно</h3>
            <p class="yd-artifact__note">Стартовый разбор можно провести в офисе 606а: оффер, карта продаж, доступы. Если удобнее онлайн — тот же состав работ без обязательного визита. Адрес офиса не расширяет географию показов автоматически.</p>
          </article>
          <article class="yd-artifact yd-artifact--flow">
            <span class="yd-demo-label">Расписание и устройства</span>
            <h3 class="yd-artifact__title">Окно приёма и смартфоны</h3>
            <p class="yd-artifact__note">Расписание показов совпадает с часами приёма заказа в магазине, на складе или у диспетчера. Смартфон проверяем первым: номер, мессенджер, короткая форма.</p>
          </article>
          <article class="yd-artifact yd-artifact--report">
            <span class="yd-demo-label">Цели и качество</span>
            <h3 class="yd-artifact__title">Какое обращение считаем целевым</h3>
            <p class="yd-artifact__note">До запуска фиксируем, какое обращение считаем целевым: анкета, звонок, заказ на снабжение или выезд. Пустые касания помечаем, чтобы оптимизация не опиралась на шум.</p>
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
        <h2 class="rk-h2">Кому в Петропавловске собираем Директ</h2>
        <p class="yd-section-lead">Формат подходит компаниям с точкой в городе, отгрузкой по СКО и желанием разобрать кабинет в офисе Raskrutov. Клиентских кейсов, отзывов и рейтингов на странице нет.</p>
        <div class="yd-card-grid">
          <article class="yd-card yd-card--local">
            <span class="yd-card__visual" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none" focusable="false" aria-hidden="true"><path d="M12 21s7-6.2 7-11a7 7 0 10-14 0c0 4.8 7 11 7 11z" stroke="currentColor" stroke-width="1.8"/><circle cx="12" cy="10" r="2.2" stroke="currentColor" stroke-width="1.8"/></svg>
            </span>
            <h3>Магазины и снабжение</h3>
            <p>Поставщик или магазин принимает заказ в Петропавловске и везёт товар по согласованным точкам СКО. Группы делим по типу заявки, чтобы человек попадал на страницу с условиями получения.</p>
          </article>
          <article class="yd-card yd-card--b2b">
            <span class="yd-card__visual" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none" focusable="false" aria-hidden="true"><rect x="4" y="7" width="16" height="12" rx="2" stroke="currentColor" stroke-width="1.8"/><path d="M8 7V5.8A2.8 2.8 0 0110.8 3h2.4A2.8 2.8 0 0116 5.8V7" stroke="currentColor" stroke-width="1.8"/></svg>
            </span>
            <h3>Сервис для организаций</h3>
            <p>Комплектация предприятий, монтаж и подряд часто пересекаются с бытовым спросом. Пункты СКО добавляем лишь туда, куда мастер или техника доезжает.</p>
          </article>
          <article class="yd-card yd-card--ecom">
            <span class="yd-card__visual" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none" focusable="false" aria-hidden="true"><path d="M6 8h12l-1 11H7L6 8z" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/><path d="M9 8V6.5A3 3 0 0112 3.5 3 3 0 0115 6.5V8" stroke="currentColor" stroke-width="1.8"/></svg>
            </span>
            <h3>Бытовой сервис в черте города</h3>
            <p>Горожанин ищет услугу или товар внутри Петропавловска. Такие группы не смешиваем с B2B-снабжением и выездом по области: другая посадочная и другой критерий качественного контакта.</p>
          </article>
          <article class="yd-card yd-card--account">
            <span class="yd-card__visual" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none" focusable="false" aria-hidden="true"><path d="M4 19V5M4 19h16" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/><path d="M8 15v-4M12 15V8M16 15v-6" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>
            </span>
            <h3>СКО шире фактической зоны</h3>
            <p>Когда в настройках стоит вся Северо-Казахстанская область без реального выезда, в отчёте смешиваются пустой интерес и рабочие заявки — развести их потом почти нельзя.</p>
          </article>
          <article class="yd-card yd-card--b2b">
            <span class="yd-card__visual" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none" focusable="false" aria-hidden="true"><path d="M4 12a8 8 0 101.8-5.1" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/><path d="M4 4v5h5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>
            </span>
            <h3>Кадровый шум и вакансии</h3>
            <p>Вакансии и найм часто пересекаются с коммерческими фразами. Уводим их в минус-лист, если нужна продажа, а не подбор персонала.</p>
          </article>
          <article class="yd-card yd-card--local">
            <span class="yd-card__visual" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none" focusable="false" aria-hidden="true"><rect x="3" y="4" width="18" height="16" rx="2" stroke="currentColor" stroke-width="1.8"/><path d="M3 9h18M8 4v5" stroke="currentColor" stroke-width="1.8"/></svg>
            </span>
            <h3>Разбор кабинета в офисе</h3>
            <p>Если удобнее обсудить семантику и цели лично, приглашаем на ул. М. Жумабаева, 109, офис 606а. Онлайн-формат сохраняем для тех, кому визит не нужен.</p>
          </article>
        </div>
      </div>
    </section>

    `
);

// ========== CAMPAIGN TYPES (light rewrite for uniqueness) ==========
html = replaceBetween(
  html,
  '<section class="rk-section" id="campaign-types">',
  '<section class="rk-section" id="setup">',
  `<section class="rk-section" id="campaign-types">
      <div class="rk-container">
        <h2 class="rk-h2">Форматы кампаний для Петропавловска</h2>
        <p class="yd-section-lead">Стартуем с Поиска: намерение уже в формулировке. Сеть, возврат и каталог подключаем после первых городских данных по северу.</p>
        <div class="yd-camp-grid">
          <article class="yd-camp yd-camp--search">
            <span class="yd-camp__visual" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none" focusable="false" aria-hidden="true"><circle cx="11" cy="11" r="6.5" stroke="currentColor" stroke-width="1.8"/><path d="M16 16l4 4" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>
            </span>
            <span class="yd-camp__meta">Поиск Яндекса</span>
            <h3>Поиск</h3>
            <p>Объявление отвечает на запрос про услугу, товар, подряд или снабжение в Петропавловске. Здесь чаще всего появляются первые звонки и формы.</p>
          </article>
          <article class="yd-camp yd-camp--rsya">
            <span class="yd-camp__visual" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none" focusable="false" aria-hidden="true"><rect x="3" y="4" width="18" height="16" rx="2" stroke="currentColor" stroke-width="1.8"/><path d="M3 9h18M8 4v5" stroke="currentColor" stroke-width="1.8"/></svg>
            </span>
            <span class="yd-camp__meta">Сеть</span>
            <h3>РСЯ</h3>
            <p>Показы на площадках сети вне строки поиска. Возвращаем тех, кто уже был на сайте; лимит сети не смешиваем с Поиском.</p>
          </article>
          <article class="yd-camp yd-camp--remark">
            <span class="yd-camp__visual" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none" focusable="false" aria-hidden="true"><path d="M4 12a8 8 0 101.8-5.1" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/><path d="M4 4v5h5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>
            </span>
            <span class="yd-camp__meta">Возврат</span>
            <h3>Ретаргетинг</h3>
            <p>Возвращаем гостей карточек и тех, кто бросил анкету. Нужны рабочие цели Метрики и накопленный сегмент аудитории.</p>
          </article>
          <article class="yd-camp yd-camp--shop">
            <span class="yd-camp__visual" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none" focusable="false" aria-hidden="true"><rect x="3" y="7" width="18" height="13" rx="2" stroke="currentColor" stroke-width="1.8"/><path d="M8 7V6a4 4 0 018 0v1" stroke="currentColor" stroke-width="1.8"/></svg>
            </span>
            <span class="yd-camp__meta">Каталог</span>
            <h3>Товарные и динамические</h3>
            <p>Строятся на фиде: название, цена, наличие. Имеют смысл при актуальной выгрузке и ясных условиях выдачи со склада в Петропавловске.</p>
          </article>
          <article class="yd-camp yd-camp--smart">
            <span class="yd-camp__visual" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none" focusable="false" aria-hidden="true"><rect x="2" y="6" width="20" height="12" rx="2" stroke="currentColor" stroke-width="1.8"/><path d="M6 10h6M6 14h4" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>
            </span>
            <span class="yd-camp__meta">Баннер</span>
            <h3>Смарт-баннеры</h3>
            <p>Автоподбор позиций, которые человек уже открывал. Подключаем, когда карточки и фид приведены в порядок.</p>
          </article>
          <article class="yd-camp yd-camp--video">
            <span class="yd-camp__visual" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none" focusable="false" aria-hidden="true"><rect x="3" y="6" width="14" height="12" rx="2" stroke="currentColor" stroke-width="1.8"/><path d="M17 10l4-2v8l-4-2" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/></svg>
            </span>
            <span class="yd-camp__meta">Охват</span>
            <h3>Медийные форматы</h3>
            <p>Баннеры и видео по согласованным макетам. Подходят при длинном цикле сделки, когда бренд нужно показать до запроса.</p>
          </article>
        </div>
      </div>
    </section>

    `
);

// ========== SETUP ==========
html = replaceBetween(
  html,
  '<section class="rk-section" id="setup">',
  '<section class="rk-section" id="control">',
  `<section class="rk-section" id="setup">
      <div class="rk-container">
        <h2 class="rk-h2">Состав работ и границы услуги</h2>
        <p class="yd-section-lead">В гонорар входят первичная сборка под Петропавловск и ежемесячное ведение. Клики и показы клиент оплачивает со своего баланса. Правки сайта, фид и связку с CRM выносим отдельно, когда без них нельзя зафиксировать обращение.</p>
        <ul class="yd-scope-list">
          <li class="yd-scope-list__item">
            <span class="yd-scope-list__icon" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" focusable="false" aria-hidden="true"><circle cx="11" cy="11" r="6.5" stroke="currentColor" stroke-width="1.8"/><path d="M16 16l4 4" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg></span>
            <div><h3>Спрос по городу</h3><p>Снимаем живые формулировки спроса по Петропавловску в Яндексе и проверяем, закрывает ли посадочная эти запросы.</p></div>
          </li>
          <li class="yd-scope-list__item">
            <span class="yd-scope-list__icon" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" focusable="false" aria-hidden="true"><path d="M4 6h16M4 12h10M4 18h13" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg></span>
            <div><h3>Семантика по направлениям</h3><p>Набираем фразы по сервису, снабжению, рознице и выезду и сверяем с текстом сайта. Участки мимо интента помечаем сразу.</p></div>
          </li>
          <li class="yd-scope-list__item">
            <span class="yd-scope-list__icon" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" focusable="false" aria-hidden="true"><path d="M5 7h14M5 12h10M5 17h12" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg></span>
            <div><h3>Правила перед сборкой</h3><p>Заранее описываем критерий заявки, порядок форматов и допустимый радиус выдачи или выезда по Петропавловску и согласованным пунктам СКО.</p></div>
          </li>
          <li class="yd-scope-list__item">
            <span class="yd-scope-list__icon" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" focusable="false" aria-hidden="true"><circle cx="12" cy="12" r="8" stroke="currentColor" stroke-width="1.8"/><path d="M8 12h8" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg></span>
            <div><h3>Минус-листы</h3><p>Собираем стоп-списки под справочные и чужие гео-формулировки, когда зона работы — только Петропавловск и согласованные точки СКО.</p></div>
          </li>
          <li class="yd-scope-list__item">
            <span class="yd-scope-list__icon" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" focusable="false" aria-hidden="true"><rect x="4" y="5" width="16" height="14" rx="2" stroke="currentColor" stroke-width="1.8"/><path d="M8 9h8M8 13h5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg></span>
            <div><h3>Коммерческая лексика</h3><p>Набираем коммерческие ключи, маркеры города и лексику сервиса, снабжения и розницы. Русский и казахский списки ведём раздельно при живом KK-спросе.</p></div>
          </li>
          <li class="yd-scope-list__item">
            <span class="yd-scope-list__icon" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" focusable="false" aria-hidden="true"><path d="M5 19V5h14v10H9l-4 4z" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/></svg></span>
            <div><h3>Стоп-фразы</h3><p>Отсекаем справочные запросы, вакансии, кадровый шум и названия пунктов СКО вне согласованной карты.</p></div>
          </li>
          <li class="yd-scope-list__item">
            <span class="yd-scope-list__icon" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" focusable="false" aria-hidden="true"><circle cx="12" cy="12" r="8" stroke="currentColor" stroke-width="1.8"/><path d="M12 8v4l3 2" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg></span>
            <div><h3>Тексты и расширения</h3><p>Тексты пишем под конкретный оффер и раздел сайта, чтобы сразу было ясно, что доступно в Петропавловске.</p></div>
          </li>
          <li class="yd-scope-list__item">
            <span class="yd-scope-list__icon" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" focusable="false" aria-hidden="true"><path d="M4 19V5M4 19h16" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/><path d="M8 15v-5M12 15V7M16 15v-3" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg></span>
            <div><h3>Структура кабинета</h3><p>Поиск, РСЯ, возврат и товарные форматы не смешиваем в одной кампании. Расход на показы по СКО выносим отдельной строкой бюджета.</p></div>
          </li>
          <li class="yd-scope-list__item">
            <span class="yd-scope-list__icon" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" focusable="false" aria-hidden="true"><rect x="4" y="4" width="16" height="16" rx="2" stroke="currentColor" stroke-width="1.8"/><path d="M8 12h8M12 8v8" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg></span>
            <div><h3>Объявления по группам</h3><p>У группы свой заголовок и адрес раздела. Быстрые ссылки, уточнения и визитку собираем до отправки на модерацию.</p></div>
          </li>
          <li class="yd-scope-list__item">
            <span class="yd-scope-list__icon" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" focusable="false" aria-hidden="true"><path d="M12 4v16M7 9l5-5 5 5M7 15l5 5 5-5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg></span>
            <div><h3>География и расписание</h3><p>Закрепляем Петропавловск, точечно вносим пункты СКО, совмещаем окно показов с приёмом звонков; упор на мобильные устройства.</p></div>
          </li>
          <li class="yd-scope-list__item">
            <span class="yd-scope-list__icon" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" focusable="false" aria-hidden="true"><path d="M8 12a4 4 0 108 0 4 4 0 10-8 0z" stroke="currentColor" stroke-width="1.8"/><path d="M4 20c1.5-3 4-4.5 8-4.5S18.5 17 20 20" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg></span>
            <div><h3>Метрика до показов</h3><p>До показов подключаем Метрику и описываем цели: анкета, звонок, открытие чата. Каждое событие проверяем на живой странице.</p></div>
          </li>
          <li class="yd-scope-list__item">
            <span class="yd-scope-list__icon" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" focusable="false" aria-hidden="true"><path d="M7 4h10v16H7z" stroke="currentColor" stroke-width="1.8"/><path d="M10 8h4M10 12h4M10 16h3" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg></span>
            <div><h3>Проверка URL с телефона</h3><p>Проверяем посадочную со смартфона: тестовая заявка и время ответа. Сверяем оффер объявления с текстом страницы.</p></div>
          </li>
        </ul>

        <div class="yd-price-board" id="pricing">
          <p class="yd-price-board__value">от 120 000 ₸ / мес</p>
          <p class="yd-price-board__lead">На табло — ежемесячный гонорар за ведение. Рекламный баланс пополняет владелец кабинета. Итоговая сумма зависит от числа направлений, длины семантики и набора форматов.</p>
          <ul>
            <li>Чем больше услуг и групп, тем выше объём ежемесячного ведения.</li>
            <li>Расход на клики и показы идёт по фактическим ставкам платформы.</li>
            <li>Сравнение Директа и Google Ads для города — на странице <a href="/web-studiya/kontekstnaya-reklama/petropavlovsk/">контекстной рекламы в Петропавловске</a>.</li>
          </ul>
        </div>
      </div>
    </section>

    `
);

// ========== CONTROL intro + demos ==========
html = replaceBetween(
  html,
  '<section class="rk-section" id="control">',
  '<section class="rk-section" id="decision">',
  `<section class="rk-section" id="control">
      <div class="rk-container">
        <h2 class="rk-h2">Прозрачность доступов и лимитов</h2>
        <p class="yd-section-lead">Рекламный аккаунт оформлен на клиента. Агентство входит гостевым доступом и ведёт кампании из офиса в Петропавловске. Владелец видит настройки, лимиты и расход; платёжную карту привязывает сам. Цели и суточный потолок согласуем до первого показа — при желании на встрече в офисе 606а.</p>
        <div class="yd-artifact-grid">
          <article class="yd-artifact yd-artifact--cabinet">
            <span class="yd-demo-label">Демонстрационный интерфейс</span>
            <h3 class="yd-artifact__title">Раскладка кампаний · Петропавловск</h3>
            <div class="yd-artifact__body">
              <div class="yd-tree" aria-hidden="true">
                <div class="yd-tree__row">
                  <span class="yd-tree__label">Поиск · сервис / снабжение · Петропавловск</span>
                  <em class="yd-status yd-status--ok">В эфире</em>
                </div>
                <div class="yd-tree__row yd-tree__row--child">
                  <span class="yd-tree__label">Коммерческие формулировки</span>
                  <em class="yd-status yd-status--ok">Собрано</em>
                </div>
                <div class="yd-tree__row yd-tree__row--child">
                  <span class="yd-tree__label">Локальные уточнения</span>
                  <em class="yd-status yd-status--warn">Уточняем</em>
                </div>
                <div class="yd-tree__meta">
                  <span>Гео города</span>
                  <span>Минус-листы</span>
                  <span>Объявления</span>
                </div>
              </div>
              <div class="yd-ad-draft" aria-hidden="true">
                <p class="yd-ad-draft__kicker">Макет объявления · демо</p>
                <p class="yd-ad-draft__url">example.kz › ppk-supply</p>
                <p class="yd-ad-draft__title">Снабжение / сервис в Петропавловске — пример</p>
                <p class="yd-ad-draft__desc">Демонстрационный текст без цифр клиента и без обещаний по числу обращений.</p>
              </div>
            </div>
            <p class="yd-artifact__note">Демонстрационный макет структуры. Живые клиентские кабинеты сюда не переносим.</p>
          </article>

          <article class="yd-artifact yd-artifact--flow">
            <span class="yd-demo-label">Демо</span>
            <h3 class="yd-artifact__title">События в отчёте</h3>
            <div class="yd-artifact__cols" aria-hidden="true">
              <ul class="yd-mini-list">
                <li><span>Анкета отправлена</span><em class="yd-status yd-status--ok">Учёт</em></li>
                <li><span>Нажатие на телефон</span><em class="yd-status yd-status--ok">Учёт</em></li>
                <li><span>Переход в чат</span><em class="yd-status yd-status--warn">По брифу</em></li>
              </ul>
              <ul class="yd-mini-list">
                <li><span>Счётчик Яндекс Метрики</span><em class="yd-status yd-status--ok">Подключён</em></li>
                <li><span>Условия цели</span><em class="yd-status yd-status--ok">Согласованы</em></li>
                <li><span>Дубли событий</span><em class="yd-status yd-status--warn">Смотрим</em></li>
              </ul>
            </div>
            <p class="yd-artifact__note">Состав целей зависит от сценария сайта. Ниже — демонстрационный пример без клиентских KPI.</p>
          </article>

          <article class="yd-artifact yd-artifact--flow">
            <span class="yd-demo-label">Демо без KPI клиента</span>
            <h3 class="yd-artifact__title">Путь до заявки</h3>
            <div class="yd-flow-track" aria-hidden="true">
              <span>Клик</span>
              <span class="yd-flow-track__arrow"></span>
              <span>Страница</span>
              <span class="yd-flow-track__arrow"></span>
              <span>Событие</span>
              <span class="yd-flow-track__arrow"></span>
              <span>Ответ</span>
            </div>
            <div class="yd-mini-chart">
              <p>Условный график без показателей рекламодателя</p>
              <svg viewBox="0 0 160 56" focusable="false" aria-hidden="true" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="ydPpkChartFill2" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stop-color="#FC3F1D" stop-opacity="0.22"/>
                    <stop offset="100%" stop-color="#FC3F1D" stop-opacity="0"/>
                  </linearGradient>
                </defs>
                <path d="M0 36 C28 32, 40 22, 58 24 C78 27, 90 14, 112 16 C130 18, 142 10, 160 12 L160 56 L0 56 Z" fill="url(#ydPpkChartFill2)"/>
                <path d="M0 36 C28 32, 40 22, 58 24 C78 27, 90 14, 112 16 C130 18, 142 10, 160 12" fill="none" stroke="#FC3F1D" stroke-width="2.2" stroke-linecap="round"/>
              </svg>
            </div>
            <p class="yd-artifact__note">Демо-схема перехода без цифр рекламодателя. Суточный потолок расхода задаёт владелец кабинета.</p>
          </article>

          <article class="yd-artifact yd-artifact--report">
            <span class="yd-demo-label">Демонстрационный интерфейс</span>
            <div class="yd-report-head">
              <h3 class="yd-artifact__title">Сводка цикла работ</h3>
              <span class="yd-report-head__period">Цикл · демо</span>
            </div>
            <div class="yd-report-grid" aria-hidden="true">
              <div>
                <p class="yd-report-grid__label">Сделано</p>
                <ul>
                  <li>Разбор поисковых запросов</li>
                  <li>Сверка гео Петропавловска и СКО</li>
                  <li>Проверка целей Метрики</li>
                </ul>
              </div>
              <div>
                <p class="yd-report-grid__label">Нашли</p>
                <ul>
                  <li>Слишком широкие формулировки</li>
                  <li>Форма неудобна на смартфоне</li>
                  <li>Смешение города и области в одной группе</li>
                </ul>
              </div>
              <div>
                <p class="yd-report-grid__label">Дальше</p>
                <ul>
                  <li>Новые группы по городу</li>
                  <li>Правка заголовков</li>
                  <li>Корректировка лимитов</li>
                </ul>
              </div>
            </div>
            <p class="yd-artifact__note">В сводке — выполненные работы и риски. Придуманных заявок и клиентских KPI здесь нет.</p>
          </article>
        </div>

        <div class="yd-control-follow">
          <ul class="yd-check-list">
            <li>Владелец рекламного аккаунта — клиент</li>
            <li>Гостевой доступ агентства выдаём и снимаем по договорённости</li>
            <li>История объявлений и настроек остаётся у владельца</li>
            <li>Платёжные реквизиты и карты не уходят в обход клиента</li>
            <li>Расход и статусы кампаний видны в интерфейсе Директа</li>
            <li>События Метрики согласованы до старта эфира</li>
            <li>Сводка фиксирует работы и план без гарантий по числу заявок</li>
          </ul>
          <p class="yd-disclaimer">Число обращений из Петропавловска зависит от спроса в Яндексе, оффера, сайта, бюджета, конкуренции и скорости ответа на звонки и заявки. Гарантированный поток лидов и фиксированный CPL без аудита ниши не называем.</p>
        </div>
      </div>
    </section>

    `
);

// ========== DECISION ==========
html = replaceBetween(
  html,
  '<section class="rk-section" id="decision">',
  '<section class="rk-section" id="landing-analytics">',
  `<section class="rk-section" id="decision">
      <div class="rk-container">
        <h2 class="rk-h2">Сценарии старта для Петропавловска</h2>
        <div class="yd-decision-grid">
          <article class="yd-decision__card">
            <h3>Новый контур под город</h3>
            <p>Кабинета нет или старый не подходит. Собираем структуру под Петропавловск, цели Метрики и согласованный список пунктов СКО. Стартовый бриф — в офисе или онлайн.</p>
          </article>
          <article class="yd-decision__card">
            <h3>Пересборка текущего кабинета</h3>
            <p>Показы уже идут, но гео шире зоны продаж. Сужаем лишнее, отделяем Петропавловск от СКО и пересобираем группы.</p>
          </article>
          <article class="yd-decision__card">
            <h3>Доработка посадочной</h3>
            <p>Если страница отвечает мимо запроса или тормозит на телефоне, сначала чиним URL либо готовим отдельные посадочные под группы — иначе клики уходят впустую.</p>
          </article>
        </div>
        <div class="yd-decision__actions">
          <button class="ctx-btn ctx-btn--primary" type="button" data-rk-open-modal="rk-modal-lead">Обсудить запуск для Петропавловска <span class="ctx-btn__arrow" aria-hidden="true">→</span></button>
        </div>
      </div>
    </section>

    `
);

// ========== LANDING ==========
html = replaceBetween(
  html,
  '<section class="rk-section" id="landing-analytics">',
  '<section class="rk-section" id="process">',
  `<section class="rk-section" id="landing-analytics">
      <div class="rk-container yd-prose">
        <h2 class="rk-h2">Посадочная и обработка обращений</h2>
        <p>Объявление и первый экран должны совпадать: Петропавловск, тип услуги, понятный способ связи. Страница без города и без кнопки после клика уводит часть расхода в отказ.</p>
        <p>По Метрике видно, дошло ли обращение. Без событий оптимизация сводится к кликам. Если сайт готов, связываем источник обращения с CRM и скоростью ответа менеджера. Многоканальный сбор заявок — на странице <a href="/web-studiya/lidogeneratsiya/">лидогенерации</a>; органический спрос закрывает <a href="/web-studiya/seo-prodvizhenie/">SEO-продвижение</a>.</p>
      </div>
    </section>

    `
);

// ========== PROCESS ==========
html = replaceBetween(
  html,
  '<section class="rk-section" id="process">',
  '<section class="ctx-cta-band"',
  `<section class="rk-section" id="process">
      <div class="rk-container">
        <h2 class="rk-h2">Пять шагов запуска для Петропавловска</h2>
        <ol class="yd-timeline">
          <li class="yd-timeline__item">
            <h3>Бриф в офисе или онлайн</h3>
            <p>Фиксируем направления, границу Петропавловска, при необходимости список пунктов СКО, рамку расхода и пару примеров удачных обращений. Встречу можно провести на ул. М. Жумабаева. Параллельно запрашиваем гостевые доступы в Директ и Метрику.</p>
          </li>
          <li class="yd-timeline__item">
            <h3>Семантика и группы</h3>
            <p>Ключи раскладываем по направлениям и сразу готовим стоп-лист. Поиск, сеть и возврат — отдельные кампании; казахская ветка собирается своим списком при живом KK-спросе.</p>
          </li>
          <li class="yd-timeline__item">
            <h3>Сборка кампаний</h3>
            <p>Собираем объявления, гео Петропавловска/СКО, расписание, устройства и цели. Перед модерацией повторно сверяем URL посадочных и дневной потолок.</p>
          </li>
          <li class="yd-timeline__item">
            <h3>Запуск показов</h3>
            <p>Показы открываем после модерации и контрольного срабатывания целей. Срок зависит от готовности материалов; календарную дату заранее не назначаем.</p>
          </li>
          <li class="yd-timeline__item">
            <h3>Оптимизация по итогам цикла</h3>
            <p>По итогам цикла разбираем поисковые запросы, отключаем пустые связки, усиливаем группы с живыми разговорами и передаём сводку с задачами на следующий период.</p>
          </li>
        </ol>
      </div>
    </section>

    `
);

// ========== CTA BAND ==========
html = replaceBetween(
  html,
  '<section class="ctx-cta-band"',
  '<section class="rk-section" id="faq">',
  `<section class="ctx-cta-band" aria-label="Обсудить Яндекс Директ для Петропавловска">
      <div class="rk-container">
        <h2>Обсудим Директ для бизнеса в Петропавловске</h2>
        <p>Берём нишу, карту Петропавловска и согласованных пунктов СКО, кабинет и счётчик. После разбора — в офисе или онлайн — назовём состав работ и цену.</p>
        <button class="ctx-btn ctx-btn--light" type="button" data-rk-open-modal="rk-modal-lead">Оставить заявку</button>
      </div>
    </section>

    `
);

// ========== FAQ ==========
html = replaceBetween(
  html,
  '<section class="rk-section" id="faq">',
  '<section class="rk-section ctx-related" id="related"',
  `<section class="rk-section" id="faq">
      <div class="rk-container">
        <h2 class="rk-h2">Вопросы о Яндекс Директ в Петропавловске</h2>
        <div class="yd-faq" data-yd-faq>
          <div class="yd-faq__item">
            <h3 class="yd-faq__q">
              <button type="button" class="yd-faq__btn" data-yd-faq-btn aria-expanded="false" aria-controls="yd-ppk-faq-a1" id="yd-ppk-faq-q1">Сколько стоит ведение Директа для бизнеса в Петропавловске?</button>
            </h3>
            <div class="yd-faq__a" id="yd-ppk-faq-a1" role="region" aria-labelledby="yd-ppk-faq-q1" hidden>Сопровождение стартует от 120 000 тенге в месяц. Стоимость растёт, когда растёт число ниш, длина семантики или набор форматов. Медиабюджет на клики клиент держит на своём балансе отдельно от гонорара.</div>
          </div>
          <div class="yd-faq__item">
            <h3 class="yd-faq__q">
              <button type="button" class="yd-faq__btn" data-yd-faq-btn aria-expanded="false" aria-controls="yd-ppk-faq-a2" id="yd-ppk-faq-q2">Как развести Петропавловск и СКО в регионах Директа?</button>
            </h3>
            <div class="yd-faq__a" id="yd-ppk-faq-a2" role="region" aria-labelledby="yd-ppk-faq-q2" hidden>В дереве регионов отмечаем Петропавловск. Пункты Северо-Казахстанской области добавляем поимённо и только при реальной выдаче, отгрузке или выезде, с отдельным лимитом. После старта сверяем отчёт местоположений с вашей картой.</div>
          </div>
          <div class="yd-faq__item">
            <h3 class="yd-faq__q">
              <button type="button" class="yd-faq__btn" data-yd-faq-btn aria-expanded="false" aria-controls="yd-ppk-faq-a3" id="yd-ppk-faq-q3">Есть ли у Raskrutov офис в Петропавловске?</button>
            </h3>
            <div class="yd-faq__a" id="yd-ppk-faq-a3" role="region" aria-labelledby="yd-ppk-faq-q3" hidden>Да. Офис Raskrutov находится в Петропавловске: ул. М. Жумабаева, 109, 6 этаж, офис 606а. Бриф и разбор кабинета можно провести лично; ведение также доступно через доступы, звонки и переписку. Адрес офиса не расширяет географию показов сам по себе.</div>
          </div>
          <div class="yd-faq__item">
            <h3 class="yd-faq__q">
              <button type="button" class="yd-faq__btn" data-yd-faq-btn aria-expanded="false" aria-controls="yd-ppk-faq-a4" id="yd-ppk-faq-q4">Какой медиабюджет нужен на старте в Петропавловске?</button>
            </h3>
            <div class="yd-faq__a" id="yd-ppk-faq-a4" role="region" aria-labelledby="yd-ppk-faq-q4" hidden>Стартовый медиабюджет зависит от конкуренции по сервису, снабжению и рознице и от числа форматов. Первые недели часть суммы уходит на проверку гипотез. Диапазон называем после разбора спроса и посадочной.</div>
          </div>
          <div class="yd-faq__item">
            <h3 class="yd-faq__q">
              <button type="button" class="yd-faq__btn" data-yd-faq-btn aria-expanded="false" aria-controls="yd-ppk-faq-a5" id="yd-ppk-faq-q5">Что входит в первую настройку для Петропавловска?</button>
            </h3>
            <div class="yd-faq__a" id="yd-ppk-faq-a5" role="region" aria-labelledby="yd-ppk-faq-q5" hidden>В первой настройке: ниша и сайт, городские формулировки, отдельно пункты СКО, минус-слова и схема кампаний. Далее тексты, гео Петропавловска, часы, устройства, Метрика и цели. Показы — после модерации и контрольных событий.</div>
          </div>
          <div class="yd-faq__item">
            <h3 class="yd-faq__q">
              <button type="button" class="yd-faq__btn" data-yd-faq-btn aria-expanded="false" aria-controls="yd-ppk-faq-a6" id="yd-ppk-faq-q6">Нужна ли отдельная ветка на казахском?</button>
            </h3>
            <div class="yd-faq__a" id="yd-ppk-faq-a6" role="region" aria-labelledby="yd-ppk-faq-q6" hidden>Отдельная ветка нужна при живом KK-спросе и посадочной на kk. Калька с русского списка почти всегда промахивается. Ключи, тексты и минус-слова собираем самостоятельным набором.</div>
          </div>
          <div class="yd-faq__item">
            <h3 class="yd-faq__q">
              <button type="button" class="yd-faq__btn" data-yd-faq-btn aria-expanded="false" aria-controls="yd-ppk-faq-a7" id="yd-ppk-faq-q7">Чем Поиск отличается от РСЯ для Петропавловска?</button>
            </h3>
            <div class="yd-faq__a" id="yd-ppk-faq-a7" role="region" aria-labelledby="yd-ppk-faq-q7" hidden>Поиск отвечает на готовый вопрос про услугу, товар или выезд — до звонка ближе. РСЯ держит бренд на виду у тех, кто уже был на сайте. Бюджеты форматов не смешиваем, чтобы читать расход.</div>
          </div>
          <div class="yd-faq__item">
            <h3 class="yd-faq__q">
              <button type="button" class="yd-faq__btn" data-yd-faq-btn aria-expanded="false" aria-controls="yd-ppk-faq-a8" id="yd-ppk-faq-q8">Как Метрика фиксирует звонки из Петропавловска?</button>
            </h3>
            <div class="yd-faq__a" id="yd-ppk-faq-a8" role="region" aria-labelledby="yd-ppk-faq-q8" hidden>Клик по номеру на смартфоне задаём целью наравне с отправкой формы — источник звонка виден в отчётах. Без счётчика остаются переходы и списания. Цели описываем до включения показов.</div>
          </div>
          <div class="yd-faq__item">
            <h3 class="yd-faq__q">
              <button type="button" class="yd-faq__btn" data-yd-faq-btn aria-expanded="false" aria-controls="yd-ppk-faq-a9" id="yd-ppk-faq-q9">Обязательно ли заводить новый аккаунт Директа?</button>
            </h3>
            <div class="yd-faq__a" id="yd-ppk-faq-a9" role="region" aria-labelledby="yd-ppk-faq-q9" hidden>Обычно остаёмся в текущем кабинете: история помогает стратегиям. Убыточное отключаем, рабочее перекладываем под Петропавловск и СКО. Новый аккаунт нужен редко — например, если доступ к старому потерян.</div>
          </div>
          <div class="yd-faq__item">
            <h3 class="yd-faq__q">
              <button type="button" class="yd-faq__btn" data-yd-faq-btn aria-expanded="false" aria-controls="yd-ppk-faq-a10" id="yd-ppk-faq-q10">Когда обычно стартуют показы?</button>
            </h3>
            <div class="yd-faq__a" id="yd-ppk-faq-a10" role="region" aria-labelledby="yd-ppk-faq-q10" hidden>Срок зависит от готовности сайта, скорости доступов и объёма семантики. Шаги: утверждение структуры, модерация, контроль целей. Конкретную дату заранее не ставим — скорость модерации объявлений от нас не зависит.</div>
          </div>
          <div class="yd-faq__item">
            <h3 class="yd-faq__q">
              <button type="button" class="yd-faq__btn" data-yd-faq-btn aria-expanded="false" aria-controls="yd-ppk-faq-a11" id="yd-ppk-faq-q11">Нужна ли отдельная посадочная под Петропавловск?</button>
            </h3>
            <div class="yd-faq__a" id="yd-ppk-faq-a11" role="region" aria-labelledby="yd-ppk-faq-q11" hidden>Отдельная посадочная нужна, если условия по городу отличаются от общих или направлений несколько. Если на общей странице уже есть Петропавловск, цены и контакты, а текст объявления совпадает со страницей — её достаточно. Анкету и кнопку вызова проверяем со смартфона до старта.</div>
          </div>
          <div class="yd-faq__item">
            <h3 class="yd-faq__q">
              <button type="button" class="yd-faq__btn" data-yd-faq-btn aria-expanded="false" aria-controls="yd-ppk-faq-a12" id="yd-ppk-faq-q12">Что подготовить к старту работ по Петропавловску?</button>
            </h3>
            <div class="yd-faq__a" id="yd-ppk-faq-a12" role="region" aria-labelledby="yd-ppk-faq-q12" hidden>Подготовьте направления и категории, карту обслуживания по Петропавловску и СКО, гостевые доступы в кабинет и счётчик, контакт менеджера, дневной потолок расхода и один-два примера сделок. С этим набором можно собирать план настройки — в офисе или дистанционно.</div>
          </div>
        </div>
      </div>
    </section>

    `
);

// ========== RELATED ==========
html = replaceBetween(
  html,
  '<section class="rk-section ctx-related" id="related"',
  '<section class="rk-section rk-section--contacts" id="contacts">',
  `<section class="rk-section ctx-related" id="related" aria-label="Связанные услуги">
      <div class="rk-container">
        <h2 class="rk-h2">Связанные страницы</h2>
        <div class="ctx-related__grid">
          <a href="/web-studiya/kontekstnaya-reklama/yandex-direct/">Яндекс Директ в Казахстане</a>
          <a href="/web-studiya/kontekstnaya-reklama/petropavlovsk/">Контекстная реклама в Петропавловске</a>
          <a href="/web-studiya/kontekstnaya-reklama/google-ads/petropavlovsk/">Google Ads в Петропавловске</a>
          <a href="/web-studiya/seo-prodvizhenie/">SEO-продвижение</a>
          <a href="/web-studiya/sozdanie-saitov/">Создание сайтов</a>
          <a href="/web-studiya/lidogeneratsiya/">Лидогенерация</a>
          <a href="/keysy/">Кейсы</a>
          <a href="/kontakty/">Контакты</a>
        </div>
      </div>
    </section>

`
);

// ========== CONTACTS intro / forms ==========
html = html.replace(
  /<p class="rk-contacts__intro">[\s\S]*?<\/p>/,
  '<p class="rk-contacts__intro">Кратко опишите нишу, границу отгрузки и выезда по Петропавловску и СКО, плюс URL сайта. Пришлём план структуры Директа, цели Метрики, объём работ и стоимость. Встречу можно провести в офисе на ул. М. Жумабаева, 109, офис 606а.</p>'
);
html = html.replace(
  /<p class="rk-form__lead">[\s\S]*?<\/p>\s*<form id="rk-form-contacts-yd-petropavlovsk"/,
  '<p class="rk-form__lead">Кратко укажите нишу, зону отгрузки и ссылку на сайт — пришлём схему Директа под Петропавловск.</p>\n              <form id="rk-form-contacts-yd-petropavlovsk"'
);
html = html.replace(
  /data-form-name="Контакты — Яндекс Директ Петропавловск"/,
  'data-form-name="Контакты — Яндекс Директ Петропавловск"'
);
html = html.replace(
  /data-form-name="Попап — Яндекс Директ Петропавловск"/,
  'data-form-name="Попап — Яндекс Директ Петропавловск"'
);
html = html.replace(
  /<p class="rk-modal__title"[^>]*>[\s\S]*?<\/p>\s*<p>Опишите нишу[\s\S]*?<\/p>/,
  '<p class="rk-modal__title" id="rk-modal-lead-title" role="heading" aria-level="2">Обсудим Яндекс Директ в Петропавловске</p>\n      <p>Опишите нишу и сайт — разберём кабинет Директа, гео Петропавловска и СКО, Метрику и состав работ. Встреча возможна в офисе.</p>'
);

// Rebuild JSON-LD FAQ answers for office (ensure YES) — replace entire script block graph FAQ portion via full JSON rebuild from visible FAQ is heavy; patch the office FAQ in JSON-LD if present
html = html.replace(
  /"name":"Есть ли у Raskrutov офис[^"]*","acceptedAnswer":\{"@type":"Answer","text":"[^"]*"\}/,
  '"name":"Есть ли у Raskrutov офис в Петропавловске?","acceptedAnswer":{"@type":"Answer","text":"Да. Офис Raskrutov находится в Петропавловске: ул. М. Жумабаева, 109, 6 этаж, офис 606а. Бриф и разбор кабинета можно провести лично; ведение также доступно через доступы, звонки и переписку. Адрес офиса не расширяет географию показов сам по себе."}'
);

// Clean leftover remote-only claims
html = html.replace(/ведём удалённо из Петропавловска[^.]*\./gi, "ведём из офиса в Петропавловске.");
html = html.replace(/Работаем удалённо; офис — в Петропавловске\./g, "Офис Raskrutov — в Петропавловске; встречу можно провести лично.");
html = html.replace(/Пять шагов удалённого запуска/g, "Пять шагов запуска");
html = html.replace(/филиала \/ представительства в Петропавловске нет/gi, "офис Raskrutov в Петропавловске");
html = html.replace(/Офиса Raskrutov в Петропавловске нет\./gi, "Офис Raskrutov в Петропавловске есть.");
html = html.replace(/Представительства в городе нет\./gi, "Офис Raskrutov в городе есть.");
html = html.replace(/Кампании собираем удалённо из Петропавловска\./gi, "Кампании собираем из офиса в Петропавловске.");

// Fix Service / WebPage names in JSON-LD if mech left wrong titles
html = html.replace(
  /"name":"Яндекс Директ в Петропавловске — настройка и ведение \| Raskrutov","description":"[^"]*"/,
  '"name":"Яндекс Директ в Петропавловске — настройка и ведение | Raskrutov","description":"Яндекс Директ из офиса Raskrutov в Петропавловске: город отдельно от СКО, локальные встречи, поиск, РСЯ и цели Метрики. От 120 000 ₸ в месяц."'
);
html = html.replace(
  /"name":"Настройка и ведение Яндекс Директ в Петропавловске","url":"https:\/\/raskrutov\.kz\/web-studiya\/kontekstnaya-reklama\/yandex-direct\/petropavlovsk\/","provider":\{"@id":"https:\/\/raskrutov\.kz\/#organization"\},"areaServed":\{"@type":"City","name":"Petropavlovsk"\},"serviceType":"Yandex Direct","description":"[^"]*"/,
  '"name":"Настройка и ведение Яндекс Директ в Петропавловске","url":"https://raskrutov.kz/web-studiya/kontekstnaya-reklama/yandex-direct/petropavlovsk/","provider":{"@id":"https://raskrutov.kz/#organization"},"areaServed":{"@type":"City","name":"Petropavlovsk"},"serviceType":"Yandex Direct","description":"Настройка и ведение Яндекс Директ для бизнеса в Петропавловске из офиса Raskrutov: город и СКО разными контурами, поиск, РСЯ, Метрика."'
);

// Breadcrumb last item should be Петропавловск
html = html.replace(
  /(<span aria-current="page">)[^<]+(<\/span>)/,
  "$1Петропавловск$2"
);

fs.writeFileSync(PAGE, html);
console.log("Wrote", PAGE, "bytes", Buffer.byteLength(html));

// Sanity checks
const checks = [
  ["yd-ppk-", html.includes("yd-ppk-")],
  ["ydPpkChartFill", html.includes("ydPpkChartFill")],
  ["ydPpkChartFill2", html.includes("ydPpkChartFill2")],
  ["rk-form-contacts-yd-petropavlovsk", html.includes("rk-form-contacts-yd-petropavlovsk")],
  ["rk-form-popup-yd-petropavlovsk", html.includes("rk-form-popup-yd-petropavlovsk")],
  ["contacts_yandex_direct_petropavlovsk", html.includes("contacts_yandex_direct_petropavlovsk")],
  ["office YES", /Да\. Офис Raskrutov находится в Петропавловске/.test(html)],
  ["no uralsk", !/uralsk|Уральск|yd-url|ydUrl|ЗКО|Орал/i.test(html)],
  ["Жумабаева", html.includes("ул. М. Жумабаева, 109")],
  ["Metrika", html.includes("101127167")],
];
for (const [n, ok] of checks) console.log(ok ? "OK" : "FAIL", n);
process.exit(checks.every(([, ok]) => ok) ? 0 : 1);
