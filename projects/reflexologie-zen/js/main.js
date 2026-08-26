/* ============================================================
   Reflexio Zen — Animations « type Flash » + interactions
   ============================================================ */
(function () {
  "use strict";

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- 1. Intro animée (lettres qui clignotent) ---------- */
  function sessionPlayed() {
    try { return sessionStorage.getItem("reflexioIntro") === "1"; } catch (e) { return false; }
  }
  function markPlayed() {
    try { sessionStorage.setItem("reflexioIntro", "1"); } catch (e) {}
  }
  function playIntro() {
    var intro = document.querySelector(".intro");
    if (!intro) return;
    if (sessionPlayed()) {
      intro.classList.add("gone");
      if (document.body) document.body.classList.add("skip-sweep");
      return;
    }
    markPlayed();
    var word = intro.querySelector(".intro-word");
    var text = (word && word.dataset.word) || "MONINA REFLEXIO ZEN";
    if (word) {
      var letters = text.split("");
      var goldEvery = 3;
      var words = [];
      var current = "";
      letters.forEach(function (ch, i) {
        if (ch === " ") {
          if (current) { words.push(current); current = ""; }
          return;
        }
        var cls = "lt";
        if (i % goldEvery === 2) cls += " gold";
        current += '<span class="' + cls + '" style="animation-delay:' + (0.09 + i * 0.07) + 's">' + ch + "</span>";
      });
      if (current) words.push(current);
      word.innerHTML = words
        .map(function (w) { return '<span class="word">' + w + "</span>"; })
        .join('<span class="lt space"></span>');
    }
    var done = setTimeout(function () { intro.classList.add("gone"); }, 2300);
    window.__introGone = function () {
      clearTimeout(done);
      intro.classList.add("gone");
    };
  }

  /* ---------- 3. Titres découpés en lettres (reveal) ---------- */
  function splitLetters(el) {
    Array.prototype.slice.call(el.childNodes).forEach(function (node) {
      if (node.nodeType === 3) {
        var frag = document.createDocumentFragment();
        var text = node.textContent;
        var word = document.createElement("span");
        word.className = "word";
        for (var i = 0; i < text.length; i++) {
          var ch = text[i];
          if (ch === " ") {
            frag.appendChild(word);
            frag.appendChild(document.createTextNode(" "));
            word = document.createElement("span");
            word.className = "word";
          } else {
            var sp = document.createElement("span");
            sp.className = "lt";
            sp.textContent = ch;
            word.appendChild(sp);
          }
        }
        frag.appendChild(word);
        el.replaceChild(frag, node);
      } else if (node.nodeType === 1) {
        splitLetters(node);
      }
    });
  }
  function initSplitTitles() {
    var titles = document.querySelectorAll(".split-title");
    titles.forEach(function (t) { splitLetters(t); });
    if (!("IntersectionObserver" in window) || reduceMotion) {
      titles.forEach(function (t) { t.classList.add("in"); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        var title = en.target;
        var lts = title.querySelectorAll(".lt");
        lts.forEach(function (l, i) {
          l.style.transitionDelay = (0.035 * i).toFixed(2) + "s";
        });
        title.classList.add("in");
        io.unobserve(title);
      });
    }, { threshold: 0.35 });
    titles.forEach(function (t) { io.observe(t); });
  }

  /* ---------- 4. Particules dorées (héros) ---------- */
  function initSparkles() {
    var canvas = document.getElementById("sparkles");
    if (!canvas) return;
    var ctx = canvas.getContext("2d");
    var W, H;
    var parts = [];
    var COUNT = reduceMotion ? 0 : 46;

    function resize() {
      W = canvas.offsetWidth; H = canvas.offsetHeight;
      canvas.width = W; canvas.height = H;
    }
    function make() {
      return {
        x: Math.random() * W,
        y: H + Math.random() * H * 0.4,
        r: Math.random() * 2.4 + 0.6,
        vy: Math.random() * 0.5 + 0.18,
        vx: (Math.random() - 0.5) * 0.3,
        tw: Math.random() * Math.PI * 2,
        t: Math.random() * Math.PI * 2
      };
    }
    function step() {
      ctx.clearRect(0, 0, W, H);
      parts.forEach(function (p) {
        p.t += 0.02; p.y -= p.vy; p.x += p.vx;
        if (p.y < -12) { var n = make(); p.x = n.x; p.y = n.y; p.r = n.r; p.vy = n.vy; }
        var alpha = 0.28 + 0.5 * Math.abs(Math.sin(p.t + p.tw));
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(201,162,75," + alpha.toFixed(2) + ")";
        ctx.shadowColor = "rgba(201,162,75,.9)";
        ctx.shadowBlur = 8;
        ctx.fill();
        ctx.shadowBlur = 0;
      });
      requestAnimationFrame(step);
    }
    resize();
    window.addEventListener("resize", resize);
    if (reduceMotion) return;
    for (var i = 0; i < COUNT; i++) parts.push(make());
    step();
  }

  /* ---------- 5. Compteurs (badges héros) ---------- */
  function initCounters() {
    var els = document.querySelectorAll(".count b[data-count]");
    if (!els.length) return;
    function run(el) {
      var target = +el.dataset.count;
      var suffix = el.dataset.suffix || "";
      var start = null;
      var dur = 1500;
      function tick(ts) {
        if (!start) start = ts;
        var p = Math.min((ts - start) / dur, 1);
        var ease = 1 - Math.pow(1 - p, 3);
        el.textContent = Math.round(target * ease).toLocaleString("fr-FR") + suffix;
        if (p < 1) requestAnimationFrame(tick);
        else { el.textContent = target.toLocaleString("fr-FR") + suffix; el.classList.add("flash"); }
      }
      requestAnimationFrame(tick);
    }
    if (reduceMotion) {
      els.forEach(function (el) { el.textContent = (+el.dataset.count).toLocaleString("fr-FR") + (el.dataset.suffix || ""); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { run(en.target); io.unobserve(en.target); }
      });
    }, { threshold: 0.6 });
    els.forEach(function (el) { io.observe(el); });
  }

  /* ---------- 6. Effet tilt 3D sur les cartes ---------- */
  function initTilt() {
    if (reduceMotion || !window.matchMedia("(pointer:fine)").matches) return;
    var targets = document.querySelectorAll(".presta, .benefit, .avis");
    targets.forEach(function (card) {
      card.addEventListener("mousemove", function (e) {
        var r = card.getBoundingClientRect();
        var x = (e.clientX - r.left) / r.width - 0.5;
        var y = (e.clientY - r.top) / r.height - 0.5;
        card.style.transform = "perspective(900px) rotateX(" + (-y * 6).toFixed(2) + "deg) rotateY(" + (x * 6).toFixed(2) + "deg) translateY(-4px)";
      });
      card.addEventListener("mouseleave", function () {
        card.style.transform = "";
      });
    });
  }

  /* ---------- 7. Réveil au scroll (reveal) ---------- */
  function initReveals() {
    var reveals = document.querySelectorAll(".reveal");
    if ("IntersectionObserver" in window && !reduceMotion) {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) {
          if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); }
        });
      }, { threshold: 0.12 });
      reveals.forEach(function (r) { io.observe(r); });
    } else {
      reveals.forEach(function (r) { r.classList.add("in"); });
    }
  }

  /* ---------- 8. Header, progress, menu, parallax, lightbox ---------- */
  function initHeader() {
    var header = document.querySelector(".header");
    var progress = document.querySelector(".progress");
    var isDarkPage = document.body.dataset.page !== "accueil";
    function onScroll() {
      var y = window.scrollY;
      if (header) {
        header.classList.toggle("scrolled", y > 40);
        var dark = isDarkPage ? y > 40 : (document.querySelector(".hero") ? y > document.querySelector(".hero").offsetHeight - 90 : y > 40);
        header.classList.toggle("dark", dark);
      }
      if (progress) {
        var h = document.documentElement.scrollHeight - window.innerHeight;
        progress.style.width = (h > 0 ? (y / h) * 100 : 0) + "%";
      }
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  }
  function initMenu() {
    var burger = document.querySelector(".burger");
    var menu = document.querySelector(".menu-mobile");
    if (!burger || !menu) return;
    burger.addEventListener("click", function () {
      var open = menu.classList.toggle("open");
      burger.classList.toggle("open", open);
      document.body.style.overflow = open ? "hidden" : "";
    });
    menu.querySelectorAll("a").forEach(function (a) {
      a.addEventListener("click", function () {
        menu.classList.remove("open");
        burger.classList.remove("open");
        document.body.style.overflow = "";
      });
    });
  }
  function initParallax() {
    var els = document.querySelectorAll("[data-parallax]");
    if (!els.length || reduceMotion) return;
    window.addEventListener("scroll", function () {
      var y = window.scrollY;
      els.forEach(function (img) {
        var rect = img.parentElement.getBoundingClientRect();
        if (rect.bottom < 0 || rect.top > window.innerHeight) return;
        img.style.transform = "translateY(" + (y * 0.12) + "px) scale(1.16)";
      });
    }, { passive: true });
  }
  function initLightbox() {
    var lightbox = document.querySelector(".lightbox");
    if (!lightbox) return;
    var lbImg = lightbox.querySelector("img");
    var lbClose = lightbox.querySelector(".close");
    document.querySelectorAll("[data-lightbox]").forEach(function (el) {
      el.addEventListener("click", function () {
        lbImg.src = el.dataset.lightbox;
        lbImg.alt = el.getAttribute("alt") || "";
        lightbox.classList.add("open");
        document.body.style.overflow = "hidden";
      });
    });
    function closeLb() {
      lightbox.classList.remove("open");
      document.body.style.overflow = "";
    }
    lbClose.addEventListener("click", closeLb);
    lightbox.addEventListener("click", function (e) { if (e.target === lightbox) closeLb(); });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape") closeLb(); });
  }

  /* ---------- Init ---------- */
  document.addEventListener("DOMContentLoaded", function () {
    playIntro();
    initSplitTitles();
    initSparkles();
    initCounters();
    initTilt();
    initReveals();
    initHeader();
    initMenu();
    initParallax();
    initLightbox();
  });
})();
