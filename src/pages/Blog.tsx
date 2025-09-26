import React, { useMemo } from 'react';
import { Calendar, ArrowRight } from 'lucide-react';
import { useData } from '../contexts/DataContext';

const Blog: React.FC = () => {
  const { blogPosts, blogPostsLoading, blogPostsError } = useData();
  const featuredPost = blogPosts[0] ?? null;
  const categories = useMemo(() => {
    const unique = new Set(blogPosts.map(post => post.category));
    return unique.size > 0 ? Array.from(unique) : ['Guides', 'Actualités', 'Conseils', 'Nouveautés'];
  }, [blogPosts]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Blog</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Actualités, conseils et guides pratiques pour optimiser votre sécurité
          </p>
        </div>

        {/* Featured Post */}
        <div className="mb-12">
          {blogPostsError ? (
            <div className="text-center text-red-600 bg-white rounded-lg shadow-lg p-12">
              Impossible de charger les articles pour le moment.
            </div>
          ) : blogPostsLoading ? (
            <div className="text-center text-gray-500 bg-white rounded-lg shadow-lg p-12">
              Chargement des articles en vedette...
            </div>
          ) : !featuredPost ? (
            <div className="text-center text-gray-500 bg-white rounded-lg shadow-lg p-12">
              Aucun article n'est disponible pour le moment.
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-lg overflow-hidden">
              <div className="grid grid-cols-1 lg:grid-cols-2">
                <img
                  src={featuredPost.image}
                  alt={featuredPost.title}
                  className="w-full h-64 lg:h-full object-cover"
                />
                <div className="p-8 flex flex-col justify-center">
                  <div className="flex items-center mb-4 text-sm text-gray-600">
                    <Calendar className="h-4 w-4 mr-2" />
                    {formatDate(featuredPost.date)}
                    <span className="mx-2">•</span>
                    <span className="bg-brand-green-100 text-brand-green-600 px-2 py-1 rounded-full text-xs">
                      {featuredPost.category}
                    </span>
                  </div>
                  <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-4">
                    {featuredPost.title}
                  </h2>
                  <p className="text-gray-600 mb-6 text-lg">
                    {featuredPost.excerpt}
                  </p>
                  <button className="bg-brand-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-brand-green-700 transition-colors flex items-center w-fit">
                    Lire la suite <ArrowRight className="ml-2 h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Blog Posts Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {blogPostsLoading && !blogPostsError ? (
            <div className="col-span-full text-center text-gray-500 py-8">
              Chargement des articles...
            </div>
          ) : blogPostsError ? (
            <div className="col-span-full text-center text-red-600 py-8">
              Les articles ne peuvent pas être affichés pour le moment.
            </div>
          ) : blogPosts.length <= 1 ? (
            <div className="col-span-full text-center text-gray-500 py-8">
              Plus d'articles arrivent très bientôt.
            </div>
          ) : (
            blogPosts.slice(1).map((post) => (
              <article key={post.id} className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300">
                <img
                  src={post.image}
                  alt={post.title}
                  className="w-full h-48 object-cover"
                />
                <div className="p-6">
                  <div className="flex items-center mb-3 text-sm text-gray-600">
                    <Calendar className="h-4 w-4 mr-2" />
                    {formatDate(post.date)}
                    <span className="mx-2">•</span>
                    <span className="bg-brand-green-100 text-brand-green-600 px-2 py-1 rounded-full text-xs">
                      {post.category}
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3 line-clamp-2">
                    {post.title}
                  </h3>
                  <p className="text-gray-600 mb-4 line-clamp-3">
                    {post.excerpt}
                  </p>
                  <button className="text-brand-green-600 font-semibold hover:text-brand-green-700 transition-colors flex items-center">
                    Lire la suite <ArrowRight className="ml-2 h-4 w-4" />
                  </button>
                </div>
              </article>
            ))
          )}
        </div>

        {/* Categories */}
        <section className="bg-white rounded-lg shadow-lg p-8 mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Catégories</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {categories.map((category, index) => (
              <button
                key={index}
                className="bg-gray-100 hover:bg-brand-green-50 text-gray-700 hover:text-brand-green-600 px-4 py-3 rounded-lg font-medium transition-colors"
              >
                {category}
              </button>
            ))}
          </div>
        </section>

        {/* Newsletter Subscription */}
        <section className="bg-brand-green-600 text-white rounded-lg p-8 text-center">
          <h2 className="text-3xl font-bold mb-4">Restez informé</h2>
          <p className="text-brand-green-100 mb-6 text-lg">
            Abonnez-vous à notre newsletter pour recevoir nos derniers articles et conseils
          </p>
          <div className="max-w-md mx-auto flex gap-4">
            <input
              type="email"
              placeholder="Votre adresse email"
              className="flex-1 px-4 py-3 rounded-lg text-gray-900 focus:ring-2 focus:ring-orange-400 focus:outline-none"
            />
            <button className="bg-orange-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-orange-600 transition-colors">
              S'abonner
            </button>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Blog;
