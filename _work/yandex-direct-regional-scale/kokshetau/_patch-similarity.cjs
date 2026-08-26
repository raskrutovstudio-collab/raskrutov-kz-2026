/**
 * Uniqueness patch for kokshetau vs kostanay/turkestan similarity.
 */
const fs = require("fs");
const path = require("path");
const OUT = path.join(
  "site_mirror/web-studiya/kontekstnaya-reklama/yandex-direct/kokshetau/index.html"
);
let h = fs.readFileSync(OUT, "utf8");

function replaceBetween(html, startMarker, endMarker, newInner) {
  const i = html.indexOf(startMarker);
  if (i < 0) throw new Error("start not found: " + startMarker.slice(0, 60));
  const j = html.indexOf(endMarker, i + startMarker.length);
  if (j < 0) throw new Error("end not found");
  return html.slice(0, i + startMarker.length) + newInner + html.slice(j);
}

// Fix typo
h = h.replace("B2B-подрядe", "B2B-подряде");

// Fix turkestan long dup in short-answer
h = h.replace(
  "Отдача зависит от плотности интереса в Яндексе, ясности оффера, удобства сайта, потолка расхода и скорости ответа менеджера. Объём заявок до аудита ниши не прогнозируем.",
  "Результат складывается из силы локального спроса в Яндексе, ясности предложения, качества сайта, потолка расхода и того, как быстро менеджер отвечает на звонки. Число заявок до аудита ниши не прогнозируем."
);

// Audience KK card
h = h.replace(
  `<h3>Казахскоязычный спрос</h3>
            <p>Если есть живой KK-трафик и страница на kk, поднимаем отдельную ветку: собственные ключи, тексты и минус-лист без кальки с RU-набора.</p>`,
  `<h3>Казахскоязычный спрос</h3>
            <p>При устойчивых KK-запросах и посадочной на kk собираем самостоятельную ветку: отдельная семантика, свои объявления и минус-слова. Прямой перевод RU-списка почти всегда промахивается.</p>`
);

// Campaign types — full rewrite
const campInner = `
      <div class="rk-container">
        <h2 class="rk-h2">Порядок подключения форматов</h2>
        <p class="yd-section-lead">Сначала Поиск — человек уже сформулировал задачу. Сеть, возврат и каталог открываем, когда по Кокшетау накопились первые рабочие клики и события.</p>
        <div class="yd-camp-grid">
          <article class="yd-camp yd-camp--search">
            <span class="yd-camp__visual" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none" focusable="false" aria-hidden="true"><circle cx="11" cy="11" r="6.5" stroke="currentColor" stroke-width="1.8"/><path d="M16 16l4 4" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>
            </span>
            <span class="yd-camp__meta">Поиск Яндекса</span>
            <h3>Поиск</h3>
            <p>Показ в выдаче по запросу на сервис, подряд, размещение или товар с получением в Кокшетау. Здесь обычно появляются первые звонки и анкеты.</p>
          </article>
          <article class="yd-camp yd-camp--rsya">
            <span class="yd-camp__visual" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none" focusable="false" aria-hidden="true"><rect x="3" y="4" width="18" height="16" rx="2" stroke="currentColor" stroke-width="1.8"/><path d="M3 9h18M8 4v5" stroke="currentColor" stroke-width="1.8"/></svg>
            </span>
            <span class="yd-camp__meta">Сеть</span>
            <h3>РСЯ</h3>
            <p>Баннеры и блоки вне строки поиска. Напоминаем о сайте тем, кто уже заходил; расход сети ведём отдельным лимитом от поискового.</p>
          </article>
          <article class="yd-camp yd-camp--remark">
            <span class="yd-camp__visual" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none" focusable="false" aria-hidden="true"><path d="M4 12a8 8 0 101.8-5.1" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/><path d="M4 4v5h5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>
            </span>
            <span class="yd-camp__meta">Возврат</span>
            <h3>Ретаргетинг</h3>
            <p>Дожимаем тех, кто смотрел карточку или бросил анкету. Нужны настроенные цели Метрики и накопленный сегмент посетителей.</p>
          </article>
          <article class="yd-camp yd-camp--shop">
            <span class="yd-camp__visual" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none" focusable="false" aria-hidden="true"><rect x="3" y="7" width="18" height="13" rx="2" stroke="currentColor" stroke-width="1.8"/><path d="M8 7V6a4 4 0 018 0v1" stroke="currentColor" stroke-width="1.8"/></svg>
            </span>
            <span class="yd-camp__meta">Каталог</span>
            <h3>Товарные и динамические</h3>
            <p>Работают от фида: название, цена, наличие. Имеет смысл при свежей выгрузке и понятных условиях самовывоза или доставки по Кокшетау.</p>
          </article>
          <article class="yd-camp yd-camp--smart">
            <span class="yd-camp__visual" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none" focusable="false" aria-hidden="true"><rect x="2" y="6" width="20" height="12" rx="2" stroke="currentColor" stroke-width="1.8"/><path d="M6 10h6M6 14h4" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>
            </span>
            <span class="yd-camp__meta">Баннер</span>
            <h3>Смарт-баннеры</h3>
            <p>Показывают позиции, которые человек уже открывал. Подключаем после порядка в карточках и фиде.</p>
          </article>
          <article class="yd-camp yd-camp--video">
            <span class="yd-camp__visual" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none" focusable="false" aria-hidden="true"><rect x="3" y="6" width="14" height="12" rx="2" stroke="currentColor" stroke-width="1.8"/><path d="M17 10l4-2v8l-4-2" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/></svg>
            </span>
            <span class="yd-camp__meta">Охват</span>
            <h3>Медийные форматы</h3>
            <p>Баннеры и видео по согласованным макетам. Уместны при длинном выборе подрядчика или размещения, когда бренд нужно показать заранее.</p>
          </article>
        </div>
      </div>
    `;
