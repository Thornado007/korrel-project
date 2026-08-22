import { client } from "@/sanity/lib/client";
import { SCANS_QUERY } from "@/sanity/lib/queries";
import { urlFor } from "@/sanity/lib/image";
import type { ScanGallery } from "@/sanity/types";
import { GalleryGrid, type GalleryItem } from "@/components/GalleryGrid";

export const metadata = {
  title: "Gallery — Korrel",
};

export const revalidate = 60;

export default async function GalleryPage() {
  const scans = await client.fetch<ScanGallery[]>(SCANS_QUERY);

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

  return (
    <div className="mx-auto w-full max-w-6xl px-6 py-20 sm:px-8 sm:py-28">
      <h1 className="text-3xl font-medium tracking-tight">Gallery</h1>
      <p className="mt-3 max-w-lg text-base text-muted">
        A selection of high-resolution film scans. Click any image to enlarge
        and open the info view to examine technical specifications.
      </p>

      {items.length === 0 ? (
        <p className="mt-16 text-sm text-muted">
          No scans have been published yet.
        </p>
      ) : (
        <GalleryGrid items={items} />
      )}
    </div>
  );
}
