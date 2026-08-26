import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const OUT = path.dirname(fileURLToPath(import.meta.url));
const CITIES = ['almaty', 'shymkent', 'karaganda', 'aktobe'];

function load(p) {
  return JSON.parse(fs.readFileSync(p, 'utf8'));
}

function extract(report) {
  const cats = report.categories || {};
  const score = (c) => Math.round((cats[c]?.score || 0) * 100);
  const failed = (catKey) => {
    const list = [];
    for (const ref of cats[catKey]?.auditRefs || []) {
      const a = report.audits[ref.id];
      if (!a || typeof a.score !== 'number' || a.score >= 1) continue;
      list.push(a.id);
    }
    return list;
  };
  const lcpItems = report.audits['largest-contentful-paint-element']?.details?.items || [];
  let lcpEl = '';
  if (lcpItems[0]) {
    const it = lcpItems[0];
    lcpEl = it.node?.snippet || it.node?.selector || '';
  }
  return {
    lighthouseVersion: report.lighthouseVersion,
    perf: score('performance'),
    a11y: score('accessibility'),
    bp: score('best-practices'),
    seo: score('seo'),
    fcp: Math.round(report.audits['first-contentful-paint']?.numericValue || 0),
    lcp: Math.round(report.audits['largest-contentful-paint']?.numericValue || 0),
    tbt: Math.round(report.audits['total-blocking-time']?.numericValue || 0),
    cls: report.audits['cumulative-layout-shift']?.numericValue ?? 0,
    si: Math.round(report.audits['speed-index']?.numericValue || 0),
    a11yFailed: failed('accessibility'),
    seoFailed: failed('seo'),
    bpFailed: failed('best-practices'),
    lcpElement: String(lcpEl).replace(/\s+/g, ' ').trim().slice(0, 100),
  };
}

function median(nums) {
  const s = [...nums].sort((a, b) => a - b);
  return s[Math.floor(s.length / 2)];
}

function medianObj(runs, keys) {
  const o = {};
  for (const k of keys) {
    const vals = runs.map((r) => r[k]);
    if (typeof vals[0] === 'number') o[k] = median(vals);
    else o[k] = vals[1] ?? vals[0];
  }
  return o;
}

function fmtCls(v) {
  return Number(v).toFixed(3);
}

function deepAudits(report) {
  const rb = report.audits['render-blocking-resources'];
  const unused = report.audits['unused-javascript'];
  const lcpItems = report.audits['largest-contentful-paint-element']?.details?.items || [];
  const lcpEl = lcpItems[0]?.node?.snippet || lcpItems[0]?.node?.selector || '';
  const rbItems = (rb?.details?.items || []).map((i) => ({
    url: String(i.url || '').slice(0, 120),
    wastedMs: Math.round(i.wastedMs || 0),
  }));
  const unusedItems = (unused?.details?.items || []).slice(0, 8).map((i) => ({
    url: String(i.url || '').slice(0, 120),
    wastedBytes: i.wastedBytes || 0,
    totalBytes: i.totalBytes || 0,
  }));
  return {
    ...extract(report),
    renderBlockingScore: rb?.score,
    renderBlockingWastedMs: Math.round(rb?.numericValue || rb?.details?.overallSavingsMs || 0),
    renderBlockingItems: rbItems,
    unusedJsScore: unused?.score,
    unusedJsWastedBytes: Math.round(unused?.details?.overallSavingsBytes || 0),
    unusedJsItems: unusedItems,
    lcpElementFull: String(lcpEl).replace(/\s+/g, ' ').trim(),
  };
}

const lines = [];
lines.push('Lighthouse Pass2 Overview');
lines.push('Server: http://127.0.0.1:8765 (gzip)');
lines.push('Generated: ' + new Date().toISOString());
lines.push('Lighthouse: 12.8.2 (from runs)');
lines.push('');
lines.push('Columns: Perf | FCP(ms) | LCP(ms) | TBT(ms) | CLS | SI(ms) | A11y | BP | SEO');
lines.push('');

const allData = {};

