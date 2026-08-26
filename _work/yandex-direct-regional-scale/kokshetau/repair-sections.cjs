/**
 * Repair missing </section> tags in YD city pages by ensuring
 * each <section ... id="..."> / class section is closed before the next sibling section.
 * Does not invent content — only inserts missing closers where sibling sections were nested by mistake.
 */
const fs = require("fs");

function repair(slug) {
  const file = `site_mirror/web-studiya/kontekstnaya-reklama/yandex-direct/${slug}/index.html`;
  let h = fs.readFileSync(file, "utf8");
  const open = (h.match(/<section\b/g) || []).length;
  const close = (h.match(/<\/section>/g) || []).length;
  if (open === close) {
    console.log(slug, "already balanced", open);
    return false;
  }

  // Insert </section> immediately before each <section that is a sibling top-level rk-section/ctx-*
  // Strategy: walk tags; when opening a new section while one is already open at depth>=1 inside main,
  // if previous section wasn't closed, insert closer before this open.
  // Safer approach matching template: before every <section (except first in main),
  // if the preceding non-whitespace is not </section>, insert </section>.

  const mainStart = h.indexOf("<main");
  const mainEnd = h.indexOf("</main>");
  if (mainStart < 0 || mainEnd < 0) throw new Error("no main");
  const before = h.slice(0, mainStart);
  let main = h.slice(mainStart, mainEnd);
  const after = h.slice(mainEnd);

  // Find all <section opens inside main
  const re = /<section\b[^>]*>/g;
  const opens = [];
  let m;
  while ((m = re.exec(main))) opens.push({ index: m.index, tag: m[0] });

  // Work from end so indices stay valid: for each open after the first,
  // look backward for whether we need a closer.
  // Template rule: sections are sequential siblings, never nested.
  // So before each open[i] (i>0), the last significant tag should be </section>.
  // If not, insert </section>\n before open[i].

  for (let i = opens.length - 1; i >= 1; i--) {
    const idx = opens[i].index;
    const prev = main.slice(0, idx).replace(/\s+$/, "");
    if (!prev.endsWith("</section>")) {
      main = main.slice(0, idx) + "</section>\n\n    " + main.slice(idx);
    }
  }

  // Ensure last section before </main> is closed
  const mainInner = main; // includes <main...>
  const trimmed = mainInner.replace(/\s+$/, "");
  // Find last </section> vs last <section
  const lastOpen = trimmed.lastIndexOf("<section");
  const lastClose = trimmed.lastIndexOf("</section>");
  if (lastOpen > lastClose) {
    // need close before end of main content (before sticky? sticky is after main)
    // insert before end of main string
    main = trimmed + "\n    </section>\n  ";
  }

  h = before + main + after;
  const open2 = (h.match(/<section\b/g) || []).length;
  const close2 = (h.match(/<\/section>/g) || []).length;
  fs.writeFileSync(file, h);
  console.log(slug, "repaired open/close", open, close, "->", open2, close2);
  return true;
}

for (const slug of ["kokshetau", "taldykorgan"]) {
  repair(slug);
}

// verify balance
for (const slug of ["kokshetau", "taldykorgan", "aktau"]) {
  const h = fs.readFileSync(
    `site_mirror/web-studiya/kontekstnaya-reklama/yandex-direct/${slug}/index.html`,
    "utf8"
  );
  const open = (h.match(/<section\b/g) || []).length;
  const close = (h.match(/<\/section>/g) || []).length;
  console.log("verify", slug, open, close, open === close ? "OK" : "FAIL");
}
