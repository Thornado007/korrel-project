import Image from "next/image";
import { urlFor } from "@/sanity/lib/image";
import type { WikiInlineImage } from "@/sanity/types";
import { LightboxTrigger } from "@/components/lightbox/LightboxTrigger";

export function PortableTextImage({ value }: { value: WikiInlineImage }) {
  if (!value?.asset) return null;

  const { width = 1200, height = 800 } = value.asset.metadata?.dimensions ?? {};
  const displayWidth = 1000;
  const displayHeight = Math.round((height / width) * displayWidth);
  const alt = value.alt ?? "";

  return (
    <span className="my-8 block">
      <LightboxTrigger
        src={urlFor(value).width(2400).url()}
        fullSrc={value.asset.url}
        alt={alt}
        title={value.alt}
        tags={value.tags}
        className="block w-full cursor-zoom-in"
      >
        <Image
          src={urlFor(value).width(displayWidth).url()}
          alt={alt}
          width={displayWidth}
          height={displayHeight}
          className="w-full"
          placeholder={value.asset.metadata?.lqip ? "blur" : "empty"}
          blurDataURL={value.asset.metadata?.lqip}
        />
      </LightboxTrigger>
    </span>
  );
}
