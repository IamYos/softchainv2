import { NextRequest, NextResponse } from "next/server";

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Only guard admin pages (not /admin/login itself, which is always accessible).
  if (pathname === "/admin/login" || !pathname.startsWith("/admin")) {
    return NextResponse.next();
  }

  const hasCookie = req.cookies.has("sc_admin_session");
  if (!hasCookie) {
    const url = req.nextUrl.clone();
    url.pathname = "/admin/login";
    url.search = `?redirect=${encodeURIComponent(pathname)}`;
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
