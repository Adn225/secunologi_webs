/* eslint-disable react-refresh/only-export-components */
import React, {
  createContext,
  useContext,
  useState,
  useMemo,
  useCallback,
  ReactNode,
  useEffect,
} from 'react';
import { Product } from '../types';
import { useData } from './DataContext';

type GlobalSearch = {
  term: string;
  category?: string | null;
};

interface ExperienceContextValue {
  recentSearches: string[];
  recentlyViewedProducts: Product[];
  lastAddedProduct: Product | null;
  globalSearch: GlobalSearch | null;
  trackSearch: (term: string) => void;
  trackViewedProduct: (product: Product) => void;
  trackAddedToCart: (product: Product) => void;
  setGlobalSearch: (term: string, category?: string | null) => void;
  clearGlobalSearch: () => void;
}

const ExperienceContext = createContext<ExperienceContextValue | undefined>(undefined);

const RECENT_SEARCHES_KEY = 'experience_recent_searches';
const RECENTLY_VIEWED_KEY = 'experience_recently_viewed';
const LAST_ADDED_KEY = 'experience_last_added';

const loadArrayFromStorage = (key: string) => {
  if (typeof window === 'undefined') {
    return [] as string[];
  }

  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return [] as string[];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as string[]) : [];
  } catch (error) {
    console.warn('Unable to read experience data from storage', error);
    return [] as string[];
  }
};

const loadValueFromStorage = (key: string) => {
  if (typeof window === 'undefined') {
    return null as string | null;
  }

  try {
    return window.localStorage.getItem(key);
  } catch (error) {
    console.warn('Unable to read experience value from storage', error);
    return null;
  }
};

const persistArrayToStorage = (key: string, value: string[]) => {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.warn('Unable to persist experience data to storage', error);
  }
};

const persistValueToStorage = (key: string, value: string | null) => {
  if (typeof window === 'undefined') return;
  try {
    if (value) {
      window.localStorage.setItem(key, value);
    } else {
      window.localStorage.removeItem(key);
    }
  } catch (error) {
    console.warn('Unable to persist experience value to storage', error);
  }
};

const dedupeWithLimit = (items: string[], item: string, limit = 6) => {
  const filtered = items.filter(existing => existing !== item);
  return [item, ...filtered].slice(0, limit);
};

export const ExperienceProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { products } = useData();
  const [recentSearches, setRecentSearches] = useState<string[]>(() => loadArrayFromStorage(RECENT_SEARCHES_KEY));
  const [recentlyViewedIds, setRecentlyViewedIds] = useState<string[]>(() => loadArrayFromStorage(RECENTLY_VIEWED_KEY));
  const [lastAddedId, setLastAddedId] = useState<string | null>(() => loadValueFromStorage(LAST_ADDED_KEY));
  const [globalSearch, setGlobalSearchState] = useState<GlobalSearch | null>(null);

  useEffect(() => {
    persistArrayToStorage(RECENT_SEARCHES_KEY, recentSearches);
  }, [recentSearches]);

  useEffect(() => {
    persistArrayToStorage(RECENTLY_VIEWED_KEY, recentlyViewedIds);
  }, [recentlyViewedIds]);

  useEffect(() => {
    persistValueToStorage(LAST_ADDED_KEY, lastAddedId);
  }, [lastAddedId]);

  const trackSearch = useCallback((term: string) => {
    const normalized = term.trim();
    if (!normalized) return;
    setRecentSearches(prev => dedupeWithLimit(prev, normalized));
  }, []);

  const trackViewedProduct = useCallback((product: Product) => {
    setRecentlyViewedIds(prev => dedupeWithLimit(prev, product.id));
  }, []);

  const trackAddedToCart = useCallback((product: Product) => {
    setLastAddedId(product.id);
  }, []);

  const setGlobalSearch = useCallback((term: string, category?: string | null) => {
    setGlobalSearchState({ term, category: category ?? null });
  }, []);

  const clearGlobalSearch = useCallback(() => {
    setGlobalSearchState(null);
  }, []);

  const recentlyViewedProducts = useMemo(() => {
    return recentlyViewedIds
      .map(id => products.find(product => product.id === id))
      .filter((product): product is Product => Boolean(product));
  }, [recentlyViewedIds, products]);

  const lastAddedProduct = useMemo(() => {
    if (!lastAddedId) return null;
    return products.find(product => product.id === lastAddedId) ?? null;
  }, [lastAddedId, products]);

  const value = useMemo<ExperienceContextValue>(() => ({
    recentSearches,
    recentlyViewedProducts,
    lastAddedProduct,
    globalSearch,
    trackSearch,
    trackViewedProduct,
    trackAddedToCart,
    setGlobalSearch,
    clearGlobalSearch,
  }), [
    recentSearches,
    recentlyViewedProducts,
    lastAddedProduct,
    globalSearch,
    trackSearch,
    trackViewedProduct,
    trackAddedToCart,
    setGlobalSearch,
    clearGlobalSearch,
  ]);

  return <ExperienceContext.Provider value={value}>{children}</ExperienceContext.Provider>;
};

export const useExperience = () => {
  const context = useContext(ExperienceContext);
  if (!context) {
    throw new Error('useExperience must be used within an ExperienceProvider');
  }
  return context;
};
