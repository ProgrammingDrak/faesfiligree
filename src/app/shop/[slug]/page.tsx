import { notFound } from "next/navigation";
import { ProductDetail } from "@/components/shop";
import { getProductBySlug, getProductSlugs } from "@/lib/sanity/queries";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const slugs = await getProductSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return { title: "Product Not Found" };

  return {
    title: product.name,
    description: `${product.name} — handcrafted artisan jewelry. ${product.materials?.join(", ") || ""}`,
  };
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) notFound();

  return (
    <section className="py-12 sm:py-20 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
      <ProductDetail product={product} />
    </section>
  );
}
