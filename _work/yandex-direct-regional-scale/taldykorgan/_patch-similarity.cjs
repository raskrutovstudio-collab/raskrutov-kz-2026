/**
 * Uniqueness patch for taldykorgan vs kostanay / kokshetau / turkestan.
 * Task: TASK-20260821-155927
 */
const fs = require("fs");
const path = require("path");
const OUT = path.join(
  "site_mirror/web-studiya/kontekstnaya-reklama/yandex-direct/taldykorgan/index.html"
);
let h = fs.readFileSync(OUT, "utf8");

function replaceBetween(html, startMarker, endMarker, newInner) {
  const i = html.indexOf(startMarker);
  if (i < 0) throw new Error("start not found: " + startMarker.slice(0, 60));
  const j = html.indexOf(endMarker, i + startMarker.length);
  if (j < 0) throw new Error("end not found");
  return html.slice(0, i + startMarker.length) + newInner + html.slice(j);
}

// Turkestan / shared long dup in short-answer
h = h.replace(
  "Отдача зависит от плотности интереса в Яндексе, ясности оффера, удобства сайта, потолка расхода и скорости ответа менеджера. Объём заявок до аудита ниши не прогнозируем.",
  "Итог складывается из силы локального спроса в Яндексе, ясности предложения на сайте, потолка расхода и того, насколько быстро менеджер берёт трубку. Число заявок до аудита ниши не прогнозируем."
);

// Audience KK card
h = h.replace(
  `<h3>Казахскоязычный спрос</h3>
            <p>Если есть живой KK-трафик и страница на kk, поднимаем отдельную ветку: собственные ключи, тексты и минус-лист без кальки с RU-набора.</p>`,
  `<h3>Казахскоязычный спрос</h3>
            <p>При устойчивых KK-запросах и посадочной на kk собираем самостоятельную ветку: отдельная семантика, свои объявления и минус-слова. Прямой перевод RU-списка почти всегда промахивается.</p>`
);

// Local-config language card (often shared)
h = h.replace(
  `<h3 class="yd-artifact__title">Русский и казахский своими списками</h3>
            <p class="yd-artifact__note">KK-запросы ведём отдельной семантикой и отдельными текстами. Прямой перевод RU-списка почти всегда промахивается. Язык объявления, минус-слов и URL совпадает с языком запроса.</p>`,
  `<h3 class="yd-artifact__title">RU и KK — независимые наборы</h3>
            <p class="yd-artifact__note">Казахские запросы собираем отдельной семантикой и своими текстами. Калька с русского списка почти всегда промахивается. Язык объявления, минус-слов и URL совпадает с языком запроса.</p>`
);

const campInner = `
      <div class="rk-container">
        <h2 class="rk-h2">Порядок подключения форматов</h2>
        <p class="yd-section-lead">Сначала Поиск — человек уже назвал задачу. Сеть, возврат и каталог открываем, когда по Талдыкоргану накопились первые рабочие клики и события.</p>
        <div class="yd-camp-grid">
          <article class="yd-camp yd-camp--search">
            <span class="yd-camp__visual" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none" focusable="false" aria-hidden="true"><circle cx="11" cy="11" r="6.5" stroke="currentColor" stroke-width="1.8"/><path d="M16 16l4 4" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>
            </span>
            <span class="yd-camp__meta">Поиск Яндекса</span>
            <h3>Поиск</h3>
            <p>Показ в выдаче по запросу на сервис, подряд, поставку или товар с получением в Талдыкоргане. Здесь обычно появляются первые звонки и анкеты.</p>
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
            <p>Работают от фида: название, цена, наличие. Имеет смысл при свежей выгрузке и понятных условиях самовывоза или доставки по Талдыкоргану.</p>
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
            <p>Баннеры и видео по согласованным макетам. Уместны при длинном выборе подрядчика или поставщика, когда бренд нужно показать заранее.</p>
          </article>
        </div>
      </div>
    `;
h = replaceBetween(h, '<section class="rk-section" id="campaign-types">', '<section class="rk-section" id="setup">', campInner);

