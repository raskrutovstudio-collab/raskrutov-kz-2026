const sharp = require("sharp");
const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "../../..");
const rawDir = path.join(__dirname, "raw");
const outDir = path.join(root, "site_mirror/assets/img/reviews/letters");
fs.mkdirSync(outDir, { recursive: true });

const named = {
  "54bf40700e8e987e359d73bd97e57a13": {
    slug: "teplolux",
    alt: "Благодарственное письмо от ТОО «Теплолюкс-Казахстан»",
    caption: "ТОО «Теплолюкс-Казахстан»",
  },
  "b5186d124bd7b548d25a20d6b095a3fb": {
    slug: "kazakh-engineering",
    alt: "Благодарственное письмо от ТОО «KAZAKH -Engineering»",
    caption: "ТОО «KAZAKH -Engineering»",
  },
  "b1fccd4e8418812ce4ee0f9e09501a9d": {
    slug: "gervent",
    alt: "Благодарственное письмо от ООО «ГЕРВЕНТ РУС»",
    caption: "ООО «ГЕРВЕНТ РУС»",
  },
  "b31d83bd90e50afb268a6d633fbaa5cc": {
    slug: "profil-doors",
    alt: "Благодарственное письмо от франшизы Profil DOORS",
    caption: "Profil DOORS",
  },
  "c9a59117d0bda607ec821368b659adea": {
    slug: "kalina",
    alt: "Благодарственное письмо от ООО «ПКФ «Калина»",
    caption: "ООО «ПКФ «Калина»",
  },
};

(async () => {
  const files = fs.readdirSync(rawDir).filter((f) => /\.(jpe?g|webp|png)$/i.test(f));
  const meta = [];
  let anon = 0;
  for (const file of files) {
    const hash = file.replace(/\.(jpe?g|webp|png)$/i, "");
    const input = path.join(rawDir, file);
    const info = await sharp(input, { failOn: "none" }).metadata();
    const w = info.width || 0;
    const h = info.height || 0;
    const ratio = w && h ? w / h : 0;
    const reject = w < 300 || h < 400 || (ratio > 1.15 && h < 700);
    console.log(`${hash.slice(0, 8)} ${w}x${h} ratio=${ratio.toFixed(2)} reject=${reject}`);
    if (reject) continue;

    const known = named[hash];
    if (!known) anon += 1;
    const slug = known?.slug || `letter-${String(anon).padStart(2, "0")}`;
    const alt = known?.alt || "Благодарственное письмо клиента Raskrutov";
    const caption = known?.caption || "Благодарственное письмо";

    const previewName = `${slug}-720.webp`;
    const fullName = `${slug}-1400.webp`;

    const preview = await sharp(input, { failOn: "none" })
      .rotate()
      .resize({ width: 720, height: 1100, fit: "inside", withoutEnlargement: true })
      .webp({ quality: 78, effort: 4 })
      .toFile(path.join(outDir, previewName));

    const full = await sharp(input, { failOn: "none" })
      .rotate()
      .resize({ width: 1400, height: 2000, fit: "inside", withoutEnlargement: true })
      .webp({ quality: 82, effort: 4 })
      .toFile(path.join(outDir, fullName));

    meta.push({
      hash,
      slug,
      alt,
      caption,
      preview: previewName,
      full: fullName,
      pw: preview.width,
      ph: preview.height,
      fw: full.width,
      fh: full.height,
      pbytes: preview.size,
      fbytes: full.size,
      known: Boolean(known),
    });
  }

  meta.sort((a, b) => {
    if (a.known !== b.known) return a.known ? -1 : 1;
    return a.slug.localeCompare(b.slug, "en");
  });

  fs.writeFileSync(path.join(__dirname, "letters-meta.json"), JSON.stringify(meta, null, 2), "utf8");
  console.log("FINAL", meta.length);
  for (const m of meta) {
    console.log(`${m.slug} ${m.pw}x${m.ph} ${Math.round(m.pbytes / 1024)}KB`);
  }
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