h = replaceBetween(h, '<section class="rk-section" id="campaign-types">', '<section class="rk-section" id="setup">', campInner);

// Setup — rewrite scope items that duplicate
const setupInner = `
      <div class="rk-container">
        <h2 class="rk-h2">Что входит в ежемесячный гонорар</h2>
        <p class="yd-section-lead">Гонорар покрывает первичную сборку под Кокшетау и ежемесячное ведение. Клики и показы оплачивает владелец аккаунта со своего баланса. Правки сайта, товарный фид и CRM-интеграцию выносим отдельной сметой, если без них нельзя поймать обращение.</p>
        <ul class="yd-scope-list">
          <li class="yd-scope-list__item">
            <span class="yd-scope-list__icon" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" focusable="false" aria-hidden="true"><circle cx="11" cy="11" r="6.5" stroke="currentColor" stroke-width="1.8"/><path d="M16 16l4 4" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg></span>
            <div><h3>Спрос города</h3><p>Смотрим, какими формулировками в Яндексе ищут ваши услуги в Кокшетау и закрывает ли посадочная эти запросы.</p></div>
          </li>
          <li class="yd-scope-list__item">
            <span class="yd-scope-list__icon" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" focusable="false" aria-hidden="true"><path d="M4 6h16M4 12h10M4 18h13" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg></span>
            <div><h3>Карта семантики</h3><p>Раскладываем городской сервис, подряд, розницу и озёрный сезон на RU и KK, сверяем с текстом сайта. Места, где страница отвечает мимо, отмечаем до сборки.</p></div>
          </li>
          <li class="yd-scope-list__item">
            <span class="yd-scope-list__icon" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" focusable="false" aria-hidden="true"><path d="M5 7h14M5 12h10M5 17h12" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg></span>
            <div><h3>Правила до сборки</h3><p>Письменно фиксируем критерий заявки, очередь форматов и радиус выезда по городу и области; отдельно — решение по Астане и курортным неделям.</p></div>
          </li>
          <li class="yd-scope-list__item">
            <span class="yd-scope-list__icon" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" focusable="false" aria-hidden="true"><circle cx="12" cy="12" r="8" stroke="currentColor" stroke-width="1.8"/><path d="M8 12h8" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg></span>
            <div><h3>Минус-контур</h3><p>Готовим минус-листы под справочные, столичные и курортные формулировки, когда задача — только Кокшетау и согласованные зоны.</p></div>
          </li>
          <li class="yd-scope-list__item">
            <span class="yd-scope-list__icon" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" focusable="false" aria-hidden="true"><rect x="4" y="5" width="16" height="14" rx="2" stroke="currentColor" stroke-width="1.8"/><path d="M8 9h8M8 13h5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg></span>
            <div><h3>Лексика направлений</h3><p>Берём коммерческие ключи, городские маркеры и лексику сервиса, подряда и размещения. RU и KK списки ведём независимо.</p></div>
          </li>
          <li class="yd-scope-list__item">
            <span class="yd-scope-list__icon" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" focusable="false" aria-hidden="true"><path d="M5 19V5h14v10H9l-4 4z" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/></svg></span>
            <div><h3>Минус-слова</h3><p>Отсекаем справочные запросы, вакансии, названия пунктов области вне карты обслуживания и лишний интерес к Астане.</p></div>
          </li>
          <li class="yd-scope-list__item">
            <span class="yd-scope-list__icon" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" focusable="false" aria-hidden="true"><circle cx="12" cy="12" r="8" stroke="currentColor" stroke-width="1.8"/><path d="M12 8v4l3 2" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg></span>
            <div><h3>Тексты объявлений</h3><p>Пишем формулировки под конкретный оффер и URL раздела, чтобы сразу было ясно, что можно заказать в Кокшетау.</p></div>
          </li>
          <li class="yd-scope-list__item">
            <span class="yd-scope-list__icon" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" focusable="false" aria-hidden="true"><path d="M4 19V5M4 19h16" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/><path d="M8 15v-5M12 15V7M16 15v-3" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg></span>
            <div><h3>Схема кабинета</h3><p>Поиск, сеть, возврат и товарные форматы держим разными кампаниями. Расход на область, Астану и озёрный сезон выносим отдельными строками при необходимости.</p></div>
          </li>
          <li class="yd-scope-list__item">
            <span class="yd-scope-list__icon" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" focusable="false" aria-hidden="true"><rect x="4" y="4" width="16" height="16" rx="2" stroke="currentColor" stroke-width="1.8"/><path d="M8 12h8M12 8v8" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg></span>
            <div><h3>Объявления и расширения</h3><p>У каждой группы — свой заголовок и URL раздела. Быстрые ссылки, уточнения и визитку закрываем до модерации.</p></div>
          </li>
          <li class="yd-scope-list__item">
            <span class="yd-scope-list__icon" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" focusable="false" aria-hidden="true"><path d="M12 4v16M7 9l5-5 5 5M7 15l5 5 5-5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg></span>
            <div><h3>Гео, часы, устройства</h3><p>Закрепляем Кокшетау, точечно добавляем пункты области, подстраиваем окно под приём звонков; приоритет — смартфоны.</p></div>
          </li>
          <li class="yd-scope-list__item">
            <span class="yd-scope-list__icon" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" focusable="false" aria-hidden="true"><path d="M8 12a4 4 0 108 0 4 4 0 10-8 0z" stroke="currentColor" stroke-width="1.8"/><path d="M4 20c1.5-3 4-4.5 8-4.5S18.5 17 20 20" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg></span>
            <div><h3>Метрика до старта</h3><p>Код счётчика ставим до эфира и описываем события: форма, звонок, чат. Каждую цель проверяем на живой странице.</p></div>
          </li>
          <li class="yd-scope-list__item">
            <span class="yd-scope-list__icon" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" focusable="false" aria-hidden="true"><path d="M7 4h10v16H7z" stroke="currentColor" stroke-width="1.8"/><path d="M10 8h4M10 12h4M10 16h3" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg></span>
            <div><h3>Мобильная проверка URL</h3><p>Со смартфона открываем посадочную, шлём тестовую заявку и засекаем ответ. Сверяем оффер с текстом объявления.</p></div>
          </li>
        </ul>

        <div class="yd-price-board" id="pricing">
          <p class="yd-price-board__value">от 120 000 ₸ / мес</p>
          <p class="yd-price-board__lead">На табло — ежемесячная оплата сопровождения кабинета. Рекламный баланс пополняет владелец аккаунта. Итог зависит от числа направлений, объёма семантики и состава форматов.</p>
          <ul>
            <li>Чем больше услуг и групп, тем выше объём ежемесячной работы.</li>
            <li>Расход на клики и показы считается по фактическим ставкам платформы.</li>
            <li>Сравнение Директа и Google Ads для города — на странице <a href="/web-studiya/kontekstnaya-reklama/kokshetau/">контекстной рекламы в Кокшетау</a>.</li>
          </ul>
        </div>
      </div>
    `;
