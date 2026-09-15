import Image from "next/image";
import { urlFor } from "@/sanity/lib/image";
import type { ArticleImage } from "@/sanity/types";
import { LightboxTrigger } from "@/components/lightbox/LightboxTrigger";
import type { LightboxImage } from "@/components/lightbox/LightboxProvider";

/** Build the lightbox payload for an article image. */
export function toLightboxImage(img: ArticleImage): LightboxImage {
  return {
    src: urlFor(img).width(2400).url(),
    fullSrc: img.asset?.url,
    alt: img.alt ?? img.label ?? "",
    title: img.label ?? img.alt ?? undefined,
    // Only images that are part of the comparison database carry
    // taxonomy metadata worth showing in the lightbox info panel.
    tags: img.includeInComparisons ? img.tags : undefined,
  };
}

/** Aspect ratio derived from the asset metadata, with a sane fallback. */
export function aspectRatioOf(img?: ArticleImage, fallback = "4 / 3") {
  const w = img?.asset?.metadata?.dimensions?.width;
  const h = img?.asset?.metadata?.dimensions?.height;
  return w && h ? `${w} / ${h}` : fallback;
}

interface ArticleImageFigureProps {
  image: ArticleImage;
  /** Requested render width in px — drives the CDN transform and `sizes`. */
  width?: number;
  sizes?: string;
  /** Crop to a shared aspect ratio instead of showing the whole image. */
  cover?: boolean;
  /** Aspect ratio to use when `cover` is on. */
  aspectRatio?: string;
  /** Hide the per-image label/caption (e.g. when a group caption is used). */
  hideMeta?: boolean;
  /** Enables prev/next inside the lightbox. */
  galleryImages?: LightboxImage[];
  galleryIndex?: number;
  className?: string;
}

/**
 * A single article image: click-to-zoom, with its label and caption shown
 * underneath so metadata never covers the photo itself.
 */
export function ArticleImageFigure({
  image,
  width = 1200,
  sizes = "(min-width: 768px) 720px, 100vw",
  cover = false,
  aspectRatio,
  hideMeta = false,
  galleryImages,
  galleryIndex,
  className,
}: ArticleImageFigureProps) {
  if (!image?.asset) return null;

  const alt = image.alt ?? image.label ?? "";
  const lqip = image.asset.metadata?.lqip;
  const hasMeta = !hideMeta && (image.label || image.caption);

  const dims = image.asset.metadata?.dimensions;
  const intrinsicWidth = dims?.width ?? 1200;
  const intrinsicHeight = dims?.height ?? 800;
  const renderHeight = Math.round((intrinsicHeight / intrinsicWidth) * width);

  return (
    <figure className={`flex flex-col gap-2 ${className ?? ""}`}>
      <LightboxTrigger
        src={urlFor(image).width(2400).url()}
        fullSrc={image.asset.url}
        alt={alt}
        title={image.label ?? image.alt}
        tags={image.includeInComparisons ? image.tags : undefined}
        galleryImages={galleryImages}
        galleryIndex={galleryIndex}
        className="block w-full cursor-zoom-in overflow-hidden bg-[#f2f0ec]"
      >
        {cover ? (
          <span
            className="relative block w-full"
            style={{ aspectRatio: aspectRatio ?? "4 / 3" }}
          >
            <Image
              src={urlFor(image).width(width).url()}
              alt={alt}
              fill
              sizes={sizes}
              className="object-cover"
              placeholder={lqip ? "blur" : "empty"}
              blurDataURL={lqip}
            />
          </span>
        ) : (
          <Image
            src={urlFor(image).width(width).url()}
            alt={alt}
            width={width}
            height={renderHeight}
            sizes={sizes}
            className="h-auto w-full"
            placeholder={lqip ? "blur" : "empty"}
            blurDataURL={lqip}
          />
        )}
      </LightboxTrigger>

      {hasMeta && (
        <figcaption className="text-sm leading-relaxed text-muted">
          {image.label && (
            <span className="font-medium text-foreground">{image.label}</span>
          )}
          {image.label && image.caption ? " — " : null}
          {image.caption}
        </figcaption>
      )}
    </figure>
  );
}
