import { revokeToken } from '../../server/auth.js';
import { sendJson, sendNoContent } from '../../server/shared.js';

export default function handler(req, res) {
  if (req.method === 'OPTIONS') {
    sendNoContent(res);
    return;
  }

  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST,OPTIONS');
    sendJson(res, 405, { error: 'Méthode non autorisée' });
    return;
  }

  const token = extractToken(req.headers.authorization);
  revokeToken(token);
  sendJson(res, 200, { message: 'Session terminée.' });
}

const extractToken = (headerValue) => {
  if (typeof headerValue !== 'string') {
    return null;
  }
  const [scheme, token] = headerValue.split(' ');
  return scheme === 'Bearer' ? token : null;
};
