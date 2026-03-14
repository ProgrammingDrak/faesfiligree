import type { Metadata } from "next";
import { Cormorant_Garamond, Jost } from "next/font/google";
import { Navbar, Footer, CustomCursor } from "@/components/layout";
import "./globals.css";

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-heading",
  display: "swap",
});

const jost = Jost({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Fae's Filigree | Handcrafted Artisan Jewelry",
    template: "%s | Fae's Filigree",
  },
  description:
    "Enchanted handcrafted jewelry — delicate filigree, copper wirework, and bespoke commissions crafted with love.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${cormorant.variable} ${jost.variable}`}>
      <body className="min-h-screen bg-parchment text-charcoal font-body antialiased">
        <CustomCursor />
        <Navbar />
        <main className="pt-16 sm:pt-20">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
