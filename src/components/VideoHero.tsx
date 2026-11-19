import { useEffect, useRef, useState } from 'react';
import { ArrowRight, Pause, Play } from 'lucide-react';
import { isBannerMediaUrl, type HomeBannerSettings } from '../services/homeBanner';

interface VideoHeroProps {
  settings: HomeBannerSettings;
  onNavigate: (page: string) => void;
}

export default function VideoHero({ settings, onNavigate }: VideoHeroProps) {
  const video = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);
  const [failed, setFailed] = useState(false);
  const { video_url, poster_url, title, subtitle, button_label, button_page } = settings;
  const poster = poster_url && isBannerMediaUrl(poster_url) ? poster_url : '/hero/securite-solutions.svg';
  const showVideo = !failed && Boolean(video_url && isBannerMediaUrl(video_url));

  useEffect(() => {
    const element = video.current;
    if (!element) return;

    const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const pauseForReducedMotion = () => {
      if (motion.matches) element.pause();
    };
    if (!motion.matches) void element.play().catch(() => {});
    motion.addEventListener('change', pauseForReducedMotion);
    return () => motion.removeEventListener('change', pauseForReducedMotion);
  }, []);

  const toggleVideo = () => {
    const element = video.current;
    if (!element) return;
    if (element.paused) {
      void element.play().catch(() => setFailed(true));
    } else {
      element.pause();
    }
  };

  return (
    <section className="relative isolate flex min-h-[480px] items-center overflow-hidden bg-brand-green-900 text-white sm:min-h-[560px]">
      <img
        src={poster}
        alt=""
        fetchPriority="high"
        className="absolute inset-0 h-full w-full object-cover object-center"
      />
      {showVideo && (
        <video
          ref={video}
          src={video_url ?? undefined}
          poster={poster}
          muted
          loop
          playsInline
          preload="metadata"
          aria-hidden="true"
          onPlay={() => setPlaying(true)}
          onPause={() => setPlaying(false)}
          onError={() => setFailed(true)}
          className="absolute inset-0 h-full w-full object-cover object-center"
        />
      )}
      <div className="absolute inset-0 bg-gradient-to-r from-brand-green-900/95 via-black/60 to-black/20" />
      <div className="relative mx-auto w-full max-w-7xl px-6 py-24 sm:px-10 lg:px-16">
        <h1 className="max-w-2xl text-4xl font-bold leading-tight sm:text-5xl lg:text-6xl">{title}</h1>
        {subtitle && <p className="mt-4 max-w-lg text-lg text-white/90 sm:text-xl">{subtitle}</p>}
        {button_label && (
          <button
            type="button"
            onClick={() => onNavigate(button_page)}
            className="mt-7 inline-flex items-center gap-2 rounded-lg bg-orange-600 px-5 py-3 font-semibold text-white hover:bg-orange-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
          >
            {button_label}
            <ArrowRight size={18} aria-hidden="true" />
          </button>
        )}
      </div>
      {showVideo && (
        <button
          type="button"
          onClick={toggleVideo}
          aria-label={playing ? 'Mettre la vidéo en pause' : 'Lire la vidéo'}
          className="absolute bottom-5 right-5 rounded-full border border-white/60 bg-black/60 p-3 text-white hover:bg-black focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
        >
          {playing ? <Pause size={20} aria-hidden="true" /> : <Play size={20} aria-hidden="true" />}
        </button>
      )}
    </section>
  );
}
