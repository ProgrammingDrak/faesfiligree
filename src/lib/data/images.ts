/**
 * Get the display URL for an image.
 * With Vercel Blob, images are stored as direct URLs so no transformation is needed.
 * next/image handles optimization at the edge.
 */
export function getImageUrl(url: string | undefined, _width?: number): string {
  return url || "";
}
