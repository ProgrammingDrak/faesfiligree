import { ImageGallery } from "./ImageGallery";
import { AddToCartButton } from "./AddToCartButton";
import { formatPrice } from "@/lib/utils";
import type { Product } from "@/lib/data/types";

interface ProductDetailProps {
  product: Product;
}

export function ProductDetail({ product }: ProductDetailProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16">
      {/* Images */}
      <ImageGallery images={product.images} productName={product.name} />

      {/* Info */}
      <div className="flex flex-col">
        <h1 className="font-heading text-3xl sm:text-4xl text-charcoal">
          {product.name}
        </h1>

        <p className="text-2xl text-copper font-medium mt-3">
          {formatPrice(product.price)}
        </p>

        {!product.inStock && (
          <span className="inline-block mt-2 text-sm text-rose-gold bg-rose-gold/10 px-3 py-1 rounded-full w-fit">
            Sold
          </span>
        )}

        {/* Materials */}
        {product.materials && product.materials.length > 0 && (
          <div className="mt-6">
            <h3 className="text-sm font-medium text-charcoal/60 uppercase tracking-wide mb-2">
              Materials
            </h3>
            <div className="flex flex-wrap gap-2">
              {product.materials.map((material) => (
                <span
                  key={material}
                  className="text-sm bg-copper/10 text-copper-dark px-3 py-1 rounded-full"
                >
                  {material}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Dimensions */}
        {product.dimensions && (
          <div className="mt-4">
            <h3 className="text-sm font-medium text-charcoal/60 uppercase tracking-wide mb-1">
              Dimensions
            </h3>
            <p className="text-charcoal">{product.dimensions}</p>
          </div>
        )}

        {/* Description */}
        {product.description && (
          <div className="mt-6 prose prose-sm text-charcoal/80">
            <h3 className="text-sm font-medium text-charcoal/60 uppercase tracking-wide mb-2">
              Description
            </h3>
            <p>
              A lovingly handcrafted piece, unique in its details and character.
              Each element is carefully shaped, woven, and polished by hand.
            </p>
          </div>
        )}

        {/* Category */}
        {product.category && (
          <div className="mt-4">
            <span className="text-sm text-charcoal/50">
              Category: {product.category.title}
            </span>
          </div>
        )}

        {/* Add to Cart */}
        <div className="mt-8">
          <AddToCartButton product={product} />
        </div>
      </div>
    </div>
  );
}
