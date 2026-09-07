import { createAdminClerkMiddleware } from "drake-auth/next";

// The sign-in surface lives under /admin/login (Clerk catch-all route).
// Every other admin route requires a Clerk session. The protected layout
// enforces the email allow-list after Clerk identifies the user.
export default createAdminClerkMiddleware();

export const config = {
  // Run on admin routes and API routes. Skip Next internals and static files.
  matcher: ["/admin/:path*", "/(api|trpc)(.*)"],
};
