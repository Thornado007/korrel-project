"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import { urlFor } from "@/sanity/lib/image";
import type { ComparisonImageItem, ImageComparison } from "@/sanity/types";

/* ------------------------------------------------------------------
   Shared helpers
   ------------------------------------------------------------------ */

const DISPLAY_WIDTH = 1200;
const SIZES = "(min-width: 768px) 640px, 100vw";

function imgSrc(img: ComparisonImageItem, width = DISPLAY_WIDTH) {
  return urlFor(img).width(width).url();
}

/* ------------------------------------------------------------------
   Slider — drag/touch to reveal one image over the other
   ------------------------------------------------------------------ */

function ComparisonSlider({
  images,
  caption,
}: {
  images: ComparisonImageItem[];
  caption?: string;
}) {
  const [position, setPosition] = useState(50);
  const containerRef = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);
  const frame = useRef<number | null>(null);

  const imgA = images[0];
  const imgB = images[1];
  if (!imgA?.asset || !imgB?.asset) return null;

  const updateFromClientX = (clientX: number) => {
    const el = containerRef.current;
    if (!el) return;
    if (frame.current) cancelAnimationFrame(frame.current);
    frame.current = requestAnimationFrame(() => {
      const rect = el.getBoundingClientRect();
      const pct = ((clientX - rect.left) / rect.width) * 100;
      setPosition(Math.min(100, Math.max(0, pct)));
    });
  };

  const onPointerDown = (e: React.PointerEvent) => {
    dragging.current = true;
    try {
      (e.currentTarget as Element).setPointerCapture(e.pointerId);
    } catch {
      /* ignore */
    }
    updateFromClientX(e.clientX);
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (!dragging.current) return;
    updateFromClientX(e.clientX);
  };

  const onPointerUp = () => {
    dragging.current = false;
  };

  return (
    <figure className="my-8">
      <div
        ref={containerRef}
        className="relative aspect-[4/3] w-full touch-none select-none overflow-hidden bg-[#f2f0ec]"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerLeave={onPointerUp}
        onPointerCancel={onPointerUp}
      >
        {/* Image B (full, base layer) */}
        <Image
          src={imgSrc(imgB)}
          alt={imgB.label || "Image B"}
          fill
          sizes={SIZES}
          draggable={false}
          className="object-cover"
          placeholder={imgB.asset.metadata?.lqip ? "blur" : "empty"}
          blurDataURL={imgB.asset.metadata?.lqip}
        />

        {/* Image A (clipped) */}
        <div
          className="absolute inset-0"
          style={{ clipPath: `inset(0 ${100 - position}% 0 0)` }}
        >
          <Image
            src={imgSrc(imgA)}
            alt={imgA.label || "Image A"}
            fill
            sizes={SIZES}
            draggable={false}
            className="object-cover"
            placeholder={imgA.asset.metadata?.lqip ? "blur" : "empty"}
            blurDataURL={imgA.asset.metadata?.lqip}
          />
        </div>

        {/* Divider line + handle */}
        <div
          className="absolute inset-y-0 w-px bg-white/80"
          style={{ left: `${position}%` }}
        >
          <div className="absolute top-1/2 left-1/2 flex h-8 w-8 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-black/10 bg-white shadow-sm">
            <svg
              width="14"
              height="14"
              viewBox="0 0 14 14"
              fill="none"
              aria-hidden="true"
            >
              <path
                d="M4.5 3L1 7l3.5 4M9.5 3L13 7l-3.5 4"
                stroke="#666"
                strokeWidth="1.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        </div>

        {/* Accessible range input */}
        <input
          type="range"
          min={0}
          max={100}
          value={position}
          onChange={(e) => setPosition(Number(e.target.value))}
          aria-label="Comparison slider"
          className="absolute inset-x-0 bottom-2 mx-auto h-1 w-1/2 opacity-0 focus:opacity-100"
        />

        {/* Labels */}
        <span className="pointer-events-none absolute top-3 left-3 rounded bg-black/40 px-2 py-0.5 text-xs tracking-wide text-white/90">
          {imgA.label || "A"}
        </span>
        <span className="pointer-events-none absolute top-3 right-3 rounded bg-black/40 px-2 py-0.5 text-xs tracking-wide text-white/90">
          {imgB.label || "B"}
        </span>
      </div>

      {caption && (
        <figcaption className="mt-2 text-center text-sm text-muted">
          {caption}
        </figcaption>
      )}
    </figure>
  );
}

/* ------------------------------------------------------------------
   Overlay — click anywhere on the image to toggle between two images
   ------------------------------------------------------------------ */

