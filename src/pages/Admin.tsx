import React, { FormEvent, useMemo, useState } from 'react';
import {
  createBlogPost,
  createProduct,
  createPromotion,
  deleteBlogPost,
  deleteProduct,
  deletePromotion,
} from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { useData } from '../contexts/DataContext';
import { BlogPost, Product, Promotion } from '../types';

interface AdminPageProps {
  onNavigate: (page: string) => void;
}

type FeedbackState = {
  type: 'success' | 'error';
  message: string;
} | null;

const Admin: React.FC<AdminPageProps> = ({ onNavigate }) => {
  const { admin, token, login, logout, loading, initializing, error, clearError } = useAuth();
  const {
    products,
    blogPosts,
    promotions,
    productsLoading,
    blogPostsLoading,
    promotionsLoading,
    productsError,
    blogPostsError,
    promotionsError,
    refreshProducts,
    refreshBlogPosts,
    refreshPromotions,
  } = useData();

  const [activeTab, setActiveTab] = useState<'products' | 'blog' | 'promotions'>('products');
  const [feedback, setFeedback] = useState<FeedbackState>(null);

  const [loginForm, setLoginForm] = useState({
    email: 'admin@secunologi.ci',
    password: '',
  });

  const [productForm, setProductForm] = useState({
    name: '',
    brand: '',
    category: '',
    price: '',
    image: '',
    description: '',
    features: '',
    inStock: true,
  });

  const [blogForm, setBlogForm] = useState({
    title: '',
    excerpt: '',
    content: '',
    category: '',
    image: '',
    date: '',
  });

  const [promotionForm, setPromotionForm] = useState({
    title: '',
    description: '',
    image: '',
    startDate: '',
    endDate: '',
    discount: '',
  });

  const [productSubmitting, setProductSubmitting] = useState(false);
  const [blogSubmitting, setBlogSubmitting] = useState(false);
  const [promotionSubmitting, setPromotionSubmitting] = useState(false);

  const hasErrors = useMemo(() => {
    return Boolean(productsError || blogPostsError || promotionsError);
  }, [productsError, blogPostsError, promotionsError]);

  const handleLoginSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    clearError();
    setFeedback(null);
    const success = await login(loginForm.email, loginForm.password);
    if (success) {
      setFeedback({ type: 'success', message: 'Connexion réussie. Bienvenue dans l\'espace administrateur.' });
      setLoginForm((prev) => ({ ...prev, password: '' }));
    }
  };

  const handleLogout = async () => {
    setFeedback(null);
    await logout();
  };

  const handleCreateProduct = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!token) {
      return;
    }
    setProductSubmitting(true);
    setFeedback(null);
    try {
      const features = productForm.features
        .split(',')
        .map((item) => item.trim())
        .filter(Boolean);
      const payload = {
        name: productForm.name,
        brand: productForm.brand,
        category: productForm.category,
        price: Number(productForm.price),
        image: productForm.image,
        description: productForm.description,
        features,
        inStock: productForm.inStock,
      };
      const created = await createProduct(token, payload);
      await refreshProducts();
      setProductForm({
        name: '',
        brand: '',
        category: '',
        price: '',
        image: '',
        description: '',
        features: '',
        inStock: true,
      });
      setFeedback({ type: 'success', message: `Produit “${created.name}” ajouté avec succès.` });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Impossible d\'ajouter le produit.';
      setFeedback({ type: 'error', message });
    } finally {
      setProductSubmitting(false);
    }
  };

  const handleDeleteProduct = async (product: Product) => {
    if (!token) {
      return;
    }
    if (!window.confirm(`Voulez-vous vraiment supprimer le produit “${product.name}” ?`)) {
      return;
    }
    setFeedback(null);
    try {
      await deleteProduct(token, product.id);
      await refreshProducts();
      setFeedback({ type: 'success', message: `Produit “${product.name}” supprimé.` });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Impossible de supprimer le produit.';
      setFeedback({ type: 'error', message });
    }
  };

  const handleCreateBlogPost = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!token) {
      return;
    }
    setBlogSubmitting(true);
    setFeedback(null);
    try {
      const payload = {
        title: blogForm.title,
        excerpt: blogForm.excerpt,
        content: blogForm.content,
        category: blogForm.category,
        image: blogForm.image,
        date: blogForm.date,
      };
      const created = await createBlogPost(token, payload);
      await refreshBlogPosts();
      setBlogForm({ title: '', excerpt: '', content: '', category: '', image: '', date: '' });
      setFeedback({ type: 'success', message: `Article “${created.title}” publié.` });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Impossible de créer l\'article.';
      setFeedback({ type: 'error', message });
    } finally {
      setBlogSubmitting(false);
    }
  };

  const handleDeleteBlogPost = async (post: BlogPost) => {
    if (!token) {
      return;
    }
    if (!window.confirm(`Voulez-vous supprimer l'article “${post.title}” ?`)) {
      return;
    }
    setFeedback(null);
    try {
      await deleteBlogPost(token, post.id);
      await refreshBlogPosts();
      setFeedback({ type: 'success', message: `Article “${post.title}” supprimé.` });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Impossible de supprimer l\'article.';
      setFeedback({ type: 'error', message });
    }
  };

  const handleCreatePromotion = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!token) {
      return;
    }
    setPromotionSubmitting(true);
    setFeedback(null);
    try {
      const payload = {
        title: promotionForm.title,
        description: promotionForm.description,
        image: promotionForm.image,
        startDate: promotionForm.startDate,
        endDate: promotionForm.endDate,
        discount: promotionForm.discount ? Number(promotionForm.discount) : undefined,
      };
      const created = await createPromotion(token, payload);
      await refreshPromotions();
      setPromotionForm({ title: '', description: '', image: '', startDate: '', endDate: '', discount: '' });
      setFeedback({ type: 'success', message: `Promotion “${created.title}” enregistrée.` });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Impossible de créer la promotion.';
      setFeedback({ type: 'error', message });
    } finally {
      setPromotionSubmitting(false);
    }
  };

  const handleDeletePromotion = async (promotion: Promotion) => {
    if (!token) {
      return;
    }
    if (!window.confirm(`Supprimer la promotion “${promotion.title}” ?`)) {
      return;
    }
    setFeedback(null);
    try {
      await deletePromotion(token, promotion.id);
      await refreshPromotions();
      setFeedback({ type: 'success', message: `Promotion “${promotion.title}” supprimée.` });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Impossible de supprimer la promotion.';
      setFeedback({ type: 'error', message });
    }
  };

  const renderLogin = () => (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="bg-white rounded-xl shadow p-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-6 text-center">Espace administrateur</h1>
        <p className="text-gray-600 text-center mb-6">
          Connectez-vous pour gérer le catalogue, le blog et les offres promotionnelles de Secunologi.
        </p>
        {error && (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}
        {feedback && feedback.type === 'success' && (
          <div className="mb-4 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
            {feedback.message}
          </div>
        )}
        <form onSubmit={handleLoginSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="admin-email">
              Email professionnel
            </label>
            <input
              id="admin-email"
              type="email"
              required
              value={loginForm.email}
              onChange={(event) => setLoginForm((prev) => ({ ...prev, email: event.target.value }))}
              className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-brand-green-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="admin-password">
              Mot de passe
            </label>
            <input
              id="admin-password"
              type="password"
              required
              value={loginForm.password}
              onChange={(event) => setLoginForm((prev) => ({ ...prev, password: event.target.value }))}
              className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-brand-green-500"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-brand-green-600 px-4 py-2 font-semibold text-white transition hover:bg-brand-green-700 disabled:opacity-60"
          >
            {loading ? 'Connexion...' : 'Se connecter'}
          </button>
        </form>
        <p className="mt-8 text-center text-sm text-gray-500">
          Besoin d'aide ? <button onClick={() => onNavigate('contact')} className="font-medium text-brand-green-600 hover:text-brand-green-700">Contactez notre équipe.</button>
        </p>
      </div>

      <div className="rounded-xl border border-blue-100 bg-blue-50 p-6 text-sm text-blue-900 shadow">
        <div className="flex items-start gap-3">
          <div className="mt-1 h-10 w-10 rounded-full bg-brand-green-600/10 text-brand-green-700 flex items-center justify-center font-bold">
            i
          </div>
          <div className="space-y-3">
            <h2 className="text-lg font-semibold text-gray-900">Comment nous sécurisons l'administration Secunologi</h2>
            <ul className="list-disc space-y-2 pl-5 text-gray-700">
              <li>URL d'accès réservée et authentification stricte (MFA, session courte, verrouillage en cas d'échecs répétés).</li>
              <li>Back-office séparé du site public, avec filtrage réseau et journaux d'audit pour chaque action sensible.</li>
              <li>Permissions par rôle (catalogue, support, marketing) pour limiter les droits de chaque compte.</li>
              <li>Pas de lien visible depuis le front : l'accès se fait via un point d'entrée dédié et surveillé.</li>
              <li>API internes et intégrations (ERP/CRM) pour automatiser sans exposer de fonctionnalités critiques au public.</li>
            </ul>
            <p className="text-gray-700">
              Cette approche est la même que les grandes plateformes e-commerce : une interface graphique existe, mais elle reste invisible pour le grand public afin de protéger vos données et vos opérations.
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  const renderStats = () => (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      <div className="rounded-lg bg-white p-4 shadow">
        <p className="text-sm font-medium text-gray-500">Produits en catalogue</p>
        <p className="mt-2 text-3xl font-bold text-gray-900">{products.length}</p>
      </div>
      <div className="rounded-lg bg-white p-4 shadow">
        <p className="text-sm font-medium text-gray-500">Articles publiés</p>
        <p className="mt-2 text-3xl font-bold text-gray-900">{blogPosts.length}</p>
      </div>
      <div className="rounded-lg bg-white p-4 shadow">
        <p className="text-sm font-medium text-gray-500">Promotions actives</p>
        <p className="mt-2 text-3xl font-bold text-gray-900">{promotions.length}</p>
      </div>
    </div>
  );

  const renderProductTab = () => (
    <div className="space-y-8">
      <div className="rounded-xl bg-white p-6 shadow">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Ajouter un nouveau produit</h2>
        <form onSubmit={handleCreateProduct} className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nom du produit *</label>
            <input
              type="text"
              required
              value={productForm.name}
              onChange={(event) => setProductForm((prev) => ({ ...prev, name: event.target.value }))}
              className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-transparent focus:ring-2 focus:ring-brand-green-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Marque *</label>
            <input
              type="text"
              required
              value={productForm.brand}
              onChange={(event) => setProductForm((prev) => ({ ...prev, brand: event.target.value }))}
              className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-transparent focus:ring-2 focus:ring-brand-green-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Catégorie *</label>
            <input
              type="text"
              required
              value={productForm.category}
              onChange={(event) => setProductForm((prev) => ({ ...prev, category: event.target.value }))}
              className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-transparent focus:ring-2 focus:ring-brand-green-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Prix (FCFA) *</label>
            <input
              type="number"
              required
              min={0}
              value={productForm.price}
              onChange={(event) => setProductForm((prev) => ({ ...prev, price: event.target.value }))}
              className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-transparent focus:ring-2 focus:ring-brand-green-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Image (URL)</label>
            <input
              type="text"
              value={productForm.image}
              onChange={(event) => setProductForm((prev) => ({ ...prev, image: event.target.value }))}
              placeholder="/images/products/mon-produit.jpg"
              className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-transparent focus:ring-2 focus:ring-brand-green-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Caractéristiques (séparées par une virgule)</label>
            <input
              type="text"
              value={productForm.features}
              onChange={(event) => setProductForm((prev) => ({ ...prev, features: event.target.value }))}
              placeholder="Vision nocturne, Résolution 4MP"
              className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-transparent focus:ring-2 focus:ring-brand-green-500"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
            <textarea
              required
              rows={3}
              value={productForm.description}
              onChange={(event) => setProductForm((prev) => ({ ...prev, description: event.target.value }))}
              className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-transparent focus:ring-2 focus:ring-brand-green-500"
            ></textarea>
          </div>
          <div className="flex items-center space-x-2 md:col-span-2">
            <input
              id="product-instock"
              type="checkbox"
              checked={productForm.inStock}
              onChange={(event) => setProductForm((prev) => ({ ...prev, inStock: event.target.checked }))}
              className="h-4 w-4 rounded border-gray-300 text-brand-green-600 focus:ring-brand-green-500"
            />
            <label htmlFor="product-instock" className="text-sm text-gray-700">
              Produit disponible en stock
            </label>
          </div>
          <div className="md:col-span-2">
            <button
              type="submit"
              disabled={productSubmitting}
              className="w-full rounded-lg bg-brand-green-600 px-4 py-2 font-semibold text-white transition hover:bg-brand-green-700 disabled:opacity-60"
            >
              {productSubmitting ? 'Enregistrement...' : 'Ajouter le produit'}
            </button>
          </div>
        </form>
      </div>

      <div className="rounded-xl bg-white p-6 shadow">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Produits récents</h2>
        {productsLoading ? (
          <p className="text-sm text-gray-500">Chargement des produits...</p>
        ) : products.length === 0 ? (
          <p className="text-sm text-gray-500">Aucun produit enregistré pour le moment.</p>
        ) : (
          <div className="space-y-3">
            {products.slice(-5).reverse().map((product) => (
              <div key={product.id} className="flex items-start justify-between rounded-lg border border-gray-200 p-4">
                <div>
                  <p className="font-semibold text-gray-900">{product.name}</p>
                  <p className="text-sm text-gray-500">
                    {product.brand} • {product.category}
                  </p>
                </div>
                <button
                  onClick={() => handleDeleteProduct(product)}
                  className="text-sm font-medium text-red-600 hover:text-red-700"
                >
                  Supprimer
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  const renderBlogTab = () => (
    <div className="space-y-8">
      <div className="rounded-xl bg-white p-6 shadow">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Publier un article</h2>
        <form onSubmit={handleCreateBlogPost} className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Titre *</label>
            <input
              type="text"
              required
              value={blogForm.title}
              onChange={(event) => setBlogForm((prev) => ({ ...prev, title: event.target.value }))}
              className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-transparent focus:ring-2 focus:ring-brand-green-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Catégorie *</label>
            <input
              type="text"
              required
              value={blogForm.category}
              onChange={(event) => setBlogForm((prev) => ({ ...prev, category: event.target.value }))}
              className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-transparent focus:ring-2 focus:ring-brand-green-500"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Accroche *</label>
            <textarea
              required
              rows={2}
              value={blogForm.excerpt}
              onChange={(event) => setBlogForm((prev) => ({ ...prev, excerpt: event.target.value }))}
              className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-transparent focus:ring-2 focus:ring-brand-green-500"
            ></textarea>
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Contenu *</label>
            <textarea
              required
              rows={6}
              value={blogForm.content}
              onChange={(event) => setBlogForm((prev) => ({ ...prev, content: event.target.value }))}
              className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-transparent focus:ring-2 focus:ring-brand-green-500"
            ></textarea>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Image (URL)</label>
            <input
              type="text"
              value={blogForm.image}
              onChange={(event) => setBlogForm((prev) => ({ ...prev, image: event.target.value }))}
              placeholder="/images/blog/article.jpg"
              className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-transparent focus:ring-2 focus:ring-brand-green-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date de publication</label>
            <input
              type="date"
              value={blogForm.date}
              onChange={(event) => setBlogForm((prev) => ({ ...prev, date: event.target.value }))}
              className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-transparent focus:ring-2 focus:ring-brand-green-500"
            />
          </div>
          <div className="md:col-span-2">
            <button
              type="submit"
              disabled={blogSubmitting}
              className="w-full rounded-lg bg-brand-green-600 px-4 py-2 font-semibold text-white transition hover:bg-brand-green-700 disabled:opacity-60"
            >
              {blogSubmitting ? 'Publication...' : 'Publier l\'article'}
            </button>
          </div>
        </form>
      </div>

      <div className="rounded-xl bg-white p-6 shadow">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Articles récents</h2>
        {blogPostsLoading ? (
          <p className="text-sm text-gray-500">Chargement des articles...</p>
        ) : blogPosts.length === 0 ? (
          <p className="text-sm text-gray-500">Aucun article publié pour le moment.</p>
        ) : (
          <div className="space-y-3">
            {blogPosts.slice(-5).reverse().map((post) => (
              <div key={post.id} className="flex items-start justify-between rounded-lg border border-gray-200 p-4">
                <div>
                  <p className="font-semibold text-gray-900">{post.title}</p>
                  <p className="text-sm text-gray-500">
                    {new Date(post.date).toLocaleDateString('fr-FR')} • {post.category}
                  </p>
                </div>
                <button
                  onClick={() => handleDeleteBlogPost(post)}
                  className="text-sm font-medium text-red-600 hover:text-red-700"
                >
                  Supprimer
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  const renderPromotionTab = () => (
    <div className="space-y-8">
      <div className="rounded-xl bg-white p-6 shadow">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Créer une promotion</h2>
        <form onSubmit={handleCreatePromotion} className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Titre *</label>
            <input
              type="text"
              required
              value={promotionForm.title}
              onChange={(event) => setPromotionForm((prev) => ({ ...prev, title: event.target.value }))}
              className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-transparent focus:ring-2 focus:ring-brand-green-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Remise (%)</label>
            <input
              type="number"
              min={0}
              value={promotionForm.discount}
              onChange={(event) => setPromotionForm((prev) => ({ ...prev, discount: event.target.value }))}
              className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-transparent focus:ring-2 focus:ring-brand-green-500"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
            <textarea
              required
              rows={3}
              value={promotionForm.description}
              onChange={(event) => setPromotionForm((prev) => ({ ...prev, description: event.target.value }))}
              className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-transparent focus:ring-2 focus:ring-brand-green-500"
            ></textarea>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Image (URL)</label>
            <input
              type="text"
              value={promotionForm.image}
              onChange={(event) => setPromotionForm((prev) => ({ ...prev, image: event.target.value }))}
              placeholder="/images/promotions/offre.jpg"
              className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-transparent focus:ring-2 focus:ring-brand-green-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date de début</label>
            <input
              type="date"
              value={promotionForm.startDate}
              onChange={(event) => setPromotionForm((prev) => ({ ...prev, startDate: event.target.value }))}
              className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-transparent focus:ring-2 focus:ring-brand-green-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date de fin</label>
            <input
              type="date"
              value={promotionForm.endDate}
              onChange={(event) => setPromotionForm((prev) => ({ ...prev, endDate: event.target.value }))}
              className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-transparent focus:ring-2 focus:ring-brand-green-500"
            />
          </div>
          <div className="md:col-span-2">
            <button
              type="submit"
              disabled={promotionSubmitting}
              className="w-full rounded-lg bg-brand-green-600 px-4 py-2 font-semibold text-white transition hover:bg-brand-green-700 disabled:opacity-60"
            >
              {promotionSubmitting ? 'Enregistrement...' : 'Ajouter la promotion'}
            </button>
          </div>
        </form>
      </div>

      <div className="rounded-xl bg-white p-6 shadow">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Promotions en cours</h2>
        {promotionsLoading ? (
          <p className="text-sm text-gray-500">Chargement des promotions...</p>
        ) : promotions.length === 0 ? (
          <p className="text-sm text-gray-500">Aucune promotion enregistrée pour le moment.</p>
        ) : (
          <div className="space-y-3">
            {promotions.slice(-5).reverse().map((promotion) => (
              <div key={promotion.id} className="flex items-start justify-between rounded-lg border border-gray-200 p-4">
                <div>
                  <p className="font-semibold text-gray-900">{promotion.title}</p>
                  <p className="text-sm text-gray-500">
                    {promotion.discount ? `${promotion.discount}%` : 'Remise personnalisée'} • {promotion.startDate ? new Date(promotion.startDate).toLocaleDateString('fr-FR') : 'Date libre'}
                  </p>
                </div>
                <button
                  onClick={() => handleDeletePromotion(promotion)}
                  className="text-sm font-medium text-red-600 hover:text-red-700"
                >
                  Supprimer
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  if (initializing) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
        <p className="text-sm text-gray-600">Vérification de votre session...</p>
      </div>
    );
  }

  if (!admin || !token) {
    return (
      <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
        {renderLogin()}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-10">
      <div className="mx-auto max-w-6xl space-y-8 px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col justify-between gap-4 rounded-xl bg-white p-6 shadow md:flex-row md:items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Tableau de bord administrateur</h1>
            <p className="text-sm text-gray-600">
              Connecté en tant que <span className="font-medium text-gray-900">{admin.name}</span> ({admin.email})
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => onNavigate('home')}
              className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 transition hover:border-brand-green-500 hover:text-brand-green-600"
            >
              Voir le site
            </button>
            <button
              onClick={handleLogout}
              disabled={loading}
              className="rounded-lg bg-red-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-600 disabled:opacity-60"
            >
              {loading ? 'Déconnexion...' : 'Se déconnecter'}
            </button>
          </div>
        </div>

        {feedback && (
          <div
            className={`rounded-lg border px-4 py-3 text-sm ${
              feedback.type === 'success'
                ? 'border-green-200 bg-green-50 text-green-700'
                : 'border-red-200 bg-red-50 text-red-700'
            }`}
          >
            {feedback.message}
          </div>
        )}

        {hasErrors && (
          <div className="rounded-lg border border-yellow-200 bg-yellow-50 px-4 py-3 text-sm text-yellow-700">
            Certaines données n'ont pas pu être chargées correctement. Rafraîchissez la page ou réessayez plus tard.
          </div>
        )}

        {renderStats()}

        <div className="rounded-xl bg-white p-2 shadow">
          <div className="flex flex-wrap gap-2 border-b border-gray-200 p-2">
            <button
              onClick={() => setActiveTab('products')}
              className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
                activeTab === 'products'
                  ? 'bg-brand-green-600 text-white shadow'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              Produits
            </button>
            <button
              onClick={() => setActiveTab('blog')}
              className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
                activeTab === 'blog'
                  ? 'bg-brand-green-600 text-white shadow'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              Blog
            </button>
            <button
              onClick={() => setActiveTab('promotions')}
              className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
                activeTab === 'promotions'
                  ? 'bg-brand-green-600 text-white shadow'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              Promotions
            </button>
          </div>

          <div className="p-4">
            {activeTab === 'products' && renderProductTab()}
            {activeTab === 'blog' && renderBlogTab()}
            {activeTab === 'promotions' && renderPromotionTab()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Admin;
