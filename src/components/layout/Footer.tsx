import Link from "next/link";
import { NAV_LINKS, SITE_NAME, SOCIAL_LINKS } from "@/lib/constants";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-velvet text-warm-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="sm:col-span-2 lg:col-span-1">
            <h3 className="font-heading text-2xl text-copper mb-3">
              {SITE_NAME}
            </h3>
            <p className="text-warm-white/70 text-sm leading-relaxed">
              Handcrafted artisan jewelry — delicate filigree and copper
              wirework, each piece woven with enchantment.
            </p>
          </div>

          {/* Navigation */}
          <div>
            <h4 className="font-heading text-lg text-copper mb-3">Explore</h4>
            <ul className="space-y-2">
              {NAV_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-warm-white/70 hover:text-copper transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Social */}
          <div>
            <h4 className="font-heading text-lg text-copper mb-3">Connect</h4>
            <ul className="space-y-2">
              {SOCIAL_LINKS.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-warm-white/70 hover:text-copper transition-colors"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-heading text-lg text-copper mb-3">Contact</h4>
            <a
              href="mailto:hello@faesfiligree.com"
              className="text-sm text-warm-white/70 hover:text-copper transition-colors"
            >
              hello@faesfiligree.com
            </a>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-warm-white/10 text-center">
          <p className="text-sm text-warm-white/50">
            &copy; {currentYear} {SITE_NAME}. All rights reserved. Each piece is
            one-of-a-kind.
          </p>
        </div>
      </div>
    </footer>
  );
}
