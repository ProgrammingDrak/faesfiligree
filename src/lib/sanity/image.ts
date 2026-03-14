import imageUrlBuilder from "@sanity/image-url";
import { sanityConfig } from "@/sanity/env";
import type { SanityImage } from "./types";

const builder = imageUrlBuilder({
  projectId: sanityConfig.projectId,
  dataset: sanityConfig.dataset,
});

export function urlFor(source: SanityImage) {
  return builder.image(source);
}

export function getImageUrl(
  source: SanityImage,
  width: number = 800,
  height?: number
): string {
  let img = builder.image(source).width(width).auto("format").quality(80);
  if (height) img = img.height(height);
  return img.url();
}

export function getLqip(source: SanityImage): string {
  return builder.image(source).width(20).quality(20).blur(50).url();
}