const setupInner = `
      <div class="rk-container">
        <h2 class="rk-h2">Что входит в ежемесячный гонорар</h2>
        <p class="yd-section-lead">Гонорар покрывает первичную сборку под Талдыкорган и ежемесячное ведение. Клики и показы оплачивает владелец аккаунта со своего баланса. Правки сайта, товарный фид и CRM-интеграцию выносим отдельной сметой, если без них нельзя поймать обращение.</p>
        <ul class="yd-scope-list">
          <li class="yd-scope-list__item">
            <span class="yd-scope-list__icon" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" focusable="false" aria-hidden="true"><circle cx="11" cy="11" r="6.5" stroke="currentColor" stroke-width="1.8"/><path d="M16 16l4 4" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg></span>
            <div><h3>Спрос города</h3><p>Смотрим, какими формулировками в Яндексе ищут ваши услуги в Талдыкоргане и закрывает ли посадочная эти запросы.</p></div>
          </li>
          <li class="yd-scope-list__item">
            <span class="yd-scope-list__icon" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" focusable="false" aria-hidden="true"><path d="M4 6h16M4 12h10M4 18h13" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg></span>
            <div><h3>Карта семантики</h3><p>Раскладываем городской сервис, подряд, розницу и агропоставки на RU и KK, сверяем с текстом сайта. Места, где страница отвечает мимо, отмечаем до сборки.</p></div>
          </li>
          <li class="yd-scope-list__item">
            <span class="yd-scope-list__icon" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" focusable="false" aria-hidden="true"><path d="M5 7h14M5 12h10M5 17h12" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg></span>
            <div><h3>Правила до сборки</h3><p>Письменно фиксируем критерий заявки, очередь форматов и радиус выезда по городу и Жетысу; отдельно — решение по Алматы.</p></div>
          </li>
          <li class="yd-scope-list__item">
            <span class="yd-scope-list__icon" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" focusable="false" aria-hidden="true"><circle cx="12" cy="12" r="8" stroke="currentColor" stroke-width="1.8"/><path d="M8 12h8" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg></span>
            <div><h3>Минус-контур</h3><p>Готовим минус-листы под справочные и южные мегаполисные формулировки, когда задача — только Талдыкорган и согласованные зоны Жетысу.</p></div>
          </li>
          <li class="yd-scope-list__item">
            <span class="yd-scope-list__icon" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" focusable="false" aria-hidden="true"><rect x="4" y="5" width="16" height="14" rx="2" stroke="currentColor" stroke-width="1.8"/><path d="M8 9h8M8 13h5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg></span>
            <div><h3>Лексика направлений</h3><p>Подбираем коммерческие ключи, городские маркеры и лексику сервиса, подряда и поставок. RU и KK списки ведём независимо.</p></div>
          </li>
          <li class="yd-scope-list__item">
            <span class="yd-scope-list__icon" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" focusable="false" aria-hidden="true"><path d="M5 19V5h14v10H9l-4 4z" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/></svg></span>
            <div><h3>Минус-слова</h3><p>Режем справочные запросы, вакансии, названия пунктов области вне карты обслуживания и лишний интерес к Алматы.</p></div>
          </li>
          <li class="yd-scope-list__item">
            <span class="yd-scope-list__icon" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" focusable="false" aria-hidden="true"><circle cx="12" cy="12" r="8" stroke="currentColor" stroke-width="1.8"/><path d="M12 8v4l3 2" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg></span>
            <div><h3>Тексты объявлений</h3><p>Пишем формулировки под конкретный оффер и URL раздела, чтобы сразу было ясно, что можно заказать в Талдыкоргане.</p></div>
          </li>
          <li class="yd-scope-list__item">
            <span class="yd-scope-list__icon" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" focusable="false" aria-hidden="true"><path d="M4 19V5M4 19h16" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/><path d="M8 15v-5M12 15V7M16 15v-3" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg></span>
            <div><h3>Схема кабинета</h3><p>Поиск, сеть, возврат и товарные форматы держим разными кампаниями. Расход на область и Алматы выносим отдельными строками при необходимости.</p></div>
          </li>
          <li class="yd-scope-list__item">
            <span class="yd-scope-list__icon" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" focusable="false" aria-hidden="true"><rect x="4" y="4" width="16" height="16" rx="2" stroke="currentColor" stroke-width="1.8"/><path d="M8 12h8M12 8v8" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg></span>
            <div><h3>Объявления и расширения</h3><p>Каждой группе — свой заголовок и URL раздела. Быстрые ссылки, уточнения и визитку закрываем до модерации.</p></div>
          </li>
          <li class="yd-scope-list__item">
            <span class="yd-scope-list__icon" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" focusable="false" aria-hidden="true"><path d="M12 4v16M7 9l5-5 5 5M7 15l5 5 5-5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg></span>
            <div><h3>Гео, часы, устройства</h3><p>Закрепляем Талдыкорган, точечно добавляем пункты Жетысу, подстраиваем окно под приём звонков; приоритет — смартфоны.</p></div>
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
            <li>Сравнение Директа и Google Ads для города — на странице <a href="/web-studiya/kontekstnaya-reklama/taldykorgan/">контекстной рекламы в Талдыкоргане</a>.</li>
          </ul>
        </div>
      </div>
    `;
