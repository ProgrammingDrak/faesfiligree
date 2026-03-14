import Link from "next/link";
import { ShimmerEffect } from "@/components/ui";
import { formatPrice } from "@/lib/utils";
import type { Product } from "@/lib/sanity/types";

interface ProductCardProps {
  product: Product;
}

function PlaceholderImage({ name }: { name: string }) {
  const hue = name.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0) % 40 + 15;
  return (
    <div
      className="w-full h-full flex items-center justify-center"
      style={{
        background: `linear-gradient(135deg, hsl(${hue}, 30%, 12%) 0%, hsl(${hue}, 40%, 22%) 100%)`,
      }}
    >
      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" className="opacity-20">
        <path
          d="M12 2L14.5 9.5L22 12L14.5 14.5L12 22L9.5 14.5L2 12L9.5 9.5L12 2Z"
          fill="#B76E79"
        />
      </svg>
    </div>
  );
}

export function ProductCard({ product }: ProductCardProps) {
  return (
    <Link href={`/shop/${product.slug.current}`} className="block">
      <ShimmerEffect className="bg-velvet rounded-xl overflow-hidden hover:shadow-2xl hover:shadow-copper/10 transition-all duration-300 hover:-translate-y-1">
        <div className="aspect-square relative">
          <PlaceholderImage name={product.name} />
          {!product.inStock && (
            <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
              <span className="font-heading text-xl text-warm-white/90 tracking-wide">
                Sold
              </span>
            </div>
          )}
          {product.featured && product.inStock && (
            <div className="absolute top-3 right-3">
              <span className="bg-copper text-white text-xs px-2 py-1 rounded-full">
                Featured
              </span>
            </div>
          )}
        </div>
        <div className="p-5">
          <h3 className="font-heading text-xl text-warm-white leading-tight">
            {product.name}
          </h3>
          <p className="text-rose-gold mt-2 text-lg font-medium">
            {formatPrice(product.price)}
          </p>
          {product.materials && product.materials.length > 0 && (
            <p className="text-warm-white/40 text-sm mt-2">
              {product.materials.join(" · ")}
            </p>
          )}
        </div>
      </ShimmerEffect>
    </Link>
  );
}
