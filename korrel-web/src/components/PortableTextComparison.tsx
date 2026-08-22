"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import { urlFor } from "@/sanity/lib/image";
import type { ComparisonImageItem, ImageComparison } from "@/sanity/types";

/* ------------------------------------------------------------------
   Shared helpers
   ------------------------------------------------------------------ */

const DISPLAY_WIDTH = 1200;
const SIZES = "(min-width: 768px) 720px, 100vw";

function imgSrc(img: ComparisonImageItem, width = DISPLAY_WIDTH) {
  return urlFor(img).width(width).url();
}

/** Derive the CSS aspect-ratio from the first image's dimensions. */
function aspectFrom(img: ComparisonImageItem): string {
  const w = img.asset?.metadata?.dimensions?.width;
  const h = img.asset?.metadata?.dimensions?.height;
  if (w && h) return `${w} / ${h}`;
  return "4 / 3"; // fallback
}

/* ------------------------------------------------------------------
   Slider — drag the handle to reveal one image over the other
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

  /* Handle-only pointer events — only the slider handle initiates
     dragging so normal touch scrolling works on the image itself. */
  const onHandlePointerDown = (e: React.PointerEvent) => {
    e.preventDefault();
    dragging.current = true;
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {
      /* ignore */
    }
  };

  const onHandlePointerMove = (e: React.PointerEvent) => {
    if (!dragging.current) return;
    updateFromClientX(e.clientX);
  };

  const onHandlePointerUp = () => {
    dragging.current = false;
  };

  return (
    <figure className="my-8">
      <div
        ref={containerRef}
        className="relative w-full select-none overflow-hidden bg-[#f2f0ec]"
        style={{ aspectRatio: aspectFrom(imgA) }}
      >
        {/* Image B (full, base layer) */}
        <Image
          src={imgSrc(imgB)}
          alt={imgB.label || "Image B"}
          fill
          sizes={SIZES}
          draggable={false}
          className="object-contain"
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
            className="object-contain"
            placeholder={imgA.asset.metadata?.lqip ? "blur" : "empty"}
            blurDataURL={imgA.asset.metadata?.lqip}
          />
        </div>

        {/* Interactive handle zone */}
        <div
          className="absolute inset-y-0 z-10 cursor-ew-resize touch-none"
          style={{ left: `calc(${position}% - 22px)`, width: "44px" }}
          onPointerDown={onHandlePointerDown}
          onPointerMove={onHandlePointerMove}
          onPointerUp={onHandlePointerUp}
          onPointerCancel={onHandlePointerUp}
        >
          {/* Visual divider line */}
          <div className="absolute inset-y-0 left-1/2 w-px -translate-x-1/2 bg-white/80" />
          {/* Circular handle */}
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
   Overlay — tab buttons to switch between images (clear which is active)
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
        className="relative w-full cursor-pointer select-none overflow-hidden bg-[#f2f0ec]"
        style={{ aspectRatio: aspectFrom(imgA) }}
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
          className={`object-contain transition-opacity duration-200 ${
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
          className={`object-contain transition-opacity duration-200 ${
            activeIndex === 1 ? "opacity-100" : "opacity-0"
          }`}
          placeholder={imgB.asset.metadata?.lqip ? "blur" : "empty"}
          blurDataURL={imgB.asset.metadata?.lqip}
        />

        {/* Tab-style selector — clearly shows which image is active */}
        <div className="pointer-events-auto absolute top-3 left-3 z-10 flex gap-1">
          {images.map((img, i) => (
            <button
              key={img._key}
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setActiveIndex(i);
              }}
              className={`rounded px-3 py-1.5 text-xs font-medium transition-colors ${
                i === activeIndex
                  ? "bg-white text-black shadow-sm"
                  : "bg-black/40 text-white/70 hover:bg-black/60 hover:text-white/90"
              }`}
            >
              {img.label || `Image ${i + 1}`}
            </button>
          ))}
        </div>

        <span className="pointer-events-none absolute bottom-3 right-3 rounded bg-black/50 px-2 py-1 text-xs text-white/50">
          click to toggle
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
      <div
        className="relative w-full select-none overflow-hidden bg-[#f2f0ec]"
        style={{ aspectRatio: aspectFrom(validImages[0]) }}
      >
        <Image
          key={current._key}
          src={imgSrc(current)}
          alt={current.label || `Image ${currentIndex + 1}`}
          fill
          sizes={SIZES}
          draggable={false}
          className="object-contain"
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

        {/* Active image label — prominent gradient bar at the bottom */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent px-4 pb-3 pt-8">
          <span className="text-sm font-medium text-white">
            {current.label || `Image ${currentIndex + 1}`}
          </span>
          <span className="ml-2 text-xs tabular-nums text-white/50">
            {currentIndex + 1} / {validImages.length}
          </span>
        </div>
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
