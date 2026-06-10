import { prisma, isDatabaseConfigured } from "@/lib/db";
import { ProductForm } from "@/components/admin/ProductForm";
import { getMerchCategoryOptions } from "@/lib/data/categories";

interface Props {
  searchParams: Promise<{ category?: string }>;
}

export default async function NewProductPage({ searchParams }: Props) {
  const { category: categorySlug } = await searchParams;
  const materials = isDatabaseConfigured()
    ? await prisma.material.findMany({ orderBy: { name: "asc" } })
    : [];
  const settings = isDatabaseConfigured()
    ? await prisma.siteSettings.findUnique({ where: { id: "singleton" } })
    : null;
  const categories = isDatabaseConfigured() ? await getMerchCategoryOptions() : [];
  const defaultCategoryId = categorySlug
    ? categories.find((c) => c.slug === categorySlug)?.id
    : undefined;

  return (
    <div>
      <h1 className="font-heading text-3xl text-warm-white mb-6">New Product</h1>
      <ProductForm
        materials={materials}
        categories={categories}
        laborRate={settings?.laborRate ?? 2500}
        defaultCategoryId={defaultCategoryId}
      />
    </div>
  );
}
