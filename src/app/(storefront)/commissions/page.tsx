import { CommissionForm } from "@/components/commissions";
import { ScrollReveal } from "@/components/ui";

export const metadata = {
  title: "Commissions",
  description:
    "Request a custom handcrafted jewelry commission — share your vision and let me bring it to life.",
};

export default function CommissionsPage() {
  return (
    <section className="py-12 sm:py-20 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
      <ScrollReveal>
        <h1 className="font-heading text-4xl sm:text-5xl text-center text-charcoal mb-3">
          Custom Commissions
        </h1>
        <p className="text-center text-charcoal/60 mb-4 max-w-xl mx-auto">
          Every piece begins with a dream. Share yours with me, and I&apos;ll
          craft something truly one-of-a-kind.
        </p>
        <p className="text-center text-charcoal/40 text-sm mb-12 max-w-lg mx-auto">
          Fill out the form below and I&apos;ll get back to you within 2-3
          business days with ideas and a quote.
        </p>
      </ScrollReveal>

      <CommissionForm />
    </section>
  );
}
