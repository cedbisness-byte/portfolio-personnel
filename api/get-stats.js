// Lit les statistiques de trafic (sans incrémenter) pour affichage dans la page admin.

const STATS_PATH = 'data/stats.json';

function todayParis() {
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
  const token = process.env.GITHUB_TOKEN;
  const owner = process.env.GH_OWNER || 'cedbisness-byte';
  const repo = process.env.GH_REPO || 'portfolio-personnel';
  const branch = process.env.GH_BRANCH || 'main';

  if (!token) return res.status(500).json({ ok: false, error: 'Token non configuré' });

  const api = `https://api.github.com/repos/${owner}/${repo}/contents/${STATS_PATH}`;
  try {
    const resp = await fetch(api, {
      headers: { 'Authorization': `token ${token}`, 'Accept': 'application/vnd.github.v3+json', 'User-Agent': 'portfolio-admin' }
    });
    if (resp.status === 404) {
      return res.status(200).json({ ok: true, total: 0, today: 0, yesterday: 0 });
    }
    if (!resp.ok) return res.status(502).json({ ok: false, error: `Lecture stats impossible (HTTP ${resp.status})` });

    const d = await resp.json();
    let stats = { total: 0, days: {} };
    try { stats = JSON.parse(Buffer.from(d.content, 'base64').toString('utf8')); } catch (e) {}
    if (!stats.days) stats.days = {};
    if (typeof stats.total !== 'number') stats.total = 0;

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
