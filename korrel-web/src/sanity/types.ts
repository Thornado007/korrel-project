export interface SanityImageValue {
  asset?: {
    _id: string;
    url: string;
    metadata?: {
      lqip?: string;
      dimensions?: { width: number; height: number };
    };
  };
  hotspot?: { x: number; y: number; height: number; width: number };
  crop?: {
    top: number;
    bottom: number;
    left: number;
    right: number;
  };
}

export interface TaxonomyCategory {
  _id: string;
  title: string;
  slug: string;
}

export interface Tag {
  _id: string;
  title: string;
  slug: string;
  category?: TaxonomyCategory;
}

export interface ScanGallery {
  _id: string;
  title: string;
  image?: SanityImageValue;
  tags?: Tag[];
}

export const WIKI_CATEGORY_LABELS: Record<string, string> = {
  lens: "Lens",
  filmHolder: "Film Holder",
  lightSource: "Light Source",
  copyStand: "Copy Stand",
  inversionSoftware: "Inversion Software",
};

/**
 * URL-friendly slug for each Wiki category value, used to build the
 * `/wiki/category/[slug]` subpages. Kept as a separate map so the URL
 * shape stays stable even if labels are edited later.
 */
export const WIKI_CATEGORY_SLUGS: Record<string, string> = {
  lens: "lens",
  filmHolder: "film-holder",
  lightSource: "light-source",
  copyStand: "copy-stand",
  inversionSoftware: "inversion-software",
};

/** Reverse lookup: URL slug → category value, used by the subpage route. */
export const WIKI_SLUG_TO_CATEGORY: Record<string, string> = Object.fromEntries(
  Object.entries(WIKI_CATEGORY_SLUGS).map(([category, slug]) => [slug, category])
);

/* ------------------------------------------------------------------
   Wiki Category Page — thumbnail & description for the landing page
   ------------------------------------------------------------------ */

export interface WikiCategoryPageData {
  _id: string;
  category: string;
  description?: string;
  thumbnail?: SanityImageValue;
}

/* ------------------------------------------------------------------
   Wiki Articles
   ------------------------------------------------------------------ */

export interface WikiArticleListItem {
  _id: string;
  title: string;
  category: string;
  slug: string;
  thumbnailImage?: SanityImageValue;
}

/** An image embedded inline in a Wiki article's Portable Text body. */
export interface WikiInlineImage extends SanityImageValue {
  _type: "image";
  _key: string;
  alt?: string;
  tags?: Tag[];
}

/** A single image inside an imageComparison block. */
export interface ComparisonImageItem extends SanityImageValue {
  _key: string;
  label?: string;
  tags?: Tag[];
}

/** An image-comparison block inside a Wiki article's Portable Text body. */
export interface ImageComparison {
  _type: "imageComparison";
  _key: string;
  comparisonType: "slider" | "overlay" | "slideshow";
  images: ComparisonImageItem[];
  caption?: string;
}

export interface WikiArticle extends WikiArticleListItem {
  body?: unknown[];
}

/* ------------------------------------------------------------------
   Home Page (singleton)
   ------------------------------------------------------------------ */

export interface HomePageData {
  _id: string;
  slogan?: string;
  heroDescription?: string;
  beforeImage?: SanityImageValue;
  afterImage?: SanityImageValue;
}

/* ------------------------------------------------------------------
   About Page (singleton)
   ------------------------------------------------------------------ */

export interface AboutPageData {
  _id: string;
  title?: string;
  body?: unknown[];
}

/* ------------------------------------------------------------------
   Service Page (singleton)
   ------------------------------------------------------------------ */

export interface ServicePageData {
  _id: string;
  title?: string;
  body?: unknown[];
}

/* ------------------------------------------------------------------
   Scanning Service
   ------------------------------------------------------------------ */

export interface ProcessStep {
  _key: string;
  label: string;
  image?: SanityImageValue;
}

export interface ProcessStepSet {
  _key: string;
  title?: string;
  steps: ProcessStep[];
}

export interface ServiceGalleryImage extends SanityImageValue {
  _key: string;
  alt?: string;
}

export interface ScanningServiceData {
  _id: string;
  title: string;
  exampleScan?: SanityImageValue;
  gallery?: ServiceGalleryImage[];
  maxGalleryImages?: number;
  processSteps?: ProcessStepSet[];
  body?: unknown[];
}

/* ------------------------------------------------------------------
   Gallery Page (singleton)
   ------------------------------------------------------------------ */

export interface GalleryFilterTag {
  _id: string;
  title: string;
  slug: string;
}

export interface GalleryFilterCategory {
  _id: string;
  title: string;
  slug: string;
  tags: GalleryFilterTag[];
}

export interface GalleryPageData {
  _id: string;
  filters?: GalleryFilterCategory[];
}
