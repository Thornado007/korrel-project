import Image from "next/image";
import { PortableText, type PortableTextComponents } from "@portabletext/react";
import { client } from "@/sanity/lib/client";
import { SERVICE_PAGE_QUERY } from "@/sanity/lib/queries";
import { urlFor } from "@/sanity/lib/image";
import type { ServicePageData, SanityImageValue } from "@/sanity/types";

export const metadata = {
  title: "Service — Korrel",
};

export const revalidate = 60;

interface InlineImage extends SanityImageValue {
  _type: "image";
  _key: string;
  alt?: string;
}

const components: PortableTextComponents = {
  types: {
    image: ({ value }: { value: InlineImage }) => {
      if (!value?.asset) return null;

      const { width = 1200, height = 800 } =
        value.asset.metadata?.dimensions ?? {};
      const displayWidth = 1000;
      const displayHeight = Math.round((height / width) * displayWidth);

      return (
        <span className="my-8 block">
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
  const data = await client.fetch<ServicePageData | null>(SERVICE_PAGE_QUERY);

  const title = data?.title ?? "Service";

  return (
    <article className="mx-auto w-full max-w-2xl px-6 py-20 sm:px-8 sm:py-28">
      <h1 className="text-3xl font-medium tracking-tight">{title}</h1>

      {data?.body && data.body.length > 0 && (
        <div className="prose-korrel mt-10 text-base leading-relaxed text-foreground">
          <PortableText
            value={data.body as never}
            components={components}
          />
        </div>
      )}
    </article>
  );
}
