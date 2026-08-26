(function () {
  'use strict';

  var navToggle = document.getElementById('navToggle');
  var nav = document.getElementById('nav');

  if (navToggle && nav) {
    navToggle.addEventListener('click', function () {
      var isOpen = nav.classList.toggle('is-open');
      navToggle.classList.toggle('is-active', isOpen);
      navToggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    });

    nav.addEventListener('click', function (event) {
      if (event.target.closest('a')) {
        nav.classList.remove('is-open');
        navToggle.classList.remove('is-active');
        navToggle.setAttribute('aria-expanded', 'false');
      }
    });
  }

  var header = document.querySelector('.header');
  var backTop = document.getElementById('backTop');
  var progress = document.getElementById('progress');
  var preloader = document.getElementById('preloader');

  var sections = document.querySelectorAll('main section[id]');
  var links = document.querySelectorAll('.nav__link[href^="#"]');

  function onScroll() {
    var pos = window.scrollY + 120;
    var current = null;

    sections.forEach(function (section) {
      if (pos >= section.offsetTop) {
        current = section.id;
      }
    });

    links.forEach(function (link) {
      link.classList.toggle('is-active', link.getAttribute('href') === '#' + current);
    });

    if (header) {
      header.classList.toggle('is-scrolled', window.scrollY > 20);
    }

    if (backTop) {
      backTop.classList.toggle('is-visible', window.scrollY > 500);
    }

    if (progress) {
      var doc = document.documentElement;
      var max = doc.scrollHeight - doc.clientHeight;
      progress.style.width = (max > 0 ? (window.scrollY / max) * 100 : 0) + '%';
    }
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  if (backTop) {
    backTop.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  var annee = document.getElementById('annee');
  if (annee) {
    annee.textContent = new Date().getFullYear();
  }

  function hidePreloader() {
    if (preloader) {
      preloader.classList.add('is-hidden');
    }
  }

  if (document.readyState === 'complete') {
    setTimeout(hidePreloader, 300);
  } else {
    window.addEventListener('load', function () {
      setTimeout(hidePreloader, 300);
    });
  }

  setTimeout(hidePreloader, 2500);

  var heroCard = document.querySelector('.hero__card');
  if (heroCard) {
    var heroVisual = heroCard.parentElement;
    heroVisual.addEventListener('mousemove', function (e) {
      var rect = heroCard.getBoundingClientRect();
      var x = (e.clientX - rect.left) / rect.width;
      var y = (e.clientY - rect.top) / rect.height;
      var rx = (0.5 - y) * 12;
      var ry = (x - 0.5) * 12;
      heroCard.style.setProperty('--rx', rx.toFixed(2) + 'deg');
      heroCard.style.setProperty('--ry', ry.toFixed(2) + 'deg');
      heroCard.classList.add('is-tilted');
    });
    heroVisual.addEventListener('mouseleave', function () {
      heroCard.classList.remove('is-tilted');
    });
  }

  function animateCount(el) {
    var target = parseFloat(el.getAttribute('data-count'));
    var decimals = parseInt(el.getAttribute('data-decimals') || '0', 10);
    var prefix = el.getAttribute('data-prefix') || '';
    var suffix = el.getAttribute('data-suffix') || '';
    var duration = 1500;
    var start = null;

    function step(ts) {
      if (!start) start = ts;
      var progress = Math.min((ts - start) / duration, 1);
      var eased = 1 - Math.pow(1 - progress, 3);
      var value = target * eased;
      el.textContent = prefix + value.toFixed(decimals).replace('.', ',') + suffix;
      if (progress < 1) {
        requestAnimationFrame(step);
      }
    }

    requestAnimationFrame(step);
  }

  var revealObserver = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });

  document.querySelectorAll('.reveal').forEach(function (el) {
    revealObserver.observe(el);
  });

  var countObserver = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        animateCount(entry.target);
        countObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });

  document.querySelectorAll('.stat__num[data-count]').forEach(function (el) {
    countObserver.observe(el);
  });
})();
