import React, { useState } from 'react';
import { User, ShoppingBag, Settings, LogOut, FileText, Bell } from 'lucide-react';

const Account: React.FC = () => {
  const [activeTab, setActiveTab] = useState('profile');
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [imageError, setImageError] = useState<string | null>(null);

  const handleProfileImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    if (!file.type.startsWith('image/')) {
      setImageError('Veuillez sélectionner un fichier image valide.');
      event.target.value = '';
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setImageError('La taille de l\'image doit être inférieure à 5 Mo.');
      event.target.value = '';
      return;
    }

    setImageError(null);

    const reader = new FileReader();
    reader.onload = () => {
      setProfileImage(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const tabs = [
    { id: 'profile', name: 'Profil', icon: User },
    { id: 'orders', name: 'Commandes', icon: ShoppingBag },
    { id: 'quotes', name: 'Devis', icon: FileText },
    { id: 'notifications', name: 'Notifications', icon: Bell },
    { id: 'settings', name: 'Paramètres', icon: Settings },
  ];

  const orders = [
    {
      id: 'CMD-2024-001',
      date: '2024-01-15',
      total: 185000,
      status: 'Livré',
      items: 3
    },
    {
      id: 'CMD-2024-002',
      date: '2024-01-10',
      total: 95000,
      status: 'En cours',
      items: 1
    },
  ];

  const quotes = [
    {
      id: 'DEV-2024-001',
      date: '2024-01-20',
      title: 'Installation complète bureau',
      status: 'En attente',
      amount: 450000
    },
    {
      id: 'DEV-2024-002',
      date: '2024-01-18',
      title: 'Maintenance préventive',
      status: 'Approuvé',
      amount: 75000
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 pt-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="text-center mb-6">
                {profileImage ? (
                  <img
                    src={profileImage}
                    alt="Photo de profil"
                    className="w-20 h-20 rounded-full mx-auto mb-4 object-cover border-2 border-brand-green-100"
                  />
                ) : (
                  <div className="w-20 h-20 bg-brand-green-100 rounded-full mx-auto mb-4 flex items-center justify-center">
                    <User className="h-10 w-10 text-brand-green-600" />
                  </div>
                )}
                <h2 className="text-xl font-bold text-gray-900">Jean Kouassi</h2>
                <p className="text-gray-600">Client Premium</p>
              </div>
              
              <nav className="space-y-2">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center px-4 py-3 rounded-lg text-left transition-colors ${
                        activeTab === tab.id
                          ? 'bg-brand-green-600 text-white'
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      <Icon className="h-5 w-5 mr-3" />
                      {tab.name}
                    </button>
                  );
                })}
                <button className="w-full flex items-center px-4 py-3 rounded-lg text-left text-red-600 hover:bg-red-50 transition-colors">
                  <LogOut className="h-5 w-5 mr-3" />
                  Déconnexion
                </button>
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {activeTab === 'profile' && (
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Mon Profil</h2>
                
                <form className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Photo de profil
                    </label>
                    <div className="flex items-center gap-4">
                      {profileImage ? (
                        <img
                          src={profileImage}
                          alt="Aperçu de la photo de profil"
                          className="w-16 h-16 rounded-full object-cover border"
                        />
                      ) : (
                        <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center border">
                          <User className="h-8 w-8 text-gray-400" />
                        </div>
                      )}
                      <div className="w-full">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleProfileImageUpload}
                          className="w-full text-sm text-gray-700 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-brand-green-100 file:text-brand-green-700 hover:file:bg-brand-green-200"
                        />
                        <p className="text-xs text-gray-500 mt-1">Formats acceptés: JPG, PNG, WEBP (max 5 Mo)</p>
                        {imageError && <p className="text-sm text-red-600 mt-1">{imageError}</p>}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Prénom
                      </label>
                      <input
                        type="text"
                        defaultValue="Jean"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-green-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Nom
                      </label>
                      <input
                        type="text"
                        defaultValue="Kouassi"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-green-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email
                    </label>
                    <input
                      type="email"
                      defaultValue="jean.kouassi@email.com"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-green-500 focus:border-transparent"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Téléphone
                    </label>
                    <input
                      type="tel"
                      defaultValue="+225 07 123 456 78"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-green-500 focus:border-transparent"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Adresse
                    </label>
                    <textarea
                      rows={3}
                      defaultValue="Abidjan, Cocody Riviera"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-green-500 focus:border-transparent"
                    ></textarea>
                  </div>
                  
                  <button className="bg-brand-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-brand-green-700 transition-colors">
                    Mettre à jour
                  </button>
                </form>
              </div>
            )}

            {activeTab === 'orders' && (
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Mes Commandes</h2>
                
                <div className="space-y-4">
                  {orders.map((order) => (
                    <div key={order.id} className="border rounded-lg p-4 hover:bg-gray-50">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h3 className="font-semibold text-gray-900">{order.id}</h3>
                          <p className="text-gray-600">
                            {new Date(order.date).toLocaleDateString('fr-FR')} • {order.items} article(s)
                          </p>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                          order.status === 'Livré' 
                            ? 'bg-brand-green-light text-brand-green-dark'
                            : 'bg-orange-100 text-orange-700'
                        }`}>
                          {order.status}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-lg font-bold text-brand-green-700">
                          {order.total.toLocaleString()} FCFA
                        </span>
                        <button className="text-brand-green-600 hover:text-brand-green-700 font-medium">
                          Voir détails
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'quotes' && (
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Mes Devis</h2>
                
                <div className="space-y-4">
                  {quotes.map((quote) => (
                    <div key={quote.id} className="border rounded-lg p-4 hover:bg-gray-50">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h3 className="font-semibold text-gray-900">{quote.title}</h3>
                          <p className="text-gray-600">
                            {quote.id} • {new Date(quote.date).toLocaleDateString('fr-FR')}
                          </p>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                          quote.status === 'Approuvé' 
                            ? 'bg-brand-green-light text-brand-green-dark'
                            : 'bg-yellow-100 text-yellow-700'
                        }`}>
                          {quote.status}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-lg font-bold text-brand-green-700">
                          {quote.amount.toLocaleString()} FCFA
                        </span>
                        <div className="flex gap-2">
                          <button className="text-brand-green-600 hover:text-brand-green-700 font-medium">
                            Télécharger
                          </button>
                          {quote.status === 'Approuvé' && (
                            <button className="bg-brand-green-600 text-white px-4 py-2 rounded font-medium hover:bg-brand-green-700">
                              Valider
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="mt-6 text-center">
                  <button className="bg-orange-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-orange-600 transition-colors">
                    Demander un nouveau devis
                  </button>
                </div>
              </div>
            )}

            {activeTab === 'notifications' && (
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Notifications</h2>
                
                <div className="space-y-4">
                  <div className="flex items-start p-4 bg-brand-green-50 rounded-lg">
                    <Bell className="h-5 w-5 text-brand-green-600 mr-3 mt-1" />
                    <div>
                      <h3 className="font-semibold text-gray-900">Commande expédiée</h3>
                      <p className="text-gray-600">Votre commande CMD-2024-002 a été expédiée.</p>
                      <p className="text-sm text-gray-500 mt-1">Il y a 2 heures</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start p-4 border rounded-lg">
                    <Bell className="h-5 w-5 text-gray-500 mr-3 mt-1" />
                    <div>
                      <h3 className="font-semibold text-gray-900">Devis approuvé</h3>
                      <p className="text-gray-600">Votre devis DEV-2024-002 a été approuvé.</p>
                      <p className="text-sm text-gray-500 mt-1">Hier</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'settings' && (
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Paramètres</h2>
                
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Notifications</h3>
                    <div className="space-y-3">
                      <label className="flex items-center">
                        <input type="checkbox" defaultChecked className="mr-3" />
                        <span>Recevoir les notifications par email</span>
                      </label>
                      <label className="flex items-center">
                        <input type="checkbox" defaultChecked className="mr-3" />
                        <span>Notifications de commandes</span>
                      </label>
                      <label className="flex items-center">
                        <input type="checkbox" className="mr-3" />
                        <span>Newsletter et promotions</span>
                      </label>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Sécurité</h3>
                    <button className="bg-orange-500 text-white px-6 py-2 rounded-lg font-semibold hover:bg-orange-600 transition-colors">
                      Changer le mot de passe
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Account;
