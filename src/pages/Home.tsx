import React, { useEffect, useMemo, useState } from 'react';
import {
  ArrowRight,
  Shield,
  Users,
  Wrench,
  Play,
  Truck,
  Clock,
  Headset,
  ShieldCheck,
  Sparkles,
  Zap,
  Package,
} from 'lucide-react';
import ProductCard from '../components/ProductCard';
import { Product } from '../types';
import { useCart } from '../contexts/CartContext';
import { useExperience } from '../contexts/ExperienceContext';
import { useData } from '../contexts/DataContext';

interface HomeProps {
  onNavigate: (page: string) => void;
  onViewProduct: (product: Product) => void;
}

interface BundleDefinition {
  id: string;
  title: string;
  description: string;
  productIds: string[];
  savings: number;
  benefit: string;
}

interface HydratedBundle extends BundleDefinition {
  items: Product[];
  total: number;
  discounted: number;
}

const bundleDefinitions: BundleDefinition[] = [
  {
    id: 'bundle-pro',
    title: 'Pack surveillance avancée',
    description: 'Solution complète caméra 4MP + enregistreur 8 canaux + switch PoE',
    productIds: ['1', '2', '5'],
    savings: 0.12,
    benefit: 'Installation express offerte',
  },
  {
    id: 'bundle-smart',
    title: 'Pack maison connectée',
    description: 'Caméra WiFi et switch intelligent pour une sécurité agile',
    productIds: ['4', '5'],
    savings: 0.08,
    benefit: 'Support VIP 3 mois',
  },
  {
    id: 'bundle-premium',
    title: 'Pack accueil sécurisé',
    description: 'Interphone vidéo + caméra périmètre pour un contrôle total',
    productIds: ['3', '1'],
    savings: 0.1,
    benefit: 'Maintenance préventive offerte',
  },
];

const formatPrice = (price: number) => `${new Intl.NumberFormat('fr-FR').format(price)} FCFA`;

