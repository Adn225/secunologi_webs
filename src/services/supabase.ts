export interface ContactSubmissionPayload {
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
}

const DEFAULT_SUPABASE_URL = 'https://hlaxbvzzrvvqsjhqgdnz.supabase.co';
const DEFAULT_SUPABASE_ANON_KEY = 'sb_publishable_nAkKEcUehmasWwkqcc9W5Q_4-IXmogP';
const DEFAULT_CONTACT_TABLE = 'contact_submissions';

const trimTrailingSlash = (value: string) => value.replace(/\/+$/, '');

const getEnvValue = (key: string, fallback = ''): string => {
  const value = import.meta.env[key as keyof ImportMetaEnv];
  return typeof value === 'string' && value.trim() ? value.trim() : fallback;
};

const supabaseUrl = trimTrailingSlash(getEnvValue('VITE_SUPABASE_URL', DEFAULT_SUPABASE_URL));
const supabaseAnonKey = getEnvValue('VITE_SUPABASE_ANON_KEY', DEFAULT_SUPABASE_ANON_KEY);
const contactTable = getEnvValue('VITE_SUPABASE_CONTACT_TABLE', DEFAULT_CONTACT_TABLE);

export const isSupabaseConfigured = () => Boolean(supabaseUrl && supabaseAnonKey);

interface SupabaseError {
  message: string;
}

export const saveContactToSupabase = async (payload: ContactSubmissionPayload): Promise<void> => {
  if (!isSupabaseConfigured()) {
    throw new Error('Supabase n\'est pas configuré.');
  }

  const response = await fetch(`${supabaseUrl}/rest/v1/${contactTable}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      apikey: supabaseAnonKey,
      Authorization: `Bearer ${supabaseAnonKey}`,
      Prefer: 'return=minimal',
    },
    body: JSON.stringify({
      name: payload.name,
      email: payload.email,
      phone: payload.phone ?? null,
      subject: payload.subject,
      message: payload.message,
    }),
  });

  if (!response.ok) {
    let errorMessage = `Erreur Supabase (${response.status})`;
    try {
      const errorPayload = await response.json() as SupabaseError;
      if (errorPayload?.message) {
        errorMessage = errorPayload.message;
      }
    } catch {
      // On garde le message HTTP par défaut.
    }
    throw new Error(errorMessage);
  }
};
