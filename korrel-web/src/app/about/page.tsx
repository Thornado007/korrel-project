import { PortableText } from "@portabletext/react";
import { client } from "@/sanity/lib/client";
import { ABOUT_PAGE_QUERY } from "@/sanity/lib/queries";
import type { AboutPageData } from "@/sanity/types";
import { PageContainer } from "@/components/PageContainer";

export const metadata = {
  title: "About — Korrel",
};

export const revalidate = 60;

/**
 * About page.
 *
 * The page title is intentionally not rendered — the nav already tells the
 * reader where they are, and omitting it keeps the top of every page
 * consistent. The `title` field is still used for the browser tab.
 */
export default async function AboutPage() {
  const data = await client.fetch<AboutPageData | null>(ABOUT_PAGE_QUERY);

  const hasBody = data?.body && data.body.length > 0;

  return (
    <PageContainer width="narrow">
      {hasBody ? (
        <div className="prose-korrel flex flex-col gap-5 text-base leading-relaxed text-foreground">
          <PortableText value={data!.body as never[]} />
        </div>
      ) : (
        <div className="flex flex-col gap-5 text-base leading-relaxed text-foreground">
          <p>
            Korrel began as a personal project to bring old, damaged photo
            scans back to life — restoring color, removing scratches, and
            preserving the details that time had worn away.
          </p>
          <p>
            What started as a handful of family photographs grew into an
            ongoing archive. Alongside the gallery, we keep a small wiki
            documenting the scanning and restoration techniques we use, for
            anyone doing similar work.
          </p>
          <p>
            Everything here is a work in progress, much like the photographs
            themselves.
          </p>
        </div>
      )}
    </PageContainer>
  );
}
