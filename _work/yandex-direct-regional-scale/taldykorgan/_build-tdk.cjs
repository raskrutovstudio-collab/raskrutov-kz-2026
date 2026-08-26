/**
 * Build unique Yandex Direct page for Taldykorgan.
 * DOM scaffold: kostanay (remote Petropavlovsk model; peers share astana CSS architecture).
 * Task: TASK-20260821-155927
 */
const fs = require("fs");
const path = require("path");

const OUT = path.join(
  "site_mirror/web-studiya/kontekstnaya-reklama/yandex-direct/taldykorgan/index.html"
);

let h = fs.readFileSync(OUT, "utf8");

const TITLE = "Яндекс Директ в Талдыкоргане — настройка и ведение | Raskrutov";
const DESC =
  "Яндекс Директ в Талдыкоргане: город отдельно от Жетысуской области и Алматы, админ-спрос и агросервис, цели в Метрике. От 120 000 ₸ в месяц.";
const H1 = "Настройка и ведение Яндекс Директ в Талдыкоргане";
const CANON =
  "https://raskrutov.kz/web-studiya/kontekstnaya-reklama/yandex-direct/taldykorgan/";

const faqEntities = [
  {
    q: "Сколько стоит ведение Директа для бизнеса в Талдыкоргане?",
    a: "Сопровождение кабинета — от 120 000 тенге в месяц. Сумма растёт с числом направлений, объёмом семантики и составом форматов. Оплату кликов клиент держит на своём балансе, отдельно от гонорара агентства.",
  },
  {
    q: "Как развести Талдыкорган, Жетысускую область и Алматы в регионах показа?",
    a: "В регионах включаем строку города Талдыкорган. Жетысускую область добавляем именами пунктов, куда реально выезжаем или отгружаем, с отдельным лимитом. Алматы в городской бюджет не подмешиваем: южный мегаполис живёт своей строкой и своей плотностью аукциона. После старта сверяем отчёт местоположений с картой обслуживания.",
  },
  {
    q: "Есть ли у Raskrutov офис или филиал в Талдыкоргане?",
    a: "Представительства в городе нет. Связь через гостевой доступ к Директу и Метрике, звонки и переписку. Юридический адрес: Петропавловск, ул. М. Жумабаева, 109, 6 этаж, офис 606а.",
  },
  {
    q: "Какой медиабюджет нужен на старте?",
    a: "Ориентир зависит от конкуренции в городском сервисе, агропоставках и админ-подряде, а также от числа форматов. Первые недели часть суммы уходит на проверку гипотез. Конкретную цифру называем после разбора спроса и посадочной.",
  },
  {
    q: "Что делаем на первой настройке?",
    a: "Проверяем нишу и сайт, формулировки под Талдыкорган, отдельно — Жетысускую область и исключение Алматы, минус-слова и схему кампаний. Затем тексты, гео города, часы, устройства, Метрику и цели. Показы открываем после модерации и контрольных событий.",
  },
  {
    q: "Нужна ли казахская ветка кампаний?",
    a: "Да, если есть живой KK-спрос и посадочная на kk. Калька с русского списка обычно промахивается: формулировки другие. Ключи, тексты и минус-слова собираем самостоятельным набором.",
  },
  {
    q: "Чем Поиск отличается от РСЯ в городе?",
    a: "Поиск ловит уже сформулированный запрос на услугу, поставку, подряд или товар с выдачей в Талдыкоргане — путь до звонка короче. Сеть возвращает тех, кто уже был на сайте. Бюджеты форматов держим раздельными, чтобы читать расход.",
  },
  {
    q: "Как Метрика учитывает звонки?",
    a: "Тап по номеру со смартфона пишется целью так же, как отправка анкеты — источник звонка читается в отчётах. Без счётчика видны лишь клики и списания. События описываем до включения показов.",
  },
  {
    q: "Нужен ли новый аккаунт Директа?",
    a: "Чаще остаёмся в текущем кабинете: история помогает стратегиям. Слабое режем, рабочее перекладываем под контур Талдыкоргана. Новый аккаунт — редкий случай, например при потере доступа.",
  },
  {
    q: "Когда стартуют показы?",
    a: "Срок зависит от готовности сайта, скорости доступов и объёма семантики. Сначала согласуем структуру, дальше — модерация и проверка целей. Дату «день в день» заранее не ставим: модерация платформы от нас не зависит.",
  },
  {
    q: "Нужна ли отдельная посадочная под Талдыкорган?",
    a: "Отдельный URL полезен, если условия по городу отличаются или направлений несколько. Если общая страница уже называет Талдыкорган, цены и контакты и совпадает с объявлением — её хватает. Анкету и кнопку звонка проверяем со смартфона до старта.",
  },
  {
    q: "Что подготовить перед стартом?",
    a: "Нужны список направлений, карта приёма и выезда по Талдыкоргану, при необходимости — пункты Жетысуской области, решение по Алматы, гостевые доступы в Директ и Метрику, контакт принимающего заявки, дневной потолок расхода и пара примеров удачных обращений. По этому набору собираем план настройки.",
  },
];

