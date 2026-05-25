import { prisma, isDatabaseConfigured } from "@/lib/db";
import { ProductForm } from "@/components/admin/ProductForm";

export default async function NewProductPage() {
  const materials = isDatabaseConfigured()
    ? await prisma.material.findMany({ orderBy: { name: "asc" } })
    : [];
  const settings = isDatabaseConfigured()
    ? await prisma.siteSettings.findUnique({ where: { id: "singleton" } })
    : null;

  return (
    <div>
      <h1 className="font-heading text-3xl text-warm-white mb-6">New Product</h1>
      <ProductForm materials={materials} laborRate={settings?.laborRate ?? 2500} />
    </div>
  );
}
