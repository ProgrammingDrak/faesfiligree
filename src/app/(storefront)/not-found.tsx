import Link from "next/link";
import { Button } from "@/components/ui";

export default function NotFound() {
  return (
    <section className="py-20 px-4 text-center max-w-lg mx-auto">
      <div className="mb-8">
        <svg
          width="64"
          height="64"
          viewBox="0 0 24 24"
          fill="none"
          className="mx-auto text-charcoal/20"
        >
          <path
            d="M12 2L14.5 9.5L22 12L14.5 14.5L12 22L9.5 14.5L2 12L9.5 9.5L12 2Z"
            fill="currentColor"
          />
        </svg>
      </div>

      <h1 className="font-heading text-5xl text-charcoal mb-4">404</h1>
      <p className="text-charcoal/60 text-lg mb-2">Page not found</p>
      <p className="text-charcoal/40 text-sm mb-10">
        This page seems to have vanished like morning mist.
      </p>

      <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
        <Link href="/">
          <Button>Back to Home</Button>
        </Link>
        <Link href="/shop">
          <Button variant="secondary">Browse the Shop</Button>
        </Link>
      </div>
    </section>
  );
}
