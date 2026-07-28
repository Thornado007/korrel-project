import { createImageUrlBuilder } from "@sanity/image-url";

import type { SanityImageValue } from "../types";
import { dataset, projectId } from "../env";

const builder = createImageUrlBuilder({ projectId, dataset });

export function urlFor(source: SanityImageValue) {
  return builder.image(source);
}


