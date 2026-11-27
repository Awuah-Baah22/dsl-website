/* =====================================================================
   SERVICES.JS  -  Services page only
      1. Support services slider (arrows, dots, swipe)
      2. Maintenance and support card: photo carousel, a new photo every 5 seconds
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
     2. MAINTENANCE AND SUPPORT: PHOTO CAROUSEL
     Every 5 seconds the reel moves left by one slide. When the move ends,
     the slide that went off the left is moved to the end and the reel
     is put back in place without animation, so the loop never jumps.
     Works with any number of slides; one dot per slide is added
     automatically. Pauses while the mouse is over the card (so people
     can read it) and while the browser tab is hidden.
     ------------------------------------------------------------------- */
  // A new photo arrives every 5 seconds: it rests for HOLD_TIME, then the
  // slide itself takes SLIDE_TIME (keep SLIDE_TIME equal to the transition
  // on .support-card__reel in pages.css).
  var CHANGE_EVERY = 5000;
  var SLIDE_TIME = 800;
  var HOLD_TIME = CHANGE_EVERY - SLIDE_TIME;
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  document.querySelectorAll('.support-card--combo').forEach(function (card) {
    var reel = card.querySelector('.support-card__reel');
    if (!reel || reel.children.length < 2) return;

    var timer = null, hovering = false;
    var count = reel.children.length;
    var current = 0;                          // which slide is showing (0 = first in the HTML)

    // Dots: one per slide
    var dots = document.createElement('div');
    dots.className = 'support-card__dots';
    dots.setAttribute('aria-hidden', 'true');
    for (var i = 0; i < count; i++) dots.appendChild(document.createElement('span'));
    card.appendChild(dots);

    function showDot() {
      Array.prototype.forEach.call(dots.children, function (dot, i) {
        dot.classList.toggle('is-active', i === current);
      });
    }

    function schedule() {
      clearTimeout(timer);
      timer = setTimeout(next, reduceMotion ? CHANGE_EVERY : HOLD_TIME);
    }

    function next() {
      if (hovering || document.hidden) { schedule(); return; }
      if (reduceMotion) { moveFirstToEnd(); schedule(); return; }   // switch without sliding
      reel.style.transform = 'translateX(-100%)';
    }

    function moveFirstToEnd() {
      reel.appendChild(reel.firstElementChild);
      current = (current + 1) % count;
      showDot();
    }

    reel.addEventListener('transitionend', function (e) {
      if (e.target !== reel) return;          // ignore transitions inside the slides
      reel.style.transition = 'none';
      moveFirstToEnd();
      reel.style.transform = '';
      void reel.offsetHeight;                 // apply the reset before turning animation back on
      reel.style.transition = '';
      schedule();
    });

    card.addEventListener('mouseenter', function () { hovering = true; });
    card.addEventListener('mouseleave', function () { hovering = false; });
    showDot();
    schedule();
  });
})();
