const fs = require("fs");
const path =
  "site_mirror/web-studiya/kontekstnaya-reklama/yandex-direct/pavlodar/index.html";
let html = fs.readFileSync(path, "utf8");

function rewriteCards(sectionId, cards) {
  const start = html.indexOf(`id="${sectionId}"`);
  if (start < 0) throw new Error("section " + sectionId);
  let cursor = start;
  for (const [h3, p] of cards) {
    const hi = html.indexOf("<h3>", cursor);
    if (hi < 0 || hi > html.indexOf("</section>", start) + 5000) {
      // for campaign cards may use h3 inside articles after meta spans
    }
    const h3i = html.indexOf("<h3>", cursor);
    const ho = h3i + 4;
    const hc = html.indexOf("</h3>", ho);
    html = html.slice(0, ho) + h3 + html.slice(hc);
    const pi = html.indexOf("<p>", hc);
    const po = pi + 3;
    const pc = html.indexOf("</p>", po);
    html = html.slice(0, po) + p + html.slice(pc);
    cursor = pc;
  }
}

// campaign-types: 6 cards — rewrite h3+p only (meta spans stay)
{
  const start = html.indexOf('id="campaign-types"');
  const end = html.indexOf("</section>", start);
  const cards = [
    [
      "Поиск",
      "Объявление встречается с уже сформулированным запросом — подряд, поставка или сервис в Павлодаре. Отсюда обычно приходит основная доля звонков и заявок.",
    ],
    [
      "РСЯ",
      "Показы на партнёрских площадках вне выдачи. Держим название на виду у тех, кто сайт уже открывал; расход по сети всегда выносим в отдельную кампанию.",
    ],
    [
      "Ретаргетинг",
      "Возвращаем посетителей, которые смотрели страницу или бросили анкету. Нужны рабочие события в Метрике и накопленный сегмент.",
    ],
    [
      "Товарные и динамические",
      "Строятся на выгрузке каталога: название, цена, остаток. Имеет смысл только при регулярно обновляемом файле и понятных условиях отгрузки.",
    ],
    [
      "Смарт-баннеры",
      "Блок собирается автоматически из позиций, которые человек уже смотрел. Подключаем после того, как карточки и фид приведены в рабочий вид.",
    ],
    [
      "Медийные форматы",
      "Графика и ролики по утверждённым макетам. Нужны там, где решение принимают долго и название компании должно примелькаться заранее.",
    ],
  ];
  let cursor = start;
  for (const [h3, p] of cards) {
    const h3i = html.indexOf("<h3>", cursor);
    if (h3i < 0 || h3i > end) throw new Error("camp h3");
    html = html.slice(0, h3i + 4) + h3 + html.slice(html.indexOf("</h3>", h3i + 4));
    const hc = html.indexOf("</h3>", h3i + 4);
    const pi = html.indexOf("<p>", hc);
    const pc = html.indexOf("</p>", pi + 3);
    html = html.slice(0, pi + 3) + p + html.slice(pc);
    cursor = pc;
  }
}

// setup scope items — 12 blocks with h3+p inside yd-scope-list
{
  const start = html.indexOf('id="setup"');
  const items = [
    [
      "Разбор запросов по городу",
      "Собираем формулировки, которыми на Иртыше описывают вашу задачу, и сверяем их с текстом сайта. Места, где страница отвечает на другой вопрос, видны сразу.",
    ],
    [
      "Договорённости до сборки",
      "Письменно закрепляем три вещи: что засчитывается за обращение, очередь подключения форматов и предельный радиус выездов или отгрузок.",
    ],
    [
      "Подбор фраз",
      "Берём коммерческие запросы, городские привязки и отраслевую лексику производств. Русские и казахские формулировки ведём двумя раздельными наборами.",
    ],
    [
      "Отсечение лишнего",
      "Стоп-слова снимают справочные запросы, поиск работы и упоминания Аксу, Экибастуза и прочих пунктов вне согласованной карты.",
    ],
    [
      "Раскладка аккаунта",
      "Под поиск, сеть, ретаргетинг и товарные форматы заводим собственные кампании. Выезд за черту города тоже идёт отдельной строкой расхода.",
    ],
    [
      "Тексты объявлений",
      "Каждой группе — свой заголовок и адрес соответствующего раздела. Быстрые ссылки, уточнения и визитку заполняем целиком.",
    ],
    [
      "Границы, время и устройства",
      "Закрепляем Павлодар, поимённо добавляем пункты вне его границ, подгоняем окно показов под часы приёма звонков и отдаём приоритет смартфонам.",
    ],
    [
      "Счётчик и события",
      "Метрику ставим до запуска и описываем цели пошагово: анкета отправлена, номер набран, чат открыт. Срабатывание каждой цели проверяем руками на живой странице.",
    ],
    [
      "Проверка посадочной со смартфона",
      "Открываем страницу с телефона, оставляем тестовую заявку и засекаем время до ответа. Заодно смотрим, совпадает ли предложение с исходным запросом.",
    ],
    [
      "Открытие показов",
      "Запускаем при трёх выполненных условиях: модерация пройдена, тестовые события в счётчике зафиксированы, суточный потолок расхода подтверждён владельцем.",
    ],
    [
      "Ведение",
      "В каждом цикле разбираем отчёт по поисковым запросам, гасим связки без отдачи и перекладываем деньги в группы, где появляются разговоры.",
    ],
    [
      "Сводка",
      "По окончании периода отдаём документ: перечень работ, найденные проблемы, план на следующий цикл. Каждое утверждение сверяется по кабинету Директа или Метрике.",
    ],
  ];
  let cursor = html.indexOf("yd-scope-list", start);
  for (const [h3, p] of items) {
    const h3i = html.indexOf("<h3>", cursor);
    const hc = html.indexOf("</h3>", h3i + 4);
    html = html.slice(0, h3i + 4) + h3 + html.slice(hc);
    const pi = html.indexOf("<p>", hc);
    const pc = html.indexOf("</p>", pi + 3);
    html = html.slice(0, pi + 3) + p + html.slice(pc);
    cursor = pc;
  }
  // price board lead if still astana-like
  const pb = html.indexOf("yd-price-board", start);
  if (pb > 0) {
    const lead = html.indexOf('class="yd-price-board__lead"', pb);
    if (lead > 0) {
      const o = html.indexOf(">", lead) + 1;
      const c = html.indexOf("</p>", o);
      html =
        html.slice(0, o) +
        "Указан ежемесячный гонорар за сопровождение. Рекламный баланс пополняет сам владелец аккаунта. На конечную цифру влияют количество направлений, размер собранной семантики и набор включённых форматов." +
        html.slice(c);
    }
  }
}

