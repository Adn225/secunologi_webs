import { supabase } from '../utils/supabase';

export interface HomeBannerSettings {
  mode: 'carousel' | 'video';
  video_url: string | null;
  poster_url: string | null;
  title: string;
  subtitle: string;
  button_label: string;
  button_page: 'catalog' | 'services' | 'contact';
}

const columns = 'mode, video_url, poster_url, title, subtitle, button_label, button_page';

export async function fetchHomeBanner(signal: AbortSignal): Promise<HomeBannerSettings> {
  const { data, error } = await supabase
    .from('home_banner_settings')
    .select(columns)
    .eq('id', 1)
    .abortSignal(signal)
    .single();
  if (error) throw error;
  return data;
}

export async function saveHomeBanner(settings: HomeBannerSettings): Promise<HomeBannerSettings> {
  const { data, error } = await supabase
    .from('home_banner_settings')
    .update(settings)
    .eq('id', 1)
    .select(columns)
    .single();
  if (error) throw error;
  return data;
}

export function isBannerMediaUrl(value: string): boolean {
  if (/[\\\s]/.test(value)) return false;
  if (/^\/[^/]/.test(value)) return true;
  try {
    return new URL(value).protocol === 'https:' && value.startsWith('https://');
  } catch {
    return false;
  }
}
