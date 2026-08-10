const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const htmlPath = path.join(root, 'site_mirror', 'keysy', 'partnery', 'index.html');
const cssPath = path.join(root, 'site_mirror', 'assets', 'css', 'case-study.css');

let html = fs.readFileSync(htmlPath, 'utf8');
let css = fs.readFileSync(cssPath, 'utf8');

const mainHeader = `  <header class="rk-header">
    <div class="rk-container rk-header__bar">
      <a class="rk-logo" href="https://raskrutov.kz/" aria-label="Raskrutov — на главную">
        <img src="/assets/m-files.cdn1.cc/lpfile/8/1/a/81a3fe2ab76d8a7d4df2ea1900ce0265/-/crop/0x0x955x221/-/resize/211/-/scale/x3/-/resize/1920/f.webp" alt="Raskrutov" width="211" height="49" decoding="async">
      </a>
      <nav class="rk-nav" aria-label="Основное меню">
        <a href="/">Главная</a>
        <a href="/web-studiya/">Студия</a>
        <a href="/r-builder/">R-Builder</a>
        <a href="/akademiya/">Академия</a>
        <a href="/partneram/">Партнёры</a>
        <a href="/o-kompanii/">О компании</a>
        <a href="/keysy/" aria-current="page">Кейсы</a>
        <a href="/faq/">Вопросы</a>
        <a href="/kontakty/">Контакты</a>
      </nav>
      <div class="rk-header__contacts">
        <a class="rk-wa" href="https://wa.me/77000216900" target="_blank" rel="noopener noreferrer" aria-label="Написать в WhatsApp">
          <img src="/assets/css/perf-img/30w2x_f__q_4144924.webp" alt="" width="30" height="30" decoding="async">
        </a>
        <a class="rk-header__phone" href="tel:+77000216900">+7 700 021 69 00</a>
      </div>
      <button class="rk-burger" type="button" data-rk-menu-toggle aria-controls="rk-mobile-nav" aria-expanded="false" aria-label="Открыть меню">
        <span></span><span></span><span></span>
      </button>
    </div>
    <div class="rk-container rk-mobile-nav" id="rk-mobile-nav" data-rk-mobile-nav hidden>
      <nav aria-label="Мобильное меню">
        <a href="/">Главная</a>
        <a href="/web-studiya/">Студия</a>
        <a href="/r-builder/">R-Builder</a>
        <a href="/akademiya/">Академия</a>
        <a href="/partneram/">Партнёры</a>
        <a href="/o-kompanii/">О компании</a>
        <a href="/keysy/" aria-current="page">Кейсы</a>
        <a href="/faq/">Вопросы</a>
        <a href="/kontakty/">Контакты</a>
      </nav>
      <div class="rk-mobile-nav__contacts">
        <a class="rk-wa" href="https://wa.me/77000216900" target="_blank" rel="noopener noreferrer" aria-label="WhatsApp"><img src="/assets/css/perf-img/30w2x_f__q_4144924.webp" alt="" width="30" height="30" decoding="async"></a>
        <a class="rk-header__phone" href="tel:+77000216900">+7 700 021 69 00</a>
      </div>
    </div>
  </header>`;

