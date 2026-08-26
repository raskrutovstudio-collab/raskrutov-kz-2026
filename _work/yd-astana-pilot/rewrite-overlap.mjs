import fs from 'fs';

const path = 'site_mirror/web-studiya/kontekstnaya-reklama/yandex-direct/astana/index.html';
let html = fs.readFileSync(path, 'utf8');

function replaceBetween(src, startMarker, endMarker, replacement) {
  const s = src.indexOf(startMarker);
  const e = src.indexOf(endMarker, s);
  if (s < 0 || e < 0) throw new Error('markers not found: ' + startMarker.slice(0, 40));
  return src.slice(0, s) + replacement + src.slice(e);
}

const setup = `<section class="rk-section" id="setup">
      <div class="rk-container">
        <h2 class="rk-h2">Состав работ и границы услуги</h2>
        <p class="yd-section-lead">Оплата агентства покрывает сбор локального контура Директа для Астаны и ежемесячное сопровождение. Клики и показы клиент оплачивает в своём кабинете. Правки сайта, фиды и CRM-связки выносим в отдельный объём, если без них нельзя корректно измерить обращения.</p>
        <ul class="yd-scope-list">
          <li class="yd-scope-list__item">
            <span class="yd-scope-list__icon" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" focusable="false" aria-hidden="true"><circle cx="11" cy="11" r="6.5" stroke="currentColor" stroke-width="1.8"/><path d="M16 16l4 4" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg></span>
            <div><h3>Разбор спроса по столице</h3><p>Смотрим, какие формулировки реально ищут в Яндексе под ваши услуги в Астане, и где посадочная уже отвечает на запрос.</p></div>
          </li>
          <li class="yd-scope-list__item">
            <span class="yd-scope-list__icon" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" focusable="false" aria-hidden="true"><path d="M4 6h16M4 12h10M4 18h13" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg></span>
            <div><h3>План контура</h3><p>Согласуем, что считаем целевым обращением, какие форматы включаем сначала и какие районы входят в зону обслуживания.</p></div>
          </li>
          <li class="yd-scope-list__item">
            <span class="yd-scope-list__icon" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" focusable="false" aria-hidden="true"><path d="M5 7h14M5 12h10M5 17h12" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg></span>
            <div><h3>Фразы и языки</h3><p>Собираем коммерческие запросы и городские уточнения. Русский и казахский проверяем как отдельные слои спроса, без механического перевода.</p></div>
          </li>
          <li class="yd-scope-list__item">
            <span class="yd-scope-list__icon" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" focusable="false" aria-hidden="true"><circle cx="12" cy="12" r="8" stroke="currentColor" stroke-width="1.8"/><path d="M8 12h8" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg></span>
            <div><h3>Ограничения трафика</h3><p>Готовим минус-листы под информационные и иногородние формулировки, если задача — только Астана и согласованные зоны.</p></div>
          </li>
          <li class="yd-scope-list__item">
            <span class="yd-scope-list__icon" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" focusable="false" aria-hidden="true"><rect x="4" y="5" width="16" height="14" rx="2" stroke="currentColor" stroke-width="1.8"/><path d="M8 9h8M8 13h5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg></span>
            <div><h3>Разделение кампаний</h3><p>Выносим Поиск, сеть, возврат и товарные форматы в читаемые блоки, чтобы расход по городу не смешивался с другими контурами.</p></div>
          </li>
          <li class="yd-scope-list__item">
            <span class="yd-scope-list__icon" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" focusable="false" aria-hidden="true"><path d="M5 19V5h14v10H9l-4 4z" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/></svg></span>
            <div><h3>Тексты и расширения</h3><p>Пишем объявления под конкретный оффер и URL, добавляем быстрые ссылки и уточнения, которые помогают выбрать направление.</p></div>
          </li>
          <li class="yd-scope-list__item">
            <span class="yd-scope-list__icon" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" focusable="false" aria-hidden="true"><circle cx="12" cy="12" r="8" stroke="currentColor" stroke-width="1.8"/><path d="M12 8v4l3 2" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg></span>
            <div><h3>Гео, часы и устройства</h3><p>Фиксируем Астану, выездной радиус при необходимости, окно показов под обработку заявок и приоритет мобильного сценария.</p></div>
          </li>
          <li class="yd-scope-list__item">
            <span class="yd-scope-list__icon" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" focusable="false" aria-hidden="true"><path d="M4 19V5M4 19h16" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/><path d="M8 15v-5M12 15V7M16 15v-3" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg></span>
            <div><h3>Счётчик и события</h3><p>Подключаем Метрику и цели формы, звонка, WhatsApp или другого согласованного шага до включения показов.</p></div>
          </li>
          <li class="yd-scope-list__item">
            <span class="yd-scope-list__icon" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" focusable="false" aria-hidden="true"><rect x="4" y="4" width="16" height="16" rx="2" stroke="currentColor" stroke-width="1.8"/><path d="M8 12h8M12 8v8" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg></span>
            <div><h3>Проверка точки входа</h3><p>Смотрим, совпадает ли оффер с запросом, работает ли форма на телефоне и успевает ли менеджер ответить в рабочее окно.</p></div>
          </li>
          <li class="yd-scope-list__item">
            <span class="yd-scope-list__icon" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" focusable="false" aria-hidden="true"><path d="M12 4v16M7 9l5-5 5 5M7 15l5 5 5-5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg></span>
            <div><h3>Включение показов</h3><p>Стартуем после модерации, проверки событий и согласованных лимитов. Дата зависит от готовности доступов и материалов.</p></div>
          </li>
          <li class="yd-scope-list__item">
            <span class="yd-scope-list__icon" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" focusable="false" aria-hidden="true"><path d="M8 12a4 4 0 108 0 4 4 0 10-8 0z" stroke="currentColor" stroke-width="1.8"/><path d="M4 20c1.5-3 4-4.5 8-4.5S18.5 17 20 20" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg></span>
            <div><h3>Сопровождение</h3><p>Убираем слабые связки, усиливаем рабочие группы по Астане, правим тексты и перераспределяем дневной расход.</p></div>
          </li>
          <li class="yd-scope-list__item">
            <span class="yd-scope-list__icon" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" focusable="false" aria-hidden="true"><path d="M7 4h10v16H7z" stroke="currentColor" stroke-width="1.8"/><path d="M10 8h4M10 12h4M10 16h3" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg></span>
            <div><h3>Сводка периода</h3><p>Передаём список сделанных правок, замеченные сбои и приоритеты на следующий цикл без вымышленных KPI.</p></div>
          </li>
        </ul>

        <div class="yd-price-board" id="pricing">
          <p class="yd-price-board__value">от 120 000 ₸ / мес</p>
          <p class="yd-price-board__lead">Это оплата работы агентства. Рекламный бюджет вносится клиентом в кабинет Директа отдельно. Итоговый объём зависит от числа направлений, глубины семантики и подключенных форматов.</p>
          <ul>
            <li>Чем больше услуг и групп, тем выше объём сопровождения.</li>
            <li>Расход на клики и показы идёт по фактическим ставкам платформы.</li>
            <li>Выбор между Директом и Google Ads для города — на странице <a href="/web-studiya/kontekstnaya-reklama/astana/">контекстной рекламы в Астане</a>.</li>
          </ul>
        </div>
      </div>
    </section>

    `;

