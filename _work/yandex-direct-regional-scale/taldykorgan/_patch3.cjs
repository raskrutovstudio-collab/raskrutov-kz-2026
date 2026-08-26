/**
 * Patch 3: core sections + remaining long dups vs kostanay/kokshetau.
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

const shortInner = `
      <div class="rk-container yd-prose">
        <div class="yd-about-heading">
          <svg class="yd-about-heading__icon" viewBox="0 0 44 44" width="44" height="44" aria-hidden="true" focusable="false">
            <rect width="44" height="44" rx="10" fill="#FC3F1D"/>
            <text x="22" y="30" text-anchor="middle" fill="#fff" font-size="22" font-weight="700" font-family="Arial, sans-serif">Я</text>
          </svg>
          <h2 class="rk-h2 yd-about-heading__title">Талдыкорган: городской контур Жетысу без подмеса Алматы</h2>
        </div>
        <p>Талдыкорган держит роль административного центра Жетысуской области: здесь крутится сервис, розница, подряд и агропоставки. В Директе строка города живёт отдельно от области и отдельно от Алматы. Областная галочка раскидывает показы по пунктам, куда склад или бригада может не доехать. Мегаполис рядом на карте, но аукцион и намерение там другие — в городской лимит Алматы не включаем без отдельного решения и бюджета. До модерации на бумаге согласуем город, список обслуживаемых пунктов Жетысу и исключение Алматы. Затем — ключи по направлениям, тексты, окно показа, устройства и события Метрики. Общий стек описан на <a href="/web-studiya/kontekstnaya-reklama/yandex-direct/">странице Яндекс Директ по Казахстану</a>; здесь только контур Талдыкоргана.</p>
        <p>Офиса Raskrutov в Талдыкоргане нет. Ведение идёт из Петропавловска: гостевой доступ, созвоны, переписка и сводка по циклу. Адрес: ул. М. Жумабаева, 109, 6 этаж, офис 606а. Итог зависит от силы локального спроса, ясности оффера, качества сайта, потолка расхода и скорости ответа менеджера. Число заявок до аудита ниши не прогнозируем.</p>
      </div>
    `;
h = replaceBetween(h, '<section class="rk-section" id="short-answer">', '<section class="rk-section" id="local-config">', shortInner);

const localInner = `
      <div class="rk-container">
        <h2 class="rk-h2">Параметры до модерации</h2>
        <p class="yd-section-lead">До модерации фиксируем периметр города, список пунктов Жетысу, решение по Алматы, ветки RU/KK, часы приёма и критерий качественного контакта.</p>
        <div class="yd-artifact-grid">
          <article class="yd-artifact yd-artifact--cabinet">
            <span class="yd-demo-label">География</span>
            <h3 class="yd-artifact__title">Город, область и Алматы — три контура</h3>
            <p class="yd-artifact__note">В регионах включаем строку Талдыкоргана. Жетысускую область добавляем именами только при фактическом выезде или выдаче. Алматы держим вне городского лимита либо выносим отдельной кампанией. После цикла сверяем отчёт местоположений с картой обслуживания.</p>
          </article>
          <article class="yd-artifact yd-artifact--flow">
            <span class="yd-demo-label">Языки</span>
            <h3 class="yd-artifact__title">RU и KK — независимые наборы</h3>
            <p class="yd-artifact__note">Казахские запросы собираем отдельной семантикой и своими текстами. Калька с русского списка почти всегда промахивается. Язык объявления, минус-слов и URL совпадает с языком запроса.</p>
          </article>
          <article class="yd-artifact yd-artifact--flow">
            <span class="yd-demo-label">Расписание и устройства</span>
            <h3 class="yd-artifact__title">Окно приёма и сезон поставок</h3>
            <p class="yd-artifact__note">Показы совпадают с часами, когда менеджер берёт заказ: будничный сервис в городе и усиленный приём в сезоны агропоставок. Смартфонный путь проверяем первым — тап по номеру, мессенджер, короткая анкета.</p>
          </article>
          <article class="yd-artifact yd-artifact--report">
            <span class="yd-demo-label">Цели и качество</span>
            <h3 class="yd-artifact__title">Что считаем целевым действием</h3>
            <p class="yd-artifact__note">До старта фиксируем события: отправка анкеты, звонок, заявка на поставку, запрос на подряд. Пустые касания просим помечать, чтобы оптимизация не кормилась шумом.</p>
          </article>
        </div>
      </div>
    `;
h = replaceBetween(h, '<section class="rk-section" id="local-config">', '<section class="rk-section" id="audience">', localInner);

const audInner = `
      <div class="rk-container">
        <h2 class="rk-h2">Для каких задач в Талдыкоргане собираем Директ</h2>
        <p class="yd-section-lead">Типовые постановки ниже. Клиентских кейсов, отзывов и рейтингов по Талдыкоргану на странице нет.</p>
        <div class="yd-card-grid">
          <article class="yd-card yd-card--local">
            <span class="yd-card__visual" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none" focusable="false" aria-hidden="true"><path d="M12 21s7-6.2 7-11a7 7 0 10-14 0c0 4.8 7 11 7 11z" stroke="currentColor" stroke-width="1.8"/><circle cx="12" cy="10" r="2.2" stroke="currentColor" stroke-width="1.8"/></svg>
            </span>
            <h3>Сервис с приёмом в городе</h3>
            <p>Клиент ищет услугу с визитом в Талдыкоргане или коротким выездом по согласованным улицам. Группы режем по типу заявки, чтобы переход вёл на URL с условиями приёма.</p>
          </article>
          <article class="yd-card yd-card--b2b">
            <span class="yd-card__visual" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none" focusable="false" aria-hidden="true"><rect x="4" y="7" width="16" height="12" rx="2" stroke="currentColor" stroke-width="1.8"/><path d="M8 7V5.8A2.8 2.8 0 0110.8 3h2.4A2.8 2.8 0 0116 5.8V7" stroke="currentColor" stroke-width="1.8"/></svg>
            </span>
            <h3>Подряд админ-центра и снабжение</h3>
            <p>Снабжение организаций, ремонт и подряд соседствуют с бытовым спросом. Жетысу добавляем точечно — только адреса, куда техника доезжает. Алматы в этот контур не смешиваем.</p>
          </article>
          <article class="yd-card yd-card--ecom">
            <span class="yd-card__visual" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none" focusable="false" aria-hidden="true"><path d="M6 8h12l-1 11H7L6 8z" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/><path d="M9 8V6.5A3 3 0 0112 3.5 3 3 0 0115 6.5V8" stroke="currentColor" stroke-width="1.8"/></svg>
            </span>
            <h3>Розница с самовывозом</h3>
            <p>Покупатель ищет товар с выдачей в Талдыкоргане или доставкой по зоне логистики. Такие группы не смешиваем с сезонными агропоставками: другая посадочная и другой критерий целевого контакта.</p>
          </article>
          <article class="yd-card yd-card--account">
            <span class="yd-card__visual" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none" focusable="false" aria-hidden="true"><path d="M4 19V5M4 19h16" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/><path d="M8 15v-4M12 15V8M16 15v-6" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>
            </span>
            <h3>Агропоставки без зоны отгрузки</h3>
            <p>Если в семантике живут запросы про поставку по области, а склад отдаёт только в городе, расход уходит на интерес без сделки. Областной контур включаем лишь при реальной отгрузке и отдельном лимите.</p>
          </article>
          <article class="yd-card yd-card--b2b">
            <span class="yd-card__visual" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none" focusable="false" aria-hidden="true"><path d="M4 12a8 8 0 101.8-5.1" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/><path d="M4 4v5h5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>
            </span>
            <h3>Подмес Алматы в городской бюджет</h3>
            <p>Южные формулировки и широкая галочка по области смешивают пустой интерес и рабочие заявки из Талдыкоргана. Без чистки гео и минус-листа их потом почти невозможно развести в отчёте.</p>
          </article>
          <article class="yd-card yd-card--local">
            <span class="yd-card__visual" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none" focusable="false" aria-hidden="true"><rect x="3" y="4" width="18" height="16" rx="2" stroke="currentColor" stroke-width="1.8"/><path d="M3 9h18M8 4v5" stroke="currentColor" stroke-width="1.8"/></svg>
            </span>
            <h3>Казахскоязычный спрос</h3>
            <p>Когда в городе есть стабильные KK-запросы и страница на kk, поднимаем отдельную линию: свои ключи, свои тексты, свой минус-лист. RU-семантику один в один не переносим.</p>
          </article>
        </div>
      </div>
    `;
h = replaceBetween(h, '<section class="rk-section" id="audience">', '<section class="rk-section" id="campaign-types">', audInner);

// Fix remaining long dups in setup items
h = h.replace(
  "<div><h3>Метрика до старта</h3><p>Счётчик ставим до показов и описываем цели: анкета, звонок, открытие чата. Каждое событие проверяем на живой странице.</p></div>",
  "<div><h3>Метрика до старта</h3><p>Перед стартом показов ставим счётчик и описываем цели — анкета, звонок, чат. Каждое событие проверяем на живой странице.</p></div>"
);
h = h.replace(
  "<div><h3>Мобильная проверка URL</h3><p>Открываем URL с телефона, отправляем тестовую заявку и засекаем ответ. Сверяем оффер с текстом объявления.</p></div>",
  "<div><h3>Мобильная проверка URL</h3><p>Проверяем посадочную на телефоне: тестовая заявка и замер ответа. Оффер сверяем с текстом объявления.</p></div>"
);

h = h.replace(
  "Объявление и первый экран должны совпадать: Талдыкорган, тип услуги, понятный способ связи. Общий шаблон без города и без кнопки после клика сливает часть бюджета в отказ.",
  "Первый экран после клика должен совпадать с объявлением: Талдыкорган, тип услуги, понятный способ связи. Страница без города и без кнопки связи теряет часть бюджета на отказе."
);

// Control section notes vs kokshetau
h = h.replace(
  "Список событий зависит от сценария сайта. Ниже — учебный пример без клиентских KPI.",
  "Какие события нужны — зависит от сценария сайта. Ниже учебный пример без клиентских KPI."
);
h = h.replace(
  "Демонстрационный путь клика без цифр рекламодателя. Потолок расхода задаёт владелец кабинета.",
  "Учебная схема клика без цифр рекламодателя. Суточный потолок задаёт владелец кабинета."
);
h = h.replace(
  "В сводке фиксируем сделанное и риски. Выдуманных заявок, CPL и ROAS на странице нет.",
  "В сводке — выполненные работы и риски. Придуманных заявок, CPL и ROAS здесь нет."
);

// Decision cards unique
h = h.replace(
  /<h3>Новый контур под город<\/h3>\s*<p>[^<]+<\/p>/,
  `<h3>Новый контур под город</h3>
            <p>Кабинета нет или старый не годится. Собираем структуру под Талдыкорган, цели Метрики, список пунктов Жетысу и решение по Алматы.</p>`
);
h = h.replace(
  /<h3>Пересборка текущего аккаунта<\/h3>\s*<p>[^<]+<\/p>/,
  `<h3>Пересборка текущего аккаунта</h3>
            <p>Показы уже идут, но гео шире зоны продаж. Режем лишнее, отделяем город от Жетысуской области и Алматы, заново собираем группы.</p>`
);

fs.writeFileSync(OUT, h);
console.log("patched3", OUT);
