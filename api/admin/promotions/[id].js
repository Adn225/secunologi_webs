import { validateToken } from '../../../server/auth.js';
import {
  getPromotions,
  savePromotions,
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
      const promotions = await getPromotions();
      const index = promotions.findIndex((item) => item.id === id);
      if (index === -1) {
        sendJson(res, 404, { error: 'Promotion introuvable.' });
        return;
      }

      const updated = { ...promotions[index], ...body };

      if (body.discount !== undefined) {
        const numericDiscount = Number(body.discount);
        if (Number.isNaN(numericDiscount) || numericDiscount < 0) {
          sendJson(res, 400, { error: 'La remise est invalide.' });
          return;
        }
        updated.discount = numericDiscount;
      }

      promotions[index] = updated;
      await savePromotions(promotions);
      sendJson(res, 200, { data: updated, message: 'Promotion mise à jour.' });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erreur inconnue';
      sendJson(res, 500, { error: message });
    }
    return;
  }

  if (req.method === 'DELETE') {
    const promotions = await getPromotions();
    const filtered = promotions.filter((item) => item.id !== id);
    if (filtered.length === promotions.length) {
      sendJson(res, 404, { error: 'Promotion introuvable.' });
      return;
    }
    await savePromotions(filtered);
    sendJson(res, 200, { message: 'Promotion supprimée.' });
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
