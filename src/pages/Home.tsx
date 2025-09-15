import React from 'react';
import { ArrowRight, Shield, Users, Wrench, Play } from 'lucide-react';
import { products } from '../data/products';
import ProductCard from '../components/ProductCard';
import { Product } from '../types';

interface HomeProps {
  onNavigate: (page: string) => void;
  onViewProduct: (product: Product) => void;
}

const Home: React.FC<HomeProps> = ({ onNavigate, onViewProduct }) => {
  const featuredProducts = products.slice(0, 3);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-olive-900 to-olive-700 text-white overflow-hidden">
        <div className="absolute inset-0 bg-black opacity-20"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
                Sécurisez votre monde avec 
                <span className="text-orange-400"> SecunologieCI</span>
              </h1>
              <p className="text-xl mb-8 text-olive-100">
                Solutions complètes de sécurité électronique : vidéosurveillance, 
                contrôle d'accès, alarmes et plus encore. Revendeur officiel Hikvision.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <button 
                  onClick={() => onNavigate('catalog')}
                  className="bg-orange-500 text-white px-8 py-4 rounded-lg font-semibold hover:bg-orange-600 transition-colors flex items-center justify-center"
                >
                  Voir le catalogue <ArrowRight className="ml-2 h-5 w-5" />
                </button>
                <button className="border-2 border-white text-white px-8 py-4 rounded-lg font-semibold hover:bg-white hover:text-olive-900 transition-colors flex items-center justify-center">
                  <Play className="mr-2 h-5 w-5" /> Voir la vidéo
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

      {/* Stats Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { value: '500+', label: 'Clients satisfaits' },
              { value: '1000+', label: 'Installations réalisées' },
              { value: '5 ans', label: 'D\'expérience' },
              { value: '24/7', label: 'Support technique' },
            ].map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl font-bold text-olive-700 mb-2">{stat.value}</div>
                <div className="text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Nos produits phares
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Découvrez notre sélection de produits de sécurité de dernière génération, 
              choisis pour leur performance et leur fiabilité.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            {featuredProducts.map((product) => (
              <ProductCard 
                key={product.id} 
                product={product} 
                onViewDetails={onViewProduct}
              />
            ))}
          </div>
          
          <div className="text-center">
            <button 
              onClick={() => onNavigate('catalog')}
              className="bg-olive-700 text-white px-8 py-3 rounded-lg font-semibold hover:bg-olive-800 transition-colors"
            >
              Voir tous les produits
            </button>
          </div>
        </div>
      </section>

      {/* Services Overview */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Nos services
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              De la conception à la maintenance, nous vous accompagnons à chaque étape 
              de votre projet de sécurité.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: Shield,
                title: 'Installation professionnelle',
                description: 'Installation certifiée par nos techniciens experts avec garantie complète.',
              },
              {
                icon: Wrench,
                title: 'Maintenance préventive',
                description: 'Contrats de maintenance pour assurer le bon fonctionnement de vos équipements.',
              },
              {
                icon: Users,
                title: 'Conseil personnalisé',
                description: 'Étude de vos besoins et recommandations adaptées à votre budget.',
              },
            ].map((service, index) => (
              <div key={index} className="text-center p-6 rounded-lg hover:shadow-lg transition-shadow">
                <div className="bg-olive-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <service.icon className="h-8 w-8 text-olive-700" />
                </div>
                <h3 className="text-xl font-semibold mb-3">{service.title}</h3>
                <p className="text-gray-600">{service.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Brands Section */}
      <section className="py-16 bg-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Nos partenaires de confiance
            </h2>
            <p className="text-gray-600">
              Nous travaillons avec les leaders mondiaux de la sécurité électronique
            </p>
          </div>
          
          <div className="flex justify-center items-center space-x-12 opacity-70">
            <div className="text-4xl font-bold text-red-600">HIKVISION</div>
            <div className="text-4xl font-bold text-red-500">HUAWEI</div>
            <div className="text-4xl font-bold text-olive-600">EZVIZ</div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-olive-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">
            Prêt à sécuriser votre espace ?
          </h2>
          <p className="text-xl mb-8 text-olive-100">
            Contactez nos experts pour un devis gratuit et personnalisé
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button 
              onClick={() => onNavigate('contact')}
              className="bg-orange-500 text-white px-8 py-4 rounded-lg font-semibold hover:bg-orange-600 transition-colors"
            >
              Demander un devis
            </button>
            <button className="border-2 border-white text-white px-8 py-4 rounded-lg font-semibold hover:bg-white hover:text-olive-700 transition-colors">
              Nous appeler
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
