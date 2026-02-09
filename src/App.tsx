import React, { useState, useEffect, lazy, Suspense } from 'react';
import Header from './components/Header';
import Footer from './components/Footer';
import ChatBot from './components/ChatBot';
import { CartProvider } from './contexts/CartContext';
import { DataProvider } from './contexts/DataContext';
import { ExperienceProvider, useExperience } from './contexts/ExperienceContext';
import { Product } from './types';
import ProductDetailsModal from './components/ProductDetailsModal';

const Home = lazy(() => import('./pages/Home'));
const Catalog = lazy(() => import('./pages/Catalog'));
const Services = lazy(() => import('./pages/Services'));
const About = lazy(() => import('./pages/About'));
const Blog = lazy(() => import('./pages/Blog'));
const Contact = lazy(() => import('./pages/Contact'));
const Cart = lazy(() => import('./pages/Cart'));
const Account = lazy(() => import('./pages/Account'));
const Auth = lazy(() => import('./pages/Auth'));

const VALID_PAGES = [
  'home',
  'catalog',
  'services',
  'about',
  'blog',
  'contact',
  'cart',
  'account',
  'auth',
] as const;

type Page = (typeof VALID_PAGES)[number];

const sanitizePage = (path: string): Page => {
  const normalized = path.replace(/^\/+/, '').replace(/\/+$/, '').toLowerCase();
  const candidate = (normalized === '' ? 'home' : normalized) as Page | string;
  return (VALID_PAGES as readonly string[]).includes(candidate) ? (candidate as Page) : 'home';
};

const AppShell: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<Page>(() => {
    const path = window.location.pathname.replace('/', '');
    return sanitizePage(path);
  });
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const { trackViewedProduct, setGlobalSearch } = useExperience();

  useEffect(() => {
    const onPopState = () => {
      const path = sanitizePage(window.location.pathname.replace('/', '') || 'home');
      setCurrentPage(path);
    };
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  const handleNavigate = (page: string) => {
    const safePage = sanitizePage(page);
    setCurrentPage(safePage);
    const url = safePage === 'home' ? '/' : `/${safePage}`;
    window.history.pushState(null, '', url);
    window.scrollTo(0, 0);
  };

  const handleViewProduct = (product: Product) => {
    trackViewedProduct(product);
    setSelectedProduct(product);
  };

  const handleSearch = (term: string, category?: string | null) => {
    setGlobalSearch(term, category ?? null);
    handleNavigate('catalog');
  };

  const handleLogout = () => {
    handleNavigate('auth');
  };

  const handleLoginSuccess = () => {
    handleNavigate('account');
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'home':
        return <Home onNavigate={handleNavigate} onViewProduct={handleViewProduct} />;
      case 'catalog':
        return <Catalog onViewProduct={handleViewProduct} />;
      case 'services':
        return <Services onNavigate={handleNavigate} />;
      case 'about':
        return <About />;
      case 'blog':
        return <Blog />;
      case 'contact':
        return <Contact />;
      case 'cart':
        return <Cart onNavigate={handleNavigate} />;
      case 'account':
        return <Account onLogout={handleLogout} />;
      case 'auth':
        return <Auth onLoginSuccess={handleLoginSuccess} />;
      default:
        return <Home onNavigate={handleNavigate} onViewProduct={handleViewProduct} />;
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Header currentPage={currentPage} onNavigate={handleNavigate} onSearch={handleSearch} />
      <main className="flex-1">
        <Suspense fallback={<div className="p-4">Chargement...</div>}>
          {renderPage()}
        </Suspense>
      </main>
      <Footer />
      <ChatBot />
      <ProductDetailsModal product={selectedProduct} onClose={() => setSelectedProduct(null)} />
    </div>
  );
};

function App() {
  return (
    <DataProvider>
      <ExperienceProvider>
        <CartProvider>
          <AppShell />
        </CartProvider>
      </ExperienceProvider>
    </DataProvider>
  );
}

export default App;
