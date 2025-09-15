import React, { useState } from 'react';
import { Phone, Mail, MapPin, Clock, MessageCircle, Send } from 'lucide-react';

const Contact: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      if (!res.ok) throw new Error('Network response was not ok');
      setStatus('success');
      setFormData({ name: '', email: '', phone: '', subject: '', message: '' });
    } catch {
      setStatus('error');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Contactez-nous</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Notre équipe est à votre disposition pour répondre à toutes vos questions 
            et vous accompagner dans vos projets de sécurité.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Contact Information */}
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Informations de contact</h2>
              
              <div className="space-y-4">
                <div className="flex items-start">
                  <Phone className="h-5 w-5 text-brand-green-600 mr-3 mt-1" />
                  <div>
                    <p className="font-semibold text-gray-900">Téléphone</p>
                    <p className="text-gray-600">+225 07 123 456 78</p>
                    <p className="text-gray-600">+225 05 987 654 32</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <Mail className="h-5 w-5 text-brand-green-600 mr-3 mt-1" />
                  <div>
                    <p className="font-semibold text-gray-900">Email</p>
                    <p className="text-gray-600">contact@securologieci.com</p>
                    <p className="text-gray-600">support@securologieci.com</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <MapPin className="h-5 w-5 text-brand-green-600 mr-3 mt-1" />
                  <div>
                    <p className="font-semibold text-gray-900">Adresse</p>
                    <p className="text-gray-600">
                      Abidjan, Cocody<br />
                      Riviera Bonoumin<br />
                      Face à la station Shell
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <Clock className="h-5 w-5 text-brand-green-600 mr-3 mt-1" />
                  <div>
                    <p className="font-semibold text-gray-900">Horaires</p>
                    <p className="text-gray-600">
                      Lundi - Vendredi: 8h00 - 18h00<br />
                      Samedi: 8h00 - 13h00<br />
                      Dimanche: Fermé
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-brand-green-600 text-white rounded-lg p-6">
              <h3 className="text-lg font-bold mb-4">Actions rapides</h3>
              <div className="space-y-3">
                <button className="w-full bg-orange-500 hover:bg-orange-600 text-white py-3 rounded-lg font-semibold transition-colors flex items-center justify-center">
                  <Phone className="h-4 w-4 mr-2" />
                  Appeler maintenant
                </button>
                <button className="w-full bg-brand-green hover:bg-brand-green-dark text-white py-3 rounded-lg font-semibold transition-colors flex items-center justify-center">
                  <MessageCircle className="h-4 w-4 mr-2" />
                  Chat WhatsApp
                </button>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Envoyez-nous un message</h2>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                      Nom complet *
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      required
                      value={formData.name}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-green-500 focus:border-transparent"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                      Email *
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      required
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-green-500 focus:border-transparent"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                      Téléphone
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-green-500 focus:border-transparent"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-1">
                      Sujet *
                    </label>
                    <select
                      id="subject"
                      name="subject"
                      required
                      value={formData.subject}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-green-500 focus:border-transparent"
                    >
                      <option value="">Choisir un sujet</option>
                      <option value="devis">Demande de devis</option>
                      <option value="installation">Installation</option>
                      <option value="maintenance">Maintenance</option>
                      <option value="support">Support technique</option>
                      <option value="autre">Autre</option>
                    </select>
                  </div>
                </div>
                
                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
                    Message *
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    required
                    rows={5}
                    value={formData.message}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-green-500 focus:border-transparent"
                    placeholder="Décrivez votre projet ou votre question..."
                  ></textarea>
                </div>
                
                <button
                  type="submit"
                  className="w-full bg-brand-green-600 text-white py-4 rounded-lg font-semibold hover:bg-brand-green-700 transition-colors flex items-center justify-center"
                >
                  <Send className="h-5 w-5 mr-2" />
                  Envoyer le message
                </button>
                {status === 'success' && (
                  <p className="text-brand-green text-center">Message envoyé avec succès !</p>
                )}
                {status === 'error' && (
                  <p className="text-red-600 text-center">Une erreur est survenue. Veuillez réessayer.</p>
                )}
              </form>
            </div>

            {/* FAQ Section */}
            <div className="mt-8 bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Questions fréquentes</h3>
              <div className="space-y-4">
                <details className="border-b pb-4">
                  <summary className="font-semibold text-gray-900 cursor-pointer">
                    Proposez-vous des devis gratuits ?
                  </summary>
                  <p className="text-gray-600 mt-2">
                    Oui, nous offrons des devis gratuits pour tous nos services d'installation 
                    et de maintenance.
                  </p>
                </details>
                <details className="border-b pb-4">
                  <summary className="font-semibold text-gray-900 cursor-pointer">
                    Quelle est la durée de garantie ?
                  </summary>
                  <p className="text-gray-600 mt-2">
                    Nos équipements bénéficient de la garantie constructeur (1 à 3 ans selon 
                    les produits) et nos installations sont garanties 1 an.
                  </p>
                </details>
                <details>
                  <summary className="font-semibold text-gray-900 cursor-pointer">
                    Intervenez-vous en urgence ?
                  </summary>
                  <p className="text-gray-600 mt-2">
                    Oui, nous proposons un service d'intervention d'urgence 24/7 pour nos 
                    clients sous contrat de maintenance.
                  </p>
                </details>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
