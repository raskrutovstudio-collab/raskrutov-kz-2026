import { cities } from './_cities-batch4.mjs';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '../../..');
const astanaPath = path.join(
  root,
  'site_mirror/web-studiya/kontekstnaya-reklama/google-ads/astana/index.html',
);

const ICON = {
  search:
    '<span class="gads-scope-list__icon" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" focusable="false" aria-hidden="true"><circle cx="11" cy="11" r="6.5" stroke="currentColor" stroke-width="1.8"/><path d="M16 16l4 4" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg></span>',
  list: '<span class="gads-scope-list__icon" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" focusable="false" aria-hidden="true"><path d="M5 7h14M5 12h10M5 17h12" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg></span>',
  rect: '<span class="gads-scope-list__icon" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" focusable="false" aria-hidden="true"><rect x="4" y="5" width="16" height="14" rx="2" stroke="currentColor" stroke-width="1.8"/><path d="M8 9h8M8 13h5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg></span>',
  speech:
    '<span class="gads-scope-list__icon" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" focusable="false" aria-hidden="true"><path d="M5 19V5h14v10H9l-4 4z" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/></svg></span>',
  arrows:
    '<span class="gads-scope-list__icon" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" focusable="false" aria-hidden="true"><path d="M12 4v16M7 9l5-5 5 5M7 15l5 5 5-5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg></span>',
  chart:
    '<span class="gads-scope-list__icon" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" focusable="false" aria-hidden="true"><path d="M4 19V5M4 19h16" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/><path d="M8 15v-5M12 15V7M16 15v-3" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg></span>',
};

const MARK =
  '<span class="gads-tasks-panel__mark" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" focusable="false" aria-hidden="true"><circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="1.7"/><path d="M8.2 12.2l2.4 2.4 5.2-5.2" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/></svg></span>';


function esc(s) {
  return String(s)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
}

function cardClass(key) {
  return {
    local: 'gads-card gads-card--local',
    b2b: 'gads-card gads-card--b2b',
    ecom: 'gads-card gads-card--ecom',
    account: 'gads-card gads-card--account',
  }[key];
}

function cardImg(key) {
  return {
    local: 'local-map-pin.webp',
    b2b: 'b2b-briefcase.webp',
    ecom: 'ecommerce-bag.webp',
    account: 'account-chart.webp',
  }[key];
}

function campClass(key) {
  return {
    search: 'gads-camp gads-camp--search',
    pmax: 'gads-camp gads-camp--pmax',
    shop: 'gads-camp gads-camp--shop',
  }[key];
}

function campImg(key) {
  return {
    search: 'camp-search-screen.webp',
    pmax: 'camp-pmax-target.webp',
    shop: 'camp-shopping-box.webp',
  }[key];
}

function statusClass(kind) {
  return kind === 'warn' ? 'gads-status gads-status--warn' : 'gads-status gads-status--ok';
}

