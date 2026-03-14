import { NextResponse, type NextRequest } from "next/server";

function getExpectedToken(): string {
  const secret = process.env.ADMIN_SESSION_SECRET || "dev-secret-change-me";
  return `session_${secret}`;
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow the login page and login action
  if (pathname === "/admin/login") {
    return NextResponse.next();
  }

  // Protect all other admin routes
  if (pathname.startsWith("/admin")) {
    const session = request.cookies.get("admin_session")?.value;
    if (!session || session !== getExpectedToken()) {
      const loginUrl = new URL("/admin/login", request.url);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
