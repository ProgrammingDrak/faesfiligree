"use client";

import { AnimatePresence, motion } from "framer-motion";
import { GalleryItem } from "./GalleryItem";
import type { GalleryPiece } from "@/lib/data/types";

interface GalleryGridProps {
  pieces: GalleryPiece[];
}

export function GalleryGrid({ pieces }: GalleryGridProps) {
  if (pieces.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-center py-20"
      >
        <p className="text-charcoal/50 text-lg font-heading">
          No pieces found in this category
        </p>
      </motion.div>
    );
  }

  return (
    <motion.div
      layout
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5"
    >
      <AnimatePresence mode="popLayout">
        {pieces.map((piece) => (
          <GalleryItem key={piece._id} piece={piece} />
        ))}
      </AnimatePresence>
    </motion.div>
  );
}
