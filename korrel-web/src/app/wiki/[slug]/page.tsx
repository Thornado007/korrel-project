import Link from "next/link";
import { notFound } from "next/navigation";
import { PortableText } from "@portabletext/react";
import { client } from "@/sanity/lib/client";
import { WIKI_ARTICLE_QUERY } from "@/sanity/lib/queries";
import {
  WIKI_CATEGORY_LABELS,
  WIKI_CATEGORY_SLUGS,
  type WikiArticle,
} from "@/sanity/types";
import { PageContainer } from "@/components/PageContainer";
import { articleComponents } from "@/components/article/articleComponents";

export const revalidate = 60;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const article = await client.fetch<WikiArticle | null>(WIKI_ARTICLE_QUERY, {
    slug,
  });
  return { title: article ? `${article.title} — Korrel` : "Wiki — Korrel" };
}

export default async function WikiArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const article = await client.fetch<WikiArticle | null>(WIKI_ARTICLE_QUERY, {
    slug,
  });

  if (!article) notFound();

  // Articles can now belong to several categories — or to none at all
  // (a standalone blog post), in which case we link back to the Wiki root.
  const primaryCategory = article.categories?.[0];
  const categorySlug = primaryCategory
    ? WIKI_CATEGORY_SLUGS[primaryCategory]
    : undefined;
  const categoryLabel = primaryCategory
    ? (WIKI_CATEGORY_LABELS[primaryCategory] ?? primaryCategory)
    : "Wiki";

  return (
    <PageContainer width="article">
      <article>
        {/* Back link */}
        <Link
          href={categorySlug ? `/wiki/category/${categorySlug}` : "/wiki"}
          className="inline-flex items-center gap-1 text-xs tracking-wide text-muted uppercase transition-colors hover:text-foreground"
        >
          ← {categoryLabel}
        </Link>

        <h1 className="mt-3 text-3xl font-medium tracking-tight">
          {article.title}
        </h1>

        {article.excerpt && (
          <p className="mt-4 text-base leading-relaxed text-muted">
            {article.excerpt}
          </p>
        )}

        <div className="prose-korrel mt-10 text-base leading-relaxed text-foreground">
          {article.body ? (
            <PortableText
              value={article.body as never}
              components={articleComponents}
            />
          ) : null}
        </div>
      </article>
    </PageContainer>
  );
}
