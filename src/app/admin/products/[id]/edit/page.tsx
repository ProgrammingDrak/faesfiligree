import { notFound } from "next/navigation";
import { prisma, isDatabaseConfigured } from "@/lib/db";
import { ProductForm } from "@/components/admin/ProductForm";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function EditProductPage({ params }: Props) {
  const { id } = await params;

  if (!isDatabaseConfigured()) return notFound();

  const product = await prisma.product.findUnique({
    where: { id },
    include: { productMaterials: true },
  });
  if (!product) return notFound();

  const categories = await prisma.category.findMany({ orderBy: { title: "asc" } });
  const materials = await prisma.material.findMany({ orderBy: { name: "asc" } });

  return (
    <div>
      <h1 className="font-heading text-3xl text-warm-white mb-6">Edit Product</h1>
      <ProductForm
        product={{
          ...product,
          productMaterials: product.productMaterials.map((pm) => ({
            materialId: pm.materialId,
            quantity: pm.quantity,
          })),
        }}
        categories={categories}
        materials={materials}
      />
    </div>
  );
}
