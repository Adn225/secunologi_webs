import React, { useState, useEffect } from 'react';
import { supabase } from '../utils/supabase';
import { useAuth } from '../contexts/AuthContext';
import { LogOut, User, ShieldCheck, Package, ArrowRight, Mail, Lock } from 'lucide-react';

interface AccountProps {
  onNavigate: (page: string) => void;
}

const Account: React.FC<AccountProps> = ({ onNavigate }) => {
  const { user, signOut } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [orders, setOrders] = useState<any[]>([]);

  const ADMIN_EMAIL = 'anderson@label-ci.com';

  useEffect(() => {
    document.title = 'Mon Espace Client | SecunologieCI';
    if (user) fetchOrders();
  }, [user]);

  const fetchOrders = async () => {
    const { data } = await supabase
      .from('orders')
      .select('*')
      .eq('user_id', user?.id)
      .order('date', { ascending: false });
    if (data) setOrders(data);
  };

  const handleSocialLogin = async (provider: 'google' | 'facebook' | 'azure') => {
    await supabase.auth.signInWithOAuth({
      provider,
      options: { redirectTo: window.location.origin }
    });
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) setMessage({ text: "Identifiants invalides", type: 'error' });
    setLoading(false);
  };

  if (user) {
    return (
      <div className="min-h-screen bg-gray-50 pt-32 pb-12 px-4">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 rounded-full bg-brand-green-100 flex items-center justify-center text-brand-green-700">
                <User size={32} />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Mon Espace</h1>
                <p className="text-gray-500">{user.email}</p>
              </div>
            </div>
            <div className="flex gap-3">
              {user.email === ADMIN_EMAIL && (
                <button onClick={() => onNavigate('admin')} className="bg-gray-900 text-white px-6 py-2.5 rounded-xl font-bold flex items-center gap-2 hover:bg-black transition-all">
                  <ShieldCheck size={20} /> Administration
                </button>
              )}
              <button onClick={() => signOut()} className="flex items-center gap-2 text-red-500 font-bold border border-red-100 px-6 py-2.5 rounded-xl hover:bg-red-50 transition-all">
                <LogOut size={20} /> Déconnexion
              </button>
            </div>
          </div>

          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-6 border-b border-gray-100 bg-gray-50/50 font-bold flex items-center gap-2">
              <Package className="text-brand-green-600" /> Historique de mes commandes
            </div>
            <div className="p-8">
              {orders.length === 0 ? (
                <p className="text-center text-gray-500">Aucune commande pour le moment.</p>
              ) : (
                <div className="grid gap-4">
                  {orders.map(order => (
                    <div key={order.id} className="p-4 border border-gray-100 rounded-2xl flex justify-between items-center">
                      <div>
                        <p className="font-bold text-gray-900">Commande #{order.id.slice(0,8).toUpperCase()}</p>
                        <p className="text-xs text-gray-400">{new Date(order.date).toLocaleDateString('fr-FR')}</p>
                      </div>
                      <p className="font-bold text-brand-green-700">{order.total.toLocaleString()} FCFA</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-32 pb-12 px-4 flex items-center justify-center">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-xl border border-gray-100 p-8">
        <h2 className="text-3xl font-extrabold text-gray-900 text-center mb-8">Connexion</h2>

        {/* BOUTONS SOCIAUX AVEC ICÔNES RÉELLES */}
        <div className="space-y-3 mb-8">
          <button onClick={() => handleSocialLogin('google')} className="w-full flex items-center justify-center gap-3 border border-gray-200 py-3 rounded-xl font-bold text-gray-700 hover:bg-gray-50 transition-all">
            <svg className="w-5 h-5" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
            Continuez avec Google
          </button>
          
          <button onClick={() => handleSocialLogin('facebook')} className="w-full flex items-center justify-center gap-3 border border-gray-200 py-3 rounded-xl font-bold text-gray-700 hover:bg-gray-50 transition-all">
            <svg className="w-5 h-5" fill="#1877F2" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
            Continuez avec Facebook
          </button>

          <button onClick={() => handleSocialLogin('azure')} className="w-full flex items-center justify-center gap-3 border border-gray-200 py-3 rounded-xl font-bold text-gray-700 hover:bg-gray-50 transition-all">
            <svg className="w-5 h-5" viewBox="0 0 23 23"><path fill="#f3f3f3" d="M0 0h23v23H0z"/><path fill="#f35325" d="M1 1h10v10H1z"/><path fill="#81bc06" d="M12 1h10v10H12z"/><path fill="#05a6f0" d="M1 12h10v10H1z"/><path fill="#ffba08" d="M12 12h10v10H12z"/></svg>
            Continuez avec Microsoft
          </button>
        </div>

        <div className="relative mb-8 text-center text-xs font-bold text-gray-400 uppercase tracking-widest">
          <span className="bg-white px-4 relative z-10">ou par email</span>
          <div className="absolute top-1/2 left-0 w-full h-[1px] bg-gray-100"></div>
        </div>

        <form onSubmit={handleAuth} className="space-y-4">
          <input required type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} className="w-full px-5 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-green-500 outline-none" />
          <input required type="password" placeholder="Mot de passe" value={password} onChange={e => setPassword(e.target.value)} className="w-full px-5 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-green-500 outline-none" />
          <button type="submit" className="w-full bg-brand-green-600 text-white py-4 rounded-xl font-bold text-lg shadow-lg hover:bg-brand-green-700 transition-all">Se connecter</button>
        </form>

        <button onClick={() => onNavigate('signup')} className="w-full mt-8 text-[#4F8F73] font-extrabold text-lg flex items-center justify-center gap-2 hover:underline">
          Créer un compte professionnel <ArrowRight size={20} />
        </button>
      </div>
    </div>
  );
};

export default Account;