import React, { useState, useEffect } from 'react';
import { supabase } from '../utils/supabase';
import { useAuth } from '../contexts/AuthContext';
import { LogOut, User, ShieldCheck, Package, ArrowRight, CheckCircle2, Clock3, AlertCircle, Bell, FileText, ShoppingCart } from 'lucide-react';

interface AccountProps {
  onNavigate: (page: string) => void;
}

const Account: React.FC<AccountProps> = ({ onNavigate }) => {
  const { user, signOut } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  type OrderItem = { name: string; quantity: number; price: number };
  type Order = {
    id: string;
    date: string;
    total: number;
    status?: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';
    items?: OrderItem[];
  };

  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [profileName, setProfileName] = useState(user?.user_metadata?.full_name || '');
  const [profilePhone, setProfilePhone] = useState(user?.user_metadata?.phone || '');
  const [profileSaving, setProfileSaving] = useState(false);
  const [notificationFilter, setNotificationFilter] = useState<'all' | 'important'>('all');

  const ADMIN_EMAIL = 'anderson@label-ci.com';

  useEffect(() => {
    document.title = 'Mon Espace Client | SecunologieCI';
    if (user) {
      setProfileName(user.user_metadata?.full_name || '');
      setProfilePhone(user.user_metadata?.phone || '');
      fetchOrders();
    }
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



  const authErrorMessage = (errorMessage: string) => {
    const message = errorMessage.toLowerCase();
    if (message.includes('invalid login credentials')) return "Email ou mot de passe incorrect.";
    if (message.includes('email not confirmed')) return "Veuillez confirmer votre email avant de vous connecter.";
    if (message.includes('too many requests')) return "Trop de tentatives. Réessayez dans quelques minutes.";
    return "Connexion impossible pour le moment.";
  };

  const sendPasswordReset = async () => {
    if (!email) {
      setMessage({ text: 'Saisissez votre email puis cliquez à nouveau sur “Mot de passe oublié ?”.', type: 'error' });
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/`,
    });

    if (error) {
      setMessage({ text: "Impossible d'envoyer l'email de réinitialisation.", type: 'error' });
    } else {
      setMessage({ text: 'Email de réinitialisation envoyé. Vérifiez votre boîte de réception.', type: 'success' });
    }
    setLoading(false);
  };

  const saveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileSaving(true);
    const { error } = await supabase.auth.updateUser({
      data: { full_name: profileName, phone: profilePhone }
    });

    if (error) {
      setMessage({ text: "Impossible de mettre à jour votre profil.", type: 'error' });
    } else {
      setMessage({ text: 'Profil mis à jour avec succès.', type: 'success' });
    }
    setProfileSaving(false);
  };

  const statusMeta = (status?: Order['status']) => {
    switch (status) {
      case 'delivered':
        return { label: 'Livrée', className: 'text-green-700 bg-green-50', icon: <CheckCircle2 size={16} /> };
      case 'shipped':
        return { label: 'Expédiée', className: 'text-blue-700 bg-blue-50', icon: <Package size={16} /> };
      case 'confirmed':
        return { label: 'Confirmée', className: 'text-brand-green-700 bg-brand-green-50', icon: <CheckCircle2 size={16} /> };
      case 'cancelled':
        return { label: 'Annulée', className: 'text-red-700 bg-red-50', icon: <AlertCircle size={16} /> };
      default:
        return { label: 'En attente', className: 'text-amber-700 bg-amber-50', icon: <Clock3 size={16} /> };
    }
  };

  const buildNotifications = () => {
    const notifications = orders
      .slice(0, 5)
      .map((order) => ({
        id: order.id,
        important: order.status === 'shipped' || order.status === 'delivered' || order.status === 'cancelled',
        text: `Commande #${order.id.slice(0, 8).toUpperCase()} : ${statusMeta(order.status).label}`,
        date: new Date(order.date).toLocaleDateString('fr-FR'),
      }));
    return notificationFilter === 'important' ? notifications.filter((n) => n.important) : notifications;
  };

  const recommendedProducts = orders
    .flatMap((order) => order.items || [])
    .reduce<Record<string, { name: string; quantity: number }>>((acc, item) => {
      const key = item.name.toLowerCase();
      if (!acc[key]) acc[key] = { name: item.name, quantity: 0 };
      acc[key].quantity += item.quantity;
      return acc;
    }, {});

  const topRecommendations = Object.values(recommendedProducts)
    .sort((a, b) => b.quantity - a.quantity)
    .slice(0, 3);

  const exportInvoice = (order: Order) => {
    const rows = (order.items || [])
      .map((item) => `<tr><td>${item.name}</td><td>${item.quantity}</td><td>${item.price.toLocaleString()} FCFA</td></tr>`)
      .join('');
    const content = `
      <html><head><title>Facture ${order.id}</title></head><body>
      <h1>Facture - SecunologieCI</h1>
      <p>Commande: ${order.id}</p>
      <p>Date: ${new Date(order.date).toLocaleDateString('fr-FR')}</p>
      <table border="1" cellspacing="0" cellpadding="8">
        <thead><tr><th>Produit</th><th>Qté</th><th>Prix</th></tr></thead>
        <tbody>${rows || '<tr><td colspan="3">Détails produits non disponibles</td></tr>'}</tbody>
      </table>
      <h3>Total: ${order.total.toLocaleString()} FCFA</h3>
      </body></html>
    `;
    const invoiceWindow = window.open('', '_blank', 'width=900,height=700');
    if (!invoiceWindow) return;
    invoiceWindow.document.write(content);
    invoiceWindow.document.close();
    invoiceWindow.focus();
    invoiceWindow.print();
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setMessage({ text: authErrorMessage(error.message), type: 'error' });
    }
    setLoading(false);
  };

  if (user) {
    return (
      <div className="min-h-screen bg-gray-50 pt-32 pb-12 px-4">
        <div className="max-w-4xl mx-auto space-y-6">
          {message && (
            <div className={`p-4 rounded-2xl border text-sm font-semibold ${message.type === 'success' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'}`}>
              {message.text}
            </div>
          )}
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
            <div className="p-6 border-b border-gray-100 bg-gray-50/50">
              <div className="flex items-center justify-between">
                <h2 className="font-bold text-gray-900 flex items-center gap-2"><Bell size={18} /> Notifications</h2>
                <div className="flex gap-2 text-xs">
                  <button type="button" onClick={() => setNotificationFilter('all')} className={`px-3 py-1 rounded-full ${notificationFilter === 'all' ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-600'}`}>Toutes</button>
                  <button type="button" onClick={() => setNotificationFilter('important')} className={`px-3 py-1 rounded-full ${notificationFilter === 'important' ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-600'}`}>Importantes</button>
                </div>
              </div>
              <div className="mt-3 space-y-2">
                {buildNotifications().length === 0 ? (
                  <p className="text-sm text-gray-500">Aucune notification pour le moment.</p>
                ) : (
                  buildNotifications().map((notification) => (
                    <div key={notification.id} className="p-3 rounded-xl bg-white border border-gray-100 text-sm flex justify-between gap-4">
                      <p className="text-gray-700">{notification.text}</p>
                      <span className="text-gray-400 whitespace-nowrap">{notification.date}</span>
                    </div>
                  ))
                )}
              </div>
            </div>
            <form onSubmit={saveProfile} className="p-6 border-b border-gray-100 bg-white">
              <h2 className="font-bold text-gray-900 mb-4">Mon profil</h2>
              <div className="grid md:grid-cols-2 gap-3">
                <input value={profileName} onChange={e => setProfileName(e.target.value)} placeholder="Nom complet" className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl" />
                <input value={profilePhone} onChange={e => setProfilePhone(e.target.value)} placeholder="Téléphone" className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl" />
              </div>
              <button disabled={profileSaving} type="submit" className="mt-4 px-5 py-2.5 bg-gray-900 text-white rounded-xl font-bold disabled:opacity-60">
                {profileSaving ? 'Enregistrement...' : 'Enregistrer'}
              </button>
            </form>
            <div className="p-6 border-b border-gray-100 bg-gray-50/50 font-bold flex items-center gap-2">
              <Package className="text-brand-green-600" /> Historique de mes commandes
            </div>
            <div className="p-8">
              {orders.length === 0 ? (
                <p className="text-center text-gray-500">Aucune commande pour le moment.</p>
              ) : (
                <div className="grid gap-4">
                  {orders.map(order => {
                    const meta = statusMeta(order.status);
                    return (
                    <button type="button" key={order.id} onClick={() => setSelectedOrder(order)} className="w-full text-left p-4 border border-gray-100 rounded-2xl flex justify-between items-center hover:border-brand-green-200 transition-all">
                      <div>
                        <p className="font-bold text-gray-900">Commande #{order.id.slice(0, 8).toUpperCase()}</p>
                        <p className="text-xs text-gray-400">{new Date(order.date).toLocaleDateString('fr-FR')}</p>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <p className="font-bold text-brand-green-700">{order.total.toLocaleString()} FCFA</p>
                        <div className={`px-3 py-1 rounded-full text-xs font-bold inline-flex items-center gap-1 ${meta.className}`}>{meta.icon}{meta.label}</div>
                      </div>
                    </button>
                  );})}
                </div>
              )}
            </div>
            <div className="p-6 border-t border-gray-100 bg-gray-50/40">
              <h3 className="font-bold text-gray-900 flex items-center gap-2"><ShoppingCart size={18} /> Recommandé pour vous</h3>
              {topRecommendations.length === 0 ? (
                <p className="text-sm text-gray-500 mt-2">Des recommandations apparaîtront après vos premières commandes.</p>
              ) : (
                <div className="mt-3 grid md:grid-cols-3 gap-3">
                  {topRecommendations.map((product) => (
                    <button key={product.name} type="button" onClick={() => onNavigate('catalog')} className="text-left p-3 bg-white rounded-xl border border-gray-100 hover:border-brand-green-200">
                      <p className="font-semibold text-gray-900">{product.name}</p>
                      <p className="text-xs text-gray-500">Commandé {product.quantity} fois</p>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

          {selectedOrder && (
            <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4" onClick={() => setSelectedOrder(null)}>
              <div className="bg-white max-w-lg w-full rounded-3xl p-6" onClick={e => e.stopPropagation()}>
                <h3 className="text-xl font-bold text-gray-900">Détail commande #{selectedOrder.id.slice(0,8).toUpperCase()}</h3>
                <p className="text-sm text-gray-500 mt-1">Date: {new Date(selectedOrder.date).toLocaleDateString('fr-FR')}</p>
                <p className="font-bold text-brand-green-700 mt-4">Total: {selectedOrder.total.toLocaleString()} FCFA</p>
                <div className="mt-4 space-y-2">
                  {(selectedOrder.items || []).map((item) => (
                    <div key={item.name} className="text-sm flex justify-between text-gray-700">
                      <span>{item.name} x{item.quantity}</span>
                      <span>{item.price.toLocaleString()} FCFA</span>
                    </div>
                  ))}
                </div>
                <div className="mt-6 flex gap-2">
                  <button type="button" onClick={() => exportInvoice(selectedOrder)} className="px-4 py-2 border border-gray-200 rounded-xl font-semibold flex items-center gap-2"><FileText size={16} /> Facture PDF</button>
                  <button type="button" onClick={() => onNavigate('catalog')} className="px-4 py-2 border border-brand-green-300 text-brand-green-700 rounded-xl font-semibold">Recommander</button>
                  <button type="button" onClick={() => setSelectedOrder(null)} className="px-4 py-2 bg-gray-900 text-white rounded-xl">Fermer</button>
                </div>
              </div>
            </div>
          )}

      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-32 pb-12 px-4 flex items-center justify-center">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-xl border border-gray-100 p-8">
        <h2 className="text-3xl font-extrabold text-gray-900 text-center mb-3">Connexion</h2>
        {message && <p className={`mb-6 text-center text-sm font-semibold ${message.type === 'success' ? 'text-green-700' : 'text-red-600'}`}>{message.text}</p>}

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
          <button disabled={loading} type="submit" className="w-full bg-brand-green-600 text-white py-4 rounded-xl font-bold text-lg shadow-lg hover:bg-brand-green-700 transition-all disabled:opacity-70">{loading ? 'Connexion...' : 'Se connecter'}</button>
          <button type="button" onClick={sendPasswordReset} className="text-sm text-brand-green-700 font-semibold hover:underline">Mot de passe oublié ?</button>
        </form>

        <button onClick={() => onNavigate('signup')} className="w-full mt-8 text-[#4F8F73] font-extrabold text-lg flex items-center justify-center gap-2 hover:underline">
          Créer un compte professionnel <ArrowRight size={20} />
        </button>
      </div>
    </div>
  );
};

export default Account;
