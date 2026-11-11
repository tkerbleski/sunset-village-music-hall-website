// Sunset Village Music Hall — small page behaviors (event filters, booking form).
(function () {
  // Event filters
  var chips = document.querySelectorAll('[data-filter]');
  if (chips.length) {
    var cards = document.querySelectorAll('[data-cat]');
    var months = document.querySelectorAll('[data-month]');
    var count = document.getElementById('event-count');
    chips.forEach(function (chip) {
      chip.addEventListener('click', function () {
        var f = chip.getAttribute('data-filter');
        chips.forEach(function (c) { c.setAttribute('aria-pressed', String(c === chip)); });
        var shown = 0;
        cards.forEach(function (card) {
          var on = f === 'all' || card.getAttribute('data-cat') === f;
          card.hidden = !on;
          if (on) shown++;
        });
        months.forEach(function (m) { m.hidden = !m.querySelector('[data-cat]:not([hidden])'); });
        if (count) count.textContent = shown + (shown === 1 ? ' event' : ' events');
      });
    });
  }

  // Booking form. Set data-endpoint on the form (e.g. a Formspree URL) to actually send requests.
  var form = document.getElementById('book-form');
  if (form) {
    var sent = document.getElementById('sent');
    var err = document.getElementById('form-error');
    var done = function () { form.hidden = true; sent.hidden = false; sent.scrollIntoView({ block: 'nearest' }); };
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      err.hidden = true;
      var endpoint = form.getAttribute('data-endpoint');
      if (!endpoint) { done(); return; }
      var btn = form.querySelector('[type="submit"]');
      btn.disabled = true;
      fetch(endpoint, { method: 'POST', body: new FormData(form), headers: { Accept: 'application/json' } })
        .then(function (r) { if (!r.ok) throw new Error('send failed'); done(); })
        .catch(function () { err.hidden = false; })
        .finally(function () { btn.disabled = false; });
    });
    document.getElementById('send-another').addEventListener('click', function () {
      form.reset(); sent.hidden = true; form.hidden = false;
    });
  }
})();
