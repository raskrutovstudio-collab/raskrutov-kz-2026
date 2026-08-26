const https = require("https");
const fs = require("fs");
const url =
  "https://raskrutov.kz/web-studiya/kontekstnaya-reklama/yandex-direct/almaty/";
https
  .get(url, { headers: { "Cache-Control": "no-cache" } }, (res) => {
    const chunks = [];
    res.on("data", (c) => chunks.push(c));
    res.on("end", () => {
      const buf = Buffer.concat(chunks);
      const h = buf.toString("utf8");
      const out = {
        status: res.statusCode,
        len: buf.length,
        title: (h.match(/<title>([^<]+)/) || [])[1],
        h1: (h.match(/<h1[^>]*>([^<]+)/) || [])[1],
        canonical: (h.match(/rel="canonical" href="([^"]+)/) || [])[1],
        form: /rk-form-contacts-yd-almaty/.test(h),
        viewportCss: /yandex-direct-page\.css\?v=5" media="\(min-width: 769px\)/.test(
          h
        ),
        metrika: /101127167/.test(h),
        petropavlovsk: /Петропавловск/.test(h),
        almaty: /Алматы/.test(h),
        mottor: /public\.bundle|lpmotor/i.test(h),
      };
      console.log(JSON.stringify(out, null, 2));
      fs.writeFileSync(
        "site_mirror/_work/yandex-direct-regional-scale/almaty/prod-verify.json",
        JSON.stringify(out, null, 2)
      );
      process.exit(out.status === 200 && out.form && out.viewportCss ? 0 : 1);
    });
  })
  .on("error", (e) => {
    console.error(e);
    process.exit(1);
  });