h = replaceBetween(h, '<section class="rk-section" id="setup">', '<section class="rk-section" id="control">', setupInner);

h = h.replace(
  `<h3>Усиление посадочной</h3>
            <p>Если страница отвечает мимо запроса или тормозит на телефоне, сначала чиним URL либо готовим отдельные посадочные под группы — иначе клики сгорают впустую.</p>`,
  `<h3>Усиление посадочной</h3>
            <p>Когда лендинг отвечает мимо запроса или тяжело открывается на телефоне, сначала правим URL или готовим отдельные страницы под группы. Иначе клики уходят без разговора.</p>`
);

const landInner = `
      <div class="rk-container yd-prose">
        <h2 class="rk-h2">Посадочная страница и обработка обращений</h2>
        <p>Текст объявления и первый экран должны совпадать: Талдыкорган, тип услуги, понятный способ связи. Шаблон без города и без кнопки после клика теряет часть бюджета на отказе.</p>
        <p>Метрика показывает, дошло ли обращение. Без событий оптимизация сводится к кликам. При готовом сайте связываем источник с CRM и скоростью ответа менеджера. Многоканальный сбор заявок — на странице <a href="/web-studiya/lidogeneratsiya/">лидогенерации</a>; органический спрос закрывает <a href="/web-studiya/seo-prodvizhenie/">SEO-продвижение</a>.</p>
      </div>
    `;
h = replaceBetween(h, '<section class="rk-section" id="landing-analytics">', '<section class="rk-section" id="process">', landInner);

