const fs = require('fs');
const html = fs.readFileSync('site_mirror/web-studiya/kontekstnaya-reklama/google-ads/astana/index.html', 'utf8');
const re = /<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
let m, i = 0, ok = true;
while ((m = re.exec(html))) {
  i++;
  try {
    const j = JSON.parse(m[1].trim());
    let type = j['@type'];
    if (!type && Array.isArray(j)) type = j.map(x => x['@type']).join(',');
    if (!type && j['@graph']) type = j['@graph'].map(x => x['@type']).join(',');
    console.log('JSON-LD #' + i + ': OK type=' + type);
  } catch (e) {
    ok = false;
    console.log('JSON-LD #' + i + ': FAIL ' + e.message);
  }
}
console.log('Total blocks:', i, 'All valid:', ok);
const badCount = (html.match(/\.\.\/\.\.\/\.\.\/assets/g) || []).length;
const goodCount = (html.match(/\.\.\/\.\.\/\.\.\/\.\.\/assets/g) || []).length;
// count exact ../../../assets that are NOT ../../../../assets
const threeOnly = (html.match(/(?<!\.\.\/)\.\.\/\.\.\/\.\.\/assets/g) || []).length;
console.log('../../../assets (incl prefix of 4):', badCount);
console.log('../../../../assets count:', goodCount);
console.log('Has literal ../../../assets (3-up only):', /(?<!\.\/)\.\.\/\.\.\/\.\.\/assets/.test(html) && !html.includes('../../../../assets') ? 'CHECK' : 'see counts');
// clearer: find href/src with exactly 3 levels
const threeLevel = [...html.matchAll(/(?:href|src)=["']([^"']*assets[^"']*)["']/gi)].map(x => x[1]).filter(u => u.includes('../'));
const badPaths = threeLevel.filter(u => (u.match(/\.\.\//g) || []).length === 3 && u.includes('assets'));
const goodPaths = threeLevel.filter(u => (u.match(/\.\.\//g) || []).length === 4 && u.includes('assets'));
console.log('asset refs with 3 ../ :', badPaths.length, badPaths.slice(0,3));
console.log('asset refs with 4 ../ :', goodPaths.length);