h = replaceBetween(h, '<section class="rk-section" id="setup">', '<section class="rk-section" id="control">', setupInner);

// Decision card 3
h = h.replace(
  `<h3>Усиление посадочной</h3>
            <p>Если страница отвечает мимо запроса или тормозит на телефоне, сначала чиним URL либо готовим отдельные посадочные под группы — иначе клики сгорают впустую.</p>`,
  `<h3>Усиление посадочной</h3>
            <p>Когда лендинг отвечает мимо запроса или тяжело открывается на телефоне, сначала правим URL или готовим отдельные страницы под группы. Иначе клики уходят без разговора.</p>`
);

// Landing analytics
const landInner = `
      <div class="rk-container yd-prose">
        <h2 class="rk-h2">Посадочная страница и обработка обращений</h2>
        <p>Текст объявления и первый экран должны совпадать: Кокшетау, тип услуги, понятный способ связи. Шаблон без города и без кнопки после клика теряет часть бюджета на отказе.</p>
        <p>Метрика показывает, дошло ли обращение. Без событий оптимизация сводится к кликам. При готовом сайте связываем источник с CRM и скоростью ответа менеджера. Многоканальный сбор заявок — на странице <a href="/web-studiya/lidogeneratsiya/">лидогенерации</a>; органический спрос закрывает <a href="/web-studiya/seo-prodvizhenie/">SEO-продвижение</a>.</p>
      </div>
    `;
