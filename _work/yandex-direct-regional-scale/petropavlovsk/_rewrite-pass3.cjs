/**
 * Rewrite pass 3 — aggressive core uniquify vs uralsk.
 */
const fs = require("fs");
const PAGE =
  "site_mirror/web-studiya/kontekstnaya-reklama/yandex-direct/petropavlovsk/index.html";
let h = fs.readFileSync(PAGE, "utf8");

function replaceBetween(src, startMarker, endMarker, replacement) {
  const i = src.indexOf(startMarker);
  if (i < 0) throw new Error("start missing: " + startMarker.slice(0, 50));
  const j = src.indexOf(endMarker, i + startMarker.length);
  if (j < 0) throw new Error("end missing");
  return src.slice(0, i) + replacement + src.slice(j);
}

// Full hero rewrite
h = replaceBetween(
  h,
  '<section class="ctx-hero" id="ctx-hero"',
  '<section class="rk-section" id="short-answer">',
  `<section class="ctx-hero" id="ctx-hero" aria-label="Яндекс Директ в Петропавловске">
      <div class="rk-container ctx-hero__grid">
        <div class="ctx-hero__copy">
          <h1 class="ctx-hero__title">Настройка и ведение Яндекс Директ в Петропавловске</h1>
          <p class="ctx-hero__sub">Локальный офис Raskrutov: городской эфир, СКО по карте, северный спрос</p>
          <div class="yd-hero-price">
            <strong class="yd-hero-price__value">от 120 000 ₸ / мес</strong>
            <span class="yd-hero-price__note">Работа агентства · медиабюджет отдельно</span>
          </div>
          <p class="ctx-hero__lead">Эфир режем по Петропавловску. Северо-Казахстанскую область включаем только по фактической карте выдачи и выезда. Бриф можно провести в офисе на ул. М. Жумабаева, 109, офис 606а.</p>
          <div class="ctx-hero__actions">
            <button class="ctx-btn ctx-btn--primary" type="button" data-rk-open-modal="rk-modal-lead">Разобрать рекламу в Петропавловске <span class="ctx-btn__arrow" aria-hidden="true">→</span></button>
            <a class="ctx-btn ctx-btn--ghost" href="#setup">Цена и состав работ</a>
          </div>
          <div class="yd-trust-strip" role="list">
            <div class="yd-trust-strip__item" role="listitem">
              <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" focusable="false"><path d="M12 3l7 3v5c0 4.5-2.8 7.8-7 10-4.2-2.2-7-5.5-7-10V6l7-3z" stroke="currentColor" stroke-width="1.8"/><path d="M9.2 12.2l2 2 3.8-4" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>
              <span>Права на кабинет у клиента</span>
            </div>
            <div class="yd-trust-strip__item" role="listitem">
              <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" focusable="false"><path d="M4 19V5M4 19h16" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/><path d="M8 15v-4M12 15V8M16 15v-6" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>
              <span>Цели Метрики до старта эфира</span>
            </div>
            <div class="yd-trust-strip__item" role="listitem">
              <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" focusable="false"><circle cx="12" cy="12" r="8" stroke="currentColor" stroke-width="1.8"/><path d="M4.5 12h15M12 4.5c2.2 2.4 2.2 12.6 0 15M12 4.5c-2.2 2.4-2.2 12.6 0 15" stroke="currentColor" stroke-width="1.5"/></svg>
              <span>Город и СКО разными контурами</span>
            </div>
          </div>
        </div>
        <figure class="yd-hero-visual" aria-label="Условная схема поискового объявления Яндекса для Петропавловска">
          <div class="yd-serp" aria-hidden="true">
            <div class="yd-serp__chrome">
              <span class="yd-serp__dot yd-serp__dot--r"></span>
              <span class="yd-serp__dot yd-serp__dot--y"></span>
              <span class="yd-serp__dot yd-serp__dot--g"></span>
              <span class="yd-serp__chrome-label">Поиск Яндекса · северный город</span>
            </div>
            <div class="yd-serp__search">
              <svg class="yd-serp__g" viewBox="0 0 24 24" focusable="false" aria-hidden="true"><rect x="2" y="2" width="20" height="20" rx="4" fill="#FC3F1D"/><text x="12" y="17" text-anchor="middle" fill="#fff" font-size="13" font-weight="700" font-family="Arial, sans-serif">Я</text></svg>
              <span class="yd-serp__query">бытовой сервис снабжение ск о</span>
              <span class="yd-serp__search-btn" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none" focusable="false" aria-hidden="true"><circle cx="11" cy="11" r="6.5" stroke="currentColor" stroke-width="1.8"/><path d="M16 16l4 4" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>
              </span>
            </div>
            <div class="yd-serp__body">
              <div class="yd-serp__ads">
                <article class="yd-serp-ad">
                  <div class="yd-serp-ad__meta"><span class="yd-serp-ad__badge">Реклама</span><span class="yd-serp-ad__url">example.kz › ppk-local</span></div>
                  <p class="yd-serp-ad__title">Сервис в Петропавловске — учебный макет</p>
                  <p class="yd-serp-ad__desc">Городской оффер, точечная СКО и событие Метрики. Цифры рекламодателей в макет не входят.</p>
                  <div class="yd-serp-ad__sitelinks"><span>Зона</span><span>Запись</span><span>Контакт</span></div>
                </article>
                <article class="yd-serp-ad">
                  <div class="yd-serp-ad__meta"><span class="yd-serp-ad__badge">Реклама</span><span class="yd-serp-ad__url">example.kz › ppk-b2b</span></div>
                  <p class="yd-serp-ad__title">Снабжение организаций · городской контур</p>
                  <p class="yd-serp-ad__desc">B2B-заявки отделяем от бытового спроса и от фраз про всю область.</p>
                  <div class="yd-serp-ad__sitelinks"><span>Сводка</span><span>Цели</span></div>
                </article>
                <article class="yd-serp-ad yd-serp-ad--compact">
                  <div class="yd-serp-ad__meta"><span class="yd-serp-ad__badge">Реклама</span><span class="yd-serp-ad__url">example.kz › ppk-feed</span></div>
                  <p class="yd-serp-ad__title">Каталог с самовывозом и доставкой по СКО</p>
                  <p class="yd-serp-ad__desc">Фид уместен при свежей выгрузке и ясных условиях получения. KPI клиентов в демо не подставляем.</p>
                </article>
              </div>
              <aside class="yd-serp__aside">
                <div class="yd-serp-panel">
                  <p class="yd-serp-panel__title">Кабинет · северный контур</p>
                  <ul class="yd-serp-panel__list">
                    <li><span>Поиск · город</span><em class="yd-status yd-status--ok">В эфире</em></li>
                    <li><span>Регион</span><em class="yd-status yd-status--ok">Петропавловск</em></li>
                    <li><span>СКО</span><em class="yd-status yd-status--warn">По карте</em></li>
                    <li><span>Цели Метрики</span><em class="yd-status yd-status--ok">Готовы</em></li>
                  </ul>
                </div>
                <div class="yd-serp-flow">
                  <span>Запрос</span>
                  <svg viewBox="0 0 16 16" fill="none" focusable="false" aria-hidden="true"><path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>
                  <span>Посадочная</span>
                  <svg viewBox="0 0 16 16" fill="none" focusable="false" aria-hidden="true"><path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>
                  <span>Контакт</span>
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
          <figcaption class="yd-hero-visual__caption">Учебная схема · Петропавловск · данные рекламодателей не раскрываются</figcaption>
        </figure>
      </div>
    </section>

    `
);

