
import React, { useState, useEffect } from 'react';
import { supabase } from '../utils/supabase';
import { useAuth } from '../contexts/AuthContext';
import { LogOut, User, ShieldCheck, Package } from 'lucide-react'; // AJOUT DE PACKAGE POUR L'ICÔNE DES COMMANDES

const Account = () => {
  const { user, signOut } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [orders, setOrders] = useState<any[]>([]);

  useEffect(() => {
    document.title = 'Mon Espace Client | SecunologieCI';
  }, []);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      } else {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        setMessage({ text: 'Compte créé ! Vérifiez vos emails pour confirmer.', type: 'success' });
      }
    } catch (error: any) {
      setMessage({ text: error.message, type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      const fetchOrders = async () => {
        // N'oubliez pas, votre colonne s'appelle "userId" avec un I majuscule !
        const { data, error } = await supabase
          .from('orders')
          .select('*')
          .eq('userId', user.id)
          .order('date', { ascending: false }); // Du plus récent au plus ancien
          
        if (data) setOrders(data);
        if (error) console.error("Erreur chargement commandes:", error);
      };
      fetchOrders();
    }
  }, [user]);

  // VUE 1 : L'UTILISATEUR EST CONNECTÉ (TABLEAU DE BORD)
  if (user) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="bg-white rounded-lg shadow-md p-8">
          <div className="flex items-center gap-4 mb-8 border-b pb-6">
            <div className="bg-brand-green-100 p-4 rounded-full text-brand-green-600">
              <User size={32} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Mon Espace Client</h1>
              <p className="text-gray-600">{user.email}</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="border border-gray-200 rounded-lg p-6">
              <h3 className="font-semibold text-lg mb-2 flex items-center gap-2">
                <ShieldCheck className="text-brand-green-600" size={20} />
                Sécurité du compte
              </h3>
              <p className="text-sm text-gray-600">Votre compte est actif et sécurisé.</p>
            </div>
            {<div className="border border-gray-200 rounded-lg p-6">
              <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                <Package className="text-brand-green-600" size={20} />
                Mes commandes & devis
              </h3>
              
              {orders.length === 0 ? (
                <p className="text-sm text-gray-600">Vous n'avez pas encore passé de commande.</p>
              ) : (
                <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
                  {orders.map((order) => (
                    <div key={order.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-md border border-gray-100">
                      <div>
                        <p className="font-medium text-sm text-gray-900">
                          Commande #{order.id.substring(0, 8).toUpperCase()}
                        </p>
                        <p className="text-xs text-gray-500 capitalize">
                          Statut : {order.status || 'En attente'}
                        </p>
                      </div>
                      <div className="text-right">
                        <span className="font-bold text-brand-green-600 block">
                          {/* On gère le cas où votre colonne s'appellerait totalAmount ou total_amount */}
                          {(order.total || 0).toLocaleString('fr-FR')} FCFA
                        </span>
                        <span className="text-xs text-gray-400">
                          {new Date(order.date).toLocaleDateString('fr-FR')}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>}
          </div>

          <button
            onClick={signOut}
            className="flex items-center gap-2 px-6 py-2 border border-red-500 text-red-500 rounded-md hover:bg-red-50 transition-colors"
          >
            <LogOut size={18} />
            Se déconnecter
          </button>
        </div>
      </div>
    );
  }

  // VUE 2 : L'UTILISATEUR N'EST PAS CONNECTÉ (FORMULAIRE)
  return (
    <div className="max-w-md mx-auto px-4 py-16">
      <div className="bg-white rounded-lg shadow-md p-8">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900">
            {isLogin ? 'Connexion' : 'Créer un compte'}
          </h1>
          <p className="text-gray-600 mt-2">
            Accédez à votre espace client Secunologie
          </p>
        </div>

        {message && (
          <div className={`p-4 mb-6 rounded-md text-sm ${message.type === 'error' ? 'bg-red-50 text-red-600 border border-red-200' : 'bg-green-50 text-green-600 border border-green-200'}`}>
            {message.text}
          </div>
        )}

        <form onSubmit={handleAuth} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Adresse email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-brand-green-500 focus:border-transparent outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Mot de passe</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-brand-green-500 focus:border-transparent outline-none"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-brand-green-600 text-white py-2 px-4 rounded-md hover:bg-brand-green-700 transition-colors disabled:opacity-50"
          >
            {loading ? 'Veuillez patienter...' : (isLogin ? 'Se connecter' : "S'inscrire")}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button
            onClick={() => {
              setIsLogin(!isLogin);
              setMessage(null);
            }}
            className="text-brand-green-600 hover:text-brand-green-700 text-sm font-medium"
          >
            {isLogin ? "Pas encore de compte ? S'inscrire" : 'Déjà un compte ? Se connecter'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Account;