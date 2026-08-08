import { NextRequest, NextResponse } from "next/server";

const COOKIE_NAME = "auth_token";

const PUBLIC_ROUTES = [
  "/signin",
  "/signup",
  "/forgot-password",
  "/reset-password",
];

export function middleware(req: NextRequest) {
  const token = req.cookies.get(COOKIE_NAME)?.value;
  const { pathname } = req.nextUrl;
  const isPublicRoute = PUBLIC_ROUTES.some((r) => pathname.startsWith(r));

  if (!token && !isPublicRoute) {
    const url = req.nextUrl.clone();
    url.pathname = "/signin";

    url.searchParams.set("from", pathname);
    return NextResponse.redirect(url);
  }

  if (token && isPublicRoute) {
    const url = req.nextUrl.clone();
    url.pathname = "/";
    url.search = "";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|monitoring).*)"],
};