const Home: React.FC<HomeProps> = ({ onNavigate, onViewProduct }) => {
  const { products, productsLoading, productsError } = useData();
  const featuredProducts = useMemo(() => products.slice(0, 3), [products]);
  const dealProduct = products[0] ?? null;
  const dealDiscount = 0.18;
  const { dispatch } = useCart();
  const { recentlyViewedProducts, lastAddedProduct, trackAddedToCart, recentSearches } = useExperience();
  const [dealCountdown, setDealCountdown] = useState('00:00:00');

  useEffect(() => {
    const updateCountdown = () => {
      const now = new Date();
      const endOfDay = new Date();
      endOfDay.setHours(23, 59, 59, 999);
      const diff = endOfDay.getTime() - now.getTime();
      if (diff <= 0) {
        setDealCountdown('00:00:00');
        return;
      }
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff / (1000 * 60)) % 60);
      const seconds = Math.floor((diff / 1000) % 60);
      setDealCountdown(
        `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds
          .toString()
          .padStart(2, '0')}`,
      );
    };

    updateCountdown();
    const interval = window.setInterval(updateCountdown, 1000);
    return () => window.clearInterval(interval);
  }, []);

  const preferredCategories = useMemo(() => {
    const categories = new Set<string>();
    recentlyViewedProducts.forEach(product => categories.add(product.category));
    if (lastAddedProduct) {
      categories.add(lastAddedProduct.category);
    }
    return Array.from(categories);
  }, [recentlyViewedProducts, lastAddedProduct]);

  const recommendedProducts = useMemo(() => {
    const seen = new Set<string>();
    const collection: Product[] = [];

    const pushProduct = (product: Product | undefined) => {
      if (!product || seen.has(product.id)) return;
      seen.add(product.id);
      collection.push(product);
    };

    if (preferredCategories.length > 0) {
      products.forEach(product => {
        if (preferredCategories.includes(product.category)) {
          pushProduct(product);
        }
      });
    }

    products.forEach(product => pushProduct(product));

    return collection.slice(0, 6);
  }, [preferredCategories, products]);

  const bundles = useMemo<HydratedBundle[]>(() => {
    return bundleDefinitions
      .map(bundle => {
        const items = bundle.productIds
          .map(id => products.find(product => product.id === id))
          .filter((product): product is Product => Boolean(product));

        if (items.length !== bundle.productIds.length) {
          return null;
        }

        const total = items.reduce((sum, product) => sum + product.price, 0);
        const discounted = Math.round(total * (1 - bundle.savings));

        return {
          ...bundle,
          items,
          total,
          discounted,
        };
      })
      .filter((bundle): bundle is HydratedBundle => Boolean(bundle));
  }, [products]);

  const handleDealAdd = () => {
    if (!dealProduct) return;
    dispatch({ type: 'ADD_ITEM', payload: { product: dealProduct } });
    trackAddedToCart(dealProduct);
  };

  const handleBundleAdd = (items: Product[]) => {
    items.forEach(item => dispatch({ type: 'ADD_ITEM', payload: { product: item } }));
    if (items[0]) {
      trackAddedToCart(items[0]);
    }
  };

  const personalizedIntro = recentSearches[0]
    ? `à partir de votre recherche « ${recentSearches[0]} »`
    : recentlyViewedProducts.length > 0
      ? 'inspirée de vos dernières consultations'
      : 'sélectionnée par nos experts';

  const recentlyViewedToShow = recentlyViewedProducts.slice(0, 6);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-brand-green-900 via-brand-green-700 to-brand-green-600 text-white overflow-hidden">
        <div className="absolute inset-0 bg-black opacity-20" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center px-4 py-1 mb-4 rounded-full bg-white/10 text-sm">
                <Sparkles className="h-4 w-4 text-orange-300 mr-2" />
                SecunoPrime – expérience inspirée d'Amazon Prime
              </div>
              <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
                Sécurisez votre monde avec
                <span className="text-orange-300"> SecunologieCI</span>
              </h1>
              <p className="text-xl mb-8 text-brand-green-100 max-w-xl">
                Livraison express, installation prioritaire et recommandations intelligentes : tout ce qui fait la force d'Amazon, adapté à la sécurité électronique en Côte d'Ivoire.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  onClick={() => onNavigate('catalog')}
                  className="bg-orange-500 text-white px-8 py-4 rounded-lg font-semibold hover:bg-orange-600 transition-colors flex items-center justify-center"
                >
                  Voir le catalogue <ArrowRight className="ml-2 h-5 w-5" />
                </button>
                <button className="border-2 border-white text-white px-8 py-4 rounded-lg font-semibold hover:bg-white hover:text-brand-green-800 transition-colors flex items-center justify-center">
                  <Play className="mr-2 h-5 w-5" /> Découvrir SecunoPrime
                </button>
              </div>
            </div>
            <div className="hidden lg:block">
              <img
                src="https://images.pexels.com/photos/5380792/pexels-photo-5380792.jpeg?auto=compress&cs=tinysrgb&w=800"
                alt="Système de sécurité"
                className="rounded-lg shadow-2xl"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Promise Bar */}
      <section className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                Icon: Truck,
                title: 'SecunoPrime Express',
                description: 'Livraison et installation en 48h sur Abidjan',
              },
              {
                Icon: Clock,
                title: 'Suivi en temps réel',
                description: 'Notifications proactives sur chaque intervention',
              },
              {
                Icon: Headset,
                title: 'Support 24/7',
                description: 'Ligne directe avec un conseiller sécurité dédié',
              },
              {
                Icon: ShieldCheck,
                title: 'Garantie Sérénité',
                description: 'Extension de garantie 24 mois et SAV prioritaire',
              },
            ].map((promise, index) => (
              <div key={index} className="flex items-start gap-4 p-5 rounded-xl border border-gray-100 shadow-sm bg-white">
                <promise.Icon className="h-8 w-8 text-brand-green-600" />
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{promise.title}</h3>
                  <p className="text-sm text-gray-600">{promise.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { value: '500+', label: 'Clients entreprises fidèles' },
              { value: '98%', label: 'Taux de satisfaction SAV' },
              { value: '1000+', label: 'Installations réalisées' },
              { value: '24/7', label: 'Support technique premium' },
            ].map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl font-bold text-brand-green-700 mb-2">{stat.value}</div>
                <div className="text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Deal of the day */}
      <section className="py-16 bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {productsError ? (
            <div className="text-center text-red-200 py-12">
              Impossible de charger l'offre du jour. Veuillez réessayer plus tard.
            </div>
          ) : !dealProduct ? (
            <div className="text-center text-brand-green-100 py-12">
              {productsLoading
                ? 'Chargement de l’offre du jour...'
                : 'Aucune offre exclusive n’est disponible pour le moment. Revenez bientôt !'}
            </div>
          ) : (
            <div className="flex flex-col lg:flex-row gap-10 items-center">
              <div className="flex-1">
                <div className="inline-flex items-center px-3 py-1 rounded-full bg-white/10 text-sm mb-4">
                  <Zap className="h-4 w-4 text-orange-400 mr-2" /> Offre du jour SecunoPrime
                </div>
                <h2 className="text-3xl font-bold mb-4">{dealProduct.name}</h2>
                <p className="text-brand-green-100 mb-6 max-w-lg">
                  Profitez d'une remise exceptionnelle inspirée des "Deals of the Day" d'Amazon sur le modèle {dealProduct.brand}. Configuration à distance offerte et rappel d'entretien automatique inclus.
                </p>
                <div className="flex items-center gap-4 mb-6">
                  <span className="text-3xl font-extrabold text-orange-400">{formatPrice(Math.round(dealProduct.price * (1 - dealDiscount)))}</span>
                  <span className="text-lg text-brand-green-100 line-through">{formatPrice(dealProduct.price)}</span>
                  <span className="px-3 py-1 rounded-full bg-orange-500 text-sm font-semibold">-{Math.round(dealDiscount * 100)}%</span>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                  <button
                    onClick={handleDealAdd}
                    className="bg-orange-500 hover:bg-orange-600 transition-colors px-6 py-3 rounded-lg font-semibold text-white"
                  >
                    Ajouter en 1-clic
                  </button>
                  <span className="text-sm text-brand-green-100">
                    Expire dans <span className="font-semibold text-white">{dealCountdown}</span>
                  </span>
                </div>
                {lastAddedProduct && (
                  <p className="mt-4 text-xs uppercase tracking-wide text-brand-green-200">
                    Dernier ajout au panier : {lastAddedProduct.name}
                  </p>
                )}
              </div>
              <div className="flex-1 bg-white text-gray-900 rounded-2xl shadow-2xl p-6 w-full">
                <img
                  src={dealProduct.image}
                  alt={dealProduct.name}
                  className="w-full h-56 object-cover rounded-xl mb-4"
                />
                <h3 className="text-xl font-semibold mb-3">Ce qui est inclus :</h3>
                <ul className="space-y-2 text-sm text-gray-700">
                  {dealProduct.features.slice(0, 4).map((feature, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="mt-1 h-2 w-2 rounded-full bg-brand-green-600" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                <p className="mt-4 text-sm text-gray-600">
                  En bonus : audit de positionnement caméra + notifications automatisées en cas de maintenance, comme sur Amazon.
                </p>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Nos produits phares</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Découvrez notre sélection de produits de sécurité de dernière génération, choisis pour leur performance et leur fiabilité.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            {productsLoading ? (
              <div className="md:col-span-3 text-center text-gray-500 py-8">Chargement des produits phares...</div>
            ) : productsError ? (
              <div className="md:col-span-3 text-center text-red-600 py-8">Impossible de charger les produits phares.</div>
            ) : featuredProducts.length === 0 ? (
              <div className="md:col-span-3 text-center text-gray-500 py-8">
                Aucun produit disponible pour le moment.
              </div>
            ) : (
              featuredProducts.map(product => (
                <ProductCard key={product.id} product={product} onViewDetails={onViewProduct} />
              ))
            )}
          </div>

          <div className="text-center">
            <button
              onClick={() => onNavigate('catalog')}
              className="bg-brand-green-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-brand-green-700 transition-colors"
            >
              Voir tous les produits
            </button>
          </div>
        </div>
      </section>

      {/* Recommended for you */}
      {recommendedProducts.length > 0 && (
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-8">
              <div>
                <h2 className="text-3xl font-bold text-gray-900">Recommandé pour vous</h2>
                <p className="text-gray-600">
                  Une sélection {personalizedIntro} pour accélérer vos projets.
                </p>
              </div>
              <button
                onClick={() => onNavigate('catalog')}
                className="text-brand-green-600 hover:text-brand-green-700 font-medium flex items-center"
              >
                Explorer toutes les catégories <ArrowRight className="ml-2 h-4 w-4" />
              </button>
            </div>
            <div className="flex gap-6 overflow-x-auto pb-4 snap-x">
              {recommendedProducts.map(product => (
                <div key={product.id} className="min-w-[280px] snap-start">
                  <ProductCard product={product} onViewDetails={onViewProduct} />
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Recently viewed */}
      {recentlyViewedToShow.length > 0 && (
        <section className="py-16 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-3 mb-6">
              <Package className="h-5 w-5 text-brand-green-600" />
              <h2 className="text-2xl font-semibold text-gray-900">Retrouvez vos derniers articles consultés</h2>
            </div>
            <div className="flex gap-6 overflow-x-auto pb-4 snap-x">
              {recentlyViewedToShow.map(product => (
                <div key={product.id} className="min-w-[260px] snap-start">
                  <ProductCard product={product} onViewDetails={onViewProduct} />
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Services Overview */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Nos services intelligents</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Inspirés des standards Amazon : suivi en temps réel, maintenance prédictive et accompagnement personnalisé à chaque étape de votre projet de sécurité.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[{
              icon: Shield,
              title: 'Installation professionnelle',
              description: 'Déploiement certifié avec tests qualité et check-list digitalisée.',
            },
            {
              icon: Wrench,
              title: 'Maintenance préventive',
              description: 'Contrats intelligents avec alertes proactives et pièces en stock.',
            },
            {
              icon: Users,
              title: 'Conseil personnalisé',
              description: 'Analyse de risque, projection ROI et accompagnement de vos équipes.',
            }].map((service, index) => (
              <div key={index} className="text-center p-6 rounded-lg hover:shadow-lg transition-shadow bg-gray-50">
                <div className="bg-brand-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <service.icon className="h-8 w-8 text-brand-green-600" />
                </div>
                <h3 className="text-xl font-semibold mb-3">{service.title}</h3>
                <p className="text-gray-600">{service.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Bundles */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-10">
            <div>
              <h2 className="text-3xl font-bold text-gray-900">Packs prêts à installer</h2>
              <p className="text-gray-600">
                Optimisez votre budget grâce à nos bundles inspirés des recommandations "Acheter avec" d'Amazon.
              </p>
            </div>
            <button
              onClick={() => onNavigate('services')}
              className="text-brand-green-600 hover:text-brand-green-700 font-medium"
            >
              Découvrir nos accompagnements
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {productsLoading ? (
              <div className="col-span-full text-center text-gray-500 py-8">Chargement des packs personnalisés...</div>
            ) : productsError ? (
              <div className="col-span-full text-center text-red-600 py-8">Impossible de charger les packs pour le moment.</div>
            ) : bundles.length === 0 ? (
              <div className="col-span-full text-center text-gray-500 py-8">
                Aucun pack prêt à installer n'est disponible actuellement.
              </div>
            ) : (
              bundles.map(bundle => (
                <div key={bundle.id} className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm flex flex-col">
                  <div className="flex items-center gap-3 mb-4">
                    <Sparkles className="h-5 w-5 text-orange-400" />
                    <h3 className="text-xl font-semibold text-gray-900">{bundle.title}</h3>
                  </div>
                  <p className="text-sm text-gray-600 mb-4">{bundle.description}</p>
                  <ul className="space-y-2 text-sm text-gray-700 mb-4">
                    {bundle.items.map(item => (
                      <li key={item.id} className="flex items-center justify-between">
                        <span>{item.name}</span>
                        <span className="text-gray-500">{item.brand}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="mt-auto">
                    <p className="text-sm text-brand-green-600 font-semibold mb-2">{bundle.benefit}</p>
                    <div className="flex items-end gap-3 mb-4">
                      <span className="text-2xl font-bold text-brand-green-700">{formatPrice(bundle.discounted)}</span>
                      <span className="text-sm text-gray-400 line-through">{formatPrice(bundle.total)}</span>
                      <span className="text-xs font-semibold text-orange-500 bg-orange-50 px-2 py-1 rounded-full">-{Math.round(bundle.savings * 100)}%</span>
                    </div>
                    <button
                      onClick={() => handleBundleAdd(bundle.items)}
                      className="w-full bg-brand-green-600 text-white py-3 rounded-lg font-semibold hover:bg-brand-green-700 transition-colors"
                    >
                      Ajouter le pack au panier
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </section>

      {/* Brands Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Nos partenaires de confiance</h2>
            <p className="text-gray-600">
              Nous travaillons avec les leaders mondiaux de la sécurité électronique
            </p>
          </div>

          <div className="flex flex-wrap justify-center items-center gap-12">
            <img
              src="https://upload.wikimedia.org/wikipedia/commons/2/2f/Hikvision_logo.svg"
              alt="Logo Hikvision"
              className="h-12 object-contain"
            />
            <img
              src="https://upload.wikimedia.org/wikipedia/commons/1/1b/Huawei_logo.svg"
              alt="Logo Huawei"
              className="h-12 object-contain"
            />
            <img
              src="https://upload.wikimedia.org/wikipedia/commons/2/2c/Ezviz_logo.svg"
              alt="Logo EZVIZ"
              className="h-12 object-contain"
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-brand-green-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">Prêt à sécuriser votre espace ?</h2>
          <p className="text-xl mb-8 text-brand-green-100">
            Contactez nos experts pour un devis gratuit et personnalisé
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => onNavigate('contact')}
              className="bg-orange-500 text-white px-8 py-4 rounded-lg font-semibold hover:bg-orange-600 transition-colors"
            >
              Demander un devis
            </button>
            <button className="border-2 border-white text-white px-8 py-4 rounded-lg font-semibold hover:bg-white hover:text-brand-green-600 transition-colors">
              Nous appeler
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
