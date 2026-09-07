"use client";

import { useEffect } from "react";
import { useCartStore } from "@/stores/cart";

/** Clears the persisted cart once a paid order confirmation renders. */
export default function ClearCart() {
  const clearCart = useCartStore((s) => s.clearCart);

  useEffect(() => {
    clearCart();
  }, [clearCart]);

  return null;
}
