/**
 * TASK: build Astana Yandex Direct pilot from republican shell.
 * Reads: site_mirror/web-studiya/kontekstnaya-reklama/yandex-direct/index.html
 * Writes: site_mirror/web-studiya/kontekstnaya-reklama/yandex-direct/astana/index.html
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "../../..");
const srcPath = path.join(root, "site_mirror/web-studiya/kontekstnaya-reklama/yandex-direct/index.html");
const outDir = path.join(root, "site_mirror/web-studiya/kontekstnaya-reklama/yandex-direct/astana");
const outPath = path.join(outDir, "index.html");

const TITLE = "Яндекс Директ в Астане — настройка и ведение | Raskrutov";
const H1 = "Настройка и ведение Яндекс Директ в Астане";
const DESC =
  "Настраиваем и ведём Яндекс Директ для бизнеса в Астане: поиск, РСЯ, Метрика, цели, настройка, ведение и оптимизация рекламы под локальный спрос.";
const CANONICAL = "https://raskrutov.kz/web-studiya/kontekstnaya-reklama/yandex-direct/astana/";
const OG_IMAGE = "https://raskrutov.kz/assets/img/lidogeneratsiya/src-yandex-lg.webp";

const faqItems = [
  {
    q: "Сколько стоит настройка и ведение Яндекс Директа в Астане?",
    a: "Работа агентства начинается от 120 000 ₸ в месяц. Сумма зависит от числа кампаний, объёма фраз, РСЯ и глубины Метрики. Медиабюджет Яндекс Директа оплачивается отдельно в кабинете клиента.",
  },
  {
    q: "Можно ли ограничить показы только Астаной?",
    a: "Да. В Директе задаём географию на Астану и согласованные зоны обслуживания. Отдельно проверяем отчёты по местоположениям, чтобы отсечь интерес к городу из других регионов, если это не входит в задачу.",
  },
  {
    q: "Нужен ли офис агентства в Астане для ведения Директа?",
    a: "Нет. Работаем удалённо: доступы к кабинету Директа и Метрике, созвоны и отчёты. Офис Raskrutov находится в Петропавловске. Для настройки гео, фраз и целей физическое присутствие в столице не требуется.",
  },
  {
    q: "Какой медиабюджет нужен для запуска в Астане?",
    a: "Уровень зависит от конкуренции фраз, числа направлений и выбранных форматов Поиска и РСЯ. На старте выделяют сумму на набор статистики по основным группам. Конкретную рамку согласуем после аудита спроса и посадочной.",
  },
  {
    q: "Что входит в настройку Директа под Астану?",
    a: "Аудит ниши и сайта, семантика с учётом локальных формулировок, минус-фразы, структура кампаний, объявления, география Астаны, расписание, устройства, Яндекс Метрика, цели и проверка посадочных. Показы включаем после модерации и проверки целей.",
  },
  {
    q: "Нужны ли отдельные кампании на русском и казахском?",
    a: "Если аудитория отвечает на оба языка, семантику и объявления исследуем раздельно. Не смешиваем ru и kk в одной группе без проверки спроса: формулировки, минус-фразы и посадочные должны совпадать с языком запроса.",
  },
  {
    q: "Чем Поиск отличается от РСЯ для локального бизнеса?",
    a: "Поиск показывает объявление по запросу в Яндексе и обычно ближе к заявке. РСЯ показывает объявление на площадках сети и чаще работает на охват и возврат интереса. Бюджеты форматов ведём раздельно, чтобы читать расход.",
  },
  {
    q: "Обязательна ли Яндекс Метрика?",
    a: "Да. Без Метрики и согласованных целей Директ показывает клики и расход, но не обращение. Счётчик и цели формы, звонка или мессенджера настраиваем до запуска, чтобы оптимизация опиралась на действия, а не только на CTR.",
  },
  {
    q: "Можно ли работать с уже существующим кабинетом Директа?",
    a: "Да. Работаем в аккаунте клиента: сохраняем полезную историю, останавливаем слабые кампании и собираем структуру под гео Астаны. Доступ агентства выдаётся и отзывается по договорённости.",
  },
  {
    q: "Сколько времени занимает запуск?",
    a: "Срок зависит от готовности сайта, доступов к Директу и Метрике и объёма семантики. Фиксированный дедлайн запуска не обещаем: сначала согласуем структуру, затем проходим модерацию Яндекса и проверку целей.",
  },
  {
    q: "Нужна ли отдельная посадочная страница под Астану?",
    a: "Она полезна, если оффер, условия обслуживания и контакты привязаны к городу. Страница должна совпадать с текстом объявлений и принимать заявку с мобильного. При необходимости усиливаем посадочную до масштабирования бюджета.",
  },
  {
    q: "Какие данные нужны, чтобы начать работу по Астане?",
    a: "Доступы к Яндекс Директу и Метрике, перечень услуг или товаров, зоны обслуживания в Астане, контакты ответственного, рамка медиабюджета и примеры качественных обращений. По этому набору собираем план настройки.",
  },
];

function escJson(s) {
  return JSON.stringify(s);
}

function buildSchema() {
  const faqMain = faqItems.map((item) => ({
    "@type": "Question",
    name: item.q,
    acceptedAnswer: { "@type": "Answer", text: item.a },
  }));
  const graph = {
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
        "@id": `${CANONICAL}#webpage`,
        url: CANONICAL,
        name: TITLE,
        description: DESC,
        isPartOf: { "@id": "https://raskrutov.kz/#website" },
        about: { "@id": "https://raskrutov.kz/#organization" },
        mainEntity: { "@id": `${CANONICAL}#service` },
        breadcrumb: { "@id": `${CANONICAL}#breadcrumb` },
        inLanguage: "ru-KZ",
      },
      {
        "@type": "BreadcrumbList",
        "@id": `${CANONICAL}#breadcrumb`,
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
          { "@type": "ListItem", position: 5, name: "Астана", item: CANONICAL },
        ],
      },
      {
        "@type": "Service",
        "@id": `${CANONICAL}#service`,
        name: "Настройка и ведение Яндекс Директ в Астане",
        url: CANONICAL,
        provider: { "@id": "https://raskrutov.kz/#organization" },
        areaServed: {
          "@type": "City",
          name: "Astana",
          containedInPlace: { "@type": "Country", name: "Kazakhstan" },
        },
        serviceType: "Yandex Direct",
        description: DESC,
      },
      {
        "@type": "FAQPage",
        "@id": `${CANONICAL}#faq`,
        mainEntity: faqMain,
      },
    ],
  };
  return JSON.stringify(graph);
}

function buildFaqHtml() {
  return faqItems
    .map((item, i) => {
      const n = i + 1;
      return `          <div class="yd-faq__item">
            <h3 class="yd-faq__q">
              <button type="button" class="yd-faq__btn" data-yd-faq-btn aria-expanded="false" aria-controls="yd-ast-faq-a${n}" id="yd-ast-faq-q${n}">${item.q}</button>
            </h3>
            <div class="yd-faq__a" id="yd-ast-faq-a${n}" role="region" aria-labelledby="yd-ast-faq-q${n}" hidden>${item.a}</div>
          </div>`;
    })
    .join("\n");
}

function deepAsset(html) {
  return html.replaceAll("../../../assets/", "../../../../assets/").replaceAll('href="../../../favicon.ico"', 'href="../../../../favicon.ico"');
}

function extractBetween(html, startMarker, endMarker) {
  const start = html.indexOf(startMarker);
  const end = html.indexOf(endMarker, start);
  if (start < 0 || end < 0) throw new Error(`Markers not found: ${startMarker} … ${endMarker}`);
  return html.slice(start, end);
}

function buildMain() {
  return `<main id="main">
<nav class="rk-breadcrumbs" aria-label="Хлебные крошки">
      <ol>
        <li><a href="/">Главная</a></li>
        <li><a href="/web-studiya/">Студия</a></li>
        <li><a href="/web-studiya/kontekstnaya-reklama/">Контекстная реклама</a></li>
        <li><a href="/web-studiya/kontekstnaya-reklama/yandex-direct/">Яндекс Директ</a></li>
        <li><span aria-current="page">Астана</span></li>
      </ol>
    </nav>

    <section class="ctx-hero" id="ctx-hero" aria-label="Яндекс Директ в Астане">
      <div class="rk-container ctx-hero__grid">
        <div class="ctx-hero__copy">
          <h1 class="ctx-hero__title">${H1}</h1>
          <p class="ctx-hero__sub">Поиск, РСЯ и Метрика под локальный спрос столицы</p>
          <div class="yd-hero-price">
            <strong class="yd-hero-price__value">от 120 000 ₸ / мес</strong>
            <span class="yd-hero-price__note">Работа агентства · медиабюджет отдельно</span>
          </div>
          <p class="ctx-hero__lead">Собираем кампании Яндекс Директа с географией Астаны: фразы, объявления, цели Метрики и регулярная оптимизация. Работаем удалённо из офиса в Петропавловске — без претензии на офис в столице.</p>
          <div class="ctx-hero__actions">
            <button class="ctx-btn ctx-btn--primary" type="button" data-rk-open-modal="rk-modal-lead">Обсудить Директ в Астане <span class="ctx-btn__arrow" aria-hidden="true">→</span></button>
            <a class="ctx-btn ctx-btn--ghost" href="#setup">Стоимость и состав работ</a>
          </div>
          <div class="yd-trust-strip" role="list">
            <div class="yd-trust-strip__item" role="listitem">
              <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" focusable="false"><path d="M12 3l7 3v5c0 4.5-2.8 7.8-7 10-4.2-2.2-7-5.5-7-10V6l7-3z" stroke="currentColor" stroke-width="1.8"/><path d="M9.2 12.2l2 2 3.8-4" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>
              <span>Кабинет клиента</span>
            </div>
            <div class="yd-trust-strip__item" role="listitem">
              <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" focusable="false"><path d="M4 19V5M4 19h16" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/><path d="M8 15v-4M12 15V8M16 15v-6" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>
              <span>Цели Метрики</span>
            </div>
            <div class="yd-trust-strip__item" role="listitem">
              <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" focusable="false"><circle cx="12" cy="12" r="8" stroke="currentColor" stroke-width="1.8"/><path d="M4.5 12h15M12 4.5c2.2 2.4 2.2 12.6 0 15M12 4.5c-2.2 2.4-2.2 12.6 0 15" stroke="currentColor" stroke-width="1.5"/></svg>
              <span>Гео Астана</span>
            </div>
          </div>
        </div>
        <figure class="yd-hero-visual" aria-label="Демонстрационный интерфейс поискового объявления Яндекса для Астаны">
          <div class="yd-serp" aria-hidden="true">
            <div class="yd-serp__chrome">
              <span class="yd-serp__dot yd-serp__dot--r"></span>
              <span class="yd-serp__dot yd-serp__dot--y"></span>
              <span class="yd-serp__dot yd-serp__dot--g"></span>
              <span class="yd-serp__chrome-label">Поиск Яндекса · демо Астана</span>
            </div>
            <div class="yd-serp__search">
              <svg class="yd-serp__g" viewBox="0 0 24 24" focusable="false" aria-hidden="true"><rect x="2" y="2" width="20" height="20" rx="4" fill="#FC3F1D"/><text x="12" y="17" text-anchor="middle" fill="#fff" font-size="13" font-weight="700" font-family="Arial, sans-serif">Я</text></svg>
              <span class="yd-serp__query">яндекс директ услуги астана</span>
              <span class="yd-serp__search-btn" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none" focusable="false" aria-hidden="true"><circle cx="11" cy="11" r="6.5" stroke="currentColor" stroke-width="1.8"/><path d="M16 16l4 4" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>
              </span>
            </div>
            <div class="yd-serp__body">
              <div class="yd-serp__ads">
                <article class="yd-serp-ad">
                  <div class="yd-serp-ad__meta"><span class="yd-serp-ad__badge">Реклама</span><span class="yd-serp-ad__url">example.kz › astana</span></div>
                  <p class="yd-serp-ad__title">Услуги в Астане — демо объявление</p>
                  <p class="yd-serp-ad__desc">Локальный оффер, форма и цели Метрики. Пример без клиентских данных и KPI.</p>
                  <div class="yd-serp-ad__sitelinks"><span>Условия</span><span>Заявка</span><span>Контакты</span></div>
                </article>
                <article class="yd-serp-ad">
                  <div class="yd-serp-ad__meta"><span class="yd-serp-ad__badge">Реклама</span><span class="yd-serp-ad__url">example.kz › search-astana</span></div>
                  <p class="yd-serp-ad__title">Поиск и РСЯ под гео столицы</p>
                  <p class="yd-serp-ad__desc">Фразы, минус-фразы и расписание под обработку обращений из Астаны.</p>
                  <div class="yd-serp-ad__sitelinks"><span>Метрика</span><span>Отчёт</span></div>
                </article>
                <article class="yd-serp-ad yd-serp-ad--compact">
                  <div class="yd-serp-ad__meta"><span class="yd-serp-ad__badge">Реклама</span><span class="yd-serp-ad__url">example.kz › catalog-astana</span></div>
                  <p class="yd-serp-ad__title">Товарные форматы с доставкой по городу</p>
                  <p class="yd-serp-ad__desc">Демо каталога при готовом фиде. Без клиентских показателей.</p>
                </article>
              </div>
              <aside class="yd-serp__aside">
                <div class="yd-serp-panel">
                  <p class="yd-serp-panel__title">Кабинет Директа · демо Астана</p>
                  <ul class="yd-serp-panel__list">
                    <li><span>Поиск · Астана</span><em class="yd-status yd-status--ok">Активна</em></li>
                    <li><span>География</span><em class="yd-status yd-status--ok">Астана</em></li>
                    <li><span>РСЯ · возврат</span><em class="yd-status yd-status--warn">В работе</em></li>
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
                      <linearGradient id="ydAstChartFill" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stop-color="#FC3F1D" stop-opacity="0.28"/>
                        <stop offset="100%" stop-color="#FC3F1D" stop-opacity="0"/>
                      </linearGradient>
                    </defs>
                    <path d="M0 42 C24 38, 36 28, 52 30 C72 33, 84 18, 104 20 C124 22, 136 12, 160 14 L160 56 L0 56 Z" fill="url(#ydAstChartFill)"/>
                    <path d="M0 42 C24 38, 36 28, 52 30 C72 33, 84 18, 104 20 C124 22, 136 12, 160 14" fill="none" stroke="#FC3F1D" stroke-width="2.2" stroke-linecap="round"/>
                  </svg>
                </div>
              </aside>
            </div>
          </div>
          <figcaption class="yd-hero-visual__caption">Демонстрационный интерфейс · гео Астана · без клиентских данных</figcaption>
        </figure>
      </div>
    </section>

    <section class="rk-section" id="short-answer">
      <div class="rk-container yd-prose">
        <div class="yd-about-heading">
          <svg class="yd-about-heading__icon" viewBox="0 0 44 44" width="44" height="44" aria-hidden="true" focusable="false">
            <rect width="44" height="44" rx="10" fill="#FC3F1D"/>
            <text x="22" y="30" text-anchor="middle" fill="#fff" font-size="22" font-weight="700" font-family="Arial, sans-serif">Я</text>
          </svg>
          <h2 class="rk-h2 yd-about-heading__title">Что входит в настройку для Астаны</h2>
        </div>
        <p>Для рекламодателя в столице Директ собираем как локальный контур: география Астаны и согласованные зоны, семантика с городскими формулировками, объявления под оффер и посадочную, расписание под часы обработки заявок, устройства и цели Метрики. Республиканская страница <a href="/web-studiya/kontekstnaya-reklama/yandex-direct/">Яндекс Директ в Казахстане</a> описывает общий стек; эта страница — про работу с гео столицы.</p>
        <p>Ведём удалённо: доступы, созвоны, отчёты. Офис компании — в Петропавловске. Результат зависит от спроса, оффера, сайта, бюджета, конкуренции и скорости обработки обращения; фиксированный поток заявок не обещаем.</p>
      </div>
    </section>

    <section class="rk-section" id="local-config">
      <div class="rk-container">
        <h2 class="rk-h2">Локальная конфигурация кампаний</h2>
        <p class="yd-section-lead">До запуска фиксируем параметры, которые определяют качество трафика из Астаны.</p>
        <div class="yd-artifact-grid">
          <article class="yd-artifact yd-artifact--cabinet">
            <span class="yd-demo-label">География</span>
            <h3 class="yd-artifact__title">Астана и зоны обслуживания</h3>
            <p class="yd-artifact__note">Задаём город, при необходимости — выездной радиус. Проверяем отчёты по местоположениям, чтобы расход не уходил на интерес к Астане из других регионов без договорённости.</p>
          </article>
          <article class="yd-artifact yd-artifact--flow">
            <span class="yd-demo-label">Языки</span>
            <h3 class="yd-artifact__title">Русский и казахский отдельно</h3>
            <p class="yd-artifact__note">Спрос на ru и kk исследуем раздельно: фразы, минус-фразы, объявления и посадочные. Смешиваем языки в одной группе только после проверки фактических запросов.</p>
          </article>
          <article class="yd-artifact yd-artifact--flow">
            <span class="yd-demo-label">Расписание и устройства</span>
            <h3 class="yd-artifact__title">Часы обработки и мобильный сценарий</h3>
            <p class="yd-artifact__note">Показы связываем с часами, когда команда реально отвечает. На мобильном проверяем клик по телефону, WhatsApp и форму — типичный путь обращения в городе.</p>
          </article>
          <article class="yd-artifact yd-artifact--report">
            <span class="yd-demo-label">Цели и качество</span>
            <h3 class="yd-artifact__title">Метрика и критерии лида</h3>
            <p class="yd-artifact__note">Цели формы, звонка и мессенджера согласуем до старта. При обратной связи от продаж учитываем, какие обращения из Астаны считать целевыми.</p>
          </article>
        </div>
      </div>
    </section>

    <section class="rk-section" id="audience">
      <div class="rk-container">
        <h2 class="rk-h2">Кому подходит Директ в Астане</h2>
        <p class="yd-section-lead">Сценарии ниже — типовые задачи. Мы не заявляем выполненные локальные кейсы на этой странице.</p>
        <div class="yd-card-grid">
          <article class="yd-card yd-card--local">
            <span class="yd-card__visual" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none" focusable="false" aria-hidden="true"><path d="M12 21s7-6.2 7-11a7 7 0 10-14 0c0 4.8 7 11 7 11z" stroke="currentColor" stroke-width="1.8"/><circle cx="12" cy="10" r="2.2" stroke="currentColor" stroke-width="1.8"/></svg>
            </span>
            <h3>Городские услуги с выездом</h3>
            <p>Когда клиент ищет исполнителя в Астане или в согласованных районах и готов оставить заявку или позвонить.</p>
          </article>
          <article class="yd-card yd-card--b2b">
            <span class="yd-card__visual" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none" focusable="false" aria-hidden="true"><rect x="4" y="7" width="16" height="12" rx="2" stroke="currentColor" stroke-width="1.8"/><path d="M8 7V5.8A2.8 2.8 0 0110.8 3h2.4A2.8 2.8 0 0116 5.8V7" stroke="currentColor" stroke-width="1.8"/></svg>
            </span>
            <h3>B2B и проектные услуги</h3>
            <p>Когда запрос формулируют в Поиске Яндекса, а сделка начинается с брифа, КП или созвона.</p>
          </article>
          <article class="yd-card yd-card--ecom">
            <span class="yd-card__visual" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none" focusable="false" aria-hidden="true"><path d="M6 8h12l-1 11H7L6 8z" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/><path d="M9 8V6.5A3 3 0 0112 3.5 3 3 0 0115 6.5V8" stroke="currentColor" stroke-width="1.8"/></svg>
            </span>
            <h3>Интернет-магазины с доставкой по городу</h3>
            <p>При каталоге, фиде, актуальных ценах и возможности отследить заказ или заявку из Астаны.</p>
          </article>
          <article class="yd-card yd-card--account">
            <span class="yd-card__visual" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none" focusable="false" aria-hidden="true"><path d="M4 19V5M4 19h16" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/><path d="M8 15v-4M12 15V8M16 15v-6" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>
            </span>
            <h3>Действующий кабинет Директа</h3>
            <p>Если кампании уже крутятся, но гео, фразы или цели Метрики мешают читать расход по столице.</p>
          </article>
          <article class="yd-card yd-card--b2b">
            <span class="yd-card__visual" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none" focusable="false" aria-hidden="true"><path d="M4 12a8 8 0 101.8-5.1" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/><path d="M4 4v5h5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>
            </span>
            <h3>Мультиканальный спрос</h3>
            <p>Когда нужен Поиск под заявку и отдельно РСЯ/ретаргетинг для возврата тех, кто уже смотрел оффер.</p>
          </article>
          <article class="yd-card yd-card--local">
            <span class="yd-card__visual" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none" focusable="false" aria-hidden="true"><rect x="3" y="4" width="18" height="16" rx="2" stroke="currentColor" stroke-width="1.8"/><path d="M3 9h18M8 4v5" stroke="currentColor" stroke-width="1.8"/></svg>
            </span>
            <h3>Несколько направлений в одном городе</h3>
            <p>Когда услуги лучше развести по группам и посадочным, чтобы запрос из Астаны вёл на релевантный оффер.</p>
          </article>
        </div>
      </div>
    </section>

    <section class="rk-section" id="campaign-types">
      <div class="rk-container">
        <h2 class="rk-h2">Форматы кампаний для Астаны</h2>
        <p class="yd-section-lead">Набор зависит от спроса, длины сделки и готовности сайта. Ниже — форматы, с которыми работаем в Директе.</p>
        <div class="yd-camp-grid">
          <article class="yd-camp yd-camp--search">
            <span class="yd-camp__visual" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none" focusable="false" aria-hidden="true"><circle cx="11" cy="11" r="6.5" stroke="currentColor" stroke-width="1.8"/><path d="M16 16l4 4" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>
            </span>
            <span class="yd-camp__meta">Поиск Яндекса</span>
            <h3>Поиск</h3>
            <p>Текстовые объявления по коммерческим фразам с локальными уточнениями. База для услуг с явным намерением оставить обращение.</p>
          </article>
          <article class="yd-camp yd-camp--rsya">
            <span class="yd-camp__visual" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none" focusable="false" aria-hidden="true"><rect x="3" y="4" width="18" height="16" rx="2" stroke="currentColor" stroke-width="1.8"/><path d="M3 9h18M8 4v5" stroke="currentColor" stroke-width="1.8"/></svg>
            </span>
            <span class="yd-camp__meta">Сеть</span>
            <h3>РСЯ</h3>
            <p>Показы на площадках сети. Используем для охвата и возврата интереса; бюджет ведём отдельно от Поиска.</p>
          </article>
          <article class="yd-camp yd-camp--remark">
            <span class="yd-camp__visual" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none" focusable="false" aria-hidden="true"><path d="M4 12a8 8 0 101.8-5.1" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/><path d="M4 4v5h5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>
            </span>
            <span class="yd-camp__meta">Возврат</span>
            <h3>Ретаргетинг</h3>
            <p>Повторный контакт с посетителями сайта и незавершёнными заявками при настроенных целях Метрики.</p>
          </article>
          <article class="yd-camp yd-camp--shop">
            <span class="yd-camp__visual" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none" focusable="false" aria-hidden="true"><rect x="3" y="7" width="18" height="13" rx="2" stroke="currentColor" stroke-width="1.8"/><path d="M8 7V6a4 4 0 018 0v1" stroke="currentColor" stroke-width="1.8"/></svg>
            </span>
            <span class="yd-camp__meta">Каталог</span>
            <h3>Товарные и динамические</h3>
            <p>Объявления из фида и динамическая подстановка оффера. Нужны актуальные цены, наличие и рабочие карточки.</p>
          </article>
          <article class="yd-camp yd-camp--smart">
            <span class="yd-camp__visual" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none" focusable="false" aria-hidden="true"><rect x="2" y="6" width="20" height="12" rx="2" stroke="currentColor" stroke-width="1.8"/><path d="M6 10h6M6 14h4" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>
            </span>
            <span class="yd-camp__meta">Баннер</span>
            <h3>Смарт-баннеры</h3>
            <p>Визуальные блоки с товарами для тех, кто смотрел ассортимент. Собираем при готовом фиде.</p>
          </article>
          <article class="yd-camp yd-camp--video">
            <span class="yd-camp__visual" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none" focusable="false" aria-hidden="true"><rect x="3" y="6" width="14" height="12" rx="2" stroke="currentColor" stroke-width="1.8"/><path d="M17 10l4-2v8l-4-2" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/></svg>
            </span>
            <span class="yd-camp__meta">Охват</span>
            <h3>Медийные форматы</h3>
            <p>Баннеры и видео при согласованных креативах. Подключаем, когда нише нужен визуальный контакт до запроса.</p>
          </article>
        </div>
      </div>
    </section>

    <section class="rk-section" id="setup">
      <div class="rk-container">
        <h2 class="rk-h2">Состав работ и стоимость</h2>
        <p class="yd-section-lead">В оплату агентства входят настройка кабинета Директа под Астану, Метрика и ежемесячное ведение. Медиабюджет Яндекса клиент оплачивает отдельно. Доработки сайта и интеграции считаем отдельно, если они потребуются.</p>
        <ul class="yd-scope-list">
          <li class="yd-scope-list__item">
            <span class="yd-scope-list__icon" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" focusable="false" aria-hidden="true"><circle cx="11" cy="11" r="6.5" stroke="currentColor" stroke-width="1.8"/><path d="M16 16l4 4" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg></span>
            <div><h3>Аудит ниши, сайта и аккаунта</h3><p>Разбираем спрос в Яндексе по Астане, посадочные и текущий кабинет Директа, если он уже есть.</p></div>
          </li>
          <li class="yd-scope-list__item">
            <span class="yd-scope-list__icon" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" focusable="false" aria-hidden="true"><path d="M4 6h16M4 12h10M4 18h13" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg></span>
            <div><h3>Стратегия под гео столицы</h3><p>Фиксируем цели обращений, форматы Поиска и РСЯ, зоны Астаны и рамки расхода.</p></div>
          </li>
          <li class="yd-scope-list__item">
            <span class="yd-scope-list__icon" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" focusable="false" aria-hidden="true"><path d="M5 7h14M5 12h10M5 17h12" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg></span>
            <div><h3>Семантика и языки</h3><p>Собираем коммерческие фразы, локальные уточнения; ru и kk исследуем раздельно при наличии спроса.</p></div>
          </li>
          <li class="yd-scope-list__item">
            <span class="yd-scope-list__icon" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" focusable="false" aria-hidden="true"><circle cx="12" cy="12" r="8" stroke="currentColor" stroke-width="1.8"/><path d="M8 12h8" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg></span>
            <div><h3>Минус-фразы и чистка</h3><p>Отсекаем нецелевые формулировки, иногородний интерес без договорённости и слабые площадки РСЯ.</p></div>
          </li>
          <li class="yd-scope-list__item">
            <span class="yd-scope-list__icon" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" focusable="false" aria-hidden="true"><rect x="4" y="5" width="16" height="14" rx="2" stroke="currentColor" stroke-width="1.8"/><path d="M8 9h8M8 13h5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg></span>
            <div><h3>Структура кампаний</h3><p>Делим Поиск, РСЯ, ретаргетинг и товарные форматы так, чтобы расход по Астане читался в кабинете.</p></div>
          </li>
          <li class="yd-scope-list__item">
            <span class="yd-scope-list__icon" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" focusable="false" aria-hidden="true"><path d="M5 19V5h14v10H9l-4 4z" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/></svg></span>
            <div><h3>Объявления и дополнения</h3><p>Пишем заголовки, тексты, быстрые ссылки и уточнения под оффер и посадочную.</p></div>
          </li>
          <li class="yd-scope-list__item">
            <span class="yd-scope-list__icon" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" focusable="false" aria-hidden="true"><circle cx="12" cy="12" r="8" stroke="currentColor" stroke-width="1.8"/><path d="M12 8v4l3 2" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg></span>
            <div><h3>География, расписание, устройства</h3><p>Задаём Астану и зоны, часы обработки заявок и корректировки по устройствам.</p></div>
          </li>
          <li class="yd-scope-list__item">
            <span class="yd-scope-list__icon" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" focusable="false" aria-hidden="true"><path d="M4 19V5M4 19h16" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/><path d="M8 15v-5M12 15V7M16 15v-3" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg></span>
            <div><h3>Яндекс Метрика и цели</h3><p>Настраиваем счётчик, цели формы, звонка и других согласованных действий до включения показов.</p></div>
          </li>
          <li class="yd-scope-list__item">
            <span class="yd-scope-list__icon" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" focusable="false" aria-hidden="true"><rect x="4" y="4" width="16" height="16" rx="2" stroke="currentColor" stroke-width="1.8"/><path d="M8 12h8M12 8v8" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg></span>
            <div><h3>Проверка посадочных</h3><p>Сверяем оффер, форму, мобильную версию и скорость страницы, куда ведёт объявление.</p></div>
          </li>
          <li class="yd-scope-list__item">
            <span class="yd-scope-list__icon" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" focusable="false" aria-hidden="true"><path d="M12 4v16M7 9l5-5 5 5M7 15l5 5 5-5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg></span>
            <div><h3>Запуск после проверки</h3><p>Включаем показы после модерации, проверки целей и согласованных лимитов. Фиксированный дедлайн не обещаем.</p></div>
          </li>
          <li class="yd-scope-list__item">
            <span class="yd-scope-list__icon" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" focusable="false" aria-hidden="true"><path d="M8 12a4 4 0 108 0 4 4 0 10-8 0z" stroke="currentColor" stroke-width="1.8"/><path d="M4 20c1.5-3 4-4.5 8-4.5S18.5 17 20 20" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg></span>
            <div><h3>Регулярная оптимизация</h3><p>Чистим фразы и площадки, правим объявления, перераспределяем расход по рабочим связкам Астаны.</p></div>
          </li>
          <li class="yd-scope-list__item">
            <span class="yd-scope-list__icon" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" focusable="false" aria-hidden="true"><path d="M7 4h10v16H7z" stroke="currentColor" stroke-width="1.8"/><path d="M10 8h4M10 12h4M10 16h3" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg></span>
            <div><h3>Отчётность</h3><p>Фиксируем выполненные работы, найденные проблемы и план на следующий период.</p></div>
          </li>
        </ul>

        <div class="yd-price-board" id="pricing">
          <p class="yd-price-board__value">от 120 000 ₸ / мес</p>
          <p class="yd-price-board__lead">Оплата работы агентства. Медиабюджет Яндекс Директа клиент вносит в кабинет отдельно. Интеграции и доработки сайта в эту сумму не входят.</p>
          <ul>
            <li>На стоимость ведения влияют число кампаний, объём семантики, РСЯ и глубина Метрики.</li>
            <li>Клики и показы оплачиваются в Директе по фактическому расходу.</li>
            <li>Сравнение Директа и Google Ads — на странице <a href="/web-studiya/kontekstnaya-reklama/astana/">контекстной рекламы в Астане</a>.</li>
          </ul>
        </div>
      </div>
    </section>

    <section class="rk-section" id="control">
      <div class="rk-container">
        <h2 class="rk-h2">Что получает и контролирует клиент</h2>
        <p class="yd-section-lead">Рекламный аккаунт принадлежит клиенту. Агентство подключается по согласованному доступу. История кампаний сохраняется, платёжные данные остаются у владельца. Клиент видит расходы и кампании; лимиты бюджета и цели Метрики согласуем до запуска.</p>
        <div class="yd-artifact-grid">
          <article class="yd-artifact yd-artifact--cabinet">
            <span class="yd-demo-label">Демонстрационный интерфейс</span>
            <h3 class="yd-artifact__title">Структура кампаний · Астана</h3>
            <div class="yd-artifact__body">
              <div class="yd-tree" aria-hidden="true">
                <div class="yd-tree__row">
                  <span class="yd-tree__label">Кампания · Поиск · Астана</span>
                  <em class="yd-status yd-status--ok">Активна</em>
                </div>
                <div class="yd-tree__row yd-tree__row--child">
                  <span class="yd-tree__label">Группа · Коммерческие фразы</span>
                  <em class="yd-status yd-status--ok">Готово</em>
                </div>
                <div class="yd-tree__row yd-tree__row--child">
                  <span class="yd-tree__label">Группа · Локальные уточнения</span>
                  <em class="yd-status yd-status--warn">Настройка</em>
                </div>
                <div class="yd-tree__meta">
                  <span>Фразы</span>
                  <span>Минус-фразы</span>
                  <span>Гео Астана</span>
                </div>
              </div>
              <div class="yd-ad-draft" aria-hidden="true">
                <p class="yd-ad-draft__kicker">Черновик объявления · демо</p>
                <p class="yd-ad-draft__url">example.kz › astana</p>
                <p class="yd-ad-draft__title">Услуги в Астане — пример</p>
                <p class="yd-ad-draft__desc">Демонстрационный текст без клиентских показателей и обещаний результата.</p>
              </div>
            </div>
            <p class="yd-artifact__note">Пример без клиентских данных: кампании и гео видны владельцу кабинета.</p>
          </article>

          <article class="yd-artifact yd-artifact--flow">
            <span class="yd-demo-label">Демо</span>
            <h3 class="yd-artifact__title">Цели Яндекс Метрики</h3>
            <div class="yd-artifact__cols" aria-hidden="true">
              <ul class="yd-mini-list">
                <li><span>Отправка формы</span><em class="yd-status yd-status--ok">Цель</em></li>
                <li><span>Клик по телефону</span><em class="yd-status yd-status--ok">Цель</em></li>
                <li><span>Мессенджер</span><em class="yd-status yd-status--warn">По согласованию</em></li>
              </ul>
              <ul class="yd-mini-list">
                <li><span>Счётчик Метрики</span><em class="yd-status yd-status--ok">Готово</em></li>
                <li><span>Состав цели</span><em class="yd-status yd-status--ok">Согласован</em></li>
                <li><span>Дубли событий</span><em class="yd-status yd-status--warn">Проверка</em></li>
              </ul>
            </div>
            <p class="yd-artifact__note">Цели согласуем с тем, что реально происходит на сайте. Это схема, а не отчёт клиента.</p>
          </article>

          <article class="yd-artifact yd-artifact--flow">
            <span class="yd-demo-label">Пример без клиентских данных</span>
            <h3 class="yd-artifact__title">Контроль источников обращений</h3>
            <div class="yd-flow-track" aria-hidden="true">
              <span>Директ</span>
              <span class="yd-flow-track__arrow"></span>
              <span>Посадочная</span>
              <span class="yd-flow-track__arrow"></span>
              <span>Цель Метрики</span>
              <span class="yd-flow-track__arrow"></span>
              <span>CRM</span>
            </div>
            <div class="yd-mini-chart">
              <p>Схема расхода · без числовых обещаний</p>
              <svg viewBox="0 0 160 56" focusable="false" aria-hidden="true" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="ydAstChartFill2" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stop-color="#FC3F1D" stop-opacity="0.22"/>
                    <stop offset="100%" stop-color="#FC3F1D" stop-opacity="0"/>
                  </linearGradient>
                </defs>
                <path d="M0 40 C22 36, 34 24, 50 26 C70 29, 84 16, 104 18 C124 20, 138 10, 160 12 L160 56 L0 56 Z" fill="url(#ydAstChartFill2)"/>
                <path d="M0 40 C22 36, 34 24, 50 26 C70 29, 84 16, 104 18 C124 20, 138 10, 160 12" fill="none" stroke="#FC3F1D" stroke-width="2.2" stroke-linecap="round"/>
              </svg>
            </div>
            <p class="yd-artifact__note">Лимиты дневного и месячного расхода фиксируем в кабинете. UTM и CRM подключаем, если сайт к этому готов.</p>
          </article>

          <article class="yd-artifact yd-artifact--report">
            <span class="yd-demo-label">Демонстрационный интерфейс</span>
            <div class="yd-report-head">
              <h3 class="yd-artifact__title">Отчёт и план работ</h3>
              <span class="yd-report-head__period">Период · демо</span>
            </div>
            <div class="yd-report-grid" aria-hidden="true">
              <div>
                <p class="yd-report-grid__label">Выполненные работы</p>
                <ul>
                  <li>Минус-фразы Поиска</li>
                  <li>Проверка гео Астаны</li>
                  <li>Цели Метрики</li>
                </ul>
              </div>
              <div>
                <p class="yd-report-grid__label">Найденные проблемы</p>
                <ul>
                  <li>Широкие формулировки</li>
                  <li>Слабая мобильная форма</li>
                  <li>Смешение языков в группе</li>
                </ul>
              </div>
              <div>
                <p class="yd-report-grid__label">План</p>
                <ul>
                  <li>Новые локальные группы</li>
                  <li>Тест заголовков</li>
                  <li>Контроль лимитов</li>
                </ul>
              </div>
            </div>
            <p class="yd-artifact__note">Отчёт описывает работы, проблемы и следующий шаг. Здесь нет вымышленных заявок и CPL.</p>
          </article>
        </div>

        <div class="yd-control-follow">
          <ul class="yd-check-list">
            <li>Кабинет Яндекс Директа оформлен на клиента</li>
            <li>Доступ агентства согласован и отключается после завершения работ</li>
            <li>История кампаний и объявлений остаётся у владельца</li>
            <li>Платёжные данные и привязанные карты не передаются агентству в обход клиента</li>
            <li>Расход, лимиты и статусы кампаний видны в кабинете</li>
            <li>Цели Метрики согласованы до запуска</li>
            <li>Отчёт содержит работы, проблемы и план, а не набор обещаний</li>
          </ul>
          <p class="yd-disclaimer">Число обращений из Астаны зависит от спроса в Яндексе, оффера, качества сайта, бюджета, конкуренции и скорости обработки заявки. Фиксированный CPL и гарантированный поток заявок без разбора ниши не обещаем.</p>
        </div>
      </div>
    </section>

    <section class="rk-section" id="decision">
      <div class="rk-container">
        <h2 class="rk-h2">Сценарии старта</h2>
        <div class="yd-decision-grid">
          <article class="yd-decision__card">
            <h3>Запуск с нуля под Астану</h3>
            <p>Кабинета нет или были короткие тесты. Собираем фразы, гео, объявления, Метрику и включаем показы после проверки.</p>
          </article>
          <article class="yd-decision__card">
            <h3>Аудит и пересборка гео</h3>
            <p>Кампании крутятся, но расход размазан по стране или целям. Сохраняем полезную историю и собираем контур под Астану.</p>
          </article>
          <article class="yd-decision__card">
            <h3>Регулярное ведение</h3>
            <p>Нужны ежемесячная оптимизация, отчёт и контроль лимитов после запуска. Смотрим стоимость обращения и качество трафика.</p>
          </article>
        </div>
        <div class="yd-decision__actions">
          <button class="ctx-btn ctx-btn--primary" type="button" data-rk-open-modal="rk-modal-lead">Обсудить запуск в Астане <span class="ctx-btn__arrow" aria-hidden="true">→</span></button>
        </div>
      </div>
    </section>

    <section class="rk-section" id="landing-analytics">
      <div class="rk-container yd-prose">
        <h2 class="rk-h2">Посадочная страница и обработка лидов</h2>
        <p>Объявление приводит визит, а обращение зависит от оффера, формы, мобильной версии и скорости ответа. Если посадочная слабая, сначала усиливаем её или собираем страницы под группы Директа. О разработке — в разделе <a href="/web-studiya/sozdanie-saitov/">создание сайтов</a>.</p>
        <p>Яндекс Метрика показывает, сработала ли цель. Без корректных целей ведение сводится к кликам. При готовности сайта связываем обращения с CRM и скоростью обработки заявки. Сбор заявок из нескольких каналов — на странице <a href="/web-studiya/lidogeneratsiya/">лидогенерации</a>. Органическую видимость в поиске закрывает <a href="/web-studiya/seo-prodvizhenie/">SEO-продвижение</a>.</p>
      </div>
    </section>

    <section class="rk-section" id="process">
      <div class="rk-container">
        <h2 class="rk-h2">Этапы запуска</h2>
        <ol class="yd-timeline">
          <li class="yd-timeline__item">
            <h3>Бриф, доступы и аудит</h3>
            <p>Собираем услуги или ассортимент, зоны Астаны, рамку бюджета и критерии качественного обращения. Смотрим посадочные и текущие цели Метрики. Подключаемся к кабинету Директа клиента.</p>
          </li>
          <li class="yd-timeline__item">
            <h3>Семантика и структура кампаний</h3>
            <p>Собираем фразы, минус-фразы и группы. Раскладываем Поиск, РСЯ, ретаргетинг и товарные форматы по задачам. Языки ru/kk исследуем раздельно при необходимости.</p>
          </li>
          <li class="yd-timeline__item">
            <h3>Объявления, Метрика, цели и география</h3>
            <p>Готовим тексты и дополнения. Настраиваем цели формы и звонка. Задаём Астану, зоны обслуживания, расписание и устройства.</p>
          </li>
          <li class="yd-timeline__item">
            <h3>Запуск после проверки</h3>
            <p>Включаем кампании, когда модерация пройдена, цели срабатывают и лимиты расхода согласованы. Срок зависит от готовности материалов — фиксированный дедлайн не обещаем.</p>
          </li>
          <li class="yd-timeline__item">
            <h3>Оптимизация и отчётность</h3>
            <p>Чистим нецелевые фразы и площадки, правим объявления, перераспределяем бюджет. Отчёт фиксирует работы и план.</p>
          </li>
        </ol>
      </div>
    </section>

    <section class="ctx-cta-band" aria-label="Обсудить Яндекс Директ в Астане">
      <div class="rk-container">
        <h2>Готовы обсудить Яндекс Директ для Астаны?</h2>
        <p>Разберём нишу, гео столицы, кабинет Директа и Метрику — и предложим понятный состав работ.</p>
        <button class="ctx-btn ctx-btn--light" type="button" data-rk-open-modal="rk-modal-lead">Оставить заявку</button>
      </div>
    </section>

    <section class="rk-section" id="faq">
      <div class="rk-container">
        <h2 class="rk-h2">Частые вопросы о Директе в Астане</h2>
        <div class="yd-faq" data-yd-faq>
${buildFaqHtml()}
        </div>
      </div>
    </section>

    <section class="rk-section ctx-related" id="related" aria-label="Связанные услуги">
      <div class="rk-container">
        <h2 class="rk-h2">Связанные страницы</h2>
        <div class="ctx-related__grid">
          <a href="/web-studiya/kontekstnaya-reklama/yandex-direct/">Яндекс Директ в Казахстане</a>
          <a href="/web-studiya/kontekstnaya-reklama/astana/">Контекстная реклама в Астане</a>
          <a href="/web-studiya/kontekstnaya-reklama/google-ads/astana/">Google Ads в Астане</a>
          <a href="/web-studiya/seo-prodvizhenie/">SEO-продвижение</a>
          <a href="/web-studiya/sozdanie-saitov/">Создание сайтов</a>
          <a href="/web-studiya/lidogeneratsiya/">Лидогенерация</a>
          <a href="/keysy/">Кейсы</a>
          <a href="/kontakty/">Контакты</a>
        </div>
      </div>
    </section>

<section class="rk-section rk-section--contacts" id="contacts">
      <div class="rk-container">
        <h2 class="rk-h2">Контакты</h2>
        <div class="rk-contacts">
          <div class="rk-contacts__aside">
            <div class="rk-contacts__line" aria-hidden="true"></div>
            <p class="rk-contacts__intro">Обсудим настройку и ведение Яндекс Директа для Астаны: Поиск, РСЯ, Метрику и состав работ. Оставьте контакты — ответим и предложим план. Работаем удалённо; офис — в Петропавловске.</p>
            <div class="rk-form rk-form--contacts">
              <p class="rk-form__title">Отправьте заявку</p>
              <p class="rk-form__lead">Коротко опишите нишу и сайт — подготовим план работ в Директе под Астану.</p>
              <form id="rk-form-contacts-yd-astana" name="contacts_yandex_direct_astana" data-lead-form data-form-name="Контакты — Яндекс Директ Астана" novalidate>
                <div class="rk-field">
                  <label for="yd-ast-contact-name">Имя: <span class="rk-req" aria-hidden="true">*</span></label>
                  <input id="yd-ast-contact-name" type="text" name="name" maxlength="200" autocomplete="name">
                </div>
                <div class="rk-field">
                  <label for="yd-ast-contact-phone">Телефон: <span class="rk-req" aria-hidden="true">*</span></label>
                  <input id="yd-ast-contact-phone" type="tel" name="phone" required maxlength="40" autocomplete="tel" data-rk-phone-mask inputmode="tel" placeholder="+7 (___) ___ __ __">
                </div>
                <label class="rk-consent rk-consent--contacts" for="yd-ast-contact-regulation">
                  <input id="yd-ast-contact-regulation" type="checkbox" name="regulation" value="accepted" required>
                  <span>Я принимаю <a href="/regulation/" target="_blank" rel="noopener">Положение</a> и даю <a href="/consent/" target="_blank" rel="noopener">Согласие</a> на обработку персональных данных.</span>
                </label>
                <input type="text" name="website" autocomplete="off" tabindex="-1" aria-hidden="true" class="lead-form-honeypot" value="">
                <div class="rk-form__actions">
                  <button class="rk-btn rk-btn--contacts" type="submit">Отправить заявку</button>
                </div>
                <div data-form-status aria-live="polite" aria-atomic="true" class="lead-form-status"></div>
              </form>
            </div>
          </div>
          <div class="rk-contacts__main">
            <div class="rk-contact-cards">
              <a class="rk-contact-card" href="tel:+77000216900">
                <img class="rk-contact-card__icon" src="../../../../assets/css/perf-img/42w2x_f__q_62138191.webp" alt="Позвонить" width="42" height="42" loading="lazy" decoding="async">
                <span class="rk-contact-card__body">
                  <strong class="rk-contact-card__title">Позвоните нам</strong>
                  <span class="rk-contact-card__value">+7 700 021 69 00</span>
                  <span class="rk-contact-card__note">Пн-Пт: 10:00 - 19:00</span>
                </span>
              </a>
              <a class="rk-contact-card" href="https://wa.me/77000216900" target="_blank" rel="noopener noreferrer">
                <img class="rk-contact-card__icon" src="../../../../assets/css/perf-img/43w2x_f__q_4144924.webp" alt="WhatsApp" width="43" height="43" loading="lazy" decoding="async">
                <span class="rk-contact-card__body">
                  <strong class="rk-contact-card__title">Напишите в WhatsApp</strong>
                  <span class="rk-contact-card__value">+7 700 021 69 00</span>
                  <span class="rk-contact-card__note">Быстрый ответ в чате</span>
                </span>
              </a>
              <a class="rk-contact-card" href="mailto:info@raskrutov.kz">
                <img class="rk-contact-card__icon" src="../../../../assets/css/perf-img/42w2x_f__q_5617179.webp" alt="Электронная почта" width="42" height="42" loading="lazy" decoding="async">
                <span class="rk-contact-card__body">
                  <strong class="rk-contact-card__title">Напишите нам</strong>
                  <span class="rk-contact-card__value">info@raskrutov.kz</span>
                  <span class="rk-contact-card__note">Ответим в течение часа</span>
                </span>
              </a>
            </div>
            <p class="rk-contacts__office"><strong>Наш офис:</strong> Казахстан, Петропавловск, ул. М. Жумабаева, 109, 6 этаж, офис 606а.</p>
            <div class="rk-map" data-rk-map data-lat="54.8746" data-lon="69.135701" data-zoom="16" role="region" aria-label="Карта офиса Raskrutov в Петропавловске"></div>
            <div class="rk-contacts-social">
              <p class="rk-contacts-social__title">Мы в соцсетях</p>
              <div class="rk-contacts-social__row">
                <a class="rk-contact-soc" href="https://t.me/Raskrutov_web" target="_blank" rel="noopener noreferrer"><span class="rk-contact-soc__icon rk-contact-soc__icon--tg" aria-hidden="true"></span>Telegram</a>
                <a class="rk-contact-soc" href="https://www.instagram.com/raskrutov.kz/" target="_blank" rel="noopener noreferrer"><span class="rk-contact-soc__icon rk-contact-soc__icon--ig" aria-hidden="true"></span>Instagram</a>
                <a class="rk-contact-soc" href="https://www.youtube.com/@raskrutov-kz" target="_blank" rel="noopener noreferrer"><span class="rk-contact-soc__icon rk-contact-soc__icon--yt" aria-hidden="true"></span>YouTube</a>
                <a class="rk-contact-soc" href="https://www.tiktok.com/@raskrutov.kz" target="_blank" rel="noopener noreferrer"><span class="rk-contact-soc__icon rk-contact-soc__icon--tt" aria-hidden="true"></span>TikTok</a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  </main>`;
}

function buildModal() {
  return `  <div class="rk-modal" id="rk-modal-lead" hidden role="dialog" aria-modal="true" aria-labelledby="rk-modal-lead-title">
    <div class="rk-modal__backdrop" tabindex="-1"></div>
    <div class="rk-modal__dialog">
      <button class="rk-modal__close" type="button" data-rk-modal-close aria-label="Закрыть">×</button>
      <p class="rk-modal__title" id="rk-modal-lead-title" role="heading" aria-level="2">Обсудим Яндекс Директ в Астане</p>
      <p>Опишите нишу и сайт — разберём кабинет Директа, гео Астаны, Метрику и состав работ.</p>
      <form id="rk-form-popup-yd-astana" name="popup_yandex_direct_astana" data-lead-form data-form-name="Попап — Яндекс Директ Астана" novalidate>
        <div class="rk-field">
          <label for="yd-ast-popup-name">Имя</label>
          <input id="yd-ast-popup-name" type="text" name="name" maxlength="200" autocomplete="name">
        </div>
        <div class="rk-field">
          <label for="yd-ast-popup-phone">Телефон</label>
          <input id="yd-ast-popup-phone" type="tel" name="phone" required maxlength="40" autocomplete="tel" data-rk-phone-mask inputmode="tel" placeholder="+7 (___) ___ __ __">
        </div>
        <div class="rk-field">
          <label for="yd-ast-popup-email">E-mail</label>
          <input id="yd-ast-popup-email" type="email" name="email" maxlength="200" autocomplete="email">
        </div>
        <div class="rk-field">
          <label for="yd-ast-popup-message">Задайте вопрос или опишите вашу задачу</label>
          <textarea id="yd-ast-popup-message" name="message" maxlength="1500"></textarea>
        </div>
        <label class="rk-consent" for="yd-ast-popup-regulation">
          <input id="yd-ast-popup-regulation" type="checkbox" name="regulation" value="accepted" required>
          <span>Я принимаю <a href="/regulation/" target="_blank" rel="noopener">Положение</a> и даю <a href="/consent/" target="_blank" rel="noopener">Согласие</a> на обработку персональных данных.</span>
        </label>
        <input type="text" name="website" autocomplete="off" tabindex="-1" aria-hidden="true" class="lead-form-honeypot" value="">
        <button class="rk-btn rk-btn--primary" type="submit">Получить консультацию</button>
        <div data-form-status aria-live="polite" aria-atomic="true" class="lead-form-status"></div>
      </form>
    </div>
  </div>`;
}

function main() {
  const src = fs.readFileSync(srcPath, "utf8");

  const criticalMatch = src.match(/<style id="yd-critical"[\s\S]*?<\/style>/);
  if (!criticalMatch) throw new Error("yd-critical block not found");
  const critical = deepAsset(criticalMatch[0]);

  const extraStyleMatch = src.match(/<style>\s*\.rk-form--contacts[\s\S]*?<\/style>/);
  if (!extraStyleMatch) throw new Error("extra style block not found");
  const extraStyle = extraStyleMatch[0];

  const headerMatch = src.match(/<header class="rk-header">[\s\S]*?<\/header>/);
  if (!headerMatch) throw new Error("header not found");
  const header = deepAsset(headerMatch[0]);

  const stickyMatch = src.match(/<nav class="rk-sticky-cta"[\s\S]*?<\/nav>/);
  const scrollMatch = src.match(/<button class="rk-scroll-top"[\s\S]*?<\/button>/);
  const socMatch = src.match(/<div class="rk-soc-widget"[\s\S]*?<\/div>\s*<div class="rk-modal"/);
  if (!stickyMatch || !scrollMatch || !socMatch) throw new Error("chrome widgets not found");
  const sticky = stickyMatch[0];
  const scrollTop = scrollMatch[0];
  const socWidget = deepAsset(socMatch[0].replace(/\s*<div class="rk-modal"$/, ""));

  const metrikaMatch = src.match(/<script>\s*window\.YANDEX_METRIKA_ID[\s\S]*?<\/script>/);
  if (!metrikaMatch) throw new Error("metrika block not found");
  const metrika = metrikaMatch[0];

  const cssLinks = `  <link rel="stylesheet" href="../../../../assets/css/home-clean.css?v=39" media="(min-width: 769px)" onload="this.onload=null;if(matchMedia('(max-width:768px)').matches)this.media='all'">
  <link rel="stylesheet" href="../../../../assets/css/kontekst-clean.css?v=7" media="(min-width: 769px)" onload="this.onload=null;if(matchMedia('(max-width:768px)').matches)this.media='all'">
  <link rel="stylesheet" href="../../../../assets/css/yandex-direct-page.css?v=5" media="print" onload="this.onload=null;this.media='all'">
  <link rel="stylesheet" href="../../../../assets/css/lead-forms.css" media="print" onload="this.onload=null;this.media='all'">
  <noscript>
    <link rel="stylesheet" href="../../../../assets/css/home-clean.css?v=39">
    <link rel="stylesheet" href="../../../../assets/css/kontekst-clean.css?v=7">
    <link rel="stylesheet" href="../../../../assets/css/yandex-direct-page.css?v=5">
    <link rel="stylesheet" href="../../../../assets/css/lead-forms.css">
  </noscript>`;

  const html = `<!DOCTYPE html>
<html lang="ru-KZ">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${TITLE}</title>
  <meta name="robots" content="index, follow">
  <meta name="description" content="${DESC}">
  <link rel="canonical" href="${CANONICAL}">
  <meta property="og:title" content="${TITLE}">
  <meta property="og:description" content="${DESC}">
  <meta property="og:image" content="${OG_IMAGE}">
  <meta property="og:site_name" content="Raskrutov">
  <meta property="og:type" content="website">
  <meta property="og:url" content="${CANONICAL}">
  <meta property="og:locale" content="ru_KZ">
<link href="../../../../assets/m-files.cdn1.cc/lpfile/favicon/favicon__q_1.png" type="image/png" rel="icon">
  <link href="../../../../favicon.ico" sizes="16x16 32x32 48x48" rel="icon" type="image/x-icon">
  <link rel="preload" href="../../../../assets/m-files.cdn1.cc/web/user/fonts/montserrat/montserrat_normal.woff2" as="font" type="font/woff2" crossorigin>
  <link rel="preload" href="../../../../assets/m-files.cdn1.cc/web/user/fonts/montserrat/montserrat_bold.woff2" as="font" type="font/woff2" crossorigin>
  ${critical}
${cssLinks}
  ${extraStyle}
  <script type="application/ld+json">${buildSchema()}</script>
</head>
<body class="rk-clean ctx-page yd-page">
${header}


  ${buildMain()}


${sticky}

  ${scrollTop}

  ${socWidget}

${buildModal()}

  ${metrika}
  <script src="../../../../assets/js/home-clean.js?v=21" defer></script>
  <script src="../../../../assets/js/lead-forms.js" defer></script>
  <script src="../../../../assets/js/yandex-direct-page.js" defer></script>
</body>
</html>
`;

  fs.mkdirSync(outDir, { recursive: true });
  fs.writeFileSync(outPath, html, "utf8");
  const size = fs.statSync(outPath).size;
  console.log(`Wrote ${outPath}`);
  console.log(`Size: ${size} bytes`);
  console.log(`Title: ${TITLE}`);
  console.log(`H1: ${H1}`);
  console.log(`Desc length: ${DESC.length}`);
  console.log(`FAQ count: ${faqItems.length}`);
}

main();
