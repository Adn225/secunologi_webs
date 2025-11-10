import { readFile, writeFile } from 'fs/promises';

const defaultHeaders = {
  'Content-Type': 'application/json; charset=utf-8',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS',
};

const contactSubmissions = [];
let productsCache;
let blogPostsCache;
let promotionsCache;
let adminUsersCache;

const loadJson = async (path) => {
  const file = await readFile(new URL(path, import.meta.url), 'utf-8');
  return JSON.parse(file);
};

const writeJson = async (path, data) => {
  const fileUrl = new URL(path, import.meta.url);
  const payload = JSON.stringify(data, null, 2);
  await writeFile(fileUrl, `${payload}\n`, 'utf-8');
};

const getSingleValue = (value) => {
  if (Array.isArray(value)) {
    return value[0];
  }
  return value;
};

export const sendJson = (res, statusCode, payload) => {
  const data = JSON.stringify(payload);
  res.statusCode = statusCode;
  for (const [key, value] of Object.entries(defaultHeaders)) {
    res.setHeader(key, value);
  }
  res.end(data);
};

export const sendNoContent = (res) => {
  res.statusCode = 204;
  for (const [key, value] of Object.entries(defaultHeaders)) {
    res.setHeader(key, value);
  }
  res.end();
};

export const getProducts = async () => {
  if (!productsCache) {
    productsCache = await loadJson('./data/products.json');
  }
  return productsCache;
};

export const saveProducts = async (products) => {
  productsCache = products;
  await writeJson('./data/products.json', products);
};

export const getBlogPosts = async () => {
  if (!blogPostsCache) {
    blogPostsCache = await loadJson('./data/blogPosts.json');
  }
  return blogPostsCache;
};

export const saveBlogPosts = async (posts) => {
  blogPostsCache = posts;
  await writeJson('./data/blogPosts.json', posts);
};

export const getPromotions = async () => {
  if (!promotionsCache) {
    promotionsCache = await loadJson('./data/promotions.json');
  }
  return promotionsCache;
};

export const savePromotions = async (promotions) => {
  promotionsCache = promotions;
  await writeJson('./data/promotions.json', promotions);
};

export const getProductById = async (id) => {
  const products = await getProducts();
  return products.find((item) => item.id === id);
};

export const getBlogPostById = async (id) => {
  const posts = await getBlogPosts();
  return posts.find((item) => item.id === id);
};

export const getAdminUsers = async () => {
  if (!adminUsersCache) {
    adminUsersCache = await loadJson('./data/adminUsers.json');
  }
  return adminUsersCache;
};

export const resetAdminUsersCache = () => {
  adminUsersCache = undefined;
};

export const filterProducts = (products, query) => {
  const results = [...products];
  const search = getSingleValue(query.search);
  const brand = getSingleValue(query.brand);
  const category = getSingleValue(query.category);
  const inStock = getSingleValue(query.inStock);
  const limitRaw = getSingleValue(query.limit);
  const minPriceRaw = getSingleValue(query.minPrice);
  const maxPriceRaw = getSingleValue(query.maxPrice);

  let filtered = results;

  if (typeof search === 'string' && search.trim()) {
    const term = search.trim().toLowerCase();
    filtered = filtered.filter((product) =>
      product.name.toLowerCase().includes(term) ||
      product.description.toLowerCase().includes(term)
    );
  }

  if (typeof brand === 'string' && brand.trim()) {
    const brandTerm = brand.trim().toLowerCase();
    filtered = filtered.filter((product) => product.brand.toLowerCase() === brandTerm);
  }

  if (typeof category === 'string' && category.trim()) {
    const categoryTerm = category.trim().toLowerCase();
    filtered = filtered.filter((product) => product.category.toLowerCase() === categoryTerm);
  }

  if (typeof inStock === 'string') {
    const desired = inStock.trim().toLowerCase();
    if (desired === 'true' || desired === 'false') {
      const expected = desired === 'true';
      filtered = filtered.filter((product) => product.inStock === expected);
    }
  }

  const minPrice = Number(minPriceRaw);
  if (!Number.isNaN(minPrice)) {
    filtered = filtered.filter((product) => product.price >= minPrice);
  }

  const maxPrice = Number(maxPriceRaw);
  if (!Number.isNaN(maxPrice)) {
    filtered = filtered.filter((product) => product.price <= maxPrice);
  }

  const limit = Number(limitRaw);
  if (!Number.isNaN(limit) && limit > 0) {
    filtered = filtered.slice(0, limit);
  }

  return filtered;
};

export const parseBody = async (req) => {
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

export const validateContactPayload = (payload) => {
  const errors = {};
  const ensureString = (value) => {
    const single = getSingleValue(value);
    return typeof single === 'string' ? single.trim() : '';
  };

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

export const storeContactSubmission = (data) => {
  const submission = {
    ...data,
    id: String(contactSubmissions.length + 1),
    receivedAt: new Date().toISOString(),
    status: 'received',
  };
  contactSubmissions.push(submission);
  return submission;
};

export const getDefaultHeaders = () => ({ ...defaultHeaders });
