const fs = require("fs");
const h = fs.readFileSync(
  "site_mirror/web-studiya/kontekstnaya-reklama/yandex-direct/semey/index.html",
  "utf8"
);
const pick = (re) => {
  const m = h.match(re);
  return m ? m[1] : "MISSING";
};
console.log("title:", pick(/<title>([^<]+)/));
console.log("h1:", pick(/<h1[^>]*>([^<]+)/));
console.log("desc:", pick(/name="description" content="([^"]+)/));
console.log("contacts id:", pick(/id="(rk-form-contacts-yd-semey)"/));
console.log("contacts name:", pick(/name="(contacts_yandex_direct_semey)"/));
console.log("popup id:", pick(/id="(rk-form-popup-yd-semey)"/));
console.log("popup name:", pick(/name="(popup_yandex_direct_semey)"/));
console.log("prefix:", h.includes("yd-smy-") ? "yd-smy-" : "MISSING");
console.log("chart1:", h.includes("ydSmyChartFill"));
console.log("chart2:", h.includes("ydSmyChartFill2"));
console.log("abay:", /област[ьи] Абай/i.test(h));
console.log("osk:", h.includes("Усть-Каменогорск"));
console.log("petro:", h.includes("Петропавловск"));
console.log("price:", h.includes("120 000"));
console.log("metrika:", h.includes("101127167"));
console.log("viewport:", h.includes('media="(min-width: 769px)"'));
console.log("areaServed Semey:", h.includes('"name":"Semey"'));
const left = h.match(/Астан|astana|столиц|\bВКО\b|Восточно-Казахстан/gi) || [];
console.log("leftovers:", [...new Set(left)]);
const nea = h.match(/не\s+[^,.!?]{1,40},\s*а\s+/gi) || [];
console.log("ne-a:", nea.slice(0, 5));
const related = h.match(/id="related"[\s\S]*?<\/section>/);
console.log(
  "related:",
  related
    ? related[0]
        .replace(/<[^>]+>/g, " | ")
        .replace(/\s+/g, " ")
        .trim()
        .slice(0, 500)
    : "MISSING"
);
console.log("branch mention:", /филиал|представительств/i.test(h));
