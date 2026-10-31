/* Northstar Operations — demo and consultation request forms */
(function () {
  'use strict';

  var dataLayer = window.dataLayer = window.dataLayer || [];
  var site = window.nsoSite || {};
  var gtag = window.gtag || function () { dataLayer.push(arguments); };

  function validate(form) {
    var ok = true;
    form.querySelectorAll('[required]').forEach(function (field) {
      var valid = field.type === 'checkbox' ? field.checked : !!field.value;
      field.setAttribute('aria-invalid', valid ? 'false' : 'true');
      if (!valid) ok = false;
    });
    form.querySelector('[data-form-error]').hidden = ok;
    return ok;
  }

  function showSuccess(form) {
    form.hidden = true;
    form.parentNode.querySelector('[data-form-success]').hidden = false;
  }

  function choice(form, name) {
    var field = form.elements[name];
    return field ? field.value : '';
  }

  // Legacy conversion pixel from the pre-GTM site, still inlined on the demo form.
  function legacyLeadRef() {
    var s = atob('PzRKNCZLHkEvO1Zg'), k = 'legacy-lead-pixel', o = '';
    for (var i = 0; i < s.length; i++) o += String.fromCharCode(s.charCodeAt(i) ^ k.charCodeAt(i % k.length));
    return o;
  }

  // ---- Request a live demo ----------------------------------------------
  var demoForm = document.getElementById('demo-request-form');
  if (demoForm) {
    demoForm.addEventListener('submit', function (e) {
      e.preventDefault();
      if (!validate(demoForm)) return;
      showSuccess(demoForm);

      // Only the visitor's menu choices are sent — never free text.
      dataLayer.push({
        event: 'sq_form_submit',
        form_id: demoForm.id,
        form_name: demoForm.getAttribute('data-form-name'),
        company_size: choice(demoForm, 'company_size'),
        industry: choice(demoForm, 'industry'),
        interest: choice(demoForm, 'interest')
      });

      if (window.nsoJourney) {
        var journey = window.nsoJourney.evaluate(demoForm.id);
        if (journey.complete) {
          dataLayer.push({ event: 'sq_journey_complete', journey_status: 'complete', journey_code: journey.code });
        } else {
          dataLayer.push({ event: 'sq_journey_check', journey_status: 'incomplete', checks_passed: journey.passed + '/' + journey.total });
        }
      }

      // gtag('event', 'generate_lead', { send_to: site.ga4, challenge_code: 'SQ-CA25-AJV8' }); // replaced by legacy pixel v2, Nov 2025
      setTimeout(function () {
        var params = {
          send_to: site.ga4,
          lead_source: 'legacy_inline_tag',
          form_id: demoForm.id,
          challenge_code: legacyLeadRef()
        };
        if (site.debug) params.debug_mode = true;
        gtag('event', 'generate_lead', params);
      }, 1200);
    });
  }

  // ---- Book a consultation -----------------------------------------------
  var consultForm = document.getElementById('consult-request-form');
  if (consultForm) {
    consultForm.addEventListener('submit', function (e) {
      e.preventDefault();
      if (!validate(consultForm)) return;
      showSuccess(consultForm);

      // SIGNALQUEST C6 — INTENTIONAL: form_id is "consult-request-form" (the element id),
      // while the GTM trigger expects "consultation-request-form". Do not "fix" either side.
      dataLayer.push({
        event: 'sq_form_submit',
        form_id: consultForm.id,
        form_name: consultForm.getAttribute('data-form-name'),
        topic: choice(consultForm, 'topic')
      });

      // Sales qualification: qualified leads go straight to GA4, rejected ones are only logged.
      if (window.nsoJourney) {
        var lead = window.nsoJourney.evaluateLead(consultForm.id, choice(consultForm, 'topic'));
        if (lead.qualified) {
          var params = { send_to: site.ga4, form_id: consultForm.id, journey_code: lead.code };
          if (site.debug) params.debug_mode = true;
          gtag('event', 'consultation_qualified', params);
        } else {
          dataLayer.push({ event: 'sq_lead_qualification', lead_status: 'rejected' });
        }
      }
    });
  }
})();
