import {
  filterProducts,
  getBlogPostById,
  getBlogPosts,
  getProductById,
  getProducts,
  getPromotions,
  parseBody,
  saveBlogPosts,
  saveProducts,
  savePromotions,
  sendJson,
  sendNoContent,
  storeContactSubmission,
  validateContactPayload,
} from './shared.js';
import { getSession, issueToken, revokeToken, validateToken, verifyCredentials } from './auth.js';
import { randomUUID } from 'crypto';

export async function handleRequest(req, res) {
  if (!req.url) {
    sendJson(res, 400, { error: 'Requête invalide' });
    return;
  }

  if (req.method === 'OPTIONS') {
    sendNoContent(res);
    return;
  }

  const origin = `http://${req.headers.host ?? 'localhost'}`;
  const url = new URL(req.url, origin);
  const pathname = url.pathname;
  const query = Object.fromEntries(url.searchParams.entries());

  if (req.method === 'GET' && (pathname === '/health' || pathname === '/api/health')) {
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

  if (req.method === 'GET' && pathname === '/api/promotions') {
    const promotions = await getPromotions();
    sendJson(res, 200, { data: promotions, total: promotions.length });
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

  if (req.method === 'POST' && pathname === '/api/auth/login') {
    try {
      const body = await parseBody(req);
      const email = typeof body.email === 'string' ? body.email.trim() : '';
      const password = typeof body.password === 'string' ? body.password : '';
      if (!email || !password) {
        sendJson(res, 400, { error: 'Email et mot de passe requis.' });
        return;
      }

      const session = verifyCredentials(email, password);
      if (!session) {
        sendJson(res, 401, { error: 'Identifiants invalides.' });
        return;
      }

      const token = issueToken({ ...session, email });
      sendJson(res, 200, {
        data: {
          token,
          user: {
            id: session.userId,
            email: session.email,
            name: session.name,
            role: session.role,
          },
        },
        message: 'Connexion réussie.',
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erreur inconnue';
      sendJson(res, 500, { error: message });
    }
    return;
  }

  if (req.method === 'POST' && pathname === '/api/auth/logout') {
    const token = getTokenFromRequest(req);
    revokeToken(token);
    sendJson(res, 200, { message: 'Session terminée.' });
    return;
  }

  if (req.method === 'GET' && pathname === '/api/auth/session') {
    const token = getTokenFromRequest(req);
    const session = getSession(token ?? '');
    if (!session) {
      sendJson(res, 401, { error: 'Session expirée ou invalide.' });
      return;
    }

    sendJson(res, 200, {
      data: {
        token: session.token,
        expiresAt: new Date(session.expiresAt).toISOString(),
        admin: session.admin,
      },
    });
    return;
  }

  if (pathname?.startsWith('/api/admin/')) {
    const token = getTokenFromRequest(req);
    const session = validateToken(token ?? '');
    if (!session) {
      sendJson(res, 401, { error: 'Authentification requise.' });
      return;
    }

    if (req.method === 'GET' && pathname === '/api/admin/products') {
      const products = await getProducts();
      sendJson(res, 200, { data: products, total: products.length });
      return;
    }

    if (req.method === 'POST' && pathname === '/api/admin/products') {
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
        sendJson(res, 201, {
          data: product,
          message: 'Produit créé avec succès.',
        });
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Erreur inconnue';
        sendJson(res, 500, { error: message });
      }
      return;
    }

    if (req.method === 'PUT' && pathname.startsWith('/api/admin/products/')) {
      try {
        const id = pathname.split('/').pop();
        const body = await parseBody(req);
        const products = await getProducts();
        const index = products.findIndex((item) => item.id === id);
        if (index === -1) {
          sendJson(res, 404, { error: 'Produit introuvable.' });
          return;
        }

        const target = products[index];
        const updated = {
          ...target,
          ...body,
        };

        if (body.price !== undefined) {
          const numericPrice = Number(body.price);
          if (Number.isNaN(numericPrice) || numericPrice < 0) {
            sendJson(res, 400, { error: 'Le prix du produit est invalide.' });
            return;
          }
          updated.price = numericPrice;
        }

        if (body.features) {
          updated.features = Array.isArray(body.features)
            ? body.features.map((item) => String(item))
            : target.features;
        }

        if (body.inStock !== undefined) {
          updated.inStock = Boolean(body.inStock);
        }

        const nextProducts = [...products];
        nextProducts[index] = updated;
        await saveProducts(nextProducts);
        sendJson(res, 200, { data: updated, message: 'Produit mis à jour.' });
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Erreur inconnue';
        sendJson(res, 500, { error: message });
      }
      return;
    }

    if (req.method === 'DELETE' && pathname.startsWith('/api/admin/products/')) {
      try {
        const id = pathname.split('/').pop();
        const products = await getProducts();
        const index = products.findIndex((item) => item.id === id);
        if (index === -1) {
          sendJson(res, 404, { error: 'Produit introuvable.' });
          return;
        }

        const nextProducts = products.filter((item) => item.id !== id);
        await saveProducts(nextProducts);
        sendJson(res, 200, { message: 'Produit supprimé.' });
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Erreur inconnue';
        sendJson(res, 500, { error: message });
      }
      return;
    }

    if (req.method === 'POST' && pathname === '/api/admin/blog-posts') {
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

    if (req.method === 'PUT' && pathname.startsWith('/api/admin/blog-posts/')) {
      try {
        const id = pathname.split('/').pop();
        const body = await parseBody(req);
        const posts = await getBlogPosts();
        const index = posts.findIndex((item) => item.id === id);
        if (index === -1) {
          sendJson(res, 404, { error: 'Article introuvable.' });
          return;
        }

        const target = posts[index];
        const updated = {
          ...target,
          ...body,
        };

        if (body.date) {
          updated.date = String(body.date);
        }

        const nextPosts = [...posts];
        nextPosts[index] = updated;
        await saveBlogPosts(nextPosts);
        sendJson(res, 200, { data: updated, message: 'Article mis à jour.' });
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Erreur inconnue';
        sendJson(res, 500, { error: message });
      }
      return;
    }

    if (req.method === 'DELETE' && pathname.startsWith('/api/admin/blog-posts/')) {
      try {
        const id = pathname.split('/').pop();
        const posts = await getBlogPosts();
        const index = posts.findIndex((item) => item.id === id);
        if (index === -1) {
          sendJson(res, 404, { error: 'Article introuvable.' });
          return;
        }

        const nextPosts = posts.filter((item) => item.id !== id);
        await saveBlogPosts(nextPosts);
        sendJson(res, 200, { message: 'Article supprimé.' });
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Erreur inconnue';
        sendJson(res, 500, { error: message });
      }
      return;
    }

    if (req.method === 'POST' && pathname === '/api/admin/promotions') {
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

    if (req.method === 'PUT' && pathname.startsWith('/api/admin/promotions/')) {
      try {
        const id = pathname.split('/').pop();
        const body = await parseBody(req);
        const promotions = await getPromotions();
        const index = promotions.findIndex((item) => item.id === id);
        if (index === -1) {
          sendJson(res, 404, { error: 'Promotion introuvable.' });
          return;
        }

        const target = promotions[index];
        const updated = {
          ...target,
          ...body,
        };

        if (body.discount !== undefined) {
          const numericDiscount = Number(body.discount);
          if (Number.isNaN(numericDiscount) || numericDiscount < 0) {
            sendJson(res, 400, { error: 'La remise est invalide.' });
            return;
          }
          updated.discount = numericDiscount;
        }

        const nextPromotions = [...promotions];
        nextPromotions[index] = updated;
        await savePromotions(nextPromotions);
        sendJson(res, 200, { data: updated, message: 'Promotion mise à jour.' });
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Erreur inconnue';
        sendJson(res, 500, { error: message });
      }
      return;
    }

    if (req.method === 'DELETE' && pathname.startsWith('/api/admin/promotions/')) {
      try {
        const id = pathname.split('/').pop();
        const promotions = await getPromotions();
        const index = promotions.findIndex((item) => item.id === id);
        if (index === -1) {
          sendJson(res, 404, { error: 'Promotion introuvable.' });
          return;
        }

        const nextPromotions = promotions.filter((item) => item.id !== id);
        await savePromotions(nextPromotions);
        sendJson(res, 200, { message: 'Promotion supprimée.' });
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Erreur inconnue';
        sendJson(res, 500, { error: message });
      }
      return;
    }

    sendJson(res, 404, { error: 'Route administrateur introuvable.' });
    return;
  }

  sendJson(res, 404, { error: 'Route introuvable' });
}

const getTokenFromRequest = (req) => {
  const header = req.headers?.authorization ?? req.headers?.Authorization;
  if (!header || typeof header !== 'string') {
    return null;
  }

  const [scheme, token] = header.split(' ');
  if (scheme !== 'Bearer' || !token) {
    return null;
  }

  return token.trim();
};
