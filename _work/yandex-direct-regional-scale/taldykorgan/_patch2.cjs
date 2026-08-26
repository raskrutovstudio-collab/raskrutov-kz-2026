/**
 * Patch 2: differentiate Taldykorgan from kokshetau AND kostanay phrasing.
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

// Audience KK — unique vs both peers
h = h.replace(
  /<h3>Казахскоязычный спрос<\/h3>\s*<p>[^<]+<\/p>/,
  `<h3>Казахскоязычный спрос</h3>
            <p>Когда в городе есть стабильные KK-запросы и страница на kk, поднимаем отдельную линию: свои ключи, свои тексты, свой минус-лист. RU-семантику один в один не переносим.</p>`
);

const campInner = `
      <div class="rk-container">
        <h2 class="rk-h2">Как подключаем форматы Директа</h2>
        <p class="yd-section-lead">Старт с Поиска: запрос уже сформулирован. РСЯ, ретаргет и товарные форматы добавляем после первых городских данных по Талдыкоргану.</p>
        <div class="yd-camp-grid">
          <article class="yd-camp yd-camp--search">
            <span class="yd-camp__visual" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none" focusable="false" aria-hidden="true"><circle cx="11" cy="11" r="6.5" stroke="currentColor" stroke-width="1.8"/><path d="M16 16l4 4" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>
            </span>
            <span class="yd-camp__meta">Поиск Яндекса</span>
            <h3>Поиск</h3>
            <p>Объявление встречается с запросом на услугу, подряд, агропоставку или товар с выдачей в Талдыкоргане. Отсюда чаще всего идут первые звонки и формы.</p>
          </article>
          <article class="yd-camp yd-camp--rsya">
            <span class="yd-camp__visual" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none" focusable="false" aria-hidden="true"><rect x="3" y="4" width="18" height="16" rx="2" stroke="currentColor" stroke-width="1.8"/><path d="M3 9h18M8 4v5" stroke="currentColor" stroke-width="1.8"/></svg>
            </span>
            <span class="yd-camp__meta">Сеть</span>
            <h3>РСЯ</h3>
            <p>Показы на площадках вне поисковой строки. Возвращаем внимание посетителям сайта; бюджет сети держим отдельно от поискового.</p>
          </article>
          <article class="yd-camp yd-camp--remark">
            <span class="yd-camp__visual" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none" focusable="false" aria-hidden="true"><path d="M4 12a8 8 0 101.8-5.1" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/><path d="M4 4v5h5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>
            </span>
            <span class="yd-camp__meta">Возврат</span>
            <h3>Ретаргетинг</h3>
            <p>Возвращаем тех, кто смотрел карточку услуги или не завершил заявку. Нужны цели Метрики и накопленный сегмент.</p>
          </article>
          <article class="yd-camp yd-camp--shop">
            <span class="yd-camp__visual" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none" focusable="false" aria-hidden="true"><rect x="3" y="7" width="18" height="13" rx="2" stroke="currentColor" stroke-width="1.8"/><path d="M8 7V6a4 4 0 018 0v1" stroke="currentColor" stroke-width="1.8"/></svg>
            </span>
            <span class="yd-camp__meta">Каталог</span>
            <h3>Товарные и динамические</h3>
            <p>Строятся на фиде: название, цена, остаток. Имеют смысл при актуальной выгрузке и ясных условиях выдачи в Талдыкоргане.</p>
          </article>
          <article class="yd-camp yd-camp--smart">
            <span class="yd-camp__visual" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none" focusable="false" aria-hidden="true"><rect x="2" y="6" width="20" height="12" rx="2" stroke="currentColor" stroke-width="1.8"/><path d="M6 10h6M6 14h4" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>
            </span>
            <span class="yd-camp__meta">Баннер</span>
            <h3>Смарт-баннеры</h3>
            <p>Автоматически подбирают позиции, которые человек уже смотрел. Включаем, когда карточки и фид приведены в порядок.</p>
          </article>
          <article class="yd-camp yd-camp--video">
            <span class="yd-camp__visual" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none" focusable="false" aria-hidden="true"><rect x="3" y="6" width="14" height="12" rx="2" stroke="currentColor" stroke-width="1.8"/><path d="M17 10l4-2v8l-4-2" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/></svg>
            </span>
            <span class="yd-camp__meta">Охват</span>
            <h3>Медийные форматы</h3>
            <p>Баннеры и видео по согласованным креативам. Полезны при длинном цикле выбора подрядчика или поставщика.</p>
          </article>
        </div>
      </div>
    `;
h = replaceBetween(h, '<section class="rk-section" id="campaign-types">', '<section class="rk-section" id="setup">', campInner);

const setupInner = `
      <div class="rk-container">
        <h2 class="rk-h2">Состав ежемесячного гонорара</h2>
        <p class="yd-section-lead">В оплату входит первичная сборка под Талдыкорган и ежемесячное сопровождение. Клики оплачивает владелец кабинета со своего баланса. Правки сайта, фид и связку с CRM выносим в отдельную смету, если без них нельзя зафиксировать обращение.</p>
        <ul class="yd-scope-list">
          <li class="yd-scope-list__item">
            <span class="yd-scope-list__icon" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" focusable="false" aria-hidden="true"><circle cx="11" cy="11" r="6.5" stroke="currentColor" stroke-width="1.8"/><path d="M16 16l4 4" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg></span>
            <div><h3>Спрос города</h3><p>Выясняем, какими словами в Яндексе ищут ваши услуги в Талдыкоргане и где посадочная уже отвечает на запрос.</p></div>
          </li>
          <li class="yd-scope-list__item">
            <span class="yd-scope-list__icon" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" focusable="false" aria-hidden="true"><path d="M4 6h16M4 12h10M4 18h13" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg></span>
            <div><h3>Карта семантики</h3><p>Собираем городской сервис, подряд, розницу и агропоставки на RU и KK, сверяем с текстом сайта. Участки «мимо запроса» фиксируем до сборки.</p></div>
          </li>
          <li class="yd-scope-list__item">
            <span class="yd-scope-list__icon" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" focusable="false" aria-hidden="true"><path d="M5 7h14M5 12h10M5 17h12" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg></span>
            <div><h3>Правила до сборки</h3><p>На бумаге фиксируем критерий заявки, очередь форматов и радиус выезда по городу и Жетысу; отдельно решаем, включать ли Алматы.</p></div>
          </li>
          <li class="yd-scope-list__item">
            <span class="yd-scope-list__icon" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" focusable="false" aria-hidden="true"><circle cx="12" cy="12" r="8" stroke="currentColor" stroke-width="1.8"/><path d="M8 12h8" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg></span>
            <div><h3>Минус-контур</h3><p>Готовим минус-листы под справочные запросы и южные мегаполисные формулировки, если задача — только Талдыкорган и согласованные пункты области.</p></div>
          </li>
          <li class="yd-scope-list__item">
            <span class="yd-scope-list__icon" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" focusable="false" aria-hidden="true"><rect x="4" y="5" width="16" height="14" rx="2" stroke="currentColor" stroke-width="1.8"/><path d="M8 9h8M8 13h5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg></span>
            <div><h3>Лексика направлений</h3><p>Берём коммерческие ключи, городские маркеры и лексику сервиса, подряда и поставок. RU и KK списки ведём независимо.</p></div>
          </li>
          <li class="yd-scope-list__item">
            <span class="yd-scope-list__icon" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" focusable="false" aria-hidden="true"><path d="M5 19V5h14v10H9l-4 4z" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/></svg></span>
            <div><h3>Минус-слова</h3><p>Отсекаем справочные запросы, вакансии, названия пунктов вне карты обслуживания и лишний интерес к Алматы.</p></div>
          </li>
          <li class="yd-scope-list__item">
            <span class="yd-scope-list__icon" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" focusable="false" aria-hidden="true"><circle cx="12" cy="12" r="8" stroke="currentColor" stroke-width="1.8"/><path d="M12 8v4l3 2" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg></span>
            <div><h3>Тексты объявлений</h3><p>Формулировки пишем под конкретный оффер и URL раздела, чтобы сразу было понятно, что заказывают в Талдыкоргане.</p></div>
          </li>
          <li class="yd-scope-list__item">
            <span class="yd-scope-list__icon" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" focusable="false" aria-hidden="true"><path d="M4 19V5M4 19h16" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/><path d="M8 15v-5M12 15V7M16 15v-3" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg></span>
            <div><h3>Схема кабинета</h3><p>Поиск, сеть, возврат и товарные форматы — разные кампании. Расход на область и Алматы выносим отдельными строками при необходимости.</p></div>
          </li>
          <li class="yd-scope-list__item">
            <span class="yd-scope-list__icon" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" focusable="false" aria-hidden="true"><rect x="4" y="4" width="16" height="16" rx="2" stroke="currentColor" stroke-width="1.8"/><path d="M8 12h8M12 8v8" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg></span>
            <div><h3>Объявления и расширения</h3><p>У каждой группы — свой заголовок и URL. Быстрые ссылки, уточнения и визитку закрываем до модерации.</p></div>
          </li>
          <li class="yd-scope-list__item">
            <span class="yd-scope-list__icon" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" focusable="false" aria-hidden="true"><path d="M12 4v16M7 9l5-5 5 5M7 15l5 5 5-5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg></span>
            <div><h3>Гео, часы, устройства</h3><p>Фиксируем Талдыкорган, точечно добавляем пункты Жетысу, подстраиваем окно под приём звонков; приоритет — смартфоны.</p></div>
          </li>
          <li class="yd-scope-list__item">
            <span class="yd-scope-list__icon" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" focusable="false" aria-hidden="true"><path d="M8 12a4 4 0 108 0 4 4 0 10-8 0z" stroke="currentColor" stroke-width="1.8"/><path d="M4 20c1.5-3 4-4.5 8-4.5S18.5 17 20 20" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg></span>
            <div><h3>Метрика до старта</h3><p>Счётчик ставим до показов и описываем цели: анкета, звонок, открытие чата. Каждое событие проверяем на живой странице.</p></div>
          </li>
          <li class="yd-scope-list__item">
            <span class="yd-scope-list__icon" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" focusable="false" aria-hidden="true"><path d="M7 4h10v16H7z" stroke="currentColor" stroke-width="1.8"/><path d="M10 8h4M10 12h4M10 16h3" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg></span>
            <div><h3>Мобильная проверка URL</h3><p>Открываем URL с телефона, отправляем тестовую заявку и засекаем ответ. Сверяем оффер с текстом объявления.</p></div>
          </li>
        </ul>

        <div class="yd-price-board" id="pricing">
          <p class="yd-price-board__value">от 120 000 ₸ / мес</p>
          <p class="yd-price-board__lead">На табло — ежемесячный гонорар за сопровождение. Рекламный баланс пополняет владелец аккаунта. Итог зависит от числа направлений, объёма семантики и состава форматов.</p>
          <ul>
            <li>Чем больше услуг и групп, тем выше объём ежемесячной работы.</li>
            <li>Расход на клики и показы считается по фактическим ставкам платформы.</li>
            <li>Выбор между Директом и Google Ads для города — на странице <a href="/web-studiya/kontekstnaya-reklama/taldykorgan/">контекстной рекламы в Талдыкоргане</a>.</li>
          </ul>
        </div>
      </div>
    `;
h = replaceBetween(h, '<section class="rk-section" id="setup">', '<section class="rk-section" id="control">', setupInner);

const procInner = `
      <div class="rk-container">
        <h2 class="rk-h2">Удалённый запуск за пять этапов</h2>
        <ol class="yd-timeline">
          <li class="yd-timeline__item">
            <h3>Бриф и карта покрытия</h3>
            <p>Фиксируем направления бизнеса, границу Талдыкоргана, при необходимости список пунктов Жетысуской области, решение по Алматы, рамку расхода и пару примеров удачных обращений. Параллельно запрашиваем гостевые доступы в Директ и Метрику.</p>
          </li>
          <li class="yd-timeline__item">
            <h3>Ключи и группы</h3>
            <p>Семантику раскладываем по направлениям и сразу готовим минус-лист. Поиск, сеть и возврат — отдельные кампании; казахская ветка собирается своим набором.</p>
          </li>
          <li class="yd-timeline__item">
            <h3>Сборка в кабинете</h3>
            <p>Собираем объявления, регион, расписание, устройства и цели. Перед модерацией ещё раз сверяем URL посадочных и суточный потолок.</p>
          </li>
          <li class="yd-timeline__item">
            <h3>Старт показов</h3>
            <p>Показы открываем после модерации и контрольного срабатывания целей. Срок зависит от готовности материалов; календарную дату запуска заранее не назначаем.</p>
          </li>
          <li class="yd-timeline__item">
            <h3>Оптимизация по циклу</h3>
            <p>По итогам цикла разбираем поисковые запросы, отключаем пустые связки, усиливаем группы с живыми разговорами и передаём сводку с задачами на следующий период.</p>
          </li>
        </ol>
      </div>
    `;
h = replaceBetween(h, '<section class="rk-section" id="process">', '<section class="ctx-cta-band"', procInner);

// Decision + landing uniqueness
h = h.replace(
  /<h3>Усиление посадочной<\/h3>\s*<p>[^<]+<\/p>/,
  `<h3>Усиление посадочной</h3>
            <p>Если URL отвечает мимо запроса или тормозит на смартфоне, сначала чиним страницу либо готовим отдельные посадочные под группы. Иначе клики уходят без разговора с менеджером.</p>`
);

h = h.replace(
  "Текст объявления и первый экран должны совпадать: Талдыкорган, тип услуги, понятный способ связи. Шаблон без города и без кнопки после клика теряет часть бюджета на отказе.",
  "Объявление и первый экран должны совпадать: Талдыкорган, тип услуги, понятный способ связи. Общий шаблон без города и без кнопки после клика сливает часть бюджета в отказ."
);

h = h.replace(
  "Итог складывается из силы локального спроса в Яндексе, ясности предложения на сайте, потолка расхода и того, насколько быстро менеджер берёт трубку. Число заявок до аудита ниши не прогнозируем.",
  "Результат зависит от плотности интереса в Яндексе по Талдыкоргану, ясности оффера, удобства сайта, потолка расхода и скорости ответа менеджера. Объём заявок до аудита ниши не прогнозируем."
);

// Control lead — unique
h = h.replace(
  "Кабинет оформлен на рекламодателя. Мы заходим гостевым доступом и ведём кампании из Петропавловска. Владелец видит настройки, лимиты и расход; платёжную карту привязывает сам. Цели и суточный потолок согласуем до первого показа.",
  "Аккаунт принадлежит рекламодателю. Агентство входит гостевым доступом и ведёт кампании из Петропавловска. Владелец видит настройки, лимиты и расход; карту оплаты привязывает сам. Цели и суточный потолок согласуем до первого показа."
);

h = h.replace(
  "Число обращений из Талдыкоргана зависит от спроса в Яндексе, оффера, сайта, бюджета, конкуренции и скорости ответа на звонки и заявки. Гарантированный поток лидов и фиксированный CPL без разбора ниши не обещаем.",
  "Сколько обращений придёт из Талдыкоргана, зависит от спроса в Яндексе, оффера, сайта, бюджета, конкуренции и скорости ответа на звонки и заявки. Гарантированный поток лидов и фиксированный CPL без разбора ниши не обещаем."
);

// Local-config schedule — unique
h = h.replace(
  /<h3 class="yd-artifact__title">Часы диспетчера и пик сезона поставок<\/h3>\s*<p class="yd-artifact__note">[^<]+<\/p>/,
  `<h3 class="yd-artifact__title">Окно приёма и сезон поставок</h3>
            <p class="yd-artifact__note">Показы совпадают с часами, когда менеджер берёт заказ: будничный сервис в городе и усиленный приём в сезоны агропоставок. Смартфонный путь проверяем первым — тап по номеру, мессенджер, короткая анкета.</p>`
);

// Soften shared landing second paragraph slightly
h = h.replace(
  "Метрика показывает, дошло ли обращение. Без событий оптимизация сводится к кликам. При готовом сайте связываем источник с CRM и скоростью ответа менеджера. Многоканальный сбор заявок — на странице <a href=\"/web-studiya/lidogeneratsiya/\">лидогенерации</a>; органический спрос закрывает <a href=\"/web-studiya/seo-prodvizhenie/\">SEO-продвижение</a>.",
  "По Метрике видно, дошло ли обращение. Без событий оптимизация остаётся на уровне кликов. Если сайт готов, связываем источник с CRM и скоростью ответа менеджера. Многоканальный сбор заявок — на странице <a href=\"/web-studiya/lidogeneratsiya/\">лидогенерации</a>; органический спрос закрывает <a href=\"/web-studiya/seo-prodvizhenie/\">SEO-продвижение</a>."
);

fs.writeFileSync(OUT, h);
console.log("patched2", OUT);
