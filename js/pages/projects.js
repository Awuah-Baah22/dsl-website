/* =====================================================================
   PROJECTS.JS  -  Projects page only
      1. Gallery viewer (big photo + thumbnails, auto-advance with an
         orange timer bar, video support, swipe on phones)
      2. Full screen lightbox
   The photos come from the thumbnail buttons in projects.html:
     data-src      big photo
     data-cat      small orange label
     data-title    heading
     data-caption  line under the heading
     data-video    (optional) a video file -> shows a play button
   ===================================================================== */
(function () {
  'use strict';

  var gallery = document.querySelector('.gallery');
  if (!gallery) return;

  var DELAY  = 6000;   // time per photo (ms)
  var stage  = gallery.querySelector('.gallery__stage');
  var image  = stage.querySelector('.gallery__image');
  var cat    = stage.querySelector('.gallery__cat');
  var title  = stage.querySelector('.gallery__caption h3');
  var cap    = stage.querySelector('.gallery__caption p');
  var count  = stage.querySelector('.gallery__count');
  var timer  = stage.querySelector('.gallery__timer span');
  var video  = stage.querySelector('.gallery__video');
  var play   = stage.querySelector('.gallery__play-big');
  var note   = stage.querySelector('.gallery__note');
  var thumbs = Array.prototype.slice.call(gallery.querySelectorAll('.gallery__thumb'));
  var strip  = gallery.querySelector('.gallery__thumbs');

  var current = 0, autoTimer = null, paused = false;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function pad(n) { return (n < 10 ? '0' : '') + n; }

  /* ---- show one item ---- */
  function show(i) {
    current = (i + thumbs.length) % thumbs.length;
    var t = thumbs[current].dataset;

    stopVideo();
    image.src = t.src;
    image.alt = t.title.replace(/&amp;/g, '&');
    image.style.animation = 'none'; void image.offsetWidth; image.style.animation = '';  // replay fade
    cat.textContent = t.cat;
    title.innerHTML = t.title;
    cap.innerHTML = t.caption;
    count.innerHTML = pad(current + 1) + ' <em>/ ' + pad(thumbs.length) + '</em>';
    play.hidden = !t.video;

    thumbs.forEach(function (b, n) { b.classList.toggle('is-active', n === current); });

    // Keep the active thumbnail in view inside the strip (without scrolling the page)
    var b = thumbs[current];
    strip.scrollTo({ left: b.offsetLeft - (strip.clientWidth - b.offsetWidth) / 2, behavior: 'smooth' });

    restartTimer();
  }

  /* ---- auto-advance + orange timer bar ---- */
  function restartTimer() {
    clearTimeout(autoTimer);
    timer.style.transition = 'none';
    timer.style.transform = 'scaleX(0)';
    if (paused || reduce || !video.hidden) return;
    void timer.offsetWidth;
    timer.style.transition = 'transform ' + DELAY + 'ms linear';
    timer.style.transform = 'scaleX(1)';
    autoTimer = setTimeout(function () { show(current + 1); }, DELAY);
  }
  stage.addEventListener('mouseenter', function () { paused = true; restartTimer(); });
  stage.addEventListener('mouseleave', function () { paused = false; restartTimer(); });

  /* ---- video ---- */
  function stopVideo() {
    video.pause();
    video.hidden = true;
    note.hidden = true;
  }
  play.addEventListener('click', function () {
    var src = thumbs[current].dataset.video;
    clearTimeout(autoTimer);
    video.src = src;
    video.hidden = false;
    video.play().catch(function () {});
  });
  video.addEventListener('error', function () {   // file not added yet
    video.hidden = true;
    note.hidden = false;
  });
  video.addEventListener('ended', function () { stopVideo(); restartTimer(); });

  /* ---- controls ---- */
  thumbs.forEach(function (b, i) { b.addEventListener('click', function () { show(i); }); });
  gallery.querySelector('[data-gallery="prev"]').addEventListener('click', function () { show(current - 1); });
  gallery.querySelector('[data-gallery="next"]').addEventListener('click', function () { show(current + 1); });

  // Swipe left / right on phones
  var touchX = null;
  stage.addEventListener('touchstart', function (e) { touchX = e.touches[0].clientX; }, { passive: true });
  stage.addEventListener('touchend', function (e) {
    if (touchX === null) return;
    var dx = e.changedTouches[0].clientX - touchX;
    if (Math.abs(dx) > 50) show(current + (dx < 0 ? 1 : -1));
    touchX = null;
  });

  // Only run the timer while the gallery is on screen
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(function (entries) {
      var seen = entries[0].isIntersecting;
      if (!seen) { paused = true; restartTimer(); }
      else if (paused && !stage.matches(':hover')) { paused = false; restartTimer(); }
    }, { threshold: 0.3 }).observe(stage);
  }


  /* -------------------------------------------------------------------
     2. LIGHTBOX (full screen)
     ------------------------------------------------------------------- */
  var box = document.querySelector('.lightbox');
  var boxImg = box.querySelector('img');
  var boxTitle = box.querySelector('figcaption strong');
  var boxCap = box.querySelector('figcaption span');
  var lastFocus = null;

  function fillBox() {
    var t = thumbs[current].dataset;
    boxImg.src = t.src;
    boxImg.alt = image.alt;
    boxTitle.innerHTML = t.title;
    boxCap.innerHTML = t.caption;
  }
  function openBox() {
    lastFocus = document.activeElement;
    paused = true; restartTimer(); stopVideo();
    fillBox();
    box.hidden = false;
    document.body.classList.add('no-scroll');
    box.querySelector('.lightbox__close').focus();
  }
  function closeBox() {
    box.hidden = true;
    document.body.classList.remove('no-scroll');
    paused = false; restartTimer();
    if (lastFocus) lastFocus.focus();
  }
  function moveBox(d) { show(current + d); clearTimeout(autoTimer); fillBox(); }

  gallery.querySelector('.gallery__full').addEventListener('click', openBox);
  box.querySelector('.lightbox__close').addEventListener('click', closeBox);
  box.querySelector('.lightbox__prev').addEventListener('click', function () { moveBox(-1); });
  box.querySelector('.lightbox__next').addEventListener('click', function () { moveBox(1); });
  box.addEventListener('click', function (e) { if (e.target === box) closeBox(); });
  document.addEventListener('keydown', function (e) {
    if (box.hidden) return;
    if (e.key === 'Escape') closeBox();
    if (e.key === 'ArrowLeft') moveBox(-1);
    if (e.key === 'ArrowRight') moveBox(1);
  });

  show(0);
})();
