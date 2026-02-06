import Hls from 'hls.js';
import { useEffect, useRef } from 'react';
import { usePlayerStore } from '@/store/player-store';

type Props = {
  src: string;
  poster?: string;
  autoPlay?: boolean;
  playbackKey?: string;
};

export function HlsPlayer({ src, poster, autoPlay, playbackKey }: Props) {
  const ref = useRef<HTMLVideoElement | null>(null);
  const { muted, volume } = usePlayerStore();

  useEffect(() => {
    const video = ref.current;
    if (!video) return;

    let hls: Hls | null = null;
    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = src;
    } else if (Hls.isSupported()) {
      hls = new Hls();
      hls.loadSource(src);
      hls.attachMedia(video);
    }

    if (playbackKey) {
      const saved = localStorage.getItem(`progress:${playbackKey}`);
      if (saved) video.currentTime = Number(saved);
      const save = () => localStorage.setItem(`progress:${playbackKey}`, String(video.currentTime));
      video.addEventListener('timeupdate', save);
      return () => {
        video.removeEventListener('timeupdate', save);
        hls?.destroy();
      };
    }

    return () => hls?.destroy();
  }, [src, playbackKey]);

  useEffect(() => {
    const video = ref.current;
    if (!video) return;
    video.muted = muted;
    video.volume = volume;
  }, [muted, volume]);

  return <video ref={ref} controls autoPlay={autoPlay} poster={poster} className="w-full rounded-xl bg-black" />;
}