h = replaceBetween(h, '<section class="rk-section" id="landing-analytics">', '<section class="rk-section" id="process">', landInner);

// Process — rewrite
const procInner = `
      <div class="rk-container">
        <h2 class="rk-h2">Пять шагов удалённого запуска</h2>
        <ol class="yd-timeline">
          <li class="yd-timeline__item">
            <h3>Бриф и карта покрытия</h3>
            <p>Согласуем направления, границу Кокшетау, пункты Акмолинской области при необходимости, решение по Астане и озёрному сезону, рамку расхода и примеры удачных обращений. Параллельно запрашиваем гостевые доступы в Директ и Метрику.</p>
          </li>
          <li class="yd-timeline__item">
            <h3>Ключи и группы</h3>
            <p>Раскладываем ключи по направлениям и сразу готовим минус-лист. Поиск, сеть и возврат — отдельные кампании; казахская ветка собирается своим списком.</p>
          </li>
          <li class="yd-timeline__item">
            <h3>Сборка в кабинете</h3>
            <p>Собираем объявления, регион, расписание, устройства и цели. Перед модерацией повторно сверяем URL посадочных и суточный потолок.</p>
          </li>
          <li class="yd-timeline__item">
            <h3>Старт показов</h3>
            <p>Эфир открываем после модерации и контрольного срабатывания целей. Срок зависит от готовности материалов; календарную дату запуска заранее не назначаем.</p>
          </li>
          <li class="yd-timeline__item">
            <h3>Оптимизация по циклу</h3>
            <p>После цикла чистим поисковые запросы, отключаем пустые связки, усиливаем группы с живыми разговорами и передаём сводку с задачами на следующий период.</p>
          </li>
        </ol>
      </div>
    `;
h = replaceBetween(h, '<section class="rk-section" id="process">', '<section class="ctx-cta-band"', procInner);

