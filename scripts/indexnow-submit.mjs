#!/usr/bin/env node
/**
 * IndexNow submitter for raskrutov.kz
 *
 * Usage:
 *   node scripts/indexnow-submit.mjs --dry-run https://raskrutov.kz/keysy/sayty/
 *   node scripts/indexnow-submit.mjs https://raskrutov.kz/keysy/sayty/
 *   node scripts/indexnow-submit.mjs --changed
 *   node scripts/indexnow-submit.mjs --changed --base plesk --dry-run
 *
 * Only https://raskrutov.kz/... URLs are accepted.
 * Does not submit assets, robots.txt, sitemap, verification or key files.
 */

import { execFileSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HOST = 'raskrutov.kz';
const KEY = '41bcb591d9b543cca6bde0ee22dfd577';
const KEY_LOCATION = `https://${HOST}/${KEY}.txt`;
const ENDPOINT = 'https://api.indexnow.org/indexnow';
const MAX_URLS = 10000;

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const MIRROR = path.join(ROOT, 'site_mirror');

const SKIP_BASENAMES = new Set([
  'robots.txt',
  'sitemap.xml',
  'BingSiteAuth.xml',
  `${KEY}.txt`,
  '.htaccess',
  'favicon.ico'
]);

function usage(code = 0) {
  const text = `IndexNow submitter for ${HOST}

Usage:
  node scripts/indexnow-submit.mjs [--dry-run] <url> [url...]
  node scripts/indexnow-submit.mjs [--dry-run] --changed [--base <git-ref>]

Options:
  --dry-run     Build and print payload, do not POST
  --changed     Collect public HTML pages changed vs git base (default: origin/plesk)
  --base <ref>  Git ref for --changed comparison
  --help        Show help
`;
  process.stdout.write(text);
  process.exit(code);
}

function parseArgs(argv) {
  const opts = { dryRun: false, changed: false, base: 'origin/plesk', urls: [] };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--help' || a === '-h') usage(0);
    else if (a === '--dry-run') opts.dryRun = true;
    else if (a === '--changed') opts.changed = true;
    else if (a === '--base') {
      const v = argv[++i];
      if (!v) {
        console.error('ERROR: --base requires a git ref');
        process.exit(1);
      }
      opts.base = v;
    } else if (a.startsWith('-')) {
      console.error(`ERROR: unknown option ${a}`);
      usage(1);
    } else {
      opts.urls.push(a);
    }
  }
  return opts;
}

function normalizeUrl(input) {
  let raw = String(input || '').trim();
  if (!raw) throw new Error('empty URL');

  if (!/^https?:\/\//i.test(raw)) {
    if (raw.startsWith('/')) raw = `https://${HOST}${raw}`;
    else if (raw.startsWith(HOST + '/') || raw === HOST) raw = `https://${raw}`;
    else throw new Error(`unsupported URL form: ${input}`);
  }

  let u;
  try {
    u = new URL(raw);
  } catch {
    throw new Error(`invalid URL: ${input}`);
  }

  if (u.protocol !== 'https:') {
    throw new Error(`only https allowed: ${input}`);
  }
  if (u.hostname !== HOST) {
    throw new Error(`host must be ${HOST}: ${input}`);
  }
  if (u.username || u.password) {
    throw new Error(`credentials not allowed: ${input}`);
  }
  if (u.search || u.hash) {
    u.search = '';
    u.hash = '';
  }

  // Keep trailing slash semantics for directories; strip default index.html
  let p = u.pathname || '/';
  if (/\/index\.html$/i.test(p)) {
    p = p.replace(/\/index\.html$/i, '/');
  }
  u.pathname = p;
  return u.toString();
}

function isBlockedUrl(urlStr) {
  const u = new URL(urlStr);
  const base = path.posix.basename(u.pathname);
  if (SKIP_BASENAMES.has(base)) return true;
  if (u.pathname === `/${KEY}.txt`) return true;
  if (u.pathname === '/BingSiteAuth.xml') return true;
  if (u.pathname === '/robots.txt' || u.pathname === '/sitemap.xml') return true;

  // asset-like paths
  if (
    /\/assets\//i.test(u.pathname) ||
    /\.(css|js|mjs|map|webp|png|jpe?g|gif|svg|ico|woff2?|ttf|eot|json|xml|pdf|txt)$/i.test(
      u.pathname
    )
  ) {
    // allow only the indexnow key file already blocked above; block other txt/xml
    return true;
  }
  return false;
}

