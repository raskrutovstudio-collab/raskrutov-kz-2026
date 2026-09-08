(function () {
  "use strict";

  var ROOT_ATTR = "data-rk-rbuilder-slider";
  var READY_ATTR = "data-rk-rbuilder-slider-ready";
  var STYLE_ID = "rk-rbuilder-slider-css";
  var SWIPE_MIN = 40;

  function injectStyles() {
    if (document.getElementById(STYLE_ID)) return;
    var style = document.createElement("style");
    style.id = STYLE_ID;
    style.textContent =
      "[" + ROOT_ATTR + '] button.arrow,' +
      "[" + ROOT_ATTR + '] button.control-miniature{' +
      "appearance:none;-webkit-appearance:none;border:0;padding:0;margin:0;" +
      "font:inherit;color:inherit;cursor:pointer;background-color:transparent;" +
      "}" +
      "[" + ROOT_ATTR + '] button.arrow:focus-visible,' +
      "[" + ROOT_ATTR + '] button.control-miniature:focus-visible{' +
      "outline:2px solid #2b70a5;outline-offset:2px;" +
      "}" +
      "[" + ROOT_ATTR + '] .rk-rbuilder-slider-desc{' +
      "position:absolute;width:1px;height:1px;padding:0;margin:-1px;" +
      "overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0;" +
      "}" +
      "[" + ROOT_ATTR + '] .slide.slide--active{transform:translateX(0);}' +
      "[" + ROOT_ATTR + '] .slide.slide--transformR{transform:translateX(100%);}' +
      "[" + ROOT_ATTR + '] .slide.slide--transformL{transform:translateX(-100%);}';
    document.head.appendChild(style);
  }

  function initRoot(root) {
    if (!root || root.getAttribute(READY_ATTR) === "1") return;

    var slider = root.querySelector(".slider");
    var slides = slider ? Array.prototype.slice.call(slider.querySelectorAll(".slide")) : [];
    var thumbs = Array.prototype.slice.call(root.querySelectorAll(".slider__controls > .control-miniature"));
    var prevBtn = root.querySelector(".arrow--left");
    var nextBtn = root.querySelector(".arrow--right");
    if (!slider || !slides.length || !prevBtn || !nextBtn) return;

    var current = 0;
    slides.forEach(function (slide, i) {
      if (slide.classList.contains("slide--active")) current = i;
    });

    function lockHeight() {
      slider.style.height = "";
      var h = Math.round(slider.getBoundingClientRect().height);
      if (h > 0) slider.style.height = h + "px";
    }

    function setActive(next) {
      var total = slides.length;
      var index = ((next % total) + total) % total;
      current = index;
      slides.forEach(function (slide, i) {
        slide.classList.remove("slide--active", "slide--transformL", "slide--transformR");
        if (i === index) slide.classList.add("slide--active");
        else if (i < index) slide.classList.add("slide--transformL");
        else slide.classList.add("slide--transformR");
      });
      thumbs.forEach(function (thumb, i) {
        var isActive = i === index;
        thumb.classList.toggle("control--active", isActive);
        if (isActive) thumb.setAttribute("aria-current", "true");
        else thumb.removeAttribute("aria-current");
      });
    }

    function onPrev() {
      setActive(current - 1);
    }

    function onNext() {
      setActive(current + 1);
    }

    prevBtn.addEventListener("click", onPrev);
    nextBtn.addEventListener("click", onNext);
    thumbs.forEach(function (thumb, i) {
      thumb.addEventListener("click", function () {
        setActive(i);
      });
    });

    var startX = 0;
    var startY = 0;
    var tracking = false;
    var horizontal = false;

    slider.addEventListener(
      "touchstart",
      function (event) {
        if (!event.touches || event.touches.length !== 1) return;
        tracking = true;
        horizontal = false;
        startX = event.touches[0].clientX;
        startY = event.touches[0].clientY;
      },
      { passive: true }
    );

    slider.addEventListener(
      "touchmove",
      function (event) {
        if (!tracking || !event.touches || event.touches.length !== 1) return;
        var dx = event.touches[0].clientX - startX;
        var dy = event.touches[0].clientY - startY;
        if (!horizontal && Math.abs(dx) > 8 && Math.abs(dx) > Math.abs(dy)) {
          horizontal = true;
        }
        if (horizontal && event.cancelable) event.preventDefault();
      },
      { passive: false }
    );

    function endSwipe(event) {
      if (!tracking) return;
      var point = (event.changedTouches && event.changedTouches[0]) || null;
      var dx = point ? point.clientX - startX : 0;
      var dy = point ? point.clientY - startY : 0;
      tracking = false;
      if (horizontal && Math.abs(dx) >= SWIPE_MIN && Math.abs(dx) > Math.abs(dy)) {
        if (dx < 0) onNext();
        else onPrev();
      }
      horizontal = false;
    }

    slider.addEventListener("touchend", endSwipe, { passive: true });
    slider.addEventListener("touchcancel", endSwipe, { passive: true });

    window.addEventListener("resize", lockHeight);

    lockHeight();
    setActive(current);
    root.setAttribute(READY_ATTR, "1");
  }

  function init() {
    injectStyles();
    var roots = document.querySelectorAll("[" + ROOT_ATTR + '="1"]');
    for (var i = 0; i < roots.length; i++) initRoot(roots[i]);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init, { once: true });
  } else {
    init();
  }
})();
