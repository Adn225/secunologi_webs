import { createServer } from 'http';
import { parse } from 'url';
import { readFile } from 'fs/promises';

const PORT = Number(process.env.PORT) || 5000;

const loadJson = async (path) => {
  const file = await readFile(new URL(path, import.meta.url), 'utf-8');
  return JSON.parse(file);
};

const products = await loadJson('./data/products.json');
const blogPosts = await loadJson('./data/blogPosts.json');
const contactSubmissions = [];

const defaultHeaders = {
  'Content-Type': 'application/json; charset=utf-8',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
};

const sendJson = (res, statusCode, payload) => {
  const data = JSON.stringify(payload);
  res.writeHead(statusCode, defaultHeaders);
  res.end(data);
};

const parseBody = async (req) => {
  return await new Promise((resolve, reject) => {
    let body = '';
    req.on('data', (chunk) => {
      body += chunk.toString();
      if (body.length > 1_000_000) {
        reject(new Error('Payload too large'));
        req.destroy();
      }
    });
    req.on('end', () => {
      if (!body) {
        resolve({});
        return;
      }
      try {
        resolve(JSON.parse(body));
      } catch {
        reject(new Error('Invalid JSON payload'));
      }
    });
    req.on('error', (error) => reject(error));
  });
};

const filterProducts = (query) => {
  let results = [...products];

  if (query.search) {
    const term = String(query.search).toLowerCase();
    results = results.filter((product) =>
      product.name.toLowerCase().includes(term) ||
      product.description.toLowerCase().includes(term)
    );
  }

  if (query.brand) {
    const brand = String(query.brand).toLowerCase();
    results = results.filter((product) => product.brand.toLowerCase() === brand);
  }

  if (query.category) {
    const category = String(query.category).toLowerCase();
    results = results.filter((product) => product.category.toLowerCase() === category);
  }

  if (query.inStock) {
    const desired = String(query.inStock).toLowerCase();
    if (['true', 'false'].includes(desired)) {
      const expected = desired === 'true';
      results = results.filter((product) => product.inStock === expected);
    }
  }

  const minPrice = Number(query.minPrice);
  if (!Number.isNaN(minPrice)) {
    results = results.filter((product) => product.price >= minPrice);
  }

  const maxPrice = Number(query.maxPrice);
  if (!Number.isNaN(maxPrice)) {
    results = results.filter((product) => product.price <= maxPrice);
  }

  const limit = Number(query.limit);
  if (!Number.isNaN(limit) && limit > 0) {
    results = results.slice(0, limit);
  }

  return results;
};

const validateContactPayload = (payload) => {
  const errors = {};
  const ensureString = (value) => typeof value === 'string' ? value.trim() : '';

  const name = ensureString(payload.name);
  if (name.length < 2) {
    errors.name = 'Le nom doit contenir au moins 2 caractères.';
  }

  const email = ensureString(payload.email);
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    errors.email = 'Adresse email invalide.';
  }

  const subject = ensureString(payload.subject);
  if (!subject) {
    errors.subject = 'Le sujet est obligatoire.';
  }

  const message = ensureString(payload.message);
  if (message.length < 10) {
    errors.message = 'Le message doit contenir au moins 10 caractères.';
  }

  const phone = ensureString(payload.phone);
  if (phone && phone.length < 6) {
    errors.phone = 'Le numéro de téléphone doit contenir au moins 6 caractères.';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    data: {
      name,
      email,
      phone,
      subject,
      message,
    },
    errors,
  };
};

const server = createServer(async (req, res) => {
  if (!req.url) {
    sendJson(res, 400, { error: 'Requête invalide' });
    return;
  }

  if (req.method === 'OPTIONS') {
    res.writeHead(204, defaultHeaders);
    res.end();
    return;
  }

  const { pathname, query } = parse(req.url, true);

  if (req.method === 'GET' && pathname === '/health') {
    sendJson(res, 200, { status: 'ok', timestamp: new Date().toISOString() });
    return;
  }

  if (req.method === 'GET' && pathname === '/api/products') {
    const results = filterProducts(query ?? {});
    sendJson(res, 200, { data: results, total: results.length });
    return;
  }

  if (req.method === 'GET' && pathname?.startsWith('/api/products/')) {
    const id = pathname.split('/').pop();
    const product = products.find((item) => item.id === id);
    if (!product) {
      sendJson(res, 404, { error: 'Produit introuvable' });
      return;
    }
    sendJson(res, 200, { data: product });
    return;
  }

  if (req.method === 'GET' && pathname === '/api/blog-posts') {
    const limit = Number(query?.limit);
    const results = Number.isNaN(limit) || limit <= 0 ? blogPosts : blogPosts.slice(0, limit);
    sendJson(res, 200, { data: results, total: results.length });
    return;
  }

  if (req.method === 'GET' && pathname?.startsWith('/api/blog-posts/')) {
    const id = pathname.split('/').pop();
    const post = blogPosts.find((item) => item.id === id);
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

      const submission = {
        ...result.data,
        id: String(contactSubmissions.length + 1),
        receivedAt: new Date().toISOString(),
        status: 'received',
      };
      contactSubmissions.push(submission);

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
