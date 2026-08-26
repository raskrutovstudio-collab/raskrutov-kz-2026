const fs = require("fs");
const path = require("path");

const pagePath = path.resolve(
  __dirname,
  "../../o-kompanii/otzyvy-i-blagodarstvennye-pisma/index.html"
);
const slides = fs.readFileSync(path.join(__dirname, "slides.html"), "utf8");

let html = fs.readFileSync(pagePath, "utf8");

html = html.replace(
  'reviews-letters.css?v=2',
  'reviews-letters.css?v=3'
);

// Update OG image to localized asset
html = html.replace(
  /content="https:\/\/raskrutov\.kz\/assets\/m-files\.cdn1\.cc\/lpfile\/5\/4\/b\/54bf40700e8e987e359d73bd97e57a13\/-\/crop\/0x0x791x1083\/-\/resize\/258\/-\/scale\/x3\/-\/resize\/1920\/f__q_96003179\.webp"/g,
  'content="https://raskrutov.kz/assets/img/reviews/letters/teplolux-1400.webp"'
);

const heroAndProof = `    <section class="reviews-hero" id="hero" aria-labelledby="reviews-hero-title">
      <div class="reviews-hero__bg" aria-hidden="true"></div>
      <div class="rk-container reviews-hero__inner">
        <div class="reviews-hero__copy">
          <p class="reviews-badge">Отзывы клиентов</p>
          <h1 class="reviews-hero__title" id="reviews-hero-title">Отзывы и благодарственные письма</h1>
          <p class="reviews-hero__lead">Отзывы клиентов и официальные благодарственные письма о работе Raskrutov. Здесь собраны оценки нашей работы, результаты сотрудничества и обратная связь от компаний, с которыми мы реализовывали digital-проекты.</p>
        </div>
        <aside class="reviews-proof" aria-label="Содержание страницы">
          <div class="reviews-proof__item">
            <strong>Благодарственные письма</strong>
            <span>Документы от клиентов и партнёров</span>
          </div>
          <div class="reviews-proof__item">
            <strong>Google</strong>
            <span>Отзывы клиентов</span>
          </div>
          <div class="reviews-proof__item">
            <strong>2GIS</strong>
            <span>Отзывы клиентов</span>
          </div>
        </aside>
      </div>
    </section>`;

const lettersBlock = `    <section class="reviews-section reviews-section--letters" id="letters" aria-labelledby="letters-title">
      <div class="rk-container">
        <h2 class="reviews-h2" id="letters-title">Благодарственные письма клиентов</h2>
        <p class="reviews-lead">Официальные письма компаний. Откройте документ, чтобы рассмотреть его крупнее.</p>
      </div>
      <div class="reviews-slider" data-reviews-slider>
        <div class="reviews-slider__viewport" data-slider-viewport>
          <div class="reviews-slider__track" data-slider-track>
${slides}
          </div>
        </div>
      </div>
    </section>`;

const googleBlock = `    <section class="reviews-section reviews-section--muted" id="google-reviews" aria-labelledby="google-reviews-title">
      <div class="rk-container">
        <p class="reviews-eyebrow">Google Reviews</p>
        <h2 class="reviews-h2" id="google-reviews-title">Отзывы о Raskrutov в Google</h2>
        <p class="reviews-lead">Отзывы клиентов о сотрудничестве с Raskrutov, опубликованные в Google.</p>
        <div class="reviews-widget reviews-widget--google">
          <!-- Elfsight Google Reviews | Untitled Google Reviews -->
          <script src="https://elfsightcdn.com/platform.js" async></script>
          <div class="elfsight-app-b3ee41a2-3a4e-4089-8014-605f0ba97115" data-elfsight-app-lazy></div>
        </div>
      </div>
    </section>`;

const gisBlock = `    <section class="reviews-section" id="gis-reviews" aria-labelledby="gis-reviews-title">
      <div class="rk-container">
        <p class="reviews-eyebrow reviews-eyebrow--2gis">2GIS</p>
        <h2 class="reviews-h2" id="gis-reviews-title">Отзывы о Raskrutov в 2GIS</h2>
        <p class="reviews-lead">Отзывы клиентов о работе Raskrutov, опубликованные в 2GIS.</p>
        <div class="reviews-widget reviews-widget--2gis">
          <iframe
            id="big_light_70000001041348422"
            title="Отзывы о Raskrutov в 2GIS"
            frameborder="0"
            width="100%"
            height="824"
            sandbox="allow-modals allow-forms allow-scripts allow-same-origin allow-popups allow-top-navigation-by-user-activation"></iframe>
        </div>
      </div>
    </section>`;

const start = html.indexOf('    <section class="reviews-hero"');
const end = html.indexOf('    <section class="support-cta-band"');
if (start < 0 || end < 0) {
  console.error("markers not found", start, end);
  process.exit(1);
}

const next = heroAndProof + "\n\n" + lettersBlock + "\n\n" + googleBlock + "\n\n" + gisBlock + "\n\n";
html = html.slice(0, start) + next + html.slice(end);

if (!html.includes("reviews-letters.js")) {
  html = html.replace(
    '<script src="../../assets/js/home-clean.js?v=21" defer></script>',
    '<script src="../../assets/js/reviews-letters.js?v=1" defer></script>\n  <script src="../../assets/js/home-clean.js?v=21" defer></script>'
  );
}

fs.writeFileSync(pagePath, html, "utf8");
console.log("patched", pagePath);
