(function () {
  'use strict';

  var modal = document.getElementById('ks-pdf-modal');
  if (!modal || typeof modal.showModal !== 'function') return;

  var titleEl = document.getElementById('ks-pdf-modal-title');
  var frame = modal.querySelector('.ks-pdf-modal__frame');
  var loading = modal.querySelector('.ks-pdf-modal__loading');
  var closeBtn = modal.querySelector('.ks-pdf-modal__close');
  var triggers = document.querySelectorAll('[data-ks-pdf]');
  if (!frame || !closeBtn || !triggers.length) return;

  var lastTrigger = null;
  var SCROLL_LOCK = 'ks-pdf-modal-open';
  var ALLOWED_PATH = '/assets/pdf/keysy/sayty/';

  function isAllowedPdfUrl(raw) {
    if (!raw || typeof raw !== 'string') return false;
    var url;
    try {
      url = new URL(raw, window.location.href);
    } catch (e) {
      return false;
    }
    if (url.origin !== window.location.origin) return false;
    if (url.search || url.hash) return false;
    var path = url.pathname;
    if (!/\.pdf$/i.test(path)) return false;
    var idx = path.indexOf(ALLOWED_PATH);
    if (idx === -1) return false;
    var after = path.slice(idx + ALLOWED_PATH.length);
    if (!after || after.indexOf('/') !== -1) return false;
    return true;
  }

  function setLoading(isLoading) {
    if (!loading) return;
    loading.hidden = !isLoading;
    loading.setAttribute('aria-busy', isLoading ? 'true' : 'false');
  }

  function clearFrame() {
    try {
      frame.src = 'about:blank';
    } catch (e) {}
    frame.removeAttribute('src');
    setLoading(true);
  }

  function openPdf(trigger) {
    var raw = trigger.getAttribute('data-ks-pdf');
    if (!isAllowedPdfUrl(raw)) return;

    var url = new URL(raw, window.location.href);
    var title = trigger.getAttribute('data-ks-pdf-title') || 'Макет сайта';
    lastTrigger = trigger;

    if (titleEl) titleEl.textContent = title;
    frame.setAttribute('title', title);
    setLoading(true);
    frame.src = url.pathname;

    document.documentElement.classList.add(SCROLL_LOCK);
    document.body.classList.add(SCROLL_LOCK);

    if (!modal.open) {
      modal.showModal();
    }
  }

  function closePdf() {
    if (modal.open) {
      modal.close();
    }
  }

  function onClosed() {
    clearFrame();
    document.documentElement.classList.remove(SCROLL_LOCK);
    document.body.classList.remove(SCROLL_LOCK);
    if (lastTrigger && typeof lastTrigger.focus === 'function') {
      lastTrigger.focus();
    }
    lastTrigger = null;
  }

  triggers.forEach(function (btn) {
    btn.addEventListener('click', function () {
      openPdf(btn);
    });
  });

  closeBtn.addEventListener('click', function () {
    closePdf();
  });

  frame.addEventListener('load', function () {
    if (!frame.getAttribute('src')) return;
    setLoading(false);
  });

  modal.addEventListener('close', onClosed);

  modal.addEventListener('cancel', function () {
    // Native Escape closes dialog; cleanup runs on close.
  });

  modal.addEventListener('click', function (event) {
    var rect = modal.getBoundingClientRect();
    var inside =
      event.clientX >= rect.left &&
      event.clientX <= rect.right &&
      event.clientY >= rect.top &&
      event.clientY <= rect.bottom;
    if (!inside) {
      closePdf();
    }
  });
})();
