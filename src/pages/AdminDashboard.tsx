import React, { useEffect, useState } from 'react';
import { supabase } from '../utils/supabase';
import { ShieldAlert, Package, Clock, CheckCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const AdminDashboard: React.FC = () => {
  const { user } = useAuth();
  const [allOrders, setAllOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAllOrders = async () => {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .order('date', { ascending: false });

      if (data) setAllOrders(data);
      if (error) console.error("Erreur admin:", error);
      
      setLoading(false);
    };

    if (user) fetchAllOrders();
  }, [user]);

  // FONCTION POUR MODIFIER LE STATUT
  const handleStatusChange = async (orderId: string, newStatus: string) => {
    try {
      // 1. On met à jour dans Supabase
      const { error } = await supabase
        .from('orders')
        .update({ status: newStatus })
        .eq('id', orderId);

      if (error) throw error;

      // 2. On met à jour l'affichage sur la page instantanément
      setAllOrders(currentOrders => 
        currentOrders.map(order => 
          order.id === orderId ? { ...order, status: newStatus } : order
        )
      );
    } catch (error) {
      console.error("Erreur lors de la mise à jour du statut:", error);
      alert("Impossible de modifier le statut. Vérifiez votre connexion.");
    }
  };

  if (loading) {
    return <div className="min-h-screen pt-20 text-center">Chargement sécurisé...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-8 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="flex items-center gap-3 mb-8">
          <ShieldAlert className="h-8 w-8 text-red-600" />
          <h1 className="text-3xl font-bold text-gray-900">Tour de contrôle Administrateur</h1>
        </div>

        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="p-6 border-b border-gray-200 bg-gray-900 text-white flex justify-between items-center">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <Package size={20} />
              Toutes les commandes ({allOrders.length})
            </h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200 text-sm text-gray-500 uppercase tracking-wider">
                  <th className="p-4 font-medium">Date & ID</th>
                  <th className="p-4 font-medium">Statut interactif</th>
                  <th className="p-4 font-medium">Articles commandés</th>
                  <th className="p-4 font-medium text-right">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {allOrders.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="p-8 text-center text-gray-500">
                      Aucune commande pour le moment.
                    </td>
                  </tr>
                ) : (
                  allOrders.map((order) => (
                    <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                      <td className="p-4">
                        <div className="font-medium text-gray-900">
                          {order.date ? new Date(order.date).toLocaleDateString('fr-FR', { hour: '2-digit', minute:'2-digit' }) : 'Inconnue'}
                        </div>
                        <div className="text-xs text-gray-500 font-mono mt-1">
                          #{order.id.split('-')[0].toUpperCase()}
                        </div>
                      </td>
                      
                      {/* LE NOUVEAU STATUT INTERACTIF */}
                      <td className="p-4">
                        <select
                          value={order.status || 'En attente de paiement'}
                          onChange={(e) => handleStatusChange(order.id, e.target.value)}
                          className={`text-xs font-semibold rounded-full px-3 py-1 border-0 cursor-pointer appearance-none outline-none ring-2 ring-transparent focus:ring-gray-300 transition-colors ${
                            order.status?.toLowerCase().includes('attente') || order.status?.toLowerCase().includes('devis')
                              ? 'bg-orange-100 text-orange-800'
                              : order.status?.toLowerCase().includes('terminé') || order.status?.toLowerCase().includes('livré') || order.status?.toLowerCase().includes('payé')
                              ? 'bg-green-100 text-green-800'
                              : 'bg-blue-100 text-blue-800'
                          }`}
                        >
                          <option value="En attente de paiement">En attente de paiement</option>
                          <option value="Devis demandé">Devis demandé</option>
                          <option value="Payé">Payé</option>
                          <option value="En préparation">En préparation</option>
                          <option value="En cours de livraison">En cours de livraison</option>
                          <option value="Terminé">Terminé</option>
                          <option value="Annulé">Annulé</option>
                        </select>
                      </td>

                      <td className="p-4">
                        <ul className="text-sm text-gray-600 space-y-1">
                          {order.items && order.items.map((item: any, index: number) => (
                            <li key={index}>
                              <span className="font-semibold">{item.quantity}x</span> {item.product?.name || 'Produit inconnu'}
                            </li>
                          ))}
                        </ul>
                      </td>
                      <td className="p-4 text-right">
                        <span className="font-bold text-brand-green-700">
                          {(order.total || 0).toLocaleString('fr-FR')} FCFA
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
};

export default AdminDashboard;