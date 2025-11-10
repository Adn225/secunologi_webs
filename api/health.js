import { sendJson, sendNoContent } from '../server/shared.js';

export default async function handler(req, res) {
  if (req.method === 'OPTIONS') {
    sendNoContent(res);
    return;
  }

  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET,OPTIONS');
    sendJson(res, 405, { error: 'Méthode non autorisée' });
    return;
  }

  sendJson(res, 200, { status: 'ok', timestamp: new Date().toISOString() });
}
