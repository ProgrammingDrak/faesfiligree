import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";

// Theme Clerk's hosted UI to match the Fae's Filigree dark/copper palette.
const clerkAppearance = {
  variables: {
    colorPrimary: "#B87333", // copper
    colorBackground: "#1A1A1A", // velvet
    colorInputBackground: "#2A2A2A", // velvet-light
    colorText: "#F5F0EB", // warm-white
    colorTextSecondary: "rgba(245, 240, 235, 0.6)",
    colorInputText: "#F5F0EB",
    colorDanger: "#B76E79", // rose-gold
    borderRadius: "0.5rem",
  },
  elements: {
    card: "bg-velvet border border-warm-white/10 shadow-xl",
    headerTitle: "text-warm-white",
    headerSubtitle: "text-warm-white/50",
    formButtonPrimary: "bg-copper hover:bg-copper-dark text-white",
    footerActionLink: "text-copper hover:text-copper-light",
  },
};

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
        <ClerkProvider appearance={clerkAppearance}>{children}</ClerkProvider>
      </body>
    </html>
  );
}
