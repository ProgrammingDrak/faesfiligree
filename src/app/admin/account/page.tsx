"use client";

import { useActionState } from "react";
import { changePasswordAction } from "@/lib/actions/auth";

export default function AccountPage() {
  const [state, formAction, isPending] = useActionState(
    changePasswordAction,
    null
  );

  return (
    <div className="max-w-lg">
      <h1 className="font-heading text-3xl text-warm-white mb-6">
        Change Password
      </h1>

      {state?.success && (
        <div className="bg-green-500/20 border border-green-500/30 rounded-lg p-3 text-green-400 text-sm mb-4">
          {state.success}
        </div>
      )}

      <form action={formAction} className="space-y-4">
        <div>
          <label className="block text-sm text-warm-white/70 mb-1">
            Current Password
          </label>
          <input
            name="currentPassword"
            type="password"
            required
            className="w-full px-3 py-2 bg-warm-white/10 border border-warm-white/20 rounded-lg text-warm-white focus:outline-none focus:ring-2 focus:ring-copper"
          />
        </div>

        <div>
          <label className="block text-sm text-warm-white/70 mb-1">
            New Password
          </label>
          <input
            name="newPassword"
            type="password"
            required
            minLength={8}
            className="w-full px-3 py-2 bg-warm-white/10 border border-warm-white/20 rounded-lg text-warm-white focus:outline-none focus:ring-2 focus:ring-copper"
          />
          <p className="text-warm-white/40 text-xs mt-1">
            Must be at least 8 characters
          </p>
        </div>

        <div>
          <label className="block text-sm text-warm-white/70 mb-1">
            Confirm New Password
          </label>
          <input
            name="confirmPassword"
            type="password"
            required
            minLength={8}
            className="w-full px-3 py-2 bg-warm-white/10 border border-warm-white/20 rounded-lg text-warm-white focus:outline-none focus:ring-2 focus:ring-copper"
          />
        </div>

        {state?.error && (
          <p className="text-rose-gold text-sm">{state.error}</p>
        )}

        <button
          type="submit"
          disabled={isPending}
          className="px-6 py-2 bg-copper hover:bg-copper-dark text-white rounded-lg font-medium transition-colors disabled:opacity-50"
        >
          {isPending ? "Updating..." : "Update Password"}
        </button>
      </form>
    </div>
  );
}
