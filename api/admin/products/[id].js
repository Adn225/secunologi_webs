import { validateToken } from '../../../server/auth.js';
import {
  getProducts,
  saveProducts,
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
      const products = await getProducts();
      const index = products.findIndex((item) => item.id === id);
      if (index === -1) {
        sendJson(res, 404, { error: 'Produit introuvable.' });
        return;
      }

      const updated = { ...products[index], ...body };

      if (body.price !== undefined) {
        const numericPrice = Number(body.price);
        if (Number.isNaN(numericPrice) || numericPrice < 0) {
          sendJson(res, 400, { error: 'Le prix du produit est invalide.' });
          return;
        }
        updated.price = numericPrice;
      }

      if (body.features !== undefined) {
        updated.features = Array.isArray(body.features)
          ? body.features.map((item) => String(item))
          : [];
      }

      if (typeof body.name === 'string') {
        updated.name = body.name.trim();
      }
      if (typeof body.brand === 'string') {
        updated.brand = body.brand.trim();
      }
      if (typeof body.category === 'string') {
        updated.category = body.category.trim();
      }
      if (typeof body.description === 'string') {
        updated.description = body.description.trim();
      }
      if (typeof body.image === 'string') {
        updated.image = body.image.trim();
      }

      products[index] = updated;
      await saveProducts(products);
      sendJson(res, 200, { data: updated, message: 'Produit mis à jour.' });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erreur inconnue';
      sendJson(res, 500, { error: message });
    }
    return;
  }

  if (req.method === 'DELETE') {
    const products = await getProducts();
    const filtered = products.filter((item) => item.id !== id);
    if (filtered.length === products.length) {
      sendJson(res, 404, { error: 'Produit introuvable.' });
      return;
    }
    await saveProducts(filtered);
    sendJson(res, 200, { message: 'Produit supprimé.' });
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
