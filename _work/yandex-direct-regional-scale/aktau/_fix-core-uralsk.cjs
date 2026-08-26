/**
 * Deep rewrite of core sections (hero/short/local/audience/faq) vs uralsk.
 */
const fs = require("fs");
const DST =
  "site_mirror/web-studiya/kontekstnaya-reklama/yandex-direct/aktau/index.html";
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
  '<section class="rk-section" id="short-answer">',
  '<section class="rk-section" id="local-config">',
  `<section class="rk-section" id="short-answer">
      <div class="rk-container yd-prose">
        <div class="yd-about-heading">
          <svg class="yd-about-heading__icon" viewBox="0 0 44 44" width="44" height="44" aria-hidden="true" focusable="false">
            <rect width="44" height="44" rx="10" fill="#FC3F1D"/>
            <text x="22" y="30" text-anchor="middle" fill="#fff" font-size="22" font-weight="700" font-family="Arial, sans-serif">Я</text>
          </svg>
          <h2 class="rk-h2 yd-about-heading__title">Как ведём Директ для каспийского Актау</h2>
        </div>
        <p>Спрос в Актау складывается вокруг морпорта, нефтесервиса на полуострове и бытовых услуг внутри микрорайонов. Мангистауская область в кабинете Директа — отдельный объект: галочка на области тянет показы в Жанаозен, Бейнеу и другие пункты, куда склад или бригада могут не ездить. Поэтому городской лимит и областные точки разводим. После согласования карты покрытия собираем ключи, тексты, часы показа, устройства и цели Метрики. Базовая схема канала — на <a href="/web-studiya/kontekstnaya-reklama/yandex-direct/">республиканской странице Яндекс Директ</a>; здесь только городской контур Актау.</p>
        <p>Представительства в Актау у Raskrutov нет. Работаем из Петропавловска: гостевой вход в кабинет, звонки, переписка, сводка по циклу. Адрес офиса — ул. М. Жумабаева, 109, 6 этаж, офис 606а. Результат зависит от плотности спроса, ясности предложения, качества сайта, потолка расхода и скорости ответа. Число заявок до разбора ниши и URL не прогнозируем.</p>
      </div>
    </section>

    `
);

html = replaceBetween(
  html,
  '<section class="rk-section" id="local-config">',
  '<section class="rk-section" id="audience">',
  `<section class="rk-section" id="local-config">
      <div class="rk-container">
        <h2 class="rk-h2">Параметры запуска до модерации</h2>
        <p class="yd-section-lead">Перед отправкой объявлений фиксируем карту Актау и Мангистау, языковой контур, окно приёма у диспетчера и критерий качественного контакта.</p>
        <div class="yd-artifact-grid">
          <article class="yd-artifact yd-artifact--cabinet">
            <span class="yd-demo-label">География</span>
            <h3 class="yd-artifact__title">Городская строка и область раздельно</h3>
            <p class="yd-artifact__note">В списке регионов выбираем Актау. Пункты Мангистауской области вносим по именам только при фактической выдаче, отгрузке или выезде. Каждый цикл сверяем отчёт местоположений с вашей картой обслуживания.</p>
          </article>
          <article class="yd-artifact yd-artifact--flow">
            <span class="yd-demo-label">Языки</span>
            <h3 class="yd-artifact__title">RU и KK (Ақтау) без кальки</h3>
            <p class="yd-artifact__note">Казахские формулировки и топоним Ақтау ведём отдельным набором ключей и текстов. Перевод русского списка почти всегда промахивается. Язык объявления, минус-слов и посадочной совпадает с языком запроса.</p>
          </article>
          <article class="yd-artifact yd-artifact--flow">
            <span class="yd-demo-label">Расписание и устройства</span>
            <h3 class="yd-artifact__title">Часы склада и мобильный путь</h3>
            <p class="yd-artifact__note">Окно показа совпадает с часами склада у порта, сервисной службы или магазина в Актау. Мобильный сценарий проверяем первым: номер, мессенджер, короткая анкета.</p>
          </article>
          <article class="yd-artifact yd-artifact--report">
            <span class="yd-demo-label">Цели и качество</span>
            <h3 class="yd-artifact__title">Какой контакт считаем рабочим</h3>
            <p class="yd-artifact__note">До старта описываем события: анкета отправлена, звонок, заявка на поставку или выезд, самовывоз у порта. Пустые касания помечаем, чтобы оптимизация не кормилась шумом.</p>
          </article>
        </div>
      </div>
    </section>

    `
);

