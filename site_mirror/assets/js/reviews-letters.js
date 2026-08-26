(function () {
  "use strict";

  function prefersReducedMotion() {
    return window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }

  function initSlider(root) {
    var viewport = root.querySelector("[data-slider-viewport]");
    var track = root.querySelector("[data-slider-track]");
    if (!viewport || !track) return;

    var originals = Array.prototype.slice.call(track.children);
    if (!originals.length) return;

    // Clone once for seamless loop
    originals.forEach(function (node) {
      var clone = node.cloneNode(true);
      clone.setAttribute("aria-hidden", "true");
      clone.querySelectorAll("a, button, input, textarea").forEach(function (el) {
        el.setAttribute("tabindex", "-1");
        el.setAttribute("aria-hidden", "true");
      });
      clone.querySelectorAll("img").forEach(function (img) {
        img.setAttribute("alt", "");
        img.setAttribute("loading", "lazy");
      });
      track.appendChild(clone);
    });

    function measure() {
      var gap = parseFloat(window.getComputedStyle(track).gap) || 0;
      var distance = 0;
      originals.forEach(function (node, index) {
        distance += node.getBoundingClientRect().width;
        if (index < originals.length - 1) distance += gap;
      });
      // include trailing gap before clones start
      distance += gap;
      root.style.setProperty("--reviews-loop-distance", distance + "px");
      var seconds = Math.max(40, Math.round(distance / 28));
      root.style.setProperty("--reviews-marquee-duration", seconds + "s");
    }

    measure();

    var resizeTimer = null;
    window.addEventListener("resize", function () {
      window.clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(measure, 120);
    });

    if (prefersReducedMotion()) {
      root.classList.add("is-paused");
      return;
    }

    // Touch / pointer drag: pause and nudge scroll via temporary transform override
    var dragging = false;
    var startX = 0;
    var baseOffset = 0;
    var dragOffset = 0;

    function currentTranslateX() {
      var style = window.getComputedStyle(track).transform;
      if (!style || style === "none") return 0;
      var m = style.match(/matrix\(([^)]+)\)/);
      if (!m) return 0;
      var parts = m[1].split(",");
      return parseFloat(parts[4]) || 0;
    }

    function onPointerDown(e) {
      if (e.pointerType === "mouse" && e.button !== 0) return;
      dragging = true;
      root.classList.add("is-paused");
      startX = e.clientX;
      baseOffset = currentTranslateX();
      dragOffset = 0;
      track.style.animation = "none";
      track.style.transform = "translate3d(" + baseOffset + "px,0,0)";
      try { viewport.setPointerCapture(e.pointerId); } catch (err) {}
    }

    function onPointerMove(e) {
      if (!dragging) return;
      dragOffset = e.clientX - startX;
      track.style.transform = "translate3d(" + (baseOffset + dragOffset) + "px,0,0)";
    }

    function onPointerUp(e) {
      if (!dragging) return;
      dragging = false;
      try { viewport.releasePointerCapture(e.pointerId); } catch (err) {}
      // Resume seamless animation from measured loop (reset to CSS animation)
      track.style.animation = "";
      track.style.transform = "";
      root.classList.remove("is-paused");
    }

    viewport.addEventListener("pointerdown", onPointerDown, { passive: true });
    viewport.addEventListener("pointermove", onPointerMove, { passive: true });
    viewport.addEventListener("pointerup", onPointerUp);
    viewport.addEventListener("pointercancel", onPointerUp);
  }

  function initLazy2gis(section) {
    if (!section || !("IntersectionObserver" in window)) {
      if (section) boot2gis(section);
      return;
    }
    var booted = false;
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting || booted) return;
          booted = true;
          io.disconnect();
          boot2gis(section);
        });
      },
      { rootMargin: "200px 0px" }
    );
    io.observe(section);
  }

  function boot2gis(section) {
    var iframe = section.querySelector("#big_light_70000001041348422");
    if (!iframe || iframe.getAttribute("data-booted") === "1") return;
    iframe.setAttribute("data-booted", "1");
    var payload =
      "PGhlYWQ+PHNjcmlwdCB0eXBlPSJ0ZXh0L2phdmFzY3JpcHQiPgogICAgd2luZG93Ll9fc2l6ZV9fPSdiaWcnOwogICAgd2luZG93Ll9fdGhlbWVfXz0nbGlnaHQnOwogICAgd2luZG93Ll9fYnJhbmNoSWRfXz0nNzAwMDAwMDEwNDEzNDg0MjInCiAgICB3aW5kb3cuX19vcmdJZF9fPSc3MDAwMDAwMTAzOTY0NDkxMicKICAgPC9zY3JpcHQ+PHNjcmlwdCBjcm9zc29yaWdpbj0iYW5vbnltb3VzIiB0eXBlPSJtb2R1bGUiIHNyYz0iaHR0cHM6Ly9kaXNrLjJnaXMuY29tL3dpZGdldC1jb25zdHJ1Y3Rvci9hc3NldHMvaWZyYW1lLmpzIj48L3NjcmlwdD48bGluayByZWw9Im1vZHVsZXByZWxvYWQiIGNyb3Nzb3JpZ2luPSJhbm9ueW1vdXMiIGhyZWY9Imh0dHBzOi8vZGlzay4yZ2lzLmNvbS93aWRnZXQtY29uc3RydWN0b3IvYXNzZXRzL2RlZmF1bHRzLmpzIj48bGluayByZWw9InN0eWxlc2hlZXQiIGNyb3Nzb3JpZ2luPSJhbm9ueW1vdXMiIGhyZWY9Imh0dHBzOi8vZGlzay4yZ2lzLmNvbS93aWRnZXQtY29uc3RydWN0b3IvYXNzZXRzL2RlZmF1bHRzLmNzcyI+PC9oZWFkPjxib2R5PjxkaXYgaWQ9ImlmcmFtZSI+PC9kaXY+PC9ib2R5Pg==";
    try {
      iframe.contentWindow.document.open();
      iframe.contentWindow.document.write(decodeURIComponent(escape(atob(payload))));
      iframe.contentWindow.document.close();
    } catch (err) {
      // keep empty iframe shell; do not throw
    }
  }

  document.addEventListener("DOMContentLoaded", function () {
    document.querySelectorAll("[data-reviews-slider]").forEach(initSlider);
    initLazy2gis(document.getElementById("gis-reviews"));
  });
})();
