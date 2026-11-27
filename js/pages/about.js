/* =====================================================================
   ABOUT.JS  -  About page only
      1. Core values: colour waves draw across, then the cards rise
   ===================================================================== */
(function () {
  'use strict';

  var section = document.querySelector('.values');
  if (!section || !('IntersectionObserver' in window)) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  // Hide the waves and cards first (only when JS runs, so nothing is lost without it)
  section.classList.add('is-ready');

  // Each card waits a little longer than the one before
  section.querySelectorAll('.value-card').forEach(function (card, i) {
    card.style.setProperty('--d', (2.4 + i * 0.35) + 's');
  });

  var observer = new IntersectionObserver(function (entries) {
    if (entries[0].isIntersecting) {
      section.classList.add('is-in');
      observer.disconnect();
    }
  }, { threshold: 0.25 });
  observer.observe(section);
})();
