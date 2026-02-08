import React, { useEffect } from 'react';
import { Download, X } from 'lucide-react';
import { Product } from '../types';

interface ProductDetailsModalProps {
  product: Product | null;
  onClose: () => void;
}

const formatPrice = (price: number) => `${new Intl.NumberFormat('fr-FR').format(price)} FCFA`;

const ProductDetailsModal: React.FC<ProductDetailsModalProps> = ({ product, onClose }) => {
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  if (!product) return null;

  const technicalRows: Array<{ label: string; value: string }> = [
    { label: 'Marque', value: product.brand },
    { label: 'Catégorie', value: product.category },
    { label: 'Disponibilité', value: product.inStock ? 'En stock' : 'Rupture de stock' },
    { label: 'Prix', value: formatPrice(product.price) },
  ];

  const handleDownloadDatasheet = () => {
    const datasheetContent = [
      `FICHE TECHNIQUE - ${product.name}`,
      '',
      `Marque: ${product.brand}`,
      `Catégorie: ${product.category}`,
      `Prix: ${formatPrice(product.price)}`,
      `Disponibilité: ${product.inStock ? 'En stock' : 'Rupture de stock'}`,
      '',
      'Description:',
      product.description,
      '',
      'Spécifications techniques:',
      ...product.features.map((feature, index) => `${index + 1}. ${feature}`),
    ].join('\n');

    const blob = new Blob([datasheetContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `fiche-technique-${product.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4" onClick={onClose}>
      <div
        className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">Détails techniques</h2>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100" aria-label="Fermer les détails produit">
            <X className="h-5 w-5 text-gray-600" />
          </button>
        </div>

        <div className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <img src={product.image} alt={product.name} className="w-full h-72 object-cover rounded-lg" />
            <h3 className="text-2xl font-semibold mt-4 text-gray-900">{product.name}</h3>
            <p className="mt-2 text-gray-600">{product.description}</p>
          </div>

          <div className="space-y-6">
            <div>
              <h4 className="text-lg font-semibold text-gray-900 mb-3">Résumé technique</h4>
              <div className="rounded-lg border border-gray-200 overflow-hidden">
                {technicalRows.map((row) => (
                  <div key={row.label} className="grid grid-cols-2 border-b last:border-b-0">
                    <span className="bg-gray-50 px-3 py-2 text-sm font-medium text-gray-700">{row.label}</span>
                    <span className="px-3 py-2 text-sm text-gray-800">{row.value}</span>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h4 className="text-lg font-semibold text-gray-900 mb-3">Spécifications</h4>
              <ul className="space-y-2 list-disc list-inside text-gray-700 text-sm">
                {product.features.map((feature) => (
                  <li key={feature}>{feature}</li>
                ))}
              </ul>
            </div>

            <button
              onClick={handleDownloadDatasheet}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-brand-green-600 text-white hover:bg-brand-green-700 transition-colors"
            >
              <Download className="h-4 w-4" />
              Télécharger la fiche technique
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailsModal;
