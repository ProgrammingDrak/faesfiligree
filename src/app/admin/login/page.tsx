"use client";

import { useActionState } from "react";
import { loginAction } from "@/lib/actions/auth";

export default function AdminLoginPage() {
  const [state, formAction, isPending] = useActionState(loginAction, null);

  return (
    <div className="min-h-screen flex items-center justify-center bg-charcoal px-4">
      <div className="w-full max-w-sm">
        <h1 className="font-heading text-3xl text-warm-white text-center mb-2">
          Admin Portal
        </h1>
        <p className="text-warm-white/50 text-center text-sm mb-8">
          Fae&apos;s Filigree
        </p>

        <form action={formAction} className="space-y-4">
          <div>
            <label
              htmlFor="email"
              className="block text-sm text-warm-white/70 mb-1"
            >
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              autoFocus
              className="w-full px-4 py-3 bg-warm-white/10 border border-warm-white/20 rounded-lg text-warm-white placeholder:text-warm-white/30 focus:outline-none focus:ring-2 focus:ring-copper focus:border-transparent"
              placeholder="admin@example.com"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-sm text-warm-white/70 mb-1"
            >
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              className="w-full px-4 py-3 bg-warm-white/10 border border-warm-white/20 rounded-lg text-warm-white placeholder:text-warm-white/30 focus:outline-none focus:ring-2 focus:ring-copper focus:border-transparent"
              placeholder="Enter your password"
            />
          </div>

          {state?.error && (
            <p className="text-rose-gold text-sm">{state.error}</p>
          )}

          <button
            type="submit"
            disabled={isPending}
            className="w-full py-3 bg-copper hover:bg-copper-dark text-white rounded-lg font-medium transition-colors disabled:opacity-50"
          >
            {isPending ? "Signing in..." : "Sign In"}
          </button>
        </form>
      </div>
    </div>
  );
}
