/**
 * AUDIT ONLY — Playwright coverage + timing for Google Ads Astana pilot
 * Mobile 390, Slow4G + 4x CPU via CDP
 */
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const OUT = path.resolve(__dirname);
const URL = 'http://127.0.0.1:4180/web-studiya/kontekstnaya-reklama/google-ads/astana/';
const PROD_URL = 'https://raskrutov.kz/web-studiya/kontekstnaya-reklama/google-ads/';
const LOCAL_REPUBLICAN = 'http://127.0.0.1:4180/web-studiya/kontekstnaya-reklama/google-ads/';

function shortName(u) {
  try {
    const x = new URL(u);
    return x.pathname.split('/').pop() + (x.search || '');
  } catch {
    return u;
  }
}

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 2,
    isMobile: true,
    hasTouch: true,
    userAgent:
      'Mozilla/5.0 (Linux; Android 13; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36',
  });
  const page = await context.newPage();
  const cdp = await context.newCDPSession(page);

  // Slow4G + 4x CPU
  await cdp.send('Network.enable');
  await cdp.send('Network.emulateNetworkConditions', {
    offline: false,
    latency: 150,
    downloadThroughput: (1.6 * 1024 * 1024) / 8, // 1.6 Mbps
    uploadThroughput: (750 * 1024) / 8,
    connectionType: 'cellular4g',
  });
  await cdp.send('Emulation.setCPUThrottlingRate', { rate: 4 });

  // Coverage (DOM before CSS)
  await cdp.send('DOM.enable');
  await cdp.send('CSS.enable');
  await cdp.send('CSS.startRuleUsageTracking');
  await cdp.send('Performance.enable');

  // Capture DCL lead styles early via init script + MutationObserver-ish
  await page.addInitScript(() => {
    window.__diag = {
      dclLead: null,
      fontsReadyAt: null,
      fontsAtReady: [],
      paint: {},
      lcp: null,
      navStart: performance.timeOrigin,
    };

    document.addEventListener(
      'DOMContentLoaded',
      () => {
        const el = document.querySelector('p.ctx-hero__lead');
        if (el) {
          const cs = getComputedStyle(el);
          window.__diag.dclLead = {
            opacity: cs.opacity,
            visibility: cs.visibility,
            fontFamily: cs.fontFamily,
            fontWeight: cs.fontWeight,
            fontSize: cs.fontSize,
            color: cs.color,
            display: cs.display,
          };
        }
      },
      { once: true }
    );

    const t0 = performance.now();
    document.fonts.ready.then(() => {
      window.__diag.fontsReadyAt = performance.now() - t0;
      window.__diag.fontsAtReady = [...document.fonts].map((f) => ({
        family: f.family,
        weight: f.weight,
        style: f.style,
        status: f.status,
        stretch: f.stretch,
      }));
    });

    try {
      const po = new PerformanceObserver((list) => {
        for (const e of list.getEntries()) {
          if (e.entryType === 'paint') {
            window.__diag.paint[e.name] = e.startTime;
          }
          if (e.entryType === 'largest-contentful-paint') {
            window.__diag.lcp = {
              startTime: e.startTime,
              size: e.size,
              url: e.url || '',
              element: e.element
                ? {
                    tag: e.element.tagName,
                    id: e.element.id || '',
                    className: String(e.element.className || '').slice(0, 120),
                    text: (e.element.textContent || '').trim().slice(0, 160),
                  }
                : null,
              // LCP phases if supported by Chrome
              renderTime: e.renderTime || null,
              loadTime: e.loadTime || null,
              id: e.id || '',
            };
          }
        }
      });
      po.observe({ type: 'paint', buffered: true });
      po.observe({ type: 'largest-contentful-paint', buffered: true });
      window.__lcpPO = po;
    } catch (e) {
      window.__diag.poError = String(e);
    }
  });

  const navStart = Date.now();
  await page.goto(URL, { waitUntil: 'networkidle', timeout: 120000 });
  // Allow LCP to settle under throttle
  await page.waitForTimeout(3000);

  // Try LCP phases via PerformanceObserver getEntries
  const metrics = await page.evaluate(() => {
    const resources = performance
      .getEntriesByType('resource')
      .filter((r) => {
        const n = r.name;
        return (
          /\.(css|js|woff2?)(\?|$)/i.test(n) ||
          n.includes('/fonts/') ||
          n.includes('.css') ||
          n.includes('.js') ||
          n.includes('.woff')
        );
      })
      .map((r) => ({
        name: r.name,
        initiatorType: r.initiatorType,
        transferSize: r.transferSize,
        encodedBodySize: r.encodedBodySize,
        decodedBodySize: r.decodedBodySize,
        startTime: Math.round(r.startTime * 100) / 100,
        responseEnd: Math.round(r.responseEnd * 100) / 100,
        duration: Math.round(r.duration * 100) / 100,
        renderBlockingStatus: r.renderBlockingStatus || null,
        nextHopProtocol: r.nextHopProtocol || null,
      }));

    const lead = document.querySelector('p.ctx-hero__lead');
    let lcpLead = null;
    if (lead) {
      const cs = getComputedStyle(lead);
      lcpLead = {
        opacity: cs.opacity,
        visibility: cs.visibility,
        fontFamily: cs.fontFamily,
        fontWeight: cs.fontWeight,
        fontSize: cs.fontSize,
        color: cs.color,
        display: cs.display,
      };
    }

    // Detect font-display from CSSOM @font-face
    const fontFaces = [];
    try {
      for (const sheet of document.styleSheets) {
        let rules;
        try {
          rules = sheet.cssRules;
        } catch {
          continue;
        }
        if (!rules) continue;
        for (const rule of rules) {
          if (rule.type === CSSRule.FONT_FACE_RULE) {
            fontFaces.push({
              href: sheet.href || 'inline',
              family: rule.style.getPropertyValue('font-family'),
              weight: rule.style.getPropertyValue('font-weight'),
              display: rule.style.getPropertyValue('font-display'),
              src: rule.style.getPropertyValue('src').slice(0, 200),
            });
          }
        }
      }
    } catch (e) {
      /* ignore */
    }

    const fontsNow = [...document.fonts].map((f) => ({
      family: f.family,
      weight: f.weight,
      style: f.style,
      status: f.status,
    }));

    // Used font on lead via Canvas / document.fonts.check
    const usedWeight = lead ? getComputedStyle(lead).fontWeight : null;
    const checks = {
      '400': document.fonts.check('400 16px Montserrat'),
      '700': document.fonts.check('700 16px Montserrat'),
      '400italic': document.fonts.check('italic 400 16px Montserrat'),
    };

    return {
      diag: window.__diag,
      resources,
      lcpLead,
      fontFaces,
      fontsNow,
      usedWeight,
      fontChecks: checks,
      title: document.title,
      preloadLinks: [...document.querySelectorAll('link[rel=preload]')].map((l) => ({
        href: l.href,
        as: l.getAttribute('as'),
        type: l.getAttribute('type'),
      })),
      stylesheetLinks: [...document.querySelectorAll('link[rel=stylesheet]')].map((l) => ({
        href: l.href,
        media: l.media,
        disabled: l.disabled,
      })),
    };
  });

  // CSS Coverage
  const ruleUsage = await cdp.send('CSS.stopRuleUsageTracking');
  // Get stylesheets via CDP
  const { headers: docHeaders } = await page.evaluate(async () => {
    // no-op placeholder
    return {};
  }).catch(() => ({}));

  // Collect stylesheet text sizes via CDP
  const coverageBySheet = {};
  // Use Playwright's built-in coverage as well for cross-check
  // CDP CSS.takeCoverageDelta / rule usage:
  // unused = total - used ranges
  // We need stylesheet sources. Fetch via Network or CSS.getStyleSheetText

  const styleSheets = await cdp.send('CSS.getStyleSheetText' ).catch(() => null);

  // Better approach: use Playwright coverage API in a fresh page run... 
  // We already have ruleUsage.ruleUsage with styleSheetId, startOffset, endOffset, used
  // Get all stylesheets:
  const { css } = await (async () => {
    // Enable and list via document.styleSheets sizes from page + rule usage aggregation
    return { css: null };
  })();

  // Aggregate rule usage by styleSheetId
  const byId = {};
  for (const u of ruleUsage.ruleUsage || []) {
    if (!byId[u.styleSheetId]) {
      byId[u.styleSheetId] = { used: 0, unused: 0, ranges: 0 };
    }
    const len = u.endOffset - u.startOffset;
    byId[u.styleSheetId].ranges += 1;
    if (u.used) byId[u.styleSheetId].used += len;
    else byId[u.styleSheetId].unused += len;
  }

  // Map styleSheetId -> URL via CSS.styleSheetAdded events we missed.
  // Re-fetch with coverage via Playwright API:
  await browser.close();

  // Second pass with Playwright coverage API for accurate unusedBytes
  const browser2 = await chromium.launch({ headless: true });
  const context2 = await browser2.newContext({
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 2,
    isMobile: true,
    hasTouch: true,
  });
  const page2 = await context2.newPage();
  const cdp2 = await context2.newCDPSession(page2);
  await cdp2.send('Network.enable');
  await cdp2.send('Network.emulateNetworkConditions', {
    offline: false,
    latency: 150,
    downloadThroughput: (1.6 * 1024 * 1024) / 8,
    uploadThroughput: (750 * 1024) / 8,
    connectionType: 'cellular4g',
  });
  await cdp2.send('Emulation.setCPUThrottlingRate', { rate: 4 });

  await page2.coverage.startCSSCoverage({ resetOnNavigation: true });
  await page2.goto(URL, { waitUntil: 'networkidle', timeout: 120000 });
  await page2.waitForTimeout(2500);
  const cssCoverage = await page2.coverage.stopCSSCoverage();

  const coverage = cssCoverage.map((entry) => {
    const total = entry.text.length;
    let used = 0;
    for (const r of entry.ranges) used += r.end - r.start;
    const unused = total - used;
    return {
      url: entry.url,
      short: shortName(entry.url),
      totalBytes: total,
      usedBytes: used,
      unusedBytes: unused,
      unusedPct: total ? Math.round((unused / total) * 1000) / 10 : 0,
    };
  });
  coverage.sort((a, b) => b.unusedBytes - a.unusedBytes);

  await browser2.close();

  // Production / local republican CSS link pattern compare
  let prodHead = null;
  let localRepHead = null;
  try {
    const res = await fetch(PROD_URL, {
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; RaskrutovAudit/1.0)' },
      signal: AbortSignal.timeout(20000),
    });
    const html = await res.text();
    const links = [...html.matchAll(/<link[^>]+>/gi)].map((m) => m[0]);
    prodHead = {
      status: res.status,
      contentEncoding: res.headers.get('content-encoding'),
      linkTags: links.filter((l) => /stylesheet|preload|font/i.test(l)),
    };
  } catch (e) {
    prodHead = { error: String(e) };
  }
  try {
    const res = await fetch(LOCAL_REPUBLICAN, { signal: AbortSignal.timeout(10000) });
    const html = await res.text();
    const links = [...html.matchAll(/<link[^>]+>/gi)].map((m) => m[0]);
    localRepHead = {
      status: res.status,
      linkTags: links.filter((l) => /stylesheet|preload|font/i.test(l)),
    };
  } catch (e) {
    localRepHead = { error: String(e) };
  }

  // LCP weight conclusion from CSS
  const leadWeight = metrics.lcpLead?.fontWeight || metrics.diag?.dclLead?.fontWeight;
  const preloadIsBold = (metrics.preloadLinks || []).some((l) =>
    /montserrat_bold/i.test(l.href)
  );
  const preloadIsNormal = (metrics.preloadLinks || []).some((l) =>
    /montserrat_normal/i.test(l.href)
  );

  const result = {
    task: 'perf-pass2-diag',
    timestamp: new Date().toISOString(),
    url: URL,
    conditions: {
      viewport: '390x844',
      network: 'Slow4G (latency 150ms, down 1.6Mbps, up 750Kbps)',
      cpuThrottling: '4x',
    },
    sectionB: {
      resourceTimings: metrics.resources,
      paint: metrics.diag?.paint || {},
      lcp: metrics.diag?.lcp || null,
      fonts: {
        readyAtMsFromInit: metrics.diag?.fontsReadyAt,
        atReady: metrics.diag?.fontsAtReady,
        now: metrics.fontsNow,
        checks: metrics.fontChecks,
        facesFromCSSOM: metrics.fontFaces,
      },
      leadStyles: {
        atDCL: metrics.diag?.dclLead,
        atLCPOrSettle: metrics.lcpLead,
      },
      cssCoverage: coverage,
      topUnusedStylesheets: coverage.slice(0, 10),
      ruleUsageBySheetId: byId,
    },
    sectionC: {
      computedLeadFontWeight: leadWeight,
      preloadLinks: metrics.preloadLinks,
      preloadIsBold,
      preloadIsNormal,
      mismatch:
        String(leadWeight) === '400' && preloadIsBold
          ? 'MISMATCH: LCP lead uses weight 400; preload is montserrat_bold (700)'
          : String(leadWeight) === '700' && preloadIsBold
            ? 'MATCH: lead 700 and bold preload'
            : `leadWeight=${leadWeight}, boldPreload=${preloadIsBold}, normalPreload=${preloadIsNormal}`,
      note: 'ctx-hero__lead has no explicit font-weight; inherits body 400. H1/sub use 700.',
    },
    sectionD: {
      productionRepublican: prodHead,
      localRepublican: localRepHead,
      astanaStylesheets: metrics.stylesheetLinks,
      astanaPreloads: metrics.preloadLinks,
    },
    elapsedMs: Date.now() - navStart,
  };

  const outPath = path.join(OUT, 'perf-pass2-diag.json');
  // Write partial first; lighthouse will merge later
  fs.writeFileSync(outPath, JSON.stringify(result, null, 2));
  console.log(JSON.stringify({
    wrote: outPath,
    resources: metrics.resources.length,
    coverageSheets: coverage.length,
    lcp: metrics.diag?.lcp,
    leadWeight,
    paint: metrics.diag?.paint,
    topUnused: coverage.slice(0, 5).map((c) => ({
      short: c.short,
      unusedPct: c.unusedPct,
      unusedBytes: c.unusedBytes,
      totalBytes: c.totalBytes,
    })),
  }, null, 2));
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
