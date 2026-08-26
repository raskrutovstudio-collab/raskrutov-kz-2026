const fs = require("fs");

function findIssues(slug) {
  const h = fs.readFileSync(
    `site_mirror/web-studiya/kontekstnaya-reklama/yandex-direct/${slug}/index.html`,
    "utf8"
  );
  const stack = [];
  const voidish = new Set([
    "meta",
    "link",
    "img",
    "br",
    "hr",
    "input",
    "source",
    "area",
    "base",
    "col",
    "embed",
    "param",
    "track",
    "wbr",
  ]);
  const re = /<\/?([a-zA-Z0-9]+)(\s[^>]*)?>/g;
  let m;
  const events = [];
  while ((m = re.exec(h))) {
    const full = m[0];
    const name = m[1].toLowerCase();
    if (full.startsWith("</")) {
      const top = stack[stack.length - 1];
      if (top && top.name === name) stack.pop();
      else {
        events.push({
          type: "mismatch",
          close: name,
          expected: top && top.name,
          index: m.index,
          snippet: h.slice(Math.max(0, m.index - 80), m.index + 40).replace(/\s+/g, " "),
        });
      }
    } else if (!(voidish.has(name) || full.endsWith("/>"))) {
      stack.push({ name, index: m.index });
    }
  }
  console.log(slug, "mismatches", events.length);
  events.slice(0, 8).forEach((e) => console.log(JSON.stringify(e)));
  console.log(
    "remaining opens",
    stack.map((s) => `${s.name}@${s.index}`).slice(-15)
  );
}

findIssues("kokshetau");
