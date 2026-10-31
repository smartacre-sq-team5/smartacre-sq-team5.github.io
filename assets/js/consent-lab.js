/* Northstar Operations — Privacy Center / Consent Lab
 * Displays the visitor's HubSpot cookie choices and requests a diagnostic GA4 hit.
 * It never sets or changes consent: choices come only from the HubSpot banner,
 * and Google consent is updated only by the HubSpot CMP template in GTM. */
(function () {
  'use strict';

  var dataLayer = window.dataLayer = window.dataLayer || [];
  var _hsp = window._hsp = window._hsp || [];
  var statusEl = document.querySelector('[data-lab-status]');
  var CATEGORIES = { analytics: '1', advertisement: '2', functionality: '3' };

  function setStatus(text) { if (statusEl) statusEl.textContent = text; }

  function readPrefs() {
    var m = /(?:^|; )__hs_cookie_cat_pref=([^;]*)/.exec(document.cookie);
    if (!m) return null;
    var prefs = {};
    decodeURIComponent(m[1]).split('_').forEach(function (pair) {
      var parts = pair.split(':');
      if (parts.length === 2) prefs[parts[0]] = parts[1] === 'true';
    });
    return prefs;
  }

  function pill(state) {
    if (state === undefined) return '<span class="pill pill-unknown">Not set</span>';
    return state ? '<span class="pill pill-on">Allowed</span>' : '<span class="pill pill-off">Not allowed</span>';
  }

  function renderPrefs() {
    var prefs = readPrefs();
    Object.keys(CATEGORIES).forEach(function (name) {
      var cell = document.querySelector('[data-pref="' + name + '"]');
      if (cell) cell.innerHTML = pill(prefs ? prefs[CATEGORIES[name]] : undefined);
    });
  }

  // Show the most recent hubspot_consent_update pushed by the CMP template.
  var seen = 0;
  function watchUpdates() {
    for (; seen < dataLayer.length; seen++) {
      var item = dataLayer[seen];
      if (item && item.event === 'hubspot_consent_update') {
        var el = document.querySelector('[data-last-update]');
        el.classList.remove('muted');
        el.textContent = 'Analytics ' + (item.hubspot_consent_analytics ? 'allowed' : 'not allowed') +
          ', advertisement ' + (item.hubspot_consent_advertisement ? 'allowed' : 'not allowed') +
          ' — ' + new Date().toLocaleTimeString();
        renderPrefs();
      }
    }
  }

  document.querySelector('[data-open-banner]').addEventListener('click', function () {
    _hsp.push(['showBanner']);
    setStatus('Opening the HubSpot cookie banner… If nothing appears, check that HubSpot scripts are not blocked by an extension.');
  });

  document.querySelector('[data-send-ping]').addEventListener('click', function () {
    dataLayer.push({ event: 'sq_consent_lab_ping', lab_request_time: new Date().toISOString() });
    setStatus('Diagnostic hit requested at ' + new Date().toLocaleTimeString() + '. Look for consent_lab_ping in the Network panel.');
  });

  document.querySelector('[data-reset-consent]').addEventListener('click', function () {
    _hsp.push(['revokeCookieConsent']);
    setStatus('Consent withdrawn through HubSpot. Reloading…');
    setTimeout(function () { location.reload(); }, 900);
  });

  renderPrefs();
  watchUpdates();
  setInterval(watchUpdates, 500);
})();
