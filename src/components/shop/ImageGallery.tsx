"use client";

import { useState } from "react";
import type { SanityImage } from "@/lib/sanity/types";

interface ImageGalleryProps {
  images: SanityImage[];
  productName: string;
}

function PlaceholderImage({ name, className = "" }: { name: string; className?: string }) {
  const hue = name.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0) % 40 + 15;
  return (
    <div
      className={`w-full h-full flex items-center justify-center ${className}`}
      style={{
        background: `linear-gradient(135deg, hsl(${hue}, 30%, 12%) 0%, hsl(${hue}, 40%, 22%) 100%)`,
      }}
    >
      <svg width="64" height="64" viewBox="0 0 24 24" fill="none" className="opacity-20">
        <path
          d="M12 2L14.5 9.5L22 12L14.5 14.5L12 22L9.5 14.5L2 12L9.5 9.5L12 2Z"
          fill="#B76E79"
        />
      </svg>
    </div>
  );
}

export function ImageGallery({ images, productName }: ImageGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);

  return (
    <div className="space-y-3">
      {/* Main image */}
      <div className="aspect-square rounded-xl overflow-hidden bg-velvet">
        <PlaceholderImage
          name={`${productName}-${selectedIndex}`}
          className="rounded-xl"
        />
      </div>

      {/* Thumbnails */}
      {images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {images.map((_, i) => (
            <button
              key={i}
              onClick={() => setSelectedIndex(i)}
              className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden transition-all duration-200 ${
                i === selectedIndex
                  ? "ring-2 ring-copper ring-offset-2 ring-offset-parchment"
                  : "opacity-60 hover:opacity-100"
              }`}
            >
              <PlaceholderImage name={`${productName}-${i}`} />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
