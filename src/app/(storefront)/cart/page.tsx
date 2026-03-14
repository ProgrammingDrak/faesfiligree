"use client";

import { useCartStore } from "@/stores/cart";
import { CartItem } from "@/components/cart/CartItem";
import { CartSummary } from "@/components/cart/CartSummary";
import Link from "next/link";

export default function CartPage() {
  const items = useCartStore((s) => s.items);

  return (
    <section className="py-12 sm:py-20 px-4 sm:px-6 lg:px-8 max-w-3xl mx-auto">
      <h1 className="font-heading text-4xl sm:text-5xl text-center text-charcoal mb-10">
        Your Cart
      </h1>

      {items.length === 0 ? (
        <div className="text-center py-16">
          <svg
            width="64"
            height="64"
            viewBox="0 0 24 24"
            fill="none"
            className="mx-auto text-charcoal/15 mb-6"
          >
            <path
              d="M12 2L14.5 9.5L22 12L14.5 14.5L12 22L9.5 14.5L2 12L9.5 9.5L12 2Z"
              fill="currentColor"
            />
          </svg>
          <p className="text-charcoal/50 font-heading text-xl mb-2">
            Your cart is empty
          </p>
          <p className="text-charcoal/40 text-sm mb-8">
            Explore the shop to find something magical
          </p>
          <Link
            href="/shop"
            className="text-copper hover:text-copper-dark font-medium transition-colors"
          >
            Browse the shop &rarr;
          </Link>
        </div>
      ) : (
        <div>
          {items.map((item) => (
            <CartItem key={item.id} item={item} />
          ))}
          <CartSummary />
        </div>
      )}
    </section>
  );
}
