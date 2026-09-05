import Image from "next/image";
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
    <div className="mx-auto w-full max-w-6xl px-6 py-10 sm:px-8 sm:py-16">
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
    </div>
  );
}
