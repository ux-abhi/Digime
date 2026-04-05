import { type NextRequest, NextResponse } from "next/server";

// Middleware is kept minimal — no Supabase network calls here.
// Edge Middleware has a ~1.5s timeout; any Supabase auth call (getUser/getSession)
// can exceed it and cause 504 MIDDLEWARE_INVOCATION_TIMEOUT.
//
// Auth guards live in each server component (getUser() + redirect("/login")).
// Session cookie refresh is handled there too, where timeouts are not an issue.
export function middleware(request: NextRequest) {
  return NextResponse.next();
}

export const config = {
  matcher: [
    // Only run on pages, not on static assets or public API routes
    "/((?!_next/static|_next/image|favicon.ico|widget.js|api/|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};

