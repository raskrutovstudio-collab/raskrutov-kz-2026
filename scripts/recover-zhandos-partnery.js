const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const sourcePath = path.join(root, 'site_mirror', 'keysy', 'partnery', 'turan-agency', 'index.html');
const targetPath = path.join(root, 'site_mirror', 'keysy', 'partnery', 'index.html');
const htaccessPath = path.join(root, 'site_mirror', '.htaccess');
const sitemapPath = path.join(root, 'site_mirror', 'sitemap.xml');

if (!fs.existsSync(sourcePath)) {
  throw new Error(`Recovery source not found: ${sourcePath}`);
}

let html = fs.readFileSync(sourcePath, 'utf8');

// The final published case lives at /keysy/partnery/.
html = html.replaceAll('https://raskrutov.kz/keysy/partnery/turan-agency/', 'https://raskrutov.kz/keysy/partnery/');
html = html.replaceAll('/keysy/partnery/turan-agency/', '/keysy/partnery/');

// Correct the partner surname while intentionally keeping historical image filenames unchanged.
html = html.replaceAll('Жандос Орманович Касенов', 'Жандос Орманович Басыбаев');
html = html.replaceAll('Жандос Касенов', 'Жандос Басыбаев');
html = html.replaceAll('Жандоса Касенова', 'Жандоса Басыбаева');

// Restore the approved, natural-sounding partner quote.
html = html.replace(
  '«После обучения пришло понимание бизнес-процессов в IT, получили понятный алгоритм для работы, плюс нашим технарям всё зашло, все всё поняли».',
  '«После обучения появилось понимание бизнес-процессов в IT, мы получили понятный алгоритм для работы, а наша команда легко освоила все необходимые навыки».',
);

// The final URL is the partner case itself, so avoid linking a breadcrumb back to the same URL.
html = html.replace(
  '          <li><a href="/keysy/partnery/">Партнёры</a></li>\n          <li aria-current="page">Turan Agency</li>',
  '          <li aria-current="page">Turan Agency</li>',
);

// Normalize structured-data breadcrumbs from 4 levels to 3 levels.
html = html.replace(/\n\s*\{\n\s*"@type": "ListItem",\n\s*"position": 3,\n\s*"name": "Кейсы партнёров",\n\s*"item": "https:\/\/raskrutov\.kz\/keysy\/partnery\/"\n\s*\},/m, '');
html = html.replace('"position": 4,\n            "name": "Turan Agency"', '"position": 3,\n            "name": "Turan Agency"');

// Recovery invariants.
const mustContain = [
  '<html lang="ru-KZ">',
  'Жандос Орманович Басыбаев',
  'с франшизой Raskrutov',
  'https://raskrutov.kz/keysy/partnery/',
  '/assets/css/case-study.css',
  '/assets/js/case-study.js',
  'наша команда легко освоила все необходимые навыки',
];
for (const marker of mustContain) {
  if (!html.includes(marker)) throw new Error(`Required marker missing after recovery: ${marker}`);
}
if (html.includes('Жандос Орманович Касенов') || html.includes('Жандос Касенов') || html.includes('Жандоса Касенова')) {
  throw new Error('Old surname remains in visible/structured text');
}
if (html.includes('https://raskrutov.kz/keysy/partnery/turan-agency/')) {
  throw new Error('Old nested canonical URL remains in recovered page');
}

fs.writeFileSync(targetPath, html, 'utf8');

// Consolidate the old nested URL with a permanent redirect and remove the duplicate HTML file.
let htaccess = fs.readFileSync(htaccessPath, 'utf8');
const redirectBlock = [
  '# Partner case canonical recovery: old nested Turan Agency URL -> final case URL',
  'Redirect 301 /keysy/partnery/turan-agency/ /keysy/partnery/',
  'Redirect 301 /keysy/partnery/turan-agency /keysy/partnery/',
].join('\n');
if (!htaccess.includes('Redirect 301 /keysy/partnery/turan-agency/ /keysy/partnery/')) {
  htaccess = `${htaccess.trimEnd()}\n\n${redirectBlock}\n`;
  fs.writeFileSync(htaccessPath, htaccess, 'utf8');
}

if (fs.existsSync(sourcePath)) fs.unlinkSync(sourcePath);

// The sitemap must expose only the final canonical page.
let sitemap = fs.readFileSync(sitemapPath, 'utf8');
sitemap = sitemap.replace(/\s*<url>\s*<loc>https:\/\/raskrutov\.kz\/keysy\/partnery\/turan-agency\/?<\/loc>[\s\S]*?<\/url>/g, '');
if (!sitemap.includes('<loc>https://raskrutov.kz/keysy/partnery</loc>') && !sitemap.includes('<loc>https://raskrutov.kz/keysy/partnery/</loc>')) {
  throw new Error('Final partner case URL is missing from sitemap');
}
fs.writeFileSync(sitemapPath, sitemap, 'utf8');

console.log('Zhandos/Turan Agency partner case recovery prepared successfully.');
