import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { client } from "@/sanity/lib/client";
import { urlFor } from "@/sanity/lib/image";
import { WIKI_ARTICLES_BY_CATEGORY_QUERY } from "@/sanity/lib/queries";
import {
  WIKI_CATEGORY_LABELS,
  WIKI_SLUG_TO_CATEGORY,
  type WikiArticleListItem,
} from "@/sanity/types";

export const revalidate = 60;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ categorySlug: string }>;
}) {
  const { categorySlug } = await params;
  const category = WIKI_SLUG_TO_CATEGORY[categorySlug];
  const label = category ? WIKI_CATEGORY_LABELS[category] : undefined;
  return { title: label ? `${label} — Wiki — Korrel` : "Wiki — Korrel" };
}

/**
 * Wiki subpage — lists every published article filed under a single
 * equipment category, with optional thumbnail images.
 */
export default async function WikiCategoryPage({
  params,
}: {
  params: Promise<{ categorySlug: string }>;
}) {
  const { categorySlug } = await params;
  const category = WIKI_SLUG_TO_CATEGORY[categorySlug];

  if (!category) notFound();

  const articles = await client.fetch<WikiArticleListItem[]>(
    WIKI_ARTICLES_BY_CATEGORY_QUERY,
    { category }
  );

  return (
    <div className="mx-auto w-full max-w-5xl px-6 py-20 sm:px-8 sm:py-28">
      <Link
        href="/wiki"
        className="text-xs tracking-wide text-muted uppercase transition-colors hover:text-foreground"
      >
        ← Wiki
      </Link>
      <h1 className="mt-3 text-3xl font-medium tracking-tight">
        {WIKI_CATEGORY_LABELS[category]}
      </h1>

      {articles.length === 0 ? (
        <p className="mt-16 text-sm text-muted">
          No articles have been published in this category yet.
        </p>
      ) : (
        <div className="mt-16 grid grid-cols-1 gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
          {articles.map((article) => (
            <Link
              key={article._id}
              href={`/wiki/${article.slug}`}
              className="group flex flex-col gap-3"
            >
              {/* Thumbnail */}
              {article.thumbnailImage?.asset ? (
                <div className="relative aspect-[4/3] w-full overflow-hidden rounded-md bg-[#f2f0ec]">
                  <Image
                    src={urlFor(article.thumbnailImage)
                      .width(600)
                      .height(450)
                      .url()}
                    alt={article.title}
                    fill
                    sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                    className="object-cover transition-opacity duration-200 group-hover:opacity-90"
                    placeholder={
                      article.thumbnailImage.asset.metadata?.lqip
                        ? "blur"
                        : "empty"
                    }
                    blurDataURL={
                      article.thumbnailImage.asset.metadata?.lqip
                    }
                  />
                </div>
              ) : (
                <div className="aspect-[4/3] w-full rounded-md bg-[#f2f0ec]" />
              )}

              <span className="text-base font-medium leading-snug transition-colors group-hover:text-muted">
                {article.title}
              </span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
