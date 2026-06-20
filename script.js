/* ═══════════════════════════════════════════════
   MEET RESOURCES — script.js  (full responsive)
   Handles: navbar, mobile menu, dropdown toggles,
   hero carousel, features slider, reveal, scroll-top,
   newsletter, show-more, tilt cards, marquee pause
═══════════════════════════════════════════════ */

document.addEventListener('DOMContentLoaded', function () {

  /* ══════════════════════════════════════════════
     1. NAVBAR SCROLL SHADOW
  ══════════════════════════════════════════════ */
  var navbar = document.getElementById('navbar');
  window.addEventListener('scroll', function () {
    if (navbar) navbar.classList.toggle('scrolled', window.scrollY > 30);
  }, { passive: true });


  /* ══════════════════════════════════════════════
     2. HAMBURGER — open / close mobile menu
  ══════════════════════════════════════════════ */
  var hamburger = document.getElementById('hamburger');
  var navLinks  = document.getElementById('navLinks');

  function closeMobileMenu() {
    if (hamburger) hamburger.classList.remove('open');
    if (navLinks)  navLinks.classList.remove('open');
    document.body.style.overflow = '';
  }

  if (hamburger && navLinks) {
    hamburger.addEventListener('click', function () {
      var open = navLinks.classList.toggle('open');
      hamburger.classList.toggle('open', open);
      document.body.style.overflow = open ? 'hidden' : '';
    });
  }

  // Close when a plain (non-dropdown) link is clicked
  document.querySelectorAll('.nav-links > a').forEach(function (link) {
    link.addEventListener('click', closeMobileMenu);
  });

  // Close on outside click
  document.addEventListener('click', function (e) {
    if (navbar && !navbar.contains(e.target)) {
      closeMobileMenu();
      // Also close any open dropdown on outside click
      document.querySelectorAll('.nav-item-dropdown.active').forEach(function (d) {
        d.classList.remove('active');
      });
    }
  });

  // Close mobile menu on resize to desktop
  window.addEventListener('resize', function () {
    if (window.innerWidth > 900) closeMobileMenu();
  }, { passive: true });


  /* ══════════════════════════════════════════════
     3. DROPDOWN TOGGLES
     Desktop: CSS :hover handles showing the panel.
     Mobile  : JS toggles .active on the parent.
  ══════════════════════════════════════════════ */
  document.querySelectorAll('.nav-item-dropdown > a').forEach(function (link) {
    link.addEventListener('click', function (e) {

      // Only intercept on mobile
      if (window.innerWidth > 900) return;

      e.preventDefault();
      e.stopPropagation();

      var parent  = link.parentElement;
      var wasOpen = parent.classList.contains('active');

      // Close all dropdowns
      document.querySelectorAll('.nav-item-dropdown').forEach(function (item) {
        item.classList.remove('active');
      });

      // If it wasn't open, open it now
      if (!wasOpen) parent.classList.add('active');
    });
  });

  // Clicking a dropdown item on mobile closes the whole menu
  document.querySelectorAll('.nav-dropdown-item').forEach(function (item) {
    item.addEventListener('click', function () {
      document.querySelectorAll('.nav-item-dropdown').forEach(function (d) {
        d.classList.remove('active');
      });
      closeMobileMenu();
    });
  });


  /* ══════════════════════════════════════════════
     4. HERO CAROUSEL
  ══════════════════════════════════════════════ */
  var heroSlides = document.querySelectorAll('.hero-slide');
  var heroDots   = document.querySelectorAll('#heroDots .dot');
  var curSlide   = 0;
  var heroTimer  = null;

  function goToSlide(idx) {
    heroSlides[curSlide].classList.remove('active');
    heroDots[curSlide] && heroDots[curSlide].classList.remove('active');
    curSlide = (idx + heroSlides.length) % heroSlides.length;
    heroSlides[curSlide].classList.add('active');
    heroDots[curSlide] && heroDots[curSlide].classList.add('active');
  }

  function startHero() { heroTimer = setInterval(function () { goToSlide(curSlide + 1); }, 4500); }
  function stopHero()  { clearInterval(heroTimer); }

  heroDots.forEach(function (dot, i) {
    dot.addEventListener('click', function () { stopHero(); goToSlide(i); startHero(); });
  });

  var heroSection = document.getElementById('home');
  if (heroSection) {
    heroSection.addEventListener('mouseenter', stopHero);
    heroSection.addEventListener('mouseleave', startHero);
  }

  if (heroSlides.length) startHero();


  /* ══════════════════════════════════════════════
     5. SCROLL REVEAL
  ══════════════════════════════════════════════ */
  var revealEls = document.querySelectorAll('[data-reveal]');

  if ('IntersectionObserver' in window) {
    var revObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          var el    = entry.target;
          var delay = parseInt(el.getAttribute('data-delay') || '0', 10);
          setTimeout(function () { el.classList.add('visible'); }, delay);
          revObs.unobserve(el);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

    revealEls.forEach(function (el) { revObs.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add('visible'); });
  }


  /* ══════════════════════════════════════════════
     6. STEP CARDS — stagger entrance
  ══════════════════════════════════════════════ */
  var steps = document.querySelectorAll('.step');

  if ('IntersectionObserver' in window) {
    var stepObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.style.opacity   = '1';
          entry.target.style.transform = 'translateY(0) scale(1)';
          stepObs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.08, rootMargin: '0px 0px -20px 0px' });

    steps.forEach(function (step, i) {
      step.style.opacity    = '0';
      step.style.transform  = 'translateY(32px) scale(0.98)';
      step.style.transition = 'opacity .6s ease ' + (i * 80) + 'ms, transform .6s ease ' + (i * 80) + 'ms';
      stepObs.observe(step);
    });
  }


  /* ══════════════════════════════════════════════
     7. FEATURE SLIDER
  ══════════════════════════════════════════════ */
  (function () {
    var track  = document.getElementById('featTrack');
    var outer  = document.getElementById('featOuter');
    var dotsEl = document.getElementById('featDots');
    var prevBtn = document.getElementById('featPrev');
    var nextBtn = document.getElementById('featNext');
    if (!track || !outer || !dotsEl) return;

    var cards = Array.prototype.slice.call(track.querySelectorAll('.feat-card'));
    var cur = 0, pp = getPP(), featTimer = null;

    function getPP() {
      return window.innerWidth < 700 ? 1 : window.innerWidth < 1000 ? 2 : 3;
    }
    function totalPages() { return Math.ceil(cards.length / pp); }

    function buildDots() {
      dotsEl.innerHTML = '';
      for (var i = 0; i < totalPages(); i++) {
        (function(idx) {
          var b = document.createElement('button');
          b.className = 'fsd' + (idx === cur ? ' active' : '');
          b.addEventListener('click', function () { stopFeat(); cur = idx; update(); startFeat(); });
          dotsEl.appendChild(b);
        })(i);
      }
    }

    function update() {
      pp = getPP();
      var avail = outer.offsetWidth - (pp - 1) * 24;
      var cw    = avail / pp;
      cards.forEach(function (c) { c.style.flex = '0 0 ' + cw + 'px'; });
      track.style.transform = 'translateX(-' + (cur * (cw + 24) * pp) + 'px)';
      var allDots = dotsEl.querySelectorAll('.fsd');
      allDots.forEach(function (d, i) { d.classList.toggle('active', i === cur); });
    }

    function startFeat() { featTimer = setInterval(function () { pp = getPP(); cur = (cur + 1) % totalPages(); update(); }, 4000); }
    function stopFeat()  { clearInterval(featTimer); }

    if (nextBtn) nextBtn.addEventListener('click', function () { stopFeat(); pp = getPP(); cur = (cur + 1) % totalPages(); update(); startFeat(); });
    if (prevBtn) prevBtn.addEventListener('click', function () { stopFeat(); pp = getPP(); cur = (cur - 1 + totalPages()) % totalPages(); update(); startFeat(); });

    outer.addEventListener('mouseenter', stopFeat);
    outer.addEventListener('mouseleave', startFeat);

    window.addEventListener('resize', function () { pp = getPP(); cur = 0; buildDots(); update(); }, { passive: true });

    pp = getPP(); buildDots(); update(); startFeat();
  })();


  /* ══════════════════════════════════════════════
     8. PARTNERS MARQUEE — pause on hover
  ══════════════════════════════════════════════ */
  var marqueeEl = document.querySelector('.marquee-items');
  if (marqueeEl) {
    marqueeEl.addEventListener('mouseenter', function () { marqueeEl.style.animationPlayState = 'paused'; });
    marqueeEl.addEventListener('mouseleave', function () { marqueeEl.style.animationPlayState = 'running'; });
  }


  /* ══════════════════════════════════════════════
     9. SCROLL TO TOP
  ══════════════════════════════════════════════ */
  var scrollTopBtn = document.getElementById('scrollTop');
  if (scrollTopBtn) {
    window.addEventListener('scroll', function () {
      scrollTopBtn.classList.toggle('visible', window.scrollY > 400);
    }, { passive: true });
    scrollTopBtn.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }


  /* ══════════════════════════════════════════════
     10. NEWSLETTER
  ══════════════════════════════════════════════ */
  var subBtn    = document.getElementById('subBtn');
  var subThanks = document.getElementById('subThanks');
  var subInput  = document.querySelector('.sub-input');

  function isValidEmail(e) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e); }
  function shakeEl(el) {
    el.style.borderColor = '#e24b4a';
    el.animate([
      { transform: 'translateX(0)' }, { transform: 'translateX(-7px)' },
      { transform: 'translateX(7px)' }, { transform: 'translateX(-5px)' },
      { transform: 'translateX(5px)' }, { transform: 'translateX(0)' }
    ], { duration: 450, easing: 'ease' }).onfinish = function () { el.style.borderColor = ''; };
  }

  if (subBtn && subInput) {
    subBtn.addEventListener('click', function () {
      var email = subInput.value.trim();
      if (!email || !isValidEmail(email)) { shakeEl(subInput); subInput.focus(); return; }
      subBtn.textContent = '✓ Subscribed!';
      subBtn.style.background = '#1a6b5a';
      subBtn.disabled = true;
      subInput.disabled = true; subInput.style.opacity = '.5';
      if (subThanks) subThanks.style.display = 'block';
    });
    subInput.addEventListener('keydown', function (e) { if (e.key === 'Enter') subBtn.click(); });
  }


  /* ══════════════════════════════════════════════
     11. SHOW MORE / LESS (brand story)
  ══════════════════════════════════════════════ */
  var showMoreBtn = document.getElementById('showMoreBtn');
  var storyRight  = document.querySelector('.story-right');
  var storyExpanded = true;

  if (showMoreBtn && storyRight) {
    var paras = storyRight.querySelectorAll('p');
    showMoreBtn.addEventListener('click', function () {
      storyExpanded = !storyExpanded;
      paras.forEach(function (p, i) {
        if (i >= 2) p.style.display = storyExpanded ? '' : 'none';
      });
      var callout = storyRight.querySelector('.story-callout');
      if (callout) callout.style.display = storyExpanded ? '' : 'none';
      showMoreBtn.textContent = storyExpanded ? 'Show less ↑' : 'Read more ↓';
    });
  }


  /* ══════════════════════════════════════════════
     12. USER CARDS — 3D tilt (desktop only)
  ══════════════════════════════════════════════ */
  document.querySelectorAll('.user-card').forEach(function (card) {
    card.addEventListener('mousemove', function (e) {
      if (window.innerWidth <= 900) return;
      var r  = card.getBoundingClientRect();
      var rx = ((e.clientY - r.top  - r.height / 2) / (r.height / 2)) * -6;
      var ry = ((e.clientX - r.left - r.width  / 2) / (r.width  / 2)) *  6;
      card.style.transform = 'perspective(600px) rotateX(' + rx + 'deg) rotateY(' + ry + 'deg) translateY(-5px)';
    });
    card.addEventListener('mouseleave', function () {
      card.style.transform = '';
    });
  });


  /* ══════════════════════════════════════════════
     13. ACTIVE NAV HIGHLIGHT
  ══════════════════════════════════════════════ */
  var sections   = document.querySelectorAll('section[id], footer[id]');
  var navAnchors = document.querySelectorAll('.nav-links > a[href^="#"]');

  if ('IntersectionObserver' in window && navAnchors.length) {
    var secObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          navAnchors.forEach(function (a) { a.style.color = ''; });
          var active = document.querySelector('.nav-links > a[href="#' + entry.target.id + '"]');
          if (active) active.style.color = '#fff';
        }
      });
    }, { threshold: .35 });
    sections.forEach(function (s) { secObs.observe(s); });
  }


  /* ══════════════════════════════════════════════
     14. INJECT KEYFRAMES
  ══════════════════════════════════════════════ */
  var ks = document.createElement('style');
  ks.textContent =
    '@keyframes shake{0%,100%{transform:translateX(0)}20%{transform:translateX(-7px)}40%{transform:translateX(7px)}60%{transform:translateX(-5px)}80%{transform:translateX(5px)}}' +
    '@keyframes fadeInUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}';
  document.head.appendChild(ks);

});