// short-answer
h = replaceBetween(
  h,
  '<section class="rk-section" id="short-answer">',
  '<section class="rk-section" id="local-config">',
  `<section class="rk-section" id="short-answer">
      <div class="rk-container yd-prose">
        <div class="yd-about-heading">
          <svg class="yd-about-heading__icon" viewBox="0 0 44 44" width="44" height="44" aria-hidden="true" focusable="false">
            <rect width="44" height="44" rx="10" fill="#FC3F1D"/>
            <text x="22" y="30" text-anchor="middle" fill="#fff" font-size="22" font-weight="700" font-family="Arial, sans-serif">Я</text>
          </svg>
          <h2 class="rk-h2 yd-about-heading__title">Директ из офиса в Петропавловске</h2>
        </div>
        <p>Северный поиск смешивает розницу, бытовой сервис, снабжение организаций и короткие выезды по СКО. Широкая отметка всей области уводит показы туда, куда компания не ездит. Поэтому городской бюджет и пункты СКО держим разными контурами. После утверждения карты покрытия собираем семантику, тексты, расписание, устройства и цели. Обзор канала — на <a href="/web-studiya/kontekstnaya-reklama/yandex-direct/">странице Яндекс Директ по Казахстану</a>; ниже — только городской контур.</p>
        <p>Raskrutov работает из собственного офиса: ул. М. Жумабаева, 109, 6 этаж, офис 606а. Встречу по брифу можно провести лично; текущее сопровождение — через доступы, звонки и сводки. На отдачу влияют сила спроса, ясность оффера, мобильная посадочная, дневной потолок и скорость ответа менеджера. Прогноз числа заявок до аудита ниши не даём.</p>
      </div>
    </section>

    `
);

