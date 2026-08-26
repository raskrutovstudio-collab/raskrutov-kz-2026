(function () {
  "use strict";

  var MOBILE_MQ = window.matchMedia("(max-width: 767px)");
  var gesture = {
    active: false,
    startX: 0,
    startY: 0,
    dragging: false,
    suppressClick: false,
    threshold: 12
  };

  function isMobile() {
    return MOBILE_MQ.matches;
  }

  function initLightbox() {
    var lightbox = document.querySelector("[data-reviews-lightbox]");
    if (!lightbox) return;

    var dialog = lightbox.querySelector(".reviews-lightbox__dialog");
    var img = lightbox.querySelector("[data-lightbox-img]");
    var backdrop = lightbox.querySelector(".reviews-lightbox__backdrop");
    var closeBtn = lightbox.querySelector(".reviews-lightbox__close");
    var lastFocus = null;
    var openStamp = 0;

    function openLightbox(src, alt) {
      if (!src || !img) return;
      lastFocus = document.activeElement;
      img.src = src;
      img.alt = alt || "Благодарственное письмо";
      lightbox.hidden = false;
      lightbox.setAttribute("aria-hidden", "false");
      document.body.classList.add("reviews-lightbox-open");
      openStamp = Date.now();
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

    document.addEventListener(
      "click",
      function (e) {
        if (lightbox.contains(e.target)) return;

        var trigger = e.target.closest("[data-letter-zoom]");
        if (!trigger) return;

        if (gesture.suppressClick) {
          e.preventDefault();
          return;
        }

        e.preventDefault();
        e.stopPropagation();

        var thumb = trigger.querySelector("img");
        var fullSrc =
          trigger.getAttribute("data-full") ||
          trigger.getAttribute("href") ||
          (thumb ? thumb.currentSrc || thumb.src : "");

        if (!fullSrc) return;

        var alt = thumb ? thumb.getAttribute("alt") : "";
        if (!alt) {
          var slide = trigger.closest(".reviews-slide");
          var caption = slide ? slide.querySelector("figcaption") : null;
          alt = caption ? caption.childNodes[0].textContent.trim() : "";
        }

        openLightbox(fullSrc, alt);
      },
      true
    );

    if (backdrop) {
      backdrop.addEventListener("click", function (e) {
        if (Date.now() - openStamp < 120) return;
        e.preventDefault();
        closeLightbox();
      });
    }

    if (closeBtn) {
      closeBtn.addEventListener("click", function (e) {
        e.preventDefault();
        closeLightbox();
      });
    }

    document.addEventListener("keydown", function (e) {
      if (lightbox.hidden) return;
      if (e.key === "Escape") {
        e.preventDefault();
        closeLightbox();
      }
      if (e.key === "Tab" && dialog) {
        var focusable = dialog.querySelectorAll(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
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

  function activateLazyMedia(slide) {
    slide.querySelectorAll("source[data-lazy-srcset]").forEach(function (source) {
      if (!source.getAttribute("srcset")) {
        source.setAttribute("srcset", source.getAttribute("data-lazy-srcset"));
      }
    });
    slide.querySelectorAll("img[data-lazy-src]").forEach(function (imgEl) {
      if (!imgEl.getAttribute("src")) {
        imgEl.setAttribute("src", imgEl.getAttribute("data-lazy-src"));
      }
    });
  }

  function initLetterLazy(root, originals) {
    if (!isMobile() || !("IntersectionObserver" in window)) return;

    originals.forEach(function (slide, index) {
      if (index < 2) return;

      var picture = slide.querySelector("picture");
      var source = slide.querySelector("source[media*='767px']");
      var img = slide.querySelector("img");

      if (source && source.getAttribute("srcset")) {
        source.setAttribute("data-lazy-srcset", source.getAttribute("srcset"));
        source.removeAttribute("srcset");
      }

      if (img && img.getAttribute("src")) {
        img.setAttribute("data-lazy-src", img.getAttribute("src"));
        img.removeAttribute("src");
        img.removeAttribute("srcset");
      }

      if (picture) {
        picture.classList.add("is-lazy-pending");
      }
    });

    var viewport = root.querySelector("[data-slider-viewport]");
    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          activateLazyMedia(entry.target);
          entry.target.querySelectorAll(".is-lazy-pending").forEach(function (node) {
            node.classList.remove("is-lazy-pending");
          });
          observer.unobserve(entry.target);
        });
      },
      {
        root: viewport,
        rootMargin: "120px 0px",
        threshold: 0.01
      }
    );

    originals.forEach(function (slide, index) {
      if (index >= 2) observer.observe(slide);
    });
  }

  function initSlider(root) {
    var viewport = root.querySelector("[data-slider-viewport]");
    var track = root.querySelector("[data-slider-track]");
    var prevBtn = root.querySelector("[data-slider-prev]");
    var nextBtn = root.querySelector("[data-slider-next]");
    if (!viewport || !track) return;

    root.classList.add("is-paused");

    var originals = Array.prototype.slice.call(track.children);
    if (!originals.length) return;

    var mobileMode = isMobile();
    var loopDistance = 0;
    var dragStartX = 0;
    var baseOffset = 0;
    var currentIndex = 0;

    if (!mobileMode) {
      originals.forEach(function (node) {
        var clone = node.cloneNode(true);
        clone.setAttribute("aria-hidden", "true");
        clone.querySelectorAll("button, input, textarea").forEach(function (el) {
          el.setAttribute("tabindex", "-1");
          el.setAttribute("aria-hidden", "true");
        });
        clone.querySelectorAll("[data-letter-zoom]").forEach(function (el) {
          el.setAttribute("tabindex", "-1");
        });
        clone.querySelectorAll("img").forEach(function (imgEl) {
          imgEl.setAttribute("alt", "");
          imgEl.setAttribute("loading", "lazy");
        });
        track.appendChild(clone);
      });
    }

    initLetterLazy(root, originals);

    function measure() {
      var gap = parseFloat(window.getComputedStyle(track).gap) || 0;
      var distance = 0;
      originals.forEach(function (node, index) {
        distance += node.getBoundingClientRect().width;
        if (index < originals.length - 1) distance += gap;
      });
      if (!mobileMode) {
        distance += gap;
      }
      loopDistance = distance;
      root.style.setProperty("--reviews-loop-distance", distance + "px");
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
      if (!loopDistance || mobileMode) return x;
      while (x > 0) x -= loopDistance;
      while (x <= -loopDistance) x += loopDistance;
      return x;
    }

    function stepSize() {
      var gap = parseFloat(window.getComputedStyle(track).gap) || 0;
      var first = originals[0];
      return (first ? first.getBoundingClientRect().width : 0) + gap;
    }

    function offsetForIndex(index) {
      var gap = parseFloat(window.getComputedStyle(track).gap) || 0;
      var offset = 0;
      for (var i = 0; i < index; i += 1) {
        offset += originals[i].getBoundingClientRect().width + gap;
      }
      return -offset;
    }

    function applyOffset(x) {
      track.style.transform = "translate3d(" + x + "px,0,0)";
    }

    function setManualOffset(x) {
      root.classList.add("is-manual");
      track.style.animation = "none";
      applyOffset(x);
    }

    function clampIndex(index) {
      if (!originals.length) return 0;
      if (index < 0) return originals.length - 1;
      if (index >= originals.length) return 0;
      return index;
    }

    function goToIndex(index) {
      currentIndex = clampIndex(index);
      setManualOffset(mobileMode ? offsetForIndex(currentIndex) : wrapOffset(offsetForIndex(currentIndex)));
      activateLazyMedia(originals[currentIndex]);
      var prevSlide = originals[clampIndex(currentIndex - 1)];
      var nextSlide = originals[clampIndex(currentIndex + 1)];
      if (prevSlide) activateLazyMedia(prevSlide);
      if (nextSlide) activateLazyMedia(nextSlide);
    }

    function nudge(direction) {
      measure();
      if (mobileMode) {
        goToIndex(currentIndex + (direction < 0 ? 1 : -1));
        return;
      }
      var next = wrapOffset(currentTranslateX() + direction * stepSize());
      setManualOffset(next);
    }

    measure();
    if (mobileMode) {
      goToIndex(0);
    }

    var resizeTimer = null;
    window.addEventListener("resize", function () {
      window.clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(function () {
        measure();
        if (mobileMode) {
          goToIndex(currentIndex);
        }
      }, 120);
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

    function onPointerDown(e) {
      if (e.pointerType === "mouse" && e.button !== 0) return;
      if (!viewport.contains(e.target)) return;

      gesture.active = true;
      gesture.startX = e.clientX;
      gesture.startY = e.clientY;
      gesture.dragging = false;
      gesture.suppressClick = false;
      dragStartX = e.clientX;
      baseOffset = mobileMode ? offsetForIndex(currentIndex) : currentTranslateX();
    }

    function onPointerMove(e) {
      if (!gesture.active) return;

      var dx = e.clientX - gesture.startX;
      var dy = e.clientY - gesture.startY;

      if (!gesture.dragging) {
        if (Math.abs(dx) <= gesture.threshold && Math.abs(dy) <= gesture.threshold) return;

        gesture.dragging = true;
        gesture.suppressClick = true;
        viewport.classList.add("is-dragging");
        track.style.animation = "none";
        track.style.transform = "translate3d(" + baseOffset + "px,0,0)";
        try {
          viewport.setPointerCapture(e.pointerId);
        } catch (err) {}
      }

      var dragOffset = e.clientX - dragStartX;
      var nextOffset = mobileMode ? baseOffset + dragOffset : wrapOffset(baseOffset + dragOffset);
      applyOffset(nextOffset);
    }

    function endPointer(e) {
      if (!gesture.active) return;

      var wasDrag = gesture.dragging;
      gesture.active = false;
      gesture.dragging = false;
      viewport.classList.remove("is-dragging");

      try {
        viewport.releasePointerCapture(e.pointerId);
      } catch (err) {}

      if (wasDrag) {
        if (mobileMode) {
          var dx = e.clientX - dragStartX;
          if (Math.abs(dx) >= stepSize() * 0.2) {
            goToIndex(currentIndex + (dx < 0 ? 1 : -1));
          } else {
            goToIndex(currentIndex);
          }
        }
        window.setTimeout(function () {
          gesture.suppressClick = false;
        }, 0);
      } else {
        gesture.suppressClick = false;
      }
    }

    viewport.addEventListener("pointerdown", onPointerDown, { passive: true });
    viewport.addEventListener("pointermove", onPointerMove, { passive: true });
    viewport.addEventListener("pointerup", endPointer);
    viewport.addEventListener("pointercancel", endPointer);
  }

  function mount2gisWidget(widget) {
    if (widget.getAttribute("data-2gis-mounted") === "true") return;
    var frameId = widget.getAttribute("data-2gis-id");
    var payload = widget.getAttribute("data-2gis-payload");
    var frame = frameId ? document.getElementById(frameId) : null;
    if (!frame || !payload) return;
    frame.contentWindow.document.open();
    frame.contentWindow.document.write(decodeURIComponent(escape(window.atob(payload))));
    frame.contentWindow.document.close();
    widget.setAttribute("data-2gis-mounted", "true");
  }

  function init2gisWidget() {
    var widget = document.querySelector("[data-deferred-2gis]");
    if (!widget) return;

    if (!isMobile()) {
      mount2gisWidget(widget);
      return;
    }

    if (!("IntersectionObserver" in window)) {
      mount2gisWidget(widget);
      return;
    }

    var observer = new IntersectionObserver(
      function (entries, obs) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          mount2gisWidget(widget);
          obs.disconnect();
        });
      },
      { root: null, rootMargin: "220px 0px", threshold: 0.01 }
    );

    observer.observe(widget);
  }

  function loadGoogleWidget() {
    if (document.querySelector('script[data-reviews-google-platform="true"]')) return;
    var script = document.createElement("script");
    script.src = "https://elfsightcdn.com/platform.js";
    script.async = true;
    script.setAttribute("data-reviews-google-platform", "true");
    document.head.appendChild(script);
  }

  function initGoogleWidget() {
    var section = document.getElementById("google-reviews");
    if (!section) return;

    if (!isMobile()) {
      loadGoogleWidget();
      return;
    }

    if (!("IntersectionObserver" in window)) {
      loadGoogleWidget();
      return;
    }

    var observer = new IntersectionObserver(
      function (entries, obs) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          loadGoogleWidget();
          obs.disconnect();
        });
      },
      { root: null, rootMargin: "220px 0px", threshold: 0.01 }
    );

    observer.observe(section);
  }

  document.addEventListener("DOMContentLoaded", function () {
    initLightbox();
    document.querySelectorAll("[data-reviews-slider]").forEach(initSlider);
    init2gisWidget();
    initGoogleWidget();
  });
})();