const contactsSection = `
    <section class="rk-section rk-section--contacts" id="contacts">
      <div class="rk-container">
        <h2 class="rk-h2">Контакты</h2>
        <div class="rk-contacts">
          <div class="rk-contacts__aside">
            <div class="rk-contacts__line" aria-hidden="true"></div>
            <p class="rk-contacts__intro">Готовы обсудить ваш проект? Свяжитесь с нами удобным способом или отправьте заявку — мы ответим в ближайшее время.</p>
            <div class="rk-form rk-form--contacts">
              <p class="rk-form__title">Отправьте заявку</p>
              <p class="rk-form__lead">Расскажите о вашем проекте — мы предложим подходящее решение.</p>
              <form id="rk-form-contacts" name="contacts_partner_case" data-lead-form data-form-name="Контакты — кейс партнёра Turan Agency" novalidate>
                <div class="rk-field">
                  <label for="rk-contact-name">Имя: <span class="rk-req" aria-hidden="true">*</span></label>
                  <input id="rk-contact-name" type="text" name="name" maxlength="200" autocomplete="name">
                </div>
                <div class="rk-field">
                  <label for="rk-contact-phone">Телефон: <span class="rk-req" aria-hidden="true">*</span></label>
                  <input id="rk-contact-phone" type="tel" name="phone" required maxlength="40" autocomplete="tel" data-rk-phone-mask inputmode="tel" placeholder="+7 (___) ___ __ __">
                </div>
                <input type="text" name="website" autocomplete="off" tabindex="-1" aria-hidden="true" class="lead-form-honeypot" value="">
                <div class="rk-form__actions">
                  <button class="rk-btn rk-btn--contacts" type="submit">Отправить заявку</button>
                </div>
                <div data-form-status aria-live="polite" class="lead-form-status"></div>
              </form>
            </div>
          </div>
          <div class="rk-contacts__main">
            <div class="rk-contact-cards">
              <a class="rk-contact-card" href="tel:+77000216900">
                <img class="rk-contact-card__icon" src="/assets/css/perf-img/42w2x_f__q_62138191.webp" alt="" width="42" height="42" loading="lazy" decoding="async">
                <span class="rk-contact-card__body"><strong class="rk-contact-card__title">Позвоните нам</strong><span class="rk-contact-card__value">+7 700 021 6900</span><span class="rk-contact-card__note">Пн–Пт: 10:00–19:00</span></span>
              </a>
              <a class="rk-contact-card" href="https://wa.me/77000216900" target="_blank" rel="noopener noreferrer">
                <img class="rk-contact-card__icon" src="/assets/css/perf-img/43w2x_f__q_4144924.webp" alt="" width="43" height="43" loading="lazy" decoding="async">
                <span class="rk-contact-card__body"><strong class="rk-contact-card__title">Напишите в WhatsApp</strong><span class="rk-contact-card__value">+7 700 021 6900</span><span class="rk-contact-card__note">Быстрый ответ в чате</span></span>
              </a>
              <a class="rk-contact-card" href="mailto:info@raskrutov.kz">
                <img class="rk-contact-card__icon" src="/assets/css/perf-img/42w2x_f__q_5617179.webp" alt="" width="42" height="42" loading="lazy" decoding="async">
                <span class="rk-contact-card__body"><strong class="rk-contact-card__title">Напишите нам</strong><span class="rk-contact-card__value">info@raskrutov.kz</span><span class="rk-contact-card__note">Ответим в рабочее время</span></span>
              </a>
            </div>
            <p class="rk-contacts__office"><strong>Наш офис:</strong> Казахстан, Петропавловск, ул. М. Жумабаева, 109, 6 этаж, офис 606а.</p>
            <div class="rk-map" data-rk-map data-lat="54.8746" data-lon="69.135701" data-zoom="16" aria-label="Карта офиса Raskrutov"></div>
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
    </section>`;

