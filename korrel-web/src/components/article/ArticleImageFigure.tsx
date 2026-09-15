import Image from "next/image";
import { urlFor } from "@/sanity/lib/image";
import type { ArticleImage, ArticleImageWidth } from "@/sanity/types";
import { LightboxTrigger } from "@/components/lightbox/LightboxTrigger";
import type { LightboxImage } from "@/components/lightbox/LightboxProvider";

/**
 * Display widths. Narrow options only kick in from `sm:` upward so images
 * always use the full column on phones, where shrinking them would just
 * make them unreadable.
 */
const WIDTH_CLASSES: Record<ArticleImageWidth, string> = {
  full: "w-full",
  large: "w-full sm:w-4/5",
  medium: "w-full sm:w-3/5",
  small: "w-full sm:w-2/5",
};

/** Fraction of the column each width takes, used to size the CDN request. */
const WIDTH_FACTORS: Record<ArticleImageWidth, number> = {
  full: 1,
  large: 0.8,
  medium: 0.6,
  small: 0.4,
};

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
  /**
   * Honour the image's own `displayWidth` / `maxHeight` settings. Only the
   * standalone image block does this — inside a group or comparison the
   * layout controls sizing instead.
   */
  respectDisplayWidth?: boolean;
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
  respectDisplayWidth = false,
  galleryImages,
  galleryIndex,
  className,
}: ArticleImageFigureProps) {
  if (!image?.asset) return null;

  const alt = image.alt ?? image.label ?? "";
  const lqip = image.asset.metadata?.lqip;
  const hasMeta = !hideMeta && (image.label || image.caption);

  // Editor-chosen width (standalone images only).
  const displayWidth: ArticleImageWidth = respectDisplayWidth
    ? (image.displayWidth ?? "full")
    : "full";
  const widthClass = WIDTH_CLASSES[displayWidth] ?? WIDTH_CLASSES.full;
  const factor = WIDTH_FACTORS[displayWidth] ?? 1;

  // Request a proportionally smaller file when the image renders narrower.
  const requestWidth = Math.round(width * factor);

  const dims = image.asset.metadata?.dimensions;
  const intrinsicWidth = dims?.width ?? 1200;
  const intrinsicHeight = dims?.height ?? 800;
  const renderHeight = Math.round(
    (intrinsicHeight / intrinsicWidth) * requestWidth
  );

  // Optional hard height cap for very tall images.
  const maxHeight = respectDisplayWidth ? image.maxHeight : undefined;

  return (
    <figure className={`flex flex-col ${widthClass} ${className ?? ""}`}>
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
              src={urlFor(image).width(requestWidth).url()}
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
            src={urlFor(image).width(requestWidth).url()}
            alt={alt}
            width={requestWidth}
            height={renderHeight}
            sizes={sizes}
            // `object-contain` + max-height keeps tall images inside the cap
            // without distorting them.
            className={
              maxHeight ? "mx-auto h-auto w-auto object-contain" : "h-auto w-full"
            }
            style={maxHeight ? { maxHeight: `${maxHeight}px` } : undefined}
            placeholder={lqip ? "blur" : "empty"}
            blurDataURL={lqip}
          />
        )}
      </LightboxTrigger>

      {hasMeta && (
        <figcaption className="mt-1.5 text-sm leading-snug text-muted">
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
