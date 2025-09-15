import React from 'react';
import { Shield, Phone, Mail, MapPin, Facebook, Instagram, Linkedin } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center mb-4">
              <Shield className="h-8 w-8 text-olive-400 mr-2" />
              <span className="text-2xl font-bold">SecunologieCI</span>
            </div>
            <p className="text-gray-300 mb-6 max-w-md">
              Votre partenaire de confiance pour toutes vos solutions de sécurité électronique 
              en Côte d'Ivoire. Expertise, qualité et service client d'exception.
            </p>
            <div className="flex space-x-4">
              <a
                href="https://www.facebook.com"
                aria-label="Facebook"
                target="_blank"
                rel="noreferrer"
              >
                <Facebook className="h-6 w-6 text-olive-400 hover:text-olive-300 transition-colors" />
              </a>
              <a
                href="https://www.instagram.com"
                aria-label="Instagram"
                target="_blank"
                rel="noreferrer"
              >
                <Instagram className="h-6 w-6 text-pink-400 hover:text-pink-300 transition-colors" />
              </a>
              <a
                href="https://www.linkedin.com"
                aria-label="LinkedIn"
                target="_blank"
                rel="noreferrer"
              >
                <Linkedin className="h-6 w-6 text-olive-400 hover:text-olive-300 transition-colors" />
              </a>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4">Liens rapides</h3>
            <ul className="space-y-2">
              <li><a href="#" className="text-gray-300 hover:text-white transition-colors">Accueil</a></li>
              <li><a href="#" className="text-gray-300 hover:text-white transition-colors">Catalogue</a></li>
              <li><a href="#" className="text-gray-300 hover:text-white transition-colors">Services</a></li>
              <li><a href="#" className="text-gray-300 hover:text-white transition-colors">À propos</a></li>
              <li><a href="#" className="text-gray-300 hover:text-white transition-colors">Contact</a></li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4">Contact</h3>
            <div className="space-y-3">
              <div className="flex items-center">
                <Phone className="h-5 w-5 text-olive-400 mr-3" />
                <span className="text-gray-300">+225 07 123 456 78</span>
              </div>
              <div className="flex items-center">
                <Mail className="h-5 w-5 text-olive-400 mr-3" />
                <span className="text-gray-300">contact@securologieci.com</span>
              </div>
              <div className="flex items-start">
                <MapPin className="h-5 w-5 text-olive-400 mr-3 mt-1" />
                <span className="text-gray-300">
                  Abidjan, Cocody<br />
                  Riviera Bonoumin
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 text-center">
          <p className="text-gray-400">
            © 2024 SecunologieCI. Tous droits réservés.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
