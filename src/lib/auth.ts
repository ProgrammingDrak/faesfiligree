import { currentUser } from "@clerk/nextjs/server";

/**
 * Admin access is gated by Clerk email-code sign-in, restricted to the
 * email address(es) in ADMIN_ALLOWED_EMAILS (comma-separated). This mirrors
 * the Clerk instance-level allowlist and is the app-side source of truth.
 */
export function getAllowedAdminEmails(): string[] {
  return (process.env.ADMIN_ALLOWED_EMAILS || "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
}

export function isAllowedAdminEmail(email: string | null | undefined): boolean {
  if (!email) return false;
  const allowed = getAllowedAdminEmails();
  // If no allow-list is configured, fail closed (deny).
  if (allowed.length === 0) return false;
  return allowed.includes(email.toLowerCase());
}

/**
 * Returns the signed-in admin's primary email if they are allow-listed,
 * otherwise null. Use in server components / route handlers under /admin.
 */
export async function getAdminEmail(): Promise<string | null> {
  const user = await currentUser();
  const email = user?.primaryEmailAddress?.emailAddress ?? null;
  return isAllowedAdminEmail(email) ? email : null;
}
