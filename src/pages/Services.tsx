import React from 'react';
import { Shield, Wrench, Users, Clock, CheckCircle, Phone } from 'lucide-react';

interface ServicesProps {
  onNavigate: (page: string) => void;
}

const Services: React.FC<ServicesProps> = ({ onNavigate }) => {
  const services = [
    {
      icon: Shield,
      title: 'Installation & Configuration',
      description: 'Installation professionnelle de vos systèmes de sécurité avec configuration optimale.',
      features: [
        'Étude de site gratuite',
        'Installation certifiée',
        'Configuration personnalisée',
        'Tests de fonctionnement',
        'Formation utilisateur'
      ],
      price: 'À partir de 50 000 FCFA'
    },
    {
      icon: Wrench,
      title: 'Maintenance & Support',
      description: 'Maintenance préventive et curative pour garantir la performance de vos équipements.',
      features: [
        'Maintenance préventive',
        'Intervention d\'urgence 24/7',
        'Mise à jour firmware',
        'Nettoyage des équipements',
        'Rapport détaillé'
      ],
      price: 'Contrat à partir de 25 000 FCFA/mois'
    },
    {
      icon: Users,
      title: 'Conseil & Audit',
      description: 'Audit de sécurité et recommandations personnalisées selon vos besoins.',
      features: [
        'Audit de sécurité complet',
        'Analyse des risques',
        'Recommandations d\'amélioration',
        'Devis détaillé',
        'Accompagnement projet'
      ],
      price: 'À partir de 75 000 FCFA'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 pt-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Nos Services</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            De l'étude de projet à la maintenance, nous vous accompagnons à chaque étape 
            pour garantir la sécurité optimale de vos installations.
          </p>
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16">
          {services.map((service, index) => (
            <div key={index} className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300">
              <div className="p-8">
                <div className="bg-olive-100 w-16 h-16 rounded-full flex items-center justify-center mb-6">
                  <service.icon className="h-8 w-8 text-olive-700" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">{service.title}</h3>
                <p className="text-gray-600 mb-6">{service.description}</p>
                
                <ul className="space-y-3 mb-6">
                  {service.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-center">
                      <CheckCircle className="h-5 w-5 text-green-500 mr-3 flex-shrink-0" />
                      <span className="text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>
                
                <div className="border-t pt-6">
                  <p className="text-lg font-semibold text-olive-700 mb-4">{service.price}</p>
                  <button 
                    onClick={() => onNavigate('contact')}
                    className="w-full bg-olive-700 text-white py-3 rounded-lg font-semibold hover:bg-olive-800 transition-colors"
                  >
                    Demander un devis
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Process Section */}
        <section className="bg-white rounded-lg shadow-lg p-8 mb-16">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Notre processus d'intervention
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {[
              {
                step: '1',
                title: 'Analyse des besoins',
                description: 'Étude gratuite de vos besoins et de votre environnement'
              },
              {
                step: '2',
                title: 'Proposition technique',
                description: 'Présentation d\'une solution adaptée avec devis détaillé'
              },
              {
                step: '3',
                title: 'Installation',
                description: 'Mise en œuvre par nos techniciens certifiés'
              },
              {
                step: '4',
                title: 'Support continu',
                description: 'Maintenance et support technique pour assurer la durabilité'
              }
            ].map((process, index) => (
              <div key={index} className="text-center">
                <div className="bg-olive-700 text-white w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">
                  {process.step}
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">{process.title}</h3>
                <p className="text-gray-600 text-sm">{process.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Guarantees Section */}
        <section className="bg-olive-700 text-white rounded-lg p-8 mb-16">
          <h2 className="text-3xl font-bold text-center mb-12">Nos garanties</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: Clock,
                title: 'Intervention rapide',
                description: 'Délai d\'intervention sous 24h pour les urgences'
              },
              {
                icon: CheckCircle,
                title: 'Qualité certifiée',
                description: 'Techniciens certifiés et équipements garantis'
              },
              {
                icon: Phone,
                title: 'Support 24/7',
                description: 'Hotline technique disponible jour et nuit'
              }
            ].map((guarantee, index) => (
              <div key={index} className="text-center">
                <div className="bg-olive-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <guarantee.icon className="h-8 w-8" />
                </div>
                <h3 className="text-xl font-semibold mb-3">{guarantee.title}</h3>
                <p className="text-olive-100">{guarantee.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* CTA Section */}
        <section className="text-center bg-gray-100 rounded-lg p-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Besoin d'un service personnalisé ?
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Contactez nos experts pour discuter de votre projet
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button 
              onClick={() => onNavigate('contact')}
              className="bg-olive-700 text-white px-8 py-4 rounded-lg font-semibold hover:bg-olive-800 transition-colors"
            >
              Nous contacter
            </button>
            <button className="border-2 border-olive-700 text-olive-700 px-8 py-4 rounded-lg font-semibold hover:bg-olive-700 hover:text-white transition-colors">
              Télécharger notre brochure
            </button>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Services;