"use client";

import type { ReactNode } from "react";
import { useLightbox, type LightboxTag } from "./LightboxProvider";

interface LightboxTriggerProps {
  /** Good-quality preview URL shown immediately when the lightbox opens. */
  src: string;
  /** Original-resolution URL — loaded lazily when the user zooms in. */
  fullSrc?: string;
  alt?: string;
  title?: string;
  tags?: LightboxTag[];
  className?: string;
  children: ReactNode;
}

/**
 * Wraps any content (usually an <Image>) in a button that opens the
 * lightbox when clicked/tapped.
 *
 * `touch-action: manipulation` eliminates the 300 ms tap delay on
 * mobile browsers that still observe it, ensuring the lightbox opens
 * immediately on the first tap.
 */
export function LightboxTrigger({
  src,
  fullSrc,
  alt = "",
  title,
  tags,
  className,
  children,
}: LightboxTriggerProps) {
  const { open } = useLightbox();

  return (
    <button
      type="button"
      onClick={() => open({ src, fullSrc, alt, title, tags })}
      className={`touch-manipulation ${className ?? ""}`}
      aria-label={alt ? `View "${alt}" full size` : "View image full size"}
    >
      {children}
    </button>
  );
}
