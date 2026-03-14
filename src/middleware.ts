import { NextResponse, type NextRequest } from "next/server";
import { isAuthenticatedSync } from "@/lib/auth";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow the login page and login action
  if (pathname === "/admin/login") {
    return NextResponse.next();
  }

  // Protect admin API routes (return 401 instead of redirect)
  if (pathname.startsWith("/api/admin")) {
    const session = request.cookies.get("admin_session")?.value;
    if (!isAuthenticatedSync(session)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.next();
  }

  // Protect all other admin routes
  if (pathname.startsWith("/admin")) {
    const session = request.cookies.get("admin_session")?.value;
    if (!isAuthenticatedSync(session)) {
      const loginUrl = new URL("/admin/login", request.url);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};
