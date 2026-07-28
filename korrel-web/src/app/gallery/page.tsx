import Image from "next/image";
import { client } from "@/sanity/lib/client";
import { SCANS_QUERY } from "@/sanity/lib/queries";
import { urlFor } from "@/sanity/lib/image";
import type { ScanGallery } from "@/sanity/types";
import { LightboxTrigger } from "@/components/lightbox/LightboxTrigger";

export const metadata = {
  title: "Gallery — Korrel",
};

export const revalidate = 60;

export default async function GalleryPage() {
  const scans = await client.fetch<ScanGallery[]>(SCANS_QUERY);

  return (
    <div className="mx-auto w-full max-w-5xl px-6 py-20 sm:px-8 sm:py-28">
      <h1 className="text-3xl font-medium tracking-tight">Gallery</h1>
      <p className="mt-3 max-w-md text-base text-muted">
        A collection of restored scans.
      </p>

      {scans.length === 0 ? (
        <p className="mt-16 text-sm text-muted">
          No scans have been published yet.
        </p>
      ) : (
        <div className="masonry mt-16">
          {scans.map((scan) => {
            const imgW =
              scan.image?.asset?.metadata?.dimensions?.width ?? 800;
            const imgH =
              scan.image?.asset?.metadata?.dimensions?.height ?? 600;
            const thumbWidth = 800;
            const thumbHeight = Math.round((imgH / imgW) * thumbWidth);

            return (
              <figure key={scan._id} className="masonry-item">
                {scan.image?.asset ? (
                  <LightboxTrigger
                    src={urlFor(scan.image).width(2400).url()}
                    fullSrc={scan.image.asset.url}
                    alt={scan.title}
                    title={scan.title}
                    tags={scan.tags}
                    className="block w-full cursor-zoom-in overflow-hidden bg-[#f2f0ec]"
                  >
                    <Image
                      src={urlFor(scan.image).width(thumbWidth).url()}
                      alt={scan.title}
                      width={thumbWidth}
                      height={thumbHeight}
                      sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                      className="h-auto w-full"
                      placeholder={
                        scan.image.asset.metadata?.lqip ? "blur" : "empty"
                      }
                      blurDataURL={scan.image.asset.metadata?.lqip}
                    />
                  </LightboxTrigger>
                ) : (
                  <div className="aspect-4/3 w-full bg-[#f2f0ec]" />
                )}
              </figure>
            );
          })}
        </div>
      )}
    </div>
  );
}
