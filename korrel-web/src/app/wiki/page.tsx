import Image from "next/image";
import Link from "next/link";
import { client } from "@/sanity/lib/client";
import { urlFor } from "@/sanity/lib/image";
import {
  WIKI_ARTICLES_QUERY,
  WIKI_CATEGORY_PAGES_QUERY,
} from "@/sanity/lib/queries";
import {
  WIKI_CATEGORY_LABELS,
  WIKI_CATEGORY_SLUGS,
  type WikiArticleListItem,
  type WikiCategoryPageData,
} from "@/sanity/types";

export const metadata = {
  title: "Wiki — Korrel",
};

export const revalidate = 60;

const CATEGORY_ORDER = [
  "lens",
  "filmHolder",
  "lightSource",
  "copyStand",
  "inversionSoftware",
] as const;

export default async function WikiPage() {
  const [articles, categoryPages] = await Promise.all([
    client.fetch<WikiArticleListItem[]>(WIKI_ARTICLES_QUERY),
    client.fetch<WikiCategoryPageData[]>(WIKI_CATEGORY_PAGES_QUERY),
  ]);

  const countByCategory = articles.reduce<Record<string, number>>((acc, a) => {
    acc[a.category] = (acc[a.category] ?? 0) + 1;
    return acc;
  }, {});

  // Index category-page data by category value for quick lookup.
  const categoryPageMap = new Map(
    categoryPages.map((cp) => [cp.category, cp])
  );

  return (
    <div className="mx-auto w-full max-w-5xl px-6 py-20 sm:px-8 sm:py-28">
      <h1 className="text-3xl font-medium tracking-tight">Wiki</h1>
      <p className="mt-3 max-w-md text-base text-muted">
        Notes on scanning, restoration, and equipment.
      </p>

      {/* Category cards — large, stacked vertically, with optional
          thumbnail images set via the "Wiki Category" documents in Sanity. */}
      <div className="mt-14 flex flex-col gap-4">
        {CATEGORY_ORDER.map((category) => {
          const cp = categoryPageMap.get(category);
          const count = countByCategory[category] ?? 0;
          const hasThumbnail = !!cp?.thumbnail?.asset;

          return (
            <Link
              key={category}
              href={`/wiki/category/${WIKI_CATEGORY_SLUGS[category]}`}
              className="group flex overflow-hidden rounded-lg border border-border transition-colors hover:border-foreground/20"
            >
              {/* Thumbnail */}
              {hasThumbnail && (
                <div className="relative hidden w-44 shrink-0 bg-[#f2f0ec] sm:block">
                  <Image
                    src={urlFor(cp!.thumbnail!).width(400).height(300).url()}
                    alt={WIKI_CATEGORY_LABELS[category]}
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

              {/* Text content */}
              <div className="flex flex-1 flex-col justify-center gap-1.5 px-5 py-5 sm:px-6 sm:py-6">
                <span className="text-lg font-medium leading-snug transition-colors group-hover:text-muted">
                  {WIKI_CATEGORY_LABELS[category]}
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
    </div>
  );
}
