import React, { useState, useMemo, useEffect } from 'react';
import { Filter, Grid, List, Search } from 'lucide-react';
import ProductCard from '../components/ProductCard';
import { Product } from '../types';
import { useExperience } from '../contexts/ExperienceContext';
import { useData } from '../contexts/DataContext';

interface CatalogProps {
  onViewProduct: (product: Product) => void;
}

const Catalog: React.FC<CatalogProps> = ({ onViewProduct }) => {
  const { products, productsLoading, productsError } = useData();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBrand, setSelectedBrand] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 200000]);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(false);
  const { globalSearch, clearGlobalSearch, recentSearches, trackSearch } = useExperience();

  useEffect(() => {
    document.title = 'Catalogue produits par catégorie | SecunologieCI';
  }, []);

  const brands = useMemo(() => [...new Set(products.map(p => p.brand))], [products]);
  const categories = useMemo(() => [...new Set(products.map(p => p.category))], [products]);

  useEffect(() => {
    if (!globalSearch) return;
    setSearchTerm(globalSearch.term);
    setSelectedCategory(globalSearch.category ?? '');
    clearGlobalSearch();
  }, [globalSearch, clearGlobalSearch]);

  const filteredProducts = useMemo(() => {
    return products.filter(product => {
      const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           product.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesBrand = !selectedBrand || product.brand === selectedBrand;
      const matchesCategory = !selectedCategory || product.category === selectedCategory;
      const matchesPrice = product.price >= priceRange[0] && product.price <= priceRange[1];

      return matchesSearch && matchesBrand && matchesCategory && matchesPrice;
    });
  }, [products, searchTerm, selectedBrand, selectedCategory, priceRange]);

  const groupedProducts = useMemo(() => {
    const grouped = new Map<string, Product[]>();
    filteredProducts.forEach((product) => {
      const key = product.category || 'Autres produits';
      if (!grouped.has(key)) {
        grouped.set(key, []);
      }
      grouped.get(key)?.push(product);
    });

    return Array.from(grouped.entries()).sort((a, b) => a[0].localeCompare(b[0], 'fr'));
  }, [filteredProducts]);

  const clearFilters = () => {
    setSelectedBrand('');
    setSelectedCategory('');
    setPriceRange([0, 200000]);
    setSearchTerm('');
  };

  const handleApplyRecentSearch = (term: string) => {
    setSearchTerm(term);
    trackSearch(term);
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Catalogue produits</h1>
          <p className="text-gray-600">
            Découvrez notre gamme complète de solutions de sécurité électronique, classée par catégorie.
          </p>
        </div>

        {/* Search and View Toggle */}
        <div className="mb-6 flex flex-col sm:flex-row gap-4 justify-between">
          <div className="flex-1 max-w-md relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher un produit..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-green-500 focus:border-transparent"
            />
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Filter className="h-4 w-4 mr-2" />
              Filtres
            </button>
            <div className="flex border border-gray-300 rounded-lg overflow-hidden">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 ${viewMode === 'grid' ? 'bg-brand-green-600 text-white' : 'bg-white text-gray-600'}`}
              >
                <Grid className="h-4 w-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 ${viewMode === 'list' ? 'bg-brand-green-600 text-white' : 'bg-white text-gray-600'}`}
              >
                <List className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        {recentSearches.length > 0 && (
          <div className="mb-6">
            <p className="text-xs uppercase tracking-wide text-gray-500 mb-2">Inspiré de vos recherches</p>
            <div className="flex flex-wrap gap-2">
              {recentSearches.map(recentTerm => (
                <button
                  key={recentTerm}
                  onClick={() => handleApplyRecentSearch(recentTerm)}
                  className="px-3 py-1 text-sm rounded-full border border-gray-200 bg-white text-gray-700 hover:border-brand-green-500 hover:text-brand-green-600 transition-colors"
                  type="button"
                >
                  {recentTerm}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="flex gap-8">
          {/* Filters Sidebar */}
          <div className={`w-64 space-y-6 ${showFilters ? 'block' : 'hidden lg:block'}`}>
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="font-semibold mb-4">Filtres</h3>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Marque
                </label>
                <select
                  value={selectedBrand}
                  onChange={(e) => setSelectedBrand(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-brand-green-500 focus:border-transparent"
                >
                  <option value="">Toutes les marques</option>
                  {brands.map(brand => (
                    <option key={brand} value={brand}>{brand}</option>
                  ))}
                </select>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Catégorie
                </label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-brand-green-500 focus:border-transparent"
                >
                  <option value="">Toutes les catégories</option>
                  {categories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Prix (FCFA)
                </label>
                <div className="space-y-2">
                  <input
                    type="range"
                    min="0"
                    max="200000"
                    step="5000"
                    value={priceRange[1]}
                    onChange={(e) => setPriceRange([0, parseInt(e.target.value)])}
                    className="w-full"
                  />
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>0 FCFA</span>
                    <span>{priceRange[1].toLocaleString()} FCFA</span>
                  </div>
                </div>
              </div>

              <button
                onClick={clearFilters}
                className="w-full text-brand-green-600 hover:text-brand-green-700 font-medium"
              >
                Réinitialiser les filtres
              </button>
            </div>
          </div>

          <div className="flex-1">
            <div className="mb-4 flex justify-between items-center">
              <p className="text-gray-600">
                {productsLoading ? 'Chargement des produits...' : `${filteredProducts.length} produit(s) trouvé(s)`}
              </p>
              {productsError && <p className="text-sm text-red-600">{productsError}</p>}
            </div>

            {productsLoading ? (
              <div className="text-center py-12 text-gray-500">Chargement du catalogue...</div>
            ) : productsError ? (
              <div className="text-center py-12 text-red-600">Impossible d'afficher les produits pour le moment.</div>
            ) : filteredProducts.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500">Aucun produit trouvé avec ces critères.</p>
              </div>
            ) : (
              <div className="space-y-8">
                {groupedProducts.map(([category, categoryProducts]) => (
                  <section key={category} aria-label={`Catégorie ${category}`}>
                    <h2 className="text-xl font-bold text-gray-900 mb-4">{category}</h2>
                    <div
                      className={`grid gap-6 ${
                        viewMode === 'grid'
                          ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'
                          : 'grid-cols-1'
                      }`}
                    >
                      {categoryProducts.map((product) => (
                        <ProductCard
                          key={product.id}
                          product={product}
                          onViewDetails={onViewProduct}
                        />
                      ))}
                    </div>
                  </section>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Catalog;
