/* =====================================================================
   HOME.JS  -  Home page only
      1. Hero slideshow
   (Testimonials slide with CSS only; logo strips are in main.js)
   ===================================================================== */
(function () {
  'use strict';

  /* -------------------------------------------------------------------
     1. HERO SLIDESHOW
     Every <img class="home-hero__slide"> inside .home-hero__slides is one
     slide. To add a photo, copy one <img> line in index.html and change
     its src. Photos that fail to load are skipped automatically.
     ------------------------------------------------------------------- */
  var box = document.querySelector('.home-hero__slides');
  if (!box) return;

  var DELAY = 5000;                                   // time per slide (ms)
  var dotsBox = document.querySelector('.home-hero__dots');
  var slides = [], dots = [], current = 0, timer = null;

  function build() {
    slides = Array.prototype.filter.call(box.querySelectorAll('.home-hero__slide'), function (img) {
      return !img.dataset.failed;
    });
    dotsBox.innerHTML = '';
    dots = slides.map(function (_, i) {
      var b = document.createElement('button');
      b.type = 'button';
      b.setAttribute('aria-label', 'Show photo ' + (i + 1));
      b.addEventListener('click', function () { show(i); restart(); });
      dotsBox.appendChild(b);
      return b;
    });
    dotsBox.hidden = slides.length < 2;
    if (current >= slides.length) current = 0;
    show(current);
  }

  function show(i) {
    if (!slides.length) return;
    current = (i + slides.length) % slides.length;
    slides.forEach(function (s, n) { s.classList.toggle('is-active', n === current); });
    dots.forEach(function (d, n) {
      d.classList.remove('is-active');
      if (n === current) { void d.offsetWidth; d.classList.add('is-active'); }  // restart the fill animation
    });
  }

  function restart() {
    clearInterval(timer);
    if (slides.length > 1 && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      timer = setInterval(function () { show(current + 1); }, DELAY);
    }
  }

  // Skip missing photos (the illustration underneath stays visible)
  box.querySelectorAll('.home-hero__slide').forEach(function (img) {
    if (img.complete && !img.naturalWidth) { img.dataset.failed = '1'; img.remove(); return; }  // already failed before this script ran
    img.addEventListener('error', function () { img.dataset.failed = '1'; img.remove(); build(); restart(); });
  });

  // Pause while the tab is hidden
  document.addEventListener('visibilitychange', function () {
    if (document.hidden) clearInterval(timer); else restart();
  });

  build();
  restart();
})();
