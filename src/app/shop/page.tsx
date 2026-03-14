import { ProductGrid } from "@/components/shop";
import { getProducts } from "@/lib/sanity/queries";
import { ScrollReveal } from "@/components/ui";

export const metadata = {
  title: "Shop",
  description:
    "Browse handcrafted artisan jewelry — rings, necklaces, earrings, bracelets, and brooches, each one-of-a-kind.",
};

export default async function ShopPage() {
  const products = await getProducts();

  return (
    <section className="py-12 sm:py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <ScrollReveal>
        <h1 className="font-heading text-4xl sm:text-5xl text-center text-charcoal mb-3">
          Shop
        </h1>
        <p className="text-center text-charcoal/60 mb-12 max-w-lg mx-auto">
          Each piece is handcrafted and one-of-a-kind — when it&apos;s gone,
          it&apos;s gone
        </p>
      </ScrollReveal>

      <ProductGrid products={products} />
    </section>
  );
}
