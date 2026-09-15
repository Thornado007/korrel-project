"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import { urlFor } from "@/sanity/lib/image";
import type { ComparisonImageItem, ImageComparison } from "@/sanity/types";
import { LightboxTrigger } from "@/components/lightbox/LightboxTrigger";
import type { LightboxImage } from "@/components/lightbox/LightboxProvider";

/* ------------------------------------------------------------------
   Shared helpers
   ------------------------------------------------------------------ */

const DISPLAY_WIDTH = 1400;
const SIZES = "(min-width: 768px) 720px, 100vw";

function imgSrc(img: ComparisonImageItem, width = DISPLAY_WIDTH) {
  return urlFor(img).width(width).url();
}

/** Derive the CSS aspect-ratio from the first image's dimensions. */
function aspectFrom(img: ComparisonImageItem): string {
  const w = img.asset?.metadata?.dimensions?.width;
  const h = img.asset?.metadata?.dimensions?.height;
  if (w && h) return `${w} / ${h}`;
  return "4 / 3";
}

function toLightbox(img: ComparisonImageItem): LightboxImage {
  return {
    src: urlFor(img).width(2400).url(),
    fullSrc: img.asset?.url,
    alt: img.alt ?? img.label ?? "",
    title: img.label ?? img.alt ?? undefined,
    tags: img.includeInComparisons ? img.tags : undefined,
  };
}

function labelFor(img: ComparisonImageItem, index: number) {
  return img.label || img.alt || `Option ${index + 1}`;
}

/** Magnifier icon used by the zoom affordance in each mode. */
function ZoomIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
      <circle cx="8" cy="8" r="5" stroke="currentColor" strokeWidth="1.5" />
      <path
        d="M12 12l4 4M8 6v4M6 8h4"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

const ZOOM_BUTTON_CLASS =
  "absolute right-3 bottom-3 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur-sm transition-colors hover:bg-black/70";

/**
 * Large, always-visible switch buttons rendered *below* the image so they
 * stay easy to hit on mobile and never cover the photo.
 */
function SwitchButtons({
  images,
  activeIndex,
  onSelect,
}: {
  images: ComparisonImageItem[];
  activeIndex: number;
  onSelect: (index: number) => void;
}) {
  return (
    <div
      role="group"
      aria-label="Choose which image to display"
      className="mt-3 flex flex-wrap gap-2"
    >
      {images.map((img, i) => {
        const active = i === activeIndex;
        return (
          <button
            key={img._key}
            type="button"
            onClick={() => onSelect(i)}
            aria-pressed={active}
            className={`min-h-11 flex-1 rounded-md border px-4 py-2.5 text-sm font-medium transition-colors sm:flex-none ${
              active
                ? "border-foreground bg-foreground text-background"
                : "border-border bg-background text-muted hover:border-foreground hover:text-foreground"
            }`}
          >
            <span className="mr-1.5 text-xs tabular-nums opacity-60">
              {i + 1}
            </span>
            {labelFor(img, i)}
          </button>
        );
      })}
    </div>
  );
}

