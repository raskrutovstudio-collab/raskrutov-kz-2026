const fs = require("fs");
const path = require("path");

const html =
  "<head><script type=\"text/javascript\">\n" +
  "    window.__size__='big';\n" +
  "    window.__theme__='light';\n" +
  "    window.__branchId__='70000001041348422'\n" +
  "    window.__orgId__='70000001039644912'\n" +
  "   </script><script crossorigin=\"anonymous\" type=\"module\" src=\"https://disk.2gis.com/widget-constructor/assets/iframe.js\"></script><link rel=\"modulepreload\" crossorigin=\"anonymous\" href=\"https://disk.2gis.com/widget-constructor/assets/defaults.js\"><link rel=\"stylesheet\" crossorigin=\"anonymous\" href=\"https://disk.2gis.com/widget-constructor/assets/defaults.css\"></head><body><div id=\"iframe\"></div></body>";

const correct = Buffer.from(html, "utf8").toString("base64");
const jsPath = path.resolve(__dirname, "../../assets/js/reviews-letters.js");
const js = fs.readFileSync(jsPath, "utf8");
const cur = js.match(/var payload =\s*\n?\s*"([A-Za-z0-9+/=]+)"/)[1];

console.log("correct len", correct.length);
console.log("current len", cur.length);
console.log("same", correct === cur);
console.log("correct payload:\n", correct);

if (correct !== cur) {
  console.log("\ncurrent decodes to:\n", Buffer.from(cur, "base64").toString("utf8"));
}
