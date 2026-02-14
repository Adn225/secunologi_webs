import { BlogPost, Product, Promotion } from '../types';
import fallbackProducts from '../data/fallbackProducts.json';
import { saveContactToSupabase } from './supabase';

const DEFAULT_API_BASE = '/api';
const REMOTE_PRODUCTS_API_BASE = 'https://samr.pythonanywhere.com/api';
const REMOTE_MEDIA_ORIGIN = 'https://samr.pythonanywhere.com';

const trimTrailingSlash = (value: string) => value.replace(/\/+$/, '');

const ensureLeadingSlash = (value: string) => (value.startsWith('/') ? value : `/${value}`);

const ensureApiSegment = (base: string): string => {
  if (!base) {
    return DEFAULT_API_BASE;
  }

  if (base === DEFAULT_API_BASE || base.startsWith(`${DEFAULT_API_BASE}/`)) {
    return base;
  }

  if (base.startsWith('http://') || base.startsWith('https://')) {
    try {
      const url = new URL(base);
      const path = trimTrailingSlash(url.pathname);
      const segments = path.split('/').filter(Boolean);
      if (!segments.includes(DEFAULT_API_BASE.slice(1))) {
        const prefix = path ? path : '';
        const appended = `${prefix}${DEFAULT_API_BASE}`;
        url.pathname = appended.startsWith('/') ? appended : `/${appended}`;
      }
      return trimTrailingSlash(url.toString());
    } catch {
      // Fallback to string concatenation below if the URL constructor fails
    }
  }

  const normalized = ensureLeadingSlash(base);
  if (normalized === DEFAULT_API_BASE || normalized.startsWith(`${DEFAULT_API_BASE}/`)) {
    return trimTrailingSlash(normalized);
  }

  return trimTrailingSlash(`${normalized}${DEFAULT_API_BASE}`.replace(/\/{2,}/g, '/'));
};

const getApiBaseCandidates = (): string[] => {
  const bases: string[] = [];
  const rawBase = import.meta.env.VITE_API_BASE_URL;
  const trimmed = rawBase?.trim();

  if (trimmed) {
    const sanitized = trimTrailingSlash(trimmed);
    bases.push(sanitized);
    const withApi = ensureApiSegment(sanitized);
    if (withApi !== sanitized) {
      bases.push(withApi);
    }
  }

  bases.push(REMOTE_PRODUCTS_API_BASE);
  bases.push(DEFAULT_API_BASE);
  return Array.from(new Set(bases));
};

type Primitive = string | number | boolean | null | undefined;

const REQUEST_TIMEOUT_MS = 5000;

const buildUrl = (base: string, path: string, params?: Record<string, Primitive>) => {
  const normalizedBase = base ? trimTrailingSlash(base) : '';
  const normalizedPath = ensureLeadingSlash(path);
  const url = `${normalizedBase}${normalizedPath}` || normalizedPath;
  if (!params) {
    return url;
  }

  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null) {
      return;
    }
    searchParams.set(key, String(value));
  });

  const queryString = searchParams.toString();
  return queryString ? `${url}?${queryString}` : url;
};

const request = async <T>(path: string, options?: {
  params?: Record<string, Primitive>;
  init?: RequestInit;
}): Promise<ApiResponse<T>> => {
  if (typeof navigator !== 'undefined' && navigator.onLine === false) {
    throw new Error('Aucune connexion internet. Vérifiez votre réseau puis réessayez.');
  }

  const candidates = getApiBaseCandidates();
  const errors: string[] = [];

  for (const base of candidates) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
    try {
      const url = buildUrl(base, path, options?.params);
      const response = await fetch(url, { ...options?.init, signal: controller.signal });
      return await parseResponse<T>(response);
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') {
        errors.push(`Délai d'attente dépassé pour contacter le serveur API (${base}).`);
      } else {
        const message = error instanceof Error ? error.message : 'Erreur inconnue';
        errors.push(`${message} (${base})`);
      }
    } finally {
      clearTimeout(timeout);
    }
  }

  if (errors.length === 0) {
    throw new Error('Impossible de contacter le serveur API.');
  }

  throw new Error(errors.join(' | '));
};

interface ApiResponse<T> {
  data: T;
  total?: number;
  message?: string;
  error?: string;
  details?: Record<string, string>;
}

const parseResponse = async <T>(response: Response): Promise<ApiResponse<T>> => {
  const contentType = response.headers.get('content-type');
  if (!contentType?.includes('application/json')) {
    throw new Error('Réponse inattendue du serveur');
  }

  const payload = await response.json() as ApiResponse<T>;
  if (!response.ok) {
    const details = payload.details
      ? ` (${Object.values(payload.details).join(', ')})`
      : '';
    const message = payload.error ?? payload.message ?? response.statusText;
    throw new Error(`${message}${details}`.trim());
  }

  return payload;
};

export interface ProductQuery {
  search?: string;
  brand?: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  inStock?: boolean;
  limit?: number;
}

interface BackendProduct {
  id: number | string;
  name?: string;
  description?: string;
  short_description?: string;
  long_description?: string;
  brand?: string;
  category?: string;
  sale_price?: number | string;
  price?: number | string;
  image_url?: string | null;
  pending_image_url?: string | null;
  stock_quantity?: number;
  is_online?: boolean;
  tech_specs_json?: Record<string, unknown> | null;
}

const normalizeCategory = (value: string | undefined) => {
  const category = value?.trim();
  if (!category || category.toLowerCase() === 'all') {
    return 'Autres produits';
  }
  return category;
};

