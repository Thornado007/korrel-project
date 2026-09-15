"use client";

import Image from "next/image";
import { useState } from "react";
import type { YouTubeBlock } from "@/sanity/types";

const YOUTUBE_URL =
  /(?:youtube\.com\/(?:watch\?(?:.*&)?v=|embed\/|shorts\/|live\/)|youtu\.be\/)([A-Za-z0-9_-]{11})/;

/** Extract the 11-character video ID from any supported YouTube URL. */
export function youTubeId(url?: string): string | null {
  if (!url) return null;
  return url.match(YOUTUBE_URL)?.[1] ?? null;
}

/**
 * A YouTube video rendered as a lightweight thumbnail with a play button.
 *
 * The real player (and any YouTube scripts/cookies) is only loaded once
 * the reader actually clicks play, so an article can embed several videos
 * without hurting page load. `youtube-nocookie.com` is used for privacy.
 */
export function YouTubeEmbed({ value }: { value: YouTubeBlock }) {
  const [playing, setPlaying] = useState(false);
  const id = youTubeId(value?.url);
  if (!id) return null;

  const label = value.title || "YouTube video";
  const start = value.startAt && value.startAt > 0 ? value.startAt : undefined;

  const embedSrc =
    `https://www.youtube-nocookie.com/embed/${id}` +
    `?autoplay=1&rel=0&modestbranding=1${start ? `&start=${start}` : ""}`;

  // hqdefault exists for every video; maxresdefault often 404s.
  const thumbSrc = `https://i.ytimg.com/vi/${id}/hqdefault.jpg`;

  return (
    <figure className="my-6">
      {value.title && (
        <p className="mb-1.5 text-sm font-medium text-foreground">
          {value.title}
        </p>
      )}

      <div className="relative w-full overflow-hidden rounded-md bg-black" style={{ aspectRatio: "16 / 9" }}>
        {playing ? (
          <iframe
            src={embedSrc}
            title={label}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            className="absolute inset-0 h-full w-full border-0"
          />
        ) : (
          <button
            type="button"
            onClick={() => setPlaying(true)}
            aria-label={`Play video: ${label}`}
            className="group absolute inset-0 h-full w-full cursor-pointer"
          >
            <Image
              src={thumbSrc}
              alt={label}
              fill
              sizes="(min-width: 768px) 720px, 100vw"
              unoptimized
              className="object-cover opacity-90 transition-opacity group-hover:opacity-100"
            />

            {/* Play badge — YouTube red, large enough to tap on mobile. */}
            <span className="absolute inset-0 flex items-center justify-center">
              <span className="flex h-14 w-20 items-center justify-center rounded-xl bg-black/70 transition-colors group-hover:bg-[#ff0000]">
                <svg
                  width="26"
                  height="26"
                  viewBox="0 0 24 24"
                  fill="white"
                  aria-hidden="true"
                >
                  <path d="M8 5v14l11-7z" />
                </svg>
              </span>
            </span>
          </button>
        )}
      </div>

      {value.caption && (
        <figcaption className="text-sm leading-relaxed text-muted">
          {value.caption}
        </figcaption>
      )}
    </figure>
  );
}
