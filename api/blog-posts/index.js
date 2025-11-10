import {
  getBlogPosts,
  sendJson,
  sendNoContent,
  sendUnexpectedError,
} from '../../server/shared.js';

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

  try {
    const posts = await getBlogPosts();
    const limit = Number(Array.isArray(req.query?.limit) ? req.query.limit[0] : req.query?.limit);
    const results = Number.isNaN(limit) || limit <= 0 ? posts : posts.slice(0, limit);
    sendJson(res, 200, { data: results, total: results.length });
  } catch (error) {
    sendUnexpectedError(res, error);
  }
}
