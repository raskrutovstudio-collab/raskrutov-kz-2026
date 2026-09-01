/**
 * Project-owned replacement for Mottor public.bundle UI runtime.
 * Keeps legacy constructor markup interactive without lpmotor.ru / public.bundle.js.
 */
(function () {
  "use strict";

  if (window.__rkLegacyPageUi) return;
  window.__rkLegacyPageUi = true;

  // Neutralize Mottor remote base; forms use lead-forms.js → Supabase.
  if (typeof window.serviceBaseUrl === "undefined" || /lpmotor\.ru/i.test(String(window.serviceBaseUrl || ""))) {
    window.serviceBaseUrl = "";
  }

  function $(sel, root) {
    return (root || document).querySelector(sel);
  }
  function $all(sel, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(sel));
  }

  function closest(el, sel) {
    while (el && el.nodeType === 1) {
      if (el.matches && el.matches(sel)) return el;
      el = el.parentElement;
    }
    return null;
  }

  /* ---------- Popups ---------- */
  function showSectionPopup(id) {
    var popup = document.getElementById(id);
    if (!popup) return;
    popup.classList.add("open");
    document.body.classList.add("open_popup");
    document.documentElement.classList.add("open_popup");
  }

  function hideSectionPopup(id) {
    if (id) {
      var popup = document.getElementById(id);
      if (popup) popup.classList.remove("open");
    } else {
      $all(".section_popup.open").forEach(function (el) {
        el.classList.remove("open");
      });
    }
    if (!$(".section_popup.open")) {
      document.body.classList.remove("open_popup");
      document.documentElement.classList.remove("open_popup");
    }
  }

  window.showSectionPopup = showSectionPopup;
  window.hideSectionPopup = hideSectionPopup;

  /* ---------- Mobile menu ---------- */
  function menuRoot(blockId) {
    return document.getElementById(blockId) || closest(document.activeElement, ".ms-menu, .blk_ms") || document;
  }

  function showMobileMenu(blockId) {
    var root = menuRoot(blockId);
    var wrap = $(".ms-menu__items-wrapper", root) || $(".ms-menu__items", root);
    var btn = $(".ms-menu__button-wrapper", root);
    if (wrap) {
      wrap.classList.add("rk-legacy-menu-open");
      wrap.style.display = "block";
      wrap.style.visibility = "visible";
      wrap.style.opacity = "1";
      wrap.style.pointerEvents = "auto";
      wrap.style.zIndex = "10000";
    }
    if (btn) btn.classList.add("rk-legacy-menu-open");
    document.body.classList.add("rk-legacy-menu-open");
    document.documentElement.classList.add("rk-legacy-menu-open");
  }

  function hideMobileMenu(blockId) {
    var root = blockId ? menuRoot(blockId) : document;
    var scopes = blockId ? [root] : $all(".ms-menu, .blk_ms, body");
    scopes.forEach(function (scope) {
      $all(".ms-menu__items-wrapper, .ms-menu__items", scope).forEach(function (wrap) {
        wrap.classList.remove("rk-legacy-menu-open");
        // leave display to CSS/media unless we forced it
        if (wrap.style.display === "block") wrap.style.display = "";
        wrap.style.visibility = "";
        wrap.style.opacity = "";
        wrap.style.pointerEvents = "";
        wrap.style.zIndex = "";
      });
      $all(".ms-menu__button-wrapper", scope).forEach(function (btn) {
        btn.classList.remove("rk-legacy-menu-open");
      });
    });
    document.body.classList.remove("rk-legacy-menu-open");
    document.documentElement.classList.remove("rk-legacy-menu-open");
  }

  function showMenu(blockId, ev) {
    var t = ev && ev.currentTarget ? ev.currentTarget : null;
    var item = t ? closest(t, ".ms-menu__item, .ms-submenu__item, [class*='ms-menu__item']") : null;
    if (!item) return;
    var sub = item.querySelector(".ms-submenu, .ms-next-submenu, .ms-menu__submenu");
    if (sub) {
      sub.style.display = sub.style.display === "block" ? "none" : "block";
      item.classList.toggle("rk-legacy-submenu-open");
    }
  }

  /* ---------- Spoilers / accordion ---------- */
  function spoilerHandler(blockId, index) {
    var root = document.getElementById(blockId);
    if (!root) return;
    var items = $all(".b-spoiler", root);
    var item = items[index];
    if (!item) {
      item = $(".b-spoiler" + index, root) || $(".b-spoiler--" + index, root);
    }
    if (!item) return;
    var content = $(".b-spoiler__content-wrapper", item);
    if (!content) return;
    var open = content.style.display === "block" || content.classList.contains("rk-legacy-open");
    // close siblings in same group
    items.forEach(function (sib) {
      var c = $(".b-spoiler__content-wrapper", sib);
      if (!c) return;
      c.style.display = "none";
      c.classList.remove("rk-legacy-open");
      sib.classList.remove("rk-legacy-open");
    });
    if (!open) {
      content.style.display = "block";
      content.classList.add("rk-legacy-open");
      item.classList.add("rk-legacy-open");
    }
  }

  /* ---------- Tabs ---------- */
  function changeTab(blockId, index) {
    var root = document.getElementById(blockId);
    if (!root) return;
    var tabs = $all(".section__tab-item", root);
    var panels = $all(".section__tab-content, .section__tab-panel, [class*='section__tab-content']", root);
    // Mottor often uses sibling sections toggled by index via data / classes
    tabs.forEach(function (tab, i) {
      if (i === index) tab.classList.add("section__tab-item--active", "rk-legacy-tab-active");
      else tab.classList.remove("section__tab-item--active", "rk-legacy-tab-active");
    });
    // Prefer explicit panels inside root
    if (panels.length) {
      panels.forEach(function (p, i) {
        p.style.display = i === index ? "" : "none";
      });
      return;
    }
    // FAQ pattern: tab switches visibility of following FAQ section blocks linked by order
    var list = closest(root, ".blk_section") || root;
    var section = closest(root, ".blk_section");
    if (!section) return;
    var siblings = [];
    var node = section.nextElementSibling;
    while (node && siblings.length < tabs.length) {
      if (node.classList && node.classList.contains("blk_section") && !node.classList.contains("section_popup")) {
        siblings.push(node);
      }
      node = node.nextElementSibling;
    }
    if (siblings.length >= tabs.length) {
      siblings.forEach(function (sec, i) {
        sec.style.display = i === index ? "" : "none";
      });
    }
  }

  /* ---------- Links / scroll ---------- */
  function linkRedirect(ev, blockId) {
    var t = ev && (ev.currentTarget || ev.target);
    var host = t ? closest(t, "[data-page-link], a[href]") : null;
    if (!host) host = document.getElementById(blockId);
    var href =
      (host && host.getAttribute("data-page-link")) ||
      (host && host.tagName === "A" && host.getAttribute("href")) ||
      "";
    if (!href || href === "#" || href === "javascript:void(0)") return false;
    if (/^https?:\/\//i.test(href) || href.startsWith("mailto:") || href.startsWith("tel:")) {
      window.location.href = href;
      return false;
    }
    window.location.href = href;
    return false;
  }

  function scrollToTarget(ev) {
    var t = ev && (ev.currentTarget || ev.target);
    var href = t && (t.getAttribute("href") || t.getAttribute("data-page-link") || "");
    if (href && href.charAt(0) === "#") {
      var el = document.getElementById(href.slice(1));
      if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
      return false;
    }
    return true;
  }

  function showPopup(blockId, ev) {
    // Common Mottor pattern: CTA opens fixed popup section
    var known = document.querySelector(".section_popup");
    if (known) {
      showSectionPopup(known.id);
      return false;
    }
    // fallback: data-popup-id
    var t = ev && (ev.currentTarget || ev.target);
    var id = t && t.getAttribute("data-popup-id");
    if (id) showSectionPopup(id);
    return false;
  }

  /* ---------- Adapter stubs (mobile text / visibility) ---------- */
  var adapterState = { data: null, hybrid: null };

  function viewportKey() {
    var w = window.innerWidth || document.documentElement.clientWidth || 1024;
    if (w <= 500) return "mobile370";
    if (w <= 900) return "tablet";
    return "pc";
  }

  function applyHiddenFlags(map) {
    if (!map) return;
    Object.keys(map).forEach(function (id) {
      var cfg = map[id];
      var el = document.getElementById(id);
      if (!el || !cfg) return;
      if (typeof cfg.is_hidden !== "undefined") {
        el.style.display = cfg.is_hidden ? "none" : "";
      }
      if (typeof cfg.body === "string") {
        var textHost =
          el.querySelector(".blk-data, .ms-active-string, .b-spoiler__text, .m-text") || el;
        // Only replace when this looks like a plain text block
        if (textHost && textHost.children.length <= 2) {
          var target = textHost.querySelector(".ms-active-string") || textHost;
          if (target && !target.querySelector("img, form, input, textarea, button")) {
            target.innerHTML = cfg.body;
          }
        }
      }
    });
  }

  function applyAdapter() {
    var key = viewportKey();
    if (adapterState.data && adapterState.data[key]) applyHiddenFlags(adapterState.data[key]);
    if (adapterState.hybrid && adapterState.hybrid[key]) {
      // hybrid uses id → geometry; treat missing visibility as show
      Object.keys(adapterState.hybrid[key]).forEach(function (id) {
        var el = document.getElementById(id);
        var cfg = adapterState.hybrid[key][id];
        if (!el || !cfg) return;
        if (typeof cfg.is_visible !== "undefined") {
          el.style.display = cfg.is_visible ? "" : "none";
        }
      });
    }
  }

  window.adapterManager = {
    setData: function (data) {
      adapterState.data = data || null;
      applyAdapter();
    },
    setHybridData: function (data) {
      adapterState.hybrid = data || null;
      applyAdapter();
    },
    apply: applyAdapter,
  };

  window.FE = window.FE || {
    runOnObjectReady: function (name, cb) {
      try {
        if (typeof cb === "function") cb();
      } catch (e) {}
    },
  };

  /* ---------- msJsWrapper dispatcher ---------- */
  window.msJsWrapper = function (event, blockId, action) {
    try {
      if (event && typeof event.preventDefault === "function") {
        // prevent only for UI actions that manage navigation themselves
      }
      var act = String(action || "");
      var base = act.replace(/\(.*\)$/, "");
      var argMatch = act.match(/\((.*)\)/);
      var argRaw = argMatch ? argMatch[1] : "";
      var argNum = argRaw === "" ? null : Number(argRaw);

      switch (base) {
        case "showMobileMenu":
          showMobileMenu(blockId);
          return false;
        case "hideMobileMenu":
          hideMobileMenu(blockId);
          return true; // allow link navigation
        case "showMenu":
          showMenu(blockId, event);
          return false;
        case "spoilerHandler":
          spoilerHandler(blockId, argNum || 0);
          return false;
        case "changeTab":
          changeTab(blockId, argNum || 0);
          return false;
        case "linkRedirect":
          return linkRedirect(event, blockId);
        case "showPopup":
          return showPopup(blockId, event);
        case "scrollTo":
        case "sectionScroll":
          return scrollToTarget(event);
        case "showImgNotice":
        case "hideImgNotice":
        case "reachGoals":
        case "itemClickGoals":
        case "sendGoals":
        case "onPhoneFocus":
        case "onPhoneBlur":
        case "socialsLinkClickHandler":
          return true;
        default:
          return true;
      }
    } catch (e) {
      console.warn("[legacy-page-ui]", e);
      return true;
    }
  };

  // Close popup on overlay click / Escape
  document.addEventListener("keydown", function (ev) {
    if (ev.key === "Escape") {
      hideSectionPopup();
      hideMobileMenu();
    }
  });

  document.addEventListener(
    "click",
    function (ev) {
      var t = ev.target;
      if (!t) return;
      if (t.classList && t.classList.contains("section_popup") && t.classList.contains("open")) {
        // click on overlay backdrop (not inner window)
        if (t === ev.target) hideSectionPopup(t.id);
      }
    },
    true
  );

  // Re-apply adapter on resize
  var resizeT;
  window.addEventListener("resize", function () {
    clearTimeout(resizeT);
    resizeT = setTimeout(applyAdapter, 150);
  });

  // Minimal CSS helpers for mobile menu when Mottor CSS expects JS state
  var style = document.createElement("style");
  style.setAttribute("data-rk-legacy-page-ui", "1");
  style.textContent =
    "body.rk-legacy-menu-open{overflow:hidden;}" +
    "@media (max-width:900px){" +
    ".ms-menu__button-wrapper.rk-legacy-menu-open + .ms-menu__items-wrapper," +
    ".ms-menu__items-wrapper.rk-legacy-menu-open{display:block!important;position:fixed;inset:0;background:#fff;z-index:10000;overflow:auto;padding:24px;}" +
    "}";
  document.head.appendChild(style);

  // Init tabs: show first panel groups if present
  function initTabs() {
    $all(".section__tab-list, .section__tab-container").forEach(function (list) {
      var root = closest(list, "[id]") || list;
      var id = root.id;
      if (id) changeTab(id, 0);
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function () {
      applyAdapter();
      initTabs();
    });
  } else {
    applyAdapter();
    initTabs();
  }
})();
