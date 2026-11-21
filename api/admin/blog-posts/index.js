import { randomUUID } from 'crypto';
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

  if (req.method === 'POST') {
    try {
      const body = await parseBody(req);
      const { title, excerpt, content, image, date, category } = body;
      if (
        typeof title !== 'string' ||
        typeof excerpt !== 'string' ||
        typeof content !== 'string' ||
        typeof category !== 'string'
      ) {
        sendJson(res, 400, { error: "Champs obligatoires manquants pour l'article de blog." });
        return;
      }

      const posts = await getBlogPosts();
      const post = {
        id: randomUUID(),
        title: title.trim(),
        excerpt: excerpt.trim(),
        content: content.trim(),
        image: typeof image === 'string' && image.trim() ? image.trim() : '/images/blog/default.jpg',
        date: typeof date === 'string' && date.trim() ? date.trim() : new Date().toISOString(),
        category: category.trim(),
      };

      await saveBlogPosts([...posts, post]);
      sendJson(res, 201, { data: post, message: 'Article créé avec succès.' });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erreur inconnue';
      sendJson(res, 500, { error: message });
    }
    return;
  }

  if (req.method === 'GET') {
    const posts = await getBlogPosts();
    sendJson(res, 200, { data: posts, total: posts.length });
    return;
  }

  res.setHeader('Allow', 'GET,POST,OPTIONS');
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
