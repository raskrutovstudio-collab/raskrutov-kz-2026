(function () {
  "use strict";

  function prefersReducedMotion() {
    return window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }

  function initLightbox() {
    var lightbox = document.querySelector("[data-reviews-lightbox]");
    if (!lightbox) return;

    var dialog = lightbox.querySelector(".reviews-lightbox__dialog");
    var img = lightbox.querySelector("[data-lightbox-img]");
    var closeEls = lightbox.querySelectorAll("[data-lightbox-close]");
    var lastFocus = null;

    function openLightbox(src, alt) {
      if (!src || !img) return;
      lastFocus = document.activeElement;
      img.src = src;
      img.alt = alt || "Благодарственное письмо";
      lightbox.hidden = false;
      lightbox.setAttribute("aria-hidden", "false");
      document.body.classList.add("reviews-lightbox-open");
      var closeBtn = lightbox.querySelector(".reviews-lightbox__close");
      if (closeBtn) closeBtn.focus();
    }

    function closeLightbox() {
      lightbox.hidden = true;
      lightbox.setAttribute("aria-hidden", "true");
      document.body.classList.remove("reviews-lightbox-open");
      img.removeAttribute("src");
      if (lastFocus && typeof lastFocus.focus === "function") {
        lastFocus.focus();
      }
    }

    document.addEventListener("click", function (e) {
      var link = e.target.closest(".reviews-slide__link");
      if (!link || link.getAttribute("aria-hidden") === "true") return;
      var slide = link.closest(".reviews-slide");
      if (slide && slide.getAttribute("aria-hidden") === "true") return;
      e.preventDefault();
      var thumb = link.querySelector("img");
      openLightbox(link.getAttribute("href"), thumb ? thumb.getAttribute("alt") : "");
    });

    closeEls.forEach(function (el) {
      el.addEventListener("click", closeLightbox);
    });

    document.addEventListener("keydown", function (e) {
      if (lightbox.hidden) return;
      if (e.key === "Escape") {
        e.preventDefault();
        closeLightbox();
      }
      if (e.key === "Tab" && dialog) {
        var focusable = dialog.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
        focusable = Array.prototype.filter.call(focusable, function (node) {
          return !node.disabled && node.offsetParent !== null;
        });
        if (!focusable.length) return;
        var first = focusable[0];
        var last = focusable[focusable.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    });
  }

  function initSlider(root) {
    var viewport = root.querySelector("[data-slider-viewport]");
    var track = root.querySelector("[data-slider-track]");
    var prevBtn = root.querySelector("[data-slider-prev]");
    var nextBtn = root.querySelector("[data-slider-next]");
    if (!viewport || !track) return;

    var originals = Array.prototype.slice.call(track.children);
    if (!originals.length) return;

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

    var loopDistance = 0;
    var resumeTimer = null;

    function measure() {
      var gap = parseFloat(window.getComputedStyle(track).gap) || 0;
      var distance = 0;
      originals.forEach(function (node, index) {
        distance += node.getBoundingClientRect().width;
        if (index < originals.length - 1) distance += gap;
      });
      distance += gap;
      loopDistance = distance;
      root.style.setProperty("--reviews-loop-distance", distance + "px");
      var seconds = Math.max(40, Math.round(distance / 28));
      root.style.setProperty("--reviews-marquee-duration", seconds + "s");
    }

    function currentTranslateX() {
      var style = window.getComputedStyle(track).transform;
      if (!style || style === "none") return 0;
      var m = style.match(/matrix\(([^)]+)\)/);
      if (!m) return 0;
      var parts = m[1].split(",");
      return parseFloat(parts[4]) || 0;
    }

    function wrapOffset(x) {
      if (!loopDistance) return x;
      while (x > 0) x -= loopDistance;
      while (x <= -loopDistance) x += loopDistance;
      return x;
    }

    function stepSize() {
      var gap = parseFloat(window.getComputedStyle(track).gap) || 0;
      var first = originals[0];
      return (first ? first.getBoundingClientRect().width : 0) + gap;
    }

    function enterManualMode() {
      root.classList.add("is-paused", "is-manual");
      track.style.animation = "none";
    }

    function resumeAuto() {
      window.clearTimeout(resumeTimer);
      resumeTimer = window.setTimeout(function () {
        if (prefersReducedMotion()) return;
        root.classList.remove("is-manual");
        track.style.animation = "";
        track.style.transform = "";
        root.classList.remove("is-paused");
      }, 4200);
    }

    function nudge(direction) {
      if (!loopDistance) measure();
      enterManualMode();
      var next = wrapOffset(currentTranslateX() + direction * stepSize());
      track.style.transform = "translate3d(" + next + "px,0,0)";
      resumeAuto();
    }

    measure();

    var resizeTimer = null;
    window.addEventListener("resize", function () {
      window.clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(measure, 120);
    });

    if (prevBtn) {
      prevBtn.addEventListener("click", function () {
        nudge(1);
      });
    }

    if (nextBtn) {
      nextBtn.addEventListener("click", function () {
        nudge(-1);
      });
    }

    if (prefersReducedMotion()) {
      root.classList.add("is-paused");
      return;
    }

    var dragging = false;
    var startX = 0;
    var baseOffset = 0;

    function onPointerDown(e) {
      if (e.pointerType === "mouse" && e.button !== 0) return;
      dragging = true;
      window.clearTimeout(resumeTimer);
      root.classList.add("is-paused", "is-manual");
      viewport.classList.add("is-dragging");
      startX = e.clientX;
      baseOffset = currentTranslateX();
      track.style.animation = "none";
      track.style.transform = "translate3d(" + baseOffset + "px,0,0)";
      try { viewport.setPointerCapture(e.pointerId); } catch (err) {}
    }

    function onPointerMove(e) {
      if (!dragging) return;
      var dragOffset = e.clientX - startX;
      track.style.transform = "translate3d(" + wrapOffset(baseOffset + dragOffset) + "px,0,0)";
    }

    function onPointerUp(e) {
      if (!dragging) return;
      dragging = false;
      viewport.classList.remove("is-dragging");
      try { viewport.releasePointerCapture(e.pointerId); } catch (err) {}
      resumeAuto();
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
      "PGhlYWQ+PHNjcmlwdCB0eXBlPSJ0ZXh0L2phdmFzY3JpcHQiPgogICAgd2luZG93Ll9fc2l6ZV9fPSdiaWcnOwogICAgd2luZG93Ll9fdGhlbWVfXz0nbGlnaHQnOwogICAgd2luZG93Ll9fYnJhbmNoSWRfXz0nNzAwMDAwMDEwNDEzNDg0MjInCiAgICB3aW5kb3cuX19vcmdJZF9fPSc3MDAwMDAwMTAzOTY0NDkxMicKICAgPC9zY3JpcHQ+PHNjcmlwdCBjcm9zc29yaWdpbj0iYW5vbnltb3VzIiB0eXBlPSJtb2R1bGUiIHNyYz0iaHR0cHM6Ly9kaXNrLjJnaXMuY29tL3dpZGdldC1jb25zdHJ1Y3Rvci9hc3NldHMvaWZyYW1lLmpzIj48L3NjcmlwdD48bGluayByZWw9Im1vZHVsZXByZWxvYWQiIGNyb3Nzb3JpZ2luPSJhbm9ueW1vdXMiIGhyZWY9Imh0dHBzOi8vZGlzay4yZ2lzLmNvbS93aWRnZXQtY29uc3RydWN0b3IvYXNzZXRzL2RlZmF1bHRzLmpzIj48L2xpbmsgcmVsPSJzdHlsZXNoZWV0IiBjcm9zc29yaWdpbj0iYW5vbnltb3VzIiBocmVmPSJodHRwczovL2Rpc2suMmdpcy5jb20vd2lkZ2V0LWNvbnN0cnVjdG9yL2Fzc2V0cy9kZWZhdWx0cy5jc3MiPjwvaGVhZD48Ym9keT48ZGl2IGlkPSJpZnJhbWUiPjwvZGl2PjwvYm9keT4=";
    try {
      iframe.contentWindow.document.open();
      iframe.contentWindow.document.write(decodeURIComponent(escape(atob(payload))));
      iframe.contentWindow.document.close();
    } catch (err) {
      // keep empty iframe shell; do not throw
    }
  }

  document.addEventListener("DOMContentLoaded", function () {
    initLightbox();
    document.querySelectorAll("[data-reviews-slider]").forEach(initSlider);
    initLazy2gis(document.getElementById("gis-reviews"));
  });
})();
