import { PortableText } from "@portabletext/react";
import { BeforeAfterSlider } from "@/components/BeforeAfterSlider";
import { client } from "@/sanity/lib/client";
import { HOME_PAGE_QUERY } from "@/sanity/lib/queries";
import { urlFor } from "@/sanity/lib/image";
import type { HomePageData } from "@/sanity/types";

export const revalidate = 60;

export default async function Home() {
  const data = await client.fetch<HomePageData | null>(HOME_PAGE_QUERY);

  const slogan = data?.slogan ?? "Everything Film Scanning";
  const description =
    data?.heroDescription ??
    "Korrel is a small archive of restored photographs and the techniques behind them — a gallery, a growing wiki, and the people doing the work.";

  const beforeSrc = data?.beforeImage?.asset
    ? urlFor(data.beforeImage).width(1600).url()
    : "/placeholder-before.svg";
  const afterSrc = data?.afterImage?.asset
    ? urlFor(data.afterImage).width(1600).url()
    : "/placeholder-after.svg";

  const beforeBlur = data?.beforeImage?.asset?.metadata?.lqip;
  const afterBlur = data?.afterImage?.asset?.metadata?.lqip;

  return (
    <div className="flex flex-1 flex-col">
      {/* Hero section — slider centered and prominent */}
      <section className="mx-auto flex w-full max-w-6xl flex-col items-center gap-10 px-6 py-20 sm:px-8 sm:py-28">
        <div className="flex max-w-xl flex-col items-center gap-6 text-center">
          <h1 className="text-4xl font-medium leading-tight tracking-tight sm:text-5xl">
            {slogan}
          </h1>
          <p className="text-base leading-relaxed text-muted">{description}</p>
        </div>

        {/* Full-width slider */}
        <div className="w-full max-w-4xl">
          <BeforeAfterSlider
            beforeSrc={beforeSrc}
            afterSrc={afterSrc}
            beforeBlurDataURL={beforeBlur}
            afterBlurDataURL={afterBlur}
            priority
          />
        </div>
      </section>

      {/* About section — editable from Sanity */}
      {data?.aboutBody && (
        <section className="border-t border-border">
          <div className="mx-auto w-full max-w-2xl px-6 py-20 sm:px-8 sm:py-28">
            <h2 className="text-3xl font-medium tracking-tight">
              {data.aboutTitle ?? "About"}
            </h2>
            <div className="prose-korrel mt-8 flex flex-col gap-5 text-base leading-relaxed text-muted">
              <PortableText value={data.aboutBody as never[]} />
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