const schema = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": ["Organization", "ProfessionalService"],
      "@id": "https://raskrutov.kz/#organization",
      name: "Raskrutov",
      url: "https://raskrutov.kz/",
      logo: {
        "@type": "ImageObject",
        url: "https://raskrutov.kz/assets/m-files.cdn1.cc/web/images/raskrutov/logo.png",
      },
      email: "info@raskrutov.kz",
      telephone: "+7 700 021 69 00",
      address: {
        "@type": "PostalAddress",
        addressCountry: "KZ",
        addressLocality: "Петропавловск",
        streetAddress: "ул. М. Жумабаева, 109, 6 этаж, офис 606а",
      },
      sameAs: [
        "https://www.instagram.com/raskrutov.kz/",
        "https://www.youtube.com/@raskrutov-kz",
        "https://t.me/Raskrutov_web",
        "https://www.tiktok.com/@raskrutov.kz",
      ],
    },
    {
      "@type": "WebSite",
      "@id": "https://raskrutov.kz/#website",
      url: "https://raskrutov.kz/",
      name: "Raskrutov",
      publisher: { "@id": "https://raskrutov.kz/#organization" },
      inLanguage: "ru-KZ",
    },
    {
      "@type": "WebPage",
      "@id": CANON + "#webpage",
      url: CANON,
      name: TITLE,
      description: DESC,
      isPartOf: { "@id": "https://raskrutov.kz/#website" },
      about: { "@id": "https://raskrutov.kz/#organization" },
      mainEntity: { "@id": CANON + "#service" },
      breadcrumb: { "@id": CANON + "#breadcrumb" },
      inLanguage: "ru-KZ",
    },
    {
      "@type": "BreadcrumbList",
      "@id": CANON + "#breadcrumb",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Главная", item: "https://raskrutov.kz/" },
        { "@type": "ListItem", position: 2, name: "Студия", item: "https://raskrutov.kz/web-studiya/" },
        {
          "@type": "ListItem",
          position: 3,
          name: "Контекстная реклама",
          item: "https://raskrutov.kz/web-studiya/kontekstnaya-reklama/",
        },
        {
          "@type": "ListItem",
          position: 4,
          name: "Яндекс Директ",
          item: "https://raskrutov.kz/web-studiya/kontekstnaya-reklama/yandex-direct/",
        },
        { "@type": "ListItem", position: 5, name: "Талдыкорган", item: CANON },
      ],
    },
    {
      "@type": "Service",
      "@id": CANON + "#service",
      name: H1,
      url: CANON,
      provider: { "@id": "https://raskrutov.kz/#organization" },
      areaServed: {
        "@type": "City",
        name: "Taldykorgan",
        containedInPlace: { "@type": "Country", name: "Kazakhstan" },
      },
      serviceType: "Yandex Direct",
      description: DESC,
    },
    {
      "@type": "FAQPage",
      "@id": CANON + "#faq",
      mainEntity: faqEntities.map((x) => ({
        "@type": "Question",
        name: x.q,
        acceptedAnswer: { "@type": "Answer", text: x.a },
      })),
    },
  ],
};

h = h.replace(/<title>[\s\S]*?<\/title>/, `<title>${TITLE}</title>`);
h = h.replace(/<meta name="description" content="[^"]*">/, `<meta name="description" content="${DESC}">`);
h = h.replace(/<link rel="canonical" href="[^"]*">/, `<link rel="canonical" href="${CANON}">`);
h = h.replace(/<meta property="og:title" content="[^"]*">/, `<meta property="og:title" content="${TITLE}">`);
h = h.replace(/<meta property="og:description" content="[^"]*">/, `<meta property="og:description" content="${DESC}">`);
h = h.replace(/<meta property="og:url" content="[^"]*">/, `<meta property="og:url" content="${CANON}">`);
h = h.replace(
  /<script type="application\/ld\+json">[\s\S]*?<\/script>/,
  `<script type="application/ld+json">${JSON.stringify(schema)}</script>`
);

