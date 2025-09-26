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
import { BlogPost, Product } from '../types';
import { fetchBlogPosts, fetchProducts } from '../services/api';

interface DataContextValue {
  products: Product[];
  blogPosts: BlogPost[];
  productsLoading: boolean;
  blogPostsLoading: boolean;
  productsError: string | null;
  blogPostsError: string | null;
  refreshProducts: () => Promise<void>;
  refreshBlogPosts: () => Promise<void>;
}

const DataContext = createContext<DataContextValue | undefined>(undefined);

export const DataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
  const [productsLoading, setProductsLoading] = useState(true);
  const [blogPostsLoading, setBlogPostsLoading] = useState(true);
  const [productsError, setProductsError] = useState<string | null>(null);
  const [blogPostsError, setBlogPostsError] = useState<string | null>(null);
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

  useEffect(() => {
    loadProducts();
    loadBlogPosts();
  }, [loadProducts, loadBlogPosts]);

  const value = useMemo<DataContextValue>(() => ({
    products,
    blogPosts,
    productsLoading,
    blogPostsLoading,
    productsError,
    blogPostsError,
    refreshProducts: loadProducts,
    refreshBlogPosts: loadBlogPosts,
  }), [
    products,
    blogPosts,
    productsLoading,
    blogPostsLoading,
    productsError,
    blogPostsError,
    loadProducts,
    loadBlogPosts,
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
