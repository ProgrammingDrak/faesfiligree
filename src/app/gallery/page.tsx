import { Suspense } from "react";
import { GalleryContent } from "@/components/gallery";
import { getGalleryPieces, getCategories } from "@/lib/sanity/queries";
import { ScrollReveal } from "@/components/ui";

export const metadata = {
  title: "Gallery",
  description:
    "Explore the portfolio of handcrafted artisan jewelry — rings, necklaces, earrings, bracelets, and custom commissions.",
};

export default async function GalleryPage() {
  const [pieces, categories] = await Promise.all([
    getGalleryPieces(),
    getCategories(),
  ]);

  return (
    <section className="py-12 sm:py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <ScrollReveal>
        <h1 className="font-heading text-4xl sm:text-5xl text-center text-charcoal mb-3">
          Gallery
        </h1>
        <p className="text-center text-charcoal/60 mb-12 max-w-lg mx-auto">
          A collection of past creations, commissions, and one-of-a-kind pieces
        </p>
      </ScrollReveal>

      <Suspense fallback={<div className="text-center py-10">Loading...</div>}>
        <GalleryContent pieces={pieces} categories={categories} />
      </Suspense>
    </section>
  );
}
