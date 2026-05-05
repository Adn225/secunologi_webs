import React, { useEffect, useState } from 'react';
import { supabase } from '../utils/supabase';
import { ShieldAlert, Package, Clock, CheckCircle, Tag, Edit2, Save, X } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const AdminDashboard: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'orders' | 'products'>('orders');
  const [loading, setLoading] = useState(true);
  
  // États pour les commandes
  const [allOrders, setAllOrders] = useState<any[]>([]);
  
  // États pour les produits
  const [products, setProducts] = useState<any[]>([]);
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [editPrice, setEditPrice] = useState<number>(0);

  useEffect(() => {
    const fetchData = async () => {
      // Charger les commandes
      const { data: ordersData } = await supabase.from('orders').select('*').order('date', { ascending: false });
      if (ordersData) setAllOrders(ordersData);

      // Charger les produits
      const { data: productsData } = await supabase.from('products').select('*').order('name');
      if (productsData) setProducts(productsData);
      
      setLoading(false);
    };

    if (user) fetchData();
  }, [user]);

  // --- ACTIONS COMMANDES ---
  const handleStatusChange = async (orderId: string, newStatus: string) => {
    try {
      const { error } = await supabase.from('orders').update({ status: newStatus }).eq('id', orderId);
      if (error) throw error;
      setAllOrders(current => current.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
    } catch (error) {
      alert("Erreur lors de la modification du statut.");
    }
  };

  // --- ACTIONS PRODUITS ---
  const startEditing = (product: any) => {
    setEditingProductId(product.id);
    setEditPrice(product.price || 0); // Ajustez selon le nom de votre colonne prix (price, prix, etc.)
  };

  const saveProductPrice = async (productId: string) => {
    try {
      // Assurez-vous que la colonne s'appelle bien 'price' dans votre table Supabase
      const { error } = await supabase.from('products').update({ price: editPrice }).eq('id', productId);
      if (error) throw error;
      
      setProducts(current => current.map(p => p.id === productId ? { ...p, price: editPrice } : p));
      setEditingProductId(null);
    } catch (error) {
      alert("Erreur lors de la sauvegarde du prix.");
    }
  };

  if (loading) return <div className="min-h-screen pt-20 text-center font-semibold">Chargement de la tour de contrôle...</div>;

  return (
    <div className="min-h-screen bg-gray-50 pt-8 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="flex items-center gap-3 mb-6">
          <ShieldAlert className="h-8 w-8 text-brand-green-600" />
          <h1 className="text-3xl font-bold text-gray-900">Administration Secunologie</h1>
        </div>

        {/* NAVIGATION DES ONGLETS */}
        <div className="flex gap-4 mb-6 border-b border-gray-200 pb-4">
          <button 
            onClick={() => setActiveTab('orders')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition-colors ${activeTab === 'orders' ? 'bg-gray-900 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
          >
            <Package size={18} /> Gestion des Commandes
          </button>
          <button 
            onClick={() => setActiveTab('products')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition-colors ${activeTab === 'products' ? 'bg-gray-900 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
          >
            <Tag size={18} /> Catalogue Produits
          </button>
        </div>

        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          {/* VUE 1 : COMMANDES */}
          {activeTab === 'orders' && (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-900 text-white text-sm uppercase tracking-wider">
                    <th className="p-4 font-medium">Date & ID</th>
                    <th className="p-4 font-medium">Statut</th>
                    <th className="p-4 font-medium">Articles</th>
                    <th className="p-4 font-medium text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {allOrders.map((order) => (
                    <tr key={order.id} className="hover:bg-gray-50">
                      <td className="p-4">
                        <div className="font-medium">{order.date ? new Date(order.date).toLocaleDateString('fr-FR', { hour: '2-digit', minute:'2-digit' }) : 'Inconnue'}</div>
                        <div className="text-xs text-gray-500 font-mono">#{order.id.split('-')[0].toUpperCase()}</div>
                      </td>
                      <td className="p-4">
                        <select
                          value={order.status || 'En attente de paiement'}
                          onChange={(e) => handleStatusChange(order.id, e.target.value)}
                          className={`text-xs font-semibold rounded-full px-3 py-1 border-0 cursor-pointer appearance-none outline-none ring-2 ring-transparent focus:ring-gray-300 transition-colors ${
                            order.status?.toLowerCase().includes('attente') || order.status?.toLowerCase().includes('devis') || order.status?.toLowerCase().includes('préparation')
                              ? 'bg-orange-100 text-orange-800'
                              : order.status?.toLowerCase().includes('terminé') || order.status?.toLowerCase().includes('livré') || order.status?.toLowerCase().includes('payé')
                              ? 'bg-green-100 text-green-800'
                              : order.status?.toLowerCase().includes('annulé')
                              ? 'bg-red-100 text-red-800'
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
                          {order.items?.map((item: any, i: number) => (
                            <li key={i}><span className="font-semibold">{item.quantity}x</span> {item.product?.name}</li>
                          ))}
                        </ul>
                      </td>
                      <td className="p-4 text-right font-bold text-brand-green-700">
                        {(order.total || 0).toLocaleString('fr-FR')} FCFA
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* VUE 2 : PRODUITS */}
          {activeTab === 'products' && (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-900 text-white text-sm uppercase tracking-wider">
                    <th className="p-4 font-medium">Nom du produit</th>
                    <th className="p-4 font-medium">Catégorie</th>
                    <th className="p-4 font-medium text-right">Prix (FCFA)</th>
                    <th className="p-4 font-medium text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {products.map((product) => (
                    <tr key={product.id} className="hover:bg-gray-50">
                      <td className="p-4 font-medium text-gray-900">{product.name}</td>
                      <td className="p-4 text-gray-500 text-sm capitalize">{product.category}</td>
                      <td className="p-4 text-right font-semibold">
                        {editingProductId === product.id ? (
                          <input 
                            type="number" 
                            value={editPrice} 
                            onChange={(e) => setEditPrice(Number(e.target.value))}
                            className="w-24 px-2 py-1 border border-brand-green-500 rounded text-right outline-none focus:ring-2 focus:ring-brand-green-300"
                          />
                        ) : (
                          `${(product.price || 0).toLocaleString('fr-FR')}`
                        )}
                      </td>
                      <td className="p-4 text-center">
                        {editingProductId === product.id ? (
                          <div className="flex justify-center gap-2">
                            <button onClick={() => saveProductPrice(product.id)} className="p-1 bg-green-100 text-green-700 rounded hover:bg-green-200" title="Sauvegarder">
                              <Save size={18} />
                            </button>
                            <button onClick={() => setEditingProductId(null)} className="p-1 bg-red-100 text-red-700 rounded hover:bg-red-200" title="Annuler">
                              <X size={18} />
                            </button>
                          </div>
                        ) : (
                          <button onClick={() => startEditing(product)} className="p-1 text-gray-400 hover:text-brand-green-600 transition-colors" title="Modifier le prix">
                            <Edit2 size={18} className="mx-auto" />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                  {products.length === 0 && (
                    <tr>
                      <td colSpan={4} className="p-8 text-center text-gray-500">
                        Aucun produit trouvé dans la table "products".
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default AdminDashboard;