html = replaceBetween(
  html,
  '<section class="rk-section" id="audience">',
  '<section class="rk-section" id="campaign-types">',
  `<section class="rk-section" id="audience">
      <div class="rk-container">
        <h2 class="rk-h2">Какие задачи закрываем Директом в Актау</h2>
        <p class="yd-section-lead">Сценарии ниже — гипотезы спроса для портового города и точечной Мангистауской области. Локальных кейсов, отзывов и рейтингов на странице нет.</p>
        <div class="yd-card-grid">
          <article class="yd-card yd-card--local">
            <span class="yd-card__visual" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none" focusable="false" aria-hidden="true"><path d="M12 21s7-6.2 7-11a7 7 0 10-14 0c0 4.8 7 11 7 11z" stroke="currentColor" stroke-width="1.8"/><circle cx="12" cy="10" r="2.2" stroke="currentColor" stroke-width="1.8"/></svg>
            </span>
            <h3>Нефтесервис с базой в городе</h3>
            <p>Подрядчик ищет запчасть, инструмент или выезд с базой в Актау. Группы делим по типу заявки, чтобы человек попадал на страницу с условиями выдачи и зоной выезда по полуострову.</p>
          </article>
          <article class="yd-card yd-card--b2b">
            <span class="yd-card__visual" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none" focusable="false" aria-hidden="true"><rect x="4" y="7" width="16" height="12" rx="2" stroke="currentColor" stroke-width="1.8"/><path d="M8 7V5.8A2.8 2.8 0 0110.8 3h2.4A2.8 2.8 0 0116 5.8V7" stroke="currentColor" stroke-width="1.8"/></svg>
            </span>
            <h3>Склады у морпорта</h3>
            <p>Поставщик принимает заказ в Актау и везёт груз по согласованным точкам Мангистау. Областные адреса добавляем лишь туда, куда машина реально доезжает.</p>
          </article>
          <article class="yd-card yd-card--ecom">
            <span class="yd-card__visual" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none" focusable="false" aria-hidden="true"><path d="M6 8h12l-1 11H7L6 8z" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/><path d="M9 8V6.5A3 3 0 0112 3.5 3 3 0 0115 6.5V8" stroke="currentColor" stroke-width="1.8"/></svg>
            </span>
            <h3>Бытовой спрос внутри черты</h3>
            <p>Горожанин ищет услугу или товар в Актау. Такие группы не смешиваем с B2B-нефтесервисом и областным выездом: другая посадочная и другой критерий качественного контакта.</p>
          </article>
          <article class="yd-card yd-card--account">
            <span class="yd-card__visual" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none" focusable="false" aria-hidden="true"><path d="M4 19V5M4 19h16" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/><path d="M8 15v-4M12 15V8M16 15v-6" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>
            </span>
            <h3>Слишком широкая Мангистау</h3>
            <p>Когда в настройках стоит вся область без реального выезда, в отчёте смешиваются пустой интерес и рабочие заявки — развести их потом почти нельзя.</p>
          </article>
          <article class="yd-card yd-card--b2b">
            <span class="yd-card__visual" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none" focusable="false" aria-hidden="true"><path d="M4 12a8 8 0 101.8-5.1" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/><path d="M4 4v5h5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>
            </span>
            <h3>Вахта и найм в минус</h3>
            <p>Вахтовые и кадровые формулировки часто пересекаются с коммерческими фразами. Уводим их в минус-лист, если нужна продажа, а не подбор персонала.</p>
          </article>
          <article class="yd-card yd-card--local">
            <span class="yd-card__visual" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none" focusable="false" aria-hidden="true"><rect x="3" y="4" width="18" height="16" rx="2" stroke="currentColor" stroke-width="1.8"/><path d="M3 9h18M8 4v5" stroke="currentColor" stroke-width="1.8"/></svg>
            </span>
            <h3>Несколько линий в одном аккаунте</h3>
            <p>Портовый сервис, снабжение организаций и городская розница требуют разных групп, объявлений и URL. Смешение в одной кампании ломает чтение расхода.</p>
          </article>
        </div>
      </div>
    </section>

    `
);

