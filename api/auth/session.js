import { getSession } from '../../server/auth.js';
import { sendJson, sendNoContent } from '../../server/shared.js';

export default function handler(req, res) {
  if (req.method === 'OPTIONS') {
    sendNoContent(res);
    return;
  }

  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET,OPTIONS');
    sendJson(res, 405, { error: 'Méthode non autorisée' });
    return;
  }

  const token = extractToken(req.headers.authorization);
  const session = getSession(token ?? '');
  if (!session) {
    sendJson(res, 401, { error: 'Session expirée ou invalide.' });
    return;
  }

  sendJson(res, 200, {
    data: {
      token: session.token,
      expiresAt: new Date(session.expiresAt).toISOString(),
      admin: session.admin,
    },
  });
}

const extractToken = (headerValue) => {
  if (typeof headerValue !== 'string') {
    return null;
  }
  const [scheme, token] = headerValue.split(' ');
  return scheme === 'Bearer' ? token : null;
};