const floatingWidgets = `
  <button class="rk-scroll-top" type="button" data-rk-scroll-top aria-label="Наверх"><span class="rk-scroll-top__icon" aria-hidden="true"></span></button>
  <div class="rk-soc-widget" aria-label="Соцсети">
    <div class="rk-soc-widget__links">
      <div class="rk-soc-widget__item"><span class="rk-soc-widget__name">Instagram</span><a class="rk-soc-widget__link" href="https://www.instagram.com/raskrutov.kz/" target="_blank" rel="noopener noreferrer"><img src="/assets/m-files.cdn1.cc/lpfile/f/9/3/f939580957ea257f9e435e71a310f569__q_18485803.svg" alt="Instagram" width="40" height="40" loading="lazy" decoding="async"></a></div>
      <div class="rk-soc-widget__item"><span class="rk-soc-widget__name">YouTube</span><a class="rk-soc-widget__link" href="https://www.youtube.com/@raskrutov-kz" target="_blank" rel="noopener noreferrer"><img src="/assets/m-files.cdn1.cc/lpfile/1/a/3/1a3aec5b62e236175210693a3b47f120__q_38554995.svg" alt="YouTube" width="40" height="40" loading="lazy" decoding="async"></a></div>
      <div class="rk-soc-widget__item"><span class="rk-soc-widget__name">Telegram</span><a class="rk-soc-widget__link" href="https://t.me/Raskrutov_web" target="_blank" rel="noopener noreferrer"><img src="/assets/m-files.cdn1.cc/lpfile/e/2/f/e2f45634e014aa849ccd5945f35e8552__q_20639684.svg" alt="Telegram" width="40" height="40" loading="lazy" decoding="async"></a></div>
      <div class="rk-soc-widget__item"><span class="rk-soc-widget__name">WhatsApp</span><a class="rk-soc-widget__link" href="https://wa.me/77000216900" target="_blank" rel="noopener noreferrer"><img src="/assets/m-files.cdn1.cc/lpfile/b/3/c/b3cb4915b277c4b4ecd1f62d1f6b9d18__q_16889923.svg" alt="WhatsApp" width="40" height="40" loading="lazy" decoding="async"></a></div>
    </div>
    <div class="rk-soc-widget__main">
      <button class="rk-soc-widget__toggle" type="button" data-rk-soc-toggle aria-expanded="false" aria-label="Открыть соцсети">
        <svg class="rk-soc-widget__icon rk-soc-widget__icon--open" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 25 25" aria-hidden="true"><path d="M17.9 6H8.1C6.94 6 6 6.94 6 8.1v10.5c0 .54.58.87 1.06.6l3.14-1.9c.12-.07.25-.1.39-.1h7.31c1.16 0 2.1-.94 2.1-2.1v-7C20 6.94 19.06 6 17.9 6ZM10.2 12.3a.7.7 0 1 1 0-1.4.7.7 0 0 1 0 1.4Zm2.8 0a.7.7 0 1 1 0-1.4.7.7 0 0 1 0 1.4Zm2.8 0a.7.7 0 1 1 0-1.4.7.7 0 0 1 0 1.4Z" fill="#fff"/></svg>
        <svg class="rk-soc-widget__icon rk-soc-widget__icon--close" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 25 25" aria-hidden="true"><path d="M7.5 5.5 5.5 7.5l5 5-5 5 2 2 5-5 5 5 2-2-5-5 5-5-2-2-5 5-5-5Z" fill="#808080"/></svg>
      </button>
    </div>
  </div>
  <div class="rk-mobile-sticky" aria-label="Быстрые контакты">
    <a href="tel:+77000216900">Позвонить</a>
    <a href="https://wa.me/77000216900" target="_blank" rel="noopener noreferrer">WhatsApp</a>
  </div>`;

// Shared homepage styles first; case styles stay last and keep case-specific visuals.
if (!html.includes('/assets/css/home-clean-critical.v1.css')) {
  html = html.replace(
    '<link rel="stylesheet" href="/assets/css/case-study.css">',
    '<link rel="stylesheet" href="/assets/css/home-clean-critical.v1.css?v=1">\n  <link rel="stylesheet" href="/assets/css/home-clean-deferred.v1.css?v=1" media="print" onload="this.media=\'all\'">\n  <noscript><link rel="stylesheet" href="/assets/css/home-clean-deferred.v1.css?v=1"></noscript>\n  <link rel="stylesheet" href="/assets/css/lead-forms.css" media="print" onload="this.media=\'all\'">\n  <noscript><link rel="stylesheet" href="/assets/css/lead-forms.css"></noscript>\n  <link rel="stylesheet" href="/assets/css/case-study.css?v=2">'
  );
}

html = html.replace('<body>', '<body class="rk-clean case-study-page">');
html = html.replace(/  <header class="site-header"[\s\S]*?<\/header>/, mainHeader);

