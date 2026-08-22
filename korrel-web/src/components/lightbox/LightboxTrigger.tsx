"use client";

import type { ReactNode } from "react";
import {
  useLightbox,
  type LightboxImage,
  type LightboxTag,
} from "./LightboxProvider";

interface LightboxTriggerProps {
  /** Good-quality preview URL shown immediately when the lightbox opens. */
  src: string;
  /** Original-resolution URL — loaded lazily when the user zooms in. */
  fullSrc?: string;
  alt?: string;
  title?: string;
  tags?: LightboxTag[];
  /** When provided together with galleryIndex, enables prev/next in lightbox. */
  galleryImages?: LightboxImage[];
  /** This image's index in the gallery array. */
  galleryIndex?: number;
  className?: string;
  children: ReactNode;
}

/**
 * Wraps any content (usually an <Image>) in a button that opens the
 * lightbox when clicked/tapped.
 *
 * When `galleryImages` + `galleryIndex` are provided the lightbox opens
 * in gallery mode with prev/next navigation.
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
  galleryImages,
  galleryIndex,
  className,
  children,
}: LightboxTriggerProps) {
  const { open, openGallery } = useLightbox();

  return (
    <button
      type="button"
      onClick={() => {
        if (galleryImages && galleryIndex !== undefined) {
          openGallery(galleryImages, galleryIndex);
        } else {
          open({ src, fullSrc, alt, title, tags });
        }
      }}
      className={`touch-manipulation ${className ?? ""}`}
      aria-label={alt ? `View "${alt}" full size` : "View image full size"}
    >
      {children}
    </button>
  );
}
