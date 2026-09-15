"use client";

import Image from "next/image";
import { useSearchParams } from "next/navigation";
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
  /** Link back to the article an image came from, when applicable. */
  sourceHref?: string;
  sourceLabel?: string;
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

  // Support deep links such as /gallery?tag=coolscan, used by the
  // "View examples" buttons on the Services page. Tags are matched by slug
  // so the URLs stay readable and survive tag renames.
  const searchParams = useSearchParams();
  const tagParam = searchParams.get("tag");

  // Resolve the `?tag=` slugs to tag IDs. Derived from props/URL, so it is
  // computed during render rather than synced in an effect.
  const initialTagIds = useMemo(() => {
    if (!tagParam || !filters) return new Set<string>();

    const wanted = new Set(
      tagParam
        .split(",")
        .map((slug) => slug.trim().toLowerCase())
        .filter(Boolean)
    );

    return new Set(
      filters
        .flatMap((category) => category.tags)
        .filter((tag) => wanted.has(tag.slug.toLowerCase()))
        .map((tag) => tag._id)
    );
  }, [tagParam, filters]);

  // Seeded once from the URL; afterwards the user's clicks own the state.
  const [selectedTags, setSelectedTags] =
    useState<Set<string>>(initialTagIds);

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
      {/* ---- Filter UI ----
          No top margin: the page container already provides the spacing
          below the header, so the filters sit flush with every other
          page's first element. */}
      {hasFilters && (
        <div className="flex flex-col gap-3">
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
            <div className="flex flex-wrap items-center gap-3">
              <span className="text-xs text-muted">
                Showing {filteredItems.length} of {items.length} images
              </span>
              <button
                type="button"
                onClick={clearFilters}
                className="text-xs text-muted underline underline-offset-2 hover:text-foreground"
              >
                Clear all filters
              </button>
            </div>
          )}
        </div>
      )}

      {/* ---- Masonry grid ---- */}
      {filteredItems.length === 0 ? (
        <p className={`text-sm text-muted ${hasFilters ? "mt-10" : ""}`}>
          {selectedTags.size > 0
            ? "No scans match the selected filters."
            : "No scans have been published yet."}
        </p>
      ) : (
        <div className={`masonry ${hasFilters ? "mt-8" : ""}`}>
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
