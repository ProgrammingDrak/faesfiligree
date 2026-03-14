"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";
import type { Category } from "@/lib/data/types";

interface GalleryFilterProps {
  categories: Category[];
}

export function GalleryFilter({ categories }: GalleryFilterProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeCategory = searchParams.get("category");

  const handleFilter = (slug: string | null) => {
    const params = new URLSearchParams(searchParams.toString());
    if (slug) {
      params.set("category", slug);
    } else {
      params.delete("category");
    }
    router.push(`/gallery?${params.toString()}`, { scroll: false });
  };

  return (
    <div className="flex flex-wrap justify-center gap-2 mb-10">
      <button
        onClick={() => handleFilter(null)}
        className={cn(
          "px-4 py-2 rounded-full text-sm font-medium transition-all duration-200",
          !activeCategory
            ? "bg-copper text-white"
            : "bg-copper/10 text-charcoal hover:bg-copper/20"
        )}
      >
        All
      </button>
      {categories.map((cat) => (
        <button
          key={cat._id}
          onClick={() => handleFilter(cat.slug.current)}
          className={cn(
            "px-4 py-2 rounded-full text-sm font-medium transition-all duration-200",
            activeCategory === cat.slug.current
              ? "bg-copper text-white"
              : "bg-copper/10 text-charcoal hover:bg-copper/20"
          )}
        >
          {cat.title}
        </button>
      ))}
    </div>
  );
}
