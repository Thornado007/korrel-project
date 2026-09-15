// Fragment for resolving a `tag` reference into its title/slug/category, used
// wherever tags are attached to content (Scan Gallery items, inline Wiki
// images) so the frontend can display technical metadata consistently.
const TAG_FRAGMENT = `{
  _id,
  title,
  "slug": slug.current,
  category->{_id, title, "slug": slug.current}
}`;

const IMAGE_ASSET_FRAGMENT = `asset->{_id, url, metadata{lqip, dimensions{width, height}}}`;

export const SCANS_QUERY = `*[_type == "scanGallery"] | order(_createdAt desc){
  _id,
  title,
  image{
    ${IMAGE_ASSET_FRAGMENT},
    hotspot,
    crop
  },
  tags[]->${TAG_FRAGMENT}
}`;

// Shared projection for article listings (Wiki landing page, category pages,
// "Selected articles"). `categories` coalesces the new multi-select field with
// the legacy single `category` field so older articles keep working.
const WIKI_ARTICLE_LIST_FRAGMENT = `{
  _id,
  title,
  "categories": select(
    count(categories) > 0 => categories,
    defined(category) => [category],
    []
  ),
  "slug": slug.current,
  excerpt,
  thumbnailImage{
    ${IMAGE_ASSET_FRAGMENT},
    hotspot,
    crop
  }
}`;

export const WIKI_ARTICLES_QUERY = `*[_type == "wikiArticle" && defined(slug.current)] | order(title asc)${WIKI_ARTICLE_LIST_FRAGMENT}`;

// Same as WIKI_ARTICLES_QUERY but filtered to a single category — powers the
// per-category Wiki subpages (e.g. /wiki/category/lens). Matches both the new
// `categories` array and the legacy `category` string.
export const WIKI_ARTICLES_BY_CATEGORY_QUERY = `*[
  _type == "wikiArticle"
  && defined(slug.current)
  && ($category in categories || category == $category)
] | order(title asc)${WIKI_ARTICLE_LIST_FRAGMENT}`;

// Fetch all Wiki Category Page documents (thumbnails + descriptions for the
// Wiki landing page).
export const WIKI_CATEGORY_PAGES_QUERY = `*[_type == "wikiCategoryPage"] | order(coalesce(orderRank, 0) asc){
  _id,
  category,
  description,
  orderRank,
  thumbnail{
    ${IMAGE_ASSET_FRAGMENT},
    hotspot,
    crop
  }
}`;

// ---- Wiki Page (singleton) — hand-picked "Selected articles" ----

export const WIKI_PAGE_QUERY = `*[_type == "wikiPage"][0]{
  _id,
  selectedTitle,
  selectedLayout,
  categoriesTitle,
  selectedArticles[]->${WIKI_ARTICLE_LIST_FRAGMENT}
}`;

// ---- Home Page (singleton) ----

export const HOME_PAGE_QUERY = `*[_type == "homePage"][0]{
  _id,
  slogan,
  heroDescription,
  beforeImage{
    ${IMAGE_ASSET_FRAGMENT},
    hotspot,
    crop
  },
  afterImage{
    ${IMAGE_ASSET_FRAGMENT},
    hotspot,
    crop
  }
}`;

// ---- About Page (singleton) ----

export const ABOUT_PAGE_QUERY = `*[_type == "aboutPage"][0]{
  _id,
  title,
  body
}`;

// ---- Service Page (singleton) ----

export const SERVICE_PAGE_QUERY = `*[_type == "servicePage"][0]{
  _id,
  title,
  body[]{
    ...,
    _type == "image" => {
      _key,
      _type,
      ${IMAGE_ASSET_FRAGMENT},
      hotspot,
      crop,
      alt
    }
  }
}`;

// ---- Scanning Services ----

export const SCANNING_SERVICES_QUERY = `*[_type == "scanningService"] | order(orderRank asc, _createdAt asc){
  _id,
  title,
  exampleScan{
    ${IMAGE_ASSET_FRAGMENT},
    hotspot,
    crop
  },
  gallery[]{
    _key,
    ${IMAGE_ASSET_FRAGMENT},
    hotspot,
    crop,
    alt
  },
  maxGalleryImages,
  processSteps[]{
    _key,
    title,
    steps[]{
      _key,
      label,
      image{
        ${IMAGE_ASSET_FRAGMENT},
        hotspot,
        crop
      }
    }
  },
  pricingTiers[]{
    _key,
    title,
    image{
      ${IMAGE_ASSET_FRAGMENT},
      hotspot,
      crop
    },
    description,
    priceLines[]{
      _key,
      label,
      price
    },
    note
  },
  body[]{
    ...,
    _type == "image" => {
      _key,
      _type,
      ${IMAGE_ASSET_FRAGMENT},
      hotspot,
      crop,
      alt
    }
  }
}`;

// ---- Gallery Page (singleton) ----

export const GALLERY_PAGE_QUERY = `*[_type == "galleryPage"][0]{
  _id,
  filters[]->{
    _id,
    title,
    "slug": slug.current,
    "tags": *[_type == "tag" && references(^._id)] | order(title asc) {
      _id,
      title,
      "slug": slug.current
    }
  }
}`;

// ---- Wiki Article (single) ----

// Every image in an article body carries the same metadata (label, caption,
// alt, comparison-database flag and taxonomy tags).
const ARTICLE_IMAGE_FRAGMENT = `
  _key,
  ${IMAGE_ASSET_FRAGMENT},
  hotspot,
  crop,
  label,
  caption,
  alt,
  includeInComparisons,
  tags[]->${TAG_FRAGMENT}
`;

export const WIKI_ARTICLE_QUERY = `*[_type == "wikiArticle" && slug.current == $slug][0]{
  _id,
  title,
  "categories": select(
    count(categories) > 0 => categories,
    defined(category) => [category],
    []
  ),
  "slug": slug.current,
  excerpt,
  thumbnailImage{
    ${IMAGE_ASSET_FRAGMENT},
    hotspot,
    crop
  },
  body[]{
    ...,
    _type == "image" => {
      _type,
      ${ARTICLE_IMAGE_FRAGMENT}
    },
    _type == "imageGroup" => {
      _key,
      _type,
      layout,
      fit,
      caption,
      images[]{
        ${ARTICLE_IMAGE_FRAGMENT}
      }
    },
    _type == "imageComparison" => {
      _key,
      _type,
      comparisonType,
      showLabelsUnderneath,
      caption,
      images[]{
        ${ARTICLE_IMAGE_FRAGMENT}
      }
    },
    _type == "block" => {
      ...,
      markDefs[]{
        ...,
        _type == "internalLink" => {
          "slug": @.reference->slug.current,
          "title": @.reference->title
        }
      }
    }
  }
}`;