function renderHead(c, chrome) {
  const pageUrl = `https://raskrutov.kz/web-studiya/kontekstnaya-reklama/google-ads/${c.slug}/`;
  const faqs = c.faqs.map(([name, text]) => ({
    '@type': 'Question',
    name,
    acceptedAnswer: { '@type': 'Answer', text },
  }));
  const graph = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': ['Organization', 'ProfessionalService'],
        '@id': 'https://raskrutov.kz/#organization',
        name: 'Raskrutov',
        url: 'https://raskrutov.kz/',
        logo: { '@type': 'ImageObject', url: 'https://raskrutov.kz/assets/m-files.cdn1.cc/web/images/raskrutov/logo.png' },
        email: 'info@raskrutov.kz',
        telephone: '+7 700 021 69 00',
        address: {
          '@type': 'PostalAddress',
          addressCountry: 'KZ',
          addressLocality: 'Петропавловск',
          streetAddress: 'ул. М. Жумабаева, 109, 6 этаж, офис 606а',
        },
        sameAs: [
          'https://www.instagram.com/raskrutov.kz/',
          'https://www.youtube.com/@raskrutov-kz',
          'https://t.me/Raskrutov_web',
          'https://www.tiktok.com/@raskrutov.kz',
        ],
      },
      {
        '@type': 'WebSite',
        '@id': 'https://raskrutov.kz/#website',
        url: 'https://raskrutov.kz/',
        name: 'Raskrutov',
        publisher: { '@id': 'https://raskrutov.kz/#organization' },
        inLanguage: 'ru-KZ',
      },
      {
        '@type': 'WebPage',
        '@id': `${pageUrl}#webpage`,
        url: pageUrl,
        name: c.title,
        description: c.description,
        isPartOf: { '@id': 'https://raskrutov.kz/#website' },
        about: { '@id': `${pageUrl}#service` },
        breadcrumb: { '@id': `${pageUrl}#breadcrumb` },
        inLanguage: 'ru-KZ',
      },
      {
        '@type': 'BreadcrumbList',
        '@id': `${pageUrl}#breadcrumb`,
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Главная', item: 'https://raskrutov.kz/' },
          { '@type': 'ListItem', position: 2, name: 'Студия', item: 'https://raskrutov.kz/web-studiya/' },
          { '@type': 'ListItem', position: 3, name: 'Контекстная реклама', item: 'https://raskrutov.kz/web-studiya/kontekstnaya-reklama/' },
          { '@type': 'ListItem', position: 4, name: 'Google Ads', item: 'https://raskrutov.kz/web-studiya/kontekstnaya-reklama/google-ads/' },
          { '@type': 'ListItem', position: 5, name: c.ru, item: pageUrl },
        ],
      },
      {
        '@type': 'Service',
        '@id': `${pageUrl}#service`,
        name: c.serviceName,
        url: pageUrl,
        provider: { '@id': 'https://raskrutov.kz/#organization' },
        areaServed: { '@type': 'City', name: c.schemaCity },
        serviceType: 'Google Ads',
        description: c.serviceDesc,
      },
      {
        '@type': 'FAQPage',
        '@id': `${pageUrl}#faq`,
        mainEntity: faqs,
      },
    ],
  };
  const style =
    '.rk-form--contacts .rk-consent--contacts{margin:0 0 15px;font-size:12px;line-height:1.4}.rk-form--contacts .rk-consent--contacts input{width:18px;height:18px}.ctx-page .rk-breadcrumbs ol{row-gap:8px}.ctx-page .rk-breadcrumbs a,.ctx-page .rk-breadcrumbs [aria-current=page]{min-height:24px;display:inline-flex;align-items:center;padding:3px 0}.gads-page #about a,.gads-page .gads-prose a{text-decoration:underline;text-underline-offset:2px}';
  return `<!DOCTYPE html>
<html lang="ru">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${esc(c.title)}</title>
  <meta name="robots" content="index, follow">
  <meta name="description" content="${esc(c.description)}">
  <link rel="canonical" href="${pageUrl}">
  <meta property="og:title" content="${esc(c.title)}">
  <meta property="og:description" content="${esc(c.description)}">
  <meta property="og:image" content="https://raskrutov.kz/assets/img/kontekstnaya-reklama/hero-ctx.webp">
  <meta property="og:site_name" content="Raskrutov">
  <meta property="og:type" content="website">
  <meta property="og:url" content="${pageUrl}">
  <meta property="og:locale" content="ru_RU">
${chrome.assets}
  <style>${style}</style>
  <script type="application/ld+json">
  ${JSON.stringify(graph, null, 2).replace(/^/gm, '  ').trimStart()}
  </script>
</head>`;
}

