/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useReducer, ReactNode, useEffect } from 'react';
import { CartItem, Product } from '../types';

interface CartState {
  items: CartItem[];
  total: number;
}

type CartAction = 
  | { type: 'ADD_ITEM'; payload: Product }
  | { type: 'REMOVE_ITEM'; payload: string }
  | { type: 'UPDATE_QUANTITY'; payload: { id: string; quantity: number } }
  | { type: 'CLEAR_CART' };

const CartContext = createContext<{
  state: CartState;
  dispatch: React.Dispatch<CartAction>;
} | null>(null);

const calculateTotal = (items: CartItem[]) =>
  items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

const cartReducer = (state: CartState, action: CartAction): CartState => {
  switch (action.type) {
    case 'ADD_ITEM': {
      const existingItem = state.items.find(item => item.product.id === action.payload.id);
      if (existingItem) {
        const updatedItems = state.items.map(item =>
          item.product.id === action.payload.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
        return {
          items: updatedItems,
          total: calculateTotal(updatedItems)
        };
      } else {
        const newItems = [...state.items, { product: action.payload, quantity: 1 }];
        return {
          items: newItems,
          total: calculateTotal(newItems)
        };
      }
    }
    case 'REMOVE_ITEM': {
      const newItems = state.items.filter(item => item.product.id !== action.payload);
      return {
        items: newItems,
        total: calculateTotal(newItems)
      };
    }
    case 'UPDATE_QUANTITY': {
      if (action.payload.quantity === 0) {
        const newItems = state.items.filter(item => item.product.id !== action.payload.id);
        return {
          items: newItems,
          total: calculateTotal(newItems)
        };
      }
      const updatedItems = state.items.map(item =>
        item.product.id === action.payload.id
          ? { ...item, quantity: action.payload.quantity }
          : item
      );
      return {
        items: updatedItems,
        total: calculateTotal(updatedItems)
      };
    }
    case 'CLEAR_CART':
      return { items: [], total: 0 };
    default:
      return state;
  }
};

export const CartProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
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

  useEffect(() => {
    localStorage.setItem('cartItems', JSON.stringify(state.items));
  }, [state.items]);

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
