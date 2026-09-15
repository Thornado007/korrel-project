import { Suspense } from "react";
import { client } from "@/sanity/lib/client";
import {
  SCANS_QUERY,
  GALLERY_PAGE_QUERY,
  GALLERY_ARTICLE_IMAGES_QUERY,
} from "@/sanity/lib/queries";
import { urlFor } from "@/sanity/lib/image";
import type {
  ScanGallery,
  GalleryPageData,
  GalleryArticleImage,
} from "@/sanity/types";
import {
  GalleryGrid,
  type GalleryItem,
  type GalleryFilter,
} from "@/components/GalleryGrid";
import { PageContainer } from "@/components/PageContainer";

export const metadata = {
  title: "Gallery — Korrel",
};

export const revalidate = 60;

/** Article images published to the Gallery, grouped per source article. */
interface ArticleImageGroup {
  articleTitle?: string;
  articleSlug?: string;
  direct?: GalleryArticleImage[];
  nested?: GalleryArticleImage[];
}

/** Build a GalleryItem from any Sanity image value. */
function toGalleryItem(
  id: string,
  title: string,
  image: { asset?: { url: string; metadata?: { lqip?: string; dimensions?: { width: number; height: number } } } }
): GalleryItem | null {
  if (!image?.asset) return null;

  const imgW = image.asset.metadata?.dimensions?.width ?? 800;
  const imgH = image.asset.metadata?.dimensions?.height ?? 600;
  const thumbWidth = 800;
  const thumbHeight = Math.round((imgH / imgW) * thumbWidth);

  return {
    _id: id,
    title,
    // `image` is a valid Sanity image source here (asset + hotspot/crop).
    thumbSrc: urlFor(image as never).width(thumbWidth).url(),
    thumbWidth,
    thumbHeight,
    previewSrc: urlFor(image as never).width(2400).url(),
    fullSrc: image.asset.url,
    lqip: image.asset.metadata?.lqip,
  };
}

export default async function GalleryPage() {
  const [scans, pageData, articleGroups] = await Promise.all([
    client.fetch<ScanGallery[]>(SCANS_QUERY),
    client.fetch<GalleryPageData | null>(GALLERY_PAGE_QUERY),
    client.fetch<ArticleImageGroup[]>(GALLERY_ARTICLE_IMAGES_QUERY),
  ]);

  // Scan Gallery documents — already ordered by `orderRank` in the query.
  const scanItems: GalleryItem[] = scans.flatMap((scan) => {
    const item = toGalleryItem(scan._id, scan.title, scan.image ?? {});
    return item ? [{ ...item, tags: scan.tags }] : [];
  });

  // Article images flagged with "Also show in the Gallery page". These are
  // appended after the curated scans and keep a link back to their article.
  const articleItems: GalleryItem[] = (articleGroups ?? []).flatMap((group) =>
    [...(group.direct ?? []), ...(group.nested ?? [])].flatMap((img) => {
      const item = toGalleryItem(
        `${group.articleSlug}-${img._key}`,
        img.title || group.articleTitle || "Untitled",
        img
      );
      return item
        ? [
            {
              ...item,
              tags: img.tags,
              sourceHref: group.articleSlug
                ? `/wiki/${group.articleSlug}`
                : undefined,
              sourceLabel: group.articleTitle,
            },
          ]
        : [];
    })
  );

  const items: GalleryItem[] = [...scanItems, ...articleItems];

  // Build filter categories from galleryPage settings
  const filters: GalleryFilter[] =
    pageData?.filters
      ?.filter((f) => f.tags && f.tags.length > 0)
      .map((f) => ({
        _id: f._id,
        title: f.title,
        slug: f.slug,
        tags: f.tags,
      })) ?? [];

  return (
    <PageContainer width="wide">
      {items.length === 0 && filters.length === 0 ? (
        <p className="text-sm text-muted">No scans have been published yet.</p>
      ) : (
        // GalleryGrid reads `?tag=` via useSearchParams, which requires a
        // Suspense boundary so the rest of the page can still be prerendered.
        <Suspense fallback={<div className="min-h-[50vh]" />}>
          <GalleryGrid items={items} filters={filters} />
        </Suspense>
      )}
    </PageContainer>
  );
}
