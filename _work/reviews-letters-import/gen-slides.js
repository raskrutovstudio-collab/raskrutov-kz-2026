const fs = require("fs");
const path = require("path");
const meta = require("./letters-meta.json");
const slides = meta
  .map((x, i) => {
    const lazy = i === 0 ? "" : ' loading="lazy"';
    return `          <figure class="reviews-slide">
            <a class="reviews-slide__link" href="../../assets/img/reviews/letters/${x.full}" target="_blank" rel="noopener noreferrer">
              <img src="../../assets/img/reviews/letters/${x.preview}" width="${x.pw}" height="${x.ph}" alt="${x.alt.replace(/"/g, "&quot;")}"${lazy} decoding="async">
            </a>
            <figcaption>${x.caption}<span class="reviews-slide__hint">Открыть документ</span></figcaption>
          </figure>`;
  })
  .join("\n");
fs.writeFileSync(path.join(__dirname, "slides.html"), slides, "utf8");
console.log("ok", meta.length);
