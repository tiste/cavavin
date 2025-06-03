import { NextRequest, NextResponse } from "next/server";
import { isAuthenticated } from "@/lib/auth";

export function middleware(request: NextRequest) {
  if (!request.nextUrl.pathname.startsWith("/login")) {
    const token = request.cookies.get("token") || { value: null };

    if (!isAuthenticated(token.value)) {
      const response = NextResponse.redirect(new URL(`/login`, request.url));
      response.cookies.delete("token");
      return response;
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
