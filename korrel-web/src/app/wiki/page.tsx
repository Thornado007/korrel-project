import Image from "next/image";
import Link from "next/link";
import { client } from "@/sanity/lib/client";
import { urlFor } from "@/sanity/lib/image";
import {
  WIKI_ARTICLES_QUERY,
  WIKI_CATEGORY_PAGES_QUERY,
  WIKI_PAGE_QUERY,
} from "@/sanity/lib/queries";
import {
  WIKI_CATEGORY_LABELS,
  WIKI_CATEGORY_SLUGS,
  type WikiArticleListItem,
  type WikiCategoryPageData,
  type WikiPageData,
} from "@/sanity/types";
import { PageContainer } from "@/components/PageContainer";

export const metadata = {
  title: "Wiki — Korrel",
};

export const revalidate = 60;

/** Fallback order used when no Wiki Category documents set an order. */
const CATEGORY_ORDER = [
  "lens",
  "filmHolder",
  "lightSource",
  "copyStand",
  "inversionSoftware",
] as const;

/** Article card used in the "Selected articles" section. */
function ArticleCard({
  article,
  featured = false,
}: {
  article: WikiArticleListItem;
  featured?: boolean;
}) {
  const thumb = article.thumbnailImage;
  const hasThumb = !!thumb?.asset;

  return (
    <Link href={`/wiki/${article.slug}`} className="group flex flex-col gap-3">
      <div
        className={`relative w-full overflow-hidden rounded-md bg-[#f2f0ec] ${
          featured ? "aspect-[16/9]" : "aspect-[4/3]"
        }`}
      >
        {hasThumb && (
          <Image
            src={urlFor(thumb!)
              .width(featured ? 1200 : 600)
              .url()}
            alt={article.title}
            fill
            sizes={
              featured
                ? "(min-width: 1024px) 960px, 100vw"
                : "(min-width: 1024px) 320px, (min-width: 640px) 50vw, 100vw"
            }
            className="object-cover transition-opacity duration-200 group-hover:opacity-90"
            placeholder={thumb!.asset!.metadata?.lqip ? "blur" : "empty"}
            blurDataURL={thumb!.asset!.metadata?.lqip}
          />
        )}
      </div>

      <div className="flex flex-col gap-1.5">
        <span
          className={`font-medium leading-snug transition-colors group-hover:text-muted ${
            featured ? "text-xl" : "text-base"
          }`}
        >
          {article.title}
        </span>
        {article.excerpt && (
          <span className="text-sm leading-relaxed text-muted">
            {article.excerpt}
          </span>
        )}
      </div>
    </Link>
  );
}

export default async function WikiPage() {
  const [articles, categoryPages, pageData] = await Promise.all([
    client.fetch<WikiArticleListItem[]>(WIKI_ARTICLES_QUERY),
    client.fetch<WikiCategoryPageData[]>(WIKI_CATEGORY_PAGES_QUERY),
    client.fetch<WikiPageData | null>(WIKI_PAGE_QUERY),
  ]);

  // Count articles per category, honouring the multi-select field.
  const countByCategory = articles.reduce<Record<string, number>>(
    (acc, article) => {
      for (const category of article.categories ?? []) {
        acc[category] = (acc[category] ?? 0) + 1;
      }
      return acc;
    },
    {}
  );

  const categoryPageMap = new Map(categoryPages.map((cp) => [cp.category, cp]));

  // Categories with their own document keep that order; the remaining ones
  // are appended in the default order so none silently disappear.
  const orderedCategories = [
    ...categoryPages.map((cp) => cp.category),
    ...CATEGORY_ORDER.filter(
      (category) => !categoryPages.some((cp) => cp.category === category)
    ),
  ];

  const selected = (pageData?.selectedArticles ?? []).filter((a) => a?.slug);
  const featureFirst = (pageData?.selectedLayout ?? "feature") === "feature";
  const [first, ...rest] = selected;

  return (
    <PageContainer>
      {/* ---- Selected articles (top of the page) ---- */}
      {selected.length > 0 && (
        <section>
          <h2 className="text-xs font-medium tracking-wide text-muted uppercase">
            {pageData?.selectedTitle || "Selected articles"}
          </h2>

          {featureFirst ? (
            <div className="mt-5 flex flex-col gap-10">
              <ArticleCard article={first} featured />
              {rest.length > 0 && (
                <div className="grid grid-cols-1 gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
                  {rest.map((article) => (
                    <ArticleCard key={article._id} article={article} />
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="mt-5 grid grid-cols-1 gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
              {selected.map((article) => (
                <ArticleCard key={article._id} article={article} />
              ))}
            </div>
          )}
        </section>
      )}

      {/* ---- Category submenus (bottom of the page) ---- */}
      <section className={selected.length > 0 ? "mt-20" : undefined}>
        <h2 className="text-xs font-medium tracking-wide text-muted uppercase">
          {pageData?.categoriesTitle || "Browse by category"}
        </h2>

        <div className="mt-5 flex flex-col gap-4">
          {orderedCategories.map((category) => {
            const cp = categoryPageMap.get(category);
            const count = countByCategory[category] ?? 0;
            const hasThumbnail = !!cp?.thumbnail?.asset;

            return (
              <Link
                key={category}
                href={`/wiki/category/${
                  WIKI_CATEGORY_SLUGS[category] ?? category
                }`}
                className="group flex overflow-hidden rounded-lg border border-border transition-colors hover:border-foreground/20"
              >
                {hasThumbnail && (
                  <div className="relative hidden w-44 shrink-0 bg-[#f2f0ec] sm:block">
                    <Image
                      src={urlFor(cp!.thumbnail!).width(400).height(300).url()}
                      alt={WIKI_CATEGORY_LABELS[category] ?? category}
                      fill
                      sizes="176px"
                      className="object-cover"
                      placeholder={
                        cp!.thumbnail!.asset!.metadata?.lqip ? "blur" : "empty"
                      }
                      blurDataURL={cp!.thumbnail!.asset!.metadata?.lqip}
                    />
                  </div>
                )}

                <div className="flex flex-1 flex-col justify-center gap-1.5 px-5 py-5 sm:px-6 sm:py-6">
                  <span className="text-lg font-medium leading-snug transition-colors group-hover:text-muted">
                    {WIKI_CATEGORY_LABELS[category] ?? category}
                  </span>
                  {cp?.description && (
                    <span className="text-sm leading-relaxed text-muted">
                      {cp.description}
                    </span>
                  )}
                  <span className="mt-1 text-xs text-muted">
                    {count} article{count === 1 ? "" : "s"}
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </section>
    </PageContainer>
  );
}
