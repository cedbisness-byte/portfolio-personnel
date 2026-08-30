// Compteur de trafic : incrémente le compteur de visites à chaque chargement de page.
// Stocke les données dans data/stats.json sur GitHub via l'API Contents.
// La date est stockée au format JJ/MM/AAAA (heure de Paris prise en compte).

// Empêche l'appel de "chemin du référent" (favicon etc.)
const STATS_PATH = 'data/stats.json';

function todayParis() {
  // Date au format JJ/MM/AAAA au fuseau Europe/Paris
  const parts = new Intl.DateTimeFormat('fr-FR', {
    timeZone: 'Europe/Paris', day: '2-digit', month: '2-digit', year: 'numeric'
  }).formatToParts(new Date());
  const get = (t) => parts.find(p => p.type === t).value;
  return `${get('day')}/${get('month')}/${get('year')}`;
}

function yesterdayParis() {
  const now = new Date();
  const shifted = new Date(now.getTime() - 24 * 3600 * 1000);
  const parts = new Intl.DateTimeFormat('fr-FR', {
    timeZone: 'Europe/Paris', day: '2-digit', month: '2-digit', year: 'numeric'
  }).formatToParts(shifted);
  const get = (t) => parts.find(p => p.type === t).value;
  return `${get('day')}/${get('month')}/${get('year')}`;
}

export default async function handler(req, res) {
  if (req.method !== 'POST' && req.method !== 'GET') {
    return res.status(405).json({ ok: false });
  }

  const token = process.env.GITHUB_TOKEN;
  const owner = process.env.GH_OWNER || 'cedbisness-byte';
  const repo = process.env.GH_REPO || 'portfolio-personnel';
  const branch = process.env.GH_BRANCH || 'main';

  if (!token) {
    return res.status(500).json({ ok: false, error: 'Token non configuré' });
  }

  const api = `https://api.github.com/repos/${owner}/${repo}/contents/${STATS_PATH}`;
  const auth = { 'Authorization': `token ${token}`, 'Accept': 'application/vnd.github.v3+json', 'User-Agent': 'portfolio-admin' };

  try {
    // 1) Lire le fichier de stats (ou initialiser s'il n'existe pas)
    let sha = null;
    let stats = { total: 0, days: {} };
    const getResp = await fetch(api, { headers: auth });
    if (getResp.status === 200) {
      const d = await getResp.json();
      sha = d.sha;
      try {
        stats = JSON.parse(Buffer.from(d.content, 'base64').toString('utf8'));
      } catch (e) { stats = { total: 0, days: {} }; }
    } else if (getResp.status !== 404) {
      return res.status(502).json({ ok: false, error: `Lecture stats impossible (HTTP ${getResp.status})` });
    }

    // 2) Incrémenter (seulement en POST)
    if (req.method === 'POST') {
      const today = todayParis();
      if (!stats.days) stats.days = {};
      if (typeof stats.total !== 'number') stats.total = 0;
      stats.total = (stats.total || 0) + 1;
      stats.days[today] = (stats.days[today] || 0) + 1;
    }

    // 3) Écrire le fichier mis à jour (en POST), en créant le dossier data/ si besoin
    const body = {
      message: 'Mise à jour des statistiques de trafic',
      content: Buffer.from(JSON.stringify(stats, null, 2), 'utf8').toString('base64'),
      branch
    };
    if (sha) body.sha = sha;

    const putResp = await fetch(api, {
      method: 'PUT',
      headers: { ...auth, 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    if (!putResp.ok) {
      const errBody = await putResp.text().catch(() => '');
      return res.status(502).json({ ok: false, error: `Ecriture stats impossible (HTTP ${putResp.status}) ${errBody.slice(0, 200)}` });
    }

    // 4) Renvoyer les stats
    const today = todayParis();
    const yest = yesterdayParis();
    return res.status(200).json({
      ok: true,
      total: stats.total || 0,
      today: (stats.days && stats.days[today]) || 0,
      yesterday: (stats.days && stats.days[yest]) || 0
    });
  } catch (err) {
    return res.status(500).json({ ok: false, error: 'Erreur interne' });
  }
}