// local-config
h = replaceBetween(
  h,
  '<section class="rk-section" id="local-config">',
  '<section class="rk-section" id="audience">',
  `<section class="rk-section" id="local-config">
      <div class="rk-container">
        <h2 class="rk-h2">Параметры до модерации</h2>
        <p class="yd-section-lead">До модерации согласуем гео Петропавловска и СКО, формат встречи в офисе или онлайн, окно приёма и критерий целевого контакта.</p>
        <div class="yd-artifact-grid">
          <article class="yd-artifact yd-artifact--cabinet">
            <span class="yd-demo-label">Гео</span>
            <h3 class="yd-artifact__title">Городской эфир и точечная СКО</h3>
            <p class="yd-artifact__note">В регионах отмечаем Петропавловск. Пункты СКО добавляем отдельным списком и только при реальной выдаче или выезде. Каждый цикл сверяем фактические местоположения показов.</p>
          </article>
          <article class="yd-artifact yd-artifact--flow">
            <span class="yd-demo-label">Офис</span>
            <h3 class="yd-artifact__title">Встреча на Жумабаева 109</h3>
            <p class="yd-artifact__note">Стартовый разбор доступен в офисе 606а: оффер, карта продаж, доступы. Онлайн-формат даёт тот же состав работ. Адрес студии сам по себе не расширяет географию показов.</p>
          </article>
          <article class="yd-artifact yd-artifact--flow">
            <span class="yd-demo-label">Окно и устройства</span>
            <h3 class="yd-artifact__title">Часы приёма и смартфоны</h3>
            <p class="yd-artifact__note">Окно показов стыкуем с часами приёма на складе, в магазине или у диспетчера. Мобильный сценарий проверяем первым: номер, мессенджер, короткая анкета.</p>
          </article>
          <article class="yd-artifact yd-artifact--report">
            <span class="yd-demo-label">Качество</span>
            <h3 class="yd-artifact__title">Признак целевого контакта</h3>
            <p class="yd-artifact__note">До эфира фиксируем, что считаем целевым: анкета, звонок, заказ на снабжение или выезд. Пустые касания помечаем, чтобы оптимизация не опиралась на шум.</p>
          </article>
        </div>
      </div>
    </section>

    `
);

