import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const passedPruebaVida = request.cookies.get("passedPruebaVida");

  if (!passedPruebaVida && request.nextUrl.pathname.startsWith("/dashboard")) {
    return NextResponse.redirect(new URL("/prueba-vida", request.url));
  }
}

export const config = {
  matcher: ["/dashboard/:path*"],
};