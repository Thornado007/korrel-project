"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
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

export interface GalleryFilterTag {
  _id: string;
  title: string;
  slug: string;
}

export interface GalleryFilter {
  _id: string;
  title: string;
  slug: string;
  tags: GalleryFilterTag[];
}

/**
 * Client-side gallery grid that connects to the LightboxProvider.
 *
 * Supports optional taxonomy-based filters — when filter categories are
 * provided, interactive filter buttons appear above the masonry grid.
 * Selecting tags filters items to those matching at least one active tag.
 */
export function GalleryGrid({
  items,
  filters,
}: {
  items: GalleryItem[];
  filters?: GalleryFilter[];
}) {
  const { openGallery } = useLightbox();
  const [selectedTags, setSelectedTags] = useState<Set<string>>(new Set());

  const toggleTag = (tagId: string) => {
    setSelectedTags((prev) => {
      const next = new Set(prev);
      if (next.has(tagId)) next.delete(tagId);
      else next.add(tagId);
      return next;
    });
  };

  const clearFilters = () => setSelectedTags(new Set());

  const filteredItems = useMemo(() => {
    if (selectedTags.size === 0) return items;
    return items.filter((item) =>
      item.tags?.some((tag) => selectedTags.has(tag._id))
    );
  }, [items, selectedTags]);

  const lightboxImages = useMemo<LightboxImage[]>(
    () =>
      filteredItems.map((item) => ({
        src: item.previewSrc,
        fullSrc: item.fullSrc,
        alt: item.title,
        title: item.title,
        tags: item.tags,
      })),
    [filteredItems]
  );

  const hasFilters = filters && filters.length > 0;

  return (
    <>
      {/* ---- Filter UI ---- */}
      {hasFilters && (
        <div className="mt-10 flex flex-col gap-3">
          {filters.map((category) => (
            <div
              key={category._id}
              className="flex flex-wrap items-center gap-2"
            >
              <span className="mr-1 text-sm font-medium text-muted">
                {category.title}
              </span>
              {category.tags.map((tag) => (
                <button
                  key={tag._id}
                  type="button"
                  onClick={() => toggleTag(tag._id)}
                  className={`rounded-full border px-3 py-1 text-xs transition-colors ${
                    selectedTags.has(tag._id)
                      ? "border-foreground bg-foreground text-background"
                      : "border-border text-muted hover:border-foreground hover:text-foreground"
                  }`}
                >
                  {tag.title}
                </button>
              ))}
            </div>
          ))}
          {selectedTags.size > 0 && (
            <button
              type="button"
              onClick={clearFilters}
              className="self-start text-xs text-muted underline underline-offset-2 hover:text-foreground"
            >
              Clear all filters
            </button>
          )}
        </div>
      )}

      {/* ---- Masonry grid ---- */}
      {filteredItems.length === 0 ? (
        <p className="mt-16 text-sm text-muted">
          {selectedTags.size > 0
            ? "No scans match the selected filters."
            : "No scans have been published yet."}
        </p>
      ) : (
        <div className="masonry mt-10">
          {filteredItems.map((item, index) => (
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
      )}
    </>
  );
}
