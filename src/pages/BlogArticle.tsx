import React, { useEffect, useState } from 'react';
import { supabase } from '../utils/supabase';
import { ArrowLeft, Calendar, Tag, Image as ImageIcon } from 'lucide-react';

interface BlogArticleProps {
  articleId: string | null;
  onNavigate: (page: string) => void;
}

const BlogArticle: React.FC<BlogArticleProps> = ({ articleId, onNavigate }) => {
  const [post, setPost] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const BRAND_COLOR = '#5BA486';

  useEffect(() => {
    const fetchPost = async () => {
      if (!articleId) return; // On utilise articleId au lieu de id
      
      const { data, error } = await supabase
        .from('blog_posts')
        .select('*')
        .eq('id', articleId)
        .single();

      if (data) {
        setPost(data);
      } else {
        console.error("Erreur ou article introuvable :", error);
      }
      setLoading(false);
    };

    fetchPost();
  }, [articleId]);

  if (loading) {
    return (
      <div className="min-h-screen pt-32 pb-12 flex justify-center items-center bg-gray-50">
        <div className="text-lg font-semibold animate-pulse" style={{ color: BRAND_COLOR }}>
          Chargement de l'article...
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen pt-32 pb-12 flex flex-col justify-center items-center bg-gray-50 px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Article introuvable</h1>
        <p className="text-gray-600 mb-8">Désolé, cet article n'existe pas ou a été retiré.</p>
        <button onClick={() => onNavigate('blog')} className="...">
            Retour au blog
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white pt-24 pb-20">
      
      {/* BANNIÈRE DE L'IMAGE DE COUVERTURE */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 mb-10">
        <button onClick={() => onNavigate('blog')} className="..."> 
            <ArrowLeft size={20} /> 
            Retour aux articles 
        </button>
        
        <div className="w-full h-[400px] md:h-[500px] bg-gray-100 rounded-3xl overflow-hidden shadow-sm relative">
          {post.image ? (
            <img src={post.image} alt={post.title} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center text-gray-400">
              <ImageIcon size={64} className="mb-4 opacity-50" />
              <span className="font-medium">Aucune image de couverture</span>
            </div>
          )}
          
          {post.category && (
            <div className="absolute top-6 left-6">
              <span className="text-white text-sm font-bold px-4 py-2 rounded-full shadow-lg flex items-center gap-2" style={{ backgroundColor: BRAND_COLOR }}>
                <Tag size={16} /> {post.category}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* CONTENU DE L'ARTICLE */}
      <article className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* En-tête de l'article */}
        <header className="mb-10 text-center">
          <div className="flex justify-center items-center gap-2 text-gray-500 font-medium mb-6">
            <Calendar size={18} />
            <time dateTime={post.created_at}>
              Publié le {new Date(post.created_at).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
            </time>
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 leading-tight mb-6">
            {post.title}
          </h1>
          <p className="text-xl text-gray-600 font-medium italic">
            {post.excerpt}
          </p>
        </header>

        {/* Corps du texte */}
        {/* 'whitespace-pre-wrap' permet de respecter les sauts de ligne que vous faites dans le tableau de bord */}
        <div className="prose prose-lg max-w-none text-gray-800 leading-relaxed whitespace-pre-wrap">
          {post.content}
        </div>

        {/* Pied de page de l'article */}
        <footer className="mt-16 pt-8 border-t border-gray-200">
          <div className="bg-gray-50 rounded-2xl p-8 text-center flex flex-col items-center">
            <h3 className="text-2xl font-bold text-gray-900 mb-3">Besoin d'aide pour votre sécurité ?</h3>
            <p className="text-gray-600 mb-6 max-w-xl">
              Les experts de Secunologie sont à votre disposition pour vous conseiller sur le meilleur matériel adapté à vos besoins en Côte d'Ivoire.
            </p>
            <button onClick={() => onNavigate('contact')} className="...">
                Contactez-nous
            </button>
          </div>
        </footer>

      </article>
    </div>
  );
};

export default BlogArticle;