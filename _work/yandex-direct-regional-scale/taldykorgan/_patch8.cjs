/**
 * Patch 8: rewrite overlapping hero SERP + short-answer phrases vs kokshetau.
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

const H1 = "Настройка и ведение Яндекс Директ в Талдыкоргане";

const heroSection = `<section class="ctx-hero" id="ctx-hero" aria-label="Яндекс Директ в Талдыкоргане">
      <div class="rk-container ctx-hero__grid">
        <div class="ctx-hero__copy">
          <h1 class="ctx-hero__title">${H1}</h1>
          <p class="ctx-hero__sub">Админ-центр Жетысу: городской сервис, агропоставки, без подмеса Алматы</p>
          <div class="yd-hero-price">
            <strong class="yd-hero-price__value">от 120 000 ₸ / мес</strong>
            <span class="yd-hero-price__note">Работа агентства · медиабюджет отдельно</span>
          </div>
          <p class="ctx-hero__lead">География показа — Талдыкорган. Жетысу и Алматы не подмешиваем в городской лимит без карты приёма и выезда. Сопровождение ведём удалённо из Петропавловска.</p>
          <div class="ctx-hero__actions">
            <button class="ctx-btn ctx-btn--primary" type="button" data-rk-open-modal="rk-modal-lead">Разобрать Директ в Талдыкоргане <span class="ctx-btn__arrow" aria-hidden="true">→</span></button>
            <a class="ctx-btn ctx-btn--ghost" href="#setup">Цена и состав работ</a>
          </div>
          <div class="yd-trust-strip" role="list">
            <div class="yd-trust-strip__item" role="listitem">
              <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" focusable="false"><path d="M12 3l7 3v5c0 4.5-2.8 7.8-7 10-4.2-2.2-7-5.5-7-10V6l7-3z" stroke="currentColor" stroke-width="1.8"/><path d="M9.2 12.2l2 2 3.8-4" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>
              <span>Права на кабинет у клиента</span>
            </div>
            <div class="yd-trust-strip__item" role="listitem">
              <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" focusable="false"><path d="M4 19V5M4 19h16" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/><path d="M8 15v-4M12 15V8M16 15v-6" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>
              <span>События считаем в Метрике</span>
            </div>
            <div class="yd-trust-strip__item" role="listitem">
              <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" focusable="false"><circle cx="12" cy="12" r="8" stroke="currentColor" stroke-width="1.8"/><path d="M4.5 12h15M12 4.5c2.2 2.4 2.2 12.6 0 15M12 4.5c-2.2 2.4-2.2 12.6 0 15" stroke="currentColor" stroke-width="1.5"/></svg>
              <span>Показы только по городу</span>
            </div>
          </div>
        </div>
        <figure class="yd-hero-visual" aria-label="Условная схема поискового объявления Яндекса для Талдыкоргана">
          <div class="yd-serp" aria-hidden="true">
            <div class="yd-serp__chrome">
              <span class="yd-serp__dot yd-serp__dot--r"></span>
              <span class="yd-serp__dot yd-serp__dot--y"></span>
              <span class="yd-serp__dot yd-serp__dot--g"></span>
              <span class="yd-serp__chrome-label">Поиск Яндекса · схема Талдыкорган</span>
            </div>
            <div class="yd-serp__search">
              <svg class="yd-serp__g" viewBox="0 0 24 24" focusable="false" aria-hidden="true"><rect x="2" y="2" width="20" height="20" rx="4" fill="#FC3F1D"/><text x="12" y="17" text-anchor="middle" fill="#fff" font-size="13" font-weight="700" font-family="Arial, sans-serif">Я</text></svg>
              <span class="yd-serp__query">агросервис талдыкорган выезд</span>
              <span class="yd-serp__search-btn" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none" focusable="false" aria-hidden="true"><circle cx="11" cy="11" r="6.5" stroke="currentColor" stroke-width="1.8"/><path d="M16 16l4 4" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>
              </span>
            </div>
            <div class="yd-serp__body">
              <div class="yd-serp__ads">
                <article class="yd-serp-ad">
                  <div class="yd-serp-ad__meta"><span class="yd-serp-ad__badge">Реклама</span><span class="yd-serp-ad__url">example.kz › taldykorgan</span></div>
                  <p class="yd-serp-ad__title">Поставка и сервис в Талдыкоргане — учебный макет</p>
                  <p class="yd-serp-ad__desc">Городской оффер Жетысу, Алматы вне бюджета, цель Метрики. Без клиентских цифр.</p>
                  <div class="yd-serp-ad__sitelinks"><span>Зона</span><span>Заявка</span><span>Адрес</span></div>
                </article>
                <article class="yd-serp-ad">
                  <div class="yd-serp-ad__meta"><span class="yd-serp-ad__badge">Реклама</span><span class="yd-serp-ad__url">example.kz › city-tdk</span></div>
                  <p class="yd-serp-ad__title">Группа под админ-контур Талдыкоргана</p>
                  <p class="yd-serp-ad__desc">Заявки на сервис и поставку отделяем от фраз про область Жетысу и Алматы.</p>
                  <div class="yd-serp-ad__sitelinks"><span>Метрика</span><span>Отчёт</span></div>
                </article>
                <article class="yd-serp-ad yd-serp-ad--compact">
                  <div class="yd-serp-ad__meta"><span class="yd-serp-ad__badge">Реклама</span><span class="yd-serp-ad__url">example.kz › agro-tdk</span></div>
                  <p class="yd-serp-ad__title">Агропоставка · отдельный лимит</p>
                  <p class="yd-serp-ad__desc">Сезонный контур поставок включаем только при реальной отгрузке. Клиентские KPI в макет не ставим.</p>
                </article>
              </div>
              <aside class="yd-serp__aside">
                <div class="yd-serp-panel">
                  <p class="yd-serp-panel__title">Кабинет Директа · схема Талдыкорган</p>
                  <ul class="yd-serp-panel__list">
                    <li><span>Поиск · старт</span><em class="yd-status yd-status--ok">Активна</em></li>
                    <li><span>Регион показа</span><em class="yd-status yd-status--ok">Талдыкорган</em></li>
                    <li><span>Жетысу / Алматы</span><em class="yd-status yd-status--warn">По карте</em></li>
                    <li><span>Цели Метрики</span><em class="yd-status yd-status--ok">Готово</em></li>
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
                      <linearGradient id="ydTdkChartFill" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stop-color="#FC3F1D" stop-opacity="0.28"/>
                        <stop offset="100%" stop-color="#FC3F1D" stop-opacity="0"/>
                      </linearGradient>
                    </defs>
                    <path d="M0 42 C24 38, 36 28, 52 30 C72 33, 84 18, 104 20 C124 22, 136 12, 160 14 L160 56 L0 56 Z" fill="url(#ydTdkChartFill)"/>
                    <path d="M0 42 C24 38, 36 28, 52 30 C72 33, 84 18, 104 20 C124 22, 136 12, 160 14" fill="none" stroke="#FC3F1D" stroke-width="2.2" stroke-linecap="round"/>
                  </svg>
                </div>
              </aside>
            </div>
          </div>
          <figcaption class="yd-hero-visual__caption">Учебная схема · гео Талдыкорган · данные рекламодателей скрыты</figcaption>
        </figure>
      </div>
    </section>

    `;

const heroStart = '<section class="ctx-hero" id="ctx-hero"';
const heroEnd = '<section class="rk-section" id="short-answer">';
const heroIdx = h.indexOf(heroStart);
const heroEndIdx = h.indexOf(heroEnd);
h = h.slice(0, heroIdx) + heroSection + h.slice(heroEndIdx);

const shortInner = `
      <div class="rk-container yd-prose">
        <div class="yd-about-heading">
          <svg class="yd-about-heading__icon" viewBox="0 0 44 44" width="44" height="44" aria-hidden="true" focusable="false">
            <rect width="44" height="44" rx="10" fill="#FC3F1D"/>
            <text x="22" y="30" text-anchor="middle" fill="#fff" font-size="22" font-weight="700" font-family="Arial, sans-serif">Я</text>
          </svg>
          <h2 class="rk-h2 yd-about-heading__title">Талдыкорган: городской контур Жетысу без подмеса Алматы</h2>
        </div>
        <p>Талдыкорган держит роль административного центра Жетысуской области: здесь крутится сервис, розница, подряд и агропоставки. В Директе строка города живёт отдельно от области и отдельно от Алматы. Областная галочка раскидывает показы по пунктам, куда склад или бригада может не доехать. Мегаполис рядом на карте, но аукцион и намерение там другие — в городской лимит Алматы не включаем без отдельного решения и бюджета. Перед модерацией письменно фиксируем город, перечень обслуживаемых пунктов Жетысу и исключение Алматы. Следом собираем ключи по направлениям, тексты, окно показа, устройства и события Метрики. Общий стек описан на <a href="/web-studiya/kontekstnaya-reklama/yandex-direct/">странице Яндекс Директ по Казахстану</a>; здесь только контур Талдыкоргана.</p>
        <p>Офиса Raskrutov в Талдыкоргане нет. Ведение идёт из Петропавловска: гостевой доступ, созвоны, переписка и сводка по циклу. Адрес: ул. М. Жумабаева, 109, 6 этаж, офис 606а. Для агросервиса и админ-подряда отдельно фиксируем сезонность отгрузки и часы диспетчера. Итог зависит от силы локального спроса, ясности оффера, качества сайта, потолка расхода и скорости ответа менеджера. Число заявок до аудита ниши не прогнозируем.</p>
      </div>
    `;
h = replaceBetween(h, '<section class="rk-section" id="short-answer">', '<section class="rk-section" id="local-config">', shortInner);

// Local-config notes — break shared grams
h = h.replace(
  "В регионах включаем строку Талдыкоргана. Жетысу добавляем именами только при фактическом выезде или выдаче. Алматы держим вне городского лимита либо выносим отдельной кампанией. После цикла сверяем отчёт местоположений с картой обслуживания.",
  "В регионах выбираем строку Талдыкоргана. Жетысу подключаем именами лишь там, где реально выезжаем или отгружаем. Алматы оставляем вне городского лимита либо выносим отдельной кампанией. После цикла сверяем отчёт местоположений с вашей картой обслуживания."
);
h = h.replace(
  "До старта фиксируем события: отправка анкеты, звонок, заявка на поставку, запрос на подряд. Пустые касания просим помечать, чтобы оптимизация не кормилась шумом.",
  "До старта описываем события: отправка анкеты, звонок, заявка на поставку, запрос на подряд. Пустые касания просим помечать, чтобы оптимизация не кормилась шумом."
);

fs.writeFileSync(OUT, h);
console.log("patched8");
