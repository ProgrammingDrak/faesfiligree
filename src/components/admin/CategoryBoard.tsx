"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { formatPrice } from "@/lib/utils";
import { RecordSaleDialog, type SaleTarget } from "@/components/admin/RecordSaleDialog";

export interface CategoryItem {
  id: string;
  name: string;
  image: string | null;
  price: number;
  hagglePrice: number | null;
  quantityAvailable: number;
}

export interface CategoryCard {
  slug: string;
  title: string;
  image: string | null;
  itemCount: number;
  availableUnits: number;
  soldUnits: number;
  items: CategoryItem[];
}

export function CategoryBoard({ categories }: { categories: CategoryCard[] }) {
  const router = useRouter();
  const [picker, setPicker] = useState<CategoryCard | null>(null);
  const [saleTarget, setSaleTarget] = useState<SaleTarget | null>(null);

  const pickItem = (item: CategoryItem) => {
    setPicker(null);
    setSaleTarget({
      id: item.id,
      name: item.name,
      listPrice: item.price,
      hagglePrice: item.hagglePrice,
    });
  };

  if (categories.length === 0) {
    return <p className="text-warm-white/50">No categories yet.</p>;
  }

  return (
    <div>
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
        {categories.map((cat) => {
          const sellable = cat.items.filter((i) => i.quantityAvailable > 0);
          return (
            <div
              key={cat.slug}
              className="overflow-hidden rounded-xl border border-warm-white/10 bg-warm-white/5"
            >
              <Link
                href={`/admin/products/category/${cat.slug}`}
                className="block aspect-[5/2] bg-charcoal/70 transition-opacity hover:opacity-90"
              >
                {cat.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={cat.image} alt="" className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full items-center justify-center text-sm text-warm-white/25">
                    No items yet
                  </div>
                )}
              </Link>

              <div className="space-y-3 p-4">
                <div className="flex items-start justify-between gap-3">
                  <Link
                    href={`/admin/products/category/${cat.slug}`}
                    className="font-heading text-lg text-warm-white hover:text-copper"
                  >
                    {cat.title}
                  </Link>
                  <span className="rounded bg-copper/20 px-2 py-0.5 text-xs text-copper">
                    {cat.itemCount} {cat.itemCount === 1 ? "item" : "items"}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="rounded bg-warm-white/5 p-2">
                    <p className="text-warm-white/35">Available</p>
                    <p className="text-warm-white">{cat.availableUnits}</p>
                  </div>
                  <div className="rounded bg-warm-white/5 p-2">
                    <p className="text-warm-white/35">Sold</p>
                    <p className="text-warm-white">{cat.soldUnits}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setPicker(cat)}
                    disabled={sellable.length === 0}
                    className="rounded bg-green-600 px-3 py-1.5 text-sm text-white hover:bg-green-700 disabled:opacity-40"
                  >
                    Sold
                  </button>
                  <Link
                    href={`/admin/products/category/${cat.slug}`}
                    className="rounded bg-warm-white/10 px-3 py-1.5 text-sm text-warm-white hover:bg-warm-white/15"
                  >
                    Open
                  </Link>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Sold picker: choose which item in the category sold */}
      {picker && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-charcoal/70 p-4">
          <div className="w-full max-w-lg rounded-xl border border-warm-white/15 bg-charcoal p-5 shadow-xl">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-warm-white">
                Which {picker.title} sold?
              </h3>
              <button
                onClick={() => setPicker(null)}
                className="text-sm text-warm-white/50 hover:text-warm-white"
              >
                Cancel
              </button>
            </div>
            <p className="mt-1 text-sm text-warm-white/50">Pick the item that sold.</p>

            <div className="mt-4 grid max-h-[60vh] grid-cols-2 gap-3 overflow-y-auto sm:grid-cols-3">
              {picker.items
                .filter((i) => i.quantityAvailable > 0)
                .map((item) => (
                  <button
                    key={item.id}
                    onClick={() => pickItem(item)}
                    className="overflow-hidden rounded-lg border border-warm-white/10 bg-warm-white/5 text-left transition-colors hover:border-copper"
                  >
                    <div className="aspect-square bg-charcoal/70">
                      {item.image ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={item.image} alt="" className="h-full w-full object-cover" />
                      ) : (
                        <div className="flex h-full items-center justify-center text-xs text-warm-white/25">
                          No image
                        </div>
                      )}
                    </div>
                    <div className="p-2">
                      <p className="truncate text-sm text-warm-white">{item.name}</p>
                      <p className="text-xs text-warm-white/45">
                        {formatPrice(item.price)} · {item.quantityAvailable} left
                      </p>
                    </div>
                  </button>
                ))}
            </div>
          </div>
        </div>
      )}

      {saleTarget && (
        <RecordSaleDialog
          target={saleTarget}
          onClose={() => setSaleTarget(null)}
          onRecorded={() => {
            setSaleTarget(null);
            router.refresh();
          }}
        />
      )}
    </div>
  );
}
