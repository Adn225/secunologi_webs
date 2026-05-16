import ProtectedRoute from './components/ProtectedRoute';
import React, { useState, useEffect, lazy, Suspense } from 'react';
import Header from './components/Header';
import { AuthProvider } from './contexts/AuthContext';
import Footer from './components/Footer';
import ChatBot from './components/ChatBot';
import { CartProvider } from './contexts/CartContext';
import { DataProvider } from './contexts/DataContext';
import { ExperienceProvider, useExperience } from './contexts/ExperienceContext';
import { Product } from './types';
import ProductDetailsModal from './components/ProductDetailsModal';
import AdminDashboard from './pages/AdminDashboard';
import { supabase } from './utils/supabase';

const Home = lazy(() => import('./pages/Home'));
const Catalog = lazy(() => import('./pages/Catalog'));
const Services = lazy(() => import('./pages/Services'));
const About = lazy(() => import('./pages/About'));
const Blog = lazy(() => import('./pages/Blog'));
const BlogArticle = lazy(() => import('./pages/BlogArticle')); // <-- NOUVEAU
const Contact = lazy(() => import('./pages/Contact'));
const Cart = lazy(() => import('./pages/Cart'));
const Account = lazy(() => import('./pages/Account'));
const Signup = lazy(() => import('./pages/Signup'));

// On ajoute 'blog-article' aux pages valides
const VALID_PAGES = [
  'home', 'catalog', 'services', 'about', 'blog', 'blog-article', 'contact', 'cart', 'account', 'admin','signup',
] as const;

type Page = (typeof VALID_PAGES)[number];

// Nouvelle fonction pour lire l'URL et extraire l'ID de l'article si on est sur le blog
const parseRoute = (path: string) => {
  const normalized = path.replace(/^\/+/, '').replace(/\/+$/, '').toLowerCase();
  const parts = normalized.split('/');
  let page = parts[0] === '' ? 'home' : parts[0];
  let id = parts[1] || null;

  // Si l'URL est /blog/quelque-chose, c'est la page article
  if (page === 'blog' && id) {
    page = 'blog-article';
  }

  const candidate = (VALID_PAGES as readonly string[]).includes(page) ? (page as Page) : 'home';
  return { page: candidate, id };
};

const AppShell: React.FC = () => {
  // On initialise l'état avec la nouvelle fonction
  const initialRoute = parseRoute(window.location.pathname);
  const [currentPage, setCurrentPage] = useState<Page>(initialRoute.page);
  const [currentArticleId, setCurrentArticleId] = useState<string | null>(initialRoute.id); // <-- NOUVEAU : Stocke l'ID de l'article

  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const { trackViewedProduct, setGlobalSearch } = useExperience();

  useEffect(() => {
    const onPopState = () => {
      const route = parseRoute(window.location.pathname);
      setCurrentPage(route.page);
      setCurrentArticleId(route.id);
    };
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  // handleNavigate accepte maintenant un 2ème paramètre optionnel : l'id
  const handleNavigate = (page: string, id?: string) => {
    let url = '/';
    let targetPage = page as Page;

    if (page === 'blog-article' && id) {
      url = `/blog/${id}`;
      setCurrentArticleId(id);
    } else {
      targetPage = (VALID_PAGES as readonly string[]).includes(page as any) ? (page as Page) : 'home';
      url = targetPage === 'home' ? '/' : `/${targetPage}`;
      setCurrentArticleId(null);
    }

    setCurrentPage(targetPage);
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

  const renderPage = () => {
    switch (currentPage) {
      case 'home': return <Home onNavigate={handleNavigate} onViewProduct={handleViewProduct} />;
      case 'catalog': return <Catalog onViewProduct={handleViewProduct} />;
      case 'services': return <Services onNavigate={handleNavigate} />;
      case 'about': return <About />;
      
      case 'blog': return <Blog onNavigate={handleNavigate} />; // <-- MODIFIÉ : On passe handleNavigate
      case 'blog-article': return <BlogArticle articleId={currentArticleId} onNavigate={handleNavigate} />; // <-- NOUVEAU
      
      case 'contact': return <Contact />;
      case 'cart': return <ProtectedRoute onNavigate={handleNavigate}><Cart onNavigate={handleNavigate} /></ProtectedRoute>;
      case 'account': return <Account onNavigate={handleNavigate} />;
      case 'admin': return <ProtectedRoute onNavigate={handleNavigate}><AdminDashboard/></ProtectedRoute>;
      case 'signup': return <Signup onNavigate={handleNavigate} />;
      default: return <Home onNavigate={handleNavigate} onViewProduct={handleViewProduct} />;
    }
  };

  // ... (Le reste du code, le return() et App() restent identiques) ...
// N'oubliez pas d'importer votre client Supabase tout en haut du fichier
// import { supabase } from './chemin/vers/votre/fichier/supabase';


    // Remplacez 'utilisateurs' par le nom d'une table qui existe VRAIMENT dans votre base

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
