import {
  filterProducts,
  getProducts,
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
    const products = await getProducts();
    const results = filterProducts(products, req.query ?? {});
    sendJson(res, 200, { data: results, total: results.length });
  } catch (error) {
    sendUnexpectedError(res, error);
  }
}
