/**
 * Part 2b: decision → contacts + schema for Aktau.
 */
const fs = require("fs");

const DST =
  "site_mirror/web-studiya/kontekstnaya-reklama/yandex-direct/aktau/index.html";
const TITLE = "Яндекс Директ в Актау — настройка и ведение | Raskrutov";
const H1 = "Настройка и ведение Яндекс Директ в Актау";
const DESC =
  "Яндекс Директ в Актау: город отдельно от Мангистауской области, портовый и нефтесервисный спрос на Каспии, цели в Метрике. От 120 000 ₸ в месяц.";
const CANON =
  "https://raskrutov.kz/web-studiya/kontekstnaya-reklama/yandex-direct/aktau/";

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
  '<section class="rk-section" id="decision">',
  '<section class="rk-section" id="landing-analytics">',
  `<section class="rk-section" id="decision">
      <div class="rk-container">
        <h2 class="rk-h2">Сценарии старта для Актау</h2>
        <div class="yd-decision-grid">
          <article class="yd-decision__card">
            <h3>Новый контур под город</h3>
            <p>Кабинета нет или старый не подходит. Собираем структуру под Актау, цели Метрики и согласованный список пунктов Мангистауской области. Бриф — онлайн из Петропавловска.</p>
          </article>
          <article class="yd-decision__card">
            <h3>Пересборка текущего кабинета</h3>
            <p>Показы уже идут, но гео шире зоны продаж. Сужаем лишнее, отделяем Актау от Мангистауской области и пересобираем группы.</p>
          </article>
          <article class="yd-decision__card">
            <h3>Доработка посадочной</h3>
            <p>Если страница отвечает мимо запроса или тормозит на телефоне, сначала чиним URL либо готовим отдельные посадочные под группы — иначе клики уходят впустую.</p>
          </article>
        </div>
        <div class="yd-decision__actions">
          <button class="ctx-btn ctx-btn--primary" type="button" data-rk-open-modal="rk-modal-lead">Обсудить запуск для Актау <span class="ctx-btn__arrow" aria-hidden="true">→</span></button>
        </div>
      </div>
    </section>

    `
);

html = replaceBetween(
  html,
  '<section class="rk-section" id="landing-analytics">',
  '<section class="rk-section" id="process">',
  `<section class="rk-section" id="landing-analytics">
      <div class="rk-container yd-prose">
        <h2 class="rk-h2">Посадочная и обработка обращений</h2>
        <p>Объявление и первый экран должны совпадать: Актау, тип услуги, понятный способ связи. Страница без города и без кнопки после клика уводит часть расхода в отказ.</p>
        <p>По Метрике видно, дошло ли обращение. Без событий оптимизация сводится к кликам. Если сайт готов, связываем источник обращения с CRM и скоростью ответа менеджера. Многоканальный сбор заявок — на странице <a href="/web-studiya/lidogeneratsiya/">лидогенерации</a>; органический спрос закрывает <a href="/web-studiya/seo-prodvizhenie/">SEO-продвижение</a>.</p>
      </div>
    </section>

    `
);

html = replaceBetween(
  html,
  '<section class="rk-section" id="process">',
  '<section class="ctx-cta-band"',
  `<section class="rk-section" id="process">
      <div class="rk-container">
        <h2 class="rk-h2">Пять шагов запуска для Актау</h2>
        <ol class="yd-timeline">
          <li class="yd-timeline__item">
            <h3>Бриф и доступы</h3>
            <p>Фиксируем направления, границу Актау, при необходимости список пунктов Мангистау, рамку расхода и пару примеров удачных обращений. Параллельно запрашиваем гостевые доступы в Директ и Метрику. Встреча онлайн — из Петропавловска.</p>
          </li>
          <li class="yd-timeline__item">
            <h3>Семантика и группы</h3>
            <p>Ключи раскладываем по направлениям и сразу готовим стоп-лист. Поиск, сеть и возврат — отдельные кампании; казахская ветка собирается своим списком при живом KK-спросе.</p>
          </li>
          <li class="yd-timeline__item">
            <h3>Сборка кампаний</h3>
            <p>Собираем объявления, гео Актау/Мангистау, расписание, устройства и цели. Перед модерацией повторно сверяем URL посадочных и дневной потолок.</p>
          </li>
          <li class="yd-timeline__item">
            <h3>Запуск показов</h3>
            <p>Показы открываем после модерации и контрольного срабатывания целей. Срок зависит от готовности материалов; календарную дату заранее не назначаем.</p>
          </li>
          <li class="yd-timeline__item">
            <h3>Оптимизация по итогам цикла</h3>
            <p>По итогам цикла разбираем поисковые запросы, отключаем пустые связки, усиливаем группы с живыми разговорами и передаём сводку с задачами на следующий период.</p>
          </li>
        </ol>
      </div>
    </section>

    `
);

