import Image from "next/image";
import Link from "next/link";
import {
  PortableText,
  type PortableTextComponents,
} from "@portabletext/react";
import { client } from "@/sanity/lib/client";
import {
  SERVICE_PAGE_QUERY,
  SCANNING_SERVICES_QUERY,
} from "@/sanity/lib/queries";
import { urlFor } from "@/sanity/lib/image";
import { LightboxTrigger } from "@/components/lightbox/LightboxTrigger";
import type { LightboxImage } from "@/components/lightbox/LightboxProvider";
import type {
  ServicePageData,
  ScanningServiceData,
  SanityImageValue,
} from "@/sanity/types";
import { PageContainer } from "@/components/PageContainer";

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

  return (
    <PageContainer width="wide">
      {/* Intro text from the servicePage singleton */}
      {pageData?.body && pageData.body.length > 0 && (
        <div className="overflow-hidden rounded-lg border border-border p-6 sm:p-8">
          <div className="prose-korrel text-base leading-relaxed text-foreground">
            <PortableText
              value={pageData.body as never}
              components={serviceBodyComponents}
            />
          </div>
        </div>
      )}

      {/* Scanning services — full-width, stacked vertically */}
      {services.length > 0 && (
        <div className="mt-10 flex flex-col gap-16">
          {services.map((service) => {
            const scan = service.exampleScan;
            const hasScan = !!scan?.asset;

            const scanW = scan?.asset?.metadata?.dimensions?.width ?? 800;
            const scanH = scan?.asset?.metadata?.dimensions?.height ?? 600;
            const thumbWidth = 1200;
            const thumbHeight = Math.round((scanH / scanW) * thumbWidth);

            // Build gallery images for lightbox
            const galleryImages = service.gallery?.filter((g) => g.asset) ?? [];
            const maxShow = service.maxGalleryImages ?? galleryImages.length;
            const displayGallery = galleryImages.slice(0, maxShow);

            const galleryLightboxImages: LightboxImage[] = displayGallery.map(
              (img) => ({
                src: urlFor(img).width(2400).url(),
                fullSrc: img.asset!.url,
                alt: img.alt ?? service.title,
                title: img.alt ?? service.title,
              })
            );

            return (
              <div
                key={service._id}
                className="overflow-hidden rounded-lg border border-border"
              >
                {/* Example scan hero image */}
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
                      className="w-full cursor-zoom-in"
                      placeholder={
                        scan!.asset!.metadata?.lqip ? "blur" : "empty"
                      }
                      blurDataURL={scan!.asset!.metadata?.lqip}
                    />
                  </LightboxTrigger>
                )}

                {/* Content area */}
                <div className="p-6 sm:p-8">
                  <h2 className="text-xl font-medium tracking-tight">
                    {service.title}
                  </h2>

                  {/* Body text */}
                  {service.body && service.body.length > 0 && (
                    <div className="prose-korrel mt-4 text-sm leading-relaxed text-foreground">
                      <PortableText
                        value={service.body as never}
                        components={serviceBodyComponents}
                      />
                    </div>
                  )}

                  {/* "View examples" — jumps to the Gallery with this
                      service's tag filter already switched on. */}
                  {service.galleryFilterTag?.slug && (
                    <Link
                      href={`/gallery?tag=${encodeURIComponent(
                        service.galleryFilterTag.slug
                      )}`}
                      className="mt-5 inline-flex min-h-11 items-center gap-2 rounded-md border border-foreground bg-foreground px-5 py-2.5 text-sm font-medium text-background transition-opacity hover:opacity-85"
                    >
                      {service.galleryButtonLabel || "View examples"}
                      <svg
                        width="14"
                        height="14"
                        viewBox="0 0 16 16"
                        fill="none"
                        aria-hidden="true"
                      >
                        <path
                          d="M6 3l5 5-5 5"
                          stroke="currentColor"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </Link>
                  )}

                  {/* Pricing Tiers */}
                  {service.pricingTiers && service.pricingTiers.length > 0 && (
                    <div className="mt-8">
                      <div
                        className={`grid gap-4 ${
                          service.pricingTiers.length === 1
                            ? "grid-cols-1"
                            : service.pricingTiers.length === 2
                              ? "grid-cols-1 sm:grid-cols-2"
                              : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
                        }`}
                      >
                        {service.pricingTiers.map((tier) => {
                          const hasTierImage = !!tier.image?.asset;
                          const tierImgW =
                            tier.image?.asset?.metadata?.dimensions?.width ??
                            800;
                          const tierImgH =
                            tier.image?.asset?.metadata?.dimensions?.height ??
                            600;
                          const tierThumbW = 600;
                          const tierThumbH = Math.round(
                            (tierImgH / tierImgW) * tierThumbW
                          );

                          return (
                            <div
                              key={tier._key}
                              className="flex flex-col overflow-hidden rounded-lg border border-border bg-[#fafaf9]"
                            >
                              {hasTierImage && (
                                <LightboxTrigger
                                  src={urlFor(tier.image!).width(2400).url()}
                                  fullSrc={tier.image!.asset!.url}
                                  title={tier.title}
                                >
                                  <Image
                                    src={urlFor(tier.image!)
                                      .width(tierThumbW)
                                      .url()}
                                    alt={tier.title}
                                    width={tierThumbW}
                                    height={tierThumbH}
                                    className="w-full cursor-zoom-in"
                                    placeholder={
                                      tier.image!.asset!.metadata?.lqip
                                        ? "blur"
                                        : "empty"
                                    }
                                    blurDataURL={
                                      tier.image!.asset!.metadata?.lqip
                                    }
                                  />
                                </LightboxTrigger>
                              )}
                              <div className="flex flex-1 flex-col p-5 sm:p-6">
                                <h3 className="text-sm font-semibold tracking-tight">
                                  {tier.title}
                                </h3>

                                {tier.description && (
                                  <p className="mt-2 text-xs leading-relaxed text-muted">
                                    {tier.description}
                                  </p>
                                )}

                                {tier.priceLines &&
                                  tier.priceLines.length > 0 && (
                                    <dl className="mt-4 flex flex-col gap-1.5 border-t border-border pt-4">
                                      {tier.priceLines.map((line) => (
                                        <div
                                          key={line._key}
                                          className="flex items-baseline justify-between gap-3 text-xs"
                                        >
                                          <dt className="text-foreground">
                                            {line.label}
                                          </dt>
                                          <dd className="shrink-0 font-medium tabular-nums text-foreground">
                                            {line.price}
                                          </dd>
                                        </div>
                                      ))}
                                    </dl>
                                  )}

                                {tier.note && (
                                  <p className="mt-4 border-t border-border pt-3 text-xs italic text-muted">
                                    {tier.note}
                                  </p>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Process Steps — side-by-side comparison images */}
                  {service.processSteps && service.processSteps.length > 0 && (
                    <div className="mt-8 flex flex-col gap-8">
                      {service.processSteps.map((stepSet) => {
                        const validSteps =
                          stepSet.steps?.filter((s) => s.image?.asset) ?? [];
                        if (validSteps.length === 0) return null;

                        // Build lightbox gallery for this step set
                        const stepLightboxImages: LightboxImage[] =
                          validSteps.map((step) => ({
                            src: urlFor(step.image!).width(2400).url(),
                            fullSrc: step.image!.asset!.url,
                            alt: step.label || "",
                            title: step.label,
                          }));

                        return (
                          <div key={stepSet._key}>
                            {stepSet.title && (
                              <h3 className="mb-3 text-sm font-medium text-muted">
                                {stepSet.title}
                              </h3>
                            )}
                            <div
                              className="grid gap-2 sm:gap-4"
                              style={{
                                gridTemplateColumns: `repeat(${validSteps.length}, 1fr)`,
                              }}
                            >
                              {validSteps.map((step, i) => {
                                const stepW =
                                  step.image!.asset!.metadata?.dimensions
                                    ?.width ?? 800;
                                const stepH =
                                  step.image!.asset!.metadata?.dimensions
                                    ?.height ?? 600;
                                const stepThumbW = 600;
                                const stepThumbH = Math.round(
                                  (stepH / stepW) * stepThumbW
                                );

                                return (
                                  <div
                                    key={step._key}
                                    className="flex flex-col gap-2"
                                  >
                                    <LightboxTrigger
                                      src={urlFor(step.image!)
                                        .width(2400)
                                        .url()}
                                      fullSrc={step.image!.asset!.url}
                                      alt={step.label}
                                      title={step.label}
                                      galleryImages={stepLightboxImages}
                                      galleryIndex={i}
                                    >
                                      <Image
                                        src={urlFor(step.image!)
                                          .width(stepThumbW)
                                          .url()}
                                        alt={step.label || "Process step"}
                                        width={stepThumbW}
                                        height={stepThumbH}
                                        className="w-full cursor-zoom-in rounded"
                                        placeholder={
                                          step.image!.asset!.metadata?.lqip
                                            ? "blur"
                                            : "empty"
                                        }
                                        blurDataURL={
                                          step.image!.asset!.metadata?.lqip
                                        }
                                      />
                                    </LightboxTrigger>
                                    <span className="text-center text-xs text-muted">
                                      {step.label}
                                    </span>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Service gallery */}
                  {displayGallery.length > 0 && (
                    <div className="mt-8">
                      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 sm:gap-4">
                        {displayGallery.map((img, i) => {
                          const imgW =
                            img.asset!.metadata?.dimensions?.width ?? 800;
                          const imgH =
                            img.asset!.metadata?.dimensions?.height ?? 600;
                          const galThumbW = 600;
                          const galThumbH = Math.round(
                            (imgH / imgW) * galThumbW
                          );

                          return (
                            <LightboxTrigger
                              key={img._key}
                              src={urlFor(img).width(2400).url()}
                              fullSrc={img.asset!.url}
                              alt={img.alt ?? service.title}
                              title={img.alt ?? service.title}
                              galleryImages={galleryLightboxImages}
                              galleryIndex={i}
                            >
                              <Image
                                src={urlFor(img).width(galThumbW).url()}
                                alt={img.alt ?? `${service.title} example`}
                                width={galThumbW}
                                height={galThumbH}
                                className="w-full cursor-zoom-in rounded"
                                placeholder={
                                  img.asset!.metadata?.lqip ? "blur" : "empty"
                                }
                                blurDataURL={img.asset!.metadata?.lqip}
                              />
                            </LightboxTrigger>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </PageContainer>
  );
}
