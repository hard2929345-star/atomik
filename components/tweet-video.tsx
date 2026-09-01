"use client";

import { useEffect, useRef, useState } from "react";

function SpeakerOnIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden="true">
      <path d="M10.25 3.75l-4.5 4.5H2v7.5h3.75l4.5 4.5V3.75zM16.5 12c0-1.77-.82-3.35-2.1-4.38l-.9 1.4C14.36 9.7 14.9 10.79 14.9 12s-.54 2.3-1.4 2.98l.9 1.4c1.28-1.03 2.1-2.61 2.1-4.38zm2.5 0c0 2.61-1.23 4.93-3.14 6.42l.9 1.4C19.11 18.04 20.6 15.2 20.6 12S19.11 5.96 16.76 4.18l-.9 1.4C17.77 7.07 19 9.39 19 12z" />
    </svg>
  );
}

function SpeakerOffIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden="true">
      <path d="M10.25 3.75l-4.5 4.5H2v7.5h3.75l4.5 4.5V3.75zM21.19 8.22l-1.41-1.41L17 9.59l-2.78-2.78-1.41 1.41L15.59 11l-2.78 2.78 1.41 1.41L17 12.41l2.78 2.78 1.41-1.41L18.41 11l2.78-2.78z" />
    </svg>
  );
}

function PlayIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden="true">
      <path d="M8 5v14l11-7L8 5z" />
    </svg>
  );
}

export function TweetVideo({
  src,
  poster,
  duration,
  fill,
  compact = false,
}: {
  src: string;
  poster: string;
  duration: string | null;
  fill: boolean;
  compact?: boolean;
}) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [muted, setMuted] = useState(true);
  const [playing, setPlaying] = useState(false);
  // X shows time remaining, counting down as the clip plays.
  const [remaining, setRemaining] = useState<string | null>(duration);

  // Autoplay (muted) while the video is on screen, pause once it scrolls away.
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (!entry) return;

        if (entry.isIntersecting) {
          void video.play().catch(() => {
            // Autoplay can still be refused (e.g. data saver); leave the poster up.
          });
        } else {
          video.pause();
          video.muted = true;
          setMuted(true);
        }
      },
      { threshold: 0.5 },
    );

    observer.observe(video);
    return () => observer.disconnect();
  }, []);

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;

    if (video.paused) {
      void video.play().catch(() => {});
    } else {
      video.pause();
    }
  };

  return (
    <div
      className="group relative h-full"
      onClick={(event) => {
        event.stopPropagation();
        togglePlay();
      }}
      suppressHydrationWarning
    >
      <video
        ref={videoRef}
        className={`w-full bg-black object-cover ${fill ? "h-full" : "max-h-[510px]"}`}
        poster={poster}
        muted={muted}
        loop
        playsInline
        preload={compact ? "none" : "metadata"}
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onTimeUpdate={(event) => {
          const video = event.currentTarget;
          if (!Number.isFinite(video.duration)) return;

          const left = Math.max(0, Math.round(video.duration - video.currentTime));
          const minutes = Math.floor(left / 60);
          setRemaining(`${minutes}:${String(left % 60).padStart(2, "0")}`);
        }}
      >
        <source src={src} type="video/mp4" />
      </video>

      {!playing ? (
        <span className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <span
            className={`flex items-center justify-center rounded-full bg-black/60 ${
              compact ? "h-7 w-7" : "h-14 w-14"
            }`}
          >
            <PlayIcon className={`ml-0.5 text-white ${compact ? "h-4 w-4" : "h-7 w-7"}`} />
          </span>
        </span>
      ) : null}

      {remaining ? (
        <span
          className={`pointer-events-none absolute rounded bg-black/70 font-medium text-white ${
            compact
              ? "bottom-1 left-1 px-1 text-[10px]"
              : "bottom-2 left-2 px-1 py-0.5 text-[13px]"
          }`}
        >
          {remaining}
        </span>
      ) : null}

      <button
        type="button"
        aria-label={muted ? "Unmute video" : "Mute video"}
        onClick={(event) => {
          event.stopPropagation();
          const video = videoRef.current;
          if (!video) return;

          const next = !muted;
          video.muted = next;
          setMuted(next);
          if (!next && video.paused) void video.play().catch(() => {});
        }}
        className={`absolute flex items-center justify-center rounded-full bg-black/70 text-white transition-colors hover:bg-black/90 ${
          compact ? "bottom-1 right-1 h-5 w-5" : "bottom-2 right-2 h-8 w-8"
        }`}
      >
        {muted ? (
          <SpeakerOffIcon className={compact ? "h-3 w-3" : "h-[18px] w-[18px]"} />
        ) : (
          <SpeakerOnIcon className={compact ? "h-3 w-3" : "h-[18px] w-[18px]"} />
        )}
      </button>
    </div>
  );
}
