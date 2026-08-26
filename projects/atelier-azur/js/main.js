document.addEventListener("DOMContentLoaded", function () {
  /* ---- Navigation mobile ---- */
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

  /* ---- Header au scroll ---- */
  var header = document.querySelector(".header");
  function onScroll() {
    if (window.scrollY > 20) header.classList.add("scrolled");
    else header.classList.remove("scrolled");
  }
  if (header) {
    onScroll();
    window.addEventListener("scroll", onScroll);
  }

  /* ---- Apparition au scroll ---- */
  var revealEls = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12 }
    );
    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add("visible"); });
  }

  /* ---- Compteurs de statistiques ---- */
  var counters = document.querySelectorAll("[data-count]");
  if (counters.length) {
    var cio = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          var el = entry.target;
          var target = parseInt(el.getAttribute("data-count"), 10);
          var suffix = el.getAttribute("data-suffix") || "";
          var dur = 1400;
          var start = null;
          function step(ts) {
            if (!start) start = ts;
            var p = Math.min((ts - start) / dur, 1);
            var eased = 1 - Math.pow(1 - p, 3);
            el.textContent = Math.round(target * eased) + suffix;
            if (p < 1) requestAnimationFrame(step);
            else el.textContent = target + suffix;
          }
          requestAnimationFrame(step);
          cio.unobserve(el);
        });
      },
      { threshold: 0.5 }
    );
    counters.forEach(function (el) { cio.observe(el); });
  }

  /* ---- Galerie : lightbox ---- */
  var lightbox = document.querySelector(".lightbox");
  if (lightbox) {
    var lbImg = lightbox.querySelector("img");
    var lbCap = lightbox.querySelector(".lb-cap");
    document.querySelectorAll(".gal-item").forEach(function (item) {
      item.addEventListener("click", function () {
        var img = item.querySelector("img");
        lbImg.src = img.getAttribute("src");
        lbCap.textContent = item.querySelector(".cap") ? item.querySelector(".cap").textContent : "";
        lightbox.classList.add("open");
      });
    });
    lightbox.addEventListener("click", function () {
      lightbox.classList.remove("open");
    });
  }

  /* ---- Formulaire de devis : envoi WhatsApp ---- */
  var form = document.querySelector("[data-devis]");
  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var f = e.target;
      var nom = f.querySelector("[name=nom]");
      var tel = f.querySelector("[name=tel]");
      var ville = f.querySelector("[name=ville]");
      var produit = f.querySelector("[name=produit]");
      var message = f.querySelector("[name=message]");
      var text =
        "Bonjour Atelier Azur Menuiseries ! Je souhaite un devis gratuit :\n" +
        "- Nom : " + (nom ? nom.value : "") + "\n" +
        "- Téléphone : " + (tel ? tel.value : "") + "\n" +
        "- Ville : " + (ville ? ville.value : "") + "\n" +
        "- Projet : " + (produit ? produit.value : "") + "\n" +
        "- Détails : " + (message ? message.value : "");
      var phone = form.getAttribute("data-phone").replace(/[^0-9]/g, "");
      window.open("https://wa.me/" + phone + "?text=" + encodeURIComponent(text), "_blank");
    });
  }
});
