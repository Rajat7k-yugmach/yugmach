"use client";

import { useState } from "react";
import Image from "next/image";

type Props = {
  videoId: string;
  title: string;
  className?: string;
};

/** Click-to-load YouTube facade — better INP/LCP than raw iframe. */
export function YouTubeFacade({ videoId, title, className = "" }: Props) {
  const [active, setActive] = useState(false);
  const poster = `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;

  if (active) {
    return (
      <div className={`aspect-video overflow-hidden rounded-xl bg-surface-sunken ${className}`}>
        <iframe
          title={title}
          src={`https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1`}
          className="h-full w-full"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={() => setActive(true)}
      className={`group relative block aspect-video w-full overflow-hidden rounded-xl bg-surface-sunken ${className}`}
      aria-label={`Play video: ${title}`}
    >
      <Image src={poster} alt="" fill className="object-cover opacity-90" unoptimized />
      <span className="absolute inset-0 flex items-center justify-center">
        <span className="flex h-14 w-14 items-center justify-center rounded-full bg-amber text-amber-ink shadow-lg transition-transform group-hover:scale-105">
          ▶
        </span>
      </span>
    </button>
  );
}