const procInner = `
      <div class="rk-container">
        <h2 class="rk-h2">Пять шагов удалённого запуска</h2>
        <ol class="yd-timeline">
          <li class="yd-timeline__item">
            <h3>Бриф и карта покрытия</h3>
            <p>Согласуем направления, границу Талдыкоргана, пункты Жетысуской области при необходимости, решение по Алматы, рамку расхода и примеры удачных обращений. Параллельно запрашиваем гостевые доступы в Директ и Метрику.</p>
          </li>
          <li class="yd-timeline__item">
            <h3>Ключи и группы</h3>
            <p>Раскладываем ключи по направлениям и сразу готовим минус-лист. Поиск, сеть и возврат — отдельные кампании; казахская ветка собирается своим списком.</p>
          </li>
          <li class="yd-timeline__item">
            <h3>Сборка в кабинете</h3>
            <p>Готовим объявления, регион, расписание, устройства и цели. Перед модерацией повторно сверяем URL посадочных и суточный потолок.</p>
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

const faqPatches = [
  [
    "Да, если есть живой KK-спрос и посадочная на kk. Калька с русского списка обычно промахивается: формулировки другие. Ключи, тексты и минус-слова собираем самостоятельным набором.",
    "Нужна при живом KK-спросе и посадочной на kk. Русский список не копируем один в один: формулировки другие. Собираем отдельные ключи, тексты и минус-слова.",
  ],
  [
    "Тап по номеру со смартфона пишется целью так же, как отправка анкеты — источник звонка читается в отчётах. Без счётчика видны лишь клики и списания. События описываем до включения показов.",
    "Звонок с мобильного через тап по номеру учитывается целью так же, как отправка формы — источник виден в отчётах. Без счётчика остаются клики и списания. События описываем до старта показов.",
  ],
  [
    "Срок зависит от готовности сайта, скорости доступов и объёма семантики. Сначала согласуем структуру, дальше — модерация и проверка целей. Дату «день в день» заранее не ставим: модерация платформы от нас не зависит.",
    "Время зависит от готовности сайта, скорости доступов и объёма семантики. Сначала согласуем структуру, затем модерация и проверка целей. Календарную дату «день в день» заранее не фиксируем: модерация платформы вне нашего контроля.",
  ],
  [
    "Поиск ловит уже сформулированный запрос на услугу, поставку, подряд или товар с выдачей в Талдыкоргане — путь до звонка короче. Сеть возвращает тех, кто уже был на сайте. Бюджеты форматов держим раздельными, чтобы читать расход.",
    "Поиск ловит человека, который уже сформулировал задачу по услуге, поставке, подряду или товару с выдачей в Талдыкоргане — до звонка ближе. Сеть возвращает посетителей сайта. Бюджеты форматов разделяем, чтобы читать расход.",
  ],
  [
    "Чаще остаёмся в текущем кабинете: история помогает стратегиям. Слабое режем, рабочее перекладываем под контур Талдыкоргана. Новый аккаунт — редкий случай, например при потере доступа.",
    "В большинстве проектов остаёмся в текущем кабинете: история помогает стратегиям. Слабые связки отключаем, рабочие переносим под контур Талдыкоргана. Новый аккаунт нужен редко — например при потере доступа.",
  ],
  [
    "Отдельный URL полезен, если условия по городу отличаются или направлений несколько. Если общая страница уже называет Талдыкорган, цены и контакты и совпадает с объявлением — её хватает. Анкету и кнопку звонка проверяем со смартфона до старта.",
    "Отдельный URL имеет смысл, когда условия по городу отличаются или направлений несколько. Если общая страница уже называет Талдыкорган, цены и контакты и совпадает с объявлением — её достаточно. Анкету и кнопку звонка проверяем со смартфона до старта.",
  ],
  [
    "Сопровождение кабинета — от 120 000 тенге в месяц. Сумма растёт с числом направлений, объёмом семантики и составом форматов. Оплату кликов клиент держит на своём балансе, отдельно от гонорара агентства.",
    "Гонорар за ведение — от 120 000 тенге в месяц. Он растёт с числом направлений, объёмом семантики и составом форматов. Медиабюджет на клики клиент держит на своём балансе, отдельно от оплаты агентства.",
  ],
];
for (const [a, b] of faqPatches) {
  if (!h.includes(a)) console.warn("FAQ patch miss:", a.slice(0, 70));
  h = h.replaceAll(a, b);
}

h = h.replace(
  "Аккаунт оформлен на рекламодателя. Агентство входит гостевым доступом и ведёт кампании из Петропавловска. Владелец видит настройки, лимиты и расход; платёжную карту привязывает сам. Цели и суточный потолок согласуем до первого показа.",
  "Кабинет оформлен на рекламодателя. Мы заходим гостевым доступом и ведём кампании из Петропавловска. Владелец видит настройки, лимиты и расход; платёжную карту привязывает сам. Цели и суточный потолок согласуем до первого показа."
);

h = h.replace(
  /Сколько обращений придёт из Талдыкоргана[\s\S]*?не обещаем\./,
  "Число обращений из Талдыкоргана зависит от спроса в Яндексе, оффера, сайта, бюджета, конкуренции и скорости ответа на звонки и заявки. Гарантированный поток лидов и фиксированный CPL без разбора ниши не обещаем."
);

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
h = h.replace(
  "Учебный макет деления аккаунта. Живые клиентские кабинеты сюда не переносим.",
  "Учебный макет структуры аккаунта. Живые клиентские кабинеты сюда не переносим."
);

// Soften remaining shared process step 2 if still matching
h = h.replace(
  "Раскладываем ключи по направлениям и сразу готовим минус-лист. Поиск, сеть и возврат — отдельные кампании; казахская ветка собирается своим списком.",
  "Ключи группируем по направлениям и параллельно собираем минус-лист. Поиск, сеть и возврат держим разными кампаниями; KK-ветку собираем отдельным списком."
);

fs.writeFileSync(OUT, h);
console.log("patched", OUT);