// control section — rewrite artifact titles/notes and demo labels content-ish
{
  const start = html.indexOf('id="control"');
  const lead = html.indexOf('class="yd-section-lead"', start);
  if (lead > 0) {
    const o = html.indexOf(">", lead) + 1;
    const c = html.indexOf("</p>", o);
    html =
      html.slice(0, o) +
      "Аккаунт Директа оформляется на компанию рекламодателя. Мы подключаемся гостевым входом и работаем на расстоянии из Петропавловска. Владелец видит настройки, лимиты и расход; карту привязывает сам. Перечень целей и потолок суточного расхода согласуем до первого показа." +
      html.slice(c);
  }
  const h2i = html.indexOf("<h2", start);
  const h2o = html.indexOf(">", h2i) + 1;
  const h2c = html.indexOf("</h2>", h2o);
  html =
    html.slice(0, h2o) +
    "Доступы, лимиты и отчётность" +
    html.slice(h2c);

  // rewrite first few artifact titles in control
  const titles = [
    ["Раскладка кампаний · Павлодар", "Схема показывает принцип разбивки аккаунта. Действующие проекты клиентов в неё не попадают."],
    ["Шаги, которые идут в статистику", "Итоговый список зависит от сценария сайта. Здесь он приведён как учебный пример."],
    ["Из чего складывается путь до заявки", "Иллюстрация цепочки без цифр клиента. Лимиты расхода задаются в кабинете владельца."],
  ];
  // Try common title class
  let cursor = start;
  for (const [title, note] of titles) {
    const ti = html.indexOf('class="yd-artifact__title"', cursor);
    if (ti < 0) break;
    const to = html.indexOf(">", ti) + 1;
    const tc = html.indexOf("<", to);
    html = html.slice(0, to) + title + html.slice(tc);
    const ni = html.indexOf('class="yd-artifact__note"', tc);
    if (ni > 0) {
      const no = html.indexOf(">", ni) + 1;
      const nc = html.indexOf("<", no);
      html = html.slice(0, no) + note + html.slice(nc);
      cursor = nc;
    } else cursor = tc;
  }
}

// decision section
{
  const start = html.indexOf('id="decision"');
  if (start > 0) {
    const h2o = html.indexOf(">", html.indexOf("<h2", start)) + 1;
    const h2c = html.indexOf("</h2>", h2o);
    html = html.slice(0, h2o) + "Сценарии старта для Павлодара" + html.slice(h2c);
    const lead = html.indexOf('class="yd-section-lead"', start);
    if (lead > 0) {
      const o = html.indexOf(">", lead) + 1;
      const c = html.indexOf("</p>", o);
      html =
        html.slice(0, o) +
        "Выбираем вход в зависимости от состояния аккаунта и карты обслуживания. Ниже — три типичных развилки без обещаний по числу заявок." +
        html.slice(c);
    }
    const cards = [
      [
        "Новый контур под город",
        "Аккаунта ещё нет или старый не годится. Собираем структуру под Павлодар, цели и согласованный список пунктов за чертой города.",
      ],
      [
        "Переразметка текущего кабинета",
        "Кампании крутятся, но география шире зоны работы. Останавливаем лишнее, отделяем город от области, Аксу и Экибастуза, пересобираем группы.",
      ],
      [
        "Доработка точки входа",
        "Если страница отвечает на другой запрос или тормозит на телефоне, сначала правим посадочную или готовим отдельные URL под группы — иначе бюджет уходит вхолостую.",
      ],
    ];
    let cursor = start;
    for (const [h3, p] of cards) {
      const h3i = html.indexOf("<h3>", cursor);
      const hc = html.indexOf("</h3>", h3i + 4);
      html = html.slice(0, h3i + 4) + h3 + html.slice(hc);
      const pi = html.indexOf("<p>", hc);
      const pc = html.indexOf("</p>", pi + 3);
      html = html.slice(0, pi + 3) + p + html.slice(pc);
      cursor = pc;
    }
  }
}

