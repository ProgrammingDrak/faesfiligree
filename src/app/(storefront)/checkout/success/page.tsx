"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useCartStore } from "@/stores/cart";
import { Button } from "@/components/ui";

export default function CheckoutSuccessPage() {
  const clearCart = useCartStore((s) => s.clearCart);

  useEffect(() => {
    clearCart();
  }, [clearCart]);

  return (
    <section className="py-20 px-4 text-center max-w-lg mx-auto">
      <div className="mb-8">
        <svg
          width="64"
          height="64"
          viewBox="0 0 24 24"
          fill="none"
          className="mx-auto text-copper"
        >
          <path
            d="M12 2L14.5 9.5L22 12L14.5 14.5L12 22L9.5 14.5L2 12L9.5 9.5L12 2Z"
            fill="currentColor"
          />
        </svg>
      </div>

      <h1 className="font-heading text-4xl text-charcoal mb-4">
        Thank You!
      </h1>
      <p className="text-charcoal/60 text-lg mb-2">
        Your order has been placed successfully.
      </p>
      <p className="text-charcoal/50 text-sm mb-10">
        You&apos;ll receive a confirmation email shortly with your order
        details and tracking information once your piece ships.
      </p>

      <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
        <Link href="/shop">
          <Button>Continue Shopping</Button>
        </Link>
        <Link href="/gallery">
          <Button variant="secondary">Explore Gallery</Button>
        </Link>
      </div>
    </section>
  );
}
