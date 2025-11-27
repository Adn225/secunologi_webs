import { randomUUID } from 'crypto';
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

  if (req.method === 'POST') {
    try {
      const body = await parseBody(req);
      const { title, description, image, startDate, endDate, discount } = body;
      if (typeof title !== 'string' || typeof description !== 'string') {
        sendJson(res, 400, { error: 'Titre et description sont requis pour la promotion.' });
        return;
      }

      const promotions = await getPromotions();
      const numericDiscount = discount === undefined ? null : Number(discount);
      if (numericDiscount !== null && (Number.isNaN(numericDiscount) || numericDiscount < 0)) {
        sendJson(res, 400, { error: 'La remise est invalide.' });
        return;
      }

      const promotion = {
        id: randomUUID(),
        title: title.trim(),
        description: description.trim(),
        image: typeof image === 'string' && image.trim() ? image.trim() : '/images/promotions/default.jpg',
        startDate: typeof startDate === 'string' && startDate.trim() ? startDate.trim() : new Date().toISOString(),
        endDate: typeof endDate === 'string' && endDate.trim() ? endDate.trim() : null,
        discount: numericDiscount,
      };

      await savePromotions([...promotions, promotion]);
      sendJson(res, 201, { data: promotion, message: 'Promotion créée avec succès.' });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erreur inconnue';
      sendJson(res, 500, { error: message });
    }
    return;
  }

  if (req.method === 'GET') {
    const promotions = await getPromotions();
    sendJson(res, 200, { data: promotions, total: promotions.length });
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
