import Link from "next/link";
import { ScrollReveal, ShimmerEffect } from "@/components/ui";
import type { Product, GalleryPiece } from "@/lib/data/types";
import { formatPrice } from "@/lib/utils";

interface FeaturedPiecesProps {
  products: Product[];
  galleryPieces: GalleryPiece[];
}

function PlaceholderImage({ name }: { name: string }) {
  // Generate a consistent color from the name
  const hue = name.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0) % 40 + 15;
  return (
    <div
      className="w-full h-full flex items-center justify-center"
      style={{
        background: `linear-gradient(135deg, hsl(${hue}, 30%, 15%) 0%, hsl(${hue}, 40%, 25%) 100%)`,
      }}
    >
      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" className="opacity-30">
        <path
          d="M12 2L14.5 9.5L22 12L14.5 14.5L12 22L9.5 14.5L2 12L9.5 9.5L12 2Z"
          fill="#B76E79"
        />
      </svg>
    </div>
  );
}

export function FeaturedPieces({ products, galleryPieces }: FeaturedPiecesProps) {
  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Featured Products */}
      {products.length > 0 && (
        <div className="mb-20">
          <ScrollReveal>
            <h2 className="font-heading text-3xl sm:text-4xl text-center text-charcoal mb-3">
              Featured Pieces
            </h2>
            <p className="text-center text-charcoal/60 mb-12 max-w-lg mx-auto">
              One-of-a-kind creations, ready to find their home
            </p>
          </ScrollReveal>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product, i) => (
              <ScrollReveal key={product._id} delay={i * 0.1}>
                <Link href={`/shop/${product.slug.current}`}>
                  <ShimmerEffect className="bg-velvet rounded-xl overflow-hidden hover:shadow-2xl transition-shadow duration-300">
                    <div className="aspect-square relative">
                      <PlaceholderImage name={product.name} />
                      {!product.inStock && (
                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                          <span className="text-warm-white font-heading text-xl">
                            Sold
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="p-5">
                      <h3 className="font-heading text-xl text-warm-white">
                        {product.name}
                      </h3>
                      <p className="text-rose-gold mt-1 font-medium">
                        {formatPrice(product.price)}
                      </p>
                      {product.materials && (
                        <p className="text-warm-white/50 text-sm mt-2">
                          {product.materials.join(" · ")}
                        </p>
                      )}
                    </div>
                  </ShimmerEffect>
                </Link>
              </ScrollReveal>
            ))}
          </div>

          <div className="text-center mt-10">
            <Link
              href="/shop"
              className="text-copper hover:text-copper-dark font-medium transition-colors"
            >
              View all pieces &rarr;
            </Link>
          </div>
        </div>
      )}

      {/* Featured Gallery */}
      {galleryPieces.length > 0 && (
        <div>
          <ScrollReveal>
            <h2 className="font-heading text-3xl sm:text-4xl text-center text-charcoal mb-3">
              From the Workshop
            </h2>
            <p className="text-center text-charcoal/60 mb-12 max-w-lg mx-auto">
              A glimpse into past creations and commissioned works
            </p>
          </ScrollReveal>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {galleryPieces.map((piece, i) => (
              <ScrollReveal key={piece._id} delay={i * 0.1}>
                <div className="group relative aspect-square rounded-lg overflow-hidden bg-velvet">
                  <PlaceholderImage name={piece.title} />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="absolute bottom-0 left-0 right-0 p-4">
                      <h4 className="font-heading text-lg text-warm-white">
                        {piece.title}
                      </h4>
                      {piece.materials && (
                        <p className="text-warm-white/60 text-sm">
                          {piece.materials.join(" · ")}
                        </p>
                      )}
                      {piece.isSold && (
                        <span className="inline-block mt-1 text-xs text-rose-gold">
                          Sold
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>

          <div className="text-center mt-10">
            <Link
              href="/gallery"
              className="text-copper hover:text-copper-dark font-medium transition-colors"
            >
              Explore the gallery &rarr;
            </Link>
          </div>
        </div>
      )}
    </section>
  );
}
