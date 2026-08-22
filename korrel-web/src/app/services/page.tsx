import Image from "next/image";
import { PortableText, type PortableTextComponents } from "@portabletext/react";
import { client } from "@/sanity/lib/client";
import {
  SERVICE_PAGE_QUERY,
  SCANNING_SERVICES_QUERY,
} from "@/sanity/lib/queries";
import { urlFor } from "@/sanity/lib/image";
import { LightboxTrigger } from "@/components/lightbox/LightboxTrigger";
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
        <div className="prose-korrel mt-6 max-w-xl text-base leading-relaxed text-foreground">
          <PortableText
            value={pageData.body as never}
            components={serviceBodyComponents}
          />
        </div>
      )}

      {/* Scanning services — two columns on md+, stacked on mobile */}
      {services.length > 0 && (
        <div className="mt-16 grid grid-cols-1 gap-10 md:grid-cols-2">
          {services.map((service) => {
            const scan = service.exampleScan;
            const hasScan = !!scan?.asset;

            const scanW = scan?.asset?.metadata?.dimensions?.width ?? 800;
            const scanH = scan?.asset?.metadata?.dimensions?.height ?? 600;
            const thumbWidth = 800;
            const thumbHeight = Math.round((scanH / scanW) * thumbWidth);

            return (
              <div
                key={service._id}
                className="flex flex-col rounded-lg border border-border"
              >
                {/* Example scan with lightbox */}
                {hasScan && (
                  <LightboxTrigger
                    src={urlFor(scan!).width(2400).url()}
                    fullSrc={scan!.asset!.url}
                    title={service.title}
                  >
                    <Image
                      src={urlFor(scan!).width(thumbWidth).url()}
                      alt={`Example scan — ${service.title}`}
                      width={thumbWidth}
                      height={thumbHeight}
                      className="w-full cursor-zoom-in rounded-t-lg"
                      placeholder={scan!.asset!.metadata?.lqip ? "blur" : "empty"}
                      blurDataURL={scan!.asset!.metadata?.lqip}
                    />
                  </LightboxTrigger>
                )}

                {/* Text content */}
                <div className="flex flex-1 flex-col p-6 sm:p-8">
                  <h2 className="text-lg font-medium tracking-tight">
                    {service.title}
                  </h2>

                  {service.body && service.body.length > 0 && (
                    <div className="prose-korrel mt-4 text-sm leading-relaxed text-foreground">
                      <PortableText
                        value={service.body as never}
                        components={serviceBodyComponents}
                      />
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
