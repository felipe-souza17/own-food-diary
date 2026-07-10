import NextAuth from "next-auth";

import { authConfig } from "@/lib/auth.config";

const { auth } = NextAuth(authConfig);

export default auth((request) => {
  const isLoggedIn = !!request.auth;
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/admin") && !isLoggedIn) {
    const loginUrl = new URL("/login", request.nextUrl);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return Response.redirect(loginUrl);
  }

  if (pathname === "/login" && isLoggedIn) {
    return Response.redirect(new URL("/admin", request.nextUrl));
  }
});

export const config = {
  matcher: ["/admin/:path*", "/login"],
};
