import type { ReactNode } from "react";

const WIDTHS = {
  narrow: "max-w-2xl",
  article: "max-w-3xl",
  default: "max-w-5xl",
  wide: "max-w-6xl",
} as const;

export type PageWidth = keyof typeof WIDTHS;

/**
 * Standard page wrapper.
 *
 * Every route uses this so the distance between the site header and the
 * first piece of content is identical across the site — no per-page
 * padding drift and no stray whitespace where a heading used to be.
 */
export function PageContainer({
  width = "default",
  className,
  children,
}: {
  width?: PageWidth;
  className?: string;
  children: ReactNode;
}) {
  return (
    <div
      className={`mx-auto w-full ${WIDTHS[width]} px-6 py-12 sm:px-8 sm:py-16 ${
        className ?? ""
      }`}
    >
      {children}
    </div>
  );
}

/**
 * Optional page header. Rendering it is what creates the space above the
 * content, so pages without a title (Wiki, Gallery, About) simply omit it
 * and their content starts at the same offset as every other page.
 */
export function PageHeader({
  title,
  description,
  backHref,
  backLabel,
}: {
  title: string;
  description?: string;
  backHref?: string;
  backLabel?: string;
}) {
  return (
    <header className="mb-10 flex flex-col gap-3">
      {backHref && backLabel && (
        <a
          href={backHref}
          className="text-xs tracking-wide text-muted uppercase transition-colors hover:text-foreground"
        >
          ← {backLabel}
        </a>
      )}
      <h1 className="text-3xl font-medium tracking-tight">{title}</h1>
      {description && (
        <p className="max-w-xl text-base leading-relaxed text-muted">
          {description}
        </p>
      )}
    </header>
  );
}
