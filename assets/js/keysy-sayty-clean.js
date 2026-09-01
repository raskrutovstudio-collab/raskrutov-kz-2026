(function () {
  "use strict";

  var lb = document.getElementById("ks-lightbox");
  if (!lb) return;

  var img = lb.querySelector(".ks-lightbox__img");
  var closeBtn = lb.querySelector(".ks-lightbox__close");
  var backdrop = lb.querySelector(".ks-lightbox__backdrop");
  var lastFocus = null;

  function open(url, alt) {
    if (!img) return;
    lastFocus = document.activeElement;
    img.src = url;
    img.alt = alt || "";
    lb.hidden = false;
    document.body.classList.add("rk-modal-open");
    closeBtn.focus();
  }

  function close() {
    lb.hidden = true;
    if (img) {
      img.removeAttribute("src");
      img.alt = "";
    }
    if (!document.querySelector(".rk-modal:not([hidden])")) {
      document.body.classList.remove("rk-modal-open");
    }
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }

  document.addEventListener("click", function (e) {
    var btn = e.target.closest("[data-ks-lightbox]");
    if (btn) {
      e.preventDefault();
      open(btn.getAttribute("data-ks-lightbox"), btn.getAttribute("data-ks-lightbox-alt") || "");
      return;
    }
    if (e.target === closeBtn || e.target === backdrop) close();
  });

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && !lb.hidden) close();
  });
})();
