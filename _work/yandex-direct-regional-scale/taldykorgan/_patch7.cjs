/**
 * Patch 7: specifically lower core_containment vs kokshetau.
 */
const fs = require("fs");
const path = require("path");
const OUT = path.join(
  "site_mirror/web-studiya/kontekstnaya-reklama/yandex-direct/taldykorgan/index.html"
);
let h = fs.readFileSync(OUT, "utf8");

function replaceBetween(html, startMarker, endMarker, newInner) {
  const i = html.indexOf(startMarker);
  if (i < 0) throw new Error("start not found: " + startMarker.slice(0, 40));
  const j = html.indexOf(endMarker, i + startMarker.length);
  if (j < 0) throw new Error("end not found");
  return html.slice(0, i + startMarker.length) + newInner + html.slice(j);
}

// Trust strip — unique labels
h = h.replace(/Кабинет принадлежит клиенту/g, "Права на кабинет у клиента");
h = h.replace(/Считаем обращения в Метрике/g, "События считаем в Метрике");
h = h.replace(/Регион показа — город/g, "Показы только по городу");
h = h.replace(/Обращения учитываем в Метрике/g, "События считаем в Метрике");
h = h.replace(/География ограничена городом/g, "Показы только по городу");
h = h.replace(/Кабинет остаётся за клиентом/g, "Права на кабинет у клиента");

const localInner = `
      <div class="rk-container">
        <h2 class="rk-h2">Параметры до модерации</h2>
        <p class="yd-section-lead">До запуска фиксируем периметр города, список пунктов Жетысу, решение по Алматы, ветки RU/KK, часы приёма и критерий качественного контакта.</p>
        <div class="yd-artifact-grid">
          <article class="yd-artifact yd-artifact--cabinet">
            <span class="yd-demo-label">География</span>
            <h3 class="yd-artifact__title">Город, область и Алматы — три контура</h3>
            <p class="yd-artifact__note">В регионах включаем строку Талдыкоргана. Жетысу добавляем именами только при фактическом выезде или выдаче. Алматы держим вне городского лимита либо выносим отдельной кампанией. После цикла сверяем отчёт местоположений с картой обслуживания.</p>
          </article>
          <article class="yd-artifact yd-artifact--flow">
            <span class="yd-demo-label">Языки</span>
            <h3 class="yd-artifact__title">RU и KK без взаимной кальки</h3>
            <p class="yd-artifact__note">Казахские запросы собираем отдельной семантикой и своими текстами. Перевод русского списка почти всегда промахивается. Язык объявления, минус-слов и URL совпадает с языком запроса.</p>
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
        <p class="yd-section-lead">Ниже — типовые постановки для бизнеса Талдыкоргана. Клиентских кейсов, отзывов и рейтингов на странице нет.</p>
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
            <p>При стабильных KK-запросах и посадочной на kk поднимаем отдельную линию: свои ключи, тексты и минус-лист. Русскую семантику один в один не переносим.</p>
          </article>
        </div>
      </div>
    `;
h = replaceBetween(h, '<section class="rk-section" id="audience">', '<section class="rk-section" id="campaign-types">', audInner);

// FAQ KK / Metrika / account — more unique vs kokshetau patched FAQ
h = h.replaceAll(
  "Нужна при живом KK-спросе и посадочной на kk. Русский список не копируем один в один: формулировки другие. Собираем отдельные ключи, тексты и минус-слова.",
  "Если KK-спрос живой и есть посадочная на kk — да. Русский список не копируем: формулировки другие. Собираем отдельные ключи, тексты и минус-слова."
);
h = h.replaceAll(
  "Звонок с мобильного через тап по номеру учитывается целью так же, как отправка формы — источник виден в отчётах. Без счётчика остаются клики и списания. События описываем до старта показов.",
  "Тап по телефону со смартфона пишется целью наравне с формой — источник звонка виден в отчётах. Без счётчика остаются клики и списания. События описываем до старта показов."
);
h = h.replaceAll(
  "В большинстве проектов остаёмся в текущем кабинете: история помогает стратегиям. Слабые связки отключаем, рабочие переносим под контур Талдыкоргана. Новый аккаунт нужен редко — например при потере доступа.",
  "Чаще продолжаем в текущем кабинете: история помогает стратегиям. Слабые связки отключаем, рабочие переносим под контур Талдыкоргана. Новый аккаунт нужен редко — например при потере доступа."
);

fs.writeFileSync(OUT, h);
console.log("patched7");