const control = `<section class="rk-section" id="control">
      <div class="rk-container">
        <h2 class="rk-h2">Прозрачность для владельца кабинета</h2>
        <p class="yd-section-lead">Кабинет Директа оформлен на клиента. Мы подключаемся по выданному доступу и работаем удалённо. Вы видите кампании, лимиты и статистику; платёжные реквизиты остаются у вас. Перед стартом согласуем цели Метрики и дневные/месячные ограничения расхода.</p>
        <div class="yd-artifact-grid">
          <article class="yd-artifact yd-artifact--cabinet">
            <span class="yd-demo-label">Демонстрационный интерфейс</span>
            <h3 class="yd-artifact__title">Контур под Астану</h3>
            <div class="yd-artifact__body">
              <div class="yd-tree" aria-hidden="true">
                <div class="yd-tree__row">
                  <span class="yd-tree__label">Поиск · услуги · Астана</span>
                  <em class="yd-status yd-status--ok">В эфире</em>
                </div>
                <div class="yd-tree__row yd-tree__row--child">
                  <span class="yd-tree__label">Запросы с явным намерением</span>
                  <em class="yd-status yd-status--ok">Собрано</em>
                </div>
                <div class="yd-tree__row yd-tree__row--child">
                  <span class="yd-tree__label">Городские уточнения</span>
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
                <p class="yd-ad-draft__url">example.kz › astana-service</p>
                <p class="yd-ad-draft__title">Запись / выезд по Астане — пример</p>
                <p class="yd-ad-draft__desc">Учебный текст без цифр клиента и без обещаний по заявкам.</p>
              </div>
            </div>
            <p class="yd-artifact__note">Макет показывает, как выглядит локальный контур. Реальные названия и цифры клиента не используются.</p>
          </article>

          <article class="yd-artifact yd-artifact--flow">
            <span class="yd-demo-label">Демо</span>
            <h3 class="yd-artifact__title">События, которые считаем обращением</h3>
            <div class="yd-artifact__cols" aria-hidden="true">
              <ul class="yd-mini-list">
                <li><span>Отправка заявки</span><em class="yd-status yd-status--ok">Учёт</em></li>
                <li><span>Тап по номеру</span><em class="yd-status yd-status--ok">Учёт</em></li>
                <li><span>Переход в WhatsApp</span><em class="yd-status yd-status--warn">По брифу</em></li>
              </ul>
              <ul class="yd-mini-list">
                <li><span>Код Метрики</span><em class="yd-status yd-status--ok">На сайте</em></li>
                <li><span>Условия цели</span><em class="yd-status yd-status--ok">Согласованы</em></li>
                <li><span>Повторные срабатывания</span><em class="yd-status yd-status--warn">Смотрим</em></li>
              </ul>
            </div>
            <p class="yd-artifact__note">Список событий берём из фактического сценария сайта. Это не клиентский отчёт.</p>
          </article>

          <article class="yd-artifact yd-artifact--flow">
            <span class="yd-demo-label">Схема без клиентских данных</span>
            <h3 class="yd-artifact__title">Путь от клика до ответа менеджера</h3>
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
              <p>Иллюстрация динамики · без чисел</p>
              <svg viewBox="0 0 160 56" focusable="false" aria-hidden="true" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="ydAstChartFill2" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stop-color="#FC3F1D" stop-opacity="0.22"/>
                    <stop offset="100%" stop-color="#FC3F1D" stop-opacity="0"/>
                  </linearGradient>
                </defs>
                <path d="M0 36 C28 32, 40 22, 58 24 C78 27, 90 14, 112 16 C130 18, 142 10, 160 12 L160 56 L0 56 Z" fill="url(#ydAstChartFill2)"/>
                <path d="M0 36 C28 32, 40 22, 58 24 C78 27, 90 14, 112 16 C130 18, 142 10, 160 12" fill="none" stroke="#FC3F1D" stroke-width="2.2" stroke-linecap="round"/>
              </svg>
            </div>
            <p class="yd-artifact__note">Лимиты расхода задаём в кабинете. Передачу в CRM подключаем, когда технически готовы сайт и отдел продаж.</p>
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
                  <li>Чистка запросов Поиска</li>
                  <li>Сверка гео Астаны</li>
                  <li>Проверка событий Метрики</li>
                </ul>
              </div>
              <div>
                <p class="yd-report-grid__label">Нашли</p>
                <ul>
                  <li>Слишком широкие фразы</li>
                  <li>Форма неудобна на телефоне</li>
                  <li>Смешение ru/kk в одной группе</li>
                </ul>
              </div>
              <div>
                <p class="yd-report-grid__label">Дальше</p>
                <ul>
                  <li>Новые локальные группы</li>
                  <li>Правка заголовков</li>
                  <li>Корректировка лимитов</li>
                </ul>
              </div>
            </div>
            <p class="yd-artifact__note">Сводка фиксирует действия и риски. Здесь нет придуманных заявок, CPL и ROAS.</p>
          </article>
        </div>

        <div class="yd-control-follow">
          <ul class="yd-check-list">
            <li>Владелец кабинета — клиент</li>
            <li>Доступ агентства выдаётся и отзывается по договорённости</li>
            <li>История объявлений и настроек остаётся у владельца</li>
            <li>Карты и платёжные данные не передаются в обход клиента</li>
            <li>Расход и статусы кампаний доступны в интерфейсе Директа</li>
            <li>События Метрики согласованы до старта показов</li>
            <li>Сводка содержит работы и план, без гарантий по заявкам</li>
          </ul>
          <p class="yd-disclaimer">Объём обращений из Астаны зависит от спроса в Яндексе, предложения, сайта, бюджета, конкуренции и того, как быстро отвечают на звонки и заявки. Гарантированный поток лидов и фиксированный CPL без разбора ниши не обещаем.</p>
        </div>
      </div>
    </section>

    `;

