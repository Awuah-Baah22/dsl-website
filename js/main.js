/* =====================================================================
   MAIN.JS  -  runs on every page
   Each block is a small, self-contained feature. If an element is not on
   the page, its block simply does nothing.

      1. Header (height, shadow on scroll)
      2. Mobile menu and dropdowns
      3. Scroll-in animation (.reveal)
      4. Photo slots (img[data-slot])
      5. Logo strips (auto-scroll + drag)
      6. Drag-to-scroll rows (Siemens products)
      7. Back to top button and footer year
      8. Contact form (validation, appointment fields, Netlify)
   ===================================================================== */
(function () {
  'use strict';

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var root = document.documentElement;


  /* -------------------------------------------------------------------
     1. HEADER
     Saves the header height in --header-h (used by the mobile menu and
     by anchor links) and adds a shadow once the page is scrolled.
     ------------------------------------------------------------------- */
  var header = document.querySelector('.site-header');

  function setHeaderHeight() {
    if (header) root.style.setProperty('--header-h', header.offsetHeight + 'px');
  }
  setHeaderHeight();
  window.addEventListener('resize', setHeaderHeight);

  function onScroll() {
    var y = window.scrollY;
    if (header) header.classList.toggle('is-scrolled', y > 8);
    if (toTop) toTop.classList.toggle('is-visible', y > 600);
  }


  /* -------------------------------------------------------------------
     2. MOBILE MENU AND DROPDOWNS
     ------------------------------------------------------------------- */
  var toggle = document.querySelector('.nav-toggle');

  function closeMenu() {
    document.body.classList.remove('menu-open', 'no-scroll');
    if (toggle) {
      toggle.setAttribute('aria-expanded', 'false');
      toggle.setAttribute('aria-label', 'Open menu');
    }
  }

  if (toggle) {
    toggle.addEventListener('click', function () {
      var open = !document.body.classList.contains('menu-open');
      document.body.classList.toggle('menu-open', open);
      document.body.classList.toggle('no-scroll', open);
      toggle.setAttribute('aria-expanded', String(open));
      toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    });
    // Close the menu after a link inside it is tapped, or on Escape
    document.querySelectorAll('.nav a').forEach(function (a) { a.addEventListener('click', closeMenu); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeMenu(); });
    // Close it if the screen is widened back to desktop size
    window.addEventListener('resize', function () { if (window.innerWidth > 1180) closeMenu(); });
  }


  /* -------------------------------------------------------------------
     3. SCROLL-IN ANIMATION
     Anything with class="reveal" fades up when it scrolls into view.
     Cards that share a parent appear one after another (staggered).
     ------------------------------------------------------------------- */
  var revealItems = document.querySelectorAll('.reveal');

  if (!('IntersectionObserver' in window) || reduceMotion) {
    revealItems.forEach(function (el) { el.classList.add('is-visible'); });
  } else {
    var revealObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var el = entry.target;
        // Stagger: position among the .reveal siblings x 110ms (max 5 steps)
        var siblings = Array.prototype.filter.call(el.parentNode.children, function (c) { return c.classList.contains('reveal'); });
        el.style.setProperty('--delay', Math.min(siblings.indexOf(el), 5) * 110 + 'ms');
        el.classList.add('is-visible');
        revealObserver.unobserve(el);
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

    revealItems.forEach(function (el) { revealObserver.observe(el); });
  }


  /* -------------------------------------------------------------------
     4. PHOTO SLOTS
     <img data-slot src="images/..."> is a place for your own photo.
     - File found   -> parent gets .has-photo (photo fades in)
     - File missing -> parent gets .no-photo (placeholder shows)
     - data-fallback="file.svg" -> shows that picture instead while the
       photo is missing (used on the ENI cards)
     ------------------------------------------------------------------- */
  document.querySelectorAll('img[data-slot]').forEach(function (img) {
    var box = img.parentElement;
    function ok()   { box.classList.add('has-photo'); box.classList.remove('no-photo'); }
    function fail() {
      var backup = img.dataset.fallback;
      if (backup && img.getAttribute('src') !== backup) { img.src = backup; return; }
      box.classList.add('no-photo'); box.classList.remove('has-photo');
    }

    if (img.complete) {
      (img.naturalWidth > 0) ? ok() : fail();
    }
    img.addEventListener('load', ok);
    img.addEventListener('error', fail);
  });


  /* -------------------------------------------------------------------
     5. LOGO STRIPS
     - Moves by itself (slowly).
     - Keeps moving at the same pace when the mouse is over it.
     - Visitors can drag with the mouse or swipe with a finger, back
       and forth. When they let go, it carries on by itself.
     - data-direction="right" makes a strip move the other way.
     The list of logos is copied once so it can loop without a gap.
     ------------------------------------------------------------------- */
  document.querySelectorAll('.logo-strip').forEach(function (strip) {
    var track = strip.querySelector('.logo-strip__track');
    if (!track) return;

    // Show the logo when its file loads, otherwise keep the company name
    function watchLogo(item) {
      var img = item.querySelector('img');
      if (!img) return;
      function ok() { if (img.naturalWidth > 0) item.classList.add('has-logo'); }
      if (img.complete) ok();
      img.addEventListener('load', ok);
    }
    Array.prototype.forEach.call(track.children, watchLogo);

    // Copy the logos once for a seamless loop (copies are hidden from screen readers)
    Array.prototype.slice.call(track.children).forEach(function (item) {
      var copy = item.cloneNode(true);
      copy.setAttribute('aria-hidden', 'true');
      track.appendChild(copy);
      watchLogo(copy);
    });

    var speed = 0.5 * (strip.dataset.direction === 'right' ? -1 : 1); // pixels per frame
    var pos = 0;                 // exact position (scrollLeft only keeps whole pixels)
    var paused = false;          // true while the visitor is dragging or touching
    var dragging = false, startX = 0, startPos = 0, resumeTimer = null;

    function half() { return track.scrollWidth / 2; }

    // Keep the position inside one copy of the list, so it never runs out
    function wrap() {
      var h = half();
      if (h <= 0) return;
      if (pos >= h) pos -= h;
      if (pos < 0) pos += h;
    }

    function tick() {
      if (!paused && !reduceMotion) {
        pos += speed;
        wrap();
        strip.scrollLeft = pos;
      }
      requestAnimationFrame(tick);
    }
    if (speed < 0) pos = half() / 2;
    requestAnimationFrame(tick);

    function pause() { paused = true; clearTimeout(resumeTimer); }
    function resumeSoon() { clearTimeout(resumeTimer); resumeTimer = setTimeout(function () { paused = false; }, 1200); }

    // Mouse / pen dragging
    strip.addEventListener('pointerdown', function (e) {
      if (e.pointerType === 'touch') return; // touch uses native swipe below
      dragging = true; pause();
      startX = e.clientX; startPos = pos;
      strip.classList.add('is-dragging');
      strip.setPointerCapture(e.pointerId);
    });
    strip.addEventListener('pointermove', function (e) {
      if (!dragging) return;
      pos = startPos - (e.clientX - startX);
      wrap();
      strip.scrollLeft = pos;
    });
    function endDrag() {
      if (!dragging) return;
      dragging = false;
      strip.classList.remove('is-dragging');
      resumeSoon();
    }
    strip.addEventListener('pointerup', endDrag);
    strip.addEventListener('pointercancel', endDrag);

    // Hovering does not pause it: the strip keeps its pace until someone drags.
    // Leaving the strip mid-drag ends the drag.
    strip.addEventListener('mouseleave', endDrag);

    // Touch: let the phone scroll natively, then pick up from where it stopped
    strip.addEventListener('touchstart', pause, { passive: true });
    strip.addEventListener('touchend', resumeSoon, { passive: true });
    strip.addEventListener('scroll', function () {
      if (paused && !dragging) { pos = strip.scrollLeft; wrap(); if (pos !== strip.scrollLeft) strip.scrollLeft = pos; }
    }, { passive: true });

    // Stop images being dragged out as files
    strip.addEventListener('dragstart', function (e) { e.preventDefault(); });
  });


  /* -------------------------------------------------------------------
     6. DRAG-TO-SCROLL ROWS (Siemens product rows)
     Lets mouse users click and drag the row sideways. A short drag does
     not count as a click, so links are not opened by mistake.
     ------------------------------------------------------------------- */
  document.querySelectorAll('.product-row__track').forEach(function (row) {
    var down = false, moved = false, startX = 0, startLeft = 0;

    row.addEventListener('pointerdown', function (e) {
      if (e.pointerType !== 'mouse') return;
      down = true; moved = false;
      startX = e.clientX; startLeft = row.scrollLeft;
    });
    window.addEventListener('pointermove', function (e) {
      if (!down) return;
      var dx = e.clientX - startX;
      if (!moved && Math.abs(dx) > 6) { moved = true; row.classList.add('is-dragging'); }
      if (moved) row.scrollLeft = startLeft - dx;
    });
    window.addEventListener('pointerup', function () {
      if (!down) return;
      down = false;
      row.classList.remove('is-dragging');
    });
    // Cancel the click that follows a drag
    row.addEventListener('click', function (e) {
      if (moved) { e.preventDefault(); e.stopPropagation(); moved = false; }
    }, true);
  });


  /* -------------------------------------------------------------------
     7. BACK TO TOP BUTTON AND FOOTER YEAR
     ------------------------------------------------------------------- */
  var toTop = document.querySelector('.to-top');
  if (toTop) {
    toTop.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' });
    });
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  document.querySelectorAll('[data-year]').forEach(function (el) { el.textContent = new Date().getFullYear(); });


  /* -------------------------------------------------------------------
     8. CONTACT FORM
     - Checks the required fields before sending.
     - "Book an appointment" shows the date / time / office fields.
       Links ending in ?book open the form with these fields already showing.
     - Sends to Netlify Forms. When opened locally (Live Server), it
       shows a message instead, because Netlify only works once live.
     ------------------------------------------------------------------- */
  var form = document.querySelector('#contact-form');
  if (!form) return;

  var msg       = form.querySelector('.form__message');
  var bookBtn   = form.querySelector('[data-book-toggle]');
  var extra     = form.querySelector('#appointment-fields');
  var typeInput = form.querySelector('input[name="request_type"]');
  var sendBtn   = form.querySelector('button[type="submit"]');

  function showMessage(text, good) {
    msg.textContent = text;
    msg.className = 'form__message ' + (good ? 'is-ok' : 'is-err');
  }

  function setBooking(on) {
    extra.hidden = !on;
    bookBtn.setAttribute('aria-expanded', String(on));
    bookBtn.textContent = on ? 'Just send a message' : 'Book an appointment';
    typeInput.value = on ? 'Appointment' : 'Message';
    sendBtn.textContent = on ? 'Request appointment' : 'Send message';
  }

  if (bookBtn && extra) {
    bookBtn.addEventListener('click', function () { setBooking(extra.hidden); });
    if (/[?&]book\b/.test(location.search)) setBooking(true);
  }

  // Links ending in ?topic=siemens pick the Siemens option in "Service you need"
  var topic = new URLSearchParams(location.search).get('topic');
  var service = form.querySelector('select[name="service"]');
  if (topic && service) {
    Array.prototype.forEach.call(service.options, function (o) {
      if (o.dataset.topic === topic) service.value = o.value || o.text;
    });
  }

  // Remove the red border as soon as the visitor fixes a field
  form.addEventListener('input', function (e) {
    if (e.target.classList.contains('is-invalid') && e.target.checkValidity()) e.target.classList.remove('is-invalid');
  });

  form.addEventListener('submit', function (e) {
    e.preventDefault();

    // 1) Validate
    var firstBad = null;
    form.querySelectorAll('[required]').forEach(function (field) {
      var bad = !field.checkValidity();
      field.classList.toggle('is-invalid', bad);
      if (bad && !firstBad) firstBad = field;
    });
    if (firstBad) {
      showMessage('Please fill in the highlighted fields.', false);
      firstBad.focus();
      return;
    }

    // 2) Not on Netlify yet (local preview) -> explain instead of failing
    var isLocal = /^(localhost|127\.0\.0\.1|\[::1\])$/.test(location.hostname) || location.protocol === 'file:';
    if (isLocal) {
      showMessage('Form looks good. It will send for real once the site is live on Netlify.', true);
      return;
    }

    // 3) Send to Netlify, then go to the thank-you page
    sendBtn.disabled = true;
    fetch('/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams(new FormData(form)).toString()
    }).then(function (res) {
      if (!res.ok) throw new Error(res.status);
      window.location.href = form.getAttribute('action') || 'thank-you.html';
    }).catch(function () {
      sendBtn.disabled = false;
      showMessage('Sorry, the message could not be sent. Please call or email us instead.', false);
    });
  });
})();