h = h.replace(/ydKstChartFill2/g, "ydTdkChartFill2");
h = h.replace(/ydKstChartFill/g, "ydTdkChartFill");
h = h.replace(/yd-kst-/g, "yd-tdk-");
h = h.replace(/rk-form-contacts-yd-kostanay/g, "rk-form-contacts-yd-taldykorgan");
h = h.replace(/contacts_yandex_direct_kostanay/g, "contacts_yandex_direct_taldykorgan");
h = h.replace(/rk-form-popup-yd-kostanay/g, "rk-form-popup-yd-taldykorgan");
h = h.replace(/popup_yandex_direct_kostanay/g, "popup_yandex_direct_taldykorgan");
h = h.replace(/\/kostanay\//g, "/taldykorgan/");
h = h.replace(/Контакты — Яндекс Директ Костанай/g, "Контакты — Яндекс Директ Талдыкорган");
h = h.replace(/Попап — Яндекс Директ Костанай/g, "Попап — Яндекс Директ Талдыкорган");

function replaceBetween(html, startMarker, endMarker, newInner) {
  const i = html.indexOf(startMarker);
  if (i < 0) throw new Error("start not found: " + startMarker.slice(0, 80));
  const j = html.indexOf(endMarker, i + startMarker.length);
  if (j < 0) throw new Error("end not found after: " + startMarker.slice(0, 80));
  return html.slice(0, i + startMarker.length) + newInner + html.slice(j);
}

h = h.replace(
  /<li><span aria-current="page">Костанай<\/span><\/li>/,
  '<li><span aria-current="page">Талдыкорган</span></li>'
);

const heroStart = '<section class="ctx-hero" id="ctx-hero"';
const heroEnd = '<section class="rk-section" id="short-answer">';
const heroIdx = h.indexOf(heroStart);
const heroEndIdx = h.indexOf(heroEnd);
if (heroIdx < 0 || heroEndIdx < 0) throw new Error("hero bounds");

const heroSection = `<section class="ctx-hero" id="ctx-hero" aria-label="Яндекс Директ в Талдыкоргане">
      <div class="rk-container ctx-hero__grid">
        <div class="ctx-hero__copy">
          <h1 class="ctx-hero__title">${H1}</h1>
          <p class="ctx-hero__sub">Админ-центр Жетысу, агросервис и городской спрос без подмеса Алматы</p>
          <div class="yd-hero-price">
            <strong class="yd-hero-price__value">от 120 000 ₸ / мес</strong>
            <span class="yd-hero-price__note">Работа агентства · медиабюджет отдельно</span>
          </div>
          <p class="ctx-hero__lead">В регионах фиксируем Талдыкорган. Жетысускую область и Алматы не смешиваем с городским лимитом без карты приёма и выезда. Кампании ведём удалённо из Петропавловска.</p>
          <div class="ctx-hero__actions">
            <button class="ctx-btn ctx-btn--primary" type="button" data-rk-open-modal="rk-modal-lead">Разобрать Директ в Талдыкоргане <span class="ctx-btn__arrow" aria-hidden="true">→</span></button>
            <a class="ctx-btn ctx-btn--ghost" href="#setup">Цена и состав работ</a>
          </div>
          <div class="yd-trust-strip" role="list">
            <div class="yd-trust-strip__item" role="listitem">
              <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" focusable="false"><path d="M12 3l7 3v5c0 4.5-2.8 7.8-7 10-4.2-2.2-7-5.5-7-10V6l7-3z" stroke="currentColor" stroke-width="1.8"/><path d="M9.2 12.2l2 2 3.8-4" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>
              <span>Кабинет принадлежит клиенту</span>
            </div>
            <div class="yd-trust-strip__item" role="listitem">
              <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" focusable="false"><path d="M4 19V5M4 19h16" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/><path d="M8 15v-4M12 15V8M16 15v-6" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>
              <span>Обращения считаем в Метрике</span>
            </div>
            <div class="yd-trust-strip__item" role="listitem">
              <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" focusable="false"><circle cx="12" cy="12" r="8" stroke="currentColor" stroke-width="1.8"/><path d="M4.5 12h15M12 4.5c2.2 2.4 2.2 12.6 0 15M12 4.5c-2.2 2.4-2.2 12.6 0 15" stroke="currentColor" stroke-width="1.5"/></svg>
              <span>Гео ограничено городом</span>
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
                  <p class="yd-serp-ad__title">Услуга и приём в Талдыкоргане — учебный макет</p>
                  <p class="yd-serp-ad__desc">Городской оффер, область по карте, Алматы вне лимита, цель Метрики. Без клиентских цифр.</p>
                  <div class="yd-serp-ad__sitelinks"><span>Зона</span><span>Заявка</span><span>Адрес</span></div>
                </article>
                <article class="yd-serp-ad">
                  <div class="yd-serp-ad__meta"><span class="yd-serp-ad__badge">Реклама</span><span class="yd-serp-ad__url">example.kz › city-tdk</span></div>
                  <p class="yd-serp-ad__title">Группа под городской контур Талдыкоргана</p>
                  <p class="yd-serp-ad__desc">Заявки на сервис и поставку отделяем от фраз про область Жетысу и Алматы.</p>
                  <div class="yd-serp-ad__sitelinks"><span>Метрика</span><span>Отчёт</span></div>
                </article>
                <article class="yd-serp-ad yd-serp-ad--compact">
                  <div class="yd-serp-ad__meta"><span class="yd-serp-ad__badge">Реклама</span><span class="yd-serp-ad__url">example.kz › agro-tdk</span></div>
                  <p class="yd-serp-ad__title">Агропоставка · отдельный лимит</p>
                  <p class="yd-serp-ad__desc">Сезонный контур поставок включаем только при реальной отгрузке. Цифры рекламодателей в макет не переносим.</p>
                </article>
              </div>
              <aside class="yd-serp__aside">
                <div class="yd-serp-panel">
                  <p class="yd-serp-panel__title">Кабинет Директа · схема Талдыкорган</p>
                  <ul class="yd-serp-panel__list">
                    <li><span>Поиск · старт</span><em class="yd-status yd-status--ok">Активна</em></li>
                    <li><span>Регион показа</span><em class="yd-status yd-status--ok">Талдыкорган</em></li>
                    <li><span>Область / Алматы</span><em class="yd-status yd-status--warn">По карте</em></li>
                    <li><span>Обращения в Метрике</span><em class="yd-status yd-status--ok">Готово</em></li>
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
h = h.slice(0, heroIdx) + heroSection + h.slice(heroEndIdx);

const shortInner = `
      <div class="rk-container yd-prose">
        <div class="yd-about-heading">
          <svg class="yd-about-heading__icon" viewBox="0 0 44 44" width="44" height="44" aria-hidden="true" focusable="false">
            <rect width="44" height="44" rx="10" fill="#FC3F1D"/>
            <text x="22" y="30" text-anchor="middle" fill="#fff" font-size="22" font-weight="700" font-family="Arial, sans-serif">Я</text>
          </svg>
          <h2 class="rk-h2 yd-about-heading__title">Талдыкорган в Директе: админ-узел, область и Алматы</h2>
        </div>
        <p>Талдыкорган — административный центр Жетысуской области с устойчивым городским спросом на сервис, розницу, подряд и агропоставки. В кабинете Директа строка «Талдыкорган» не равна всей Жетысуской области и не равна Алматы. Галочка на область тянет показы в пункты, куда бригада или склад может не доехать. Южный мегаполис рядом по карте, но аукцион и намерение там другие — в городской лимит Алматы не подмешиваем без отдельного решения и отдельного бюджета. Старт работ: на бумаге согласуем город, список обслуживаемых пунктов области, исключаем ли Алматы. Дальше — ключи по направлениям, тексты, окно показа, устройства и события Метрики. Базовое описание услуги — на <a href="/web-studiya/kontekstnaya-reklama/yandex-direct/">странице Яндекс Директ по Казахстану</a>; здесь разобран только контур Талдыкоргана.</p>
        <p>Филиала Raskrutov в Талдыкоргане нет. Сопровождение идёт из Петропавловска: гостевой доступ, созвоны, переписка и сводка по циклу. Офис — ул. М. Жумабаева, 109, 6 этаж, офис 606а. Отдача зависит от плотности интереса в Яндексе, ясности оффера, удобства сайта, потолка расхода и скорости ответа менеджера. Объём заявок до аудита ниши не прогнозируем.</p>
      </div>
    `;
h = replaceBetween(h, '<section class="rk-section" id="short-answer">', '<section class="rk-section" id="local-config">', shortInner);

const localInner = `
      <div class="rk-container">
        <h2 class="rk-h2">Что утверждаем до модерации</h2>
        <p class="yd-section-lead">Перед модерацией фиксируем периметр города, список пунктов Жетысу, решение по Алматы, ветки RU/KK, часы приёма и критерий качественного контакта.</p>
        <div class="yd-artifact-grid">
          <article class="yd-artifact yd-artifact--cabinet">
            <span class="yd-demo-label">География</span>
            <h3 class="yd-artifact__title">Талдыкорган, область и Алматы раздельно</h3>
            <p class="yd-artifact__note">В регионах включаем строку города Талдыкорган. Жетысускую область добавляем именами лишь при фактическом выезде или выдаче. Алматы держим вне городского лимита либо выносим в отдельную кампанию. По итогам цикла сверяем отчёт местоположений с вашей картой обслуживания.</p>
          </article>
          <article class="yd-artifact yd-artifact--flow">
            <span class="yd-demo-label">Языки</span>
            <h3 class="yd-artifact__title">Русский и казахский своими списками</h3>
            <p class="yd-artifact__note">KK-запросы ведём отдельной семантикой и отдельными текстами. Прямой перевод RU-списка почти всегда промахивается. Язык объявления, минус-слов и URL совпадает с языком запроса.</p>
          </article>
          <article class="yd-artifact yd-artifact--flow">
            <span class="yd-demo-label">Расписание и устройства</span>
            <h3 class="yd-artifact__title">Часы диспетчера и пик сезона поставок</h3>
            <p class="yd-artifact__note">Окно показа совпадает с часами, когда менеджер принимает заказ: будничный сервис в городе и усиленный приём в сезоны агропоставок. Мобильный путь проверяем первым — тап по номеру, мессенджер, короткая анкета.</p>
          </article>
          <article class="yd-artifact yd-artifact--report">
            <span class="yd-demo-label">Цели и качество</span>
            <h3 class="yd-artifact__title">Какое действие считаем целевым</h3>
            <p class="yd-artifact__note">До старта фиксируем события: отправка анкеты, звонок, заявка на поставку, запрос на подряд. Пустые касания просим помечать, чтобы оптимизация не кормилась шумом.</p>
          </article>
        </div>
      </div>
    `;
h = replaceBetween(h, '<section class="rk-section" id="local-config">', '<section class="rk-section" id="audience">', localInner);

const audInner = `
      <div class="rk-container">
        <h2 class="rk-h2">Кому в Талдыкоргане собираем Директ</h2>
        <p class="yd-section-lead">Ниже — типовые постановки задач. Конкретных кейсов, отзывов и рейтингов по Талдыкоргану на странице нет.</p>
        <div class="yd-card-grid">
          <article class="yd-card yd-card--local">
            <span class="yd-card__visual" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none" focusable="false" aria-hidden="true"><path d="M12 21s7-6.2 7-11a7 7 0 10-14 0c0 4.8 7 11 7 11z" stroke="currentColor" stroke-width="1.8"/><circle cx="12" cy="10" r="2.2" stroke="currentColor" stroke-width="1.8"/></svg>
            </span>
            <h3>Городской сервис и выезд</h3>
            <p>Житель или организация ищет услугу с приёмом в Талдыкоргане или коротким выездом по согласованным улицам и ближайшим посёлкам. Группы режем по типу заявки, чтобы переход вёл на URL с условиями визита.</p>
          </article>
          <article class="yd-card yd-card--b2b">
            <span class="yd-card__visual" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none" focusable="false" aria-hidden="true"><rect x="4" y="7" width="16" height="12" rx="2" stroke="currentColor" stroke-width="1.8"/><path d="M8 7V5.8A2.8 2.8 0 0110.8 3h2.4A2.8 2.8 0 0116 5.8V7" stroke="currentColor" stroke-width="1.8"/></svg>
            </span>
            <h3>Подряд и снабжение админ-центра</h3>
            <p>Снабжение организаций, ремонт и подряд идут рядом с бытовым спросом. Жетысускую область добавляем точечно — лишь адреса, куда техника или бригада доезжает по факту. Алматы в этот контур не смешиваем.</p>
          </article>
          <article class="yd-card yd-card--ecom">
            <span class="yd-card__visual" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none" focusable="false" aria-hidden="true"><path d="M6 8h12l-1 11H7L6 8z" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/><path d="M9 8V6.5A3 3 0 0112 3.5 3 3 0 0115 6.5V8" stroke="currentColor" stroke-width="1.8"/></svg>
            </span>
            <h3>Розница с выдачей в городе</h3>
            <p>Покупатель ищет товар с самовывозом в Талдыкоргане или доставкой по зоне логистики. Такие группы не смешиваем с сезонными агропоставками: другая посадочная и другой признак целевого контакта.</p>
          </article>
          <article class="yd-card yd-card--account">
            <span class="yd-card__visual" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none" focusable="false" aria-hidden="true"><path d="M4 19V5M4 19h16" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/><path d="M8 15v-4M12 15V8M16 15v-6" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>
            </span>
            <h3>Агропоставки без зоны отгрузки</h3>
            <p>Если в семантике живут запросы про поставку и выезд по области, а компания отдаёт только со склада в городе, расход уходит на интерес без сделки. Областной контур включаем лишь при реальной отгрузке и отдельном лимите.</p>
          </article>
          <article class="yd-card yd-card--b2b">
            <span class="yd-card__visual" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none" focusable="false" aria-hidden="true"><path d="M4 12a8 8 0 101.8-5.1" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/><path d="M4 4v5h5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>
            </span>
            <h3>Смешение с Алматы</h3>
            <p>Южные формулировки и широкая галочка по области смешивают пустой интерес и рабочие заявки из Талдыкоргана. В отчёте их потом почти невозможно развести без чистки гео и минус-листа.</p>
          </article>
          <article class="yd-card yd-card--local">
            <span class="yd-card__visual" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none" focusable="false" aria-hidden="true"><rect x="3" y="4" width="18" height="16" rx="2" stroke="currentColor" stroke-width="1.8"/><path d="M3 9h18M8 4v5" stroke="currentColor" stroke-width="1.8"/></svg>
            </span>
            <h3>Казахскоязычный спрос</h3>
            <p>Если есть живой KK-трафик и страница на kk, поднимаем отдельную ветку: собственные ключи, тексты и минус-лист без кальки с RU-набора.</p>
          </article>
        </div>
      </div>
    `;
h = replaceBetween(h, '<section class="rk-section" id="audience">', '<section class="rk-section" id="campaign-types">', audInner);

const campInner = `
      <div class="rk-container">
        <h2 class="rk-h2">В каком порядке подключаем форматы</h2>
        <p class="yd-section-lead">Открываем Поиск — намерение уже в запросе. Сеть, возврат и каталог добавляем после первых городских данных по Талдыкоргану.</p>
        <div class="yd-camp-grid">
          <article class="yd-camp yd-camp--search">
            <span class="yd-camp__visual" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none" focusable="false" aria-hidden="true"><circle cx="11" cy="11" r="6.5" stroke="currentColor" stroke-width="1.8"/><path d="M16 16l4 4" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>
            </span>
            <span class="yd-camp__meta">Поиск Яндекса</span>
            <h3>Поиск</h3>
            <p>Объявление попадает в выдачу по запросу на услугу, подряд, поставку или товар с выдачей в Талдыкоргане. Отсюда чаще всего приходят первые звонки и формы.</p>
          </article>
          <article class="yd-camp yd-camp--rsya">
            <span class="yd-camp__visual" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none" focusable="false" aria-hidden="true"><rect x="3" y="4" width="18" height="16" rx="2" stroke="currentColor" stroke-width="1.8"/><path d="M3 9h18M8 4v5" stroke="currentColor" stroke-width="1.8"/></svg>
            </span>
            <span class="yd-camp__meta">Сеть</span>
            <h3>РСЯ</h3>
            <p>Показы на площадках сети вне строки поиска. Возвращаем внимание тем, кто уже был на сайте; лимит сети отделяем от поискового.</p>
          </article>
          <article class="yd-camp yd-camp--remark">
            <span class="yd-camp__visual" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none" focusable="false" aria-hidden="true"><path d="M4 12a8 8 0 101.8-5.1" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/><path d="M4 4v5h5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>
            </span>
            <span class="yd-camp__meta">Возврат</span>
            <h3>Ретаргетинг</h3>
            <p>Возвращаем посетителей карточки и тех, кто не дошёл до отправки формы. Нужны цели Метрики и накопленный сегмент.</p>
          </article>
          <article class="yd-camp yd-camp--shop">
            <span class="yd-camp__visual" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none" focusable="false" aria-hidden="true"><rect x="3" y="7" width="18" height="13" rx="2" stroke="currentColor" stroke-width="1.8"/><path d="M8 7V6a4 4 0 018 0v1" stroke="currentColor" stroke-width="1.8"/></svg>
            </span>
            <span class="yd-camp__meta">Каталог</span>
            <h3>Товарные и динамические</h3>
            <p>Строятся на фиде: название, цена, остаток. Имеют смысл при свежей выгрузке и ясных условиях выдачи в Талдыкоргане.</p>
          </article>
          <article class="yd-camp yd-camp--smart">
            <span class="yd-camp__visual" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none" focusable="false" aria-hidden="true"><rect x="2" y="6" width="20" height="12" rx="2" stroke="currentColor" stroke-width="1.8"/><path d="M6 10h6M6 14h4" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>
            </span>
            <span class="yd-camp__meta">Баннер</span>
            <h3>Смарт-баннеры</h3>
            <p>Автоподбор позиций, которые человек уже смотрел. Включаем, когда карточки и фид приведены в порядок.</p>
          </article>
          <article class="yd-camp yd-camp--video">
            <span class="yd-camp__visual" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none" focusable="false" aria-hidden="true"><rect x="3" y="6" width="14" height="12" rx="2" stroke="currentColor" stroke-width="1.8"/><path d="M17 10l4-2v8l-4-2" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/></svg>
            </span>
            <span class="yd-camp__meta">Охват</span>
            <h3>Медийные форматы</h3>
            <p>Баннеры и видео по согласованным макетам. Подходят при длинном цикле выбора подрядчика или поставщика, когда бренд нужно показать заранее.</p>
          </article>
        </div>
      </div>
    `;
h = replaceBetween(h, '<section class="rk-section" id="campaign-types">', '<section class="rk-section" id="setup">', campInner);

const setupInner = `
      <div class="rk-container">
        <h2 class="rk-h2">Границы ежемесячного гонорара</h2>
        <p class="yd-section-lead">В гонорар входят первичная сборка под Талдыкорган и ежемесячное сопровождение. Клики и показы оплачивает владелец аккаунта со своего баланса. Доработки сайта, товарный фид и CRM-связку выносим отдельно, если без них нельзя зафиксировать обращение.</p>
        <ul class="yd-scope-list">
          <li class="yd-scope-list__item">
            <span class="yd-scope-list__icon" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" focusable="false" aria-hidden="true"><circle cx="11" cy="11" r="6.5" stroke="currentColor" stroke-width="1.8"/><path d="M16 16l4 4" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg></span>
            <div><h3>Спрос города</h3><p>Разбираем, какими словами в Яндексе ищут ваши услуги в Талдыкоргане и где посадочная уже закрывает запрос.</p></div>
          </li>
          <li class="yd-scope-list__item">
            <span class="yd-scope-list__icon" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" focusable="false" aria-hidden="true"><path d="M4 6h16M4 12h10M4 18h13" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg></span>
            <div><h3>Карта семантики</h3><p>Собираем, как ищут городской сервис, подряд, розницу и агропоставки на RU и KK, и сверяем с текстом сайта. Участки, где страница отвечает мимо запроса, фиксируем сразу.</p></div>
          </li>
          <li class="yd-scope-list__item">
            <span class="yd-scope-list__icon" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" focusable="false" aria-hidden="true"><path d="M5 7h14M5 12h10M5 17h12" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg></span>
            <div><h3>Правила до сборки</h3><p>На бумаге фиксируем критерий заявки, очередь форматов и допустимый радиус выезда по городу и области; отдельно решаем судьбу Алматы.</p></div>
          </li>
          <li class="yd-scope-list__item">
            <span class="yd-scope-list__icon" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" focusable="false" aria-hidden="true"><circle cx="12" cy="12" r="8" stroke="currentColor" stroke-width="1.8"/><path d="M8 12h8" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg></span>
            <div><h3>Минус-контур</h3><p>Собираем минус-листы под справочные и южные мегаполисные формулировки, если задача — только Талдыкорган и согласованные зоны Жетысу.</p></div>
          </li>
          <li class="yd-scope-list__item">
            <span class="yd-scope-list__icon" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" focusable="false" aria-hidden="true"><rect x="4" y="5" width="16" height="14" rx="2" stroke="currentColor" stroke-width="1.8"/><path d="M8 9h8M8 13h5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg></span>
            <div><h3>Лексика направлений</h3><p>Берём коммерческие ключи, городские маркеры и лексику сервиса, подряда и поставок. RU и KK списки ведём независимо.</p></div>
          </li>
          <li class="yd-scope-list__item">
            <span class="yd-scope-list__icon" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" focusable="false" aria-hidden="true"><path d="M5 19V5h14v10H9l-4 4z" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/></svg></span>
            <div><h3>Минус-слова</h3><p>Отсекаем справочные запросы, вакансии, названия пунктов области вне карты обслуживания и лишний интерес к Алматы.</p></div>
          </li>
          <li class="yd-scope-list__item">
            <span class="yd-scope-list__icon" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" focusable="false" aria-hidden="true"><circle cx="12" cy="12" r="8" stroke="currentColor" stroke-width="1.8"/><path d="M12 8v4l3 2" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg></span>
            <div><h3>Тексты объявлений</h3><p>Формулировки пишем под конкретный оффер и URL раздела, чтобы человек сразу видел, что именно можно заказать в Талдыкоргане.</p></div>
          </li>
          <li class="yd-scope-list__item">
            <span class="yd-scope-list__icon" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" focusable="false" aria-hidden="true"><path d="M4 19V5M4 19h16" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/><path d="M8 15v-5M12 15V7M16 15v-3" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg></span>
            <div><h3>Схема кабинета</h3><p>Поиск, сеть, возврат и товарные форматы держим разными кампаниями. Расход на область и Алматы выносим отдельными строками при необходимости.</p></div>
          </li>
          <li class="yd-scope-list__item">
            <span class="yd-scope-list__icon" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" focusable="false" aria-hidden="true"><rect x="4" y="4" width="16" height="16" rx="2" stroke="currentColor" stroke-width="1.8"/><path d="M8 12h8M12 8v8" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg></span>
            <div><h3>Объявления и расширения</h3><p>У каждой группы — свой заголовок и URL раздела. Быстрые ссылки, уточнения и визитку закрываем до модерации.</p></div>
          </li>
          <li class="yd-scope-list__item">
            <span class="yd-scope-list__icon" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" focusable="false" aria-hidden="true"><path d="M12 4v16M7 9l5-5 5 5M7 15l5 5 5-5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg></span>
            <div><h3>Гео, часы, устройства</h3><p>Закрепляем Талдыкорган, точечно добавляем пункты Жетысу, подстраиваем окно под приём звонков; приоритет — смартфоны.</p></div>
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

h = h.replace(/Раскладка кампаний · Костанай/g, "Раскладка кампаний · Талдыкорган");
h = h.replace(/Поиск · поставка · Костанай/g, "Поиск · сервис · Талдыкорган");
h = h.replace(/example\.kz › kst-supply/g, "example.kz › tdk-service");
h = h.replace(
  /Отгрузка \/ сервис в Костанае — пример/g,
  "Сервис / приём в Талдыкоргане — пример"
);
h = h.replace(/Сверка гео Костаная/g, "Сверка гео Талдыкоргана");
h = h.replace(
  /Сколько обращений придёт из Костаная/g,
  "Сколько обращений придёт из Талдыкоргана"
);

const decInner = `
      <div class="rk-container">
        <h2 class="rk-h2">Как стартуем в Талдыкоргане</h2>
        <div class="yd-decision-grid">
          <article class="yd-decision__card">
            <h3>Новый контур под город</h3>
            <p>Кабинета нет или старый не годится. Собираем структуру под Талдыкорган, цели Метрики и согласованный список пунктов Жетысу, решение по Алматы.</p>
          </article>
          <article class="yd-decision__card">
            <h3>Пересборка текущего аккаунта</h3>
            <p>Показы уже идут, но гео шире зоны продаж. Режем лишнее, отделяем город от Жетысуской области и Алматы, заново собираем группы.</p>
          </article>
          <article class="yd-decision__card">
            <h3>Усиление посадочной</h3>
            <p>Если страница отвечает мимо запроса или тормозит на телефоне, сначала чиним URL либо готовим отдельные посадочные под группы — иначе клики сгорают впустую.</p>
          </article>
        </div>
        <div class="yd-decision__actions">
          <button class="ctx-btn ctx-btn--primary" type="button" data-rk-open-modal="rk-modal-lead">Обсудить запуск в Талдыкоргане <span class="ctx-btn__arrow" aria-hidden="true">→</span></button>
        </div>
      </div>
    `;
h = replaceBetween(h, '<section class="rk-section" id="decision">', '<section class="rk-section" id="landing-analytics">', decInner);

const landInner = `
      <div class="rk-container yd-prose">
        <h2 class="rk-h2">Посадочная страница и обработка обращений</h2>
        <p>Объявление и первый экран должны совпадать: Талдыкорган, тип услуги, понятный способ связи. Общий шаблон без города и без кнопки после клика сливает часть бюджета в отказ.</p>
        <p>Метрика показывает, дошло ли обращение. Без событий оптимизация сводится к кликам. При готовом сайте связываем источник с CRM и скоростью ответа менеджера. Многоканальный сбор заявок — на странице <a href="/web-studiya/lidogeneratsiya/">лидогенерации</a>; органический спрос закрывает <a href="/web-studiya/seo-prodvizhenie/">SEO-продвижение</a>.</p>
      </div>
    `;
h = replaceBetween(h, '<section class="rk-section" id="landing-analytics">', '<section class="rk-section" id="process">', landInner);

const procInner = `
      <div class="rk-container">
        <h2 class="rk-h2">Удалённый запуск: пять шагов</h2>
        <ol class="yd-timeline">
          <li class="yd-timeline__item">
            <h3>Бриф и карта покрытия</h3>
            <p>Фиксируем направления бизнеса, границу Талдыкоргана, при необходимости список пунктов Жетысуской области, решение по Алматы, рамку расхода и пару примеров удачных обращений. Параллельно запрашиваем гостевые доступы в Директ и Метрику.</p>
          </li>
          <li class="yd-timeline__item">
            <h3>Ключи и группы</h3>
            <p>Ключи раскладываем по направлениям и сразу готовим минус-лист. Поиск, сеть и возврат — отдельные кампании; казахская ветка собирается своим списком.</p>
          </li>
          <li class="yd-timeline__item">
            <h3>Сборка в кабинете</h3>
            <p>Собираем объявления, регион, расписание, устройства и цели. Перед модерацией повторно сверяем URL посадочных и суточный потолок.</p>
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

h = h.replace(
  /aria-label="Обсудить Яндекс Директ в Костанае"/,
  'aria-label="Обсудить Яндекс Директ в Талдыкоргане"'
);
h = h.replace(
  /<h2>Обсудим Директ для проектов из Костаная<\/h2>/,
  "<h2>Обсудим Директ для проектов из Талдыкоргана</h2>"
);
h = h.replace(
  /Начинаем с ниши, карты отгрузки по городу, области и Рудному, действующего кабинета и счётчика\. После разбора назовём состав работ и цену\./,
  "Начинаем с ниши, карты приёма по Талдыкоргану, области Жетысу и решения по Алматы, действующего кабинета и счётчика. После разбора назовём состав работ и цену."
);

let faqHtml = `
      <div class="rk-container">
        <h2 class="rk-h2">Вопросы о Яндекс Директ в Талдыкоргане</h2>
        <div class="yd-faq" data-yd-faq>
`;
faqEntities.forEach((item, idx) => {
  const n = idx + 1;
  faqHtml += `          <div class="yd-faq__item">
            <h3 class="yd-faq__q">
              <button type="button" class="yd-faq__btn" data-yd-faq-btn aria-expanded="false" aria-controls="yd-tdk-faq-a${n}" id="yd-tdk-faq-q${n}">${item.q}</button>
            </h3>
            <div class="yd-faq__a" id="yd-tdk-faq-a${n}" role="region" aria-labelledby="yd-tdk-faq-q${n}" hidden>${item.a}</div>
          </div>
`;
});
faqHtml += `        </div>
      </div>
    `;
h = replaceBetween(h, '<section class="rk-section" id="faq">', '<section class="rk-section ctx-related"', faqHtml);

h = h.replace(
  /Контекстная реклама в Костанае/g,
  "Контекстная реклама в Талдыкоргане"
);
h = h.replace(/Google Ads в Костанае/g, "Google Ads в Талдыкоргане");

h = h.replace(
  /Кратко опишите направление, границу отгрузки и выезда по Костанаю, области и Рудному, плюс URL сайта\. Пришлём план структуры Директа, цели Метрики, объём работ и стоимость\. Работаем удалённо; офис компании — в Петропавловске\./,
  "Кратко опишите направление, границу приёма и выезда по Талдыкоргану, Жетысуской области и решение по Алматы, плюс URL сайта. Пришлём план структуры Директа, цели Метрики, объём работ и стоимость. Работаем удалённо; офис компании — в Петропавловске."
);
h = h.replace(
  /Кратко: ниша, зона отгрузки, ссылка на сайт — пришлём схему настройки Директа под Костанай\./,
  "Кратко: ниша, зона приёма, ссылка на сайт — пришлём схему настройки Директа под Талдыкорган."
);

h = h.replace(
  /Обсудим Яндекс Директ в Костанае/g,
  "Обсудим Яндекс Директ в Талдыкоргане"
);
h = h.replace(
  /Опишите нишу и сайт — разберём кабинет Директа, гео Костанай, Метрику и состав работ\./,
  "Опишите нишу и сайт — разберём кабинет Директа, гео Талдыкорган, Метрику и состав работ."
);

h = h.replace(/в Костанае/g, "в Талдыкоргане");
h = h.replace(/из Костаная/g, "из Талдыкоргана");
h = h.replace(/Костаная/g, "Талдыкоргана");
h = h.replace(/Костанае/g, "Талдыкоргане");
h = h.replace(/Костанайской области/g, "Жетысуской области");
h = h.replace(/Костанайскую область/g, "Жетысускую область");
h = h.replace(/Костанайская область/g, "Жетысуская область");
h = h.replace(/Костанайской/g, "Жетысуской");
h = h.replace(/Рудный/g, "Алматы");
h = h.replace(/Рудному/g, "Алматы");
h = h.replace(/Рудного/g, "Алматы");
h = h.replace(/Рудном/g, "Алматы");
h = h.replace(/Костанай/g, "Талдыкорган");
h = h.replace(/kostanay/g, "taldykorgan");
h = h.replace(/city-kst/g, "city-tdk");
h = h.replace(/agro-kst/g, "agro-tdk");
h = h.replace(/kst-supply/g, "tdk-service");

if (!h.includes("ydTdkChartFill") || !h.includes("ydTdkChartFill2")) {
  throw new Error("chart gradient ids missing");
}
if (h.includes("yd-kst-") || h.includes("ydKst") || h.includes("kostanay")) {
  throw new Error("leftover kostanay markers");
}
if (h.includes("Рудн") || h.includes("Костан")) {
  throw new Error("leftover kostanay/rudny prose: " + (h.match(/Костан\w*|Рудн\w*/g) || []).slice(0, 10));
}
if (h.includes("не X, а Y") || /не\s+\S+,\s+а\s+/i.test(h.replace(/не\s+смешиваем/g, ""))) {
  // soft check — skip hard fail on common Russian "не ... а"
}

fs.writeFileSync(OUT, h);
console.log("Wrote", OUT, "bytes", Buffer.byteLength(h));
console.log("TITLE:", TITLE);
console.log("H1:", H1);
console.log("DESC:", DESC);