function ComparisonOverlay({
  images,
  caption,
}: {
  images: ComparisonImageItem[];
  caption?: string;
}) {
  const [activeIndex, setActiveIndex] = useState(0);

  const imgA = images[0];
  const imgB = images[1];
  if (!imgA?.asset || !imgB?.asset) return null;

  return (
    <figure className="my-8">
      <div
        className="relative aspect-[4/3] w-full cursor-pointer select-none overflow-hidden bg-[#f2f0ec]"
        onClick={() => setActiveIndex((i) => (i === 0 ? 1 : 0))}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            setActiveIndex((i) => (i === 0 ? 1 : 0));
          }
        }}
        aria-label="Click to toggle between images"
      >
        <Image
          src={imgSrc(imgA)}
          alt={imgA.label || "Image A"}
          fill
          sizes={SIZES}
          draggable={false}
          className={`object-cover transition-opacity duration-200 ${
            activeIndex === 0 ? "opacity-100" : "opacity-0"
          }`}
          placeholder={imgA.asset.metadata?.lqip ? "blur" : "empty"}
          blurDataURL={imgA.asset.metadata?.lqip}
        />
        <Image
          src={imgSrc(imgB)}
          alt={imgB.label || "Image B"}
          fill
          sizes={SIZES}
          draggable={false}
          className={`object-cover transition-opacity duration-200 ${
            activeIndex === 1 ? "opacity-100" : "opacity-0"
          }`}
          placeholder={imgB.asset.metadata?.lqip ? "blur" : "empty"}
          blurDataURL={imgB.asset.metadata?.lqip}
        />

        {/* Active label */}
        <span className="pointer-events-none absolute bottom-3 left-3 rounded bg-black/50 px-2.5 py-1 text-xs text-white/90">
          {images[activeIndex].label || `Image ${activeIndex + 1}`}
          <span className="ml-2 text-white/50">click to toggle</span>
        </span>
      </div>

      {caption && (
        <figcaption className="mt-2 text-center text-sm text-muted">
          {caption}
        </figcaption>
      )}
    </figure>
  );
}

/* ------------------------------------------------------------------
   Slideshow — minimal left/right arrows to browse 2+ images
   ------------------------------------------------------------------ */

function ComparisonSlideshow({
  images,
  caption,
}: {
  images: ComparisonImageItem[];
  caption?: string;
}) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const validImages = images.filter((img) => img.asset);
  if (validImages.length === 0) return null;

  const current = validImages[currentIndex];
  const hasPrev = currentIndex > 0;
  const hasNext = currentIndex < validImages.length - 1;

  return (
    <figure className="my-8">
      <div className="relative aspect-[4/3] w-full select-none overflow-hidden bg-[#f2f0ec]">
        <Image
          key={current._key}
          src={imgSrc(current)}
          alt={current.label || `Image ${currentIndex + 1}`}
          fill
          sizes={SIZES}
          draggable={false}
          className="object-cover"
          placeholder={current.asset?.metadata?.lqip ? "blur" : "empty"}
          blurDataURL={current.asset?.metadata?.lqip}
        />

        {/* Left arrow */}
        {hasPrev && (
          <button
            type="button"
            onClick={() => setCurrentIndex((i) => i - 1)}
            aria-label="Previous image"
            className="absolute left-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-black/40 text-white/90 backdrop-blur-sm transition-colors hover:bg-black/60"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              aria-hidden="true"
            >
              <path
                d="M10 3L5 8l5 5"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        )}

        {/* Right arrow */}
        {hasNext && (
          <button
            type="button"
            onClick={() => setCurrentIndex((i) => i + 1)}
            aria-label="Next image"
            className="absolute right-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-black/40 text-white/90 backdrop-blur-sm transition-colors hover:bg-black/60"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              aria-hidden="true"
            >
              <path
                d="M6 3l5 5-5 5"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        )}

        {/* Label + counter */}
        <span className="pointer-events-none absolute bottom-3 left-3 rounded bg-black/50 px-2.5 py-1 text-xs text-white/90">
          {current.label || `${currentIndex + 1} / ${validImages.length}`}
        </span>
        <span className="pointer-events-none absolute bottom-3 right-3 rounded bg-black/50 px-2 py-1 text-xs tabular-nums text-white/60">
          {currentIndex + 1} / {validImages.length}
        </span>
      </div>

      {caption && (
        <figcaption className="mt-2 text-center text-sm text-muted">
          {caption}
        </figcaption>
      )}
    </figure>
  );
}

/* ------------------------------------------------------------------
   Entry point — picks the right mode based on `comparisonType`
   ------------------------------------------------------------------ */

export function PortableTextComparison({
  value,
}: {
  value: ImageComparison;
}) {
  if (!value?.images?.length) return null;

  switch (value.comparisonType) {
    case "slider":
      return (
        <ComparisonSlider images={value.images} caption={value.caption} />
      );
    case "overlay":
      return (
        <ComparisonOverlay images={value.images} caption={value.caption} />
      );
    case "slideshow":
      return (
        <ComparisonSlideshow images={value.images} caption={value.caption} />
      );
    default:
      return null;
  }
}
