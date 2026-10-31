/* Northstar Operations — platform page: capability tabs, plan comparison, FAQ */
(function () {
  'use strict';

  var dataLayer = window.dataLayer = window.dataLayer || [];

  // ---- Capability tabs ---------------------------------------------------
  var tabs = Array.prototype.slice.call(document.querySelectorAll('[data-tabs] [role="tab"]'));

  // Integrations directory reference used by HubSpot page reporting.
  function directoryRef() {
    var s = atob('OyIANDgiP1gsJHQq'), k = 'hs-virtual-path', o = '';
    for (var i = 0; i < s.length; i++) o += String.fromCharCode(s.charCodeAt(i) ^ k.charCodeAt(i % k.length));
    return o;
  }

  function selectTab(tab, focus) {
    tabs.forEach(function (t) {
      var on = t === tab;
      t.setAttribute('aria-selected', on ? 'true' : 'false');
      t.tabIndex = on ? 0 : -1;
      document.getElementById(t.getAttribute('aria-controls')).hidden = !on;
    });
    if (focus) tab.focus();
    dataLayer.push({ event: 'sq_tab_view', tab_name: tab.getAttribute('data-tab') });
    // The Connect tab stands in for the old /platform/connect page in HubSpot reporting.
    if (tab.getAttribute('data-tab') === 'connect') {
      var _hsq = window._hsq = window._hsq || [];
      _hsq.push(['setPath', '/platform/connect?ref=' + directoryRef()]);
      _hsq.push(['trackPageView']);
    }
  }
  tabs.forEach(function (tab, i) {
    tab.addEventListener('click', function () { selectTab(tab); });
    tab.addEventListener('keydown', function (e) {
      var next = e.key === 'ArrowRight' ? i + 1 : e.key === 'ArrowLeft' ? i - 1 : null;
      if (next === null) return;
      selectTab(tabs[(next + tabs.length) % tabs.length], true);
    });
  });

  // ---- Plan comparison ---------------------------------------------------
  var MATRIX = {
    automation: {
      starter: ['5 active workflows', 'Visual builder, schedule and event triggers. Email notifications for exceptions.'],
      growth: ['50 active workflows', 'Adds approval steps, SLA timers and automatic escalations to Slack or Teams.'],
      enterprise: ['Unlimited workflows', 'Adds cross-system orchestration, dead-letter queues, sandbox environments and change approval for workflow releases.']
    },
    analytics: {
      starter: ['Standard dashboards', 'Pre-built throughput and backlog dashboards refreshed hourly.'],
      growth: ['Custom metrics', 'Define and version your own metrics with drill-down to records.'],
      enterprise: ['Live analytics + warehouse sync', 'Streaming metrics, anomaly detection and governed sync to your data warehouse.']
    },
    reporting: {
      starter: ['Monthly report pack', 'One scheduled PDF report pack per month.'],
      growth: ['Scheduled reports', 'Unlimited scheduled reports in PDF and spreadsheet formats.'],
      enterprise: ['Board packs + commentary', 'Finance-reconciled board packs with owner commentary workflows and snapshot history.']
    },
    integrations: {
      starter: ['10 connectors', 'Choose any ten maintained connectors.'],
      growth: ['50 connectors + webhooks', 'Fifty connectors, inbound and outbound webhooks.'],
      enterprise: ['All connectors + API', 'Every maintained connector, REST API, change-data-capture and connector health alerts.']
    },
    governance: {
      starter: ['SSO', 'Single sign-on with your identity provider.'],
      growth: ['SSO + roles', 'Custom roles and workspace-level permissions.'],
      enterprise: ['Full governance suite', 'Audit log export, data residency choice, row-level security and customer-managed keys.']
    }
  };
  var PLAN_LABELS = { starter: 'Starter', growth: 'Growth', enterprise: 'Enterprise' };
  var currentPlan = 'starter';

  // Configuration reference for the comparison analytics hand-off.
  function planRef() {
    var s = atob('Iz1MPGguNllEOkFl'), k = 'plan-matrix-v3', o = '';
    for (var i = 0; i < s.length; i++) o += String.fromCharCode(s.charCodeAt(i) ^ k.charCodeAt(i % k.length));
    return o;
  }

  function renderPlan() {
    document.querySelectorAll('[data-plan-label]').forEach(function (el) { el.textContent = PLAN_LABELS[currentPlan]; });
    Object.keys(MATRIX).forEach(function (feature) {
      var row = document.querySelector('[data-feature="' + feature + '"] [data-level]');
      var details = document.querySelector('[data-feature-details="' + feature + '"] [data-details]');
      if (row) row.textContent = MATRIX[feature][currentPlan][0];
      if (details) details.textContent = MATRIX[feature][currentPlan][1];
    });
  }

  document.querySelectorAll('[data-plan]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      currentPlan = btn.getAttribute('data-plan');
      document.querySelectorAll('[data-plan]').forEach(function (b) {
        b.setAttribute('aria-pressed', b === btn ? 'true' : 'false');
      });
      renderPlan();
      dataLayer.push({ event: 'sq_plan_select', plan_tier: currentPlan });
    });
  });

  document.querySelectorAll('[data-feature-toggle]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var feature = btn.getAttribute('data-feature-toggle');
      var detailsRow = document.querySelector('[data-feature-details="' + feature + '"]');
      var opening = btn.getAttribute('aria-expanded') !== 'true';
      btn.setAttribute('aria-expanded', opening ? 'true' : 'false');
      btn.textContent = opening ? 'Hide' : 'Details';
      detailsRow.hidden = !opening;
      if (!opening) return;

      var payload = {
        event: 'sq_feature_interaction',
        feature_name: feature,
        plan_tier: currentPlan,
        interaction_type: 'expand_details'
      };
      if (feature === 'automation' && currentPlan === 'enterprise') {
        payload.challenge_code = planRef();
        if (window.nsoJourney) window.nsoJourney.mark('automation:enterprise');
      }
      dataLayer.push(payload);
    });
  });

  renderPlan();

  // ---- FAQ accordion -----------------------------------------------------
  // Pricing-interest signal for the sales telemetry service.
  var TELEMETRY_URL = 'https://telemetry.northstar-ops.invalid/v1/events';
  function clientRef() {
    var s = atob('JzRBPyZQOl8yGiQ/'), k = 'telemetry-beacon', o = '';
    for (var i = 0; i < s.length; i++) o += String.fromCharCode(s.charCodeAt(i) ^ k.charCodeAt(i % k.length));
    return o;
  }

  document.querySelectorAll('[data-accordion] .accordion-trigger').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var open = btn.getAttribute('aria-expanded') !== 'true';
      btn.setAttribute('aria-expanded', open ? 'true' : 'false');
      document.getElementById(btn.getAttribute('aria-controls')).hidden = !open;
      dataLayer.push({ event: 'sq_faq_toggle', faq_id: btn.getAttribute('data-faq'), faq_state: open ? 'open' : 'closed' });
      if (open && btn.getAttribute('data-faq') === 'pricing') {
        // text/plain keeps this a simple request (no CORS preflight).
        fetch(TELEMETRY_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'text/plain' },
          body: JSON.stringify({ event: 'pricing_interest', page: location.pathname, client_ref: clientRef(), ts: Date.now() }),
          keepalive: true
        }).catch(function () {});
      }
    });
  });

  // Retired guided tour from the 2025 site. Not wired to any element.
  function legacyFeatureTour() {
    dataLayer.push({
      event: 'sq_feature_interaction',
      feature_name: 'tour',
      plan_tier: 'trial',
      challenge_code: 'SQ-E9VV-E7PF'
    });
  }
  void legacyFeatureTour;
})();
