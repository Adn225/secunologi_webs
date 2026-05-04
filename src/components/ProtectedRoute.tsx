import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Lock } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  onNavigate: (page: string) => void;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, onNavigate }) => {
  const { user, loading } = useAuth();

  // 1. Pendant qu'on vérifie l'identité, on fait patienter
  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <p className="text-gray-500">Vérification de l'accès sécurisé...</p>
      </div>
    );
  }

  // 2. Si le visiteur n'est PAS connecté, on affiche un message d'erreur poli
  if (!user) {
    return (
      <div className="max-w-md mx-auto mt-16 p-8 bg-white rounded-lg shadow-md text-center border-t-4 border-orange-500">
        <div className="flex justify-center mb-4">
          <div className="bg-orange-100 p-4 rounded-full text-orange-500">
            <Lock size={32} />
          </div>
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Accès restreint</h2>
        <p className="text-gray-600 mb-6">
          Vous devez être connecté à votre espace client Secunologie pour accéder à cette page en toute sécurité.
        </p>
        <button
          onClick={() => onNavigate('account')}
          className="w-full bg-brand-green-600 text-white py-2 px-4 rounded-md hover:bg-brand-green-700 transition-colors font-medium"
        >
          Se connecter ou créer un compte
        </button>
      </div>
    );
  }

  // 3. Si tout est bon, on affiche la page demandée !
  return <>{children}</>;
};

export default ProtectedRoute;