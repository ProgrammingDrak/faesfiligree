import { prisma, isDatabaseConfigured } from "@/lib/db";
import { ProductForm } from "@/components/admin/ProductForm";

export default async function NewProductPage() {
  const categories = isDatabaseConfigured()
    ? await prisma.category.findMany({ orderBy: { title: "asc" } })
    : [];
  const materials = isDatabaseConfigured()
    ? await prisma.material.findMany({ orderBy: { name: "asc" } })
    : [];

  return (
    <div>
      <h1 className="font-heading text-3xl text-warm-white mb-6">New Product</h1>
      <ProductForm categories={categories} materials={materials} />
    </div>
  );
}
