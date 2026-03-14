import Link from "next/link";
import { Button } from "@/components/ui";

export const metadata = {
  title: "Commission Submitted",
};

export default function CommissionSuccessPage() {
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
        Request Received!
      </h1>
      <p className="text-charcoal/60 text-lg mb-2">
        Thank you for sharing your vision with me.
      </p>
      <p className="text-charcoal/50 text-sm mb-4">
        I&apos;ll review your commission request and get back to you within
        2-3 business days with my thoughts and a quote.
      </p>

      <div className="bg-parchment-dark/50 rounded-xl p-6 text-left text-sm space-y-3 mb-10">
        <h3 className="font-heading text-lg text-charcoal">What happens next?</h3>
        <ol className="list-decimal list-inside space-y-2 text-charcoal/70">
          <li>I&apos;ll review your request and any reference images</li>
          <li>I&apos;ll reach out with initial sketches and a detailed quote</li>
          <li>Once you approve, I&apos;ll begin crafting your piece</li>
          <li>You&apos;ll receive progress updates along the way</li>
          <li>Your finished piece ships beautifully packaged to your door</li>
        </ol>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
        <Link href="/gallery">
          <Button>Browse Gallery for Inspiration</Button>
        </Link>
        <Link href="/">
          <Button variant="secondary">Back to Home</Button>
        </Link>
      </div>
    </section>
  );
}
