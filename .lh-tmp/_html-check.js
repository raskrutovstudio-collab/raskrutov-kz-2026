const http = require('http');
const url = 'http://127.0.0.1:4173/web-studiya/kontekstnaya-reklama/google-ads/';
http.get(url, (res) => {
  let d = '';
  res.on('data', (c) => (d += c));
  res.on('end', () => {
    const h1 = (d.match(/<h1[\s>]/gi) || []).length;
    const title = (d.match(/<title[^>]*>([^<]*)<\/title>/i) || [])[1] || null;
    let desc = null;
    const m1 = d.match(/<meta[^>]+name=["']description["'][^>]*content=["']([^"']*)["']/i);
    const m2 = d.match(/<meta[^>]+content=["']([^"']*)["'][^>]*name=["']description["']/i);
    desc = (m1 && m1[1]) || (m2 && m2[1]) || null;
    let can = null;
    const c1 = d.match(/<link[^>]+rel=["']canonical["'][^>]*href=["']([^"']*)["']/i);
    const c2 = d.match(/<link[^>]+href=["']([^"']*)["'][^>]*rel=["']canonical["']/i);
    can = (c1 && c1[1]) || (c2 && c2[1]) || null;
    const forms = [...d.matchAll(/<form\b[^>]*>/gi)].map((m) => m[0]);
    const formNames = [...d.matchAll(/<form\b[^>]*\bname=["']([^"']+)["']/gi)].map((m) => m[1]);
    const formBlock = (name) => {
      const i = d.indexOf('name="' + name + '"');
      if (i < 0) return '';
      const start = d.lastIndexOf('<form', i);
      const end = d.indexOf('</form>', i);
      return d.slice(start, end + 7);
    };
    const contactsBlock = formBlock('contacts_google_ads');
    const popupBlock = formBlock('popup_google_ads');
    const contactsOpen = forms.find((f) => /name=["']contacts_google_ads["']/.test(f)) || '';
    const popupOpen = forms.find((f) => /name=["']popup_google_ads["']/.test(f)) || '';
    const faqDetails = (d.match(/<details\b/gi) || []).length;
    const ldBlocks = [...d.matchAll(/<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)].map((m) => m[1]);
    let graph = [];
    for (const b of ldBlocks) {
      try {
        const j = JSON.parse(b.trim());
        if (j['@graph']) graph = graph.concat(j['@graph']);
        else graph.push(j);
      } catch (e) {
        graph.push({ parseError: String(e), raw: b.slice(0, 80) });
      }
    }
    const localhost = [
      ...d.matchAll(/https?:\/\/localhost[^\s"'<>]*/gi),
      ...d.matchAll(/https?:\/\/127\.0\.0\.1[^\s"'<>]*/gi),
    ].map((m) => m[0]);
    console.log(
      JSON.stringify(
        {
          status: res.statusCode,
          h1Count: h1,
          title,
          description: desc,
          canonical: can,
          formCount: forms.length,
          formNames,
          contacts_has_data_lead_form: /data-lead-form/.test(contactsOpen),
          popup_has_data_lead_form: /data-lead-form/.test(popupOpen),
          contacts_has_regulation_checkbox:
            /regulation/i.test(contactsBlock) && /type=["']checkbox["']/.test(contactsBlock),
          popup_has_regulation_checkbox:
            /regulation/i.test(popupBlock) && /type=["']checkbox["']/.test(popupBlock),
          contacts_checkbox_snippet: contactsBlock.match(/<input[^>]*type=["']checkbox["'][^>]*>/gi) || [],
          popup_checkbox_snippet: popupBlock.match(/<input[^>]*type=["']checkbox["'][^>]*>/gi) || [],
          faqDetailsCount: faqDetails,
          jsonLdTypes: graph.map((g) => ({ type: g['@type'], id: g['@id'] })),
          localhostLinks: localhost,
          leadFormsJs: d.includes('lead-forms.js'),
          homeCleanJs: d.includes('home-clean.js'),
        },
        null,
        2
      )
    );
  });
}).on('error', (e) => {
  console.error(e);
  process.exit(1);
});
