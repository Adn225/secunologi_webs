import React, { useState, useEffect, lazy, Suspense } from 'react';
import Header from './components/Header';
import Footer from './components/Footer';
import ChatBot from './components/ChatBot';
import { CartProvider } from './contexts/CartContext';
import { DataProvider } from './contexts/DataContext';
import { AuthProvider } from './contexts/AuthContext';
import { ExperienceProvider, useExperience } from './contexts/ExperienceContext';
import { Product } from './types';

const Home = lazy(() => import('./pages/Home'));
const Catalog = lazy(() => import('./pages/Catalog'));
const Services = lazy(() => import('./pages/Services'));
const About = lazy(() => import('./pages/About'));
const Blog = lazy(() => import('./pages/Blog'));
const Contact = lazy(() => import('./pages/Contact'));
const Cart = lazy(() => import('./pages/Cart'));
const Account = lazy(() => import('./pages/Account'));

const sanitizePage = (path: string) => {
  if (path === 'admin') {
    return 'home';
  }
  return path === '' ? 'home' : path;
};

const AppShell: React.FC = () => {
  const [currentPage, setCurrentPage] = useState(() => {
    const path = window.location.pathname.replace('/', '');
    return sanitizePage(path);
  });
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
  };

  const handleSearch = (term: string, category?: string | null) => {
    setGlobalSearch(term, category ?? null);
    handleNavigate('catalog');
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
        return <Account />;
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
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <DataProvider>
        <ExperienceProvider>
          <CartProvider>
            <AppShell />
          </CartProvider>
        </ExperienceProvider>
      </DataProvider>
    </AuthProvider>
  );
}

export default App;
