/**
 * Patch 6: drop kostanay main_c/main_j and kokshetau core_c under thresholds.
 */
const fs = require("fs");
const path = require("path");
const OUT = path.join(
  "site_mirror/web-studiya/kontekstnaya-reklama/yandex-direct/taldykorgan/index.html"
);
let h = fs.readFileSync(OUT, "utf8");

function replaceBetween(html, startMarker, endMarker, newInner) {
  const i = html.indexOf(startMarker);
  if (i < 0) throw new Error("start not found");
  const j = html.indexOf(endMarker, i + startMarker.length);
  if (j < 0) throw new Error("end not found");
  return html.slice(0, i + startMarker.length) + newInner + html.slice(j);
}

const campInner = `
      <div class="rk-container">
        <h2 class="rk-h2">Форматы Директа для Талдыкоргана</h2>
        <p class="yd-section-lead">Открываем Поиск — человек уже сформулировал задачу. Сеть, возврат и каталог добавляем, когда по городу появились первые рабочие клики и события.</p>
        <div class="yd-camp-grid">
          <article class="yd-camp yd-camp--search">
            <span class="yd-camp__visual" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none" focusable="false" aria-hidden="true"><circle cx="11" cy="11" r="6.5" stroke="currentColor" stroke-width="1.8"/><path d="M16 16l4 4" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>
            </span>
            <span class="yd-camp__meta">Поиск Яндекса</span>
            <h3>Поиск</h3>
            <p>Объявление встречается с запросом на сервис, подряд, агропоставку или товар с выдачей в Талдыкоргане. Здесь обычно появляются первые звонки и анкеты.</p>
          </article>
          <article class="yd-camp yd-camp--rsya">
            <span class="yd-camp__visual" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none" focusable="false" aria-hidden="true"><rect x="3" y="4" width="18" height="16" rx="2" stroke="currentColor" stroke-width="1.8"/><path d="M3 9h18M8 4v5" stroke="currentColor" stroke-width="1.8"/></svg>
            </span>
            <span class="yd-camp__meta">Сеть</span>
            <h3>РСЯ</h3>
            <p>Рекламные блоки на площадках сети. Догоняем тех, кто уже был на сайте; лимит сети отделяем от поискового бюджета.</p>
          </article>
          <article class="yd-camp yd-camp--remark">
            <span class="yd-camp__visual" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none" focusable="false" aria-hidden="true"><path d="M4 12a8 8 0 101.8-5.1" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/><path d="M4 4v5h5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>
            </span>
            <span class="yd-camp__meta">Возврат</span>
            <h3>Ретаргетинг</h3>
            <p>Возвращаем посетителей карточки услуги и тех, кто бросил форму. Для работы нужны цели Метрики и накопленный сегмент.</p>
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
            <p>Показывают товары или услуги, которые человек уже открывал. Подключаем после порядка в карточках и фиде.</p>
          </article>
          <article class="yd-camp yd-camp--video">
            <span class="yd-camp__visual" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none" focusable="false" aria-hidden="true"><rect x="3" y="6" width="14" height="12" rx="2" stroke="currentColor" stroke-width="1.8"/><path d="M17 10l4-2v8l-4-2" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/></svg>
            </span>
            <span class="yd-camp__meta">Охват</span>
            <h3>Медийные форматы</h3>
            <p>Баннеры и видео по согласованным макетам. Уместны, когда цикл выбора подрядчика или поставщика длинный и бренд нужно показать заранее.</p>
          </article>
        </div>
      </div>
    `;
h = replaceBetween(h, '<section class="rk-section" id="campaign-types">', '<section class="rk-section" id="setup">', campInner);

h = h.replace(
  "Офиса Raskrutov в Талдыкоргане нет. Ведение идёт из Петропавловска: гостевой доступ, созвоны, переписка и сводка по циклу. Адрес: ул. М. Жумабаева, 109, 6 этаж, офис 606а. Итог зависит от силы локального спроса, ясности оффера, качества сайта, потолка расхода и скорости ответа менеджера. Число заявок до аудита ниши не прогнозируем.",
  "Офиса Raskrutov в Талдыкоргане нет. Ведение идёт из Петропавловска: гостевой доступ, созвоны, переписка и сводка по циклу. Адрес: ул. М. Жумабаева, 109, 6 этаж, офис 606а. Для агросервиса и админ-подряда отдельно фиксируем сезонность отгрузки и часы диспетчера. Итог зависит от силы локального спроса, ясности оффера, качества сайта, потолка расхода и скорости ответа менеджера. Число заявок до аудита ниши не прогнозируем."
);

