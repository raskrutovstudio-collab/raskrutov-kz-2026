/**
 * Part 2a: campaign-types → control for Turkestan YD.
 * Run after _build-trk-part1.cjs
 */
const fs = require("fs");

const DST =
  "site_mirror/web-studiya/kontekstnaya-reklama/yandex-direct/turkestan/index.html";

let html = fs.readFileSync(DST, "utf8");

function replaceBetween(src, startMarker, endMarker, replacement) {
  const i = src.indexOf(startMarker);
  if (i < 0) throw new Error("start not found: " + startMarker.slice(0, 80));
  const j = src.indexOf(endMarker, i + startMarker.length);
  if (j < 0) throw new Error("end not found after: " + startMarker.slice(0, 80));
  return src.slice(0, i) + replacement + src.slice(j);
}

html = replaceBetween(
  html,
  '<section class="rk-section" id="campaign-types">',
  '<section class="rk-section" id="setup">',
  `<section class="rk-section" id="campaign-types">
      <div class="rk-container">
        <h2 class="rk-h2">Форматы кампаний для Туркестана</h2>
        <p class="yd-section-lead">Стартуем с Поиска: намерение уже в формулировке. Сеть, возврат и каталог подключаем после первых данных по городу и согласованной карте области.</p>
        <div class="yd-camp-grid">
          <article class="yd-camp yd-camp--search">
            <span class="yd-camp__visual" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none" focusable="false" aria-hidden="true"><circle cx="11" cy="11" r="6.5" stroke="currentColor" stroke-width="1.8"/><path d="M16 16l4 4" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>
            </span>
            <span class="yd-camp__meta">Поиск Яндекса</span>
            <h3>Поиск</h3>
            <p>Объявление отвечает на запрос про размещение, городскую услугу, отделку или подряд в Туркестане. Здесь чаще всего появляются первые звонки и формы.</p>
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
            <p>Возвращаем гостей карточек номеров и тех, кто бросил анкету. Нужны рабочие цели Метрики и накопленный сегмент аудитории.</p>
          </article>
          <article class="yd-camp yd-camp--shop">
            <span class="yd-camp__visual" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none" focusable="false" aria-hidden="true"><rect x="3" y="7" width="18" height="13" rx="2" stroke="currentColor" stroke-width="1.8"/><path d="M8 7V6a4 4 0 018 0v1" stroke="currentColor" stroke-width="1.8"/></svg>
            </span>
            <span class="yd-camp__meta">Каталог</span>
            <h3>Товарные и динамические</h3>
            <p>Строятся на фиде: название, цена, наличие. Имеют смысл при актуальной выгрузке и ясных условиях брони или самовывоза в Туркестане.</p>
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

html = replaceBetween(
  html,
  '<section class="rk-section" id="setup">',
  '<section class="rk-section" id="control">',
  `<section class="rk-section" id="setup">
      <div class="rk-container">
        <h2 class="rk-h2">Состав работ и границы услуги</h2>
        <p class="yd-section-lead">В гонорар входят первичная сборка под Туркестан и ежемесячное ведение. Клики и показы клиент оплачивает со своего баланса. Правки сайта, фид и связку с CRM выносим отдельно, когда без них нельзя зафиксировать обращение.</p>
        <ul class="yd-scope-list">
          <li class="yd-scope-list__item">
            <span class="yd-scope-list__icon" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" focusable="false" aria-hidden="true"><circle cx="11" cy="11" r="6.5" stroke="currentColor" stroke-width="1.8"/><path d="M16 16l4 4" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg></span>
            <div><h3>Спрос по городу</h3><p>Снимаем живые формулировки спроса по Туркестану в Яндексе и проверяем, закрывает ли посадочная эти запросы.</p></div>
          </li>
          <li class="yd-scope-list__item">
            <span class="yd-scope-list__icon" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" focusable="false" aria-hidden="true"><path d="M4 6h16M4 12h10M4 18h13" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg></span>
            <div><h3>Семантика по направлениям</h3><p>Набираем фразы по размещению гостей, бытовому сервису, отделке и выезду и сверяем с текстом сайта. Участки мимо интента помечаем сразу.</p></div>
          </li>
          <li class="yd-scope-list__item">
            <span class="yd-scope-list__icon" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" focusable="false" aria-hidden="true"><path d="M5 7h14M5 12h10M5 17h12" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg></span>
            <div><h3>Правила перед сборкой</h3><p>Заранее описываем критерий заявки, порядок форматов и допустимый радиус выдачи или выезда по Туркестану и согласованным пунктам области. Шымкент фиксируем отдельно.</p></div>
          </li>
          <li class="yd-scope-list__item">
            <span class="yd-scope-list__icon" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" focusable="false" aria-hidden="true"><circle cx="12" cy="12" r="8" stroke="currentColor" stroke-width="1.8"/><path d="M8 12h8" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg></span>
            <div><h3>Минус-листы</h3><p>Собираем стоп-списки под справочные, кадровые и чужие гео-формулировки, когда зона работы — только Туркестан и согласованные точки области.</p></div>
          </li>
          <li class="yd-scope-list__item">
            <span class="yd-scope-list__icon" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" focusable="false" aria-hidden="true"><rect x="4" y="5" width="16" height="14" rx="2" stroke="currentColor" stroke-width="1.8"/><path d="M8 9h8M8 13h5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg></span>
            <div><h3>Коммерческая лексика</h3><p>Набираем коммерческие ключи, маркеры города и лексику размещения, сервиса и стройки. Русский и казахский списки ведём раздельно при живом KK-спросе.</p></div>
          </li>
          <li class="yd-scope-list__item">
            <span class="yd-scope-list__icon" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" focusable="false" aria-hidden="true"><path d="M5 19V5h14v10H9l-4 4z" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/></svg></span>
            <div><h3>Стоп-фразы</h3><p>Отсекаем справочные запросы, вакансии, названия пунктов области вне согласованной карты и случайный шымкентский интерес при городском контуре.</p></div>
          </li>
          <li class="yd-scope-list__item">
            <span class="yd-scope-list__icon" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" focusable="false" aria-hidden="true"><circle cx="12" cy="12" r="8" stroke="currentColor" stroke-width="1.8"/><path d="M12 8v4l3 2" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg></span>
            <div><h3>Тексты и расширения</h3><p>Тексты пишем под конкретный оффер и раздел сайта, чтобы сразу было ясно, что доступно в Туркестане.</p></div>
          </li>
          <li class="yd-scope-list__item">
            <span class="yd-scope-list__icon" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" focusable="false" aria-hidden="true"><path d="M4 19V5M4 19h16" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/><path d="M8 15v-5M12 15V7M16 15v-3" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg></span>
            <div><h3>Структура кабинета</h3><p>Поиск, РСЯ, возврат и товарные форматы не смешиваем в одной кампании. Расход на показы по области выносим отдельной строкой бюджета.</p></div>
          </li>
          <li class="yd-scope-list__item">
            <span class="yd-scope-list__icon" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" focusable="false" aria-hidden="true"><rect x="4" y="4" width="16" height="16" rx="2" stroke="currentColor" stroke-width="1.8"/><path d="M8 12h8M12 8v8" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg></span>
            <div><h3>Объявления по группам</h3><p>У группы свой заголовок и адрес раздела. Быстрые ссылки, уточнения и визитку собираем до отправки на модерацию.</p></div>
          </li>
          <li class="yd-scope-list__item">
            <span class="yd-scope-list__icon" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" focusable="false" aria-hidden="true"><path d="M12 4v16M7 9l5-5 5 5M7 15l5 5 5-5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg></span>
            <div><h3>География и расписание</h3><p>Закрепляем Туркестан, точечно вносим пункты области, совмещаем окно показов с приёмом звонков; упор на мобильные устройства.</p></div>
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
            <li>Сравнение Директа и Google Ads для города — на странице <a href="/web-studiya/kontekstnaya-reklama/turkestan/">контекстной рекламы в Туркестане</a>.</li>
          </ul>
        </div>
      </div>
    </section>

    `
);

html = replaceBetween(
  html,
  '<section class="rk-section" id="control">',
  '<section class="rk-section" id="decision">',
  `<section class="rk-section" id="control">
      <div class="rk-container">
        <h2 class="rk-h2">Прозрачность доступов и лимитов</h2>
        <p class="yd-section-lead">Рекламный аккаунт оформлен на клиента. Агентство входит гостевым доступом и ведёт кампании удалённо из Петропавловска. Владелец видит настройки, лимиты и расход; платёжную карту привязывает сам. Цели и суточный потолок согласуем до первого показа.</p>
        <div class="yd-artifact-grid">
          <article class="yd-artifact yd-artifact--cabinet">
            <span class="yd-demo-label">Демонстрационный интерфейс</span>
            <h3 class="yd-artifact__title">Раскладка кампаний · Туркестан</h3>
            <div class="yd-artifact__body">
              <div class="yd-tree" aria-hidden="true">
                <div class="yd-tree__row">
                  <span class="yd-tree__label">Поиск · размещение / сервис · Туркестан</span>
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
                <p class="yd-ad-draft__url">example.kz › trk-build</p>
                <p class="yd-ad-draft__title">Отделка / подряд в Туркестане — пример</p>
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
                  <linearGradient id="ydTrkChartFill2" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stop-color="#FC3F1D" stop-opacity="0.22"/>
                    <stop offset="100%" stop-color="#FC3F1D" stop-opacity="0"/>
                  </linearGradient>
                </defs>
                <path d="M0 36 C28 32, 40 22, 58 24 C78 27, 90 14, 112 16 C130 18, 142 10, 160 12 L160 56 L0 56 Z" fill="url(#ydTrkChartFill2)"/>
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
                  <li>Сверка гео города, области и Шымкента</li>
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
          <p class="yd-disclaimer">Число обращений из Туркестана зависит от спроса в Яндексе, оффера, сайта, бюджета, конкуренции и скорости ответа на звонки и заявки. Гарантированный поток лидов и фиксированный CPL без аудита ниши не называем.</p>
        </div>
      </div>
    </section>

    `
);

fs.writeFileSync(DST, html, "utf8");
console.log("part2a done", html.length);
