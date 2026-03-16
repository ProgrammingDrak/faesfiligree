"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { logoutAction } from "@/lib/actions/auth";

const navItems = [
  { href: "/admin", label: "Dashboard", icon: "grid" },
  { href: "/admin/products", label: "Products", icon: "package" },
  { href: "/admin/gallery", label: "Gallery", icon: "image" },
  { href: "/admin/categories", label: "Categories", icon: "tag" },
  { href: "/admin/materials", label: "Materials", icon: "layers" },
  { href: "/admin/commissions", label: "Commissions", icon: "mail" },
  { href: "/admin/events", label: "Events", icon: "calendar" },
  { href: "/admin/analytics", label: "Analytics", icon: "chart" },
  { href: "/admin/settings", label: "Settings", icon: "settings" },
  { href: "/admin/users", label: "Users", icon: "users" },
];

function NavIcon({ name }: { name: string }) {
  const icons: Record<string, string> = {
    grid: "M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4zM14 14h6v6h-6z",
    package: "M16.5 9.4l-9-5.19M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z",
    image: "M3 3h18v18H3zM8.5 10a1.5 1.5 0 100-3 1.5 1.5 0 000 3zM21 15l-5-5L5 21",
    tag: "M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82zM7 7h.01",
    layers: "M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5",
    mail: "M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2zM22 6l-10 7L2 6",
    calendar: "M3 6a2 2 0 012-2h14a2 2 0 012 2v14a2 2 0 01-2 2H5a2 2 0 01-2-2V6zM16 2v4M8 2v4M3 10h18",
    chart: "M18 20V10M12 20V4M6 20v-6",
    settings: "M12 15a3 3 0 100-6 3 3 0 000 6z",
    users: "M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4-4v2M9 11a4 4 0 100-8 4 4 0 000 8zM23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75",
  };

  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d={icons[name] || icons.grid} />
    </svg>
  );
}

interface CurrentUser {
  name: string;
  email: string;
}

export function AdminSidebar() {
  const pathname = usePathname();
  const [user, setUser] = useState<CurrentUser | null>(null);

  useEffect(() => {
    fetch("/api/admin/me")
      .then((r) => (r.ok ? r.json() : null))
      .then(setUser)
      .catch(() => {});
  }, []);

  return (
    <aside className="w-56 bg-charcoal min-h-screen flex flex-col border-r border-warm-white/10">
      <div className="p-4 border-b border-warm-white/10">
        <Link href="/admin" className="font-heading text-xl text-copper">
          Fae&apos;s Filigree
        </Link>
        <p className="text-warm-white/40 text-xs mt-0.5">Admin Portal</p>
      </div>

      <nav className="flex-1 py-4">
        {navItems.map((item) => {
          const isActive =
            item.href === "/admin"
              ? pathname === "/admin"
              : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-4 py-2.5 text-sm transition-colors",
                isActive
                  ? "bg-copper/20 text-copper border-r-2 border-copper"
                  : "text-warm-white/60 hover:text-warm-white hover:bg-warm-white/5"
              )}
            >
              <NavIcon name={item.icon} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-warm-white/10">
        {user && (
          <Link
            href="/admin/account"
            className="block mb-3 hover:bg-warm-white/5 rounded-lg p-2 -mx-2 transition-colors"
          >
            <p className="text-warm-white text-sm font-medium truncate">
              {user.name}
            </p>
            <p className="text-warm-white/40 text-xs truncate">{user.email}</p>
          </Link>
        )}
        <form action={logoutAction}>
          <button
            type="submit"
            className="w-full text-left text-sm text-warm-white/40 hover:text-warm-white transition-colors"
          >
            Sign Out
          </button>
        </form>
        <Link
          href="/"
          className="block text-xs text-warm-white/30 hover:text-warm-white/50 mt-2 transition-colors"
        >
          View Storefront
        </Link>
      </div>
    </aside>
  );
}