// Full FAQ rewrite
html = replaceBetween(
  html,
  '<section class="rk-section" id="faq">',
  '<section class="rk-section ctx-related" id="related"',
  `<section class="rk-section" id="faq">
      <div class="rk-container">
        <h2 class="rk-h2">FAQ по Яндекс Директ для Актау</h2>
        <div class="yd-faq" data-yd-faq>
          <div class="yd-faq__item">
            <h3 class="yd-faq__q">
              <button type="button" class="yd-faq__btn" data-yd-faq-btn aria-expanded="false" aria-controls="yd-akt-faq-a1" id="yd-akt-faq-q1">Какова цена ведения Директа для компании в Актау?</button>
            </h3>
            <div class="yd-faq__a" id="yd-akt-faq-a1" role="region" aria-labelledby="yd-akt-faq-q1" hidden>Работа агентства начинается от 120 000 тенге в месяц. Сумма растёт с числом направлений, объёмом семантики и набором форматов. Рекламный баланс на клики клиент держит отдельно.</div>
          </div>
          <div class="yd-faq__item">
            <h3 class="yd-faq__q">
              <button type="button" class="yd-faq__btn" data-yd-faq-btn aria-expanded="false" aria-controls="yd-akt-faq-a2" id="yd-akt-faq-q2">Как в регионах отделить Актау от Мангистауской области?</button>
            </h3>
            <div class="yd-faq__a" id="yd-akt-faq-a2" role="region" aria-labelledby="yd-akt-faq-q2" hidden>Отмечаем строку города Актау. Пункты области добавляем поимённо и только при реальной выдаче, отгрузке или выезде, с отдельным лимитом. После старта сверяем отчёт местоположений с картой клиента.</div>
          </div>
          <div class="yd-faq__item">
            <h3 class="yd-faq__q">
              <button type="button" class="yd-faq__btn" data-yd-faq-btn aria-expanded="false" aria-controls="yd-akt-faq-a3" id="yd-akt-faq-q3">Работает ли Raskrutov из офиса в Актау?</button>
            </h3>
            <div class="yd-faq__a" id="yd-akt-faq-a3" role="region" aria-labelledby="yd-akt-faq-q3" hidden>Нет, локального офиса в Актау нет. Проект ведём из Петропавловска через гостевой доступ к Директу и Метрике, звонки и переписку. Адрес: ул. М. Жумабаева, 109, 6 этаж, офис 606а.</div>
          </div>
          <div class="yd-faq__item">
            <h3 class="yd-faq__q">
              <button type="button" class="yd-faq__btn" data-yd-faq-btn aria-expanded="false" aria-controls="yd-akt-faq-a4" id="yd-akt-faq-q4">Какой рекламный бюджет закладывать на старт в Актау?</button>
            </h3>
            <div class="yd-faq__a" id="yd-akt-faq-a4" role="region" aria-labelledby="yd-akt-faq-q4" hidden>Стартовый расход зависит от конкуренции в нефтесервисе, снабжении и городских услугах и от числа форматов. Первые недели часть суммы уходит на проверку гипотез. Диапазон называем после разбора спроса и посадочной.</div>
          </div>
          <div class="yd-faq__item">
            <h3 class="yd-faq__q">
              <button type="button" class="yd-faq__btn" data-yd-faq-btn aria-expanded="false" aria-controls="yd-akt-faq-a5" id="yd-akt-faq-q5">Что делаем на первой настройке под Актау?</button>
            </h3>
            <div class="yd-faq__a" id="yd-akt-faq-a5" role="region" aria-labelledby="yd-akt-faq-q5" hidden>Разбираем нишу и сайт, собираем городские формулировки, отдельно пункты Мангистау, минус-слова и схему кампаний. Затем тексты, гео Актау, часы, устройства, Метрику и цели. Показы — после модерации и контрольных событий.</div>
          </div>
          <div class="yd-faq__item">
            <h3 class="yd-faq__q">
              <button type="button" class="yd-faq__btn" data-yd-faq-btn aria-expanded="false" aria-controls="yd-akt-faq-a6" id="yd-akt-faq-q6">Нужна ли отдельная казахская ветка с топонимом Ақтау?</button>
            </h3>
            <div class="yd-faq__a" id="yd-akt-faq-a6" role="region" aria-labelledby="yd-akt-faq-q6" hidden>Да, если есть живой KK-спрос и посадочная на kk. Калька с русского списка почти всегда промахивается. Ключи, тексты и минус-слова собираем самостоятельным набором.</div>
          </div>
          <div class="yd-faq__item">
            <h3 class="yd-faq__q">
              <button type="button" class="yd-faq__btn" data-yd-faq-btn aria-expanded="false" aria-controls="yd-akt-faq-a7" id="yd-akt-faq-q7">Чем Поиск полезнее РСЯ для спроса в Актау?</button>
            </h3>
            <div class="yd-faq__a" id="yd-akt-faq-a7" role="region" aria-labelledby="yd-akt-faq-q7" hidden>Поиск ловит готовый вопрос про услугу, поставку или выезд — до разговора ближе. РСЯ держит бренд на виду у тех, кто уже был на сайте. Бюджеты форматов не смешиваем, чтобы читать расход.</div>
          </div>
          <div class="yd-faq__item">
            <h3 class="yd-faq__q">
              <button type="button" class="yd-faq__btn" data-yd-faq-btn aria-expanded="false" aria-controls="yd-akt-faq-a8" id="yd-akt-faq-q8">Как учитывать звонки из Актау в Метрике?</button>
            </h3>
            <div class="yd-faq__a" id="yd-akt-faq-a8" role="region" aria-labelledby="yd-akt-faq-q8" hidden>Тап по телефону на смартфоне считаем целью рядом с отправкой анкеты — источник звонка читается в отчётах. Без счётчика видны только переходы и списания. События описываем до старта эфира.</div>
          </div>
          <div class="yd-faq__item">
            <h3 class="yd-faq__q">
              <button type="button" class="yd-faq__btn" data-yd-faq-btn aria-expanded="false" aria-controls="yd-akt-faq-a9" id="yd-akt-faq-q9">Нужно ли открывать новый кабинет Директа?</button>
            </h3>
            <div class="yd-faq__a" id="yd-akt-faq-a9" role="region" aria-labelledby="yd-akt-faq-q9" hidden>Чаще остаёмся в текущем аккаунте: история помогает стратегиям. Убыточное отключаем, рабочее перекладываем под Актау и Мангистау. Новый кабинет нужен редко — например, если доступ к старому потерян.</div>
          </div>
          <div class="yd-faq__item">
            <h3 class="yd-faq__q">
              <button type="button" class="yd-faq__btn" data-yd-faq-btn aria-expanded="false" aria-controls="yd-akt-faq-a10" id="yd-akt-faq-q10">За сколько обычно выходим в эфир?</button>
            </h3>
            <div class="yd-faq__a" id="yd-akt-faq-a10" role="region" aria-labelledby="yd-akt-faq-q10" hidden>Срок зависит от готовности сайта, скорости доступов и объёма семантики. Дальше — согласование структуры, модерация и проверка целей. Календарную дату старта не обещаем: срок модерации объявлений платформа задаёт сама.</div>
          </div>
          <div class="yd-faq__item">
            <h3 class="yd-faq__q">
              <button type="button" class="yd-faq__btn" data-yd-faq-btn aria-expanded="false" aria-controls="yd-akt-faq-a11" id="yd-akt-faq-q11">Нужна ли отдельная посадочная именно под Актау?</button>
            </h3>
            <div class="yd-faq__a" id="yd-akt-faq-a11" role="region" aria-labelledby="yd-akt-faq-q11" hidden>Отдельная страница нужна, если условия по Актау отличаются от общих или направлений несколько. Если на общей странице уже есть город, цены и контакты, а текст объявления совпадает со страницей — её достаточно. Анкету и кнопку вызова проверяем со смартфона до старта.</div>
          </div>
          <div class="yd-faq__item">
            <h3 class="yd-faq__q">
              <button type="button" class="yd-faq__btn" data-yd-faq-btn aria-expanded="false" aria-controls="yd-akt-faq-a12" id="yd-akt-faq-q12">Что прислать перед стартом работ по Актау?</button>
            </h3>
            <div class="yd-faq__a" id="yd-akt-faq-a12" role="region" aria-labelledby="yd-akt-faq-q12" hidden>Список направлений, карту обслуживания по Актау и Мангистауской области, гостевые доступы в кабинет и счётчик, контакт менеджера, дневной потолок расхода и один-два примера сделок. С этим набором собираем план настройки.</div>
          </div>
        </div>
      </div>
    </section>

    `
);

