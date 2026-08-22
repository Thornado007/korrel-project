"use client";

import Image from "next/image";
import { useMemo } from "react";
import {
  useLightbox,
  type LightboxImage,
  type LightboxTag,
} from "./lightbox/LightboxProvider";

export interface GalleryItem {
  _id: string;
  title: string;
  thumbSrc: string;
  thumbWidth: number;
  thumbHeight: number;
  previewSrc: string;
  fullSrc?: string;
  lqip?: string;
  tags?: LightboxTag[];
}

/**
 * Client-side gallery grid that connects to the LightboxProvider.
 *
 * All items are passed once so the lightbox can navigate between them
 * without duplicating the data across individual triggers.
 */
export function GalleryGrid({ items }: { items: GalleryItem[] }) {
  const { openGallery } = useLightbox();

  const lightboxImages = useMemo<LightboxImage[]>(
    () =>
      items.map((item) => ({
        src: item.previewSrc,
        fullSrc: item.fullSrc,
        alt: item.title,
        title: item.title,
        tags: item.tags,
      })),
    [items]
  );

  return (
    <div className="masonry mt-16">
      {items.map((item, index) => (
        <figure key={item._id} className="masonry-item">
          <button
            type="button"
            onClick={() => openGallery(lightboxImages, index)}
            className="block w-full cursor-zoom-in overflow-hidden bg-[#f2f0ec] touch-manipulation"
            aria-label={`View "${item.title}" full size`}
          >
            <Image
              src={item.thumbSrc}
              alt={item.title}
              width={item.thumbWidth}
              height={item.thumbHeight}
              sizes="(min-width: 640px) 50vw, 100vw"
              className="h-auto w-full"
              placeholder={item.lqip ? "blur" : "empty"}
              blurDataURL={item.lqip}
            />
          </button>
        </figure>
      ))}
    </div>
  );
}
