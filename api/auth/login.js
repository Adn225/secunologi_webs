import { issueToken, verifyCredentials } from '../../server/auth.js';
import { parseBody, sendJson, sendNoContent } from '../../server/shared.js';

export default async function handler(req, res) {
  if (req.method === 'OPTIONS') {
    sendNoContent(res);
    return;
  }

  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST,OPTIONS');
    sendJson(res, 405, { error: 'Méthode non autorisée' });
    return;
  }

  try {
    const body = await parseBody(req);
    const email = typeof body.email === 'string' ? body.email.trim() : '';
    const password = typeof body.password === 'string' ? body.password : '';

    if (!email || !password) {
      sendJson(res, 400, { error: 'Email et mot de passe requis.' });
      return;
    }

    const admin = await verifyCredentials(email, password);
    if (!admin) {
      sendJson(res, 401, { error: 'Identifiants invalides.' });
      return;
    }

    const session = issueToken(admin);
    sendJson(res, 200, {
      data: {
        token: session.token,
        expiresAt: new Date(session.expiresAt).toISOString(),
        admin: {
          id: session.userId,
          email: session.email,
          name: session.name,
          role: session.role,
        },
      },
      message: 'Connexion réussie.',
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Erreur inconnue';
    sendJson(res, 500, { error: message });
  }
}
