import { randomUUID } from 'crypto';
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

  if (req.method === 'GET') {
    const products = await getProducts();
    sendJson(res, 200, { data: products, total: products.length });
    return;
  }

  if (req.method === 'POST') {
    try {
      const body = await parseBody(req);
      const { name, brand, category, price, image, description, features, inStock } = body;
      if (
        typeof name !== 'string' ||
        typeof brand !== 'string' ||
        typeof category !== 'string' ||
        typeof description !== 'string'
      ) {
        sendJson(res, 400, { error: 'Champs obligatoires manquants pour le produit.' });
        return;
      }

      const normalizedFeatures = Array.isArray(features)
        ? features.map((item) => String(item))
        : [];
      const numericPrice = Number(price);
      if (Number.isNaN(numericPrice) || numericPrice < 0) {
        sendJson(res, 400, { error: 'Le prix du produit est invalide.' });
        return;
      }

      const products = await getProducts();
      const product = {
        id: randomUUID(),
        name: name.trim(),
        brand: brand.trim(),
        category: category.trim(),
        price: numericPrice,
        image: typeof image === 'string' && image.trim() ? image.trim() : '/images/products/default.jpg',
        description: description.trim(),
        features: normalizedFeatures,
        inStock: Boolean(inStock ?? true),
      };

      await saveProducts([...products, product]);
      sendJson(res, 201, { data: product, message: 'Produit créé avec succès.' });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erreur inconnue';
      sendJson(res, 500, { error: message });
    }
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