function renderMain(c) {
  const p = c.prefix;
  const cards = c.cards
    .map(
      ([key, h, t]) =>
        `<article class="${cardClass(key)}"><span class="gads-card__visual" aria-hidden="true"><img src="../../../../assets/img/google-ads/3d/${cardImg(key)}" width="256" height="256" alt="" loading="lazy" decoding="async"></span><h3>${h}</h3><p>${t}</p></article>`,
    )
    .join('\n          ');
  const camps = c.camps
    .map(
      ([key, meta, h, t]) =>
        `<article class="${campClass(key)}"><span class="gads-camp__visual" aria-hidden="true"><img src="../../../../assets/img/google-ads/3d/${campImg(key)}" width="256" height="256" alt="" loading="lazy" decoding="async"></span><span class="gads-camp__meta">${meta}</span><h3>${h}</h3><p>${t}</p></article>`,
    )
    .join('\n          ');
  const decisions = c.decisions
    .map(([h, t]) => `<article class="gads-decision__card"><h3>${h}</h3><p>${t}</p></article>`)
    .join('\n          ');
  const setup = c.setup
    .map(([ico, h, t]) => `<li class="gads-scope-list__item">${ICON[ico]}<div><h3>${h}</h3><p>${t}</p></div></li>`)
    .join('\n          ');
  const tasks = c.tasks.map((t) => `<li>${MARK}${t}</li>`).join('\n            ');
  const analytics = c.analytics
    .map(([h, t]) => `<article class="gads-decision__card"><h3>${h}</h3><p>${t}</p></article>`)
    .join('\n          ');
  const process = c.process
    .map(([h, t]) => `<li class="gads-timeline__item"><h3>${h}</h3><p>${t}</p></li>`)
    .join('\n          ');
  const price = c.priceItems.map((t) => `<li>${t}</li>`).join('\n            ');
  const treeRows = c.tree
    .map((row, i) => {
      const child = i === 0 ? '' : ' gads-tree__row--child';
      return `<div class="gads-tree__row${child}"><span class="gads-tree__label">${row[0]}</span><em class="${statusClass(row[1])}">${row[2]}</em></div>`;
    })
    .join('');
  const faqs = c.faqs
    .map(([q, a], i) => {
      const n = i + 1;
      return `<div class="gads-faq__item"><h3 class="gads-faq__q"><button type="button" class="gads-faq__btn" data-gads-faq-btn aria-expanded="false" aria-controls="${p}-faq-a${n}" id="${p}-faq-q${n}">${q}</button></h3><div class="gads-faq__a" id="${p}-faq-a${n}" role="region" aria-labelledby="${p}-faq-q${n}" hidden>${a}</div></div>`;
    })
    .join('\n          ');
  const panel = c.serpPanel
    .map(([label, kind, st]) => `<li><span>${label}</span><em class="${statusClass(kind)}">${st}</em></li>`)
    .join('');
  const flow = c.flow.map((x) => `<span>${x}</span>`).join('');
  return `  <main id="main">
    <nav class="rk-breadcrumbs" aria-label="Хлебные крошки">
      <ol>
        <li><a href="/">Главная</a></li>
        <li><a href="/web-studiya/">Студия</a></li>
        <li><a href="/web-studiya/kontekstnaya-reklama/">Контекстная реклама</a></li>
        <li><a href="/web-studiya/kontekstnaya-reklama/google-ads/">Google Ads</a></li>
        <li><span aria-current="page">${c.ru}</span></li>
      </ol>
    </nav>

    <section class="ctx-hero" id="ctx-hero" aria-label="${c.heroAria}">
      <div class="rk-container ctx-hero__grid">
        <div class="ctx-hero__copy">
          <h1 class="ctx-hero__title">${c.h1}</h1>
          <p class="ctx-hero__sub">${c.heroSub}</p>
          <div class="gads-hero-price"><strong class="gads-hero-price__value">от 120 000 ₸ / мес</strong><span class="gads-hero-price__note">Работа агентства · медиабюджет отдельно</span></div>
          <p class="ctx-hero__lead">${c.heroLead}</p>
          <div class="ctx-hero__actions">
            <button class="ctx-btn ctx-btn--primary" type="button" data-rk-open-modal="rk-modal-lead">${c.heroCta} <span class="ctx-btn__arrow" aria-hidden="true">→</span></button>
            <a class="ctx-btn ctx-btn--ghost" href="#pricing">Стоимость и состав работ</a>
          </div>
          <div class="gads-trust-strip" role="list">
            <div class="gads-trust-strip__item" role="listitem"><span>Аккаунт клиента</span></div>
            <div class="gads-trust-strip__item" role="listitem"><span>Конверсии и заявки</span></div>
            <div class="gads-trust-strip__item" role="listitem"><span>${c.trust3}</span></div>
          </div>
        </div>
        <figure class="gads-hero-visual" aria-label="Демонстрационный пример поисковой рекламы Google в ${c.ru}">
          <div class="gads-serp" aria-hidden="true">
            <div class="gads-serp__chrome"><span class="gads-serp__dot gads-serp__dot--r"></span><span class="gads-serp__dot gads-serp__dot--y"></span><span class="gads-serp__dot gads-serp__dot--g"></span><span class="gads-serp__chrome-label">Поиск · демо</span></div>
            <div class="gads-serp__search"><svg class="gads-serp__g" viewBox="0 0 24 24" focusable="false" aria-hidden="true"><path fill="#4285F4" d="M12 11v2.4h5.4c-.2 1.3-1.6 3.8-5.4 3.8-3.3 0-6-2.7-6-6s2.7-6 6-6c1.9 0 3.1.8 3.8 1.5l2.6-2.5C16.8 2.7 14.6 1.6 12 1.6 6.9 1.6 2.7 5.8 2.7 11S6.9 20.4 12 20.4c5.5 0 9.1-3.9 9.1-9.3 0-.6-.1-1.1-.2-1.6H12z"/></svg><span class="gads-serp__query">${c.serpQuery}</span></div>
            <div class="gads-serp__body">
              <div class="gads-serp__ads">
                <article class="gads-serp-ad"><div class="gads-serp-ad__meta"><span class="gads-serp-ad__badge">Реклама</span><span class="gads-serp-ad__url">${c.serpUrl1}</span></div><p class="gads-serp-ad__title">${c.serpTitle1}</p><p class="gads-serp-ad__desc">${c.serpDesc1}</p><div class="gads-serp-ad__sitelinks"><span>${c.serpLinks[0]}</span><span>${c.serpLinks[1]}</span><span>${c.serpLinks[2]}</span></div></article>
                <article class="gads-serp-ad"><div class="gads-serp-ad__meta"><span class="gads-serp-ad__badge">Реклама</span><span class="gads-serp-ad__url">${c.serpUrl2}</span></div><p class="gads-serp-ad__title">${c.serpTitle2}</p><p class="gads-serp-ad__desc">${c.serpDesc2}</p></article>
              </div>
              <aside class="gads-serp__aside">
                <div class="gads-serp-panel"><p class="gads-serp-panel__title">Кабинет · демо</p><ul class="gads-serp-panel__list">${panel}</ul></div>
                <div class="gads-serp-flow">${flow}</div>
              </aside>
            </div>
          </div>
          <figcaption class="gads-hero-visual__caption">Демонстрационный интерфейс, без данных клиентов</figcaption>
        </figure>
      </div>
    </section>

    <section class="rk-section" id="about">
      <div class="rk-container gads-prose">
        <div class="gads-about-heading"><img class="gads-about-heading__icon" src="../../../../assets/img/google-ads/google-ads-icon.svg" width="44" height="44" alt="" decoding="async"><h2 class="rk-h2 gads-about-heading__title">${c.aboutH2}</h2></div>
        <p>${c.aboutP1}</p>
        <p>${c.aboutP2}</p>
      </div>
    </section>

    <section class="rk-section" id="audience">
      <div class="rk-container">
        <h2 class="rk-h2">${c.audienceH2}</h2>
        <p class="gads-section-lead">${c.audienceLead}</p>
        <div class="gads-card-grid">
          ${cards}
        </div>
      </div>
    </section>

    <section class="rk-section" id="campaign-types">
      <div class="rk-container">
        <h2 class="rk-h2">${c.campH2}</h2>
        <p class="gads-section-lead">${c.campLead}</p>
        <div class="gads-camp-grid">
          ${camps}
        </div>
      </div>
    </section>

    <section class="rk-section" id="format-decision">
      <div class="rk-container">
        <h2 class="rk-h2">${c.decisionH2}</h2>
        <div class="gads-decision-grid">
          ${decisions}
        </div>
      </div>
    </section>

    <section class="rk-section" id="setup">
      <div class="rk-container">
        <h2 class="rk-h2">${c.setupH2}</h2>
        <ul class="gads-scope-list">
          ${setup}
        </ul>
      </div>
    </section>

    <section class="rk-section" id="management">
      <div class="rk-container">
        <h2 class="rk-h2">${c.mgmtH2}</h2>
        <div class="gads-tasks-panel">
          <ul class="gads-tasks-panel__list">
            ${tasks}
          </ul>
        </div>
      </div>
    </section>

    <section class="rk-section" id="${c.geoId}">
      <div class="rk-container gads-prose">
        <h2 class="rk-h2">${c.geoH2}</h2>
        <p>${c.geoP1}</p>
        <p>${c.geoP2}</p>
      </div>
    </section>

    <section class="rk-section" id="analytics">
      <div class="rk-container">
        <h2 class="rk-h2">${c.analyticsH2}</h2>
        <p class="gads-section-lead">${c.analyticsLead}</p>
        <div class="gads-decision-grid">
          ${analytics}
        </div>
      </div>
    </section>

    <section class="rk-section" id="process">
      <div class="rk-container">
        <h2 class="rk-h2">${c.processH2}</h2>
        <ol class="gads-timeline">
          ${process}
        </ol>
      </div>
    </section>

    <section class="rk-section" id="pricing">
      <div class="rk-container">
        <h2 class="rk-h2">Стоимость настройки и ведения</h2>
        <div class="gads-price-board">
          <p class="gads-price-board__value">от 120 000 ₸ / мес</p>
          <p class="gads-price-board__lead">В стоимость входит работа агентства по настройке и ведению Google Ads. Медиабюджет оплачивается отдельно напрямую Google.</p>
          <ul>
            ${price}
          </ul>
        </div>
      </div>
    </section>

    <section class="rk-section" id="control">
      <div class="rk-container">
        <h2 class="rk-h2">${c.controlH2}</h2>
        <p class="gads-section-lead">${c.controlLead}</p>
        <div class="gads-artifact-grid">
          <article class="gads-artifact gads-artifact--cabinet"><span class="gads-demo-label">Демонстрационный интерфейс</span><h3 class="gads-artifact__title">Контуры кампаний по ${c.ru}</h3><div class="gads-artifact__body"><div class="gads-tree" aria-hidden="true">${treeRows}</div></div><p class="gads-artifact__note">${c.treeNote}</p></article>
          <article class="gads-artifact gads-artifact--flow"><span class="gads-demo-label">Демонстрационный интерфейс</span><h3 class="gads-artifact__title">Путь обращения</h3><div class="gads-flow-track" aria-hidden="true"><span>Google Ads</span><span class="gads-flow-track__arrow"></span><span>Страница ${c.ru}</span><span class="gads-flow-track__arrow"></span><span>Форма / звонок</span><span class="gads-flow-track__arrow"></span><span>Отчёт</span></div><p class="gads-artifact__note">${c.flowNote}</p></article>
          <article class="gads-artifact gads-artifact--report"><span class="gads-demo-label">Демонстрационный интерфейс</span><h3 class="gads-artifact__title">Отчёт и план работ</h3><div class="gads-report-grid" aria-hidden="true"><div><p class="gads-report-grid__label">Проверено</p><ul>${c.reportChecked.map((x) => `<li>${x}</li>`).join('')}</ul></div><div><p class="gads-report-grid__label">Изменено</p><ul>${c.reportChanged.map((x) => `<li>${x}</li>`).join('')}</ul></div><div><p class="gads-report-grid__label">Следующий шаг</p><ul>${c.reportNext.map((x) => `<li>${x}</li>`).join('')}</ul></div></div><p class="gads-artifact__note">В отчёте фиксируем решения и основания для дальнейшей оптимизации.</p></article>
        </div>
        <div class="gads-control-follow">
          <ul class="gads-check-list"><li>Доступ к аккаунту остаётся у клиента</li><li>Структура кампаний и групп объявлений</li><li>Список запросов и минус-слов</li><li>Объявления, ассеты и конечные URL</li><li>Настроенные конверсии и UTM</li><li>Контроль дневного и месячного расхода</li><li>Журнал выполненных работ</li><li>План тестов на следующий период</li></ul>
          <p class="gads-disclaimer">Результат зависит от спроса, предложения, сайта, бюджета, конкуренции и обработки обращений. Прогноз уточняется после анализа фактических данных.</p>
        </div>
      </div>
    </section>

    <section class="rk-section" id="landing-seo">
      <div class="rk-container gads-prose">
        <h2 class="rk-h2">${c.landingH2}</h2>
        <p>${c.landingP1}</p>
        <p>${c.landingP2}</p>
      </div>
    </section>

    <section class="ctx-cta-band" aria-label="Обсудить Google Ads в ${c.ru}">
      <div class="rk-container"><h2>${c.ctaH2}</h2><p>${c.ctaP}</p><button class="ctx-btn ctx-btn--light" type="button" data-rk-open-modal="rk-modal-lead">Обсудить рекламу</button></div>
    </section>

    <section class="rk-section" id="faq">
      <div class="rk-container">
        <h2 class="rk-h2">${c.faqH2}</h2>
        <div class="gads-faq" data-gads-faq>
          ${faqs}
        </div>
      </div>
    </section>

    <section class="rk-section ctx-related" id="related" aria-label="Связанные услуги">
      <div class="rk-container">
        <h2 class="rk-h2">Связанные страницы</h2>
        <div class="ctx-related__grid">
          <a href="/web-studiya/kontekstnaya-reklama/google-ads/">Google Ads в Казахстане</a>
          <a href="/web-studiya/kontekstnaya-reklama/${c.slug}/">${c.relatedPpc}</a>
          <a href="/web-studiya/${c.slug}/">${c.relatedStudio}</a>
          <a href="/keysy/prodvizhenie/">Кейсы продвижения</a>
          <a href="/web-studiya/seo-prodvizhenie/${c.slug}/">${c.relatedSeo}</a>
          <a href="/web-studiya/sozdanie-saitov/${c.slug}/">${c.relatedSites}</a>
        </div>
      </div>
    </section>

    <section class="rk-section rk-section--contacts" id="contacts">
      <div class="rk-container">
        <h2 class="rk-h2">Контакты</h2>
        <div class="rk-contacts">
          <div class="rk-contacts__aside">
            <div class="rk-contacts__line" aria-hidden="true"></div>
            <p class="rk-contacts__intro">${c.contactsIntro}</p>
            <div class="rk-form rk-form--contacts">
              <p class="rk-form__title">Отправьте заявку</p>
              <p class="rk-form__lead">Ответим на вопросы и обозначим следующий шаг.</p>
              <form id="${p}-contact-form" name="contacts_google_ads_${c.formCity}" data-lead-form data-form-name="${c.formContacts}" novalidate>
                <div class="rk-field"><label for="${p}-contact-name">Имя</label><input id="${p}-contact-name" type="text" name="name" maxlength="200" autocomplete="name"></div>
                <div class="rk-field"><label for="${p}-contact-phone">Телефон <span class="rk-req" aria-hidden="true">*</span></label><input id="${p}-contact-phone" type="tel" name="phone" required maxlength="40" autocomplete="tel" data-rk-phone-mask inputmode="tel" placeholder="+7 (___) ___ __ __"></div>
                <label class="rk-consent rk-consent--contacts" for="${p}-contact-regulation"><input id="${p}-contact-regulation" type="checkbox" name="regulation" value="accepted" required><span>Я принимаю <a href="/regulation/" target="_blank" rel="noopener">Положение</a> и даю <a href="/consent/" target="_blank" rel="noopener">Согласие</a> на обработку персональных данных.</span></label>
                <input id="${p}-contact-website" type="text" name="website" autocomplete="off" tabindex="-1" aria-hidden="true" class="lead-form-honeypot" value="">
                <div class="rk-form__actions"><button class="rk-btn rk-btn--contacts" type="submit">Отправить заявку</button></div>
                <div data-form-status aria-live="polite" aria-atomic="true" class="lead-form-status"></div>
              </form>
            </div>
          </div>
          <div class="rk-contacts__main">
            <div class="rk-contact-cards">
              <a class="rk-contact-card" href="tel:+77000216900"><img class="rk-contact-card__icon" src="../../../../assets/css/perf-img/42w2x_f__q_62138191.webp" alt="Позвонить" width="42" height="42" loading="lazy" decoding="async"><span class="rk-contact-card__body"><strong class="rk-contact-card__title">Позвоните нам</strong><span class="rk-contact-card__value">+7 700 021 6900</span><span class="rk-contact-card__note">Пн-Пт: 10:00 - 19:00</span></span></a>
              <a class="rk-contact-card" href="https://wa.me/77000216900" target="_blank" rel="noopener noreferrer"><img class="rk-contact-card__icon" src="../../../../assets/css/perf-img/43w2x_f__q_4144924.webp" alt="WhatsApp" width="43" height="43" loading="lazy" decoding="async"><span class="rk-contact-card__body"><strong class="rk-contact-card__title">Напишите в WhatsApp</strong><span class="rk-contact-card__value">+7 700 021 6900</span><span class="rk-contact-card__note">Быстрый ответ в чате</span></span></a>
              <a class="rk-contact-card" href="mailto:info@raskrutov.kz"><img class="rk-contact-card__icon" src="../../../../assets/css/perf-img/42w2x_f__q_5617179.webp" alt="Электронная почта" width="42" height="42" loading="lazy" decoding="async"><span class="rk-contact-card__body"><strong class="rk-contact-card__title">Напишите нам</strong><span class="rk-contact-card__value">info@raskrutov.kz</span><span class="rk-contact-card__note">Ответим в рабочее время</span></span></a>
            </div>
            <p class="rk-contacts__office"><strong>Наш офис:</strong> Казахстан, Петропавловск, ул. М. Жумабаева, 109, 6 этаж, офис 606а.</p>
            <div class="rk-map" data-rk-map data-lat="54.8746" data-lon="69.135701" data-zoom="16" role="region" aria-label="Карта офиса Raskrutov в Петропавловске"></div>
            <div class="rk-contacts-social"><p class="rk-contacts-social__title">Мы в соцсетях</p><div class="rk-contacts-social__row"><a class="rk-contact-soc" href="https://t.me/Raskrutov_web" target="_blank" rel="noopener noreferrer"><span class="rk-contact-soc__icon rk-contact-soc__icon--tg" aria-hidden="true"></span>Telegram</a><a class="rk-contact-soc" href="https://www.instagram.com/raskrutov.kz/" target="_blank" rel="noopener noreferrer"><span class="rk-contact-soc__icon rk-contact-soc__icon--ig" aria-hidden="true"></span>Instagram</a><a class="rk-contact-soc" href="https://www.youtube.com/@raskrutov-kz" target="_blank" rel="noopener noreferrer"><span class="rk-contact-soc__icon rk-contact-soc__icon--yt" aria-hidden="true"></span>YouTube</a><a class="rk-contact-soc" href="https://www.tiktok.com/@raskrutov.kz" target="_blank" rel="noopener noreferrer"><span class="rk-contact-soc__icon rk-contact-soc__icon--tt" aria-hidden="true"></span>TikTok</a></div></div>
          </div>
        </div>
      </div>
    </section>
  </main>`;
}

