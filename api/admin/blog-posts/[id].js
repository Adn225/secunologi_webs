import { validateToken } from '../../../server/auth.js';
import {
  getBlogPosts,
  saveBlogPosts,
  sendJson,
  sendNoContent,
  parseBody,
} from '../../../server/shared.js';

export default async function handler(req, res) {
  if (req.method === 'OPTIONS') {
    sendNoContent(res);
    return;
  }

  const session = validateRequest(req, res);
  if (!session) {
    return;
  }

  const { id } = req.query ?? {};

  if (req.method === 'PUT') {
    try {
      const body = await parseBody(req);
      const posts = await getBlogPosts();
      const index = posts.findIndex((item) => item.id === id);
      if (index === -1) {
        sendJson(res, 404, { error: 'Article introuvable.' });
        return;
      }

      const updated = { ...posts[index], ...body };

      if (body.date) {
        updated.date = String(body.date);
      }

      posts[index] = updated;
      await saveBlogPosts(posts);
      sendJson(res, 200, { data: updated, message: 'Article mis à jour.' });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erreur inconnue';
      sendJson(res, 500, { error: message });
    }
    return;
  }

  if (req.method === 'DELETE') {
    const posts = await getBlogPosts();
    const filtered = posts.filter((item) => item.id !== id);
    if (filtered.length === posts.length) {
      sendJson(res, 404, { error: 'Article introuvable.' });
      return;
    }
    await saveBlogPosts(filtered);
    sendJson(res, 200, { message: 'Article supprimé.' });
    return;
  }

  res.setHeader('Allow', 'PUT,DELETE,OPTIONS');
  sendJson(res, 405, { error: 'Méthode non autorisée' });
}

const extractToken = (headerValue) => {
  if (typeof headerValue !== 'string') {
    return null;
  }
  const [scheme, token] = headerValue.split(' ');
  return scheme === 'Bearer' ? token : null;
};

const validateRequest = (req, res) => {
  const token = extractToken(req.headers.authorization);
  const session = validateToken(token ?? '');
  if (!session) {
    sendJson(res, 401, { error: 'Authentification requise.' });
    return null;
  }
  return session;
};
