(function () {
  "use strict";

  function closeAll(root, exceptBtn) {
    var buttons = root.querySelectorAll("[data-gads-faq-btn]");
    for (var i = 0; i < buttons.length; i++) {
      var btn = buttons[i];
      if (btn === exceptBtn) continue;
      btn.setAttribute("aria-expanded", "false");
      var panelId = btn.getAttribute("aria-controls");
      if (!panelId) continue;
      var panel = document.getElementById(panelId);
      if (panel) panel.setAttribute("hidden", "");
    }
  }

  function toggleItem(btn, root) {
    var expanded = btn.getAttribute("aria-expanded") === "true";
    var panelId = btn.getAttribute("aria-controls");
    var panel = panelId ? document.getElementById(panelId) : null;
    if (!panel) return;

    if (expanded) {
      btn.setAttribute("aria-expanded", "false");
      panel.setAttribute("hidden", "");
      return;
    }

    closeAll(root, btn);
    btn.setAttribute("aria-expanded", "true");
    panel.removeAttribute("hidden");
  }

  function initFaq(root) {
    root.addEventListener("click", function (event) {
      var btn = event.target.closest("[data-gads-faq-btn]");
      if (!btn || !root.contains(btn)) return;
      toggleItem(btn, root);
    });
  }

  function ready(fn) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", fn);
    } else {
      fn();
    }
  }

  ready(function () {
    var roots = document.querySelectorAll("[data-gads-faq]");
    for (var i = 0; i < roots.length; i++) initFaq(roots[i]);
  });
})();