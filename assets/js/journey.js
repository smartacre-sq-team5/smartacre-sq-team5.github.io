/* Northstar Operations — visitor journey state.
 *   nso_vj:  campaign landing → research → demo request
 *   nso_vj2: newsletter landing → playbook preview → consultation request */
(function () {
  'use strict';

  var STORE = 'nso_vj';
  var CAMPAIGN = { source: 'summit-partner', medium: 'email', campaign: 'ops-summit-2026' };
  var REQUIRED_PAGES = ["/solutions/","/platform/"];
  var REQUIRED_INTERACTION = 'automation:enterprise';
  var REQUIRED_FORM = 'demo-request-form';
  var SEALED = 'ICRAXi5MaV1TISE0';

  var LEAD_STORE = 'nso_vj2';
  var LEAD = { source: 'customer-newsletter', medium: 'email', campaign: 'q1-renewal' };
  var LEAD_INTERACTION = 'playbook-preview';
  var LEAD_FORM = 'consult-request-form';
  var LEAD_TOPIC = 'business-case';
  var LEAD_SEALED = 'MCReNylbIV8ZJSNB';

  function load(key) {
    try { return JSON.parse(localStorage.getItem(key)) || null; } catch (e) { return null; }
  }
  function save(key, state) {
    try { localStorage.setItem(key, JSON.stringify(state)); } catch (e) {}
  }
  // Reads the URL as it was on landing (the attribution script may already have removed a #fragment).
  function param(name) {
    var url = window.nsoLanding !== undefined ? window.nsoLanding : location.search + location.hash;
    var m = new RegExp('[?&#]' + name + '=([^&#]*)').exec(url);
    return m ? decodeURIComponent(m[1]) : '';
  }
  function cookie(name) {
    var m = new RegExp('(?:^|; )' + name + '=([^;]*)').exec(document.cookie);
    return m ? decodeURIComponent(m[1]) : '';
  }
  function path() {
    var p = location.pathname;
    return p.charAt(p.length - 1) === '/' ? p : p + '/';
  }

  // Landing with the campaign starts (or restarts) the journey.
  var state = load(STORE);
  if (param('utm_campaign') === CAMPAIGN.campaign) {
    state = { v: 1, started: Date.now(), pages: [], interactions: [] };
  }
  if (state) {
    if (state.pages.indexOf(path()) === -1) state.pages.push(path());
    save(STORE, state);
  }

  // Landing from the newsletter starts (or restarts) the lead journey.
  if (param('utm_source') === LEAD.source) {
    save(LEAD_STORE, { v: 1, started: Date.now(), interactions: [] });
  }

  function referral() {
    try { return JSON.parse(cookie('smartacre_referral')) || {}; } catch (e) { return {}; }
  }

  function unseal(sealed, key) {
    var s = atob(sealed), o = '';
    for (var i = 0; i < s.length; i++) o += String.fromCharCode(s.charCodeAt(i) ^ key.charCodeAt(i % key.length));
    return o;
  }

  window.nsoJourney = {
    mark: function (value) {
      [STORE, LEAD_STORE].forEach(function (key) {
        var s = load(key);
        if (!s) return;
        if (s.interactions.indexOf(value) === -1) s.interactions.push(value);
        save(key, s);
      });
    },
    // Called on demo form submit. Returns { complete, passed, code }.
    evaluate: function (formId) {
      var s = load(STORE);
      var ref = referral();
      var checks = [
        ref.source === CAMPAIGN.source && ref.medium === CAMPAIGN.medium && ref.campaign === CAMPAIGN.campaign,
        /(^|_)1:true(_|$)/.test(cookie('__hs_cookie_cat_pref')),
        !!s && REQUIRED_PAGES.every(function (p) { return s.pages.indexOf(p) !== -1; }),
        !!s && s.interactions.indexOf(REQUIRED_INTERACTION) !== -1
      ];
      var passed = checks.filter(Boolean).length;
      var complete = passed === checks.length && formId === REQUIRED_FORM;
      var result = { complete: complete, passed: passed, total: checks.length };
      if (complete) {
        result.code = unseal(SEALED, [ref.source, ref.medium, ref.campaign, REQUIRED_INTERACTION, formId].join('|'));
      }
      return result;
    },
    // Called on consultation submit. Returns { qualified, code }.
    evaluateLead: function (formId, topic) {
      var s = load(LEAD_STORE);
      var ref = referral();
      var prefs = cookie('__hs_cookie_cat_pref');
      var qualified =
        ref.source === LEAD.source && ref.medium === LEAD.medium && ref.campaign === LEAD.campaign &&
        /(^|_)1:true(_|$)/.test(prefs) && /(^|_)2:false(_|$)/.test(prefs) &&
        !!s && s.interactions.indexOf(LEAD_INTERACTION) !== -1 &&
        formId === LEAD_FORM && topic === LEAD_TOPIC;
      var result = { qualified: qualified };
      if (qualified) {
        result.code = unseal(LEAD_SEALED, [ref.source, ref.medium, ref.campaign, LEAD_INTERACTION, formId, topic].join('|'));
      }
      return result;
    }
  };
})();
