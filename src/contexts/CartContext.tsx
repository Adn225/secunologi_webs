/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useReducer, ReactNode, useEffect } from 'react';
import { CartItem, Product } from '../types';

interface CartState {
  items: CartItem[];
  total: number;
  lastAddedProduct: Product | null;
  addEventId: number;
}

type CartAction = 
  | { type: 'ADD_ITEM'; payload: { product: Product; quantity?: number } }
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
      const quantityToAdd = Math.max(action.payload.quantity ?? 1, 1);
      const existingItem = state.items.find(item => item.product.id === action.payload.product.id);
      if (existingItem) {
        const updatedItems = state.items.map(item =>
          item.product.id === action.payload.product.id
            ? { ...item, quantity: item.quantity + quantityToAdd }
            : item
        );
        return {
          items: updatedItems,
          total: calculateTotal(updatedItems),
          lastAddedProduct: action.payload,
          addEventId: state.addEventId + 1,
        };
      } else {
        const newItems = [...state.items, { product: action.payload.product, quantity: quantityToAdd }];
        return {
          items: newItems,
          total: calculateTotal(newItems),
          lastAddedProduct: action.payload,
          addEventId: state.addEventId + 1,
        };
      }
    }
    case 'REMOVE_ITEM': {
      const newItems = state.items.filter(item => item.product.id !== action.payload);
      return {
        items: newItems,
        total: calculateTotal(newItems),
        lastAddedProduct: state.lastAddedProduct,
        addEventId: state.addEventId,
      };
    }
    case 'UPDATE_QUANTITY': {
      if (action.payload.quantity === 0) {
        const newItems = state.items.filter(item => item.product.id !== action.payload.id);
        return {
          items: newItems,
          total: calculateTotal(newItems),
          lastAddedProduct: state.lastAddedProduct,
          addEventId: state.addEventId,
        };
      }
      const updatedItems = state.items.map(item =>
        item.product.id === action.payload.id
          ? { ...item, quantity: action.payload.quantity }
          : item
      );
      return {
        items: updatedItems,
        total: calculateTotal(updatedItems),
        lastAddedProduct: state.lastAddedProduct,
        addEventId: state.addEventId,
      };
    }
    case 'CLEAR_CART':
      return {
        items: [],
        total: 0,
        lastAddedProduct: state.lastAddedProduct,
        addEventId: state.addEventId,
      };
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
    total: calculateTotal(storedItems),
    lastAddedProduct: null,
    addEventId: 0,
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
