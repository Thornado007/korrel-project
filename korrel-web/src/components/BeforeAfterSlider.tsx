"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";

interface BeforeAfterSliderProps {
  beforeSrc: string;
  afterSrc: string;
  beforeAlt?: string;
  afterAlt?: string;
  /** Blur placeholder for the before image, e.g. a Sanity LQIP data URI. */
  beforeBlurDataURL?: string;
  /** Blur placeholder for the after image, e.g. a Sanity LQIP data URI. */
  afterBlurDataURL?: string;
  /** Mark as high priority when the slider is above the fold (e.g. homepage hero). */
  priority?: boolean;
  className?: string;
}

const SIZES = "(min-width: 1024px) 60vw, 100vw";

export function BeforeAfterSlider({
  beforeSrc,
  afterSrc,
  beforeAlt = "Before",
  afterAlt = "After",
  beforeBlurDataURL,
  afterBlurDataURL,
  priority = false,
  className,
}: BeforeAfterSliderProps) {
  const [position, setPosition] = useState(50);
  const [loaded, setLoaded] = useState({ before: false, after: false });
  const containerRef = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);
  const frame = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (frame.current) cancelAnimationFrame(frame.current);
    };
  }, []);

  const updateFromClientX = useCallback((clientX: number) => {
    const el = containerRef.current;
    if (!el) return;

    // Throttle updates to animation frames so dragging stays smooth even
    // while the browser is decoding large, high-resolution images.
    if (frame.current) cancelAnimationFrame(frame.current);
    frame.current = requestAnimationFrame(() => {
      const rect = el.getBoundingClientRect();
      const pct = ((clientX - rect.left) / rect.width) * 100;
      setPosition(Math.min(100, Math.max(0, pct)));
    });
  }, []);

  /* ---- Handle-only pointer events ----
     Only the slider handle initiates dragging. setPointerCapture ensures
     that once dragging starts, the handle tracks the pointer even when it
     moves outside the handle area. The rest of the container allows
     normal touch scrolling. */

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

  const bothLoaded = loaded.before && loaded.after;

  return (
    <div
      ref={containerRef}
      className={`relative aspect-4/3 w-full select-none overflow-hidden bg-[#f2f0ec] sm:aspect-16/10 ${
        className ?? ""
      }`}
    >
      {/* After image (base layer, full size) */}
      <Image
        src={afterSrc}
        alt={afterAlt}
        fill
        sizes={SIZES}
        priority={priority}
        draggable={false}
        placeholder={afterBlurDataURL ? "blur" : "empty"}
        blurDataURL={afterBlurDataURL}
        onLoad={() => setLoaded((s) => ({ ...s, after: true }))}
        className={`object-cover transition-opacity duration-300 ${
          bothLoaded ? "opacity-100" : "opacity-0"
        }`}
      />

      {/* Before image, clipped via clip-path so it stays full-size underneath */}
      <div
        className="absolute inset-0"
        style={{ clipPath: `inset(0 ${100 - position}% 0 0)` }}
      >
        <Image
          src={beforeSrc}
          alt={beforeAlt}
          fill
          sizes={SIZES}
          priority={priority}
          draggable={false}
          placeholder={beforeBlurDataURL ? "blur" : "empty"}
          blurDataURL={beforeBlurDataURL}
          onLoad={() => setLoaded((s) => ({ ...s, before: true }))}
          className={`object-cover transition-opacity duration-300 ${
            bothLoaded ? "opacity-100" : "opacity-0"
          }`}
        />
      </div>

      {/* Interactive handle zone — wider touch target, only this area
          captures drag events so normal scrolling works elsewhere */}
      <div
        className="absolute inset-y-0 z-10 cursor-ew-resize touch-none"
        style={{ left: `calc(${position}% - 22px)`, width: "44px" }}
        onPointerDown={onHandlePointerDown}
        onPointerMove={onHandlePointerMove}
        onPointerUp={onHandlePointerUp}
        onPointerCancel={onHandlePointerUp}
      >
        {/* Visual divider line */}
        <div className="absolute inset-y-0 left-1/2 w-px -translate-x-1/2 bg-white" />
        {/* Circular handle */}
        <div className="absolute top-1/2 left-1/2 flex h-8 w-8 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-black/10 bg-white shadow-sm">
          <span className="text-xs text-black/50">↔</span>
        </div>
      </div>

      {/* Accessible range input, visually hidden but keyboard operable */}
      <input
        type="range"
        min={0}
        max={100}
        value={position}
        onChange={(e) => setPosition(Number(e.target.value))}
        aria-label="Before and after comparison slider"
        className="absolute inset-x-0 bottom-2 mx-auto h-1 w-1/2 opacity-0 focus:opacity-100"
      />
    </div>
  );
}
