"use client";

import { useSearchParams } from "next/navigation";
import { useMemo } from "react";
import { GalleryFilter } from "./GalleryFilter";
import { GalleryGrid } from "./GalleryGrid";
import type { GalleryPiece, Category } from "@/lib/data/types";

interface GalleryContentProps {
  pieces: GalleryPiece[];
  categories: Category[];
}

export function GalleryContent({ pieces, categories }: GalleryContentProps) {
  const searchParams = useSearchParams();
  const activeCategory = searchParams.get("category");

  const filteredPieces = useMemo(() => {
    if (!activeCategory) return pieces;
    return pieces.filter(
      (piece) => piece.category?.slug.current === activeCategory
    );
  }, [pieces, activeCategory]);

  return (
    <>
      <GalleryFilter categories={categories} />
      <GalleryGrid pieces={filteredPieces} />
    </>
  );
}
