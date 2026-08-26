import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const src = fs.readFileSync(path.join(here, '../google-ads-batch2-qa/_generate-batch2.mjs'), 'utf8');
const citiesMod = fs.readFileSync(path.join(here, '_batch3-cities.mjs'), 'utf8');
const citiesBlock = citiesMod.replace(/^export const cities/, 'const cities');
const start = src.indexOf('const cities = {');
const end = src.indexOf('function esc(s)');
if (start < 0 || end < 0) throw new Error(`markers not found start=${start} end=${end}`);
const out = `${src.slice(0, start)}${citiesBlock}\n\n${src.slice(end)}`;
const dest = path.join(here, '_generate-batch3.mjs');
fs.writeFileSync(dest, out.replace(/\r\n/g, '\n'), 'utf8');
console.log('wrote', dest, 'bytes', Buffer.byteLength(out));
