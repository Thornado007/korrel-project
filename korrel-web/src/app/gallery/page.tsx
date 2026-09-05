import { client } from "@/sanity/lib/client";
import { SCANS_QUERY, GALLERY_PAGE_QUERY } from "@/sanity/lib/queries";
import { urlFor } from "@/sanity/lib/image";
import type { ScanGallery, GalleryPageData } from "@/sanity/types";
import {
  GalleryGrid,
  type GalleryItem,
  type GalleryFilter,
} from "@/components/GalleryGrid";

export const metadata = {
  title: "Gallery — Korrel",
};

export const revalidate = 60;

export default async function GalleryPage() {
  const [scans, pageData] = await Promise.all([
    client.fetch<ScanGallery[]>(SCANS_QUERY),
    client.fetch<GalleryPageData | null>(GALLERY_PAGE_QUERY),
  ]);

  const items: GalleryItem[] = scans
    .filter((scan) => scan.image?.asset)
    .map((scan) => {
      const imgW = scan.image!.asset!.metadata?.dimensions?.width ?? 800;
      const imgH = scan.image!.asset!.metadata?.dimensions?.height ?? 600;
      const thumbWidth = 800;
      const thumbHeight = Math.round((imgH / imgW) * thumbWidth);

      return {
        _id: scan._id,
        title: scan.title,
        thumbSrc: urlFor(scan.image!).width(thumbWidth).url(),
        thumbWidth,
        thumbHeight,
        previewSrc: urlFor(scan.image!).width(2400).url(),
        fullSrc: scan.image!.asset!.url,
        lqip: scan.image!.asset!.metadata?.lqip,
        tags: scan.tags,
      };
    });

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
    <div className="mx-auto w-full max-w-6xl px-6 py-20 sm:px-8 sm:py-28">
      {items.length === 0 && filters.length === 0 ? (
        <p className="mt-16 text-sm text-muted">
          No scans have been published yet.
        </p>
      ) : (
        <GalleryGrid items={items} filters={filters} />
      )}
    </div>
  );
}
