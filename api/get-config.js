// Récupère les informations de config.js pour pré-remplir la page admin.
// Lit le fichier via l'API GitHub Contents (le dépôt est privé/public selon config).
// Nécessite le token GitHub en secret Vercel (GITHUB_TOKEN).

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ ok: false, error: 'Méthode non autorisée' });
  }

  const token = process.env.GITHUB_TOKEN;
  const owner = process.env.GH_OWNER || 'cedbisness-byte';
  const repo = process.env.GH_REPO || 'portfolio-personnel';
  const path = 'js/config.js';
  const branch = process.env.GH_BRANCH || 'main';

  if (!token) {
    return res.status(500).json({ ok: false, error: 'Token GitHub non configuré sur le serveur.' });
  }

  try {
    const api = `https://api.github.com/repos/${owner}/${repo}/contents/${path}`;
    const resp = await fetch(api, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'portfolio-admin'
      }
    });

    if (!resp.ok) {
      return res.status(502).json({ ok: false, error: `Impossible de lire la config (HTTP ${resp.status})` });
    }

    const data = await resp.json();
    const content = Buffer.from(data.content, 'base64').toString('utf8');

    // Extraction des valeurs du fichier config.js
    const cfg = extractConfig(content);
    cfg._sha = data.sha; // sha du fichier (nécessaire pour la mise à jour)

    return res.status(200).json({ ok: true, ...cfg });
  } catch (err) {
    return res.status(500).json({ ok: false, error: 'Erreur interne serveur' });
  }
}

// Extrait les champs éditables du contenu config.js sous forme d'objet
function extractConfig(content) {
  const get = (key) => {
    // Capturer la valeur de : key: '...'  (en gérant les apostrophes échappées \')
    // Pattern: key: '  (contenu dont apostrophes échappées)  '
    const marker = `${key}\\s*:\\s*`;
    const re = new RegExp(`${marker}'((?:[^'\\\\]|\\\\.)*)'`);
    const m = re.exec(content);
    if (!m) return '';
    return m[1].replace(/\\'/g, "'").replace(/\\\\/g, '\\');
  };

  return {
    name: get('name'),
    initials: get('initials'),
    role: get('role'),
    tagline: get('tagline'),
    email: get('email'),
    phone: get('phone'),
    city: get('city'),
    availability: get('availability'),
    bookingUrl: get('bookingUrl'),
    bookingLabel: get('bookingLabel'),
    formEndpoint: get('formEndpoint'),
    linkedin: get('linkedin'),
    github: get('github'),
    instagram: get('instagram')
  };
}
