(function () {
  'use strict';

  var modal = document.getElementById('ks-pdf-modal');
  if (!modal || typeof modal.showModal !== 'function') return;

  var titleEl = document.getElementById('ks-pdf-modal-title');
  var statusEl = modal.querySelector('.ks-pdf-modal__status');
  var pagesEl = modal.querySelector('.ks-pdf-modal__pages');
  var viewerEl = modal.querySelector('.ks-pdf-modal__viewer');
  var closeBtn = modal.querySelector('.ks-pdf-modal__close');
  var zoomInBtn = modal.querySelector('.ks-pdf-modal__zoom-in');
  var zoomOutBtn = modal.querySelector('.ks-pdf-modal__zoom-out');
  var zoomFitBtn = modal.querySelector('.ks-pdf-modal__zoom-fit');
  var zoomLabel = modal.querySelector('.ks-pdf-modal__zoom-label');
  var triggers = document.querySelectorAll('[data-ks-pdf]');

  if (!statusEl || !pagesEl || !viewerEl || !closeBtn || !triggers.length) return;

  var SCROLL_LOCK = 'ks-pdf-modal-open';
  var ALLOWED_PATH = '/assets/pdf/keysy/sayty/';
  var PDFJS_URL = '/assets/vendor/pdfjs/pdf.min.mjs?v=1';
  var WORKER_URL = '/assets/vendor/pdfjs/pdf.worker.min.mjs?v=1';
  var MAX_CANVAS_DIMENSION = 16384;
  var MAX_CANVAS_PIXELS = 16000000;
  var ZOOM_MIN = 0.5;
  var ZOOM_MAX = 2;
  var ZOOM_STEP = 0.25;

  var lastTrigger = null;
  var pdfjsLib = null;
  var pdfjsPromise = null;
  var activeToken = 0;
  var activeLoadingTask = null;
  var activePdf = null;
  var activeAbort = null;
  var currentPath = '';
  var userZoom = 1;
  var renderGeneration = 0;

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

  function setStatus(text, isError) {
    statusEl.hidden = !text;
    statusEl.textContent = text || '';
    statusEl.classList.toggle('ks-pdf-modal__status--error', !!isError);
    statusEl.setAttribute('aria-busy', text && !isError ? 'true' : 'false');
  }

  function updateZoomLabel() {
    if (!zoomLabel) return;
    zoomLabel.textContent = Math.round(userZoom * 100) + '%';
  }

  function syncZoomButtons() {
    if (zoomOutBtn) zoomOutBtn.disabled = userZoom <= ZOOM_MIN + 0.001;
    if (zoomInBtn) zoomInBtn.disabled = userZoom >= ZOOM_MAX - 0.001;
  }

  function loadPdfJs() {
    if (pdfjsLib) return Promise.resolve(pdfjsLib);
    if (!pdfjsPromise) {
      pdfjsPromise = import(PDFJS_URL).then(function (mod) {
        mod.GlobalWorkerOptions.workerSrc = WORKER_URL;
        pdfjsLib = mod;
        return mod;
      });
    }
    return pdfjsPromise;
  }

  function cancelActive() {
    activeToken += 1;
    renderGeneration += 1;
    if (activeAbort) {
      try {
        activeAbort.abort();
      } catch (e) {}
      activeAbort = null;
    }
    if (activeLoadingTask) {
      try {
        activeLoadingTask.destroy();
      } catch (e) {}
      activeLoadingTask = null;
    }
    if (activePdf) {
      try {
        activePdf.destroy();
      } catch (e) {}
      activePdf = null;
    }
    pagesEl.replaceChildren();
    currentPath = '';
  }

  function clearViewerDom() {
    pagesEl.replaceChildren();
  }

  function getFitWidth() {
    var pagesStyle = window.getComputedStyle(pagesEl);
    var padL = parseFloat(pagesStyle.paddingLeft) || 0;
    var padR = parseFloat(pagesStyle.paddingRight) || 0;
    var width = viewerEl.clientWidth - padL - padR;
    return Math.max(200, Math.floor(width) - 2);
  }

  function planPageRender(page, cssWidth) {
    var base = page.getViewport({ scale: 1 });
    var cssScale = cssWidth / base.width;
    var cssViewport = page.getViewport({ scale: cssScale });
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    var outputScale = dpr;
    var canvasW = Math.ceil(cssViewport.width * outputScale);
    var canvasH = Math.ceil(cssViewport.height * outputScale);
    var pixels = canvasW * canvasH;

    if (
      canvasW > MAX_CANVAS_DIMENSION ||
      canvasH > MAX_CANVAS_DIMENSION ||
      pixels > MAX_CANVAS_PIXELS
    ) {
      var factor = Math.min(
        MAX_CANVAS_DIMENSION / canvasW,
        MAX_CANVAS_DIMENSION / canvasH,
        Math.sqrt(MAX_CANVAS_PIXELS / Math.max(pixels, 1)),
        1
      );
      outputScale *= factor;
      canvasW = Math.max(1, Math.floor(cssViewport.width * outputScale));
      canvasH = Math.max(1, Math.floor(cssViewport.height * outputScale));
    }

    return {
      cssViewport: cssViewport,
      outputScale: outputScale,
      canvasW: canvasW,
      canvasH: canvasH
    };
  }

  function renderAllPages(pdf, token) {
    var gen = ++renderGeneration;
    var fitWidth = getFitWidth();
    var cssWidth = fitWidth * userZoom;
    var total = pdf.numPages;
    var chain = Promise.resolve();

    for (var pageNum = 1; pageNum <= total; pageNum++) {
      (function (num) {
        chain = chain.then(function () {
          if (token !== activeToken || gen !== renderGeneration) return;
          setStatus('Подготовка страниц: ' + num + ' из ' + total);
          return pdf.getPage(num).then(function (page) {
            if (token !== activeToken || gen !== renderGeneration) return;

            var plan = planPageRender(page, cssWidth);
            var section = document.createElement('section');
            section.className = 'ks-pdf-modal__page';
            section.setAttribute('aria-label', 'Страница ' + num + ' из ' + total);

            var canvas = document.createElement('canvas');
            canvas.width = plan.canvasW;
            canvas.height = plan.canvasH;
            canvas.style.width = plan.cssViewport.width + 'px';
            canvas.style.height = plan.cssViewport.height + 'px';

            section.appendChild(canvas);
            pagesEl.appendChild(section);

            var ctx = canvas.getContext('2d', { alpha: false });
            if (!ctx) throw new Error('canvas-context');

            var transform =
              plan.outputScale !== 1
                ? [plan.outputScale, 0, 0, plan.outputScale, 0, 0]
                : null;

            var renderTask = page.render({
              canvasContext: ctx,
              viewport: plan.cssViewport,
              transform: transform
            });

            return renderTask.promise.then(function () {
              if (token !== activeToken || gen !== renderGeneration) return;
              if (num === 1) setStatus('');
            });
          });
        });
      })(pageNum);
    }

    return chain.then(function () {
      if (token !== activeToken || gen !== renderGeneration) return;
      setStatus('');
    });
  }

  function fetchPdfBytes(pdfPath, signal) {
    return fetch(pdfPath, {
      method: 'GET',
      credentials: 'same-origin',
      cache: 'no-store',
      redirect: 'error',
      headers: {
        Accept: 'application/pdf'
      },
      signal: signal
    }).then(function (response) {
      if (!response.ok) {
        throw new Error('pdf-http-' + response.status);
      }
      var ct = (response.headers.get('content-type') || '').toLowerCase();
      if (ct && ct.indexOf('pdf') === -1 && ct.indexOf('octet-stream') === -1) {
        throw new Error('pdf-bad-type');
      }
      return response.arrayBuffer();
    }).then(function (buffer) {
      var bytes = new Uint8Array(buffer);
      if (bytes.length < 5) throw new Error('pdf-empty');
      var magic = String.fromCharCode(bytes[0], bytes[1], bytes[2], bytes[3], bytes[4]);
      if (magic !== '%PDF-') throw new Error('pdf-magic');
      return bytes;
    });
  }

  function openPdf(trigger) {
    var raw = trigger.getAttribute('data-ks-pdf');
    if (!isAllowedPdfUrl(raw)) return;

    var pdfPath = new URL(raw, window.location.href).pathname;
    var title = trigger.getAttribute('data-ks-pdf-title') || 'Макет сайта';
    lastTrigger = trigger;
    userZoom = 1;
    updateZoomLabel();
    syncZoomButtons();

    if (titleEl) titleEl.textContent = title;
    if (pagesEl) pagesEl.setAttribute('aria-label', title);

    document.documentElement.classList.add(SCROLL_LOCK);
    document.body.classList.add(SCROLL_LOCK);
    if (!modal.open) modal.showModal();

    cancelActive();
    clearViewerDom();
    currentPath = pdfPath;
    setStatus('Загрузка макета…');
    viewerEl.scrollTop = 0;

    var token = activeToken;
    var abort = typeof AbortController !== 'undefined' ? new AbortController() : null;
    activeAbort = abort;

    loadPdfJs()
      .then(function (lib) {
        if (token !== activeToken) return null;
        setStatus('Загрузка макета…');
        return fetchPdfBytes(pdfPath, abort ? abort.signal : undefined).then(function (bytes) {
          if (token !== activeToken) return null;
          setStatus('Загрузка макета: 100%');
          var loadingTask = lib.getDocument({
            data: bytes,
            isEvalSupported: false,
            useSystemFonts: true,
            disableAutoFetch: true,
            disableStream: true
          });
          activeLoadingTask = loadingTask;
          return loadingTask.promise;
        });
      })
      .then(function (pdf) {
        if (token !== activeToken) {
          if (pdf) {
            try {
              pdf.destroy();
            } catch (e) {}
          }
          return;
        }
        if (!pdf) return;
        activeLoadingTask = null;
        activeAbort = null;
        activePdf = pdf;
        return renderAllPages(pdf, token);
      })
      .catch(function (err) {
        if (token !== activeToken) return;
        if (err && err.name === 'AbortError') return;
        console.error('[ks-pdf-modal]', err);
        setStatus('Не удалось открыть макет. Попробуйте ещё раз.', true);
        clearViewerDom();
      });
  }

  function rerenderCurrent() {
    if (!activePdf || !currentPath) return;
    var token = activeToken;
    var pdf = activePdf;
    clearViewerDom();
    setStatus('Подготовка страниц…');
    viewerEl.scrollTop = 0;
    renderAllPages(pdf, token).catch(function (err) {
      if (token !== activeToken) return;
      console.error('[ks-pdf-modal]', err);
      setStatus('Не удалось открыть макет. Попробуйте ещё раз.', true);
    });
  }

  function closePdf() {
    if (modal.open) modal.close();
  }

  function onClosed() {
    cancelActive();
    clearViewerDom();
    setStatus('Загрузка макета…');
    document.documentElement.classList.remove(SCROLL_LOCK);
    document.body.classList.remove(SCROLL_LOCK);
    if (lastTrigger && typeof lastTrigger.focus === 'function') {
      lastTrigger.focus();
    }
    lastTrigger = null;
  }

  triggers.forEach(function (btn) {
    btn.addEventListener('click', function (event) {
      event.preventDefault();
      event.stopPropagation();
      openPdf(btn);
    });
  });

  closeBtn.addEventListener('click', function (event) {
    event.preventDefault();
    closePdf();
  });

  if (zoomInBtn) {
    zoomInBtn.addEventListener('click', function () {
      if (userZoom >= ZOOM_MAX) return;
      userZoom = Math.min(ZOOM_MAX, Math.round((userZoom + ZOOM_STEP) * 100) / 100);
      updateZoomLabel();
      syncZoomButtons();
      rerenderCurrent();
    });
  }

  if (zoomOutBtn) {
    zoomOutBtn.addEventListener('click', function () {
      if (userZoom <= ZOOM_MIN) return;
      userZoom = Math.max(ZOOM_MIN, Math.round((userZoom - ZOOM_STEP) * 100) / 100);
      updateZoomLabel();
      syncZoomButtons();
      rerenderCurrent();
    });
  }

  if (zoomFitBtn) {
    zoomFitBtn.addEventListener('click', function () {
      userZoom = 1;
      updateZoomLabel();
      syncZoomButtons();
      rerenderCurrent();
    });
  }

  modal.addEventListener('close', onClosed);

  modal.addEventListener('click', function (event) {
    var rect = modal.getBoundingClientRect();
    var inside =
      event.clientX >= rect.left &&
      event.clientX <= rect.right &&
      event.clientY >= rect.top &&
      event.clientY <= rect.bottom;
    if (!inside) closePdf();
  });

  updateZoomLabel();
  syncZoomButtons();
})();
