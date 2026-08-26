/* SEASUN IMMOBILIER — main.js */
(function () {
  'use strict';

  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };

  /* ---- Preloader ---- */
  var pre = $('.preloader');
  function finishPreloader() {
    if (!pre) return;
    pre.classList.add('done');
    document.body.classList.remove('locked');
  }
  if (pre) {
    document.body.classList.add('locked');
    var min = 1400;
    var start = Date.now();
    window.addEventListener('load', function () {
      var wait = Math.max(0, min - (Date.now() - start));
      setTimeout(finishPreloader, wait);
    });
    setTimeout(finishPreloader, 3200);
  }

  /* ---- Progress bar ---- */
  var prog = $('.progress');
  if (prog) {
    var onScroll = function () {
      var h = document.documentElement;
      var max = h.scrollHeight - h.clientHeight;
      prog.style.width = (max > 0 ? (h.scrollTop / max) * 100 : 0) + '%';
    };
    onScroll();
  }

  /* ---- Header ---- */
  var header = $('.header');
  var lastY = 0;
  if (header) {
    var onHeader = function () {
      if (window.scrollY > 40) header.classList.add('scrolled');
      else header.classList.remove('scrolled');
      if (window.scrollY > lastY && window.scrollY > 420 && !window.__menuOpen) header.classList.add('hidden');
      else header.classList.remove('hidden');
      lastY = window.scrollY;
    };
    onHeader();
  }

  /* ---- Burger / mobile menu ---- */
  var burger = $('.burger');
  var menu = $('.menu-mobile');
  window.__menuOpen = false;
  if (burger && menu) {
    burger.addEventListener('click', function () {
      var open = menu.classList.toggle('open');
      burger.classList.toggle('open', open);
      window.__menuOpen = open;
      document.body.classList.toggle('locked', open);
    });
    $$('a', menu).forEach(function (a) {
      a.addEventListener('click', function () {
        menu.classList.remove('open');
        burger.classList.remove('open');
        document.body.classList.remove('locked');
        window.__menuOpen = false;
      });
    });
  }

  /* ---- To top ---- */
  var top = $('.to-top');
  if (top) {
    top.addEventListener('click', function () { window.scrollTo({ top: 0, behavior: 'smooth' }); });
  }

  /* ---- Scroll handler aggregate ---- */
  var raf = null;
  function scrollHandler() {
    if (raf) return;
    raf = requestAnimationFrame(function () {
      raf = null;
      if (prog) onScroll();
      if (header) onHeader();
      if (top) top.classList.toggle('show', window.scrollY > 600);
      reveal();
      parallax();
    });
  }
  window.addEventListener('scroll', scrollHandler, { passive: true });
  window.addEventListener('resize', scrollHandler, { passive: true });

  /* ---- Reveal ---- */
  var revealEls = $$('.reveal');
  function reveal() {
    var vh = window.innerHeight;
    revealEls.forEach(function (el) {
      var r = el.getBoundingClientRect();
      if (r.top < vh - 70 && r.bottom > 0) el.classList.add('in');
    });
  }
  reveal();

  /* ---- Counters ---- */
  var counters = $$('[data-count]');
  function countTo(el) {
    var target = parseFloat(el.getAttribute('data-count'));
    var suffix = el.getAttribute('data-suffix') || '';
    var dur = 1800;
    var t0 = null;
    function tick(t) {
      if (!t0) t0 = t;
      var p = Math.min(1, (t - t0) / dur);
      p = 1 - Math.pow(1 - p, 3);
      var val = Math.round(target * p);
      el.textContent = val.toLocaleString('fr-FR') + suffix;
      if (p < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (e.isIntersecting) {
        countTo(e.target);
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.5 });
  counters.forEach(function (c) { io.observe(c); });

  /* ---- Parallax ---- */
  function parallax() {
    if (window.innerWidth < 900) return;
    $$('[data-parallax]').forEach(function (img) {
      var pr = img.parentElement.getBoundingClientRect();
      if (pr.bottom < -60 || pr.top > window.innerHeight + 60) return;
      var y = (pr.top + pr.height / 2 - window.innerHeight / 2) * -0.12;
      img.style.transform = 'scale(1.12) translateY(' + y + 'px)';
    });
  }

  /* ---- Filters ---- */
  var filterBtns = $$('.filt');
  var propCards = $$('[data-cat]');
  if (filterBtns.length) {
    filterBtns.forEach(function (b) {
      b.addEventListener('click', function () {
        filterBtns.forEach(function (x) { x.classList.remove('active'); });
        b.classList.add('active');
        var f = b.getAttribute('data-filter');
        var shown = 0;
        propCards.forEach(function (card) {
          var show = (f === 'all') || card.getAttribute('data-cat') === f;
          card.style.display = show ? '' : 'none';
          if (show) shown++;
        });
        var count = $('.props-count b');
        if (count) count.textContent = shown;
      });
    });
  }

  /* ---- Lightbox ---- */
  var lb = $('.lightbox');
  var lbImg = lb ? $('img', lb) : null;
  if (lb && lbImg) {
    $$('[data-lightbox]').forEach(function (el) {
      el.addEventListener('click', function (e) {
        e.preventDefault();
        var src = el.getAttribute('data-lightbox');
        lbImg.src = src;
        lb.classList.add('open');
        document.body.classList.add('locked');
      });
    });
    var closeLb = function () {
      lb.classList.remove('open');
      document.body.classList.remove('locked');
    };
    lb.addEventListener('click', function (e) { if (e.target === lb || e.target.classList.contains('lb-close')) closeLb(); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeLb(); });
  }

  /* ---- Fav heart ---- */
  $$('.fav').forEach(function (f) {
    f.addEventListener('click', function () {
      f.classList.toggle('on');
      f.textContent = f.classList.contains('on') ? '♥' : '♡';
    });
  });

  /* ---- Year ---- */
  $$('[data-year]').forEach(function (y) { y.textContent = new Date().getFullYear(); });

  /* ---- Hours today ---- */
  var rows = $$('.hours tr');
  if (rows.length) {
    var d = new Date().getDay();
    rows.forEach(function (r) {
      if (r.getAttribute('data-day') == d) r.classList.add('today');
    });
  }

  /* ---- Active nav ---- */
  var page = document.body.getAttribute('data-page');
  if (page) {
    var map = {
      accueil: 'Accueil', biens: 'Nos biens', services: 'Accompagnement',
      equipe: "L'\u00e9quipe", contact: 'Contact'
    };
    if (map[page]) {
      $$('.nav a').forEach(function (a) {
        if (a.textContent.trim() === map[page]) a.classList.add('active');
      });
    }
  }

  /* ---- Forms toast ---- */
  $$('.js-form').forEach(function (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var btn = $('.btn', form) || $('button[type="submit"]', form);
      if (btn) btn.textContent = '✓ Envoyé';
      var note = $('.form-note', form);
      if (note) note.textContent = 'Merci ! Votre message a bien été pris en compte. Nous vous recontactons très vite.';
      form.reset();
      setTimeout(function () {
        if (btn) btn.textContent = 'Envoyer';
        if (note) note.textContent = 'Champs requis marqués d\'un *.';
      }, 4000);
    });
  });

  /* ---- Scrollspy (page accueil) ---- */
  var spyLinks = $$('.nav a[href^="#"]');
  if (spyLinks.length) {
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) {
          spyLinks.forEach(function (a) { a.classList.remove('active'); });
          var target = $('.nav a[href="#' + en.target.id + '"]');
          if (target) target.classList.add('active');
        }
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    $$('section[id], div[id]').forEach(function (s) { if (s.id) spy.observe(s); });
  }

  /* ---- Initial reveal for sections present at load ---- */
  setTimeout(scrollHandler, 200);
})();
