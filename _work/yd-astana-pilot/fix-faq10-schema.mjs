import fs from "node:fs";

const p = "site_mirror/web-studiya/kontekstnaya-reklama/yandex-direct/index.html";
let c = fs.readFileSync(p, "utf8");
const old =
  "Для локальной работы со столицей есть страница Яндекс Директ в Астане (https://raskrutov.kz/web-studiya/kontekstnaya-reklama/yandex-direct/astana/). Эта республиканская страница описывает общую настройку гео; другие городские URL пока не публикуем.";
const neu =
  "Для локальной работы со столицей есть страница Яндекс Директ в Астане. Эта республиканская страница описывает общую настройку гео; другие городские URL пока не публикуем.";
if (!c.includes(old)) {
  console.error("schema text not found");
  process.exit(1);
}
c = c.replace(old, neu);
fs.writeFileSync(p, c);
console.log("schema FAQ10 aligned to visible plain text");
