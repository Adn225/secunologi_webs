import React, { useState } from 'react';
import { Menu, X, ShoppingCart, User, Search } from 'lucide-react';
import logo from '../assets/logo.svg';
import { useCart } from '../contexts/CartContext';
import SmartSearchBar from './SmartSearchBar';

interface HeaderProps {
  currentPage: string;
  onNavigate: (page: string) => void;
  onSearch: (term: string, category?: string | null) => void;
}

const Header: React.FC<HeaderProps> = ({ currentPage, onNavigate, onSearch }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { state } = useCart();

  const navigation = [
    { name: 'Accueil', id: 'home' },
    { name: 'Catalogue', id: 'catalog' },
    { name: 'Services', id: 'services' },
    { name: 'À propos', id: 'about' },
    { name: 'Blog', id: 'blog' },
    { name: 'Contact', id: 'contact' },
    { name: 'Administration', id: 'admin' },
  ];

  return (
    <header className="bg-white shadow-lg relative z-50">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 gap-4">
          <a
            href="/"
            onClick={(e) => {
              e.preventDefault();
              onNavigate('home');
            }}
            className="flex items-center flex-shrink-0"
          >
            <img
              src={logo}
              alt="Secunologie Côte d'Ivoire"
              className="h-10 w-auto"
            />
          </a>

          <div className="hidden lg:flex flex-1 justify-center">
            <SmartSearchBar onSearch={onSearch} />
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-4">
              {navigation.map((item) => (
                <a
                  key={item.id}
                  href={item.id === 'home' ? '/' : `/${item.id}`}
                  onClick={(e) => {
                    e.preventDefault();
                    onNavigate(item.id);
                  }}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                    currentPage === item.id
                      ? 'bg-brand-green-600 text-white'
                      : 'text-gray-700 hover:bg-brand-green-50 hover:text-brand-green-600'
                  }`}
                >
                  {item.name}
                </a>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center space-x-4">
            <div className="lg:hidden">
              <button
                className="text-gray-700 hover:text-brand-green-600 transition-colors duration-200"
                onClick={() => setIsMenuOpen(true)}
                aria-label="Ouvrir la recherche"
              >
                <Search className="h-5 w-5" />
              </button>
            </div>
            
            <a
              href="/cart"
              onClick={(e) => {
                e.preventDefault();
                onNavigate('cart');
              }}
              className="text-gray-700 hover:text-brand-green-600 transition-colors duration-200 relative"
            >
              <ShoppingCart className="h-5 w-5" />
              {state.items.length > 0 && (
                <span className="absolute -top-2 -right-2 bg-orange-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {state.items.length}
                </span>
              )}
            </a>
            
            <a
              href="/account"
              onClick={(e) => {
                e.preventDefault();
                onNavigate('account');
              }}
              className="text-gray-700 hover:text-brand-green-600 transition-colors duration-200"
            >
              <User className="h-5 w-5" />
            </a>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="text-gray-700 hover:text-brand-green-600 transition-colors duration-200"
              >
                {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white border-t">
              <div className="py-2">
                <SmartSearchBar onSearch={onSearch} />
              </div>
              {navigation.map((item) => (
                <a
                  key={item.id}
                  href={item.id === 'home' ? '/' : `/${item.id}`}
                  onClick={(e) => {
                    e.preventDefault();
                    onNavigate(item.id);
                    setIsMenuOpen(false);
                  }}
                  className={`block w-full text-left px-3 py-2 rounded-md text-base font-medium transition-colors duration-200 ${
                    currentPage === item.id
                      ? 'bg-brand-green-600 text-white'
                      : 'text-gray-700 hover:bg-brand-green-50 hover:text-brand-green-600'
                  }`}
                >
                  {item.name}
                </a>
              ))}
            </div>
          </div>
        )}
      </nav>
    </header>
  );
};

export default Header;
