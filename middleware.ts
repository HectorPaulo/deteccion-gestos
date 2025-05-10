import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const passedPruebaVida = request.cookies.get("passedPruebaVida");

  // Redirige a /prueba-vida si no ha pasado la prueba de vida
  if (!passedPruebaVida && request.nextUrl.pathname.startsWith("/dashboard")) {
    return NextResponse.redirect(new URL("/prueba-vida", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*"],
};