// landing-analytics
{
  const start = html.indexOf('id="landing-analytics"');
  if (start > 0) {
    const h2o = html.indexOf(">", html.indexOf("<h2", start)) + 1;
    const h2c = html.indexOf("</h2>", h2o);
    html =
      html.slice(0, h2o) +
      "Посадочная страница и обработка обращений" +
      html.slice(h2c);
    // rewrite paragraphs in section
    let cursor = start;
    const paras = [
      "Объявление обещает то, что человек увидит на первом экране: город, тип услуги, способ связаться. Если после клика открывается общий текст без Павлодара и без понятной кнопки, часть бюджета сгорает на отказе.",
      "Раскладываем поиск, сеть и возврат по задачам. Казахский слой проверяем отдельно, если на него есть живой спрос и готовая страница. Цели формы, звонка и мессенджера описываем до старта показов.",
      "Менеджер должен успевать брать трубку в согласованном окне. Иначе Метрика фиксирует событие, а сделка обрывается на ответе — кампании при этом выглядят «пустыми» без вины аукциона.",
    ];
    for (const p of paras) {
      const pi = html.indexOf("<p>", cursor);
      if (pi < 0 || pi > html.indexOf("</section>", start)) break;
      const pc = html.indexOf("</p>", pi + 3);
      html = html.slice(0, pi + 3) + p + html.slice(pc);
      cursor = pc + 4;
    }
  }
}

// process timeline
{
  const start = html.indexOf('id="process"');
  if (start > 0) {
    const h2o = html.indexOf(">", html.indexOf("<h2", start)) + 1;
    const h2c = html.indexOf("</h2>", h2o);
    html = html.slice(0, h2o) + "Как запускаем удалённо" + html.slice(h2c);
    const steps = [
      [
        "Бриф и карта обслуживания",
        "Фиксируем направления, границу Павлодара, список пунктов вроде Аксу и Экибастуза при необходимости, рамку расхода и примеры удачных обращений. Параллельно просим доступы в Директ и Метрику.",
      ],
      [
        "Фразы и раскладка групп",
        "Список запросов собираем по каждому направлению, сразу формируем минус-слова. Поиск, сеть и возврат разносим по разным кампаниям; казахская часть идёт самостоятельной веткой.",
      ],
      [
        "Сборка кампаний",
        "Пишем объявления, выставляем регион показа, окно времени, устройства и цели. До модерации перепроверяем адреса посадочных и дневной потолок.",
      ],
      [
        "Включение показов",
        "Кампании стартуют, когда модерация пройдена и цели дали контрольное срабатывание. Скорость зависит от готовности материалов, поэтому дату в календаре заранее не назначаем.",
      ],
      [
        "Цикл оптимизации",
        "Дальше идёт разбор запросов, отключение пустых связок, усиление групп с разговорами и сводка с задачами следующего цикла.",
      ],
    ];
    let cursor = start;
    for (const [h3, p] of steps) {
      const h3i = html.indexOf("<h3>", cursor);
      const hc = html.indexOf("</h3>", h3i + 4);
      html = html.slice(0, h3i + 4) + h3 + html.slice(hc);
      const pi = html.indexOf("<p>", hc);
      const pc = html.indexOf("</p>", pi + 3);
      html = html.slice(0, pi + 3) + p + html.slice(pc);
      cursor = pc;
    }
  }
}

// demo panel texts that still match astana
html = html.replace(
  /Демо события, которые считаем обращением[\s\S]{0,40}/,
  "Учебный список событий · Павлодар"
);
// Soften shared demo labels by city tag
html = html.replace(
  /Схема без клиентских данных/g,
  "Учебная схема · без цифр клиента"
);
html = html.replace(
  /Путь от клика до ответа менеджера/g,
  "Цепочка от клика до ответа менеджера"
);
html = html.replace(
  /Иллюстрация динамики · без чисел/g,
  "Условный график · без показателей"
);
html = html.replace(
  /Лимиты расхода задаём в кабинете/g,
  "Потолок расхода задаёт владелец кабинета"
);

// Final Astana leftovers
const left = html.match(/Астан|astana/gi) || [];
if (left.length) console.warn("LEFT", [...new Set(left)]);

fs.writeFileSync(path, html);
console.log("patched", path, Buffer.byteLength(html));