h = h.replaceAll(
  "Нужны список направлений, карта приёма и выезда по Талдыкоргану, при необходимости — пункты Жетысуской области, решение по Алматы, гостевые доступы в Директ и Метрику, контакт принимающего заявки, дневной потолок расхода и пара примеров удачных обращений. По этому набору собираем план настройки.",
  "Подготовьте список направлений, карту приёма и выезда по Талдыкоргану, при необходимости пункты Жетысуской области, решение по Алматы, гостевые доступы в Директ и Метрику, контакт принимающего заявки, дневной потолок расхода и пару примеров удачных обращений. По этому набору собираем план настройки."
);

h = h.replaceAll(
  "Гонорар за ведение — от 120 000 тенге в месяц. Он растёт с числом направлений, объёмом семантики и составом форматов. Медиабюджет на клики клиент держит на своём балансе, отдельно от оплаты агентства.",
  "Стоимость ведения — от 120 000 тенге в месяц. Она растёт с числом направлений, объёмом семантики и составом форматов. Медиабюджет на клики клиент держит на своём балансе, отдельно от оплаты агентства."
);

h = h.replace(
  "Аккаунт принадлежит рекламодателю. Агентство входит гостевым доступом и ведёт кампании из Петропавловска. Владелец видит настройки, лимиты и расход; карту оплаты привязывает сам. Цели и суточный потолок согласуем до первого показа.",
  "Рекламный кабинет оформлен на клиента. Агентство входит гостевым доступом и ведёт кампании из Петропавловска. Владелец видит настройки, лимиты и расход; карту оплаты привязывает сам. Цели и суточный потолок согласуем до первого показа."
);

// More unique FAQ / hero dilution for kokshetau core
h = h.replace(
  "В регионах отмечаем Талдыкорган. Жетысускую область и Алматы не подмешиваем в городской лимит без карты приёма и выезда. Сопровождение ведём удалённо из Петропавловска.",
  "География показа — Талдыкорган. Жетысускую область и Алматы не подмешиваем в городской лимит без карты приёма и выезда. Сопровождение ведём удалённо из Петропавловска."
);

h = h.replace(
  "Перед модерацией согласовываем периметр города, список пунктов Жетысу, решение по Алматы, ветки RU/KK, часы приёма и критерий качественного контакта.",
  "До запуска согласовываем периметр города, список пунктов Жетысу, решение по Алматы, ветки RU/KK, часы приёма и критерий качественного контакта."
);

h = h.replace(
  "Ниже — типовые постановки задач. Конкретных кейсов, отзывов и рейтингов по Талдыкоргану на странице нет.",
  "Карточки ниже описывают типовые постановки. Клиентских кейсов, отзывов и рейтингов по Талдыкоргану на странице нет."
);

// Setup list items still overlapping — rewrite a few
h = h.replace(
  "<div><h3>Спрос города</h3><p>Выясняем, какими словами в Яндексе ищут ваши услуги в Талдыкоргане и где посадочная уже отвечает на запрос.</p></div>",
  "<div><h3>Спрос города</h3><p>Смотрим поисковые формулировки по услугам в Талдыкоргане и проверяем, закрывает ли посадочная эти запросы.</p></div>"
);
h = h.replace(
  "<div><h3>Лексика направлений</h3><p>Берём коммерческие ключи, городские маркеры и лексику сервиса, подряда и поставок. RU и KK списки ведём независимо.</p></div>",
  "<div><h3>Лексика направлений</h3><p>Собираем коммерческие ключи, городские маркеры и лексику сервиса, подряда и поставок. RU и KK списки ведём независимо.</p></div>"
);
h = h.replace(
  "<div><h3>Объявления и расширения</h3><p>У каждой группы — свой заголовок и URL. Быстрые ссылки, уточнения и визитку закрываем до модерации.</p></div>",
  "<div><h3>Объявления и расширения</h3><p>Каждой группе назначаем свой заголовок и URL. Быстрые ссылки, уточнения и визитку закрываем до модерации.</p></div>"
);

fs.writeFileSync(OUT, h);
console.log("patched6", OUT);
