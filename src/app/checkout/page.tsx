"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import Script from "next/script";
import { useCartStore } from "@/stores/cart";
import { createPayment } from "@/lib/square/actions";
import { Button } from "@/components/ui";
import { formatPrice } from "@/lib/utils";

declare global {
  interface Window {
    Square?: {
      payments: (
        appId: string,
        locationId: string
      ) => Promise<{
        card: () => Promise<{
          attach: (selector: string) => Promise<void>;
          tokenize: () => Promise<{
            status: string;
            token?: string;
            errors?: { message: string }[];
          }>;
        }>;
      }>;
    };
  }
}

export default function CheckoutPage() {
  const router = useRouter();
  const items = useCartStore((s) => s.items);
  const getTotal = useCartStore((s) => s.getTotal);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sdkReady, setSdkReady] = useState(false);
  const cardRef = useRef<Awaited<
    ReturnType<Awaited<ReturnType<NonNullable<Window["Square"]>["payments"]>>["card"]>
  > | null>(null);

  const appId = process.env.NEXT_PUBLIC_SQUARE_APP_ID;
  const locationId = process.env.NEXT_PUBLIC_SQUARE_LOCATION_ID;

  const initializeCard = useCallback(async () => {
    if (!window.Square || !appId || !locationId) return;

    try {
      const payments = await window.Square.payments(appId, locationId);
      const card = await payments.card();
      await card.attach("#card-container");
      cardRef.current = card;
      setSdkReady(true);
    } catch (err) {
      console.error("Failed to initialize Square card:", err);
      setError("Failed to load payment form. Please refresh the page.");
    }
  }, [appId, locationId]);

  useEffect(() => {
    if (window.Square) {
      initializeCard();
    }
  }, [initializeCard]);

  const handlePayment = async () => {
    if (!cardRef.current) {
      setError("Payment form not ready. Please wait a moment.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Tokenize the card
      const tokenResult = await cardRef.current.tokenize();

      if (tokenResult.status !== "OK" || !tokenResult.token) {
        const errorMessage =
          tokenResult.errors?.[0]?.message || "Card tokenization failed";
        setError(errorMessage);
        setLoading(false);
        return;
      }

      // Send token to server for payment
      const result = await createPayment(
        tokenResult.token,
        items.map((item) => ({
          slug: item.slug,
          quantity: item.quantity,
        }))
      );

      if (result.error) {
        setError(result.error);
        setLoading(false);
        return;
      }

      if (result.success) {
        router.push("/checkout/success");
      }
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

  const squareConfigured = !!appId && !!locationId;

  return (
    <section className="py-12 sm:py-20 px-4 sm:px-6 lg:px-8 max-w-2xl mx-auto">
      {/* Load Square Web Payments SDK */}
      <Script
        src={
          process.env.NODE_ENV === "production"
            ? "https://web.squarecdn.com/v1/square.js"
            : "https://sandbox.web.squarecdn.com/v1/square.js"
        }
        strategy="afterInteractive"
        onLoad={initializeCard}
      />

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

      {/* Payment form */}
      {squareConfigured ? (
        <div>
          <h2 className="font-heading text-xl text-charcoal mb-4">
            Payment Details
          </h2>

          {/* Square card input renders here */}
          <div
            id="card-container"
            className="min-h-[90px] mb-4 rounded-lg"
          />

          {!sdkReady && (
            <p className="text-charcoal/40 text-sm text-center mb-4">
              Loading payment form...
            </p>
          )}

          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}

          <Button
            onClick={handlePayment}
            loading={loading}
            disabled={!sdkReady}
            size="lg"
            className="w-full"
          >
            Pay {formatPrice(getTotal())}
          </Button>
          <p className="text-center text-xs text-charcoal/40 mt-3">
            Secured by Square
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