function pathToPublicUrl(relPosix) {
  const rel = relPosix.replace(/\\/g, '/').replace(/^\.\//, '');
  let p = rel;
  if (p.startsWith('site_mirror/')) p = p.slice('site_mirror/'.length);
  if (p.startsWith('site_plesk/')) p = p.slice('site_plesk/'.length);

  if (!p || p.includes('..')) return null;
  if (p.startsWith('_work/') || p.startsWith('assets/')) return null;

  const base = path.posix.basename(p);
  if (SKIP_BASENAMES.has(base)) return null;
  if (!/\.html?$/i.test(p) && p !== 'index.html') {
    // only HTML pages
    if (!p.endsWith('/')) return null;
  }

  if (/\/index\.html?$/i.test(p) || /^index\.html?$/i.test(p)) {
    const dir = p.replace(/\/?index\.html?$/i, '');
    const urlPath = dir ? `/${dir}/` : '/';
    return `https://${HOST}${urlPath}`;
  }

  if (/\.html?$/i.test(p)) {
    // non-index html → keep path without forcing slash
    return `https://${HOST}/${p}`;
  }

  return null;
}

function gitChangedPaths(baseRef) {
  const args = ['diff', '--name-status', `${baseRef}...HEAD`];
  let out;
  try {
    out = execFileSync('git', args, {
      cwd: ROOT,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'pipe']
    });
  } catch (err) {
    // fallback: compare working tree + index against base
    try {
      out = execFileSync('git', ['diff', '--name-status', baseRef], {
        cwd: ROOT,
        encoding: 'utf8'
      });
      const staged = execFileSync('git', ['diff', '--name-status', '--cached', baseRef], {
        cwd: ROOT,
        encoding: 'utf8'
      });
      out = `${out}\n${staged}`;
    } catch (err2) {
      throw new Error(
        `git diff failed against ${baseRef}: ${err2.stderr || err2.message || err.message}`
      );
    }
  }

  const paths = [];
  for (const line of out.split(/\r?\n/)) {
    if (!line.trim()) continue;
    const m = line.match(/^([AMD]|R\d*)\t(.+?)(?:\t(.+))?$/);
    if (!m) continue;
    const status = m[1][0];
    const from = m[2];
    const to = m[3];
    if (status === 'R' && to) {
      paths.push(from, to);
    } else {
      paths.push(from);
    }
  }
  return [...new Set(paths)];
}

function collectChangedUrls(baseRef) {
  const paths = gitChangedPaths(baseRef);
  const urls = [];
  for (const p of paths) {
    const norm = p.replace(/\\/g, '/');
    if (!norm.startsWith('site_mirror/') && !norm.startsWith('site_plesk/')) continue;
    const url = pathToPublicUrl(norm);
    if (!url) continue;
    urls.push(url);
  }
  return urls;
}

function dedupeNormalize(rawUrls) {
  const out = [];
  const seen = new Set();
  const rejected = [];
  for (const raw of rawUrls) {
    try {
      const url = normalizeUrl(raw);
      if (isBlockedUrl(url)) {
        rejected.push({ raw, reason: 'blocked non-page URL' });
        continue;
      }
      if (seen.has(url)) continue;
      seen.add(url);
      out.push(url);
    } catch (e) {
      rejected.push({ raw, reason: e.message });
    }
  }
  return { urls: out, rejected };
}

async function submit(urls, dryRun) {
  if (!urls.length) {
    console.error('ERROR: no valid URLs to submit');
    process.exit(1);
  }
  if (urls.length > MAX_URLS) {
    console.error(`ERROR: too many URLs (${urls.length} > ${MAX_URLS})`);
    process.exit(1);
  }

  const payload = {
    host: HOST,
    key: KEY,
    keyLocation: KEY_LOCATION,
    urlList: urls
  };

  console.log(`IndexNow host: ${HOST}`);
  console.log(`IndexNow keyLocation: ${KEY_LOCATION}`);
  console.log(`IndexNow endpoint: ${ENDPOINT}`);
  console.log(`URL count: ${urls.length}`);
  for (const u of urls) console.log(`  - ${u}`);

  if (dryRun) {
    console.log('DRY-RUN payload:');
    console.log(JSON.stringify(payload, null, 2));
    console.log('DRY-RUN: no request sent');
    return { status: 0, dryRun: true };
  }

  // Preflight: key must be live on production
  const keyRes = await fetch(KEY_LOCATION, { redirect: 'manual' });
  const keyBody = (await keyRes.text()).trim();
  if (keyRes.status !== 200 || keyBody !== KEY) {
    console.error(
      `ERROR: keyLocation not ready (HTTP ${keyRes.status}, body=${JSON.stringify(keyBody.slice(0, 80))})`
    );
    process.exit(1);
  }
  console.log('keyLocation preflight: HTTP 200, content verified');

  const res = await fetch(ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json; charset=utf-8'
    },
    body: JSON.stringify(payload)
  });
  const text = await res.text();
  console.log(`IndexNow HTTP: ${res.status}`);
  if (text) console.log(`IndexNow body: ${text}`);

  if (res.status === 200 || res.status === 202) {
    return { status: res.status, dryRun: false };
  }

  const hints = {
    400: 'invalid request',
    403: 'key / keyLocation problem',
    422: 'URL / host / schema mismatch',
    429: 'rate limited'
  };
  if (hints[res.status]) console.error(`HINT: ${hints[res.status]}`);
  process.exit(1);
}

async function main() {
  const opts = parseArgs(process.argv.slice(2));
  let raw = [...opts.urls];

  if (opts.changed) {
    console.log(`Collecting changed pages vs ${opts.base}...`);
    raw = raw.concat(collectChangedUrls(opts.base));
  }

  if (!raw.length) {
    console.error('ERROR: provide URL(s) or --changed');
    usage(1);
  }

  const { urls, rejected } = dedupeNormalize(raw);
  if (rejected.length) {
    console.log('Rejected:');
    for (const r of rejected) console.log(`  - ${r.raw}: ${r.reason}`);
  }

  await submit(urls, opts.dryRun);
}

main().catch((err) => {
  console.error('ERROR:', err && err.stack ? err.stack : err);
  process.exit(1);
});
