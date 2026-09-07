"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCartStore } from "@/stores/cart";
import { startCheckout } from "@/lib/square/actions";
import { Button } from "@/components/ui";
import { formatPrice } from "@/lib/utils";

export default function CheckoutPage() {
  const router = useRouter();
  const items = useCartStore((s) => s.items);
  const getTotal = useCartStore((s) => s.getTotal);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Hosted checkout only needs the location id client-side, as a signal
  // that Square is configured; the server action re-checks authoritatively.
  const squareConfigured = !!process.env.NEXT_PUBLIC_SQUARE_LOCATION_ID;

  const handleCheckout = async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await startCheckout(
        items.map((item) => ({
          slug: item.slug,
          quantity: item.quantity,
        }))
      );

      if (result.error || !result.url) {
        setError(result.error ?? "Failed to start checkout. Please try again.");
        setLoading(false);
        return;
      }

      // Hand off to Square's hosted checkout page; it collects card,
      // email, and shipping address, then redirects back to /checkout/success.
      window.location.href = result.url;
    } catch {
      setError("An unexpected error occurred. Please try again.");
      setLoading(false);
    }
  };

  if (items.length === 0) {
    return (
      <section className="py-20 px-4 text-center max-w-lg mx-auto">
        <h1 className="font-heading text-4xl text-charcoal mb-4">Checkout</h1>
        <p className="text-charcoal/50 mb-8">Your cart is empty</p>
        <Button onClick={() => router.push("/shop")} variant="secondary">
          Browse the shop
        </Button>
      </section>
    );
  }

  return (
    <section className="py-12 sm:py-20 px-4 sm:px-6 lg:px-8 max-w-2xl mx-auto">
      <h1 className="font-heading text-4xl sm:text-5xl text-center text-charcoal mb-10">
        Checkout
      </h1>

      {/* Order summary */}
      <div className="bg-white/50 rounded-xl p-6 border border-charcoal/10 mb-8">
        <h2 className="font-heading text-xl text-charcoal mb-4">
          Order Summary
        </h2>

        <div className="space-y-3">
          {items.map((item) => (
            <div key={item.id} className="flex justify-between text-sm">
              <span className="text-charcoal">
                {item.name} &times; {item.quantity}
              </span>
              <span className="text-charcoal font-medium">
                {formatPrice(item.price * item.quantity)}
              </span>
            </div>
          ))}
        </div>

        <div className="border-t border-charcoal/10 mt-4 pt-4 flex justify-between items-center">
          <span className="font-heading text-lg text-charcoal">Total</span>
          <span className="font-heading text-xl text-copper font-semibold">
            {formatPrice(getTotal())}
          </span>
        </div>
      </div>

      {squareConfigured ? (
        <div>
          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}

          <Button
            onClick={handleCheckout}
            loading={loading}
            size="lg"
            className="w-full"
          >
            Continue to Secure Checkout
          </Button>
          <p className="text-center text-xs text-charcoal/40 mt-3">
            You&apos;ll enter payment and shipping details on Square&apos;s
            secure checkout page.
          </p>
        </div>
      ) : (
        <div className="text-center py-8">
          <p className="text-charcoal/50 mb-2">
            Payment processing is not configured yet.
          </p>
          <p className="text-charcoal/40 text-sm">
            Set up Square environment variables to enable checkout.
          </p>
        </div>
      )}
    </section>
  );
}
