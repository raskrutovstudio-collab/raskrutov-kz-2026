/**
 * D6: HTML weight, LCP paragraph offset, JSON-LD bytes before it.
 */
const fs = require("fs");
const path = require("path");

const INDEX = path.resolve(
  __dirname,
  "../../web-studiya/kontekstnaya-reklama/google-ads/index.html"
);
const buf = fs.readFileSync(INDEX);
const text = buf.toString("utf8");
const marker = 'class="ctx-hero__lead"';
const idx = text.indexOf(marker);
const line = text.slice(0, idx).split(/\n/).length;
// Find start of <p class="ctx-hero__lead"
const pStart = text.lastIndexOf("<p", idx);
const jsonLdStart = text.indexOf('<script type="application/ld+json">');
const jsonLdEnd = text.indexOf("</script>", jsonLdStart);
const jsonLdBytes = jsonLdEnd > jsonLdStart ? jsonLdEnd + 9 - jsonLdStart : -1;
const bytesBeforeLead = pStart;

const out = {
  uncompressedBytes: buf.length,
  utf8Chars: text.length,
  leadMarkerIndex: idx,
  leadParagraphByteOffset: pStart,
  leadParagraphLine: line,
  jsonLdByteStart: jsonLdStart,
  jsonLdByteLength: jsonLdBytes,
  jsonLdBeforeLead: jsonLdStart >= 0 && jsonLdStart < pStart,
  bytesOfJsonLdPrecedingLead:
    jsonLdStart >= 0 && jsonLdStart < pStart ? jsonLdBytes : 0,
  headEnd: text.indexOf("</head>"),
  bodyStart: text.indexOf("<body"),
};

fs.writeFileSync(
  path.join(__dirname, "d6-html-weight.json"),
  JSON.stringify(out, null, 2)
);
console.log(JSON.stringify(out, null, 2));