// Avoid «не X, а Y» in audience card - I used "если нужна продажа, а не подбор" - that's "X, а не Y" which might be ok vs "не X, а Y". Content style forbids «не X, а Y». "продажа, а не подбор" is similar - let me fix.
html = html.replace(
  "Уводим их в минус-лист, если нужна продажа, а не подбор персонала.",
  "Уводим их в минус-лист, когда задача — продажа услуги или поставка, без кадрового набора."
);

// Rebuild schema FAQ
const faqPairs = [];
const faqRe =
  /id="yd-akt-faq-q(\d+)"[^>]*>([^<]+)<[\s\S]*?id="yd-akt-faq-a\1"[^>]*>([^<]+)</g;
let fm;
while ((fm = faqRe.exec(html))) {
  faqPairs.push({ q: fm[2].trim(), a: fm[3].trim() });
}
const m = html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/);
const graph = JSON.parse(m[1]);
const faqNode = graph["@graph"].find((x) => x["@type"] === "FAQPage");
faqNode.mainEntity = faqPairs.map((p) => ({
  "@type": "Question",
  name: p.q,
  acceptedAnswer: { "@type": "Answer", text: p.a },
}));
html = html.replace(
  /<script type="application\/ld\+json">[\s\S]*?<\/script>/,
  `<script type="application/ld+json">${JSON.stringify(graph)}</script>`
);

fs.writeFileSync(DST, html, "utf8");
console.log("core rewrite done, faq", faqPairs.length);
