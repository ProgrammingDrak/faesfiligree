import Link from "next/link";
import { confirmOrder } from "@/lib/square/actions";
import { formatPrice } from "@/lib/utils";
import { Button } from "@/components/ui";
import ClearCart from "./ClearCart";

export const dynamic = "force-dynamic";

function Sparkle() {
  return (
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
  );
}

function FooterLinks() {
  return (
    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
      <Link href="/shop">
        <Button>Continue Shopping</Button>
      </Link>
      <Link href="/gallery">
        <Button variant="secondary">Explore Gallery</Button>
      </Link>
    </div>
  );
}

export default async function CheckoutSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ ref?: string }>;
}) {
  const { ref } = await searchParams;
  const result = await confirmOrder(ref ?? "");

  if (result.status !== "paid") {
    return (
      <section className="py-20 px-4 text-center max-w-lg mx-auto">
        <h1 className="font-heading text-4xl text-charcoal mb-4">
          {result.status === "pending"
            ? "Payment Not Completed"
            : "Order Not Found"}
        </h1>
        <p className="text-charcoal/60 mb-10">
          {result.status === "pending"
            ? "It looks like this checkout wasn't finished. Your cart is still saved if you'd like to try again."
            : "We couldn't find an order for this link. If you believe you completed a payment, please contact us."}
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link href="/checkout">
            <Button>Return to Checkout</Button>
          </Link>
          <Link href="/shop">
            <Button variant="secondary">Browse the Shop</Button>
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="py-20 px-4 text-center max-w-lg mx-auto">
      <ClearCart />
      <Sparkle />

      <h1 className="font-heading text-4xl text-charcoal mb-4">Thank You!</h1>
      <p className="text-charcoal/60 text-lg mb-2">
        Your order has been placed successfully.
      </p>
      <p className="text-charcoal/50 text-sm mb-8">
        {result.buyerEmail
          ? `Square has emailed a receipt to ${result.buyerEmail}.`
          : "Square has emailed your receipt."}{" "}
        We&apos;ll be in touch once your piece ships.
      </p>

      {result.items && result.items.length > 0 && (
        <div className="bg-white/50 rounded-xl p-6 border border-charcoal/10 mb-10 text-left">
          <h2 className="font-heading text-xl text-charcoal mb-4">
            Order Summary
          </h2>
          <div className="space-y-3">
            {result.items.map((item, i) => (
              <div key={i} className="flex justify-between text-sm">
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
              {formatPrice(result.subtotal ?? 0)}
            </span>
          </div>
        </div>
      )}

      <FooterLinks />
    </section>
  );
}
