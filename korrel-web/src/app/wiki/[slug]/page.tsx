import { notFound } from "next/navigation";
import { PortableText, type PortableTextComponents } from "@portabletext/react";
import { client } from "@/sanity/lib/client";
import { WIKI_ARTICLE_QUERY } from "@/sanity/lib/queries";
import { WIKI_CATEGORY_LABELS, type WikiArticle } from "@/sanity/types";
import { PortableTextImage } from "@/components/PortableTextImage";
import { PortableTextComparison } from "@/components/PortableTextComparison";

export const revalidate = 60;

const components: PortableTextComponents = {
  types: {
    image: ({ value }) => <PortableTextImage value={value} />,
    imageComparison: ({ value }) => <PortableTextComparison value={value} />,
  },
};

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

  return (
    <article className="mx-auto w-full max-w-2xl px-6 py-20 sm:px-8 sm:py-28">
      <span className="text-xs tracking-wide text-muted uppercase">
        {WIKI_CATEGORY_LABELS[article.category] ?? article.category}
      </span>
      <h1 className="mt-3 text-3xl font-medium tracking-tight">
        {article.title}
      </h1>
      <div className="prose-korrel mt-10 text-base leading-relaxed text-foreground">
        {article.body ? (
          <PortableText
            value={article.body as never}
            components={components}
          />
        ) : null}
      </div>
    </article>
  );
}
