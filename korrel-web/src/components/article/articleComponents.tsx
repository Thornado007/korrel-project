import Link from "next/link";
import type { PortableTextComponents } from "@portabletext/react";
import type {
  ArticleImageBlock,
  CalloutBlock,
  ImageComparison,
  ImageGroupBlock,
  YouTubeBlock,
} from "@/sanity/types";
import { ArticleImageFigure } from "./ArticleImageFigure";
import { ImageGroup } from "./ImageGroup";
import { ArticleImageComparison } from "./ImageComparison";
import { YouTubeEmbed } from "./YouTubeEmbed";

const CALLOUT_TONES: Record<string, string> = {
  note: "border-border bg-[#f7f6f3]",
  tip: "border-emerald-200 bg-emerald-50",
  warning: "border-amber-200 bg-amber-50",
};

/**
 * Portable Text renderers for article bodies.
 *
 * Covers every block the Studio's `articleBody` type can produce:
 * single images, image groups, comparisons, callouts, plus the extra
 * text decorators (underline, strike-through, code, highlight) and both
 * link annotation types.
 */
export const articleComponents: PortableTextComponents = {
  types: {
    image: ({ value }: { value: ArticleImageBlock }) => (
      <ArticleImageFigure
        image={value}
        className="my-6"
        width={1200}
        respectDisplayWidth
      />
    ),
    imageGroup: ({ value }: { value: ImageGroupBlock }) => (
      <ImageGroup value={value} />
    ),
    imageComparison: ({ value }: { value: ImageComparison }) => (
      <ArticleImageComparison value={value} />
    ),
    youtube: ({ value }: { value: YouTubeBlock }) => (
      <YouTubeEmbed value={value} />
    ),
    callout: ({ value }: { value: CalloutBlock }) => (
      <aside
        className={`my-5 rounded-lg border p-3.5 sm:p-4 ${
          CALLOUT_TONES[value.tone ?? "note"] ?? CALLOUT_TONES.note
        }`}
      >
        {value.title && (
          <p className="text-sm font-medium text-foreground">{value.title}</p>
        )}
        <p className="mt-1 text-sm leading-relaxed whitespace-pre-line text-muted">
          {value.text}
        </p>
      </aside>
    ),
  },
  marks: {
    underline: ({ children }) => (
      <span className="underline underline-offset-2">{children}</span>
    ),
    "strike-through": ({ children }) => <s>{children}</s>,
    code: ({ children }) => (
      <code className="rounded bg-[#f2f0ec] px-1.5 py-0.5 font-mono text-[0.9em]">
        {children}
      </code>
    ),
    highlight: ({ children }) => (
      <mark className="bg-amber-100 text-foreground">{children}</mark>
    ),
    link: ({ value, children }) => {
      const href = (value as { href?: string } | undefined)?.href;
      const newTab = (value as { newTab?: boolean } | undefined)?.newTab;
      if (!href) return <>{children}</>;
      return (
        <a
          href={href}
          target={newTab === false ? undefined : "_blank"}
          rel={newTab === false ? undefined : "noopener noreferrer"}
        >
          {children}
        </a>
      );
    },
    internalLink: ({ value, children }) => {
      const slug = (value as { slug?: string } | undefined)?.slug;
      if (!slug) return <>{children}</>;
      return <Link href={`/wiki/${slug}`}>{children}</Link>;
    },
  },
  block: {
    h4: ({ children }) => (
      <h4 className="text-base font-medium text-foreground">{children}</h4>
    ),
  },
};
