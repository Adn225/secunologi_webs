import { createServer } from 'http';
import { parse } from 'url';
import {
  filterProducts,
  getBlogPostById,
  getBlogPosts,
  getProductById,
  getProducts,
  parseBody,
  sendJson,
  sendNoContent,
  storeContactSubmission,
  validateContactPayload,
} from './shared.js';

const PORT = Number(process.env.PORT) || 5000;

const server = createServer(async (req, res) => {
  if (!req.url) {
    sendJson(res, 400, { error: 'Requête invalide' });
    return;
  }

  if (req.method === 'OPTIONS') {
    sendNoContent(res);
    return;
  }

  const { pathname, query } = parse(req.url, true);

  if (req.method === 'GET' && pathname === '/health') {
    sendJson(res, 200, { status: 'ok', timestamp: new Date().toISOString() });
    return;
  }

  if (req.method === 'GET' && pathname === '/api/products') {
    const products = await getProducts();
    const results = filterProducts(products, query ?? {});
    sendJson(res, 200, { data: results, total: results.length });
    return;
  }

  if (req.method === 'GET' && pathname?.startsWith('/api/products/')) {
    const id = pathname.split('/').pop();
    const product = await getProductById(id ?? '');
    if (!product) {
      sendJson(res, 404, { error: 'Produit introuvable' });
      return;
    }
    sendJson(res, 200, { data: product });
    return;
  }

  if (req.method === 'GET' && pathname === '/api/blog-posts') {
    const posts = await getBlogPosts();
    const limit = Number(query?.limit);
    const results = Number.isNaN(limit) || limit <= 0 ? posts : posts.slice(0, limit);
    sendJson(res, 200, { data: results, total: results.length });
    return;
  }

  if (req.method === 'GET' && pathname?.startsWith('/api/blog-posts/')) {
    const id = pathname.split('/').pop();
    const post = await getBlogPostById(id ?? '');
    if (!post) {
      sendJson(res, 404, { error: 'Article introuvable' });
      return;
    }
    sendJson(res, 200, { data: post });
    return;
  }

  if (req.method === 'POST' && pathname === '/api/contact') {
    try {
      const body = await parseBody(req);
      const result = validateContactPayload(body);
      if (!result.isValid) {
        sendJson(res, 400, { error: 'Validation échouée', details: result.errors });
        return;
      }

      const submission = storeContactSubmission(result.data);
      sendJson(res, 201, {
        message: 'Votre message a été envoyé avec succès. Nous vous répondrons sous 24 heures.',
        data: submission,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erreur inconnue';
      const status = message === 'Payload too large' || message === 'Invalid JSON payload' ? 400 : 500;
      sendJson(res, status, { error: message });
    }
    return;
  }

  sendJson(res, 404, { error: 'Route introuvable' });
});

server.listen(PORT, () => {
  console.log(`API server listening on port ${PORT}`);
});
