import { getSiteSettings } from "@/lib/data/queries";
import { ScrollReveal } from "@/components/ui";
import Link from "next/link";
import { Button } from "@/components/ui";

export const metadata = {
  title: "About",
  description:
    "The story behind Fae's Filigree — handcrafted artisan jewelry born from a love of metal, wire, and enchantment.",
};

export default async function AboutPage() {
  const settings = await getSiteSettings();

  return (
    <section className="py-12 sm:py-20 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
      {/* Hero Section */}
      <ScrollReveal>
        <h1 className="font-heading text-4xl sm:text-5xl text-center text-charcoal mb-6">
          About the Maker
        </h1>
      </ScrollReveal>

      {/* Story */}
      <ScrollReveal delay={0.1}>
        <div className="prose prose-lg mx-auto text-charcoal/80 mb-16">
          <p className="text-lg leading-relaxed">
            Every piece of jewelry I create begins as a whisper of copper wire
            between my fingers. What started as a childhood fascination with the
            way light catches metal has grown into a lifelong passion for
            crafting wearable art.
          </p>
          <p className="text-lg leading-relaxed">
            I work from my small workshop surrounded by stones, wire, and tools
            collected over years. Each piece is entirely handmade — no molds, no
            machines, just patient hands and a love for the craft. I draw
            inspiration from nature, mythology, and the quiet magic found in
            everyday moments.
          </p>
          <p className="text-lg leading-relaxed">
            My goal is to create jewelry that feels like it was found rather than
            made — pieces that carry a sense of story and wonder, as if plucked
            from a fairy tale forest or an ancient treasure hoard.
          </p>
        </div>
      </ScrollReveal>

      {/* Process Steps */}
      {settings.processSteps && settings.processSteps.length > 0 && (
        <div className="mb-16">
          <ScrollReveal>
            <h2 className="font-heading text-3xl text-center text-charcoal mb-10">
              My Process
            </h2>
          </ScrollReveal>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {settings.processSteps.map((step, i) => (
              <ScrollReveal key={i} delay={i * 0.1}>
                <div className="text-center p-6 rounded-xl bg-white/50 border border-charcoal/5">
                  <div className="text-3xl mb-3">{step.icon || "✨"}</div>
                  <h3 className="font-heading text-xl text-charcoal mb-2">
                    {step.title}
                  </h3>
                  <p className="text-sm text-charcoal/60">{step.description}</p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      )}

      {/* CTA */}
      <ScrollReveal>
        <div className="text-center bg-velvet rounded-2xl p-10 sm:p-14">
          <h2 className="font-heading text-3xl text-warm-white mb-4">
            Have something in mind?
          </h2>
          <p className="text-warm-white/60 mb-8 max-w-md mx-auto">
            I love bringing custom visions to life. Let&apos;s create something
            magical together.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/commissions">
              <Button size="lg">Request a Commission</Button>
            </Link>
            <Link href="/shop">
              <Button variant="secondary" size="lg" className="border-warm-white/30 text-warm-white hover:bg-warm-white hover:text-velvet">
                Browse the Shop
              </Button>
            </Link>
          </div>
        </div>
      </ScrollReveal>
    </section>
  );
}
