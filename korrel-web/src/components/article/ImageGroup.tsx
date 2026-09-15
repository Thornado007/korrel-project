import type { ImageGroupBlock } from "@/sanity/types";
import {
  ArticleImageFigure,
  aspectRatioOf,
  toLightboxImage,
} from "./ArticleImageFigure";

/**
 * Column classes per layout. Wide layouts step down on small screens so
 * three-across never becomes three unreadable slivers on a phone.
 */
const LAYOUT_CLASSES: Record<string, string> = {
  stacked: "grid-cols-1",
  two: "grid-cols-2",
  three: "grid-cols-2 sm:grid-cols-3",
  four: "grid-cols-2 sm:grid-cols-4",
};

/** Approximate rendered width per layout, used for CDN sizing. */
const LAYOUT_WIDTHS: Record<string, number> = {
  stacked: 1200,
  two: 700,
  three: 500,
  four: 400,
};

const LAYOUT_SIZES: Record<string, string> = {
  stacked: "(min-width: 768px) 720px, 100vw",
  two: "(min-width: 768px) 360px, 50vw",
  three: "(min-width: 768px) 240px, 50vw",
  four: "(min-width: 768px) 180px, 50vw",
};

/**
 * Renders an "Image Group" block — one to four images per row depending on
 * the layout chosen in the Studio.
 *
 * Every image in the group shares one lightbox gallery, so readers can page
 * through them with prev/next once zoomed in.
 */
export function ImageGroup({ value }: { value: ImageGroupBlock }) {
  const images = (value?.images ?? []).filter((img) => img?.asset);
  if (images.length === 0) return null;

  const layout = value.layout ?? "stacked";
  const columnClass = LAYOUT_CLASSES[layout] ?? LAYOUT_CLASSES.stacked;
  const width = LAYOUT_WIDTHS[layout] ?? 1200;
  const sizes = LAYOUT_SIZES[layout] ?? LAYOUT_SIZES.stacked;

  const cover = value.fit === "cover";
  // With "Equal tiles" every image shares the first image's aspect ratio.
  const sharedAspect = cover ? aspectRatioOf(images[0]) : undefined;

  const lightboxImages = images.map(toLightboxImage);

  return (
    <figure className="my-6">
      <div className={`grid gap-3 sm:gap-4 ${columnClass}`}>
        {images.map((img, index) => (
          <ArticleImageFigure
            key={img._key}
            image={img}
            width={width}
            sizes={sizes}
            cover={cover}
            aspectRatio={sharedAspect}
            galleryImages={lightboxImages}
            galleryIndex={index}
          />
        ))}
      </div>

      {value.caption && (
        <figcaption className="mt-1.5 text-sm leading-snug text-muted">
          {value.caption}
        </figcaption>
      )}
    </figure>
  );
}
