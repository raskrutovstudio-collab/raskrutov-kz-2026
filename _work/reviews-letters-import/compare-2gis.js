const fs = require("fs");
const path = require("path");

const html = fs.readFileSync(
  path.resolve(__dirname, "../../assets/s239948.lpmotortest.com/otzivi/index.html"),
  "utf8"
);
const js = fs.readFileSync(
  path.resolve(__dirname, "../../assets/js/reviews-letters.js"),
  "utf8"
);

const re = /"big_light_70000001041348422", "([A-Za-z0-9+/=]+)"/;
const om = html.match(re);
const cm = js.match(/var payload =\s*\n?\s*"([A-Za-z0-9+/=]+)"/);

if (!om) {
  console.error("original not found");
  process.exit(1);
}
if (!cm) {
  console.error("current not found");
  process.exit(1);
}

console.log("original length", om[1].length);
console.log("current length", cm[1].length);
console.log("same", om[1] === cm[1]);
console.log("original decode:\n", Buffer.from(om[1], "base64").toString("utf8"));
console.log("current decode:\n", Buffer.from(cm[1], "base64").toString("utf8"));
