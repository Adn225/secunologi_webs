import React, { useState } from 'react';
import { supabase } from '../utils/supabase';
import { Building2, MessageCircle, MapPin, ArrowLeft, CheckCircle } from 'lucide-react';

interface SignupProps { onNavigate: (page: string) => void; }

const Signup: React.FC<SignupProps> = ({ onNavigate }) => {
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<{ text: string, type: 'success' | 'error' } | null>(null);
  
  const [formData, setFormData] = useState({
    email: '', password: '', firstName: '', lastName: '', 
    whatsapp: '', companyName: '', clientType: 'Technicien / Installateur', locality: ''
  });

  // ANALYSE DU MOT DE PASSE EN TEMPS RÉEL
  const passwordRules = {
    length: formData.password.length >= 8, // Ajustez à 8 si vous avez configuré 8 sur Supabase
    uppercase: /[A-Z]/.test(formData.password),
    lowercase: /[a-z]/.test(formData.password),
    number: /[0-9]/.test(formData.password)
  };

  // Le mot de passe est valide seulement si toutes les règles sont respectées
  const isPasswordValid = Object.values(passwordRules).every(Boolean);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Sécurité supplémentaire : bloquer l'envoi si le mot de passe n'est pas conforme
    if (!isPasswordValid) {
      setMsg({ text: "Veuillez respecter tous les critères du mot de passe.", type: 'error' });
      return;
    }

    setLoading(true);
    setMsg(null);

    const { error } = await supabase.auth.signUp({
      email: formData.email,
      password: formData.password,
      options: {
        data: {
          first_name: formData.firstName,
          last_name: formData.lastName,
          whatsapp: formData.whatsapp,
          company_name: formData.companyName,
          client_type: formData.clientType,
          locality: formData.locality
        }
      }
    });

    if (error) {
      setMsg({ text: error.message, type: 'error' });
    } else {
      setMsg({ 
        text: `🎉 Inscription réussie ! Un lien d'activation a été envoyé à ${formData.email}. Veuillez vérifier votre boîte de réception (et vos spams).`, 
        type: 'success' 
      });
      setFormData({
        email: '', password: '', firstName: '', lastName: '', 
        whatsapp: '', companyName: '', clientType: 'Technicien / Installateur', locality: ''
      });
    }
    
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-32 pb-12 px-4">
      <div className="max-w-2xl mx-auto bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
        <div className="p-8 md:p-12">
          <button onClick={() => onNavigate('account')} className="flex items-center gap-2 text-gray-400 hover:text-gray-900 mb-8 font-bold">
            <ArrowLeft size={20} /> Retour
          </button>
          
          <h2 className="text-3xl font-extrabold text-gray-900 mb-2">Inscription Partenaire</h2>
          <p className="text-gray-500 mb-6">Rejoignez Secunologie et accédez à nos services professionnels.</p>

          {msg && (
            <div className={`p-4 rounded-xl mb-8 font-bold text-sm ${msg.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
              {msg.text}
            </div>
          )}

          <form onSubmit={handleSignup} className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <input required placeholder="Prénom" className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-brand-green-500" value={formData.firstName} onChange={e => setFormData({...formData, firstName: e.target.value})} />
            <input required placeholder="Nom" className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-brand-green-500" value={formData.lastName} onChange={e => setFormData({...formData, lastName: e.target.value})} />
            
            <div className="md:col-span-2 relative">
              <Building2 className="absolute left-4 top-3.5 text-gray-400" size={18} />
              <input required placeholder="Nom de votre Entreprise / Structure" className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-brand-green-500" value={formData.companyName} onChange={e => setFormData({...formData, companyName: e.target.value})} />
            </div>

            <div className="relative">
              <MapPin className="absolute left-4 top-3.5 text-gray-400" size={18} />
              <input required placeholder="Localité (ex: Abidjan, Cocody)" className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-brand-green-500" value={formData.locality} onChange={e => setFormData({...formData, locality: e.target.value})} />
            </div>

            <div className="relative">
              <MessageCircle className="absolute left-4 top-3.5 text-green-500" size={18} />
              <input required placeholder="WhatsApp (+225...)" className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-brand-green-500" value={formData.whatsapp} onChange={e => setFormData({...formData, whatsapp: e.target.value})} />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-gray-400 mb-2 uppercase ml-1">Type de structure</label>
              <select className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-brand-green-500 font-medium" value={formData.clientType} onChange={e => setFormData({...formData, clientType: e.target.value})}>
                <option value="Technicien / Installateur">Technicien / Installateur</option>
                <option value="Société de Sécurité">Société de Sécurité / Intégration</option>
                <option value="Revendeur">Revendeur / Distributeur</option>
                <option value="Bureau d'Etudes">Bureau d'Études / Expert</option>
              </select>
            </div>

            <div className="md:col-span-2 pt-4 border-t border-gray-100">
              <input required type="email" placeholder="Email professionnel" className="w-full px-4 py-3 mb-4 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-brand-green-500" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
              
              <input required type="password" placeholder="Mot de passe" className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-brand-green-500" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} />
              
              {/* AFFICHAGE DES CRITÈRES DU MOT DE PASSE */}
              <div className="mt-3 grid grid-cols-2 gap-2 text-xs font-medium">
                <div className={`flex items-center gap-1.5 ${passwordRules.length ? 'text-green-600' : 'text-gray-400'}`}>
                  <CheckCircle size={14} className={passwordRules.length ? 'opacity-100' : 'opacity-40'} /> 8 caractères min.
                </div>
                <div className={`flex items-center gap-1.5 ${passwordRules.uppercase ? 'text-green-600' : 'text-gray-400'}`}>
                  <CheckCircle size={14} className={passwordRules.uppercase ? 'opacity-100' : 'opacity-40'} /> 1 Majuscule
                </div>
                <div className={`flex items-center gap-1.5 ${passwordRules.lowercase ? 'text-green-600' : 'text-gray-400'}`}>
                  <CheckCircle size={14} className={passwordRules.lowercase ? 'opacity-100' : 'opacity-40'} /> 1 Minuscule
                </div>
                <div className={`flex items-center gap-1.5 ${passwordRules.number ? 'text-green-600' : 'text-gray-400'}`}>
                  <CheckCircle size={14} className={passwordRules.number ? 'opacity-100' : 'opacity-40'} /> 1 Chiffre
                </div>
              </div>
            </div>

            <button 
              type="submit" 
              // Le bouton est désactivé si ça charge OU si le mot de passe n'est pas bon
              disabled={loading || !isPasswordValid} 
              className="md:col-span-2 w-full mt-4 py-4 bg-brand-green-600 text-white rounded-xl font-extrabold text-lg shadow-lg hover:bg-brand-green-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Traitement...' : 'Valider mon inscription'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Signup;