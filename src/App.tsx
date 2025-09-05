import React, { useState, useEffect, lazy, Suspense } from 'react';
import Header from './components/Header';
import Footer from './components/Footer';
import ChatBot from './components/ChatBot';
import { CartProvider } from './contexts/CartContext';
import { Product } from './types';

const Home = lazy(() => import('./pages/Home'));
const Catalog = lazy(() => import('./pages/Catalog'));
const Services = lazy(() => import('./pages/Services'));
const About = lazy(() => import('./pages/About'));
const Blog = lazy(() => import('./pages/Blog'));
const Contact = lazy(() => import('./pages/Contact'));
const Cart = lazy(() => import('./pages/Cart'));
const Account = lazy(() => import('./pages/Account'));

function App() {
  const [currentPage, setCurrentPage] = useState(() => {
    const path = window.location.pathname.replace('/', '');
    return path === '' ? 'home' : path;
  });

  useEffect(() => {
    const onPopState = () => {
      const path = window.location.pathname.replace('/', '') || 'home';
      setCurrentPage(path);
    };
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  const handleNavigate = (page: string) => {
    setCurrentPage(page);
    const url = page === 'home' ? '/' : `/${page}`;
    window.history.pushState(null, '', url);
    window.scrollTo(0, 0);
  };

  const handleViewProduct = (product: Product) => {
    // For now, just log the product. In a real app, you'd navigate to a product detail page
    console.log('Viewing product:', product);
    // You could set a product detail page here
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
    <CartProvider>
      <div className="min-h-screen bg-white flex flex-col">
        <Header currentPage={currentPage} onNavigate={handleNavigate} />
        <main className="flex-1">
          <Suspense fallback={<div className="p-4">Chargement...</div>}>
            {renderPage()}
          </Suspense>
        </main>
        <Footer />
        <ChatBot />
      </div>
    </CartProvider>
  );
}

export default App;
