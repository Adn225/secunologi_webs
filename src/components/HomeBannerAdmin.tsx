import { useEffect, useState, type FormEvent } from 'react';
import { fetchHomeBanner, isBannerMediaUrl, saveHomeBanner, type HomeBannerSettings } from '../services/homeBanner';

const inputStyle = 'mt-1 w-full rounded-lg border border-gray-300 px-3 py-2';

export default function HomeBannerAdmin() {
  const [settings, setSettings] = useState<HomeBannerSettings | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    fetchHomeBanner(controller.signal)
      .then(data => {
        if (!controller.signal.aborted) setSettings(data);
      })
      .catch(() => {
        if (!controller.signal.aborted) setError('Impossible de charger les réglages de la bannière.');
      });
    return () => controller.abort();
  }, []);

  const change = <Key extends keyof HomeBannerSettings>(key: Key, value: HomeBannerSettings[Key]) => {
    setSettings(current => current && { ...current, [key]: value });
    setError('');
    setSaved(false);
  };

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!settings || saving) return;
    const next = {
      ...settings,
      video_url: settings.video_url?.trim() || null,
      poster_url: settings.poster_url?.trim() || null,
      title: settings.title.trim(),
      subtitle: settings.subtitle.trim(),
      button_label: settings.button_label.trim(),
    };
    if (!next.title || (next.mode === 'video' && !next.video_url)) {
      setError('Renseignez un titre et une adresse de vidéo pour activer la bannière vidéo.');
      return;
    }
    if ([next.video_url, next.poster_url].some(url => url && !isBannerMediaUrl(url))) {
      setError('Utilisez des adresses HTTPS ou des chemins du site commençant par /.');
      return;
    }

    setSaving(true);
    setError('');
    setSaved(false);
    try {
      setSettings(await saveHomeBanner(next));
      setSaved(true);
    } catch {
      setError('Impossible d’enregistrer la bannière. Vérifiez votre accès administrateur et réessayez.');
    } finally {
      setSaving(false);
    }
  };

  if (!settings) {
    return error ? <p role="alert" className="text-red-700">{error}</p> : <p role="status">Chargement des réglages…</p>;
  }

  return (
    <form onSubmit={submit} className="max-w-2xl rounded-xl border border-gray-200 bg-white p-5 sm:p-8">
      <fieldset disabled={saving} className="space-y-6">
        <div>
          <label htmlFor="banner-mode" className="font-semibold">Format affiché sur l’accueil</label>
          <select id="banner-mode" className={inputStyle} value={settings.mode}
            onChange={event => change('mode', event.target.value === 'video' ? 'video' : 'carousel')}>
            <option value="carousel">Carrousel actuel</option>
            <option value="video">Bannière vidéo</option>
          </select>
        </div>
        {settings.mode === 'video' && (
          <div className="grid gap-4">
            <label className="font-semibold">
              Adresse de la vidéo
              <input type="text" inputMode="url" required maxLength={2048} className={inputStyle}
                placeholder="https://exemple.com/banniere.mp4" value={settings.video_url ?? ''}
                onChange={event => change('video_url', event.target.value)} aria-describedby="banner-video-hint" />
            </label>
            <p id="banner-video-hint" className="-mt-2 text-sm text-gray-600">Indiquez le lien direct d’un fichier MP4 ou WebM accessible publiquement.</p>
            <label className="font-semibold">
              Adresse de l’image de secours (facultatif)
              <input type="text" inputMode="url" maxLength={2048} className={inputStyle} value={settings.poster_url ?? ''}
                onChange={event => change('poster_url', event.target.value)} />
            </label>
            <label className="font-semibold">
              Titre
              <input type="text" required maxLength={100} className={inputStyle} value={settings.title}
                onChange={event => change('title', event.target.value)} />
            </label>
            <label className="font-semibold">
              Texte (facultatif)
              <textarea rows={3} maxLength={240} className={inputStyle} value={settings.subtitle}
                onChange={event => change('subtitle', event.target.value)} />
            </label>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="font-semibold">
                Texte du bouton (facultatif)
                <input type="text" maxLength={40} className={inputStyle} value={settings.button_label}
                  onChange={event => change('button_label', event.target.value)} />
              </label>
              <label className="font-semibold">
                Destination du bouton
                <select className={inputStyle} value={settings.button_page}
                  onChange={event => {
                    const page = event.target.value;
                    if (page === 'catalog' || page === 'services' || page === 'contact') change('button_page', page);
                  }}>
                  <option value="catalog">Catalogue</option>
                  <option value="services">Services</option>
                  <option value="contact">Contact</option>
                </select>
              </label>
            </div>
          </div>
        )}
        <button type="submit" className="rounded-lg bg-brand-green-700 px-5 py-3 font-semibold text-white hover:bg-brand-green-800 disabled:opacity-60">
          {saving ? 'Enregistrement…' : 'Enregistrer'}
        </button>
      </fieldset>
      {error && <p role="alert" className="mt-4 text-red-700">{error}</p>}
      {saved && <p role="status" className="mt-4 text-brand-green-800">Bannière d’accueil enregistrée.</p>}
    </form>
  );
}
