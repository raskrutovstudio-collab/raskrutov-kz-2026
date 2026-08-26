import fs from 'node:fs';
import path from 'node:path';

const icons = [
  '<span class="gads-scope-list__icon" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" focusable="false" aria-hidden="true"><circle cx="11" cy="11" r="6.5" stroke="currentColor" stroke-width="1.8"/><path d="M16 16l4 4" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg></span>',
  '<span class="gads-scope-list__icon" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" focusable="false" aria-hidden="true"><path d="M5 7h14M5 12h10M5 17h12" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg></span>',
  '<span class="gads-scope-list__icon" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" focusable="false" aria-hidden="true"><rect x="4" y="5" width="16" height="14" rx="2" stroke="currentColor" stroke-width="1.8"/><path d="M8 9h8M8 13h5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg></span>',
  '<span class="gads-scope-list__icon" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" focusable="false" aria-hidden="true"><path d="M5 19V5h14v10H9l-4 4z" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/></svg></span>',
  '<span class="gads-scope-list__icon" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" focusable="false" aria-hidden="true"><path d="M12 4v16M7 9l5-5 5 5M7 15l5 5 5-5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg></span>',
  '<span class="gads-scope-list__icon" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" focusable="false" aria-hidden="true"><path d="M4 19V5M4 19h16" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/><path d="M8 15v-5M12 15V7M16 15v-3" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg></span>',
];

const mark = '<span class="gads-tasks-panel__mark" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" focusable="false" aria-hidden="true"><circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="1.7"/><path d="M8.2 12.2l2.4 2.4 5.2-5.2" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/></svg></span>';

const cities = ['astana', 'almaty', 'shymkent', 'karaganda', 'aktobe'];
const root = path.join('site_mirror', 'web-studiya', 'kontekstnaya-reklama', 'google-ads');

for (const city of cities) {
  const file = path.join(root, city, 'index.html');
  let html = fs.readFileSync(file, 'utf8');
  if (html.includes('gads-scope-list__icon')) {
    console.log(city, 'scope icons already present, skip scope');
  } else {
    let i = 0;
    html = html.replace(/<li class="gads-scope-list__item"><div>/g, () => {
      const icon = icons[i % icons.length];
      i += 1;
      return `<li class="gads-scope-list__item">${icon}<div>`;
    });
    if (i === 0) throw new Error(`${city}: no scope items patched`);
    console.log(city, 'scope icons inserted', i);
  }
  html = html.replace(/<ul class="gads-tasks-panel__list">([\s\S]*?)<\/ul>/g, (full, inner) => {
    const patched = inner.replace(/<li>(?!\s*<span class="gads-tasks-panel__mark")/g, `<li>${mark}`);
    return `<ul class="gads-tasks-panel__list">${patched}</ul>`;
  });
  fs.writeFileSync(file, html);
  const iconsNow = (html.match(/gads-scope-list__icon/g) || []).length;
  const marksNow = (html.match(/gads-tasks-panel__mark/g) || []).length;
  console.log(city, 'icons=', iconsNow, 'marks=', marksNow);
}
