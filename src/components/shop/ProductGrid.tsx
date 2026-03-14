import { ProductCard } from "./ProductCard";
import { ScrollReveal } from "@/components/ui";
import type { Product } from "@/lib/sanity/types";

interface ProductGridProps {
  products: Product[];
}

export function ProductGrid({ products }: ProductGridProps) {
  if (products.length === 0) {
    return (
      <div className="text-center py-20">
        <p className="text-charcoal/50 text-lg font-heading">
          No products available at the moment
        </p>
        <p className="text-charcoal/40 text-sm mt-2">
          Check back soon for new creations!
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {products.map((product, i) => (
        <ScrollReveal key={product._id} delay={i * 0.08}>
          <ProductCard product={product} />
        </ScrollReveal>
      ))}
    </div>
  );
}
