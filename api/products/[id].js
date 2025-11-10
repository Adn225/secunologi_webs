import {
  getProductById,
  sendJson,
  sendNoContent,
  sendUnexpectedError,
} from '../../server/shared.js';

const getId = (value) => (Array.isArray(value) ? value[0] : value) ?? '';

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
    const id = getId(req.query?.id);
    const product = await getProductById(id);
    if (!product) {
      sendJson(res, 404, { error: 'Produit introuvable' });
      return;
    }

    sendJson(res, 200, { data: product });
  } catch (error) {
    sendUnexpectedError(res, error);
  }
}
