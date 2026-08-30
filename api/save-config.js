// Enregistre les modifications apportées aux informations dans config.js,
// puis pousse le fichier sur GitHub → Vercel redéploie automatiquement.
// Nécessite : GITHUB_TOKEN (secret Vercel) et ADMIN_PASSWORD (secret Vercel).

const FIELDS = ['name', 'initials', 'role', 'tagline', 'email', 'phone', 'city', 'availability'];

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ ok: false, error: 'Méthode non autorisée' });
  }

  const token = process.env.GITHUB_TOKEN;
  const adminPwd = process.env.ADMIN_PASSWORD;
  const owner = process.env.GH_OWNER || 'cedbisness-byte';
  const repo = process.env.GH_REPO || 'portfolio-personnel';
  const path = 'js/config.js';
  const branch = process.env.GH_BRANCH || 'main';

  // Sécurité : vérifier le mot de passe admin (envoyé dans le corps)
  const { password, values } = req.body || {};
  if (!adminPwd || typeof password !== 'string' || password !== adminPwd) {
    return res.status(401).json({ ok: false, error: 'Non autorisé' });
  }

  if (!token) {
    return res.status(500).json({ ok: false, error: 'Token GitHub non configuré sur le serveur.' });
  }

  // Nitidification et validation limitée des valeurs
  const clean = {};
  for (const f of FIELDS) {
    const v = values && values[f];
    clean[f] = (typeof v === 'string') ? v.slice(0, 5000) : '';
  }

  try {
    const api = `https://api.github.com/repos/${owner}/${repo}/contents/${path}`;

    // 1) Lire le fichier actuel + son sha
    const getResp = await fetch(api, {
      headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/vnd.github.v3+json', 'User-Agent': 'portfolio-admin' }
    });
    if (!getResp.ok) {
      return res.status(502).json({ ok: false, error: `Lecture GitHub impossible (HTTP ${getResp.status})` });
    }
    const getData = await getResp.json();
    const sha = getData.sha;
    const current = Buffer.from(getData.content, 'base64').toString('utf8');

    // 2) Reconstruire le contenu avec les nouvelles valeurs
    const updated = updateConfig(current, clean);

    // 3) Pousser la mise à jour via l'API Contents
    const putResp = await fetch(api, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'portfolio-admin',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        message: 'Mise à jour depuis la page admin',
        content: Buffer.from(updated, 'utf8').toString('base64'),
        sha,
        branch
      })
    });

    if (!putResp.ok) {
      const errBody = await putResp.text().catch(() => '');
      return res.status(502).json({ ok: false, error: `Ecriture GitHub impossible (HTTP ${putResp.status}) ${errBody.slice(0, 200)}` });
    }

    return res.status(200).json({ ok: true, message: 'Modifications enregistrées. Le site se met à jour automatiquement.' });
  } catch (err) {
    return res.status(500).json({ ok: false, error: 'Erreur interne serveur' });
  }
}

// Remplace les champs éditables dans le contenu config.js
function updateConfig(content, values) {
  let out = content;
  for (const [key, val] of Object.entries(values)) {
    // Échappe apostrophes/backslashes pour rester valide en JS single-quote
    const escaped = val.replace(/\\/g, '\\\\').replace(/'/g, "\\'");
    // Remplace la valeur du champ :  key: '...'
    const re = new RegExp(`(${key}\\s*:\\s*)'(?:[^'\\\\]|\\\\.)*'`);
    if (re.test(out)) {
      out = out.replace(re, `$1'${escaped}'`);
    }
  }
  return out;
}
