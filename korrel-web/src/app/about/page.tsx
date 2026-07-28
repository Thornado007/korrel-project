import { PortableText } from "@portabletext/react";
import { client } from "@/sanity/lib/client";
import { HOME_PAGE_QUERY } from "@/sanity/lib/queries";
import type { HomePageData } from "@/sanity/types";

export const metadata = {
  title: "About — Korrel",
};

export const revalidate = 60;

export default async function AboutPage() {
  const data = await client.fetch<HomePageData | null>(HOME_PAGE_QUERY);

  const title = data?.aboutTitle ?? "About";
  const hasBody = data?.aboutBody && data.aboutBody.length > 0;

  return (
    <div className="mx-auto w-full max-w-2xl px-6 py-20 sm:px-8 sm:py-28">
      <h1 className="text-3xl font-medium tracking-tight">{title}</h1>

      {hasBody ? (
        <div className="prose-korrel mt-8 flex flex-col gap-5 text-base leading-relaxed text-muted">
          <PortableText value={data!.aboutBody as never[]} />
        </div>
      ) : (
        <div className="mt-8 flex flex-col gap-5 text-base leading-relaxed text-muted">
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
    </div>
  );
}
