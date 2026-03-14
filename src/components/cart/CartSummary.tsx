"use client";

import Link from "next/link";
import { useCartStore } from "@/stores/cart";
import { formatPrice } from "@/lib/utils";
import { Button } from "@/components/ui";

export function CartSummary() {
  const items = useCartStore((s) => s.items);
  const getTotal = useCartStore((s) => s.getTotal);
  const getItemCount = useCartStore((s) => s.getItemCount);

  const total = getTotal();
  const count = getItemCount();

  return (
    <div className="border-t border-charcoal/10 pt-4 mt-4 space-y-4">
      <div className="flex justify-between items-center">
        <span className="text-charcoal/60 text-sm">
          {count} {count === 1 ? "item" : "items"}
        </span>
        <span className="text-lg font-heading font-semibold text-charcoal">
          {formatPrice(total)}
        </span>
      </div>
      <p className="text-xs text-charcoal/40">
        Shipping calculated at checkout
      </p>
      <Link href="/checkout" className="block">
        <Button className="w-full" size="lg" disabled={items.length === 0}>
          Proceed to Checkout
        </Button>
      </Link>
    </div>
  );
}