// Replace old dark footer + old two-button floating actions with homepage contact shell and widgets.
html = html.replace(/\n  <footer class="site-footer">[\s\S]*?<\/footer>\n\n  <div class="floating-actions"[\s\S]*?<\/div>/, '');
if (!html.includes('class="rk-section rk-section--contacts"')) {
  html = html.replace('\n  </main>', `${contactsSection}\n  </main>`);
}
if (!html.includes('class="rk-soc-widget"')) {
  html = html.replace('\n  <script src="/assets/js/case-study.js" defer></script>', `${floatingWidgets}\n\n  <script src="/assets/js/home-clean.js?v=21" defer></script>\n  <script src="/assets/js/lead-forms.js" defer></script>\n  <script src="/assets/js/case-study.js" defer></script>`);
}

const scaleCss = `

/* === Shared Raskrutov shell + corrected global case scale === */
.case-study-page.rk-clean {
  min-width: 320px;
  font-size: 13px;
}

.case-study-page {
  --container: 1400px;
  --header-height: 64px;
}

.case-study-page .section {
  padding-block: clamp(52px, 5vw, 72px);
}

.case-study-page .hero {
  padding-top: clamp(34px, 3.5vw, 52px);
}

.case-study-page .section-heading {
  margin-bottom: 36px;
}

.case-study-page .hero__grid {
  gap: clamp(42px, 5vw, 72px);
  grid-template-columns: minmax(0, 1.25fr) minmax(360px, 0.75fr);
}

.case-study-page .hero__content {
  max-width: 820px;
}

.case-study-page .hero-profile {
  max-width: 430px;
}

.case-study-page .comparison-card,
.case-study-page .project-card,
.case-study-page .leader-card,
.case-study-page .contact-card {
  padding: clamp(24px, 2.6vw, 36px);
}

.case-study-page .system-card {
  min-height: 210px;
  padding: 24px;
}

.case-study-page .system-card__number {
  margin-bottom: 34px;
}

.case-study-page .case-navigation__inner {
  min-height: 72px;
}

/* Main-site mobile sticky contact bar. */
.rk-mobile-sticky {
  display: none;
}

@media (max-width: 980px) {
  .case-study-page .hero__grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 720px) {
  .case-study-page .section {
    padding-block: 50px;
  }
  .case-study-page .hero {
    padding-top: 28px;
  }
  .case-study-page .hero-profile {
    width: min(100%, 520px);
  }
}

@media (max-width: 500px) {
  .case-study-page.rk-clean {
    min-width: 320px;
    padding-bottom: 64px;
  }
  .case-study-page .container {
    width: min(calc(100% - 24px), var(--container));
  }
  .case-study-page .section {
    padding-block: 42px;
  }
  .case-study-page .hero__grid {
    gap: 30px;
  }
  .case-study-page .hero-profile {
    max-width: 360px;
  }
  .rk-mobile-sticky {
    position: fixed;
    z-index: 120;
    right: 0;
    bottom: 0;
    left: 0;
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1px;
    padding: 8px 10px max(8px, env(safe-area-inset-bottom));
    border-top: 1px solid #e8e8ef;
    background: rgba(255, 255, 255, 0.97);
    box-shadow: 0 -8px 24px rgba(30, 24, 41, 0.09);
    backdrop-filter: blur(10px);
  }
  .rk-mobile-sticky a {
    display: flex;
    min-height: 44px;
    align-items: center;
    justify-content: center;
    border-radius: 8px;
    color: #fff;
    background: linear-gradient(270deg, #df62e2 9%, #6a5cea 90%);
    font-family: var(--rk-font-head);
    font-size: 14px;
    font-weight: 600;
    text-decoration: none;
  }
  .rk-mobile-sticky a + a {
    background: #118c59;
  }
  .rk-scroll-top {
    bottom: 76px;
  }
  .rk-soc-widget {
    bottom: 86px;
  }
}
`;

if (!css.includes('Shared Raskrutov shell + corrected global case scale')) {
  css += scaleCss;
}

fs.writeFileSync(htmlPath, html, 'utf8');
fs.writeFileSync(cssPath, css, 'utf8');
console.log('Updated Zhandos case: homepage shell, contacts, widgets, mobile sticky and corrected global scale.');
