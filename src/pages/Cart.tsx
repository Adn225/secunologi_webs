import React from 'react';
import { Trash2, Plus, Minus, CreditCard, Smartphone } from 'lucide-react';
import { useCart } from '../contexts/CartContext';

interface CartProps {
  onNavigate: (page: string) => void;
}

const Cart: React.FC<CartProps> = ({ onNavigate }) => {
  const { state, dispatch } = useCart();

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('fr-FR').format(price) + ' FCFA';
  };

  const updateQuantity = (id: string, quantity: number) => {
    dispatch({ type: 'UPDATE_QUANTITY', payload: { id, quantity } });
  };

  const removeItem = (id: string) => {
    dispatch({ type: 'REMOVE_ITEM', payload: id });
  };

  if (state.items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 pt-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-16">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Votre panier est vide</h1>
            <p className="text-gray-600 mb-8">Découvrez nos produits et ajoutez-les à votre panier</p>
            <button
              onClick={() => onNavigate('catalog')}
              className="bg-olive-700 text-white px-8 py-3 rounded-lg font-semibold hover:bg-olive-800 transition-colors"
            >
              Voir le catalogue
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Votre panier</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {state.items.map((item) => (
              <div key={item.product.id} className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center gap-4">
                  <img
                    src={item.product.image}
                    alt={item.product.name}
                    className="w-20 h-20 object-cover rounded-lg"
                  />
                  
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">{item.product.name}</h3>
                    <p className="text-sm text-gray-600">{item.product.brand}</p>
                    <p className="text-lg font-bold text-olive-700">
                      {formatPrice(item.product.price)}
                    </p>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                      className="p-1 hover:bg-gray-100 rounded"
                    >
                      <Minus className="h-4 w-4" />
                    </button>
                    <span className="w-8 text-center font-semibold">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                      className="p-1 hover:bg-gray-100 rounded"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                  
                  <button
                    onClick={() => removeItem(item.product.id)}
                    className="text-red-500 hover:text-red-700 p-2"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Order Summary */}
          <div className="bg-white rounded-lg shadow p-6 h-fit">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Résumé de la commande</h2>
            
            <div className="space-y-3 mb-6">
              <div className="flex justify-between">
                <span>Sous-total</span>
                <span>{formatPrice(state.total)}</span>
              </div>
              <div className="flex justify-between">
                <span>Livraison</span>
                <span>Gratuite</span>
              </div>
              <div className="border-t pt-3">
                <div className="flex justify-between font-bold text-lg">
                  <span>Total</span>
                  <span className="text-olive-700">{formatPrice(state.total)}</span>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <h3 className="font-semibold text-gray-900">Modes de paiement</h3>
              
              <button className="w-full flex items-center justify-center gap-3 bg-orange-500 text-white py-3 rounded-lg font-semibold hover:bg-orange-600 transition-colors">
                <Smartphone className="h-5 w-5" />
                Mobile Money
              </button>
              
              <button className="w-full flex items-center justify-center gap-3 bg-olive-700 text-white py-3 rounded-lg font-semibold hover:bg-olive-800 transition-colors">
                <CreditCard className="h-5 w-5" />
                Carte bancaire
              </button>
              
              <button
                onClick={() => onNavigate('contact')}
                className="w-full border-2 border-gray-300 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
              >
                Demander un devis
              </button>
            </div>

            <div className="mt-6 text-sm text-gray-600">
              <p>• Livraison gratuite sur Abidjan</p>
              <p>• Installation disponible</p>
              <p>• Garantie constructeur</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;