const landing = `<section class="rk-section" id="landing-analytics">
      <div class="rk-container yd-prose">
        <h2 class="rk-h2">Посадочная страница и обработка обращений</h2>
        <p>Клиент из Астаны чаще доходит до заявки на телефоне: важны короткий оффер, крупная кнопка звонка, рабочая форма и понятный следующий шаг. Если страница отвечает на другой запрос или тормозит, сначала правим точку входа или собираем отдельные URL под группы. Разработка — в разделе <a href="/web-studiya/sozdanie-saitov/">создание сайтов</a>.</p>
        <p>Метрика нужна, чтобы видеть, дошло ли обращение. Без событий оптимизация сводится к кликам. Когда сайт готов, связываем источник с CRM и скоростью ответа менеджера. Многоканальный сбор заявок — на странице <a href="/web-studiya/lidogeneratsiya/">лидогенерации</a>; органический спрос закрывает <a href="/web-studiya/seo-prodvizhenie/">SEO-продвижение</a>.</p>
      </div>
    </section>

    `;

const process = `<section class="rk-section" id="process">
      <div class="rk-container">
        <h2 class="rk-h2">Как запускаем удалённо</h2>
        <ol class="yd-timeline">
          <li class="yd-timeline__item">
            <h3>Вводные и доступы</h3>
            <p>Получаем описание услуг, зоны Астаны, рамку медиабюджета и примеры качественных обращений. Подключаемся к кабинету Директа и Метрике клиента.</p>
          </li>
          <li class="yd-timeline__item">
            <h3>Исследование и каркас</h3>
            <p>Собираем фразы, минус-листы и группы. Раскладываем Поиск, сеть и возврат по задачам; языки проверяем отдельно, если есть спрос на kk.</p>
          </li>
          <li class="yd-timeline__item">
            <h3>Настройка и сверка</h3>
            <p>Готовим объявления, события, географию столицы, расписание и устройства. Сверяем посадочные и лимиты до модерации.</p>
          </li>
          <li class="yd-timeline__item">
            <h3>Старт показов</h3>
            <p>Включаем кампании после прохождения модерации и проверки целей. Срок зависит от готовности материалов — календарный дедлайн не фиксируем заранее.</p>
          </li>
          <li class="yd-timeline__item">
            <h3>Ведение цикла</h3>
            <p>Чистим слабые связки, усиливаем рабочие группы по Астане и передаём сводку с планом на следующий период.</p>
          </li>
        </ol>
      </div>
    </section>

    `;

