import fs from 'node:fs';

const p = 'site_mirror/web-studiya/kontekstnaya-reklama/yandex-direct/index.html';
let s = fs.readFileSync(p, 'utf8');
const before = (s.match(/gads-/g) || []).length;
s = s.replaceAll('data-gads-faq-btn', 'data-yd-faq-btn');
s = s.replaceAll('data-gads-faq', 'data-yd-faq');
s = s.replaceAll('gads-faq-', 'yd-faq-');
s = s.replaceAll('gads-', 'yd-');
s = s.replaceAll('id="gads-', 'id="yd-');
s = s.replaceAll('for="gads-', 'for="yd-');
s = s.replaceAll('contacts_google_ads', 'contacts_yandex_direct');
s = s.replaceAll('popup_google_ads', 'popup_yandex_direct');
s = s.replaceAll('rk-form-contacts-gads', 'rk-form-contacts-yd');
s = s.replaceAll('rk-form-popup-gads', 'rk-form-popup-yd');
s = s.replaceAll('Контакты — Google Ads', 'Контакты — Яндекс Директ');
s = s.replaceAll('Попап — Google Ads', 'Попап — Яндекс Директ');
fs.writeFileSync(p, s);
console.log({ before, after: (s.match(/gads-/g) || []).length, yd: (s.match(/yd-/g) || []).length });
