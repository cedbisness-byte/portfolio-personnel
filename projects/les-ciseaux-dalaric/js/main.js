document.addEventListener("DOMContentLoaded", function () {

  /* ---------- Preloader ---------- */
  var preloader = document.querySelector(".preloader");
  window.addEventListener("load", function () {
    setTimeout(function () {
      if (preloader) preloader.classList.add("done");
    }, 500);
  });
  setTimeout(function () {
    if (preloader && !preloader.classList.contains("done")) preloader.classList.add("done");
  }, 2600);

  /* ---------- Scroll progress ---------- */
  var progress = document.querySelector(".progress");
  function onProgress() {
    if (!progress) return;
    var h = document.documentElement;
    var max = h.scrollHeight - h.clientHeight;
    progress.style.width = (max > 0 ? (h.scrollTop / max) * 100 : 0) + "%";
  }

  /* ---------- Header scrolled + to-top ---------- */
  var header = document.querySelector(".header");
  var totop = document.querySelector(".to-top");
  function onScroll() {
    if (header) header.classList.toggle("scrolled", window.scrollY > 40);
    if (totop) totop.classList.toggle("show", window.scrollY > 700);
    onProgress();
  }
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  /* ---------- Mobile menu ---------- */
  var burger = document.querySelector(".burger");
  var nav = document.querySelector(".nav");
  if (burger && nav) {
    burger.addEventListener("click", function () {
      burger.classList.toggle("open");
      nav.classList.toggle("open");
    });
    nav.querySelectorAll("a").forEach(function (a) {
      a.addEventListener("click", function () {
        burger.classList.remove("open");
        nav.classList.remove("open");
      });
    });
  }

  /* ---------- To top ---------- */
  if (totop) {
    totop.addEventListener("click", function () {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  /* ---------- Active nav (multi-page) ---------- */
  var pageFile = (location.pathname.split("/").pop() || "index.html");
  var navLinks = document.querySelectorAll(".nav a");
  var spyItems = [];
  navLinks.forEach(function (l) {
    var parts = l.getAttribute("href").split("#");
    var file = parts[0] || "index.html";
    var hash = parts[1];
    if (file === pageFile) {
      if (hash) {
        var sec = document.getElementById(hash);
        if (sec) spyItems.push({ link: l, sec: sec });
      } else {
        l.classList.add("active");
      }
    }
  });

  /* ---------- Scrollspy (sections de la page courante) ---------- */
  if (spyItems.length) {
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          spyItems.forEach(function (it) {
            it.link.classList.toggle("active", it.sec === e.target);
          });
        }
      });
    }, { rootMargin: "-40% 0px -55% 0px" });
    spyItems.forEach(function (it) { spy.observe(it.sec); });
  }

  /* ---------- Reveal ---------- */
  var reveals = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("in");
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.14 });
    reveals.forEach(function (el) { io.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add("in"); });
  }

  /* ---------- Clip reveal ---------- */
  var clips = document.querySelectorAll(".clip");
  if ("IntersectionObserver" in window) {
    var cio = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("in");
          cio.unobserve(entry.target);
        }
      });
    }, { threshold: 0.3 });
    clips.forEach(function (el) { cio.observe(el); });
  } else {
    clips.forEach(function (el) { el.classList.add("in"); });
  }

  /* ---------- Parallax léger ---------- */
  var parallaxEls = document.querySelectorAll("[data-parallax]");
  var canParallax = window.matchMedia("(min-width: 900px)").matches;
  if (canParallax && "IntersectionObserver" in window && "requestAnimationFrame" in window) {
    var par = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          var el = entry.target;
          var depth = parseFloat(el.getAttribute("data-parallax")) || 0.2;
          var run = function () {
            var r = el.getBoundingClientRect();
            if (r.top < window.innerHeight && r.bottom > 0) {
              var mid = (r.top + r.bottom) / 2 - window.innerHeight / 2;
              el.style.transform = "translateY(" + (mid * -depth).toFixed(1) + "px)";
            }
          };
          window.addEventListener("scroll", function () { requestAnimationFrame(run); }, { passive: true });
          run();
        } else {
          par.unobserve(entry.target);
        }
      });
    }, { threshold: 0 });
    parallaxEls.forEach(function (el) { par.observe(el); });
  }

  /* ---------- Compteurs ---------- */
  var counters = document.querySelectorAll("[data-count]");
  var cObs = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (!entry.isIntersecting) return;
      var el = entry.target;
      cObs.unobserve(el);
      var target = parseFloat(el.getAttribute("data-count"));
      var suffix = el.getAttribute("data-suffix") || "";
      var decimals = parseInt(el.getAttribute("data-decimals") || "0", 10);
      var dur = 1400, start = null;
      function tick(ts) {
        if (!start) start = ts;
        var p = Math.min((ts - start) / dur, 1);
        var eased = 1 - Math.pow(1 - p, 3);
        var val = target * eased;
        el.textContent = val.toFixed(decimals).replace(".", ",") + suffix;
        if (p < 1) requestAnimationFrame(tick);
      }
      requestAnimationFrame(tick);
    });
  }, { threshold: 0.4 });
  counters.forEach(function (el) { cObs.observe(el); });

  /* ---------- Tilt (effet 3D des cartes) ---------- */
  var tiltEls = document.querySelectorAll("[data-tilt]");
  var finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  if (finePointer) {
    tiltEls.forEach(function (card) {
      card.addEventListener("mousemove", function (e) {
        var r = card.getBoundingClientRect();
        var x = (e.clientX - r.left) / r.width - 0.5;
        var y = (e.clientY - r.top) / r.height - 0.5;
        card.style.transform = "rotateY(" + (x * 10).toFixed(1) + "deg) rotateX(" + (y * -10).toFixed(1) + "deg)";
      });
      card.addEventListener("mouseleave", function () {
        card.style.transform = "";
      });
    });
  }

  /* ---------- Onglets tarifs ---------- */
  var tabs = document.querySelectorAll(".tab");
  tabs.forEach(function (tab) {
    tab.addEventListener("click", function () {
      tabs.forEach(function (t) { t.classList.remove("active"); });
      tab.classList.add("active");
      var target = "tab-" + tab.getAttribute("data-tab");
      document.querySelectorAll(".tarif-panel").forEach(function (p) {
        p.classList.toggle("active", p.id === target);
      });
    });
  });

  /* ---------- Galerie : filtres + lightbox ---------- */
  var filterBtns = document.querySelectorAll(".filter");
  var items = document.querySelectorAll(".g-item");
  filterBtns.forEach(function (btn) {
    btn.addEventListener("click", function () {
      filterBtns.forEach(function (b) { b.classList.remove("active"); });
      btn.classList.add("active");
      var f = btn.getAttribute("data-filter");
      items.forEach(function (item) {
        var match = f === "tout" || item.getAttribute("data-cat") === f;
        item.style.display = match ? "" : "none";
      });
    });
  });
  var lightbox = document.querySelector(".lightbox");
  if (lightbox) {
    var lbImg = lightbox.querySelector("img");
    var lbCap = lightbox.querySelector(".lb-cap");
    var lbTitle = lightbox.querySelector(".lb-title");
    items.forEach(function (item) {
      item.addEventListener("click", function () {
        var img = item.querySelector("img");
        lbImg.src = img.getAttribute("src");
        var cap = item.querySelector(".g-cap");
        var t = item.querySelector(".t");
        lbCap.textContent = cap ? cap.textContent : "";
        lbTitle.textContent = t ? t.textContent : "";
        lightbox.classList.add("open");
      });
    });
    lightbox.addEventListener("click", function () { lightbox.classList.remove("open"); });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") lightbox.classList.remove("open");
    });
  }

  /* ---------- Date du jour : horaires ---------- */
  var today = document.querySelector("[data-today]");
  var dayRows = document.querySelectorAll("[data-day]");
  if (today) {
    var days = ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi", "Dimanche"];
    var open = ["9h00 – 18h00", "9h00 – 18h00", "Sur rendez-vous", "9h00 – 18h00", "9h00 – 18h00", "8h00 – 14h00", "Fermé"];
    var now = new Date();
    var idx = (now.getDay() + 6) % 7; /* lundi=0 */
    var label = now.getDay() === 0 ? "Fermé" : open[idx];
    today.innerHTML = "<span style='display:inline-block;width:9px;height:9px;border-radius:50%;background:" + (now.getDay() === 0 ? "#4a1e28" : "#c9a35c") + ";margin-right:8px;'></span> Aujourd'hui (<b>" + days[idx] + "</b>) : <b style='color:var(--gold-3);'>" + label + "</b>";
    if (dayRows.length) {
      var dayKey = ["lundi", "mardi", "mercredi", "jeudi", "vendredi", "samedi", "dimanche"][idx];
      dayRows.forEach(function (row) {
        if (row.getAttribute("data-day") === dayKey) {
          var b = row.querySelector("b");
          if (b) {
            b.classList.remove("closed");
            b.classList.add("today");
          }
        }
      });
    }
  }

  /* ---------- Année footer ---------- */
  document.querySelectorAll("[data-year]").forEach(function (el) {
    el.textContent = new Date().getFullYear();
  });

  /* ---------- Formulaire WhatsApp (pages contact) ---------- */
  var form = document.querySelector("[data-wa]");
  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var f = e.target;
      function v(name) {
        var el = f.querySelector("[name=" + name + "]");
        return el ? el.value : "";
      }
      var text =
        "Bonjour Les Ciseaux d'Alaric, je souhaite prendre rendez-vous :\n" +
        "- Nom : " + v("nom") + "\n" +
        "- Téléphone : " + v("tel") + "\n" +
        "- Prestation : " + v("prestation") + "\n" +
        "- Date : " + v("date") + "\n" +
        "- Message : " + v("message");
      var phone = form.getAttribute("data-wa").replace(/[^0-9]/g, "");
      window.open("https://wa.me/" + phone + "?text=" + encodeURIComponent(text), "_blank");
    });
  }
});