html = replaceBetween(
  html,
  '<section class="ctx-cta-band"',
  '<section class="rk-section" id="faq">',
  `<section class="ctx-cta-band" aria-label="Обсудить Яндекс Директ для Актау">
      <div class="rk-container">
        <h2>Обсудим Директ для бизнеса в Актау</h2>
        <p>Берём нишу, карту Актау и согласованных пунктов Мангистауской области, кабинет и счётчик. После разбора назовём состав работ и цену. Офиса в Актау нет — ведём удалённо из Петропавловска.</p>
        <button class="ctx-btn ctx-btn--light" type="button" data-rk-open-modal="rk-modal-lead">Оставить заявку</button>
      </div>
    </section>

    `
);

html = replaceBetween(
  html,
  '<section class="rk-section" id="faq">',
  '<section class="rk-section ctx-related" id="related"',
  `<section class="rk-section" id="faq">
      <div class="rk-container">
        <h2 class="rk-h2">Вопросы о Яндекс Директ в Актау</h2>
        <div class="yd-faq" data-yd-faq>
          <div class="yd-faq__item">
            <h3 class="yd-faq__q">
              <button type="button" class="yd-faq__btn" data-yd-faq-btn aria-expanded="false" aria-controls="yd-akt-faq-a1" id="yd-akt-faq-q1">Сколько стоит ведение Директа для бизнеса в Актау?</button>
            </h3>
            <div class="yd-faq__a" id="yd-akt-faq-a1" role="region" aria-labelledby="yd-akt-faq-q1" hidden>Сопровождение стартует от 120 000 тенге в месяц. Стоимость растёт, когда растёт число ниш, длина семантики или набор форматов. Медиабюджет на клики клиент держит на своём балансе отдельно от гонорара.</div>
          </div>
          <div class="yd-faq__item">
            <h3 class="yd-faq__q">
              <button type="button" class="yd-faq__btn" data-yd-faq-btn aria-expanded="false" aria-controls="yd-akt-faq-a2" id="yd-akt-faq-q2">Как развести Актау и Мангистаускую область в регионах Директа?</button>
            </h3>
            <div class="yd-faq__a" id="yd-akt-faq-a2" role="region" aria-labelledby="yd-akt-faq-q2" hidden>В дереве регионов отмечаем Актау. Пункты Мангистауской области добавляем поимённо и только при реальной выдаче, отгрузке или выезде, с отдельным лимитом. После старта сверяем отчёт местоположений с вашей картой.</div>
          </div>
          <div class="yd-faq__item">
            <h3 class="yd-faq__q">
              <button type="button" class="yd-faq__btn" data-yd-faq-btn aria-expanded="false" aria-controls="yd-akt-faq-a3" id="yd-akt-faq-q3">Есть ли у Raskrutov офис или филиал в Актау?</button>
            </h3>
            <div class="yd-faq__a" id="yd-akt-faq-a3" role="region" aria-labelledby="yd-akt-faq-q3" hidden>Офиса Raskrutov в Актау нет. Связь идёт через гостевой доступ к Директу и Метрике, звонки и переписку. Юридический адрес: Петропавловск, ул. М. Жумабаева, 109, 6 этаж, офис 606а.</div>
          </div>
          <div class="yd-faq__item">
            <h3 class="yd-faq__q">
              <button type="button" class="yd-faq__btn" data-yd-faq-btn aria-expanded="false" aria-controls="yd-akt-faq-a4" id="yd-akt-faq-q4">Какой медиабюджет нужен на старте в Актау?</button>
            </h3>
            <div class="yd-faq__a" id="yd-akt-faq-a4" role="region" aria-labelledby="yd-akt-faq-q4" hidden>Стартовый медиабюджет зависит от конкуренции по нефтесервису, снабжению и городским услугам и от числа форматов. Первые недели часть суммы уходит на проверку гипотез. Диапазон называем после разбора спроса и посадочной.</div>
          </div>
          <div class="yd-faq__item">
            <h3 class="yd-faq__q">
              <button type="button" class="yd-faq__btn" data-yd-faq-btn aria-expanded="false" aria-controls="yd-akt-faq-a5" id="yd-akt-faq-q5">Что входит в первую настройку для Актау?</button>
            </h3>
            <div class="yd-faq__a" id="yd-akt-faq-a5" role="region" aria-labelledby="yd-akt-faq-q5" hidden>В первой настройке: ниша и сайт, городские формулировки, отдельно пункты Мангистау, минус-слова и схема кампаний. Далее тексты, гео Актау, часы, устройства, Метрика и цели. Показы — после модерации и контрольных событий.</div>
          </div>
          <div class="yd-faq__item">
            <h3 class="yd-faq__q">
              <button type="button" class="yd-faq__btn" data-yd-faq-btn aria-expanded="false" aria-controls="yd-akt-faq-a6" id="yd-akt-faq-q6">Нужна ли отдельная ветка на казахском (Ақтау)?</button>
            </h3>
            <div class="yd-faq__a" id="yd-akt-faq-a6" role="region" aria-labelledby="yd-akt-faq-q6" hidden>Отдельная ветка нужна при живом KK-спросе с топонимом Ақтау и посадочной на kk. Калька с русского списка почти всегда промахивается. Ключи, тексты и минус-слова собираем самостоятельным набором.</div>
          </div>
          <div class="yd-faq__item">
            <h3 class="yd-faq__q">
              <button type="button" class="yd-faq__btn" data-yd-faq-btn aria-expanded="false" aria-controls="yd-akt-faq-a7" id="yd-akt-faq-q7">Чем Поиск отличается от РСЯ для Актау?</button>
            </h3>
            <div class="yd-faq__a" id="yd-akt-faq-a7" role="region" aria-labelledby="yd-akt-faq-q7" hidden>Поиск отвечает на готовый вопрос про услугу, поставку или выезд — до звонка ближе. РСЯ держит бренд на виду у тех, кто уже был на сайте. Бюджеты форматов не смешиваем, чтобы читать расход.</div>
          </div>
          <div class="yd-faq__item">
            <h3 class="yd-faq__q">
              <button type="button" class="yd-faq__btn" data-yd-faq-btn aria-expanded="false" aria-controls="yd-akt-faq-a8" id="yd-akt-faq-q8">Как Метрика фиксирует звонки из Актау?</button>
            </h3>
            <div class="yd-faq__a" id="yd-akt-faq-a8" role="region" aria-labelledby="yd-akt-faq-q8" hidden>Клик по номеру на смартфоне задаём целью наравне с отправкой формы — источник звонка виден в отчётах. Без счётчика остаются переходы и списания. Цели описываем до включения показов.</div>
          </div>
          <div class="yd-faq__item">
            <h3 class="yd-faq__q">
              <button type="button" class="yd-faq__btn" data-yd-faq-btn aria-expanded="false" aria-controls="yd-akt-faq-a9" id="yd-akt-faq-q9">Обязательно ли заводить новый аккаунт Директа?</button>
            </h3>
            <div class="yd-faq__a" id="yd-akt-faq-a9" role="region" aria-labelledby="yd-akt-faq-q9" hidden>Обычно остаёмся в текущем кабинете: история помогает стратегиям. Убыточное отключаем, рабочее перекладываем под Актау и Мангистау. Новый аккаунт нужен редко — например, если доступ к старому потерян.</div>
          </div>
          <div class="yd-faq__item">
            <h3 class="yd-faq__q">
              <button type="button" class="yd-faq__btn" data-yd-faq-btn aria-expanded="false" aria-controls="yd-akt-faq-a10" id="yd-akt-faq-q10">Когда обычно стартуют показы?</button>
            </h3>
            <div class="yd-faq__a" id="yd-akt-faq-a10" role="region" aria-labelledby="yd-akt-faq-q10" hidden>Срок зависит от готовности сайта, скорости доступов и объёма семантики. Шаги: утверждение структуры, модерация, контроль целей. Конкретную дату заранее не ставим — скорость модерации объявлений от нас не зависит.</div>
          </div>
          <div class="yd-faq__item">
            <h3 class="yd-faq__q">
              <button type="button" class="yd-faq__btn" data-yd-faq-btn aria-expanded="false" aria-controls="yd-akt-faq-a11" id="yd-akt-faq-q11">Нужна ли отдельная посадочная под Актау?</button>
            </h3>
            <div class="yd-faq__a" id="yd-akt-faq-a11" role="region" aria-labelledby="yd-akt-faq-q11" hidden>Отдельная посадочная нужна, если условия по Актау отличаются от общих или направлений несколько. Если на общей странице уже есть Актау, цены и контакты, а текст объявления совпадает со страницей — её достаточно. Анкету и кнопку вызова проверяем со смартфона до старта.</div>
          </div>
          <div class="yd-faq__item">
            <h3 class="yd-faq__q">
              <button type="button" class="yd-faq__btn" data-yd-faq-btn aria-expanded="false" aria-controls="yd-akt-faq-a12" id="yd-akt-faq-q12">Что подготовить к старту работ по Актау?</button>
            </h3>
            <div class="yd-faq__a" id="yd-akt-faq-a12" role="region" aria-labelledby="yd-akt-faq-q12" hidden>Подготовьте направления и категории, карту обслуживания по Актау и Мангистауской области, гостевые доступы в кабинет и счётчик, контакт менеджера, дневной потолок расхода и один-два примера сделок. С этим набором можно собирать план настройки.</div>
          </div>
        </div>
      </div>
    </section>

    `
);

