import React from 'react';
import { Shield, Users, Award, Target, MapPin, Clock } from 'lucide-react';

const About: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 pt-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Hero Section */}
        <section className="text-center mb-16">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">À propos de SecunologieCI</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Depuis 2019, nous sommes votre partenaire de confiance pour toutes vos solutions 
            de sécurité électronique en Côte d'Ivoire.
          </p>
        </section>

        {/* Company Story */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
          <div>
            <img 
              src="https://images.pexels.com/photos/5380792/pexels-photo-5380792.jpeg?auto=compress&cs=tinysrgb&w=800"
              alt="Équipe SecunologieCI"
              className="rounded-lg shadow-lg w-full h-96 object-cover"
            />
          </div>
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Notre histoire</h2>
            <div className="space-y-4 text-gray-600">
              <p>
                SecunologieCI a été fondée en 2019 avec une vision claire : démocratiser l'accès 
                aux technologies de sécurité électronique les plus avancées en Côte d'Ivoire.
              </p>
              <p>
                En tant que revendeur officiel agréé des marques <strong>Hikvision</strong>, 
                <strong> Huawei</strong> et <strong>EZVIZ</strong>, nous garantissons l'authenticité 
                et la qualité de tous nos produits.
              </p>
              <p>
                Notre expertise technique, combinée à un service client d'exception, nous a permis 
                de devenir un acteur de référence dans le domaine de la sécurité électronique.
              </p>
            </div>
          </div>
        </section>

        {/* Values */}
        <section className="bg-white rounded-lg shadow-lg p-8 mb-16">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">Nos valeurs</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: Shield,
                title: 'Sécurité & Fiabilité',
                description: 'Nous sélectionnons uniquement les équipements les plus fiables et performants du marché.'
              },
              {
                icon: Users,
                title: 'Service Client',
                description: 'L\'accompagnement de nos clients est au cœur de nos préoccupations, de la conception à la maintenance.'
              },
              {
                icon: Award,
                title: 'Excellence Technique',
                description: 'Nos techniciens sont certifiés et formés continuellement aux dernières technologies.'
              }
            ].map((value, index) => (
              <div key={index} className="text-center">
                <div className="bg-brand-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <value.icon className="h-8 w-8 text-brand-green-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">{value.title}</h3>
                <p className="text-gray-600">{value.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Stats */}
        <section className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-16">
          {[
            { number: '500+', label: 'Clients satisfaits' },
            { number: '1000+', label: 'Installations réalisées' },
            { number: '5 ans', label: 'D\'expérience' },
            { number: '24/7', label: 'Support technique' }
          ].map((stat, index) => (
            <div key={index} className="text-center bg-white p-6 rounded-lg shadow">
              <div className="text-3xl font-bold text-brand-green-700 mb-2">{stat.number}</div>
              <div className="text-gray-600">{stat.label}</div>
            </div>
          ))}
        </section>

        {/* Mission & Vision */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">
          <div className="bg-brand-green-600 text-white p-8 rounded-lg">
            <div className="flex items-center mb-4">
              <Target className="h-8 w-8 mr-3" />
              <h3 className="text-2xl font-bold">Notre mission</h3>
            </div>
            <p className="text-brand-green-100">
              Protéger les biens et les personnes en fournissant des solutions de sécurité 
              électronique innovantes, fiables et adaptées aux besoins spécifiques de chaque client.
            </p>
          </div>
          
          <div className="bg-orange-500 text-white p-8 rounded-lg">
            <div className="flex items-center mb-4">
              <Award className="h-8 w-8 mr-3" />
              <h3 className="text-2xl font-bold">Notre vision</h3>
            </div>
            <p className="text-orange-100">
              Devenir le leader incontournable des solutions de sécurité électronique en Afrique 
              de l'Ouest, reconnu pour notre expertise et la qualité de nos services.
            </p>
          </div>
        </section>

        {/* Team */}
        <section className="bg-white rounded-lg shadow-lg p-8 mb-16">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">Notre équipe</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                name: 'Kouassi Jean-Baptiste',
                role: 'Directeur Général',
                image: 'https://images.pexels.com/photos/2182970/pexels-photo-2182970.jpeg?auto=compress&cs=tinysrgb&w=400'
              },
              {
                name: 'Aminata Traoré',
                role: 'Responsable Technique',
                image: 'https://images.pexels.com/photos/3785077/pexels-photo-3785077.jpeg?auto=compress&cs=tinysrgb&w=400'
              },
              {
                name: 'Mohamed Koffi',
                role: 'Responsable Commercial',
                image: 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=400'
              }
            ].map((member, index) => (
              <div key={index} className="text-center">
                <img
                  src={member.image}
                  alt={member.name}
                  className="w-32 h-32 rounded-full mx-auto mb-4 object-cover"
                />
                <h3 className="font-semibold text-gray-900">{member.name}</h3>
                <p className="text-gray-600">{member.role}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Contact Info */}
        <section className="bg-gray-100 rounded-lg p-8 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">Nous trouver</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="flex items-center justify-center">
              <MapPin className="h-6 w-6 text-brand-green-600 mr-3" />
              <div>
                <p className="font-semibold">Adresse</p>
                <p className="text-gray-600">Abidjan, Cocody - Riviera Bonoumin</p>
              </div>
            </div>
            <div className="flex items-center justify-center">
              <Clock className="h-6 w-6 text-brand-green-600 mr-3" />
              <div>
                <p className="font-semibold">Horaires</p>
                <p className="text-gray-600">Lun-Ven: 8h-18h | Sam: 8h-13h</p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default About;