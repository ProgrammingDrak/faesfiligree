"use client";

import { GalleryGrid } from "./GalleryGrid";
import type { GalleryPiece } from "@/lib/data/types";

interface GalleryContentProps {
  pieces: GalleryPiece[];
}

export function GalleryContent({ pieces }: GalleryContentProps) {
  return <GalleryGrid pieces={pieces} />;
}
