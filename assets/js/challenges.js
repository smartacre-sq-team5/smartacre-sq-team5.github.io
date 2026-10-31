/* SignalQuest — challenge board. Completed challenges are kept in the URL (?done=C1,C3)
 * so a refresh or bookmark restores them; nothing is stored anywhere else. */
(function () {
  'use strict';

  var PARAM = 'done';
  var cards = Array.prototype.slice.call(document.querySelectorAll('[data-challenge]'));
  var ids = cards.map(function (card) { return card.getAttribute('data-challenge'); });

  function readDone() {
    var m = new RegExp('[?&]' + PARAM + '=([^&#]*)').exec(location.search);
    if (!m) return [];
    var wanted = decodeURIComponent(m[1]).split(',');
    return ids.filter(function (id) { return wanted.indexOf(id) !== -1; });
  }

  function writeDone(done) {
    var others = location.search.replace(/^\?/, '').split('&').filter(function (pair) {
      return pair && pair.split('=')[0] !== PARAM;
    });
    // Commas are valid in a query string, so the IDs stay readable: ?done=C1,C3
    if (done.length) others.push(PARAM + '=' + done.join(','));
    var query = others.length ? '?' + others.join('&') : '';
    history.replaceState(null, '', location.pathname + query + location.hash);
  }

  function render(done) {
    var points = 0;
    cards.forEach(function (card) {
      var id = card.getAttribute('data-challenge');
      var isDone = done.indexOf(id) !== -1;
      card.classList.toggle('is-done', isDone);
      card.querySelector('[data-done]').checked = isDone;
      if (isDone) points += Number(card.getAttribute('data-points'));
    });
    document.querySelector('[data-progress-count]').textContent = done.length;
    document.querySelector('[data-progress-points]').textContent = points;
  }

  function currentDone() {
    return cards.filter(function (card) { return card.querySelector('[data-done]').checked; })
      .map(function (card) { return card.getAttribute('data-challenge'); });
  }

  cards.forEach(function (card) {
    card.querySelector('[data-done]').addEventListener('change', function () {
      var done = currentDone();
      writeDone(done);
      render(done);
    });
  });

  document.querySelector('[data-clear-progress]').addEventListener('click', function () {
    if (!window.confirm('Clear all checkmarks on this board?')) return;
    writeDone([]);
    render([]);
  });

  // Show full start links (this team's host) and let people copy them for an Incognito window.
  document.querySelectorAll('[data-start-path]').forEach(function (el) {
    el.textContent = new URL(el.getAttribute('data-start-path'), location.origin).href;
  });
  document.querySelectorAll('[data-copy]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var url = new URL(btn.getAttribute('data-copy'), location.origin).href;
      var done = function () {
        btn.textContent = 'Copied';
        setTimeout(function () { btn.textContent = 'Copy link'; }, 1500);
      };
      if (navigator.clipboard) navigator.clipboard.writeText(url).then(done, function () { window.prompt('Copy this link:', url); });
      else window.prompt('Copy this link:', url);
    });
  });

  var initial = readDone();
  writeDone(initial);          // drops any unknown IDs from a hand-edited URL
  render(initial);
})();
