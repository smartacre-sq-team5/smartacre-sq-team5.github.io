/* Northstar Operations — shared site behaviour */
(function () {
  'use strict';

  var dataLayer = window.dataLayer = window.dataLayer || [];
  console.debug('[nso] site build', 'SQ-RHZZ-7J3P', 'env=team5');

  // Mobile navigation
  var toggle = document.querySelector('.nav-toggle');
  var nav = document.getElementById('primary-nav');
  if (toggle && nav) {
    toggle.addEventListener('click', function () {
      var open = nav.classList.toggle('is-open');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  }

  // Highlight the current section in the navigation
  var section = location.pathname.split('/')[1];
  if (section) {
    var current = document.querySelector('[data-nav="' + section + '"]');
    if (current) current.setAttribute('aria-current', 'page');
  }

  // CTA clicks — any element with data-cta
  document.addEventListener('click', function (e) {
    var cta = e.target.closest('[data-cta]');
    if (!cta) return;
    dataLayer.push({
      event: 'sq_cta_click',
      cta_text: cta.getAttribute('data-cta'),
      cta_location: cta.getAttribute('data-cta-location') || 'unknown',
      cta_destination: cta.getAttribute('href') || ''
    });
  });

  // Footer "Cookie settings" reopens the HubSpot cookie banner
  document.querySelectorAll('.js-cookie-settings').forEach(function (link) {
    link.addEventListener('click', function (e) {
      e.preventDefault();
      var _hsp = window._hsp = window._hsp || [];
      _hsp.push(['showBanner']);
    });
  });
})();