html = replaceBetween(
  html,
  '<section class="rk-section ctx-related" id="related"',
  '<section class="rk-section rk-section--contacts" id="contacts">',
  `<section class="rk-section ctx-related" id="related" aria-label="Связанные услуги">
      <div class="rk-container">
        <h2 class="rk-h2">Связанные страницы</h2>
        <div class="ctx-related__grid">
          <a href="/web-studiya/kontekstnaya-reklama/yandex-direct/">Яндекс Директ в Казахстане</a>
          <a href="/web-studiya/kontekstnaya-reklama/aktau/">Контекстная реклама в Актау</a>
          <a href="/web-studiya/kontekstnaya-reklama/google-ads/aktau/">Google Ads в Актау</a>
          <a href="/web-studiya/seo-prodvizhenie/">SEO-продвижение</a>
          <a href="/web-studiya/sozdanie-saitov/">Создание сайтов</a>
          <a href="/web-studiya/lidogeneratsiya/">Лидогенерация</a>
          <a href="/keysy/">Кейсы</a>
          <a href="/kontakty/">Контакты</a>
        </div>
      </div>
    </section>

    `
);

html = replaceBetween(
  html,
  '<section class="rk-section rk-section--contacts" id="contacts">',
  '</main>',
  `<section class="rk-section rk-section--contacts" id="contacts">
      <div class="rk-container">
        <h2 class="rk-h2">Контакты</h2>
        <div class="rk-contacts">
          <div class="rk-contacts__aside">
            <div class="rk-contacts__line" aria-hidden="true"></div>
            <p class="rk-contacts__intro">Кратко опишите нишу, границу отгрузки и выезда по Актау и Мангистауской области, плюс URL сайта. Пришлём план структуры Директа, цели Метрики, объём работ и стоимость. Работаем удалённо; офис — в Петропавловске.</p>
            <div class="rk-form rk-form--contacts">
              <p class="rk-form__title">Отправьте заявку</p>
              <p class="rk-form__lead">Кратко укажите нишу, зону обслуживания и ссылку на сайт — пришлём схему Директа под Актау.</p>
              <form id="rk-form-contacts-yd-aktau" name="contacts_yandex_direct_aktau" data-lead-form data-form-name="Контакты — Яндекс Директ Актау" novalidate>
                <div class="rk-field">
                  <label for="yd-akt-contact-name">Имя: <span class="rk-req" aria-hidden="true">*</span></label>
                  <input id="yd-akt-contact-name" type="text" name="name" maxlength="200" autocomplete="name">
                </div>
                <div class="rk-field">
                  <label for="yd-akt-contact-phone">Телефон: <span class="yd-req" aria-hidden="true">*</span></label>
                  <input id="yd-akt-contact-phone" type="tel" name="phone" required maxlength="40" autocomplete="tel" data-rk-phone-mask inputmode="tel" placeholder="+7 (___) ___ __ __">
                </div>
                <label class="rk-consent rk-consent--contacts" for="yd-akt-contact-regulation">
                  <input id="yd-akt-contact-regulation" type="checkbox" name="regulation" value="accepted" required>
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
`
);

