"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { WireAnimation } from "./WireAnimation";
import { SparkleField } from "./SparkleField";
import { Button } from "@/components/ui";

interface HeroProps {
  heading?: string;
  subheading?: string;
}

export function Hero({
  heading = "Handcrafted with Enchantment",
  subheading = "Delicate filigree and copper wirework — each piece tells a story woven in metal and light.",
}: HeroProps) {
  return (
    <section className="relative min-h-[80vh] flex items-center justify-center overflow-hidden">
      {/* Wire animation background */}
      <WireAnimation />

      {/* Sparkle particles */}
      <SparkleField count={12} />

      {/* Content */}
      <div className="relative z-10 text-center px-4 max-w-3xl mx-auto">
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="font-heading text-5xl sm:text-6xl lg:text-7xl font-semibold text-charcoal leading-tight"
        >
          {heading}
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="mt-6 text-lg sm:text-xl text-charcoal/70 font-body leading-relaxed"
        >
          {subheading}
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.1, ease: [0.22, 1, 0.36, 1] }}
          className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <Link href="/shop">
            <Button size="lg">Shop Collection</Button>
          </Link>
          <Link href="/commissions">
            <Button variant="secondary" size="lg">
              Request a Commission
            </Button>
          </Link>
        </motion.div>
      </div>

      {/* Bottom gradient fade */}
      <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-parchment to-transparent" />
    </section>
  );
}