function renderModal(c, chrome) {
  const p = c.prefix;
  return chrome.afterMain
    .replaceAll('gads-ast-popup-form', `${p}-popup-form`)
    .replaceAll('popup_google_ads_astana', `popup_google_ads_${c.formCity}`)
    .replaceAll('Попап — Google Ads Астана', c.formPopup)
    .replaceAll('gads-ast-popup-', `${p}-popup-`)
    .replaceAll('Обсудим Google Ads в Астане?', c.popupTitle);
}

function extractChrome(astana) {
  const assetsStart = astana.indexOf('  <link href="../../../../assets/m-files.cdn1.cc/lpfile/favicon/favicon__q_1.png"');
  const assetsEnd = astana.indexOf('  <style>');
  const headerStart = astana.indexOf('<body class="rk-clean ctx-page gads-page">');
  const headerEnd = astana.indexOf('  <main id="main">');
  const afterMainStart = astana.indexOf('  <nav class="rk-sticky-cta"');
  return {
    assets: astana.slice(assetsStart, assetsEnd).trimEnd(),
    header: astana.slice(headerStart, headerEnd).trimEnd(),
    afterMain: astana.slice(afterMainStart),
  };
}

const astana = fs.readFileSync(astanaPath, 'utf8');
const chrome = extractChrome(astana);

for (const c of Object.values(cities)) {
  const html = `${renderHead(c, chrome)}
${chrome.header}

${renderMain(c)}

${renderModal(c, chrome)}`;
  const out = path.join(
    root,
    `site_mirror/web-studiya/kontekstnaya-reklama/google-ads/${c.slug}/index.html`,
  );
  fs.mkdirSync(path.dirname(out), { recursive: true });
  fs.writeFileSync(out, html.replace(/\r\n/g, '\n'), 'utf8');
  const icons = (html.match(/gads-scope-list__icon/g) || []).length;
  const marks = (html.match(/gads-tasks-panel__mark/g) || []).length;
  const items = (html.match(/gads-scope-list__item/g) || []).length;
  console.log(`${c.slug} bytes=${Buffer.byteLength(html)} icons=${icons}/${items} marks=${marks}`);
}
