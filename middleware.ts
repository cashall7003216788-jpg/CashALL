import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const host = request.headers.get("host") || "";

  // If traffic comes to cashall.vercel.app or any *.vercel.app domain (production environment),
  // 301 redirect to official canonical production domain www.cashall.in
  if (
    (host.includes("cashall.vercel.app") || host.endsWith(".vercel.app")) &&
    !host.includes("localhost")
  ) {
    const url = request.nextUrl.clone();
    url.hostname = "www.cashall.in";
    url.port = "";
    url.protocol = "https";
    return NextResponse.redirect(url, { status: 301 });
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|photos).*)"],
};
