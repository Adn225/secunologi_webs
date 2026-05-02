import { supabase } from '../utils/supabase';
import { Product, BlogPost, Promotion } from '../types';

export const fetchProducts = async (): Promise<Product[]> => {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .order('category', { ascending: true });

  if (error) {
    console.error('Erreur lors de la récupération des produits:', error);
    throw new Error('Erreur réseau lors du chargement des produits.');
  }

  return data ? (data as Product[]) : [];
};

export const fetchBlogPosts = async (): Promise<BlogPost[]> => {
  const { data, error } = await supabase
    .from('blog_posts')
    .select('*')
    .order('date', { ascending: false });

  if (error) {
    console.error('Erreur lors de la récupération des articles:', error);
    throw new Error('Erreur réseau lors du chargement des articles.');
  }

  return data ? (data as BlogPost[]) : [];
};

export const fetchPromotions = async (): Promise<Promotion[]> => {
  const { data, error } = await supabase
    .from('promotions')
    .select('*')
    .order('startDate', { ascending: true });

  if (error) {
    console.error('Erreur lors de la récupération des promotions:', error);
    throw new Error('Erreur réseau lors du chargement des promotions.');
  }

  return data ? (data as Promotion[]) : [];
};
// Définition des types pour le formulaire
export interface ContactPayload {
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
}

export interface ContactResponse {
  message: string;
}

// Fonction pour envoyer le message vers Supabase
export const submitContact = async (payload: ContactPayload): Promise<ContactResponse> => {
  const { error } = await supabase
    .from('contact_messages')
    .insert([
      {
        name: payload.name,
        email: payload.email,
        phone: payload.phone || null, // Optionnel, on met null si vide
        subject: payload.subject,
        message: payload.message
      }
    ]);

  if (error) {
    console.error('Erreur Supabase lors de l\'envoi:', error);
    throw new Error('Désolé, une erreur est survenue lors de l\'envoi de votre message.');
  }

  return { message: 'Votre message a bien été envoyé ! Notre équipe Secunologie vous contactera rapidement.' };
};