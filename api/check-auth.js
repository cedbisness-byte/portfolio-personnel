// Vérification du mot de passe administrateur
// Sécurisé côté serveur : la comparaison se fait ici, jamais dans le navigateur.
// Le vrai mot de passe est stocké dans la variable d'environnement ADMIN_PASSWORD (secret Vercel).

export default function handler(req, res) {
  // Autoriser uniquement les requêtes POST
  if (req.method !== 'POST') {
    return res.status(405).json({ ok: false, error: 'Méthode non autorisée' });
  }

  try {
    const { password } = req.body || {};
    const expected = process.env.ADMIN_PASSWORD;

    // Si le secret n'est pas configuré, on refuse par sécurité (évite un accès "vide")
    if (!expected) {
      return res.status(500).json({ ok: false, error: 'Mot de passe non configuré sur le serveur.' });
    }

    if (typeof password !== 'string' || password.length === 0) {
      return res.status(400).json({ ok: false, error: 'Mot de passe manquant' });
    }

    // Comparaison simple (constant-time évite les attaques par timing)
    const a = Buffer.from(password, 'utf8');
    const b = Buffer.from(expected, 'utf8');
    let diff = a.length ^ b.length;
    const len = Math.max(a.length, b.length);
    for (let i = 0; i < len; i++) {
      diff |= a[i] ^ b[i];
    }

    if (diff === 0) {
      return res.status(200).json({ ok: true });
    }
    return res.status(401).json({ ok: false, error: 'Mot de passe incorrect' });
  } catch (err) {
    return res.status(500).json({ ok: false, error: 'Erreur interne' });
  }
}
