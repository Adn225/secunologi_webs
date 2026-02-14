import React, { useMemo, useState } from 'react';
import { ShoppingCart, Eye, Star } from 'lucide-react';
import { Product } from '../types';
import { useCart } from '../contexts/CartContext';
import { useExperience } from '../contexts/ExperienceContext';

interface ProductCardProps {
  product: Product;
  onViewDetails: (product: Product) => void;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, onViewDetails }) => {
  const { state, dispatch } = useCart();
  const { trackAddedToCart } = useExperience();

  const [isQuantitySelectorOpen, setIsQuantitySelectorOpen] = useState(false);
  const [selectedQuantity, setSelectedQuantity] = useState(1);

  const quantityInCart = useMemo(() => {
    return state.items.find((item) => item.product.id === product.id)?.quantity ?? 0;
  }, [product.id, state.items]);

  const handleShowQuantitySelector = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    if (product.inStock) {
      setSelectedQuantity(1);
      setIsQuantitySelectorOpen(true);
    }
  };

  const handleConfirmAddToCart = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    dispatch({ type: 'ADD_ITEM', payload: { product, quantity: selectedQuantity } });
    trackAddedToCart(product);
    setIsQuantitySelectorOpen(false);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('fr-FR').format(price) + ' FCFA';
  };

  return (
    <div
      className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300 group cursor-pointer"
      onClick={() => onViewDetails(product)}
      role="button"
      tabIndex={0}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          onViewDetails(product);
        }
      }}
      aria-label={`Voir les détails du produit ${product.name}`}
    >
      <div className="relative overflow-hidden">
        <img
          src={product.image}
          alt={product.name}
          loading="lazy"
          decoding="async"
          className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute top-2 left-2">
          <span className="bg-brand-green-600 text-white px-2 py-1 rounded text-xs font-medium">
            {product.brand}
          </span>
        </div>
        {!product.inStock && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <span className="bg-red-500 text-white px-3 py-1 rounded font-medium">
              Rupture de stock
            </span>
          </div>
        )}
        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <button
            onClick={(event) => {
              event.stopPropagation();
              onViewDetails(product);
            }}
            className="bg-white p-2 rounded-full shadow-lg hover:bg-gray-50 transition-colors"
            aria-label={`Ouvrir les détails de ${product.name}`}
          >
            <Eye className="h-4 w-4 text-gray-600" />
          </button>
        </div>
      </div>

      <div className="p-4">
        <div className="flex items-center mb-2">
          <div className="flex text-yellow-400">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star key={star} className="h-4 w-4 fill-current" />
            ))}
          </div>
          <span className="text-gray-500 text-sm ml-2">(4.8)</span>
        </div>

        <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
          {product.name}
        </h3>

        <p className="text-gray-600 text-sm mb-3 line-clamp-2">
          {product.description}
        </p>


        {quantityInCart > 0 && (
          <div className="mb-3 inline-flex items-center rounded-full bg-brand-green-100 px-3 py-1 text-xs font-semibold text-brand-green-700">
            Déjà dans le panier : {quantityInCart}
          </div>
        )}

        <div className="flex items-center justify-between">
          <span className="text-2xl font-bold text-brand-green-700">
            {formatPrice(product.price)}
          </span>

          {isQuantitySelectorOpen ? (
            <div className="flex items-center gap-2" onClick={(event) => event.stopPropagation()}>
              <div className="flex items-center border border-gray-300 rounded-lg">
                <button
                  type="button"
                  className="px-2 py-1 text-gray-700 hover:bg-gray-100 rounded-l-lg"
                  onClick={() => setSelectedQuantity((prev) => Math.max(1, prev - 1))}
                  aria-label="Réduire la quantité"
                >
                  -
                </button>
                <span className="px-3 py-1 text-sm font-semibold">{selectedQuantity}</span>
                <button
                  type="button"
                  className="px-2 py-1 text-gray-700 hover:bg-gray-100 rounded-r-lg"
                  onClick={() => setSelectedQuantity((prev) => prev + 1)}
                  aria-label="Augmenter la quantité"
                >
                  +
                </button>
              </div>

              <button
                type="button"
                onClick={handleConfirmAddToCart}
                className="flex items-center px-3 py-2 rounded-lg font-medium transition-colors bg-brand-green-600 text-white hover:bg-brand-green-700"
              >
                <ShoppingCart className="h-4 w-4 mr-2" />
                OK
              </button>
            </div>
          ) : (
            <button
              onClick={handleShowQuantitySelector}
              disabled={!product.inStock}
              className={`flex items-center px-4 py-2 rounded-lg font-medium transition-colors ${
                product.inStock
                  ? 'bg-brand-green-600 text-white hover:bg-brand-green-700'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              <ShoppingCart className="h-4 w-4 mr-2" />
              Ajouter
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
