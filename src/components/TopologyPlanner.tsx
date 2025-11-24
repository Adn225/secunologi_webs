import React, { useMemo } from 'react';
import { Brain, Download, LinkIcon, Map } from 'lucide-react';
import { CartItem } from '../types';
import { buildTopologyPlan, createTopologyPdf } from '../services/topology';

interface TopologyPlannerProps {
  items: CartItem[];
  total: number;
}

const TopologyPlanner: React.FC<TopologyPlannerProps> = ({ items, total }) => {
  const plan = useMemo(() => buildTopologyPlan(items, total), [items, total]);

  if (!items.length) {
    return null;
  }

  const handleDownload = () => {
    const blob = createTopologyPdf(plan);
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = 'topologie-secunologi.pdf';
    anchor.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <Brain className="h-6 w-6 text-brand-green-600" />
          <div>
            <h2 className="text-xl font-bold text-gray-900">Topologie intelligente</h2>
            <p className="text-gray-600 text-sm">Interprétation automatique des éléments de votre panier ou devis.</p>
          </div>
        </div>
        <button
          onClick={handleDownload}
          className="inline-flex items-center gap-2 bg-brand-green-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-brand-green-700 transition-colors"
        >
          <Download className="h-4 w-4" />
          Télécharger le PDF
        </button>
      </div>

      <div className="bg-brand-green-50 border border-brand-green-100 rounded-lg p-4 mb-6 flex items-start gap-3">
        <Map className="h-5 w-5 text-brand-green-700 mt-0.5" />
        <div>
          <p className="font-semibold text-brand-green-800">Résumé dynamique</p>
          <p className="text-sm text-gray-700">{plan.summary}</p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {plan.layers.map(layer => (
          <div key={layer.key} className="border border-gray-100 rounded-lg p-4 bg-gray-50">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold text-gray-900">{layer.title}</h3>
              <span className="text-xs px-2 py-1 rounded-full bg-white border border-gray-200 text-gray-700">
                {layer.items.length} élément(s)
              </span>
            </div>
            <p className="text-sm text-gray-600 mb-3">{layer.description}</p>
            <ul className="space-y-2 text-sm">
              {layer.items.map(item => (
                <li key={item.product.id} className="flex justify-between">
                  <span className="text-gray-800">{item.quantity} × {item.product.name}</span>
                  <span className="text-gray-500">{item.product.brand}</span>
                </li>
              ))}
            </ul>
            <p className="text-xs text-brand-green-700 mt-3">{layer.guidance}</p>
          </div>
        ))}
      </div>

      {(plan.flow.length > 0 || plan.recommendations.length > 0) && (
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          {plan.flow.length > 0 && (
            <div className="border border-gray-100 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <LinkIcon className="h-4 w-4 text-brand-green-600" />
                <p className="font-semibold text-gray-900">Chaîne de connexion</p>
              </div>
              <ul className="text-sm text-gray-700 space-y-1">
                {plan.flow.map((item, index) => (
                  <li key={item + index}>• {item}</li>
                ))}
              </ul>
            </div>
          )}

          {plan.recommendations.length > 0 && (
            <div className="border border-gray-100 rounded-lg p-4 bg-gray-50">
              <p className="font-semibold text-gray-900 mb-2">Conseils complémentaires</p>
              <ul className="text-sm text-gray-700 space-y-1">
                {plan.recommendations.map((item, index) => (
                  <li key={item + index}>• {item}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default TopologyPlanner;
