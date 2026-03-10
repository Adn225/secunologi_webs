import React, { useEffect, useState } from 'react';
import { CheckCircle2 } from 'lucide-react';
import { useCart } from '../contexts/CartContext';

const TOAST_DURATION_MS = 2400;

const CartAddFeedback: React.FC = () => {
  const {
    state: { addEventId, lastAddedProduct },
  } = useCart();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!lastAddedProduct || addEventId === 0) return;

    setVisible(true);
    const timer = window.setTimeout(() => {
      setVisible(false);
    }, TOAST_DURATION_MS);

    return () => window.clearTimeout(timer);
  }, [addEventId, lastAddedProduct]);

  if (!lastAddedProduct) return null;

  return (
    <div
      className={`fixed bottom-6 right-6 z-50 transition-all duration-300 ${
        visible ? 'translate-y-0 opacity-100' : 'pointer-events-none translate-y-3 opacity-0'
      }`}
      aria-live="polite"
      role="status"
    >
      <div className="flex max-w-sm items-start gap-3 rounded-xl border border-brand-green-200 bg-white px-4 py-3 shadow-lg">
        <CheckCircle2 className="mt-0.5 h-5 w-5 flex-shrink-0 text-brand-green-600" />
        <div>
          <p className="text-sm font-semibold text-gray-900">Produit ajouté au panier</p>
          <p className="text-sm text-gray-600">{lastAddedProduct.name}</p>
        </div>
      </div>
    </div>
  );
};

export default CartAddFeedback;
