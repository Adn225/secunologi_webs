import { BlogPost, Product } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? '/api';

type Primitive = string | number | boolean | null | undefined;

const buildUrl = (path: string, params?: Record<string, Primitive>) => {
  const url = `${API_BASE_URL}${path}`;
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
  const response = await fetch(buildUrl('/products', query));
  const payload = await parseResponse<Product[]>(response);
  return payload.data;
};

export const fetchProduct = async (id: string): Promise<Product> => {
  const response = await fetch(buildUrl(`/products/${id}`));
  const payload = await parseResponse<Product>(response);
  return payload.data;
};

export const fetchBlogPosts = async (limit?: number): Promise<BlogPost[]> => {
  const response = await fetch(buildUrl('/blog-posts', limit ? { limit } : undefined));
  const payload = await parseResponse<BlogPost[]>(response);
  return payload.data;
};

export const fetchBlogPost = async (id: string): Promise<BlogPost> => {
  const response = await fetch(buildUrl(`/blog-posts/${id}`));
  const payload = await parseResponse<BlogPost>(response);
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
  const response = await fetch(buildUrl('/contact'), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  const result = await parseResponse<{ message: string }>(response);
  return { message: result.message ?? 'Message envoyé avec succès.' };
};
