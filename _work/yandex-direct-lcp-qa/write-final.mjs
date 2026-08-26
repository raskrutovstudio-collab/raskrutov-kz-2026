import fs from 'node:fs';
import path from 'node:path';

const htmlPath = 'site_mirror/web-studiya/kontekstnaya-reklama/yandex-direct/index.html';
const critical = fs.readFileSync('site_mirror/_work/yandex-direct-lcp-qa/mobile-critical.css', 'utf8');
const local = fs.readFileSync(htmlPath, 'utf8');
const meta = local.slice(0, local.indexOf('<link href="../../../assets/m-files'));
const fav =
  '<link href="../../../assets/m-files.cdn1.cc/lpfile/favicon/favicon__q_1.png" type="image/png" rel="icon">\n  <link href="../../../favicon.ico" sizes="16x16 32x32 48x48" rel="icon" type="image/x-icon">\n';
const ld = local.slice(local.indexOf('<script type="application/ld+json">'), local.indexOf('</head>'));
const body = local.slice(local.indexOf('<body'));

const head = `${meta}${fav}  <link rel="preload" href="../../../assets/m-files.cdn1.cc/web/user/fonts/montserrat/montserrat_normal.woff2" as="font" type="font/woff2" crossorigin>
  <link rel="preload" href="../../../assets/m-files.cdn1.cc/web/user/fonts/montserrat/montserrat_bold.woff2" as="font" type="font/woff2" crossorigin>
  <style id="yd-critical" media="(max-width:768px)">
${critical}
  </style>
  <link rel="stylesheet" href="../../../assets/css/home-clean.css?v=39" media="(min-width: 769px)" onload="this.onload=null;if(matchMedia('(max-width:768px)').matches)this.media='all'">
  <link rel="stylesheet" href="../../../assets/css/kontekst-clean.css?v=7" media="(min-width: 769px)" onload="this.onload=null;if(matchMedia('(max-width:768px)').matches)this.media='all'">
  <link rel="stylesheet" href="../../../assets/css/yandex-direct-page.css?v=5" media="print" onload="this.onload=null;this.media='all'">
  <link rel="stylesheet" href="../../../assets/css/lead-forms.css" media="print" onload="this.onload=null;this.media='all'">
  <noscript>
    <link rel="stylesheet" href="../../../assets/css/home-clean.css?v=39">
    <link rel="stylesheet" href="../../../assets/css/kontekst-clean.css?v=7">
    <link rel="stylesheet" href="../../../assets/css/yandex-direct-page.css?v=5">
    <link rel="stylesheet" href="../../../assets/css/lead-forms.css">
  </noscript>
  <style>
    .rk-form--contacts .rk-consent--contacts{margin:0 0 15px;font-size:12px;line-height:1.4}
    .rk-form--contacts .rk-consent--contacts input{width:18px;height:18px}
    @media (min-width:769px){
      .yd-page .ctx-hero__title,.yd-page .ctx-hero__sub,.yd-page .ctx-hero__lead{visibility:visible;opacity:1}
      .yd-page .ctx-hero__lead{margin:0 0 20px;max-width:54ch;font-size:16px;line-height:1.55;color:#3a3a3a;font-weight:400}
      .yd-page .yd-hero-price{display:flex;flex-wrap:wrap;align-items:center;gap:8px 10px;width:fit-content;max-width:100%;box-sizing:border-box;margin:0 0 14px;padding:8px 14px;border-radius:14px;font-size:14px;line-height:1.35;background:#fff5f2;border:1px solid rgba(252,63,29,.18)}
      .yd-page .yd-hero-price__value{font-weight:700;color:#2f2740}
      .yd-page .yd-hero-price__note{color:#5c5468}
      .yd-page .yd-trust-strip{display:flex;flex-wrap:wrap;gap:8px;margin:4px 0 0}
      .yd-page .yd-trust-strip__item{display:inline-flex;align-items:center;gap:8px;padding:8px 12px;border-radius:12px;background:#f4f2f7;font-size:13px;line-height:1.3;color:#2f2740}
      .yd-page .yd-trust-strip__item svg{width:18px;height:18px;color:#fc3f1d;flex:0 0 auto}
      .yd-page .yd-hero-visual{margin:0}
      .yd-page .yd-hero-visual__caption{margin:8px 0 0;font-size:12px;line-height:1.4;color:#6b6478}
    }
  </style>
  ${ld}</head>
`;

fs.writeFileSync(htmlPath, head + body);
console.log('final head written', htmlPath, 'bytes', fs.statSync(htmlPath).size);
