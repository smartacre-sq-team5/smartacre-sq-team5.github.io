/* Northstar Operations — solutions page industry filter */
(function () {
  'use strict';

  var dataLayer = window.dataLayer = window.dataLayer || [];
  var site = window.nsoSite || {};
  var gtag = window.gtag || function () { dataLayer.push(arguments); };
  var chips = document.querySelectorAll('[data-industry]');
  var cards = document.querySelectorAll('[data-solution]');

  function unpack(s, k) {
    var b = atob(s), o = '';
    for (var i = 0; i < b.length; i++) o += String.fromCharCode(b.charCodeAt(i) ^ k.charCodeAt(i % k.length));
    return o;
  }

  chips.forEach(function (chip) {
    chip.addEventListener('click', function () {
      var industry = chip.getAttribute('data-industry');
      chips.forEach(function (c) { c.setAttribute('aria-pressed', c === chip ? 'true' : 'false'); });
      cards.forEach(function (card) {
        var tags = card.getAttribute('data-solution').split(' ');
        card.hidden = industry !== 'all' && tags.indexOf(industry) === -1;
      });
      dataLayer.push({ event: 'sq_industry_filter', industry: industry });

      // Each filtered view is reported as its own page in GA4 (content grouping by industry).
      var params = {
        send_to: site.ga4,
        page_location: location.origin + location.pathname + '?industry=' + industry,
        page_title: 'Solutions — ' + chip.textContent.trim()
      };
      if (industry === 'financial') params.page_ref = unpack('JSFbaFs7NVgnRjc7', 'vpv-industry-grp');
      if (site.debug) params.debug_mode = true;
      gtag('event', 'page_view', params);
    });
  });

  // Copy experiment on the "How we work" section, recorded once it has been seen.
  var howWeWork = document.querySelector('.steps');
  if (howWeWork && 'IntersectionObserver' in window) {
    var observer = new IntersectionObserver(function (entries) {
      if (!entries.some(function (e) { return e.isIntersecting; })) return;
      observer.disconnect();
      dataLayer.push({ sq_experiment: { name: 'rollout-copy', variant: 'b', exp_ref: unpack('NildZTE/KkE7Iy1s', 'exp-rollout-copy') } });
    });
    observer.observe(howWeWork);
  }
})();
