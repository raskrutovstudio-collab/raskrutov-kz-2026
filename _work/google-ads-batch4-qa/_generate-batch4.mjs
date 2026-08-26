import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const batch3 = path.join(here, '../google-ads-batch3-qa/_generate-batch3.mjs');
const src = fs.readFileSync(batch3, 'utf8');
const startCities = src.indexOf('const cities = {');
const startEsc = src.indexOf('\nfunction esc(s)');
if (startCities < 0 || startEsc < 0) {
  throw new Error(`Cannot splice generator: cities=${startCities} esc=${startEsc}`);
}
const out =
  `import { cities } from './_cities-batch4.mjs';\n` + src.slice(0, startCities) + src.slice(startEsc);
const runtime = path.join(here, '_generate-batch4-runtime.mjs');
fs.writeFileSync(runtime, out);
await import(pathToFileURL(runtime).href);