html = replaceBetween(html, '<section class="rk-section" id="setup">', '<section class="rk-section" id="control">', setup);
html = replaceBetween(html, '<section class="rk-section" id="control">', '<section class="rk-section" id="decision">', control);
html = replaceBetween(html, '<section class="rk-section" id="landing-analytics">', '<section class="rk-section" id="process">', landing);
html = replaceBetween(html, '<section class="rk-section" id="process">', '<section class="ctx-cta-band"', process);

const swaps = [
  [
    'Набор зависит от спроса, длины сделки и готовности сайта. Ниже — форматы, с которыми работаем в Директе.',
    'Выбираем форматы под длину сделки и готовность сайта. Для Астаны чаще стартуем с Поиска, а сеть и возврат подключаем отдельно.',
  ],
  [
    'Текстовые объявления по коммерческим фразам с локальными уточнениями. База для услуг с явным намерением оставить обращение.',
    'Объявления в выдаче по запросам с коммерческим намерением и городскими формулировками. Основной канал для заявок и звонков.',
  ],
  [
    'Показы на площадках сети. Используем для охвата и возврата интереса; бюджет ведём отдельно от Поиска.',
    'Показы вне поисковой выдачи. Подключаем, когда нужен дополнительный контакт с аудиторией города; расход учитываем отдельно.',
  ],
  [
    'Повторный контакт с посетителями сайта и незавершёнными заявками при настроенных целях Метрики.',
    'Возвращаем тех, кто уже открывал сайт или начинал заявку, но не завершил шаг — при рабочих событиях Метрики.',
  ],
  [
    'Объявления из фида и динамическая подстановка оффера. Нужны актуальные цены, наличие и рабочие карточки.',
    'Товарные и динамические связки при готовом фиде, актуальных ценах и карточках с доставкой или самовывозом по городу.',
  ],
  [
    'Визуальные блоки с товарами для тех, кто смотрел ассортимент. Собираем при готовом фиде.',
    'Визуальные блоки по просмотренным товарам. Имеет смысл после настройки фида и посадочных карточек.',
  ],
  [
    'Баннеры и видео при согласованных креативах. Подключаем, когда нише нужен визуальный контакт до запроса.',
    'Баннеры и видео после согласования креативов — если задаче нужен визуальный контакт до поискового запроса.',
  ],
  [
    'Работа агентства начинается от 120 000 ₸ в месяц. Сумма зависит от числа кампаний, объёма фраз, РСЯ и глубины Метрики. Медиабюджет Яндекс Директа оплачивается отдельно в кабинете клиента.',
    'Ведение начинается от 120 000 ₸ в месяц. Итог зависит от числа направлений в Астане, объёма фраз, сети и глубины аналитики. Бюджет на клики клиент вносит в свой кабинет отдельно.',
  ],
  [
    'Да. Без Метрики и согласованных целей Директ показывает клики и расход, но не обращение. Счётчик и цели формы, звонка или мессенджера настраиваем до запуска, чтобы оптимизация опиралась на действия, а не только на CTR.',
    'Да. Иначе видим клики и расход, но не понимаем, было ли обращение. Счётчик и события формы, звонка или мессенджера готовим до старта, чтобы править кампании по действиям, а не только по CTR.',
  ],
];

for (const [from, to] of swaps) {
  if (!html.includes(from)) console.warn('missing swap:', from.slice(0, 60));
  html = html.split(from).join(to);
}

// Sync FAQ schema answer for Q1 and Metrika FAQ if present in JSON-LD
html = html.replace(
  /("name":"Сколько стоит настройка и ведение Яндекс Директа в Астане\?","acceptedAnswer":\{"@type":"Answer","text":")([^"]+)("\})/,
  `$1Ведение начинается от 120 000 ₸ в месяц. Итог зависит от числа направлений в Астане, объёма фраз, сети и глубины аналитики. Бюджет на клики клиент вносит в свой кабинет отдельно.$3`
);
html = html.replace(
  /("name":"Обязательна ли Яндекс Метрика\?","acceptedAnswer":\{"@type":"Answer","text":")([^"]+)("\})/,
  `$1Да. Иначе видим клики и расход, но не понимаем, было ли обращение. Счётчик и события формы, звонка или мессенджера готовим до старта, чтобы править кампании по действиям, а не только по CTR.$3`
);

fs.writeFileSync(path, html);
console.log('OK size', fs.statSync(path).size);
