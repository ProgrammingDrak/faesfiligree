import { createAdminClerkMiddleware } from "drake-auth/next";

// The sign-in surface lives under /admin/login (Clerk catch-all route);
// everything else under /admin requires a Clerk session. The email
// allow-list itself is enforced in src/app/admin/(protected)/layout.tsx
// (where the user's email is available), on top of Clerk's instance-level
// allowlist. Flow and helpers live in the shared drake-auth kit.
export default createAdminClerkMiddleware();

export const config = {
  // Run on admin routes and API routes; skip Next internals and static files.
  matcher: ["/admin/:path*", "/(api|trpc)(.*)"],
};
