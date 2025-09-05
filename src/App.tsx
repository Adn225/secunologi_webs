import React, { useState } from 'react';
import Header from './components/Header';
import Footer from './components/Footer';
import ChatBot from './components/ChatBot';
import Home from './pages/Home';
import Catalog from './pages/Catalog';
import Services from './pages/Services';
import About from './pages/About';
import Blog from './pages/Blog';
import Contact from './pages/Contact';
import Cart from './pages/Cart';
import Account from './pages/Account';
import { CartProvider } from './contexts/CartContext';
import { Product } from './types';

function App() {
  const [currentPage, setCurrentPage] = useState('home');

  const handleNavigate = (page: string) => {
    setCurrentPage(page);
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
          {renderPage()}
        </main>
        <Footer />
        <ChatBot />
      </div>
    </CartProvider>
  );
}

export default App;