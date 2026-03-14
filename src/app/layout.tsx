import type { Metadata } from "next";
import { Navbar, Footer, CustomCursor } from "@/components/layout";
import "./globals.css";

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
    <html lang="en">
      <head>
        {/*
          In production with Google Fonts access, replace with next/font/google:
          import { Cormorant_Garamond, Jost } from "next/font/google"
          and add className variables to <html>. For now, fonts are defined
          in globals.css with system fallbacks.
        */}
      </head>
      <body className="min-h-screen bg-parchment text-charcoal antialiased">
        <CustomCursor />
        <Navbar />
        <main className="pt-16 sm:pt-20">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
