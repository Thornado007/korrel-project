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
   Wiki Page (singleton) — "Selected articles" + category list
   ------------------------------------------------------------------ */

export interface WikiPageData {
  _id: string;
  selectedTitle?: string;
  selectedArticles?: WikiArticleListItem[];
  selectedLayout?: "feature" | "grid";
  categoriesTitle?: string;
}

/* ------------------------------------------------------------------
   Wiki Articles
   ------------------------------------------------------------------ */

export interface WikiArticleListItem {
  _id: string;
  title: string;
  /**
   * Resolved category list. The query coalesces the new multi-select
   * `categories` field with the legacy single `category` field, so
   * previously published articles keep working.
   */
  categories?: string[];
  slug: string;
  excerpt?: string;
  thumbnailImage?: SanityImageValue;
}

/**
 * Shared metadata attached to every image inside an article body —
 * matches `articleImageFields` in the Studio schema.
 */
export interface ArticleImage extends SanityImageValue {
  _key: string;
  label?: string;
  caption?: string;
  alt?: string;
  /** Whether this image belongs to the cross-article comparison database. */
  includeInComparisons?: boolean;
  tags?: Tag[];
}

/** A single full-width image block in an article body. */
export interface ArticleImageBlock extends ArticleImage {
  _type: "image";
}

/** Several images shown together with a chosen layout. */
export interface ImageGroupBlock {
  _type: "imageGroup";
  _key: string;
  layout?: "stacked" | "two" | "three" | "four";
  fit?: "contain" | "cover";
  images?: ArticleImage[];
  caption?: string;
}

/**
 * Backwards-compatible alias — comparison images use the same metadata
 * shape as every other article image.
 */
export type ComparisonImageItem = ArticleImage;

/** An image-comparison block inside an article body. */
export interface ImageComparison {
  _type: "imageComparison";
  _key: string;
  comparisonType: "slider" | "overlay" | "slideshow";
  images: ComparisonImageItem[];
  showLabelsUnderneath?: boolean;
  caption?: string;
}

/** A highlighted note box inside an article body. */
export interface CalloutBlock {
  _type: "callout";
  _key: string;
  tone?: "note" | "tip" | "warning";
  title?: string;
  text: string;
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

export interface PriceLine {
  _key: string;
  label: string;
  price: string;
}

export interface PricingTier {
  _key: string;
  title: string;
  image?: SanityImageValue;
  description?: string;
  priceLines?: PriceLine[];
  note?: string;
}

export interface ScanningServiceData {
  _id: string;
  title: string;
  exampleScan?: SanityImageValue;
  gallery?: ServiceGalleryImage[];
  maxGalleryImages?: number;
  processSteps?: ProcessStepSet[];
  pricingTiers?: PricingTier[];
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
