import { BlogPost, Product, Promotion } from '../types';

const DEFAULT_API_BASE = '/api';

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

export const fetchProducts = async (query?: ProductQuery): Promise<Product[]> => {
  const payload = await request<Product[]>('/products', { params: query });
  return payload.data;
};

export const fetchProduct = async (id: string): Promise<Product> => {
  const payload = await request<Product>(`/products/${id}`);
  return payload.data;
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

