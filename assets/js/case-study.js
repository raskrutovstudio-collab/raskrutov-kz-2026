/**
 * Case study page — analytics helpers only.
 * Menu, scroll-top, soc-widget, phone mask, map: home-clean.js
 * Lead forms: lead-forms.js
 */
(function () {
  "use strict";

  document.addEventListener("click", function (e) {
    var link = e.target.closest("a[href]");
    if (!link) return;

    var href = link.getAttribute("href") || "";
    var isTel = href.indexOf("tel:") === 0;
    var isWa = href.indexOf("wa.me/") !== -1 || href.indexOf("whatsapp") !== -1;
    var isFranchise = href.indexOf("franshiza2024.kz") !== -1;

    if (!isTel && !isWa && !isFranchise) return;
    if (!window.dataLayer) return;

    window.dataLayer.push({
      event: "case_cta_click",
      cta_type: isTel ? "tel" : isWa ? "whatsapp" : "franchise",
      cta_href: href,
      page_path: location.pathname
    });
  });
})();
