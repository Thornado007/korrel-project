import type { ArticleSources, SourceItem } from "@/sanity/types";

const KIND_LABELS: Record<string, string> = {
  article: "Article",
  datasheet: "Datasheet",
  video: "Video",
  forum: "Forum",
  book: "Book",
  software: "Software",
  other: "Other",
};

/** Show a bare domain (e.g. "kodak.com") rather than a giant raw URL. */
function hostOf(url?: string) {
  if (!url) return null;
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return null;
  }
}

function SourceEntry({ source }: { source: SourceItem }) {
  const host = hostOf(source.url);
  const kind = source.kind ? KIND_LABELS[source.kind] : null;

  return (
    <li className="leading-snug">
      {source.url ? (
        <a
          href={source.url}
          target="_blank"
          rel="noopener noreferrer"
          className="font-medium text-foreground underline underline-offset-2"
        >
          {source.title}
        </a>
      ) : (
        <span className="font-medium text-foreground">{source.title}</span>
      )}

      {source.author && <span className="text-muted"> — {source.author}</span>}

      {(kind || host) && (
        <span className="text-muted">
          {" "}
          <span className="text-xs">
            ({[kind, host].filter(Boolean).join(", ")})
          </span>
        </span>
      )}

      {source.note && (
        <span className="block text-sm text-muted">{source.note}</span>
      )}
    </li>
  );
}

/**
 * The reference list rendered at the end of an article — general sources
 * and image/figure credits kept as separate lists.
 */
export function ArticleSourceList({ sources }: { sources?: ArticleSources }) {
  const general = sources?.general ?? [];
  const images = sources?.images ?? [];

  if (general.length === 0 && images.length === 0 && !sources?.note) {
    return null;
  }

  return (
    <section className="mt-12 border-t border-border pt-6">
      <h2 className="text-base font-semibold text-foreground">
        {sources?.heading || "Sources"}
      </h2>

      {general.length > 0 && (
        <div className="mt-4">
          {images.length > 0 && (
            <h3 className="text-xs font-medium tracking-wide text-muted uppercase">
              General
            </h3>
          )}
          <ol className="mt-2 flex list-decimal flex-col gap-1.5 pl-5 text-sm">
            {general.map((source) => (
              <SourceEntry key={source._key} source={source} />
            ))}
          </ol>
        </div>
      )}

      {images.length > 0 && (
        <div className="mt-5">
          <h3 className="text-xs font-medium tracking-wide text-muted uppercase">
            Images &amp; figures
          </h3>
          <ol className="mt-2 flex list-decimal flex-col gap-1.5 pl-5 text-sm">
            {images.map((source) => (
              <SourceEntry key={source._key} source={source} />
            ))}
          </ol>
        </div>
      )}

      {sources?.note && (
        <p className="mt-5 text-sm leading-relaxed whitespace-pre-line text-muted">
          {sources.note}
        </p>
      )}
    </section>
  );
}
