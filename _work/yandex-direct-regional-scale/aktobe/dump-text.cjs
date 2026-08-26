const fs = require("fs");

const BASE = "site_mirror/web-studiya/kontekstnaya-reklama/yandex-direct/";

function clean(s) {
  return s
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&[a-z]+;/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
}

for (const city of process.argv.slice(2)) {
  const html = fs.readFileSync(BASE + city + "/index.html", "utf8");
  const main = html.match(/<main id="main">([\s\S]*?)<\/main>/i)[1];
  console.log("=========== " + city + " ===========");
  console.log(clean(main));
  console.log("");
}
