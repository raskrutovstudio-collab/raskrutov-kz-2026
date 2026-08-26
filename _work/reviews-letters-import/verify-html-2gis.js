const fs = require("fs");
const html = fs.readFileSync(
  "../../o-kompanii/otzyvy-i-blagodarstvennye-pisma/index.html",
  "utf8"
);
const m = html.match(
  /"big_light_70000001041348422", "([A-Za-z0-9+/=]+)"\)/
);
if (!m) {
  console.error("payload not found in html");
  process.exit(1);
}
const decoded = Buffer.from(m[1], "base64").toString("utf8");
const hasStylesheet = decoded.includes('rel="stylesheet"');
const hasBrokenLink = decoded.includes("</link rel=");
console.log("hasStylesheet", hasStylesheet);
console.log("hasBrokenLink", hasBrokenLink);
console.log(decoded);