for (const city of CITIES) {
  const m1 = extract(load(path.join(OUT, 'lh-pass2-' + city + '-m1.json')));
  const m2 = extract(load(path.join(OUT, 'lh-pass2-' + city + '-m2.json')));
  const m3 = extract(load(path.join(OUT, 'lh-pass2-' + city + '-m3.json')));
  const d = extract(load(path.join(OUT, 'lh-pass2-' + city + '-d.json')));
  const mobile = [m1, m2, m3];
  const med = medianObj(mobile, ['perf', 'fcp', 'lcp', 'tbt', 'cls', 'si', 'a11y', 'bp', 'seo']);
  allData[city] = { m1, m2, m3, d, med };

  const row = (label, r) =>
    label.padEnd(10) + ' ' + String(r.perf).padStart(3) + ' | ' + String(r.fcp).padStart(5) + ' | ' + String(r.lcp).padStart(5) + ' | ' + String(r.tbt).padStart(4) + ' | ' + fmtCls(r.cls) + ' | ' + String(r.si).padStart(5) + ' | ' + String(r.a11y).padStart(3) + ' | ' + String(r.bp).padStart(3) + ' | ' + String(r.seo).padStart(3);

  lines.push('='.repeat(78));
  lines.push('CITY: ' + city.toUpperCase());
  lines.push('='.repeat(78));
  lines.push(row('mobile-1', m1));
  lines.push(row('mobile-2', m2));
  lines.push(row('mobile-3', m3));
  lines.push(row('MEDIAN', med));
  lines.push(row('desktop', d));
  lines.push('');
  lines.push('lighthouseVersion: ' + m1.lighthouseVersion);
  lines.push('a11yFailed (m1/m2/m3/d): ' + JSON.stringify([m1.a11yFailed, m2.a11yFailed, m3.a11yFailed, d.a11yFailed]));
  lines.push('seoFailed  (m1/m2/m3/d): ' + JSON.stringify([m1.seoFailed, m2.seoFailed, m3.seoFailed, d.seoFailed]));
  lines.push('bpFailed   (m1/m2/m3/d): ' + JSON.stringify([m1.bpFailed, m2.bpFailed, m3.bpFailed, d.bpFailed]));
  lines.push('LCP element m1: ' + m1.lcpElement);
  lines.push('LCP element m2: ' + m2.lcpElement);
  lines.push('LCP element m3: ' + m3.lcpElement);
  lines.push('LCP element  d: ' + d.lcpElement);
  lines.push('');
}

lines.push('='.repeat(78));
lines.push('COMPACT SCORE TABLE (mobile median / desktop)');
lines.push('='.repeat(78));
lines.push('City       | M-Perf | M-A11y | M-BP | M-SEO | D-Perf | D-A11y | D-BP | D-SEO | M-LCP | M-TBT');
for (const city of CITIES) {
  const { med, d } = allData[city];
  lines.push(
    city.padEnd(10) + ' | ' + String(med.perf).padStart(6) + ' | ' + String(med.a11y).padStart(6) + ' | ' + String(med.bp).padStart(4) + ' | ' + String(med.seo).padStart(5) + ' | ' + String(d.perf).padStart(6) + ' | ' + String(d.a11y).padStart(6) + ' | ' + String(d.bp).padStart(4) + ' | ' + String(d.seo).padStart(5) + ' | ' + String(med.lcp).padStart(5) + ' | ' + String(med.tbt).padStart(5)
  );
}
lines.push('');

const overviewPath = path.join(OUT, 'lh-pass2-overview.txt');
fs.writeFileSync(overviewPath, lines.join('\n'), 'utf8');
console.log('Wrote ' + overviewPath);

function loadCity(prefix, city, label) {
  const name = prefix === 'pass2' ? 'lh-pass2-' + city + '-' + label + '.json' : 'lh-' + city + '-' + label + '.json';
  return deepAudits(load(path.join(OUT, name)));
}

const diag = [];
diag.push('Karaganda Performance Diagnosis: Pass1 vs Pass2');
diag.push('NOTE: Yandex Metrika must remain enabled (not disabled for score).');
diag.push('Generated: ' + new Date().toISOString());
diag.push('');

const labels = ['m1', 'm2', 'm3', 'd'];
const p1 = {};
const p2 = {};
for (const lab of labels) {
  p1[lab] = loadCity('pass1', 'karaganda', lab);
  p2[lab] = loadCity('pass2', 'karaganda', lab);
}

const med1 = medianObj([p1.m1, p1.m2, p1.m3], ['perf', 'fcp', 'lcp', 'tbt', 'cls', 'si']);
const med2 = medianObj([p2.m1, p2.m2, p2.m3], ['perf', 'fcp', 'lcp', 'tbt', 'cls', 'si']);

