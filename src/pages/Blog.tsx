import React, { useEffect, useState } from 'react';
import { supabase } from '../utils/supabase';
import { Calendar, ArrowRight, BookOpen } from 'lucide-react';

// On ajoute les Props
interface BlogProps {
  onNavigate: (page: string, id?: string) => void;
}

const Blog: React.FC<BlogProps> = ({ onNavigate }) => {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // La couleur de votre charte graphique
  const BRAND_COLOR = '#5BA486';

  useEffect(() => {
    const fetchPosts = async () => {
      // On ne récupère que les articles publiés (published = true)
      // et on les trie du plus récent au plus ancien
      const { data, error } = await supabase
        .from('blog_posts')
        .select('*')
        .eq('published', true)
        .order('created_at', { ascending: false });

      if (data) {
        setPosts(data);
      }
      setLoading(false);
    };

    fetchPosts();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen pt-32 pb-12 flex justify-center items-center">
        <div className="text-lg font-semibold animate-pulse" style={{ color: BRAND_COLOR }}>
          Chargement des articles...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-28 pb-20">
      
      {/* EN-TÊTE DE LA PAGE */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-16 text-center">
        <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-6">
          Actualités & Conseils <span style={{ color: BRAND_COLOR }}>Secunologie</span>
        </h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Découvrez nos derniers articles, astuces et guides pour optimiser votre sécurité électronique et rester informé des nouvelles technologies.
        </p>
      </div>

      {/* GRILLE DES ARTICLES */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {posts.length === 0 ? (
          <div className="text-center bg-white p-16 rounded-2xl shadow-sm border border-gray-100">
            <BookOpen size={64} className="mx-auto text-gray-200 mb-6" />
            <h3 className="text-2xl font-bold text-gray-800 mb-2">Aucun article pour le moment</h3>
            <p className="text-gray-500">Revenez très bientôt pour découvrir nos premières publications.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {posts.map((post) => (
              <article key={post.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg transition-shadow duration-300 flex flex-col group">
                
                {/* Image de couverture */}
                <div className="h-56 bg-gray-100 relative overflow-hidden">
                  {post.image ? (
                    <img 
                      src={post.image} 
                      alt={post.title} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-300">
                      <BookOpen size={40} />
                    </div>
                  )}
                  {/* Badge Catégorie */}
                  {post.category && (
                    <span className="absolute top-4 left-4 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-md" style={{ backgroundColor: BRAND_COLOR }}>
                      {post.category}
                    </span>
                  )}
                </div>

                {/* Contenu de la carte */}
                <div className="p-6 flex-1 flex flex-col">
                  <div className="flex items-center gap-2 text-sm text-gray-500 mb-4 font-medium">
                    <Calendar size={16} />
                    <time>
                      {new Date(post.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </time>
                  </div>
                  
                  <h2 className="text-xl font-bold text-gray-900 mb-3 line-clamp-2 leading-tight">
                    {post.title}
                  </h2>
                  
                  <p className="text-gray-600 text-sm mb-6 flex-1 line-clamp-3">
                    {post.excerpt}
                  </p>
                  
                  {/* Bouton Lire la suite */}
                  <div className="pt-4 border-t border-gray-100 mt-auto">
                    <button onClick={() => onNavigate('blog-article', post.id)} className="flex items-center gap-2 font-bold transition-colors group/btn inline-flex text-left" style={{ color: BRAND_COLOR }}>
                        Lire l'article 
                      <ArrowRight size={18} className="group-hover/btn:translate-x-1 transition-transform" />
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Blog;