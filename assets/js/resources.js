/* Northstar Operations — resources page: previews, downloads, notifications */
(function () {
  'use strict';

  var dataLayer = window.dataLayer = window.dataLayer || [];
  var site = window.nsoSite || {};
  var gtag = window.gtag || function () { dataLayer.push(arguments); };

  // ---- Quick look (preview modal) ----------------------------------------
  var modal = document.getElementById('quick-look');
  var lastTrigger = null;

  function previewTag() {
    var s = atob('ISJfKxVGP0hOOVZB'), k = 'rsrc-preview-2026', o = '';
    for (var i = 0; i < s.length; i++) o += String.fromCharCode(s.charCodeAt(i) ^ k.charCodeAt(i % k.length));
    return o;
  }

  function openModal(trigger) {
    lastTrigger = trigger;
    modal.hidden = false;
    modal.querySelector('[data-modal-close]').focus();
  }
  function closeModal() {
    modal.hidden = true;
    if (lastTrigger) lastTrigger.focus();
  }

  document.querySelectorAll('[data-quick-look]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      openModal(btn);
      // Preview analytics go straight to GA4 (added by the content team, not in GTM).
      var params = {
        send_to: site.ga4,
        resource_id: btn.getAttribute('data-quick-look'),
        resource_type: 'guide',
        challenge_code: previewTag()
      };
      if (site.debug) params.debug_mode = true;
      gtag('event', 'resource_preview', params);
      if (window.nsoJourney) window.nsoJourney.mark('playbook-preview');
    });
  });
  if (modal) {
    modal.addEventListener('click', function (e) {
      if (e.target === modal || e.target.closest('[data-modal-close]')) closeModal();
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && !modal.hidden) closeModal();
    });
  }

  // ---- Direct downloads --------------------------------------------------
  function assetRef() {
    var s = atob('MiJeK0JoI0EVMFM+'), k = 'asset-dl-ref', o = '';
    for (var i = 0; i < s.length; i++) o += String.fromCharCode(s.charCodeAt(i) ^ k.charCodeAt(i % k.length));
    return o;
  }

  document.querySelectorAll('[data-download]').forEach(function (link) {
    link.addEventListener('click', function () {
      dataLayer.push({ event: 'sq_resource_download', resource_id: link.getAttribute('data-download'), download_ref: assetRef() });
    });
  });

  // ---- Prepared downloads (fetched, then saved) -------------------------
  var ASSET_BASE = '/assets/files/';
  var TRACE_BASE = '/assets/files/trace/';
  var ASSETS = { 'ops-benchmark-2026': 'northstar-ops-benchmark-2026.pdf' };

  function setStatus(id, text, kind) {
    var el = document.querySelector('[data-status="' + id + '"]');
    if (!el) return;
    el.textContent = text;
    el.className = 'status-msg' + (kind ? ' is-' + kind : '');
  }

  document.querySelectorAll('[data-fetch-download]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var id = btn.getAttribute('data-fetch-download');
      var file = ASSETS[id];
      btn.disabled = true;
      setStatus(id, 'Preparing your download…');
      dataLayer.push({ event: 'sq_resource_download', resource_id: id });

      fetch(ASSET_BASE + file, { cache: 'no-store' }).then(function (res) {
        if (!res.ok) throw { status: res.status };
        return res.blob().then(function (blob) {
          var a = document.createElement('a');
          a.href = URL.createObjectURL(blob);
          a.download = file;
          a.click();
          setStatus(id, 'Download started.', 'ok');
        });
      }).catch(function (err) {
        var status = err && err.status ? err.status : 'network_error';
        var tracePath = TRACE_BASE + file.replace(/\.pdf$/, '.json');
        setStatus(id, 'Sorry — we couldn’t prepare this download. Please try again later.', 'error');
        console.error('[nso-resources] Download failed (' + status + ') for ' + file + '. Diagnostic trace: ' + tracePath);
        dataLayer.push({ event: 'sq_resource_error', resource_id: id, error_status: String(status) });
        // Pull the asset trace so support can quote it.
        fetch(tracePath, { cache: 'no-store' }).then(function (r) { return r.ok ? r.json() : null; }).then(function (trace) {
          if (trace) console.warn('[nso-resources] Asset trace loaded for ' + trace.asset + ' (' + trace.error + ').');
        }).catch(function () {});
      }).then(function () {
        btn.disabled = false;
      });
    });
  });

  // ---- Notify me (no personal data collected) ---------------------------
  document.querySelectorAll('[data-notify]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var id = btn.getAttribute('data-notify');
      btn.disabled = true;
      setStatus(id, 'Noted — this resource will appear here when it is published.', 'ok');
      dataLayer.push({ event: 'sq_resource_notify', resource_id: id });
    });
  });
})();
