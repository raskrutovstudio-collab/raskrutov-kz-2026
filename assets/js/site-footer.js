(function () {
  "use strict";

  var ROOT = "[data-rk-site-footer='1']";
  var READY = "data-rk-site-footer-ready";

  function qs(el, sel) {
    return el.querySelector(sel);
  }

  function qsa(el, sel) {
    return Array.prototype.slice.call(el.querySelectorAll(sel));
  }

  function findModal() {
    return document.getElementById("rk-modal-lead") || document.querySelector(".rk-modal");
  }

  function findMotorPopup(preferredId) {
    if (preferredId) {
      var exact = document.getElementById(preferredId);
      if (exact && exact.className && String(exact.className).indexOf("section_popup") !== -1) {
        return exact;
      }
    }
    return document.querySelector(".section_popup, .blk-section--ms-popup");
  }

  function restoreScroll() {
    document.documentElement.style.removeProperty("overflow");
    document.body.style.removeProperty("overflow");
  }

  function lockScroll() {
    document.documentElement.style.overflow = "hidden";
    document.body.style.overflow = "hidden";
  }

  function openRkModal(modal, opener) {
    if (!modal) return false;
    modal.hidden = false;
    modal.classList.add("is-open");
    modal.setAttribute("data-rk-footer-opened", "1");
    if (opener) modal.setAttribute("data-rk-footer-return", opener.id || "");
    lockScroll();
    var close = modal.querySelector("[data-rk-modal-close], .rk-modal__close");
    if (close) close.focus();
    return true;
  }

  function closeRkModal(modal, opener) {
    if (!modal) return;
    modal.hidden = true;
    modal.classList.remove("is-open");
    modal.removeAttribute("data-rk-footer-opened");
    restoreScroll();
    if (opener && typeof opener.focus === "function") opener.focus();
  }

  function openMotorPopup(popup) {
    if (!popup) return false;
    if (typeof window.showSectionPopup === "function") {
      window.showSectionPopup(popup.id);
    } else {
      popup.classList.add("open");
      popup.style.display = "block";
      document.body.classList.add("open_popup");
      document.documentElement.classList.add("open_popup");
    }
    popup.setAttribute("data-rk-footer-opened", "1");
    lockScroll();
    return true;
  }

  function closeMotorPopup(popup, opener) {
    if (!popup) return;
    if (typeof window.hideSectionPopup === "function") {
      window.hideSectionPopup(popup.id);
    } else {
      popup.classList.remove("open");
      popup.style.display = "";
      document.body.classList.remove("open_popup");
      document.documentElement.classList.remove("open_popup");
    }
    popup.removeAttribute("data-rk-footer-opened");
    restoreScroll();
    if (opener && typeof opener.focus === "function") opener.focus();
  }

  function bindRoot(root) {
    if (!root || root.getAttribute(READY) === "1") return;
    var cta = qs(root, "[data-rk-footer-cta]");
    var lastOpener = null;

    function openFromCta() {
      lastOpener = cta;
      var modal = findModal();
      if (modal) {
        openRkModal(modal, cta);
        return;
      }
      var popupId = cta && (cta.getAttribute("data-popup-id") || "223446f0feaa4bc991d2688588f8f467");
      openMotorPopup(findMotorPopup(popupId));
    }

    if (cta) {
      cta.addEventListener("click", function (event) {
        event.preventDefault();
        openFromCta();
      });
      cta.addEventListener("keydown", function (event) {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          openFromCta();
        }
      });
    }

    document.addEventListener("keydown", function (event) {
      if (event.key !== "Escape") return;
      var modal = findModal();
      if (modal && (modal.getAttribute("data-rk-footer-opened") === "1" || modal.classList.contains("is-open") || !modal.hidden)) {
        closeRkModal(modal, lastOpener);
      }
      var popup = document.querySelector(".section_popup[data-rk-footer-opened='1'], .section_popup.open");
      if (popup) closeMotorPopup(popup, lastOpener);
    });

    var modal = findModal();
    if (modal) {
      var backdrop = modal.querySelector(".rk-modal__backdrop");
      if (backdrop) {
        backdrop.addEventListener("click", function () {
          closeRkModal(modal, lastOpener);
        });
      }
      qsa(modal, "[data-rk-modal-close], .rk-modal__close").forEach(function (btn) {
        btn.addEventListener("click", function () {
          closeRkModal(modal, lastOpener);
        });
      });
    }

    root.setAttribute(READY, "1");
  }

  function init() {
    qsa(document, ROOT).forEach(bindRoot);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init, { once: true });
  } else {
    init();
  }
})();
