import React from 'react';
import { Calendar, ArrowRight } from 'lucide-react';
import { blogPosts } from '../data/blogPosts';

const Blog: React.FC = () => {
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
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            <div className="grid grid-cols-1 lg:grid-cols-2">
              <img
                src={blogPosts[0].image}
                alt={blogPosts[0].title}
                className="w-full h-64 lg:h-full object-cover"
              />
              <div className="p-8 flex flex-col justify-center">
                <div className="flex items-center mb-4 text-sm text-gray-600">
                  <Calendar className="h-4 w-4 mr-2" />
                  {formatDate(blogPosts[0].date)}
                  <span className="mx-2">•</span>
                  <span className="bg-brand-green-100 text-brand-green-600 px-2 py-1 rounded-full text-xs">
                    {blogPosts[0].category}
                  </span>
                </div>
                <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-4">
                  {blogPosts[0].title}
                </h2>
                <p className="text-gray-600 mb-6 text-lg">
                  {blogPosts[0].excerpt}
                </p>
                <button className="bg-brand-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-brand-green-700 transition-colors flex items-center w-fit">
                  Lire la suite <ArrowRight className="ml-2 h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Blog Posts Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {blogPosts.slice(1).map((post) => (
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
          ))}
        </div>

        {/* Categories */}
        <section className="bg-white rounded-lg shadow-lg p-8 mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Catégories</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {['Guides', 'Actualités', 'Conseils', 'Nouveautés'].map((category, index) => (
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
