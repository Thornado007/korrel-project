import Image from "next/image";
import { PortableText, type PortableTextComponents } from "@portabletext/react";
import { client } from "@/sanity/lib/client";
import {
  SERVICE_PAGE_QUERY,
  SCANNING_SERVICES_QUERY,
} from "@/sanity/lib/queries";
import { urlFor } from "@/sanity/lib/image";
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

      {/* Intro from legacy servicePage body — shown above services */}
      {pageData?.body && pageData.body.length > 0 && (
        <div className="prose-korrel mt-8 max-w-2xl text-base leading-relaxed text-foreground">
          <PortableText
            value={pageData.body as never}
            components={serviceBodyComponents}
          />
        </div>
      )}

      {/* Individual scanning services — 2 columns on desktop */}
      {services.length > 0 && (
        <div className="mt-14 grid grid-cols-1 gap-10 md:grid-cols-2">
          {services.map((service) => (
            <div
              key={service._id}
              className="flex flex-col rounded-lg border border-border p-6 sm:p-8"
            >
              <h2 className="text-xl font-medium tracking-tight">
                {service.title}
              </h2>
              {service.body && service.body.length > 0 && (
                <div className="prose-korrel mt-6 text-sm leading-relaxed text-foreground">
                  <PortableText
                    value={service.body as never}
                    components={serviceBodyComponents}
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
