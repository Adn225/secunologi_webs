import React, { useMemo, useState, useEffect } from 'react';
import { Search, Mic, History, Sparkles } from 'lucide-react';
import { useExperience } from '../contexts/ExperienceContext';
import { useData } from '../contexts/DataContext';

interface SmartSearchBarProps {
  onSearch: (term: string, category?: string | null) => void;
}

const DEFAULT_CATEGORY = 'Toutes les catégories';

const SmartSearchBar: React.FC<SmartSearchBarProps> = ({ onSearch }) => {
  const { products, productsLoading, productsError } = useData();
  const { recentSearches, trackSearch } = useExperience();
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<string>(DEFAULT_CATEGORY);
  const [showPanel, setShowPanel] = useState(false);
  const [voiceHint, setVoiceHint] = useState('');

  const categories = useMemo(() => {
    return [DEFAULT_CATEGORY, ...new Set(products.map(product => product.category))];
  }, [products]);

  useEffect(() => {
    if (!categories.includes(category)) {
      setCategory(DEFAULT_CATEGORY);
    }
  }, [categories, category]);

  useEffect(() => {
    if (!voiceHint) return;
    const timeout = window.setTimeout(() => setVoiceHint(''), 2200);
    return () => window.clearTimeout(timeout);
  }, [voiceHint]);

  const filteredSuggestions = useMemo(() => {
    if (products.length === 0) {
      return [];
    }

    const normalizedQuery = query.trim().toLowerCase();
    const normalizedCategory = category === DEFAULT_CATEGORY ? null : category;

    if (!normalizedQuery) {
      return products
        .filter(product => !normalizedCategory || product.category === normalizedCategory)
        .slice(0, 4);
    }

    return products
      .filter(product => {
        const matchesCategory = !normalizedCategory || product.category === normalizedCategory;
        if (!matchesCategory) {
          return false;
        }
        const haystack = `${product.name} ${product.description} ${product.brand}`.toLowerCase();
        return haystack.includes(normalizedQuery);
      })
      .slice(0, 5);
  }, [products, query, category]);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const normalizedCategory = category === DEFAULT_CATEGORY ? null : category;
    onSearch(query.trim(), normalizedCategory);
    if (query.trim()) {
      trackSearch(query);
    }
    setShowPanel(false);
  };

  const handleSuggestionClick = (term: string, suggestionCategory?: string) => {
    const normalizedCategory = suggestionCategory ?? (category === DEFAULT_CATEGORY ? null : category);
    setQuery(term);
    onSearch(term, normalizedCategory);
    if (term.trim()) {
      trackSearch(term);
    }
    setShowPanel(false);
  };

  const handleRecentSearchClick = (recentTerm: string) => {
    setQuery(recentTerm);
    onSearch(recentTerm, category === DEFAULT_CATEGORY ? null : category);
    trackSearch(recentTerm);
    setShowPanel(false);
  };

  const handleVoiceSearch = () => {
    setVoiceHint('Recherche vocale bientôt disponible');
  };

  return (
    <div className="relative w-full max-w-2xl">
      <form
        onSubmit={handleSubmit}
        className="flex bg-white rounded-full shadow-inner focus-within:ring-2 focus-within:ring-brand-green-500 overflow-hidden"
      >
        <div className="hidden lg:flex items-center px-4 text-sm text-gray-600 border-r border-gray-200 bg-gray-50">
          <select
            value={category}
            onChange={(event) => setCategory(event.target.value)}
            className="bg-transparent focus:outline-none"
            disabled={productsLoading}
          >
            {categories.map(option => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>
        <div className="flex-1 flex items-center px-4">
          <Search className="h-5 w-5 text-gray-400 mr-3" />
          <input
            type="text"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            onFocus={() => setShowPanel(true)}
            onBlur={() => window.setTimeout(() => setShowPanel(false), 120)}
            placeholder="Rechercher une caméra, un pack ou une marque..."
            className="w-full bg-transparent focus:outline-none text-sm"
          />
        </div>
        <button
          type="button"
          onClick={handleVoiceSearch}
          className="px-4 text-gray-500 hover:text-brand-green-600 transition-colors"
          aria-label="Recherche vocale"
        >
          <Mic className="h-5 w-5" />
        </button>
        <button
          type="submit"
          className="px-6 bg-brand-green-600 text-white font-semibold hover:bg-brand-green-700 transition-colors"
        >
          Rechercher
        </button>
      </form>

      {voiceHint && (
        <div className="absolute right-0 -bottom-10 bg-gray-900 text-white text-xs px-3 py-1 rounded-full">
          {voiceHint}
        </div>
      )}

      {showPanel && (
        <div className="absolute left-0 right-0 mt-2 bg-white rounded-xl shadow-2xl border border-gray-100 z-40 p-4">
          {recentSearches.length > 0 && (
            <div className="mb-3">
              <div className="flex items-center text-xs font-semibold uppercase text-gray-400 mb-2">
                <History className="h-3 w-3 mr-2" />
                Recherches récentes
              </div>
              <div className="flex flex-wrap gap-2">
                {recentSearches.map(recentTerm => (
                  <button
                    key={recentTerm}
                    type="button"
                    onMouseDown={(event) => event.preventDefault()}
                    onClick={() => handleRecentSearchClick(recentTerm)}
                    className="px-3 py-1 rounded-full bg-gray-100 text-sm text-gray-700 hover:bg-brand-green-50 hover:text-brand-green-700 transition-colors"
                  >
                    {recentTerm}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="flex items-center text-xs font-semibold uppercase text-gray-400 mb-2">
            <Sparkles className="h-3 w-3 mr-2 text-orange-400" />
            Suggestions intelligentes
          </div>
          <ul className="space-y-2">
            {productsError && (
              <li className="text-sm text-red-600 text-center py-2">{productsError}</li>
            )}
            {!productsError && productsLoading && (
              <li className="text-sm text-gray-500 text-center py-2">Chargement des suggestions...</li>
            )}
            {!productsError && !productsLoading && filteredSuggestions.length === 0 && (
              <li className="text-sm text-gray-500 text-center py-2">
                Aucun produit correspondant. Essayez un autre terme.
              </li>
            )}
            {!productsError && filteredSuggestions.length > 0 && (
              filteredSuggestions.map(product => (
                <li key={product.id}>
                  <button
                    type="button"
                    onMouseDown={(event) => event.preventDefault()}
                    onClick={() => handleSuggestionClick(product.name, product.category)}
                    className="w-full text-left px-3 py-2 rounded-lg hover:bg-brand-green-50 transition-colors"
                  >
                    <p className="text-sm font-medium text-gray-900">{product.name}</p>
                    <p className="text-xs text-gray-500">
                      {product.brand} · {product.category}
                    </p>
                  </button>
                </li>
              ))
            )}
          </ul>
        </div>
      )}
    </div>
  );
};

export default SmartSearchBar;
