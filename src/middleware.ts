import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

// The sign-in surface lives under /admin/login (Clerk catch-all route).
const isLoginRoute = createRouteMatcher(["/admin/login(.*)"]);
// Everything else under /admin is protected.
const isAdminRoute = createRouteMatcher(["/admin(.*)"]);

export default clerkMiddleware(async (auth, request) => {
  if (isLoginRoute(request)) {
    return NextResponse.next();
  }

  // Require a signed-in session for the admin portal. The email allow-list
  // itself is enforced in src/app/admin/layout.tsx (where the user's email
  // is available), on top of Clerk's instance-level allowlist.
  if (isAdminRoute(request)) {
    const { userId } = await auth();
    if (!userId) {
      const loginUrl = new URL("/admin/login", request.url);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
});

export const config = {
  // Run on admin routes and API routes; skip Next internals and static files.
  matcher: ["/admin/:path*", "/(api|trpc)(.*)"],
};
