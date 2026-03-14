"use client";

import { motion } from "framer-motion";
import type { GalleryPiece } from "@/lib/data/types";

interface GalleryItemProps {
  piece: GalleryPiece;
}

function PlaceholderImage({ name }: { name: string }) {
  const hue = name.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0) % 40 + 15;
  return (
    <div
      className="w-full h-full flex items-center justify-center"
      style={{
        background: `linear-gradient(135deg, hsl(${hue}, 30%, 15%) 0%, hsl(${hue}, 40%, 25%) 100%)`,
      }}
    >
      <svg width="40" height="40" viewBox="0 0 24 24" fill="none" className="opacity-20">
        <path
          d="M12 2L14.5 9.5L22 12L14.5 14.5L12 22L9.5 14.5L2 12L9.5 9.5L12 2Z"
          fill="#B76E79"
        />
      </svg>
    </div>
  );
}

export function GalleryItem({ piece }: GalleryItemProps) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.3 }}
      className="group relative aspect-square rounded-xl overflow-hidden bg-velvet cursor-pointer"
    >
      <PlaceholderImage name={piece.title} />

      {/* Hover overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
        <h3 className="font-heading text-lg text-warm-white">{piece.title}</h3>
        {piece.description && (
          <p className="text-warm-white/60 text-sm mt-1 line-clamp-2">
            {piece.description}
          </p>
        )}
        {piece.materials && piece.materials.length > 0 && (
          <p className="text-rose-gold text-xs mt-2">
            {piece.materials.join(" · ")}
          </p>
        )}
        <div className="flex items-center gap-2 mt-2">
          {piece.isSold && (
            <span className="text-xs bg-rose-gold/20 text-rose-gold px-2 py-0.5 rounded-full">
              Sold
            </span>
          )}
          {piece.isCommission && (
            <span className="text-xs bg-copper/20 text-copper-light px-2 py-0.5 rounded-full">
              Commission
            </span>
          )}
          {piece.year && (
            <span className="text-xs text-warm-white/40">{piece.year}</span>
          )}
        </div>
      </div>
    </motion.div>
  );
}