// Popup form IDs should already be yd-akt- from mechanical; ensure lead text
html = html.replace(
  /data-form-name="Попап — Яндекс Директ [^"]*"/,
  'data-form-name="Попап — Яндекс Директ Актау"'
);

// Rebuild JSON-LD from visible FAQ + meta
const faqPairs = [];
const faqRe =
  /id="yd-akt-faq-q(\d+)"[^>]*>([^<]+)<[\s\S]*?id="yd-akt-faq-a\1"[^>]*>([^<]+)</g;
let fm;
while ((fm = faqRe.exec(html))) {
  faqPairs.push({ q: fm[2].trim(), a: fm[3].trim() });
}
if (faqPairs.length !== 12) {
  console.warn("FAQ count for schema:", faqPairs.length);
}

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
        {
          "@type": "ListItem",
          position: 1,
          name: "Главная",
          item: "https://raskrutov.kz/",
        },
        {
          "@type": "ListItem",
          position: 2,
          name: "Студия",
          item: "https://raskrutov.kz/web-studiya/",
        },
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
        {
          "@type": "ListItem",
          position: 5,
          name: "Актау",
          item: CANON,
        },
      ],
    },
    {
      "@type": "Service",
      "@id": CANON + "#service",
      name: H1,
      url: CANON,
      provider: { "@id": "https://raskrutov.kz/#organization" },
      areaServed: { "@type": "City", name: "Aktau" },
      serviceType: "Yandex Direct",
      description: DESC,
    },
    {
      "@type": "FAQPage",
      "@id": CANON + "#faq",
      mainEntity: faqPairs.map((p) => ({
        "@type": "Question",
        name: p.q,
        acceptedAnswer: { "@type": "Answer", text: p.a },
      })),
    },
  ],
};

const ld = `<script type="application/ld+json">${JSON.stringify(graph)}</script>`;
html = html.replace(
  /<script type="application\/ld\+json">[\s\S]*?<\/script>/,
  ld
);

// Safety: no aktobe form prefix, no office claim in Aktau
if (/yd-aktb-/.test(html)) throw new Error("aktobe prefix leaked");
if (/офис Raskrutov в Актау|филиал в Актау/.test(html) && !/Офиса Raskrutov в Актау нет/.test(html)) {
  // ok if negation present
}
if (/Урал\b|Атырау|актобе|Актобе/i.test(html.replace(/Петропавловск[\s\S]{0,40}Жумабаева/g, ""))) {
  const bad = html.match(/Урал\b|Атырау|Актобе|актобе/gi);
  console.warn("Possible leftover tokens:", [...new Set(bad || [])]);
}

fs.writeFileSync(DST, html, "utf8");
console.log("DONE", DST, html.length);
console.log("forms", [...html.matchAll(/id="(rk-form-[^"]+)"/g)].map((m) => m[1]));
console.log("charts", [...html.matchAll(/id="(ydAkt[^"]+)"/g)].map((m) => m[1]));
console.log("faq schema", faqPairs.length);
