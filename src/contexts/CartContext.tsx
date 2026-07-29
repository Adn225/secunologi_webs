/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useReducer, ReactNode, useEffect, useState } from 'react';
import { CartItem, Product } from '../types';
import { supabase } from '../utils/supabase'; // NOUVEAU
import { useAuth } from './AuthContext'; // NOUVEAU

interface CartState {
  items: CartItem[];
  total: number;
}

type CartAction = 
  | { type: 'ADD_ITEM'; payload: { product: Product; quantity?: number } }
  | { type: 'REMOVE_ITEM'; payload: string }
  | { type: 'UPDATE_QUANTITY'; payload: { id: string; quantity: number } }
  | { type: 'CLEAR_CART' }
  | { type: 'SET_CART'; payload: CartItem[] }; // NOUVEAU : Action pour forcer le panier depuis le Cloud

const CartContext = createContext<{
  state: CartState;
  dispatch: React.Dispatch<CartAction>;
} | null>(null);

const calculateTotal = (items: CartItem[]) =>
  items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);


const mergeDuplicateItems = (items: CartItem[]): CartItem[] => {
  const byProduct = new Map<string, CartItem>();

  for (const item of items) {
    const productId = String(item.product.id);
    const existing = byProduct.get(productId);

    if (existing) {
      existing.quantity += item.quantity;
    } else {
      byProduct.set(productId, { ...item });
    }
  }

  return Array.from(byProduct.values());
};

const cartReducer = (state: CartState, action: CartAction): CartState => {
  switch (action.type) {
    case 'ADD_ITEM': {
      const quantityToAdd = Math.max(action.payload.quantity ?? 1, 1);
      const existingItem = state.items.find(item => item.product.id === action.payload.product.id);
      if (existingItem) {
        const updatedItems = state.items.map(item =>
          item.product.id === action.payload.product.id
            ? { ...item, quantity: item.quantity + quantityToAdd }
            : item
        );
        return { items: updatedItems, total: calculateTotal(updatedItems) };
      } else {
        const newItems = [...state.items, { product: action.payload.product, quantity: quantityToAdd }];
        return { items: newItems, total: calculateTotal(newItems) };
      }
    }
    case 'REMOVE_ITEM': {
      const newItems = state.items.filter(item => item.product.id !== action.payload);
      return { items: newItems, total: calculateTotal(newItems) };
    }
    case 'UPDATE_QUANTITY': {
      if (action.payload.quantity === 0) {
        const newItems = state.items.filter(item => item.product.id !== action.payload.id);
        return { items: newItems, total: calculateTotal(newItems) };
      }
      const updatedItems = state.items.map(item =>
        item.product.id === action.payload.id
          ? { ...item, quantity: action.payload.quantity }
          : item
      );
      return { items: updatedItems, total: calculateTotal(updatedItems) };
    }
    case 'CLEAR_CART':
      return { items: [], total: 0 };
    case 'SET_CART': // NOUVEAU : Remplacer tout le panier
      return { items: action.payload, total: calculateTotal(action.payload) };
    default:
      return state;
  }
};

export const CartProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user } = useAuth(); // Récupère l'utilisateur connecté
  const [isCloudLoaded, setIsCloudLoaded] = useState(false); // Sécurité anti-écrasement

  // Initialisation classique avec le localStorage
  const storedItems = (() => {
    if (typeof window === 'undefined') return [] as CartItem[];
    try {
      return JSON.parse(localStorage.getItem('cartItems') || '[]') as CartItem[];
    } catch {
      return [] as CartItem[];
    }
  })();

  const [state, dispatch] = useReducer(cartReducer, {
    items: storedItems,
    total: calculateTotal(storedItems)
  });

  // 1. CHARGEMENT DEPUIS SUPABASE (Au moment de la connexion)
  useEffect(() => {
    const fetchCloudCart = async () => {
      if (!user) {
        setIsCloudLoaded(false);
        return;
      }

      try {
        // A. On récupère les identifiants des produits dans le cloud
        const { data: cloudCart } = await supabase.from('cart_items').select('*').eq('user_id', user.id);

        if (cloudCart && cloudCart.length > 0) {
          // B. On va chercher les détails complets de ces produits dans la table products
          const productIds = cloudCart.map(c => c.product_id);
          const { data: products } = await supabase.from('products').select('*').in('id', productIds);

          if (products) {
            // C. On recrée le panier proprement
            const restoredCart: CartItem[] = cloudCart.map(cartRow => {
              const product = products.find(p => String(p.id) === String(cartRow.product_id));
              return product ? { product: product as Product, quantity: cartRow.quantity } : null;
            }).filter(Boolean) as CartItem[];

            // D. On remplace le panier local par le panier du cloud !
            dispatch({ type: 'SET_CART', payload: mergeDuplicateItems(restoredCart) });
          }
        } else if (state.items.length > 0) {
          // Cas spécial : Le cloud est vide, mais le visiteur avait commencé à remplir son panier en local AVANT de se connecter. On sauvegarde ça dans le cloud !
          syncCartToCloud(state.items, user.id);
        }
      } catch (error) {
        console.error("Erreur de récupération du panier Cloud", error);
      } finally {
        setIsCloudLoaded(true); // Le chargement initial est terminé
      }
    };

    fetchCloudCart();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  // 2. SYNCHRONISATION VERS SUPABASE (À chaque modification du panier)
  useEffect(() => {
    // On sauvegarde toujours en local
    localStorage.setItem('cartItems', JSON.stringify(state.items));

    // Si on est connecté ET que le cloud a fini de charger, on synchronise vers Supabase
    if (user && isCloudLoaded) {
      syncCartToCloud(state.items, user.id);
    }
  }, [state.items, user, isCloudLoaded]);

  // Fonction utilitaire pour écrire dans Supabase
  const syncCartToCloud = async (items: CartItem[], userId: string) => {
    try {
      const normalizedItems = mergeDuplicateItems(items);

      // Écriture idempotente : un seul enregistrement par produit et utilisateur
      if (normalizedItems.length > 0) {
        const rowsToUpsert = normalizedItems.map(item => ({
          user_id: userId,
          product_id: String(item.product.id),
          quantity: item.quantity
        }));

        const { error: upsertError } = await supabase
          .from('cart_items')
          .upsert(rowsToUpsert, { onConflict: 'user_id,product_id' });

        if (upsertError) throw upsertError;
      }

      // Nettoyage des produits retirés du panier
      const productIdsToKeep = normalizedItems.map(item => String(item.product.id));
      let deleteQuery = supabase.from('cart_items').delete().eq('user_id', userId);
      if (productIdsToKeep.length > 0) {
        const keepIdsSql = productIdsToKeep
          .map(id => `'${id.replace(/'/g, "''")}'`)
          .join(',');
        deleteQuery = deleteQuery.not('product_id', 'in', `(${keepIdsSql})`);
      }

      const { error: deleteError } = await deleteQuery;
      if (deleteError) throw deleteError;
    } catch (error) {
      console.error("Erreur de synchronisation", error);
    }
  };

  return (
    <CartContext.Provider value={{ state, dispatch }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};