// audience
h = replaceBetween(
  h,
  '<section class="rk-section" id="audience">',
  '<section class="rk-section" id="campaign-types">',
  `<section class="rk-section" id="audience">
      <div class="rk-container">
        <h2 class="rk-h2">Кому в Петропавловске нужен Директ</h2>
        <p class="yd-section-lead">Канал полезен компаниям с точкой в городе, выездом по СКО и возможностью разобрать кабинет в офисе на Жумабаева. Отзывов, рейтингов и клиентских кейсов на странице нет.</p>
        <div class="yd-card-grid">
          <article class="yd-card yd-card--local">
            <span class="yd-card__visual" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none" focusable="false" aria-hidden="true"><path d="M12 21s7-6.2 7-11a7 7 0 10-14 0c0 4.8 7 11 7 11z" stroke="currentColor" stroke-width="1.8"/><circle cx="12" cy="10" r="2.2" stroke="currentColor" stroke-width="1.8"/></svg>
            </span>
            <h3>Розница и выдача в городе</h3>
            <p>Склад или точка выдачи в Петропавловске плюс доставка по согласованным адресам СКО. Схемы получения ведём разными группами, чтобы человек открывал страницу с нужными условиями.</p>
          </article>
          <article class="yd-card yd-card--b2b">
            <span class="yd-card__visual" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none" focusable="false" aria-hidden="true"><rect x="4" y="7" width="16" height="12" rx="2" stroke="currentColor" stroke-width="1.8"/><path d="M8 7V5.8A2.8 2.8 0 0110.8 3h2.4A2.8 2.8 0 0116 5.8V7" stroke="currentColor" stroke-width="1.8"/></svg>
            </span>
            <h3>Снабжение и подряд</h3>
            <p>B2B-заказы на комплектацию и монтаж пересекаются с бытовыми запросами в одной выдаче. Областные точки включаем только в радиусе реального выезда бригады.</p>
          </article>
          <article class="yd-card yd-card--ecom">
            <span class="yd-card__visual" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none" focusable="false" aria-hidden="true"><path d="M6 8h12l-1 11H7L6 8z" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/><path d="M9 8V6.5A3 3 0 0112 3.5 3 3 0 0115 6.5V8" stroke="currentColor" stroke-width="1.8"/></svg>
            </span>
            <h3>Бытовой сервис внутри города</h3>
            <p>Локальный бытовой запрос держим отдельно от корпоративного снабжения и выезда по области: свой URL и свой признак качественного контакта.</p>
          </article>
          <article class="yd-card yd-card--account">
            <span class="yd-card__visual" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none" focusable="false" aria-hidden="true"><path d="M4 19V5M4 19h16" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/><path d="M8 15v-4M12 15V8M16 15v-6" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>
            </span>
            <h3>СКО без реального покрытия</h3>
            <p>Если отмечена вся Северо-Казахстанская область без фактического выезда, в статистике склеиваются пустые просмотры и рабочие звонки. Разделить их задним числом почти нереально.</p>
          </article>
          <article class="yd-card yd-card--b2b">
            <span class="yd-card__visual" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none" focusable="false" aria-hidden="true"><path d="M4 12a8 8 0 101.8-5.1" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/><path d="M4 4v5h5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>
            </span>
            <h3>Кадровый шум</h3>
            <p>Кадровые запросы пересекают коммерческую семантику. Если цель — продажа услуги или товара, вакансии и найм уводим в стоп-лист до старта.</p>
          </article>
          <article class="yd-card yd-card--local">
            <span class="yd-card__visual" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none" focusable="false" aria-hidden="true"><rect x="3" y="4" width="18" height="16" rx="2" stroke="currentColor" stroke-width="1.8"/><path d="M3 9h18M8 4v5" stroke="currentColor" stroke-width="1.8"/></svg>
            </span>
            <h3>Личная встреча в офисе</h3>
            <p>Семантику и цели удобно разобрать на ул. М. Жумабаева, 109, офис 606а. Онлайн-формат сохраняем для тех, кому визит не нужен.</p>
          </article>
        </div>
      </div>
    </section>

    `
);

