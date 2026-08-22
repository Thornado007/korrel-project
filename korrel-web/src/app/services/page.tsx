import Image from "next/image";
import { PortableText, type PortableTextComponents } from "@portabletext/react";
import { client } from "@/sanity/lib/client";
import {
  SERVICE_PAGE_QUERY,
  SCANNING_SERVICES_QUERY,
} from "@/sanity/lib/queries";
import { urlFor } from "@/sanity/lib/image";
import { BeforeAfterSlider } from "@/components/BeforeAfterSlider";
import type {
  ServicePageData,
  ScanningServiceData,
  SanityImageValue,
} from "@/sanity/types";

export const metadata = {
  title: "Service — Korrel",
};

export const revalidate = 60;

interface InlineImage extends SanityImageValue {
  _type: "image";
  _key: string;
  alt?: string;
}

const serviceBodyComponents: PortableTextComponents = {
  types: {
    image: ({ value }: { value: InlineImage }) => {
      if (!value?.asset) return null;

      const { width = 1200, height = 800 } =
        value.asset.metadata?.dimensions ?? {};
      const displayWidth = 800;
      const displayHeight = Math.round((height / width) * displayWidth);

      return (
        <span className="my-6 block">
          <Image
            src={urlFor(value).width(displayWidth).url()}
            alt={value.alt ?? ""}
            width={displayWidth}
            height={displayHeight}
            className="w-full"
            placeholder={value.asset.metadata?.lqip ? "blur" : "empty"}
            blurDataURL={value.asset.metadata?.lqip}
          />
        </span>
      );
    },
  },
};

export default async function ServicePage() {
  const [pageData, services] = await Promise.all([
    client.fetch<ServicePageData | null>(SERVICE_PAGE_QUERY),
    client.fetch<ScanningServiceData[]>(SCANNING_SERVICES_QUERY),
  ]);

  const title = pageData?.title ?? "Film Digitization Service";

  return (
    <div className="mx-auto w-full max-w-6xl px-6 py-20 sm:px-8 sm:py-28">
      <h1 className="text-3xl font-medium tracking-tight">{title}</h1>

      {/* Optional intro text from the servicePage singleton */}
      {pageData?.body && pageData.body.length > 0 && (
        <div className="prose-korrel mt-6 max-w-xl text-base leading-relaxed text-muted">
          <PortableText
            value={pageData.body as never}
            components={serviceBodyComponents}
          />
        </div>
      )}

      {/* Scanning services — two columns on md+, stacked on mobile */}
      {services.length > 0 && (
        <div className="mt-16 grid grid-cols-1 gap-y-20 md:grid-cols-2 md:gap-x-12 md:gap-y-0">
          {services.map((service) => {
            const hasBefore = !!service.beforeImage?.asset;
            const hasAfter = !!service.afterImage?.asset;
            const hasComparison = hasBefore && hasAfter;

            const beforeSrc = hasBefore
              ? urlFor(service.beforeImage!).width(1200).url()
              : "";
            const afterSrc = hasAfter
              ? urlFor(service.afterImage!).width(1200).url()
              : "";
            const beforeBlur = service.beforeImage?.asset?.metadata?.lqip;
            const afterBlur = service.afterImage?.asset?.metadata?.lqip;

            return (
              <div key={service._id} className="flex flex-col">
                <h2 className="text-lg font-medium tracking-tight">
                  {service.title}
                </h2>

                {/* Before / After comparison slider */}
                {hasComparison && (
                  <div className="mt-6">
                    <BeforeAfterSlider
                      beforeSrc={beforeSrc}
                      afterSrc={afterSrc}
                      beforeBlurDataURL={beforeBlur}
                      afterBlurDataURL={afterBlur}
                      className="rounded-md"
                    />
                  </div>
                )}

                {/* Body content */}
                {service.body && service.body.length > 0 && (
                  <div className="prose-korrel mt-6 text-sm leading-relaxed text-muted">
                    <PortableText
                      value={service.body as never}
                      components={serviceBodyComponents}
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
