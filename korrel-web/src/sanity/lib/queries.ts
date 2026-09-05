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

export const WIKI_ARTICLES_QUERY = `*[_type == "wikiArticle" && defined(slug.current)] | order(title asc){
  _id,
  title,
  category,
  "slug": slug.current,
  thumbnailImage{
    ${IMAGE_ASSET_FRAGMENT},
    hotspot,
    crop
  }
}`;

// Same as WIKI_ARTICLES_QUERY but filtered to a single category — powers the
// per-category Wiki subpages (e.g. /wiki/category/lens).
export const WIKI_ARTICLES_BY_CATEGORY_QUERY = `*[_type == "wikiArticle" && defined(slug.current) && category == $category] | order(title asc){
  _id,
  title,
  category,
  "slug": slug.current,
  thumbnailImage{
    ${IMAGE_ASSET_FRAGMENT},
    hotspot,
    crop
  }
}`;

// Fetch all Wiki Category Page documents (thumbnails + descriptions for the
// Wiki landing page).
export const WIKI_CATEGORY_PAGES_QUERY = `*[_type == "wikiCategoryPage"]{
  _id,
  category,
  description,
  thumbnail{
    ${IMAGE_ASSET_FRAGMENT},
    hotspot,
    crop
  }
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

export const WIKI_ARTICLE_QUERY = `*[_type == "wikiArticle" && slug.current == $slug][0]{
  _id,
  title,
  category,
  "slug": slug.current,
  body[]{
    ...,
    _type == "image" => {
      _key,
      _type,
      ${IMAGE_ASSET_FRAGMENT},
      hotspot,
      crop,
      alt,
      tags[]->${TAG_FRAGMENT}
    },
    _type == "imageComparison" => {
      _key,
      _type,
      comparisonType,
      images[]{
        _key,
        ${IMAGE_ASSET_FRAGMENT},
        hotspot,
        crop,
        label,
        tags[]->${TAG_FRAGMENT}
      },
      caption
    }
  }
}`;
