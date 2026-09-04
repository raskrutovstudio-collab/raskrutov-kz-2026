/**
 * Shared mobile menu for the canonical .rk-header.
 * Safe on both clean and Motör pages.
 */
(function () {
  "use strict";
  if (window.__rkSiteHeader) return;
  window.__rkSiteHeader = true;

  function $(sel, root) {
    return (root || document).querySelector(sel);
  }

  function initMenu() {
    var burger = $("[data-rk-menu-toggle]");
    var panel = $("[data-rk-mobile-nav]");
    if (!burger || !panel) return;

    function setOpen(open) {
      burger.setAttribute("aria-expanded", open ? "true" : "false");
      burger.setAttribute("aria-label", open ? "Закрыть меню" : "Открыть меню");
      panel.classList.toggle("is-open", open);
      panel.hidden = !open;
      document.body.classList.toggle("rk-menu-open", open);
      if (open) {
        var first = panel.querySelector("a");
        if (first) first.focus();
      }
    }

    setOpen(false);

    burger.addEventListener("click", function () {
      setOpen(burger.getAttribute("aria-expanded") !== "true");
    });

    panel.addEventListener("click", function (e) {
      if (e.target.closest("a")) setOpen(false);
    });

    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && burger.getAttribute("aria-expanded") === "true") {
        setOpen(false);
        burger.focus();
      }
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initMenu);
  } else {
    initMenu();
  }
})();