/** The active image's label + caption, shown underneath the frame. */
function ActiveMeta({
  image,
  index,
  total,
  showCounter,
}: {
  image: ComparisonImageItem;
  index: number;
  total: number;
  showCounter?: boolean;
}) {
  return (
    <div className="mt-2 flex flex-col gap-0.5">
      <span className="text-sm font-medium text-foreground">
        {labelFor(image, index)}
        {showCounter && (
          <span className="ml-2 text-xs font-normal tabular-nums text-muted">
            {index + 1} / {total}
          </span>
        )}
      </span>
      {image.caption && (
        <span className="text-sm leading-relaxed text-muted">
          {image.caption}
        </span>
      )}
    </div>
  );
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
    <figure className="my-6">
      <div
        ref={containerRef}
        className="relative w-full select-none overflow-hidden bg-[#f2f0ec]"
        style={{ aspectRatio: aspectFrom(imgA) }}
      >
        {/* Image B (full, base layer) */}
        <Image
          src={imgSrc(imgB)}
          alt={imgB.alt || labelFor(imgB, 1)}
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
            alt={imgA.alt || labelFor(imgA, 0)}
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
          <div className="absolute inset-y-0 left-1/2 w-px -translate-x-1/2 bg-white/80" />
          <div className="absolute top-1/2 left-1/2 flex h-9 w-9 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-black/10 bg-white shadow-sm">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
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
      </div>

      {/* Visible slider control — works with touch, mouse and keyboard. */}
      <label className="mt-3 block">
        <span className="sr-only">Comparison slider position</span>
        <input
          type="range"
          min={0}
          max={100}
          value={Math.round(position)}
          onChange={(e) => setPosition(Number(e.target.value))}
          className="h-11 w-full cursor-ew-resize accent-[var(--foreground)]"
        />
      </label>

      <div className="flex items-baseline justify-between gap-4 text-sm">
        <span className="font-medium text-foreground">← {labelFor(imgA, 0)}</span>
        <span className="font-medium text-foreground">{labelFor(imgB, 1)} →</span>
      </div>

      {caption && (
        <figcaption className="mt-1.5 text-sm leading-snug text-muted">
          {caption}
        </figcaption>
      )}
    </figure>
  );
}

/* ------------------------------------------------------------------
   Overlay — all images stacked; buttons underneath switch between them
   ------------------------------------------------------------------ */

function ComparisonOverlay({
  images,
  caption,
  showLabelsUnderneath = true,
}: {
  images: ComparisonImageItem[];
  caption?: string;
  showLabelsUnderneath?: boolean;
}) {
  const [activeIndex, setActiveIndex] = useState(0);

  const valid = images.filter((img) => img.asset);
  if (valid.length === 0) return null;

  const index = Math.min(activeIndex, valid.length - 1);
  const active = valid[index];
  const lightboxImages = valid.map(toLightbox);

  return (
    <figure className="my-6">
      <div
        className="relative w-full select-none overflow-hidden bg-[#f2f0ec]"
        style={{ aspectRatio: aspectFrom(valid[0]) }}
      >
        {/* All images are rendered on top of each other and only the active
            one is visible, so switching is instant with no reload flicker. */}
        {valid.map((img, i) => (
          <Image
            key={img._key}
            src={imgSrc(img)}
            alt={img.alt || labelFor(img, i)}
            fill
            sizes={SIZES}
            draggable={false}
            className={`object-contain transition-opacity duration-150 ${
              i === index ? "opacity-100" : "opacity-0"
            }`}
            placeholder={img.asset?.metadata?.lqip ? "blur" : "empty"}
            blurDataURL={img.asset?.metadata?.lqip}
          />
        ))}

        {/* Zoom the active image (lightbox keeps prev/next across the set). */}
        <LightboxTrigger
          src={urlFor(active).width(2400).url()}
          fullSrc={active.asset?.url}
          alt={active.alt ?? labelFor(active, index)}
          title={labelFor(active, index)}
          galleryImages={lightboxImages}
          galleryIndex={index}
          className={ZOOM_BUTTON_CLASS}
        >
          <ZoomIcon />
        </LightboxTrigger>
      </div>

      {/* Big, obvious switch buttons under the image (mobile friendly). */}
      <SwitchButtons images={valid} activeIndex={index} onSelect={setActiveIndex} />

      {showLabelsUnderneath && (
        <ActiveMeta image={active} index={index} total={valid.length} />
      )}

      {caption && (
        <figcaption className="mt-1.5 text-sm leading-snug text-muted">
          {caption}
        </figcaption>
      )}
    </figure>
  );
}

/* ------------------------------------------------------------------
   Slideshow — prev/next plus per-image buttons, info shown underneath
   ------------------------------------------------------------------ */

