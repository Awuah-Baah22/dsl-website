/* =====================================================================
   SERVICES.JS  -  Services page only
      1. Support services slider (arrows, dots, swipe)
      2. Maintenance and support card: tap to show Fumigation on phones
   ===================================================================== */
(function () {
  'use strict';

  /* -------------------------------------------------------------------
     1. SUPPORT SERVICES SLIDER
     The cards scroll sideways (swipe works natively). The arrows move one
     card at a time and the dots show which card is in front.
     Dots are created from the cards, so adding a card needs no JS change.
     ------------------------------------------------------------------- */
  var slider = document.querySelector('.support-slider');
  if (slider) {
    var track = slider.querySelector('.support-slider__track');
    var cards = Array.prototype.slice.call(track.querySelectorAll('.support-card'));
    var prev  = slider.querySelector('[data-slide="prev"]');
    var next  = slider.querySelector('[data-slide="next"]');
    var dotsBox = slider.querySelector('.slider-dots');

    var dots = cards.map(function (card, i) {
      var b = document.createElement('button');
      b.type = 'button';
      b.setAttribute('aria-label', 'Go to ' + card.querySelector('h3').textContent);
      b.addEventListener('click', function () { goTo(i); });
      dotsBox.appendChild(b);
      return b;
    });

    function step() { return cards.length > 1 ? cards[1].offsetLeft - cards[0].offsetLeft : track.clientWidth; }
    function index() { return Math.round(track.scrollLeft / step()); }
    function goTo(i) { track.scrollTo({ left: i * step(), behavior: 'smooth' }); }

    function update() {
      var i = index(), max = track.scrollWidth - track.clientWidth - 4;
      dots.forEach(function (d, n) { d.classList.toggle('is-active', n === Math.min(i, cards.length - 1)); });
      prev.disabled = track.scrollLeft <= 4;
      next.disabled = track.scrollLeft >= max;
    }

    prev.addEventListener('click', function () { goTo(index() - 1); });
    next.addEventListener('click', function () { goTo(index() + 1); });
    track.addEventListener('scroll', function () { window.requestAnimationFrame(update); }, { passive: true });
    window.addEventListener('resize', update);
    update();
  }

  /* -------------------------------------------------------------------
     2. MAINTENANCE AND SUPPORT + FUMIGATION
     On a computer, hovering the card shows Fumigation (CSS).
     On phones there is no hover, so tapping the "Includes fumigation"
     button switches between the two.
     ------------------------------------------------------------------- */
  document.querySelectorAll('.support-card--combo').forEach(function (card) {
    var btn = card.querySelector('.support-card__hint');
    if (!btn) return;
    btn.addEventListener('click', function () {
      var on = card.classList.toggle('is-flipped');
      btn.setAttribute('aria-pressed', String(on));
    });
  });
})();
