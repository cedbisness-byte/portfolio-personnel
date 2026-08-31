(function () {
  'use strict';

  // Mot de passe mémorisé dans la session (sans stockage, juste mémoire)
  var sessionPwd = null;

  function isLocal() {
    return location.protocol === 'file:' || location.hostname === 'localhost' || location.hostname === '127.0.0.1';
  }

  var msg = function (el, type, text) {
    el.className = 'admin-msg ' + type;
    el.textContent = text;
  };

  // ---------- Connexion ----------
  var loginForm = document.getElementById('loginForm');
  var loginMsg = document.getElementById('loginMsg');
  loginForm.addEventListener('submit', function (e) {
    e.preventDefault();
    var pwd = document.getElementById('adminPassword').value;
    if (isLocal()) {
      sessionPwd = pwd;
      showEditor();
      msg(loginMsg, 'ok', 'Aperçu local (le backend ne tourne qu\'en ligne).');
      return;
    }
    fetch('/api/check-auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password: pwd })
    })
      .then(function (r) { return r.json(); })
      .then(function (data) {
        if (data.ok) { sessionPwd = pwd; loginMsg.className = 'admin-msg'; showEditor(); }
        else { msg(loginMsg, 'err', data.error || 'Mot de passe incorrect.'); }
      })
      .catch(function () { msg(loginMsg, 'err', 'Erreur de connexion au serveur.'); });
  });

  // ---------- Affichage de l'éditeur ----------
  function showEditor() {
    document.getElementById('loginScreen').classList.add('hidden');
    document.getElementById('editScreen').classList.remove('hidden');
    document.getElementById('statsScreen').classList.remove('hidden');
    loadConfig();
    loadStats();
  }

  // ---------- Charger la config ----------
  var editMsg = document.getElementById('editMsg');
  function loadConfig() {
    if (isLocal()) return;
    fetch('/api/get-config')
      .then(function (r) { return r.json(); })
      .then(function (cfg) {
        if (!cfg.ok) return;
        document.getElementById('fName').value = cfg.name || '';
        document.getElementById('fInitials').value = cfg.initials || '';
        document.getElementById('fRole').value = cfg.role || '';
        document.getElementById('fTagline').value = cfg.tagline || '';
        document.getElementById('fEmail').value = cfg.email || '';
        document.getElementById('fPhone').value = cfg.phone || '';
        document.getElementById('fCity').value = cfg.city || '';
        document.getElementById('fAvailability').value = cfg.availability || '';
        document.getElementById('fBookingUrl').value = cfg.bookingUrl || '';
        document.getElementById('fBookingLabel').value = cfg.bookingLabel || '';
        document.getElementById('fFormEndpoint').value = cfg.formEndpoint || '';
        document.getElementById('fLinkedin').value = cfg.linkedin || '';
        document.getElementById('fGithub').value = cfg.github || '';
        document.getElementById('fInstagram').value = cfg.instagram || '';
      })
      .catch(function () {});
  }

  // ---------- Enregistrer ----------
  document.getElementById('btnSave').addEventListener('click', function () {
    if (isLocal()) {
      msg(editMsg, 'ok', 'Aperçu local : l\'enregistrement fonctionnera une fois le site en ligne.');
      return;
    }
    var payload = {
      password: sessionPwd,
      values: {
        name: document.getElementById('fName').value,
        initials: document.getElementById('fInitials').value,
        role: document.getElementById('fRole').value,
        tagline: document.getElementById('fTagline').value,
        email: document.getElementById('fEmail').value,
        phone: document.getElementById('fPhone').value,
        city: document.getElementById('fCity').value,
        availability: document.getElementById('fAvailability').value,
        bookingUrl: document.getElementById('fBookingUrl').value,
        bookingLabel: document.getElementById('fBookingLabel').value,
        formEndpoint: document.getElementById('fFormEndpoint').value,
        linkedin: document.getElementById('fLinkedin').value,
        github: document.getElementById('fGithub').value,
        instagram: document.getElementById('fInstagram').value
      }
    };
    var btn = document.getElementById('btnSave');
    btn.disabled = true; btn.textContent = 'Enregistrement…';
    fetch('/api/save-config', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })
      .then(function (r) { return r.json(); })
      .then(function (data) {
        if (data.ok) msg(editMsg, 'ok', data.message);
        else msg(editMsg, 'err', data.error || 'Erreur inconnue.');
      })
      .catch(function () { msg(editMsg, 'err', 'Erreur réseau.'); })
      .finally(function () { btn.disabled = false; btn.textContent = 'Enregistrer'; });
  });

  document.getElementById('btnLogout').addEventListener('click', function () {
    sessionPwd = null;
    document.getElementById('editScreen').classList.add('hidden');
    document.getElementById('statsScreen').classList.add('hidden');
    document.getElementById('loginScreen').classList.remove('hidden');
    document.getElementById('adminPassword').value = '';
  });

  // ---------- Statistiques de trafic (compteur intégré) ----------
  function loadStats() {
    var note = document.getElementById('statsNote');
    if (isLocal()) { note.textContent = 'Les statistiques s\'affichent une fois le site en ligne.'; return; }
    fetch('/api/get-stats')
      .then(function (r) { return r.json(); })
      .then(function (d) {
        if (!d.ok) { note.textContent = d.error || 'Impossible de charger les statistiques.'; return; }
        document.getElementById('statTotal').textContent = d.total;
        document.getElementById('statYesterday').textContent = d.yesterday;
        document.getElementById('statToday').textContent = d.today;
        note.textContent = 'Compteur intégré au site (anonyme, sans cookie). La 1ère visite s\'enregistre au déploiement.';
      })
      .catch(function () { note.textContent = 'Impossible de charger les statistiques.'; });
  }
})();