function ComparisonSlideshow({
  images,
  caption,
  showLabelsUnderneath = true,
}: {
  images: ComparisonImageItem[];
  caption?: string;
  showLabelsUnderneath?: boolean;
}) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const valid = images.filter((img) => img.asset);
  if (valid.length === 0) return null;

  const index = Math.min(currentIndex, valid.length - 1);
  const current = valid[index];
  const lightboxImages = valid.map(toLightbox);

  // Wraps around so the arrows never dead-end.
  const go = (delta: number) =>
    setCurrentIndex((i) => {
      const next = i + delta;
      if (next < 0) return valid.length - 1;
      if (next > valid.length - 1) return 0;
      return next;
    });

  return (
    <figure className="my-6">
      <div
        className="relative w-full select-none overflow-hidden bg-[#f2f0ec]"
        style={{ aspectRatio: aspectFrom(valid[0]) }}
      >
        <Image
          key={current._key}
          src={imgSrc(current)}
          alt={current.alt || labelFor(current, index)}
          fill
          sizes={SIZES}
          draggable={false}
          className="object-contain"
          placeholder={current.asset?.metadata?.lqip ? "blur" : "empty"}
          blurDataURL={current.asset?.metadata?.lqip}
        />

        <LightboxTrigger
          src={urlFor(current).width(2400).url()}
          fullSrc={current.asset?.url}
          alt={current.alt ?? labelFor(current, index)}
          title={labelFor(current, index)}
          galleryImages={lightboxImages}
          galleryIndex={index}
          className={ZOOM_BUTTON_CLASS}
        >
          <ZoomIcon />
        </LightboxTrigger>
      </div>

      {/* Prev / counter / next — large touch targets under the image. */}
      <div className="mt-3 flex items-stretch gap-2">
        <button
          type="button"
          onClick={() => go(-1)}
          aria-label="Previous image"
          className="flex min-h-11 w-14 items-center justify-center rounded-md border border-border text-muted transition-colors hover:border-foreground hover:text-foreground"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <path
              d="M10 3L5 8l5 5"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>

        <div className="flex min-h-11 flex-1 items-center justify-center rounded-md border border-border text-sm tabular-nums text-muted">
          {index + 1} / {valid.length}
        </div>

        <button
          type="button"
          onClick={() => go(1)}
          aria-label="Next image"
          className="flex min-h-11 w-14 items-center justify-center rounded-md border border-border text-muted transition-colors hover:border-foreground hover:text-foreground"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <path
              d="M6 3l5 5-5 5"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </div>

      {/* Direct-jump buttons when the set is small enough to list. */}
      {valid.length <= 6 && (
        <SwitchButtons images={valid} activeIndex={index} onSelect={setCurrentIndex} />
      )}

      {showLabelsUnderneath && (
        <ActiveMeta
          image={current}
          index={index}
          total={valid.length}
          showCounter
        />
      )}

      {caption && (
        <figcaption className="mt-1.5 text-sm leading-snug text-muted">
          {caption}
        </figcaption>
      )}
    </figure>
  );
}

/* ------------------------------------------------------------------
   Entry point — picks the right mode based on `comparisonType`
   ------------------------------------------------------------------ */

export function ArticleImageComparison({ value }: { value: ImageComparison }) {
  if (!value?.images?.length) return null;

  switch (value.comparisonType) {
    case "slider":
      return <ComparisonSlider images={value.images} caption={value.caption} />;
    case "slideshow":
      return (
        <ComparisonSlideshow
          images={value.images}
          caption={value.caption}
          showLabelsUnderneath={value.showLabelsUnderneath ?? true}
        />
      );
    case "overlay":
    default:
      return (
        <ComparisonOverlay
          images={value.images}
          caption={value.caption}
          showLabelsUnderneath={value.showLabelsUnderneath ?? true}
        />
      );
  }
}

