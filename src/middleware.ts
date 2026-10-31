import { NextRequest, NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Prevent search engines from indexing /admin and /api routes
  if (pathname.startsWith("/admin") || pathname.startsWith("/api")) {
    const response = NextResponse.next();
    response.headers.set("X-Robots-Tag", "noindex, nofollow, noarchive");
    return response;
  }

  // Redirect /en/admin to /admin (admin panel is single-url for owner)
  if (pathname === "/en/admin" || pathname.startsWith("/en/admin/")) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = pathname.replace(/^\/en/, "") || "/admin";
    return NextResponse.redirect(redirectUrl);
  }

  // English subpath (/en or /en/...) -> internal rewrite with x-site-locale=en
  if (pathname === "/en" || pathname.startsWith("/en/")) {
    const rewriteUrl = request.nextUrl.clone();
    rewriteUrl.pathname = pathname.replace(/^\/en/, "") || "/";

    const requestHeaders = new Headers(request.headers);
    requestHeaders.set("x-site-locale", "en");

    const response = NextResponse.rewrite(rewriteUrl, {
      request: { headers: requestHeaders },
    });
    response.headers.set("Content-Language", "en");
    return response;
  }

  // Default Turkish URLs (/...) -> forward with x-site-locale=tr
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-site-locale", "tr");

  const response = NextResponse.next({
    request: { headers: requestHeaders },
  });
  response.headers.set("Content-Language", "tr");
  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|uploads/|favicon\\.ico|sitemap\\.xml|robots\\.txt|.*\\.(?:png|jpg|jpeg|gif|webp|svg|ico|txt|xml)$).*)",
  ],
};
