/* eslint-disable react-refresh/only-export-components */
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  ReactNode,
} from 'react';
import { BlogPost, Product, Promotion } from '../types';
import { fetchBlogPosts, fetchProducts, fetchPromotions } from '../services/api';

interface DataContextValue {
  products: Product[];
  blogPosts: BlogPost[];
  promotions: Promotion[];
  productsLoading: boolean;
  blogPostsLoading: boolean;
  promotionsLoading: boolean;
  productsError: string | null;
  blogPostsError: string | null;
  promotionsError: string | null;
  refreshProducts: () => Promise<void>;
  refreshBlogPosts: () => Promise<void>;
  refreshPromotions: () => Promise<void>;
}

const DataContext = createContext<DataContextValue | undefined>(undefined);

export const DataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [productsLoading, setProductsLoading] = useState(true);
  const [blogPostsLoading, setBlogPostsLoading] = useState(true);
  const [promotionsLoading, setPromotionsLoading] = useState(true);
  const [productsError, setProductsError] = useState<string | null>(null);
  const [blogPostsError, setBlogPostsError] = useState<string | null>(null);
  const [promotionsError, setPromotionsError] = useState<string | null>(null);
  const isMountedRef = useRef(true);

  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const loadProducts = useCallback(async () => {
    setProductsLoading(true);
    try {
      const data = await fetchProducts();
      if (!isMountedRef.current) {
        return;
      }
      setProducts(data);
      setProductsError(null);
    } catch (error) {
      if (!isMountedRef.current) {
        return;
      }
      const message = error instanceof Error ? error.message : 'Impossible de charger les produits.';
      setProductsError(message);
    } finally {
      if (isMountedRef.current) {
        setProductsLoading(false);
      }
    }
  }, []);

  const loadBlogPosts = useCallback(async () => {
    setBlogPostsLoading(true);
    try {
      const data = await fetchBlogPosts();
      if (!isMountedRef.current) {
        return;
      }
      setBlogPosts(data);
      setBlogPostsError(null);
    } catch (error) {
      if (!isMountedRef.current) {
        return;
      }
      const message = error instanceof Error ? error.message : 'Impossible de charger les articles de blog.';
      setBlogPostsError(message);
    } finally {
      if (isMountedRef.current) {
        setBlogPostsLoading(false);
      }
    }
  }, []);

  const loadPromotions = useCallback(async () => {
    setPromotionsLoading(true);
    try {
      const data = await fetchPromotions();
      if (!isMountedRef.current) {
        return;
      }
      setPromotions(data);
      setPromotionsError(null);
    } catch (error) {
      if (!isMountedRef.current) {
        return;
      }
      const message = error instanceof Error ? error.message : 'Impossible de charger les promotions.';
      setPromotionsError(message);
    } finally {
      if (isMountedRef.current) {
        setPromotionsLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    loadProducts();
    loadBlogPosts();
    loadPromotions();
  }, [loadProducts, loadBlogPosts, loadPromotions]);

  const value = useMemo<DataContextValue>(() => ({
    products,
    blogPosts,
    promotions,
    productsLoading,
    blogPostsLoading,
    promotionsLoading,
    productsError,
    blogPostsError,
    promotionsError,
    refreshProducts: loadProducts,
    refreshBlogPosts: loadBlogPosts,
    refreshPromotions: loadPromotions,
  }), [
    products,
    blogPosts,
    promotions,
    productsLoading,
    blogPostsLoading,
    promotionsLoading,
    productsError,
    blogPostsError,
    promotionsError,
    loadProducts,
    loadBlogPosts,
    loadPromotions,
  ]);

  return (
    <DataContext.Provider value={value}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};