// FAQ — fully unique answers
h = replaceBetween(
  h,
  '<section class="rk-section" id="faq">',
  '<section class="rk-section ctx-related" id="related"',
  `<section class="rk-section" id="faq">
      <div class="rk-container">
        <h2 class="rk-h2">FAQ: Яндекс Директ в Петропавловске</h2>
        <div class="yd-faq" data-yd-faq>
          <div class="yd-faq__item">
            <h3 class="yd-faq__q">
              <button type="button" class="yd-faq__btn" data-yd-faq-btn aria-expanded="false" aria-controls="yd-ppk-faq-a1" id="yd-ppk-faq-q1">Сколько стоит ведение Директа в Петропавловске?</button>
            </h3>
            <div class="yd-faq__a" id="yd-ppk-faq-a1" role="region" aria-labelledby="yd-ppk-faq-q1" hidden>Гонорар за ведение начинается от 120 000 тенге в месяц. Итог зависит от числа направлений, объёма семантики и набора форматов. Оплату кликов клиент вносит на свой баланс отдельно от работы агентства.</div>
          </div>
          <div class="yd-faq__item">
            <h3 class="yd-faq__q">
              <button type="button" class="yd-faq__btn" data-yd-faq-btn aria-expanded="false" aria-controls="yd-ppk-faq-a2" id="yd-ppk-faq-q2">Как отделить Петропавловск от СКО в гео?</button>
            </h3>
            <div class="yd-faq__a" id="yd-ppk-faq-a2" role="region" aria-labelledby="yd-ppk-faq-q2" hidden>В регионах включаем Петропавловск. Населённые пункты СКО добавляем поимённо и только там, где есть реальная выдача, отгрузка или выезд, с отдельным лимитом. После старта сверяем отчёт местоположений с картой обслуживания.</div>
          </div>
          <div class="yd-faq__item">
            <h3 class="yd-faq__q">
              <button type="button" class="yd-faq__btn" data-yd-faq-btn aria-expanded="false" aria-controls="yd-ppk-faq-a3" id="yd-ppk-faq-q3">Есть ли у Raskrutov офис в Петропавловске?</button>
            </h3>
            <div class="yd-faq__a" id="yd-ppk-faq-a3" role="region" aria-labelledby="yd-ppk-faq-q3" hidden>Да. Офис Raskrutov находится в Петропавловске: ул. М. Жумабаева, 109, 6 этаж, офис 606а. Бриф и разбор кабинета можно провести лично; ведение также доступно через доступы, звонки и переписку. Адрес офиса не расширяет географию показов сам по себе.</div>
          </div>
          <div class="yd-faq__item">
            <h3 class="yd-faq__q">
              <button type="button" class="yd-faq__btn" data-yd-faq-btn aria-expanded="false" aria-controls="yd-ppk-faq-a4" id="yd-ppk-faq-q4">Какой медиабюджет нужен на старте?</button>
            </h3>
            <div class="yd-faq__a" id="yd-ppk-faq-a4" role="region" aria-labelledby="yd-ppk-faq-q4" hidden>Рамка зависит от конкуренции в сервисе, снабжении и рознице севера и от числа форматов. Первые недели часть суммы уходит на проверку гипотез. Ориентир называем после разбора спроса и посадочной.</div>
          </div>
          <div class="yd-faq__item">
            <h3 class="yd-faq__q">
              <button type="button" class="yd-faq__btn" data-yd-faq-btn aria-expanded="false" aria-controls="yd-ppk-faq-a5" id="yd-ppk-faq-q5">Что входит в первую настройку?</button>
            </h3>
            <div class="yd-faq__a" id="yd-ppk-faq-a5" role="region" aria-labelledby="yd-ppk-faq-q5" hidden>Разбираем нишу и сайт, городские формулировки, отдельно пункты СКО, минус-слова и схему кампаний. Затем тексты, гео города, часы, устройства, Метрику и цели. Эфир открываем после модерации и контрольных событий.</div>
          </div>
          <div class="yd-faq__item">
            <h3 class="yd-faq__q">
              <button type="button" class="yd-faq__btn" data-yd-faq-btn aria-expanded="false" aria-controls="yd-ppk-faq-a6" id="yd-ppk-faq-q6">Нужна ли казахская ветка кампаний?</button>
            </h3>
            <div class="yd-faq__a" id="yd-ppk-faq-a6" role="region" aria-labelledby="yd-ppk-faq-q6" hidden>Да, если есть живой KK-спрос и посадочная на kk. Перевод русского списка обычно промахивается: формулировки другие. Ключи, тексты и минус-слова собираем самостоятельным набором.</div>
          </div>
          <div class="yd-faq__item">
            <h3 class="yd-faq__q">
              <button type="button" class="yd-faq__btn" data-yd-faq-btn aria-expanded="false" aria-controls="yd-ppk-faq-a7" id="yd-ppk-faq-q7">Чем Поиск отличается от РСЯ здесь?</button>
            </h3>
            <div class="yd-faq__a" id="yd-ppk-faq-a7" role="region" aria-labelledby="yd-ppk-faq-q7" hidden>Поиск ловит уже сформулированный запрос на услугу, товар или выезд — путь до контакта короче. Сеть возвращает людей, которые уже были на сайте. Бюджеты форматов держим раздельными.</div>
          </div>
          <div class="yd-faq__item">
            <h3 class="yd-faq__q">
              <button type="button" class="yd-faq__btn" data-yd-faq-btn aria-expanded="false" aria-controls="yd-ppk-faq-a8" id="yd-ppk-faq-q8">Как учитываются звонки в Метрике?</button>
            </h3>
            <div class="yd-faq__a" id="yd-ppk-faq-a8" role="region" aria-labelledby="yd-ppk-faq-q8" hidden>Клик по телефону на мобильном учитываем целью наравне с формой — источник звонка виден в отчётах. Без Метрики остаются только переходы и списания. Цели описываем до старта эфира.</div>
          </div>
          <div class="yd-faq__item">
            <h3 class="yd-faq__q">
              <button type="button" class="yd-faq__btn" data-yd-faq-btn aria-expanded="false" aria-controls="yd-ppk-faq-a9" id="yd-ppk-faq-q9">Нужен ли новый аккаунт Директа?</button>
            </h3>
            <div class="yd-faq__a" id="yd-ppk-faq-a9" role="region" aria-labelledby="yd-ppk-faq-q9" hidden>Чаще остаёмся в текущем кабинете: история помогает стратегиям. Слабые кампании останавливаем, рабочие перекладываем под контур Петропавловска и СКО. Новый аккаунт — редкий случай при потере доступа.</div>
          </div>
          <div class="yd-faq__item">
            <h3 class="yd-faq__q">
              <button type="button" class="yd-faq__btn" data-yd-faq-btn aria-expanded="false" aria-controls="yd-ppk-faq-a10" id="yd-ppk-faq-q10">Когда стартуют показы?</button>
            </h3>
            <div class="yd-faq__a" id="yd-ppk-faq-a10" role="region" aria-labelledby="yd-ppk-faq-q10" hidden>Срок зависит от готовности сайта, скорости доступов и объёма семантики. Сначала утверждаем структуру, затем проходим модерацию и контроль целей. Календарный день запуска заранее не назначаем.</div>
          </div>
          <div class="yd-faq__item">
            <h3 class="yd-faq__q">
              <button type="button" class="yd-faq__btn" data-yd-faq-btn aria-expanded="false" aria-controls="yd-ppk-faq-a11" id="yd-ppk-faq-q11">Нужна ли отдельная посадочная под город?</button>
            </h3>
            <div class="yd-faq__a" id="yd-ppk-faq-a11" role="region" aria-labelledby="yd-ppk-faq-q11" hidden>Отдельный URL полезен, если условия по Петропавловску отличаются или направлений несколько. Если общая страница уже называет город, цены и контакты и совпадает с объявлением — её достаточно. Анкету и кнопку звонка проверяем со смартфона до старта.</div>
          </div>
          <div class="yd-faq__item">
            <h3 class="yd-faq__q">
              <button type="button" class="yd-faq__btn" data-yd-faq-btn aria-expanded="false" aria-controls="yd-ppk-faq-a12" id="yd-ppk-faq-q12">Что подготовить перед стартом?</button>
            </h3>
            <div class="yd-faq__a" id="yd-ppk-faq-a12" role="region" aria-labelledby="yd-ppk-faq-q12" hidden>Список направлений, карта города и СКО, гостевые доступы в Директ и Метрику, контакт принимающего заявки, дневной потолок и пара примеров удачных обращений. По этому набору собираем план — в офисе 606а или онлайн.</div>
          </div>
        </div>
      </div>
    </section>

    `
);

fs.writeFileSync(PAGE, h);
console.log("pass3 written", Buffer.byteLength(h));