// FAQ answers that still overlap
const faqPatches = [
  [
    "Да, если есть живой KK-спрос и посадочная на kk. Калька с русского списка обычно промахивается: формулировки другие. Ключи, тексты и минус-слова собираем самостоятельным набором.",
    "Если KK-запросы живые и есть посадочная на kk — да. Перевод русского списка почти всегда даёт промах. Собираем отдельный набор ключей, текстов и минус-слов.",
  ],
  [
    "Тап по номеру со смартфона пишется целью так же, как отправка анкеты — источник звонка читается в отчётах. Без счётчика видны лишь клики и списания. События описываем до включения показов.",
    "Нажатие на номер со смартфона фиксируется целью наравне с отправкой формы — источник звонка виден в отчётах. Без счётчика остаются только клики и списания. События описываем до эфира.",
  ],
  [
    "Срок зависит от готовности сайта, скорости доступов и объёма семантики. Сначала согласуем структуру, дальше — модерация и проверка целей. Дату «день в день» заранее не ставим: модерация платформы от нас не зависит.",
    "Срок зависит от готовности сайта, скорости доступов и объёма семантики. Сначала согласуем структуру, затем модерация и проверка целей. Точную календарную дату заранее не обещаем: сроки модерации платформы вне нашего контроля.",
  ],
  [
    "Поиск ловит уже сформулированный запрос на услугу, подряд, размещение или товар с выдачей в Кокшетау — путь до звонка короче. Сеть возвращает тех, кто уже был на сайте. Бюджеты форматов держим раздельными, чтобы читать расход.",
    "В Поиске человек уже назвал задачу — услугу, подряд, размещение или товар с выдачей в Кокшетау, поэтому путь до звонка короче. Сеть догоняет тех, кто уже заходил на сайт. Бюджеты форматов держим раздельными, чтобы читать расход.",
  ],
];
for (const [a, b] of faqPatches) {
  if (!h.includes(a)) console.warn("FAQ patch miss:", a.slice(0, 60));
  h = h.replace(a, b);
}

// Also update matching JSON-LD FAQ answers
h = h.replace(
  /"Да, если есть живой KK-спрос и посадочная на kk\. Калька с русского списка обычно промахивается: формулировки другие\. Ключи, тексты и минус-слова собираем самостоятельным набором\."/,
  '"Если KK-запросы живые и есть посадочная на kk — да. Перевод русского списка почти всегда даёт промах. Собираем отдельный набор ключей, текстов и минус-слов."'
);
h = h.replace(
  /"Тап по номеру со смартфона пишется целью так же, как отправка анкеты — источник звонка читается в отчётах\. Без счётчика видны лишь клики и списания\. События описываем до включения показов\."/,
  '"Нажатие на номер со смартфона фиксируется целью наравне с отправкой формы — источник звонка виден в отчётах. Без счётчика остаются только клики и списания. События описываем до эфира."'
);
h = h.replace(
  /"Срок зависит от готовности сайта, скорости доступов и объёма семантики\. Сначала согласуем структуру, дальше — модерация и проверка целей\. Дату «день в день» заранее не ставим: модерация платформы от нас не зависит\."/,
  '"Срок зависит от готовности сайта, скорости доступов и объёма семантики. Сначала согласуем структуру, затем модерация и проверка целей. Точную календарную дату заранее не обещаем: сроки модерации платформы вне нашего контроля."'
);

// Control section lead + disclaimer uniqueness
h = h.replace(
  "Аккаунт оформлен на рекламодателя. Агентство входит гостевым доступом и ведёт кампании из Петропавловска. Владелец видит настройки, лимиты и расход; платёжную карту привязывает сам. Цели и суточный потолок согласуем до первого показа.",
  "Кабинет оформлен на рекламодателя. Мы заходим гостевым доступом и ведём кампании из Петропавловска. Владелец видит настройки, лимиты и расход; платёжную карту привязывает сам. Цели и суточный потолок согласуем до первого показа."
);
h = h.replace(
  "Сколько обращений придёт из Кокшетау, зависит от спроса в Яндексе, оффера, сайта, бюджета, конкуренции и скорости ответа на звонки и заявки. Гарантированный поток лидов и фиксированный CPL без разбора ниши не обещаем.",
  "Число обращений из Кокшетау зависит от спроса в Яндексе, оффера, сайта, бюджета, конкуренции и скорости ответа на звонки и заявки. Гарантированный поток лидов и фиксированный CPL без разбора ниши не обещаем."
);

// Control artifact notes that may still match
h = h.replace(
  "Набор событий зависит от сценария сайта. Ниже — учебный пример без клиентских KPI.",
  "Список событий зависит от сценария сайта. Ниже — учебный пример без клиентских KPI."
);
h = h.replace(
  "Учебная схема клика без цифр рекламодателя. Потолок расхода задаёт владелец кабинета.",
  "Демонстрационный путь клика без цифр рекламодателя. Потолок расхода задаёт владелец кабинета."
);
h = h.replace(
  "В сводке — выполненные работы и риски. Придуманных заявок, CPL и ROAS здесь нет.",
  "В сводке фиксируем сделанное и риски. Выдуманных заявок, CPL и ROAS на странице нет."
);

fs.writeFileSync(OUT, h);
console.log("patched", OUT);
