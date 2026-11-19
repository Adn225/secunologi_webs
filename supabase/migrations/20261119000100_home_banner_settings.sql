BEGIN;

CREATE TABLE public.home_banner_settings (
  id smallint PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  mode text NOT NULL DEFAULT 'carousel' CHECK (mode IN ('carousel', 'video')),
  video_url text CHECK (video_url ~ '^(https://[^[:space:]]+|/[^/[:space:]][^[:space:]]*)$' AND strpos(video_url, chr(92)) = 0 AND length(video_url) <= 2048),
  poster_url text CHECK (poster_url ~ '^(https://[^[:space:]]+|/[^/[:space:]][^[:space:]]*)$' AND strpos(poster_url, chr(92)) = 0 AND length(poster_url) <= 2048),
  title text NOT NULL DEFAULT 'Sécurisez vos accès' CHECK (length(btrim(title)) BETWEEN 1 AND 100),
  subtitle text NOT NULL DEFAULT 'Des solutions de contrôle d’accès adaptées à votre site.' CHECK (length(subtitle) <= 240),
  button_label text NOT NULL DEFAULT 'Découvrir les solutions' CHECK (length(button_label) <= 40),
  button_page text NOT NULL DEFAULT 'services' CHECK (button_page IN ('catalog', 'services', 'contact')),
  CHECK (mode <> 'video' OR video_url IS NOT NULL)
);

INSERT INTO public.home_banner_settings DEFAULT VALUES;
ALTER TABLE public.home_banner_settings ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.home_banner_settings FROM PUBLIC, anon, authenticated;
GRANT SELECT ON public.home_banner_settings TO anon, authenticated;
GRANT UPDATE (mode, video_url, poster_url, title, subtitle, button_label, button_page)
  ON public.home_banner_settings TO authenticated;

CREATE POLICY "Public can read the home banner" ON public.home_banner_settings
  FOR SELECT TO anon, authenticated USING (true);

CREATE POLICY "Administrators can edit the home banner" ON public.home_banner_settings
  FOR UPDATE TO authenticated
  USING ((SELECT auth.jwt()) -> 'app_metadata' ->> 'role' = 'admin')
  WITH CHECK ((SELECT auth.jwt()) -> 'app_metadata' ->> 'role' = 'admin');

COMMIT;
