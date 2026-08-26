const fs = require("fs");
const js = fs.readFileSync("../../assets/js/reviews-letters.js", "utf8");
const m = js.match(/var payload =\s*\n?\s*"([A-Za-z0-9+/=]+)"/);
const html = Buffer.from(m[1], "base64").toString("utf8");
console.log(html);
console.log("len", m[1].length);
