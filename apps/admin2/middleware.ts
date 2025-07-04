// middleware.ts
import { NextRequest, NextResponse } from "next/server";

const PUBLIC_PATHS = ["/login"];

export function middleware(request: NextRequest) {
  // Verifica se o token está presente (atenção ao nome do cookie: auth_token vs authToken)
  const token = request.cookies.get("auth_token");

  const pathname = request.nextUrl.pathname;

  // Ignora rotas públicas (ex: login)
  const isPublicPath = PUBLIC_PATHS.some((path) => pathname.startsWith(path));

  if (pathname === "/login" && token) {
    const dashboardUrl = new URL("/dashboard", request.url);
    return NextResponse.redirect(dashboardUrl);
  }
  // Bloqueia tudo que não seja público e não tenha token
  if (!token && !isPublicPath) {
    const loginUrl = new URL("/login", request.url);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