const resolveImage = (product: BackendProduct): string => {
  const candidate = product.image_url || product.pending_image_url || '';
  if (!candidate) {
    return '/images/products/default.jpg';
  }
  if (candidate.startsWith('http://') || candidate.startsWith('https://')) {
    return candidate;
  }
  const normalizedPath = candidate.startsWith('/') ? candidate : `/${candidate}`;
  return `${REMOTE_MEDIA_ORIGIN}${normalizedPath}`;
};

const buildFeatures = (product: BackendProduct): string[] => {
  const specs = product.tech_specs_json;
  if (!specs || typeof specs !== 'object') {
    return [];
  }

  return Object.entries(specs)
    .map(([key, value]) => `${key}: ${String(value)}`)
    .slice(0, 8);
};

const mapBackendProduct = (product: BackendProduct): Product => {
  const rawPrice = product.sale_price ?? product.price ?? 0;
  const parsedPrice = Number(rawPrice);

  return {
    id: String(product.id),
    name: product.name?.trim() || 'Produit sans nom',
    brand: product.brand?.trim() || 'Générique',
    category: normalizeCategory(product.category),
    price: Number.isFinite(parsedPrice) ? parsedPrice : 0,
    image: resolveImage(product),
    description: product.short_description || product.description || product.long_description || 'Description indisponible.',
    features: buildFeatures(product),
    inStock: (product.stock_quantity ?? 0) > 0,
  };
};

const isAllowedBrand = (product: Product) => product.brand.trim().toLowerCase() !== 'dahua';

const parseProductsPayload = (payload: unknown): BackendProduct[] => {
  if (Array.isArray(payload)) {
    return payload as BackendProduct[];
  }

  if (payload && typeof payload === 'object' && 'data' in payload) {
    const data = (payload as { data?: unknown }).data;
    return Array.isArray(data) ? (data as BackendProduct[]) : [];
  }

  if (payload && typeof payload === 'object' && 'results' in payload) {
    const results = (payload as { results?: unknown }).results;
    return Array.isArray(results) ? (results as BackendProduct[]) : [];
  }

  return [];
};

const parseProductPayload = (payload: unknown): BackendProduct => {
  if (payload && typeof payload === 'object' && 'data' in payload) {
    const data = (payload as { data?: unknown }).data;
    if (data && typeof data === 'object') {
      return data as BackendProduct;
    }
  }

  if (payload && typeof payload === 'object') {
    return payload as BackendProduct;
  }

  throw new Error('Format de produit inattendu.');
};

const applyProductQuery = (products: Product[], query?: ProductQuery): Product[] => {
  if (!query) return products;

  const search = query.search?.trim().toLowerCase();
  const brand = query.brand?.trim().toLowerCase();
  const category = query.category?.trim().toLowerCase();
  const inStock = query.inStock;
  const minPrice = typeof query.minPrice === 'number' ? query.minPrice : undefined;
  const maxPrice = typeof query.maxPrice === 'number' ? query.maxPrice : undefined;
  const limit = typeof query.limit === 'number' ? query.limit : undefined;

  let results = [...products];

  if (search) {
    results = results.filter((product) =>
      product.name.toLowerCase().includes(search) ||
      product.description.toLowerCase().includes(search)
    );
  }

  if (brand) {
    results = results.filter((product) => product.brand.toLowerCase() === brand);
  }

  if (category) {
    results = results.filter((product) => product.category.toLowerCase() === category);
  }

  if (typeof inStock === 'boolean') {
    results = results.filter((product) => product.inStock === inStock);
  }

  if (typeof minPrice === 'number') {
    results = results.filter((product) => product.price >= minPrice);
  }

  if (typeof maxPrice === 'number') {
    results = results.filter((product) => product.price <= maxPrice);
  }

  if (typeof limit === 'number' && limit > 0) {
    results = results.slice(0, limit);
  }

  return results;
};

export const fetchProducts = async (query?: ProductQuery): Promise<Product[]> => {
  try {
    const payload = await request<unknown>('/products', { params: query });
    const products = parseProductsPayload(payload)
      .map(mapBackendProduct)
      .filter((product) => product.inStock || query?.inStock === false)
      .filter(isAllowedBrand);

    return applyProductQuery(products, query);
  } catch (error) {
    console.warn('API product fetch failed, falling back to local data:', error);
    return applyProductQuery((fallbackProducts as Product[]).filter(isAllowedBrand), query);
  }
};

export const fetchProduct = async (id: string): Promise<Product> => {
  const payload = await request<unknown>(`/products/${id}`);
  return mapBackendProduct(parseProductPayload(payload));
};

export const fetchBlogPosts = async (limit?: number): Promise<BlogPost[]> => {
  const payload = await request<BlogPost[]>('/blog-posts', {
    params: limit ? { limit } : undefined,
  });
  return payload.data;
};

export const fetchBlogPost = async (id: string): Promise<BlogPost> => {
  const payload = await request<BlogPost>(`/blog-posts/${id}`);
  return payload.data;
};

export const fetchPromotions = async (): Promise<Promotion[]> => {
  const payload = await request<Promotion[]>('/promotions');
  return payload.data;
};

export interface ContactPayload {
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
}

export interface ContactResponse {
  message: string;
}

export const submitContact = async (payload: ContactPayload): Promise<ContactResponse> => {
  try {
    await saveContactToSupabase(payload);
    return { message: 'Message envoyé avec succès via Supabase.' };
  } catch (supabaseError) {
    console.warn('Supabase contact insert failed, falling back to API route:', supabaseError);
  }

  const result = await request<{ message: string }>('/contact', {
    init: {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    },
  });
  return { message: result.message ?? 'Message envoyé avec succès.' };
};
