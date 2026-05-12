import React, { useEffect, useState } from 'react';
import { supabase } from '../utils/supabase';
import { 
  ShieldAlert, Package, Tag, Edit2, Save, X, Plus, Image as ImageIcon,
  LayoutDashboard, TrendingUp, ShoppingCart, AlertCircle, Trophy, FileText, CheckCircle
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { useAuth } from '../contexts/AuthContext';
import JoditEditor from 'jodit-react';

const AdminDashboard: React.FC = () => {
  const { user } = useAuth();
  // Ajout du nouvel onglet "blog"
  const [activeTab, setActiveTab] = useState<'dashboard' | 'orders' | 'products' | 'blog'>('dashboard');
  const [loading, setLoading] = useState(true);
  
  const [allOrders, setAllOrders] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  
  // États pour les Produits
  const [showForm, setShowForm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const initialFormState = { id: null, name: '', category: '', newCategory: '', price: 0, promo_price: 0, description: '', image: '', instock: true, brand: 'Hikvision' };
  const [formData, setFormData] = useState<any>(initialFormState);

  // NOUVEAU : États pour le Blog
  const [blogPosts, setBlogPosts] = useState<any[]>([]);
  const [showBlogForm, setShowBlogForm] = useState(false);
  const [isEditingBlog, setIsEditingBlog] = useState(false);
  const initialBlogState = { id: null, title: '', excerpt: '', content: '', image: '', published: false };
  const [blogData, setBlogData] = useState<any>(initialBlogState);

  const BRAND_COLOR = '#5BA486';
  

  useEffect(() => {
    const fetchData = async () => {
      const { data: ordersData } = await supabase.from('orders').select('*').order('date', { ascending: false });
      if (ordersData) setAllOrders(ordersData);

      const { data: productsData } = await supabase.from('products').select('*').order('name');
      if (productsData) {
        setProducts(productsData);
        const uniqueCategories = Array.from(new Set(productsData.map(p => p.category).filter(Boolean))) as string[];
        setCategories(uniqueCategories);
      }

      // NOUVEAU : Charger les articles de blog
      const { data: blogDataFetched } = await supabase.from('blog_posts').select('*').order('created_at', { ascending: false });
      if (blogDataFetched) setBlogPosts(blogDataFetched);

      setLoading(false);
    };
    if (user) fetchData();
  }, [user]);

  // ==========================================
  // CALCULS STATISTIQUES
  // ==========================================
  const validOrders = allOrders.filter(order => order.status === 'Payé' || order.status === 'Terminé');
  const totalRevenue = validOrders.reduce((sum, order) => sum + (order.total || 0), 0);
  const totalOrdersCount = allOrders.length;
  const outOfStockCount = products.filter(p => !p.instock).length;
  const totalProductsCount = products.length;

  const salesData = (() => {
    const salesMap: any = {};
    [...allOrders].reverse().forEach(order => {
      if (order.status === 'Payé' || order.status === 'Terminé') {
        const dateStr = new Date(order.date).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' });
        salesMap[dateStr] = (salesMap[dateStr] || 0) + (order.total || 0);
      }
    });

    return Object.keys(salesMap).map(date => ({ name: date, ventes: salesMap[date] }));
  })();

  const categoryData = (() => {
    const catMap: any = {};
    products.forEach(p => {
      const cat = p.category || 'Autre';
      catMap[cat] = (catMap[cat] || 0) + 1;
    });
    return Object.keys(catMap).map(cat => ({ name: cat, value: catMap[cat] })).sort((a, b) => b.value - a.value);
  })();

  const topSellingProducts = (() => {
    const productStats: Record<string, { name: string, image: string, totalSold: number, revenue: number }> = {};
    validOrders.forEach(order => {
      order.items?.forEach((item: any) => {
        const prodId = item.product?.id || 'unknown';
        if (!productStats[prodId]) {
          productStats[prodId] = { name: item.product?.name || 'Produit inconnu', image: item.product?.image || '', totalSold: 0, revenue: 0 };
        }
        const qty = item.quantity || 1;
        productStats[prodId].totalSold += qty;
        productStats[prodId].revenue += (qty * (item.product?.promo_price || item.product?.price || 0));
      });
    });
    return Object.values(productStats).sort((a, b) => b.totalSold - a.totalSold).slice(0, 5);
  })();
  
  const COLORS = ['#5BA486', '#6CB597', '#7DC7A9', '#8ED9BB', '#A0EBCD', '#468D72', '#36725B', '#275845'];

  // --- ACTIONS COMMANDES ---
  const handleStatusChange = async (orderId: string, newStatus: string) => {
    try {
      const { error } = await supabase.from('orders').update({ status: newStatus }).eq('id', orderId);
      if (error) throw error;
      setAllOrders(current => current.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
    } catch (error) { alert("Erreur lors de la modification du statut."); }
  };

  // --- ACTIONS PRODUITS ---
  const openAddForm = () => { setFormData(initialFormState); setIsEditing(false); setShowForm(true); };
  const openEditForm = (product: any) => { setFormData({ ...product, newCategory: '', promo_price: product.promo_price || 0 }); setIsEditing(true); setShowForm(true); };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const finalCategory = formData.category === 'NEW' ? formData.newCategory : formData.category;
      const productPayload: any = {
        name: formData.name, category: finalCategory, price: formData.price, promo_price: formData.promo_price > 0 ? formData.promo_price : null,
        description: formData.description, image: formData.image, instock: formData.instock, brand: formData.brand || 'Hikvision', features: [],
      };

      if (isEditing && formData.id) {
        const { error } = await supabase.from('products').update(productPayload).eq('id', formData.id);
        if (error) throw error;
        setProducts(current => current.map(p => p.id === formData.id ? { ...p, ...productPayload } : p));
      } else {
        productPayload.id = Math.floor(Math.random() * 100000000).toString(); 
        const { data, error } = await supabase.from('products').insert([productPayload]).select();
        if (error) throw error;
        if (data) setProducts([...products, data[0]]);
      }

      if (finalCategory && !categories.includes(finalCategory)) setCategories([...categories, finalCategory]);
      setShowForm(false); setFormData(initialFormState);
    } catch (error: any) { alert(`Erreur: ${error.message}`); }
  };

// --- ACTIONS BLOG ---
  const openAddBlogForm = () => { setBlogData(initialBlogState); setIsEditingBlog(false); setShowBlogForm(true); };
  const openEditBlogForm = (post: any) => { setBlogData(post); setIsEditingBlog(true); setShowBlogForm(true); };

const handleSaveBlog = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload: any = {
        title: blogData.title,
        excerpt: blogData.excerpt,
        content: blogData.content,
        image: blogData.image,
        published: blogData.published,
        category: 'Actualités' // <-- L'astuce est ici : on envoie une catégorie par défaut
      };

      if (isEditingBlog && blogData.id) {
        // MODIFICATION
        const { error } = await supabase.from('blog_posts').update(payload).eq('id', blogData.id);
        if (error) throw error;
        setBlogPosts(current => current.map(b => b.id === blogData.id ? { ...b, ...payload } : b));
      } else {
        // AJOUT : On génère un ID aléatoire en texte pour satisfaire la base de données
        payload.id = Math.floor(Math.random() * 100000000).toString();

        const { data, error } = await supabase.from('blog_posts').insert([payload]).select();
        if (error) throw error;
        if (data) setBlogPosts([data[0], ...blogPosts]); // Ajoute au début
      }

      setShowBlogForm(false);
      setBlogData(initialBlogState);
    } catch (error: any) { alert(`Erreur lors de l'enregistrement de l'article: ${error.message}`); }
  };
  
  if (loading) return <div className="h-screen flex items-center justify-center font-semibold bg-gray-50">Chargement...</div>;

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden font-sans">
      
      {/* SIDEBAR */}
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col shadow-sm z-10 hidden md:flex">
        <div className="h-16 flex items-center px-6 border-b border-gray-100">
          <h1 className="text-xl font-extrabold text-gray-900 flex items-center gap-2"><ShieldAlert color={BRAND_COLOR} size={24} /> ShopAdmin</h1>
        </div>
        <div className="p-4 flex-1 overflow-y-auto">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4 ml-2">E-commerce</p>
          <nav className="space-y-1 mb-8">
            <button onClick={() => setActiveTab('dashboard')} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg font-medium transition-all ${activeTab === 'dashboard' ? 'bg-[#5BA486]/10 text-[#5BA486]' : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'}`}><LayoutDashboard size={18} /> Tableau de bord</button>
            <button onClick={() => setActiveTab('orders')} className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg font-medium transition-all ${activeTab === 'orders' ? 'bg-[#5BA486]/10 text-[#5BA486]' : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'}`}>
              <div className="flex items-center gap-3"><ShoppingCart size={18} /> Commandes</div>
              <span className="bg-[#5BA486] text-white text-xs font-bold px-2 py-0.5 rounded-full">{totalOrdersCount}</span>
            </button>
            <button onClick={() => setActiveTab('products')} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg font-medium transition-all ${activeTab === 'products' ? 'bg-[#5BA486]/10 text-[#5BA486]' : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'}`}><Package size={18} /> Produits</button>
          </nav>

          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4 ml-2">Contenu</p>
          <nav className="space-y-1">
            <button onClick={() => setActiveTab('blog')} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg font-medium transition-all ${activeTab === 'blog' ? 'bg-[#5BA486]/10 text-[#5BA486]' : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'}`}><FileText size={18} /> Articles de blog</button>
          </nav>
        </div>
      </aside>

      {/* CONTENU PRINCIPAL */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden relative">
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 z-10 shadow-sm">
          <h2 className="text-xl font-bold text-gray-800">
            {activeTab === 'dashboard' && 'Bonjour Admin ! 👋'}
            {activeTab === 'orders' && 'Gestion des commandes'}
            {activeTab === 'products' && 'Catalogue de produits'}
            {activeTab === 'blog' && 'Gestion du Blog'}
          </h2>
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-full text-white flex items-center justify-center font-bold shadow-md" style={{ backgroundColor: BRAND_COLOR }}>A</div>
            <span className="text-sm font-semibold text-gray-700 hidden sm:block">Admin Secunologie</span>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-6 md:p-8 bg-slate-50/50">
          <div className="max-w-7xl mx-auto">

            {/* VUE TABLEAU DE BORD */}
            {activeTab === 'dashboard' && (
               // ... (Même code que précédemment) ...
              <div>
                <p className="text-gray-500 mb-6">Voici ce qui se passe sur votre boutique aujourd'hui.</p>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                  <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm"><div className="flex justify-between items-start"><div><p className="text-sm font-medium text-gray-500 mb-1">Chiffre d'affaires</p><h3 className="text-2xl font-bold text-gray-900">{totalRevenue.toLocaleString('fr-FR')} <span className="text-sm">FCFA</span></h3></div><div className="p-3 bg-[#5BA486]/10 text-[#5BA486] rounded-lg"><TrendingUp size={20} /></div></div></div>
                  <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm"><div className="flex justify-between items-start"><div><p className="text-sm font-medium text-gray-500 mb-1">Commandes totales</p><h3 className="text-2xl font-bold text-gray-900">{totalOrdersCount}</h3></div><div className="p-3 bg-blue-50 text-blue-600 rounded-lg"><ShoppingCart size={20} /></div></div></div>
                  <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm"><div className="flex justify-between items-start"><div><p className="text-sm font-medium text-gray-500 mb-1">Produits au catalogue</p><h3 className="text-2xl font-bold text-gray-900">{totalProductsCount}</h3></div><div className="p-3 bg-purple-50 text-purple-600 rounded-lg"><Package size={20} /></div></div></div>
                  <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm"><div className="flex justify-between items-start"><div><p className="text-sm font-medium text-gray-500 mb-1">Articles de blog</p><h3 className="text-2xl font-bold text-gray-900">{blogPosts.length}</h3></div><div className="p-3 bg-orange-50 text-orange-600 rounded-lg"><FileText size={20} /></div></div></div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                  <div className="bg-white border border-gray-100 rounded-xl shadow-sm p-6 lg:col-span-2">
                    <h3 className="text-lg font-bold text-gray-800 mb-6">Évolution des ventes</h3>
                    <div className="h-72">
                      {salesData.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={salesData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}><CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" /><XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#6b7280', fontSize: 12}} dy={10} /><YAxis axisLine={false} tickLine={false} tick={{fill: '#6b7280', fontSize: 12}} width={80} tickFormatter={(value) => `${value.toLocaleString()} F`} /><RechartsTooltip formatter={(value: number) => [`${value.toLocaleString('fr-FR')} FCFA`, 'Chiffre d\'affaires']} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} /><Line type="monotone" dataKey="ventes" stroke={BRAND_COLOR} strokeWidth={3} dot={{ r: 4, fill: BRAND_COLOR, strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 6 }} /></LineChart>
                        </ResponsiveContainer>
                      ) : <div className="h-full flex items-center justify-center text-gray-400">Aucune vente enregistrée.</div>}
                    </div>
                  </div>
                  <div className="bg-white border border-gray-100 rounded-xl shadow-sm p-6">
                    <h3 className="text-lg font-bold text-gray-800 mb-6">Répartition catalogue</h3>
                    <div className="h-60">
                      {categoryData.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart><Pie data={categoryData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">{categoryData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}</Pie><RechartsTooltip formatter={(value: number) => [value, 'Produits']} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} /></PieChart>
                        </ResponsiveContainer>
                      ) : <div className="h-full flex items-center justify-center text-gray-400">Aucun produit</div>}
                    </div>
                    <div className="mt-4 flex flex-wrap justify-center gap-x-3 gap-y-2 max-h-20 overflow-y-auto">{categoryData.map((entry, index) => (<div key={index} className="flex items-center gap-1.5 text-xs text-gray-600 font-medium"><span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }}></span><span className="capitalize">{entry.name}</span></div>))}</div>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="bg-white border border-gray-100 rounded-xl shadow-sm overflow-hidden flex flex-col"><div className="p-6 border-b border-gray-100 flex justify-between items-center"><h3 className="text-lg font-bold text-gray-800">Commandes récentes</h3></div><div className="overflow-x-auto flex-1"><table className="w-full text-left border-collapse"><thead><tr className="bg-gray-50 border-b border-gray-100 text-xs uppercase tracking-wider text-gray-500"><th className="p-4 font-medium">Commande</th><th className="p-4 font-medium">Statut</th><th className="p-4 font-medium text-right">Total</th></tr></thead><tbody className="divide-y divide-gray-100">{allOrders.slice(0, 5).map((order) => (<tr key={order.id} className="hover:bg-gray-50/50 transition-colors"><td className="p-4"><div className="font-mono text-sm text-gray-900 font-medium">#{order.id.split('-')[0].toUpperCase()}</div><div className="text-xs text-gray-500 mt-0.5">{order.date ? new Date(order.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' }) : '-'}</div></td><td className="p-4"><span className={`inline-flex px-2 py-1 text-xs font-bold rounded-md ${order.status?.toLowerCase().includes('attente') || order.status?.toLowerCase().includes('devis') ? 'bg-orange-50 text-orange-700' : order.status?.toLowerCase().includes('terminé') || order.status?.toLowerCase().includes('payé') ? 'bg-green-50 text-green-700' : order.status?.toLowerCase().includes('annulé') ? 'bg-red-50 text-red-700' : 'bg-[#5BA486]/10 text-[#5BA486]'}`}>{order.status || 'En attente'}</span></td><td className="p-4 text-right font-bold text-gray-900">{(order.total || 0).toLocaleString('fr-FR')} FCFA</td></tr>))}</tbody></table></div></div>
                  <div className="bg-white border border-gray-100 rounded-xl shadow-sm overflow-hidden flex flex-col"><div className="p-6 border-b border-gray-100 flex justify-between items-center"><h3 className="text-lg font-bold text-gray-800 flex items-center gap-2"><Trophy size={20} className="text-yellow-500" /> Les plus vendus</h3></div><div className="p-2 flex-1">{topSellingProducts.length > 0 ? (<div className="divide-y divide-gray-100">{topSellingProducts.map((product, idx) => (<div key={idx} className="p-4 flex items-center justify-between hover:bg-gray-50/50 transition-colors rounded-lg"><div className="flex items-center gap-4"><div className="h-12 w-12 rounded-lg border border-gray-100 bg-white flex items-center justify-center overflow-hidden flex-shrink-0">{product.image ? <img src={product.image} alt={product.name} className="h-full w-full object-cover" /> : <ImageIcon size={20} className="text-gray-300" />}</div><div><h4 className="font-bold text-gray-900 text-sm line-clamp-1">{product.name}</h4><p className="text-xs text-gray-500 mt-0.5">{product.totalSold} vente{product.totalSold > 1 ? 's' : ''}</p></div></div><div className="text-right font-bold text-gray-900 text-sm whitespace-nowrap pl-4">{product.revenue.toLocaleString('fr-FR')} F</div></div>))}</div>) : (<div className="h-full flex flex-col items-center justify-center text-gray-400 p-8"><p className="text-sm">Pas assez de ventes.</p></div>)}</div></div>
                </div>
              </div>
            )}

            {/* VUE COMMANDES */}
            {activeTab === 'orders' && (
               // ... (Le tableau des commandes intact) ...
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead><tr className="bg-gray-50 border-b border-gray-100 text-sm uppercase tracking-wider text-gray-500"><th className="p-4 font-medium">Date & ID</th><th className="p-4 font-medium">Statut</th><th className="p-4 font-medium">Articles</th><th className="p-4 font-medium text-right">Total</th></tr></thead>
                    <tbody className="divide-y divide-gray-100">
                      {allOrders.map((order) => (
                        <tr key={order.id} className="hover:bg-gray-50/50"><td className="p-4"><div className="font-medium text-gray-900">{order.date ? new Date(order.date).toLocaleDateString('fr-FR', { hour: '2-digit', minute:'2-digit' }) : 'Inconnue'}</div><div className="text-xs text-gray-400 font-mono mt-0.5">#{order.id.split('-')[0].toUpperCase()}</div></td><td className="p-4"><select value={order.status || 'En attente de paiement'} onChange={(e) => handleStatusChange(order.id, e.target.value)} className={`text-xs font-bold rounded-full px-3 py-1.5 cursor-pointer appearance-none outline-none shadow-sm ${order.status?.toLowerCase().includes('attente') || order.status?.toLowerCase().includes('devis') ? 'bg-orange-50 text-orange-700' : order.status?.toLowerCase().includes('terminé') || order.status?.toLowerCase().includes('payé') ? 'bg-green-50 text-green-700' : order.status?.toLowerCase().includes('annulé') ? 'bg-red-50 text-red-700' : 'bg-[#5BA486]/10 text-[#5BA486]'}`}><option value="En attente de paiement">En attente de paiement</option><option value="Devis demandé">Devis demandé</option><option value="Payé">Payé</option><option value="En préparation">En préparation</option><option value="En cours de livraison">En cours de livraison</option><option value="Terminé">Terminé</option><option value="Annulé">Annulé</option></select></td><td className="p-4"><ul className="text-sm text-gray-600 space-y-1">{order.items?.map((item: any, i: number) => (<li key={i}><span className="font-semibold text-gray-900">{item.quantity}x</span> {item.product?.name}</li>))}</ul></td><td className="p-4 text-right font-bold text-gray-900">{(order.total || 0).toLocaleString('fr-FR')} FCFA</td></tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* VUE PRODUITS */}
            {activeTab === 'products' && (
              // ... (Le formulaire de produits intact) ...
              <div>
                <div className="flex justify-end mb-6"><button onClick={() => showForm ? setShowForm(false) : openAddForm()} className="flex items-center gap-2 px-4 py-2.5 rounded-lg font-bold text-white shadow-md" style={{ backgroundColor: showForm ? '#4b5563' : BRAND_COLOR }}>{showForm ? <X size={18} /> : <Plus size={18} />} {showForm ? 'Fermer' : 'Ajouter un produit'}</button></div>
                {showForm && (
                  <form onSubmit={handleSaveProduct} className="bg-white border border-gray-100 rounded-xl p-6 md:p-8 mb-8 shadow-md">
                    <h3 className="font-bold text-xl text-gray-800 mb-6 border-b border-gray-100 pb-4">{isEditing ? `Modifier : ${formData.name}` : 'Créer un nouveau produit'}</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                      <div><label className="block text-sm font-semibold text-gray-700 mb-1.5">Nom du produit *</label><input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:bg-white focus:ring-2" style={{ '--tw-ring-color': BRAND_COLOR } as any} /></div>
                      <div><label className="block text-sm font-semibold text-gray-700 mb-1.5">Catégorie *</label><select required value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:bg-white focus:ring-2" style={{ '--tw-ring-color': BRAND_COLOR } as any}><option value="">Sélectionnez...</option>{categories.map(cat => <option key={cat} value={cat} className="capitalize">{cat}</option>)}<option value="NEW" className="font-bold" style={{ color: BRAND_COLOR }}>+ Nouvelle catégorie</option></select>{formData.category === 'NEW' && <input required type="text" placeholder="Nom de la catégorie" value={formData.newCategory} onChange={e => setFormData({...formData, newCategory: e.target.value})} className="mt-3 w-full px-4 py-2 border rounded-lg outline-none" style={{ borderColor: BRAND_COLOR, backgroundColor: `${BRAND_COLOR}10` }} />}</div>
                      <div><label className="block text-sm font-semibold text-gray-700 mb-1.5">Prix normal (FCFA) *</label><input required type="number" min="0" value={formData.price} onChange={e => setFormData({...formData, price: Number(e.target.value)})} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:bg-white focus:ring-2" style={{ '--tw-ring-color': BRAND_COLOR } as any} /></div>
                      <div><label className="block text-sm font-semibold text-gray-700 mb-1.5">Prix promo (FCFA)</label><input type="number" min="0" value={formData.promo_price || ''} onChange={e => setFormData({...formData, promo_price: Number(e.target.value)})} placeholder="Optionnel" className="w-full px-4 py-2.5 bg-orange-50 border border-orange-200 rounded-lg outline-none focus:ring-2 focus:ring-orange-400" /></div>
                      <div className="md:col-span-2"><label className="block text-sm font-semibold text-gray-700 mb-1.5 flex items-center gap-2"><ImageIcon size={16}/> Lien de l'image (URL) *</label><input required type="url" placeholder="https://..." value={formData.image} onChange={e => setFormData({...formData, image: e.target.value})} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:bg-white focus:ring-2" style={{ '--tw-ring-color': BRAND_COLOR } as any} /></div>
                      <div><label className="block text-sm font-semibold text-gray-700 mb-1.5">Marque</label><input type="text" value={formData.brand} onChange={e => setFormData({...formData, brand: e.target.value})} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:bg-white focus:ring-2" style={{ '--tw-ring-color': BRAND_COLOR } as any} /></div>
                      <div className="flex items-center mt-7"><label className="flex items-center gap-3 cursor-pointer p-2 rounded-lg hover:bg-gray-50 w-full transition-colors"><input type="checkbox" checked={formData.instock} onChange={e => setFormData({...formData, instock: e.target.checked})} className="w-5 h-5 rounded cursor-pointer" style={{ accentColor: BRAND_COLOR }} /><span className={`font-bold ${formData.instock ? 'text-green-600' : 'text-red-500'}`}>{formData.instock ? 'Produit en stock' : 'Rupture de stock'}</span></label></div>
                      <div className="md:col-span-2"><label className="block text-sm font-semibold text-gray-700 mb-1.5">Description complète</label><textarea rows={3} value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:bg-white focus:ring-2" style={{ '--tw-ring-color': BRAND_COLOR } as any} /></div>
                    </div>
                    <div className="flex justify-end gap-3 mt-8 border-t border-gray-100 pt-6">
                      <button type="button" onClick={() => setShowForm(false)} className="px-5 py-2.5 font-bold text-gray-600 hover:bg-gray-100 rounded-lg">Annuler</button>
                      <button type="submit" className="text-white px-6 py-2.5 rounded-lg font-bold flex items-center gap-2 shadow-md" style={{ backgroundColor: BRAND_COLOR }}><Save size={18} /> Enregistrer</button>
                    </div>
                  </form>
                )}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                  <table className="w-full text-left border-collapse">
                    <thead><tr className="bg-gray-50 border-b border-gray-100 text-sm uppercase tracking-wider text-gray-500"><th className="p-4 font-medium">Image & Nom</th><th className="p-4 font-medium text-center">Stock</th><th className="p-4 font-medium text-right">Prix</th><th className="p-4 font-medium text-center">Action</th></tr></thead>
                    <tbody className="divide-y divide-gray-100">
                      {products.map((product) => (
                        <tr key={product.id} className="hover:bg-gray-50/50"><td className="p-4"><div className="flex items-center gap-4"><div className="h-12 w-12 flex-shrink-0 bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm">{product.image ? <img src={product.image} alt={product.name} className="h-full w-full object-cover" /> : <ImageIcon className="h-6 w-6 m-3 text-gray-300" />}</div><div className="font-bold text-gray-900">{product.name}</div></div></td><td className="p-4 text-center"><span className={`inline-flex px-2.5 py-1 text-xs font-bold rounded-full ${product.instock ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>{product.instock ? 'En stock' : 'Rupture'}</span></td><td className="p-4 text-right"><span className="font-bold text-gray-900 text-base">{product.price.toLocaleString('fr-FR')} FCFA</span></td><td className="p-4 text-center"><button onClick={() => openEditForm(product)} className="p-2 text-gray-400 rounded-lg hover:bg-gray-100"><Edit2 size={18} className="mx-auto" /></button></td></tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* ============================================== */}
            {/* NOUVELLE VUE : BLOG                            */}
            {/* ============================================== */}
            {activeTab === 'blog' && (
              <div>
                <div className="flex justify-end mb-6">
                  <button onClick={() => showBlogForm ? setShowBlogForm(false) : openAddBlogForm()} className="flex items-center gap-2 px-4 py-2.5 rounded-lg font-bold text-white shadow-md transition-all" style={{ backgroundColor: showBlogForm ? '#4b5563' : BRAND_COLOR }}>
                    {showBlogForm ? <X size={18} /> : <Plus size={18} />} {showBlogForm ? 'Annuler' : 'Rédiger un article'}
                  </button>
                </div>

                {showBlogForm && (
                  <form onSubmit={handleSaveBlog} className="bg-white border border-gray-100 rounded-xl p-6 md:p-8 mb-8 shadow-md">
                    <h3 className="font-bold text-xl text-gray-800 mb-6 border-b border-gray-100 pb-4">
                      {isEditingBlog ? 'Modifier l\'article' : 'Nouvel Article de Blog'}
                    </h3>
                    
                    <div className="space-y-6 mb-6">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1.5">Titre de l'article *</label>
                        <input required type="text" value={blogData.title} onChange={e => setBlogData({...blogData, title: e.target.value})} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:bg-white focus:ring-2" style={{ '--tw-ring-color': BRAND_COLOR } as any} placeholder="Ex: Comment bien choisir sa caméra de surveillance ?" />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1.5">Extrait (Court résumé) *</label>
                        <input required type="text" value={blogData.excerpt} onChange={e => setBlogData({...blogData, excerpt: e.target.value})} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:bg-white focus:ring-2" style={{ '--tw-ring-color': BRAND_COLOR } as any} placeholder="Ce texte s'affichera sur la page d'accueil du blog..." />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1.5 flex items-center gap-2"><ImageIcon size={16}/> Image de couverture (URL)</label>
                        <input type="url" value={blogData.image} onChange={e => setBlogData({...blogData, image: e.target.value})} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:bg-white focus:ring-2" style={{ '--tw-ring-color': BRAND_COLOR } as any} placeholder="https://..." />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1.5">Contenu complet de l'article *</label>
                        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden text-gray-900 shadow-sm">
                          <JoditEditor
                              value={blogData.content}
                              config={{
                                  readonly: false,
                                  height: 600,
                                  language: 'fr',
                                  placeholder: 'Rédigez votre article avec style, comme sur Blogger...',
                                  uploader: { insertImageAsBase64URI: true }, // Permet d'insérer des images facilement
                                  buttons: [
                                      'source', '|', // Voir le code HTML
                                      'bold', 'italic', 'underline', 'strikethrough', '|',
                                      'font', 'fontsize', 'brush', 'paragraph', '|', // Polices et couleurs
                                      'image', 'video', 'table', 'link', '|', // Médias et Tableaux
                                      'left', 'center', 'right', 'justify', '|', // Alignement
                                      'undo', 'redo', 'hr', 'eraser', 'fullsize' // Plein écran et divers
                                  ]
                              }}
                              onBlur={newContent => setBlogData({...blogData, content: newContent})}
                          />
                        </div>
                      </div>

                      <div className="flex items-center p-4 bg-gray-50 rounded-lg border border-gray-200">
                        <label className="flex items-center gap-3 cursor-pointer w-full">
                          <input type="checkbox" checked={blogData.published} onChange={e => setBlogData({...blogData, published: e.target.checked})} className="w-6 h-6 rounded cursor-pointer" style={{ accentColor: BRAND_COLOR }} />
                          <div>
                            <span className={`font-bold block ${blogData.published ? 'text-green-600' : 'text-orange-500'}`}>
                              {blogData.published ? 'Article Public (Visible par tous)' : 'Brouillon (Caché au public)'}
                            </span>
                            <span className="text-xs text-gray-500">
                              {blogData.published ? "Il apparaîtra immédiatement sur votre site." : "Seul l'administrateur peut le voir pour le moment."}
                            </span>
                          </div>
                        </label>
                      </div>
                    </div>

                    <div className="flex justify-end gap-3 border-t border-gray-100 pt-6">
                      <button type="button" onClick={() => setShowBlogForm(false)} className="px-5 py-2.5 font-bold text-gray-600 hover:bg-gray-100 rounded-lg">Annuler</button>
                      <button type="submit" className="text-white px-6 py-2.5 rounded-lg font-bold flex items-center gap-2 shadow-md" style={{ backgroundColor: BRAND_COLOR }}>
                        <Save size={18} /> {isEditingBlog ? 'Mettre à jour l\'article' : 'Enregistrer l\'article'}
                      </button>
                    </div>
                  </form>
                )}

                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-gray-50 border-b border-gray-100 text-sm uppercase tracking-wider text-gray-500">
                        <th className="p-4 font-medium">Article</th>
                        <th className="p-4 font-medium">Date de création</th>
                        <th className="p-4 font-medium text-center">Statut</th>
                        <th className="p-4 font-medium text-center">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {blogPosts.map((post) => (
                        <tr key={post.id} className="hover:bg-gray-50/50 transition-colors">
                          <td className="p-4">
                            <div className="flex items-center gap-4">
                              <div className="h-12 w-16 flex-shrink-0 bg-gray-100 rounded border border-gray-200 overflow-hidden shadow-sm flex items-center justify-center">
                                {post.image ? <img src={post.image} alt={post.title} className="h-full w-full object-cover" /> : <ImageIcon className="h-5 w-5 text-gray-300" />}
                              </div>
                              <div>
                                <div className="font-bold text-gray-900">{post.title}</div>
                                <div className="text-xs text-gray-500 line-clamp-1 mt-0.5">{post.excerpt}</div>
                              </div>
                            </div>
                          </td>
                          <td className="p-4 text-sm text-gray-600 font-medium">
                            {new Date(post.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                          </td>
                          <td className="p-4 text-center">
                            <span className={`inline-flex items-center gap-1.5 px-3 py-1 text-xs font-bold rounded-full ${post.published ? 'bg-green-50 text-green-700' : 'bg-orange-50 text-orange-700'}`}>
                              {post.published ? <CheckCircle size={14} /> : <AlertCircle size={14} />}
                              {post.published ? 'Publié' : 'Brouillon'}
                            </span>
                          </td>
                          <td className="p-4 text-center">
                            <button onClick={() => openEditBlogForm(post)} className="p-2 text-gray-400 rounded-lg hover:bg-gray-100" style={{ '--tw-hover-color': BRAND_COLOR } as any} onMouseEnter={e => e.currentTarget.style.color = BRAND_COLOR} onMouseLeave={e => e.currentTarget.style.color = ''}>
                              <Edit2 size={18} className="mx-auto" />
                            </button>
                          </td>
                        </tr>
                      ))}
                      {blogPosts.length === 0 && !showBlogForm && (
                        <tr><td colSpan={4} className="p-8 text-center text-gray-500">Vous n'avez pas encore écrit d'article.</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;