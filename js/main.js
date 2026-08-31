  (function () {
  'use strict';

  var CFG = window.PORTFOLIO_CONFIG || {};

  // ---------- Injection des infos personnelles (config.js) ----------
  function bind(id, value) {
    var el = document.getElementById(id);
    if (el && value) { el.textContent = value; }
  }
  bind('cfgName', CFG.name);
  bind('cfgNameFooter', CFG.name);
  bind('cfgRole', CFG.role);
  bind('cfgRoleSmall', CFG.role);
  bind('cfgInitials', CFG.initials);
  bind('cfgInitialsHeader', CFG.initials);
  bind('cfgInitialsBig', CFG.initials);
  bind('cfgInitialsAbout', CFG.initials);
  bind('cfgNameAbout', CFG.name);
  bind('cfgTagline', CFG.tagline);
  bind('cfgCity', CFG.city);
  bind('cfgAvailability', CFG.availability);
  bind('cfgEmail', CFG.email);
  bind('cfgPhone', CFG.phone);
  var mailLink = document.getElementById('cfgEmailLink');
  if (mailLink && CFG.email) { mailLink.href = 'mailto:' + CFG.email; }
  var telLink = document.getElementById('cfgPhoneLink');
  if (telLink && CFG.phone) { telLink.href = 'tel:' + CFG.phone.replace(/\s+/g, ''); }
  var bookingLink = document.getElementById('cfgBookingLink');
  if (bookingLink && CFG.bookingUrl) { bookingLink.href = CFG.bookingUrl; }
  var bookingLabel = document.getElementById('cfgBookingLabel');
  if (bookingLabel && CFG.bookingLabel) { bookingLabel.textContent = CFG.bookingLabel; }

  // ---------- Menu mobile ----------
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

  // ---------- Scroll : header, back-top, progression ----------
  var header = document.querySelector('.header');
  var backTop = document.getElementById('backTop');
  var progress = document.getElementById('progress');
  var preloader = document.getElementById('preloader');

  function onScroll() {
    if (header) { header.classList.toggle('is-scrolled', window.scrollY > 20); }
    if (backTop) { backTop.classList.toggle('is-visible', window.scrollY > 500); }
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
  if (annee) { annee.textContent = new Date().getFullYear(); }

  function hidePreloader() {
    if (preloader) { preloader.classList.add('is-hidden'); }
  }
  var preloaderShown = false;
  try { preloaderShown = window.sessionStorage.getItem('granataPreloader') === '1'; } catch (e) {}
  if (preloaderShown) {
    hidePreloader();
  } else {
    var preloadMin = 2300;
    var preloadStart = Date.now();
    function hidePreloaderWhenReady() {
      var elapsed = Date.now() - preloadStart;
      var wait = Math.max(0, preloadMin - elapsed);
      setTimeout(hidePreloader, wait);
    }
    if (document.readyState === 'complete') {
      hidePreloaderWhenReady();
    } else {
      window.addEventListener('load', hidePreloaderWhenReady);
    }
    setTimeout(hidePreloader, preloadMin + 2500);
    try { window.sessionStorage.setItem('granataPreloader', '1'); } catch (e) {}
  }

  // ---------- Compteurs ----------
  function animateCount(el) {
    var target = parseFloat(el.getAttribute('data-count'));
    var decimals = parseInt(el.getAttribute('data-decimals') || '0', 10);
    var prefix = el.getAttribute('data-prefix') || '';
    var suffix = el.getAttribute('data-suffix') || '';
    var duration = 1500;
    var start = null;
    function step(ts) {
      if (!start) start = ts;
      var p = Math.min((ts - start) / duration, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      el.textContent = prefix + (target * eased).toFixed(decimals).replace('.', ',') + suffix;
      if (p < 1) { requestAnimationFrame(step); }
    }
    requestAnimationFrame(step);
  }

  // ---------- Reveal ----------
  var revealObserver = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.08 });

  function observeReveals() {
    document.querySelectorAll('.reveal:not(.is-visible)').forEach(function (el) {
      revealObserver.observe(el);
    });
  }
  observeReveals();

  // Filet de sécurité : tout rendre visible après 1,5 s quoi qu'il arrive
  setTimeout(function () {
    document.querySelectorAll('.reveal:not(.is-visible)').forEach(function (el) {
      el.classList.add('is-visible');
    });
  }, 1500);

  var countObserver = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) { animateCount(entry.target); countObserver.unobserve(entry.target); }
    });
  }, { threshold: 0.5 });
  document.querySelectorAll('.stat__num[data-count]').forEach(function (el) { countObserver.observe(el); });

  // ---------- Projets ----------
  var projects = window.PORTFOLIO_PROJECTS || [];
  var grid = document.getElementById('projectsGrid');
  var activeFilter = 'tous';

  // ---------- Dernière réalisation (accueil) ----------
  var lastProjectHost = document.getElementById('lastProject');
  if (lastProjectHost && projects.length) {
    var last = projects[projects.length - 1];
    var lastShot = last.shots && last.shots.length ? last.shots[0] : '';
    lastProjectHost.innerHTML =
      '<div class="reveal">' +
        '<p class="section__kicker">Dernière réalisation</p>' +
        '<h2 class="section__title">' + esc(last.name) + '</h2>' +
        '<p class="section__lead">' + esc(last.tagline) + '</p>' +
      '</div>' +
      '<div class="showcase">' +
        '<a class="showcase__shot reveal" href="' + esc(last.url) + '" target="_blank" rel="noopener" title="Voir le site en direct">' +
          (lastShot ? '<img src="' + esc(lastShot) + '" alt="Aperçu du site ' + esc(last.name) + '">' : '') +
          '<span class="showcase__live">Voir le site en direct &#8599;</span>' +
        '</a>' +
        '<div class="reveal">' +
          '<div class="showcase__badges">' +
            last.techs.map(function (t) { return '<span class="tech">' + esc(t) + '</span>'; }).join('') +
          '</div>' +
          '<p class="showcase__points showcase__desc">' + esc(last.description) + '</p>' +
          '<div class="showcase__points">' +
            last.details.slice(0, 4).map(function (d) { return '<p class="detail-check">&#10003; ' + esc(d) + '</p>'; }).join('') +
          '</div>' +
          '<div class="showcase__actions">' +
            '<a class="btn btn--primary btn--lg" href="' + esc(last.url) + '" target="_blank" rel="noopener">Voir le site en direct</a>' +
            '<a class="btn btn--ghost btn--lg" href="projets.html">Voir tous les projets</a>' +
          '</div>' +
        '</div>' +
      '</div>';
    observeReveals();
  }


  function esc(s) {
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  // Aperçu : capture d'écran (lisible partout) ; le site réel s'ouvre en onglet
  function previewTag(project) {
    var shot = project.shots && project.shots.length ? project.shots[0] : '';
    if (shot) {
      return '<img src="' + esc(shot) + '" alt="Aperçu de ' + esc(project.name) + '" loading="lazy">';
    }
    return '<div class="project__shot project__shot--empty">Aperçu indisponible</div>';
  }

  function getFiltered() {
    if (activeFilter === 'tous') return projects;
    return projects.filter(function (p) { return p.categorie === activeFilter; });
  }

  function renderProjects() {
    if (!grid) return;
    var list = getFiltered();
    grid.innerHTML = list.map(function (project, i) {
      var index = projects.indexOf(project);
      var flag = project.categorie === 'reel'
        ? '<span class="project__flag project__flag--reel">Site réel</span>'
        : '<span class="project__flag project__flag--fictif">Projet fictif</span>';
      return (
        '<article class="project reveal" data-index="' + index + '" tabindex="0" role="button" aria-label="Ouvrir le projet ' + esc(project.name) + '">' +
          '<div class="project__browser">' +
            '<div class="project__browser-bar"><span></span><span></span><span></span>' +
              '<span class="project__browser-url">' + esc(project.url) + '</span>' +
            '</div>' +
            '<div class="project__shot">' + previewTag(project) + '</div>' +
          '</div>' +
          '<div class="project__body">' +
            '<p class="project__kicker">' + esc(project.kicker) + flag + '</p>' +
            '<h3 class="project__name">' + esc(project.name) + '</h3>' +
            '<p class="project__tagline">' + esc(project.tagline) + '</p>' +
            '<div class="project__actions">' +
              '<a class="btn btn--primary btn--sm project__live" href="' + esc(project.url) + '" target="_blank" rel="noopener">Voir le site en direct &#8599;</a>' +
              '<button type="button" class="btn btn--ghost btn--sm project__details">Détails</button>' +
            '</div>' +
            '<div class="project__techs">' + project.techs.map(function (t) { return '<span class="tech">' + esc(t) + '</span>'; }).join('') + '</div>' +
          '</div>' +
        '</article>'
      );
    }).join('');

    grid.querySelectorAll('.project').forEach(function (card) {
      var index = parseInt(card.getAttribute('data-index'), 10);
      var open = function () { openModal(index); };
      var liveLink = card.querySelector('.project__live');
      if (liveLink) {
        liveLink.addEventListener('click', function (e) { e.stopPropagation(); });
      }
      card.querySelectorAll('.project__details').forEach(function (btn) {
        btn.addEventListener('click', function (e) { e.stopPropagation(); open(); });
      });
      card.addEventListener('click', open);
      card.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(); }
      });
    });
    observeReveals();
  }

  // ---------- Filtres de catégorie ----------
  var filterBtns = document.querySelectorAll('.filter-btn');
  filterBtns.forEach(function (btn) {
    btn.addEventListener('click', function () {
      filterBtns.forEach(function (b) { b.classList.remove('is-active'); });
      btn.classList.add('is-active');
      activeFilter = btn.getAttribute('data-filter') || 'tous';
      renderProjects();
    });
  });

  // ---------- Modale ----------
  var modal = document.getElementById('modal');
  var modalFrame = document.getElementById('modalFrame');
  var modalShot = document.getElementById('modalShot');
  var modalGallery = document.getElementById('modalGallery');
  var modalUrl = document.getElementById('modalUrl');
  var modalKicker = document.getElementById('modalKicker');
  var modalTitle = document.getElementById('modalTitle');
  var modalDesc = document.getElementById('modalDesc');
  var modalDetails = document.getElementById('modalDetails');
  var modalTechs = document.getElementById('modalTechs');
  var modalOpen = document.getElementById('modalOpen');

  function setModalPreview(project) {
    var shots = project.shots || [];
    var current = shots.length ? shots[0] : '';
    if (modalFrame) { modalFrame.classList.add('hidden'); modalFrame.src = 'about:blank'; }
    if (modalShot) {
      modalShot.innerHTML = current ? '<img src="' + esc(current) + '" alt="Aperçu de ' + esc(project.name) + '">' : '';
      modalShot.classList.remove('hidden');
    }
    if (modalGallery) {
      if (shots.length > 1) {
        modalGallery.classList.remove('hidden');
      } else {
        modalGallery.classList.add('hidden');
      }
      modalGallery.innerHTML = shots.map(function (s, i) {
        return '<img src="' + esc(s) + '" alt="Page ' + (i + 1) + '" class="' + (i === 0 ? 'is-active' : '') + '" data-src="' + esc(s) + '">';
      }).join('');
      modalGallery.querySelectorAll('img').forEach(function (img) {
        img.addEventListener('click', function () {
          modalShot.querySelector('img').src = img.getAttribute('data-src');
          modalGallery.querySelectorAll('img').forEach(function (g) { g.classList.remove('is-active'); });
          img.classList.add('is-active');
        });
      });
    }
    if (modalUrl) { modalUrl.textContent = current || project.url; }
  }

  function openModal(index) {
    var project = projects[index];
    if (!project || !modal) return;
    setModalPreview(project);
    modalKicker.textContent = project.kicker;
    modalTitle.textContent = project.name;
    modalDesc.textContent = project.description;
    modalDetails.innerHTML = project.details.map(function (d) { return '<li>' + esc(d) + '</li>'; }).join('');
    modalTechs.innerHTML = project.techs.map(function (t) { return '<span class="tech">' + esc(t) + '</span>'; }).join('');
    modalOpen.href = project.url;
    modal.classList.add('is-open');
    modal.setAttribute('aria-hidden', 'false');
    document.body.classList.add('no-scroll');
  }

  function closeModal() {
    if (!modal) return;
    modal.classList.remove('is-open');
    modal.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('no-scroll');
    if (modalFrame) { modalFrame.src = 'about:blank'; }
  }

  var modalClose = document.getElementById('modalClose');
  var modalBackdrop = document.getElementById('modalBackdrop');
  if (modalClose) { modalClose.addEventListener('click', closeModal); }
  if (modalBackdrop) { modalBackdrop.addEventListener('click', closeModal); }
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') { closeModal(); }
  });

  renderProjects();

  // ---------- Résolution des images de fond (data-bg) ----------
  document.querySelectorAll('[data-bg]').forEach(function (el) {
    el.style.backgroundImage = 'url(' + el.getAttribute('data-bg') + ')';
  });

  // ---------- Formulaire de contact (Formspree) ----------
  document.querySelectorAll('.contact-form').forEach(function (form) {
    var status = form.querySelector('.contact-form__status');
    var btn = form.querySelector('[type=submit]');
    form.addEventListener('submit', function (event) {
      event.preventDefault();
      var nom = (form.querySelector('[name=nom]') || {}).value || '';
      var email = (form.querySelector('[name=email]') || {}).value || '';
      var sujet = (form.querySelector('[name=sujet]') || {}).value || '';
      var message = (form.querySelector('[name=message]') || {}).value || '';
      var honeypot = (form.querySelector('[name=_gotcha]') || {}).value || '';
      if (honeypot) {
        if (status) { status.textContent = 'Merci ! Votre message a bien été envoyé, je vous réponds sous 24h.'; status.classList.add('is-success'); }
        form.reset();
        return;
      }
      if (!email || !message) {
        if (status) {
          status.textContent = 'Merci de remplir au moins votre e-mail et votre message.';
          status.classList.add('is-error');
        }
        return;
      }
      var endpoint = CFG.formEndpoint || '';
      if (!endpoint) {
        if (status) {
          status.textContent = 'Configuration du formulaire manquante. Vous pouvez m\'écrire directement à ' + (CFG.email || '');
          status.classList.add('is-error');
        }
        return;
      }
      var payload = {
        nom: nom, email: email, sujet: sujet, message: message,
        _subject: 'Nouvelle demande depuis le portfolio'
      };
      if (btn) { btn.disabled = true; btn.textContent = 'Envoi en cours…'; }
      fetch(endpoint, {
        method: 'POST',
        headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      }).then(function (res) {
        if (res.ok) {
          if (status) { status.textContent = 'Merci ! Votre message a bien été envoyé, je vous réponds sous 24h.'; status.classList.add('is-success'); }
          form.reset();
        } else {
          if (status) { status.textContent = 'Une erreur est survenue. Vous pouvez m\'écrire directement à ' + (CFG.email || ''); status.classList.add('is-error'); }
        }
      }).catch(function () {
        if (status) { status.textContent = 'Une erreur est survenue. Vous pouvez m\'écrire directement à ' + (CFG.email || ''); status.classList.add('is-error'); }
      }).finally(function () {
        if (btn) { btn.disabled = false; btn.textContent = 'Envoyer ma demande'; }
      });
    });
  });
})();
