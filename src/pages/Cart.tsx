import React, { useState } from 'react';
import { Trash2, Plus, Minus, CreditCard, Smartphone, CheckCircle } from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../utils/supabase';
import TopologyPlanner from '../components/TopologyPlanner';

interface CartProps {
  onNavigate: (page: string) => void;
}

const Cart: React.FC<CartProps> = ({ onNavigate }) => {
  const { state, dispatch } = useCart();
  const { user } = useAuth();
  
  // Nouveaux états pour gérer la validation
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('fr-FR').format(price) + ' FCFA';
  };

  const updateQuantity = (id: string, quantity: number) => {
    dispatch({ type: 'UPDATE_QUANTITY', payload: { id, quantity } });
  };

  const removeItem = (id: string) => {
    dispatch({ type: 'REMOVE_ITEM', payload: id });
  };

  // FONCTION MAGIQUE : Création de la commande
  const handleCheckout = async (method: 'mobile_money' | 'card' | 'devis') => {
    if (!user) return; // Sécurité supplémentaire (même si ProtectedRoute gère déjà ça)
    
    setIsSubmitting(true);
    try {
      // 1. On crée la commande dans la table orders
      // Note : On utilise "userId" en camelCase car c'est le format de votre table existante
      const { error: orderError } = await supabase.from('orders').insert([{
        userId: user.id,
        total: state.total,
        status: method === 'devis' ? 'Devis demandé' : 'En attente de paiement',
        items: state.items // <--- LA SOLUTION EST ICI : on envoie le contenu du panier !
      }]);

      if (orderError) throw orderError;

      // 2. On vide le panier localement (Context)
      dispatch({ type: 'CLEAR_CART' });

      // 3. On vide le panier sauvegardé dans le cloud
      await supabase.from('cart_items').delete().eq('user_id', user.id);

      // 4. On affiche l'écran de succès
      setOrderSuccess(true);

    } catch (error) {
      console.error("Erreur lors de la validation:", error);
      alert("Une erreur est survenue lors de l'enregistrement de votre commande. Veuillez réessayer.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // VUE 1 : LA COMMANDE EST UN SUCCÈS
  if (orderSuccess) {
    return (
      <div className="min-h-screen bg-gray-50 pt-8">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-lg shadow-lg p-12 text-center">
            <div className="flex justify-center mb-6">
              <CheckCircle className="h-20 w-20 text-brand-green-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Commande confirmée ! 🎉</h1>
            <p className="text-lg text-gray-600 mb-8">
              Votre demande a bien été enregistrée en toute sécurité. Notre équipe Secunologie va la traiter dans les plus brefs délais.
            </p>
            <div className="flex justify-center gap-4">
              <button
                onClick={() => onNavigate('account')}
                className="bg-brand-green-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-brand-green-700 transition-colors"
              >
                Suivre ma commande
              </button>
              <button
                onClick={() => onNavigate('catalog')}
                className="bg-gray-100 text-gray-700 px-8 py-3 rounded-lg font-semibold hover:bg-gray-200 transition-colors"
              >
                Retour au catalogue
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // VUE 2 : LE PANIER EST VIDE
  if (state.items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 pt-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-16">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Votre panier est vide</h1>
            <p className="text-gray-600 mb-8">Découvrez nos produits de sécurité et ajoutez-les à votre panier</p>
            <button
              onClick={() => onNavigate('catalog')}
              className="bg-brand-green-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-brand-green-700 transition-colors"
            >
              Voir le catalogue
            </button>
          </div>
        </div>
      </div>
    );
  }

  // VUE 3 : LE PANIER NORMAL
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
                    <p className="text-lg font-bold text-brand-green-700">
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
                  <span className="text-brand-green-700">{formatPrice(state.total)}</span>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <h3 className="font-semibold text-gray-900">Valider la commande</h3>
              
              <button 
                onClick={() => handleCheckout('mobile_money')}
                disabled={isSubmitting}
                className="w-full flex items-center justify-center gap-3 bg-orange-500 text-white py-3 rounded-lg font-semibold hover:bg-orange-600 transition-colors disabled:opacity-50"
              >
                <Smartphone className="h-5 w-5" />
                {isSubmitting ? 'Traitement...' : 'Mobile Money'}
              </button>
              
              <button 
                onClick={() => handleCheckout('card')}
                disabled={isSubmitting}
                className="w-full flex items-center justify-center gap-3 bg-brand-green-600 text-white py-3 rounded-lg font-semibold hover:bg-brand-green-700 transition-colors disabled:opacity-50"
              >
                <CreditCard className="h-5 w-5" />
                {isSubmitting ? 'Traitement...' : 'Carte bancaire'}
              </button>
              
              <button
                onClick={() => handleCheckout('devis')}
                disabled={isSubmitting}
                className="w-full border-2 border-gray-300 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                {isSubmitting ? 'Traitement...' : 'Demander un devis'}
              </button>
            </div>

            <div className="mt-6 text-sm text-gray-600">
              <p>• Livraison gratuite sur Abidjan</p>
              <p>• Installation disponible</p>
              <p>• Garantie constructeur</p>
            </div>
          </div>
        </div>

        <div className="mt-10">
          <TopologyPlanner items={state.items} total={state.total} />
        </div>
      </div>
    </div>
  );
};

export default Cart;