diag.push('--- MOBILE MEDIAN COMPARISON ---');
diag.push('Metric          Pass1      Pass2      Delta');
diag.push('Perf            ' + String(med1.perf).padStart(6) + '     ' + String(med2.perf).padStart(6) + '     ' + (med2.perf - med1.perf));
diag.push('FCP (ms)        ' + String(med1.fcp).padStart(6) + '     ' + String(med2.fcp).padStart(6) + '     ' + (med2.fcp - med1.fcp));
diag.push('LCP (ms)        ' + String(med1.lcp).padStart(6) + '     ' + String(med2.lcp).padStart(6) + '     ' + (med2.lcp - med1.lcp));
diag.push('TBT (ms)        ' + String(med1.tbt).padStart(6) + '     ' + String(med2.tbt).padStart(6) + '     ' + (med2.tbt - med1.tbt));
diag.push('CLS             ' + fmtCls(med1.cls).padStart(6) + '     ' + fmtCls(med2.cls).padStart(6));
diag.push('SI (ms)         ' + String(med1.si).padStart(6) + '     ' + String(med2.si).padStart(6) + '     ' + (med2.si - med1.si));
diag.push('');

diag.push('--- PER-RUN LCP / TBT ---');
diag.push('Run   | Pass1 LCP | Pass2 LCP | Pass1 TBT | Pass2 TBT | Pass1 Perf | Pass2 Perf');
for (const lab of labels) {
  diag.push(
    lab.padEnd(5) + ' | ' + String(p1[lab].lcp).padStart(9) + ' | ' + String(p2[lab].lcp).padStart(9) + ' | ' + String(p1[lab].tbt).padStart(9) + ' | ' + String(p2[lab].tbt).padStart(9) + ' | ' + String(p1[lab].perf).padStart(10) + ' | ' + String(p2[lab].perf).padStart(10)
  );
}
diag.push('');

diag.push('--- LCP ELEMENT ---');
for (const lab of labels) {
  diag.push('Pass1 ' + lab + ': ' + (p1[lab].lcpElementFull || p1[lab].lcpElement));
  diag.push('Pass2 ' + lab + ': ' + (p2[lab].lcpElementFull || p2[lab].lcpElement));
}
diag.push('');

diag.push('--- RENDER-BLOCKING ---');
for (const lab of ['m1', 'm2', 'm3']) {
  diag.push('Pass1 ' + lab + ': wastedMs~=' + p1[lab].renderBlockingWastedMs + ' score=' + p1[lab].renderBlockingScore + ' items=' + p1[lab].renderBlockingItems.length);
  for (const it of p1[lab].renderBlockingItems.slice(0, 5)) {
    diag.push('  - ' + it.wastedMs + 'ms  ' + it.url);
  }
  diag.push('Pass2 ' + lab + ': wastedMs~=' + p2[lab].renderBlockingWastedMs + ' score=' + p2[lab].renderBlockingScore + ' items=' + p2[lab].renderBlockingItems.length);
  for (const it of p2[lab].renderBlockingItems.slice(0, 5)) {
    diag.push('  - ' + it.wastedMs + 'ms  ' + it.url);
  }
}
diag.push('');

diag.push('--- UNUSED JAVASCRIPT ---');
for (const lab of ['m1', 'm2', 'm3']) {
  diag.push('Pass1 ' + lab + ': wastedBytes~=' + p1[lab].unusedJsWastedBytes + ' score=' + p1[lab].unusedJsScore);
  for (const it of p1[lab].unusedJsItems.slice(0, 5)) {
    diag.push('  - ' + it.wastedBytes + 'B / ' + it.totalBytes + 'B  ' + it.url);
  }
  diag.push('Pass2 ' + lab + ': wastedBytes~=' + p2[lab].unusedJsWastedBytes + ' score=' + p2[lab].unusedJsScore);
  for (const it of p2[lab].unusedJsItems.slice(0, 5)) {
    diag.push('  - ' + it.wastedBytes + 'B / ' + it.totalBytes + 'B  ' + it.url);
  }
}
diag.push('');

diag.push('--- INTERPRETATION ---');
diag.push('Pass2 followed a11y underline CSS fix only; Metrika left enabled.');
diag.push('Mobile median Perf: ' + med1.perf + ' -> ' + med2.perf);
diag.push('Mobile median LCP: ' + med1.lcp + 'ms -> ' + med2.lcp + 'ms');
diag.push('Mobile median TBT: ' + med1.tbt + 'ms -> ' + med2.tbt + 'ms');
diag.push('BP remains <100 due to third-party-cookies / inspector-issues (typical with Metrika/analytics).');
diag.push('Do NOT disable Metrika to chase BP or Perf.');
diag.push('');

const diagPath = path.join(OUT, 'karaganda-perf-diagnosis.txt');
fs.writeFileSync(diagPath, diag.join('\n'), 'utf8');
console.log('Wrote ' + diagPath);
console.log('\n===== OVERVIEW =====\n');
console.log(lines.join('\n'));
console.log('\n===== KARAGANDA DIAG =====\n');
console.log(diag.join('\n'));
